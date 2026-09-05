import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "./password";
import type { Role } from "./rbac";
import { randomBytes } from "node:crypto";

export interface BootstrapUserInput {
  email: string;
}

export interface BootstrapRepository {
  findAdmin(): Promise<{ id: string; role: Role } | undefined>;
  createUser(data: {
    email: string;
    passwordHash: string;
    role: Role;
    mustChangePassword: boolean;
  }): Promise<{ id: string; email: string }>;
}

export const dbBootstrapRepository: BootstrapRepository = {
  async findAdmin() {
    const rows = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);
    return rows[0];
  },
  async createUser(data) {
    const [row] = await db
      .insert(users)
      .values(data)
      .returning({ id: users.id, email: users.email });
    if (!row) {
      throw new Error("Échec de la création de l'utilisateur admin.");
    }
    return row;
  },
};

export type BootstrapResult =
  | { created: true; user: { id: string; email: string }; initialPassword: string }
  | { created: false; reason: "admin_exists" };

export interface BootstrapOptions {
  repository?: BootstrapRepository;
  hash?: (password: string) => Promise<string>;
}

function generateSecurePassword(): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(32);
  let password = "";
  for (let i = 0; i < 24; i++) {
    const byte = bytes[i];
    if (byte === undefined) continue;
    password += charset[byte % charset.length];
  }
  return password;
}

export async function bootstrapAdmin(
  input: BootstrapUserInput,
  opts: BootstrapOptions = {},
): Promise<BootstrapResult> {
  const repository = opts.repository ?? dbBootstrapRepository;
  const hash = opts.hash ?? hashPassword;

  const existing = await repository.findAdmin();
  if (existing) {
    return { created: false, reason: "admin_exists" };
  }

  const initialPassword = generateSecurePassword();
  const passwordHash = await hash(initialPassword);
  const user = await repository.createUser({
    email: input.email.trim().toLowerCase(),
    passwordHash,
    role: "admin",
    mustChangePassword: true,
  });

  return { created: true, user, initialPassword };
}
