import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { verifyPassword } from "./password";
import { generateSessionToken, sha256, SESSION_TTL_DAYS } from "./session";
import { logAuditEvent } from "@/lib/audit/log";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserRecord | undefined>;
  createSession(data: { tokenHash: string; userId: string; expiresAt: Date }): Promise<unknown>;
}

export const dbAuthRepository: AuthRepository = {
  async findUserByEmail(email) {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0];
  },
  async createSession(data) {
    return db.insert(sessions).values(data).returning();
  },
};

export type LoginResult =
  { ok: true; user: { id: string; email: string }; token: string } | { ok: false; error: string };

export interface LoginOptions {
  repository?: AuthRepository;
  now?: () => Date;
  ttlMs?: number;
}

export async function login(
  email: string,
  password: string,
  opts: LoginOptions = {},
): Promise<LoginResult> {
  const repository = opts.repository ?? dbAuthRepository;
  const now = opts.now ?? (() => new Date());
  const ttlMs = opts.ttlMs ?? SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

  const user = await repository.findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    return { ok: false, error: "Identifiants invalides." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Identifiants invalides." };
  }

  if (!user.isActive) {
    return { ok: false, error: "Compte désactivé." };
  }

  const token = generateSessionToken();
  const expiresAt = new Date(now().getTime() + ttlMs);
  await repository.createSession({ tokenHash: sha256(token), userId: user.id, expiresAt });

  await logAuditEvent(user.id, "auth.login", "user", user.id);

  return { ok: true, user: { id: user.id, email: user.email }, token };
}
