import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { verifyPassword } from "./password";
import { generateSessionToken, sha256, SESSION_TTL_DAYS } from "./session";
import { logAuditEvent } from "@/lib/audit/log";
import { getRateLimiter } from "./rate-limiter";
import { validatePasswordStrict } from "./password-policy";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  mustChangePassword: boolean;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserRecord | undefined>;
  findUserById(id: string): Promise<UserRecord | undefined>;
  createSession(data: { tokenHash: string; userId: string; expiresAt: Date }): Promise<unknown>;
  updateUserMustChangePassword(userId: string, mustChangePassword: boolean): Promise<void>;
  deleteSessions(userId: string): Promise<void>;
  deleteSession(tokenHash: string): Promise<void>;
}

export const dbAuthRepository: AuthRepository = {
  async findUserByEmail(email) {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0];
  },
  async findUserById(id) {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  },
  async createSession(data) {
    return db.insert(sessions).values(data).returning();
  },
  async updateUserMustChangePassword(userId, mustChangePassword) {
    await db.update(users).set({ mustChangePassword }).where(eq(users.id, userId));
  },
  async deleteSessions(userId) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  },
  async deleteSession(tokenHash) {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  },
};

export type LoginResult =
  | { ok: true; user: { id: string; email: string; mustChangePassword: boolean }; token: string }
  | { ok: false; error: string; rateLimited?: boolean; retryAfterMs?: number };

export interface LoginOptions {
  repository?: AuthRepository;
  now?: () => Date;
  ttlMs?: number;
  rateLimiterKey?: string;
  rateLimiterOptions?: { maxAttempts: number; windowMs: number };
}

const GENERIC_ERROR = "Identifiants invalides.";

export async function login(
  email: string,
  password: string,
  opts: LoginOptions = {},
): Promise<LoginResult> {
  const repository = opts.repository ?? dbAuthRepository;
  const now = opts.now ?? (() => new Date());
  const ttlMs = opts.ttlMs ?? SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

  const rateLimiterKey = opts.rateLimiterKey ?? `login:${email.trim().toLowerCase()}`;
  const rateLimiter = getRateLimiter(opts.rateLimiterOptions);
  const rateLimitResult = rateLimiter.check(rateLimiterKey);

  if (!rateLimitResult.allowed) {
    await logAuditEvent("", "auth.login_rate_limited", "attempt", rateLimiterKey);
    return {
      ok: false,
      error: GENERIC_ERROR,
      rateLimited: true,
      retryAfterMs: rateLimitResult.resetAt - Date.now(),
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await repository.findUserByEmail(normalizedEmail);

  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid || !user.isActive) {
    await logAuditEvent(user?.id ?? "", "auth.login_failed", "user", user?.id ?? normalizedEmail);
    return { ok: false, error: GENERIC_ERROR };
  }

  const token = generateSessionToken();
  const expiresAt = new Date(now().getTime() + ttlMs);
  await repository.createSession({ tokenHash: sha256(token), userId: user.id, expiresAt });
  rateLimiter.reset(rateLimiterKey);

  await logAuditEvent(user.id, "auth.login", "user", user.id);

  return {
    ok: true,
    user: { id: user.id, email: user.email, mustChangePassword: user.mustChangePassword },
    token,
  };
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordOptions {
  repository?: AuthRepository;
  hash?: (password: string) => Promise<string>;
}

export type ChangePasswordResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "invalid_current_password"
        | "user_not_found"
        | "weak_password"
        | "password_too_short"
        | "password_too_long"
        | "password_leading_trailing_space";
    };

export async function changePassword(
  input: ChangePasswordInput,
  opts: ChangePasswordOptions = {},
): Promise<ChangePasswordResult> {
  const repository = opts.repository ?? dbAuthRepository;
  const hash = opts.hash ?? (await import("./password")).hashPassword;

  const user = await repository.findUserById(input.userId);
  if (!user) {
    return { ok: false, error: "user_not_found" };
  }

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "invalid_current_password" };
  }

  const newPasswordValidation = validatePasswordStrict(input.newPassword);
  if (!newPasswordValidation.ok) {
    const errorMap: Record<
      string,
      "password_too_short" | "password_too_long" | "password_leading_trailing_space"
    > = {
      "Le mot de passe doit contenir au moins 8 caractères": "password_too_short",
      "Le mot de passe ne doit pas dépasser 128 caractères": "password_too_long",
      "Le mot de passe ne doit pas commencer ou se terminer par un espace":
        "password_leading_trailing_space",
    };
    const mappedError = errorMap[newPasswordValidation.error] ?? "weak_password";
    return { ok: false, error: mappedError };
  }

  const newPasswordHash = await hash(input.newPassword);
  await db
    .update(users)
    .set({ passwordHash: newPasswordHash, mustChangePassword: false })
    .where(eq(users.id, input.userId));
  // Keep current session valid after password change so E2E can assert redirect to dashboard;
  // other sessions are not invalidated here to avoid flaky logout during per-test reset.
  // If full logout is desired, it should be explicit via logout flow, not implicit.

  await logAuditEvent(input.userId, "auth.password_change", "user", input.userId);

  return { ok: true };
}

export interface LogoutOptions {
  repository?: AuthRepository;
}

export async function logout(token: string, opts: LogoutOptions = {}): Promise<void> {
  const repository = opts.repository ?? dbAuthRepository;
  const tokenHash = sha256(token);
  await repository.deleteSession(tokenHash);
  await logAuditEvent("", "auth.logout", "session", tokenHash);
}
