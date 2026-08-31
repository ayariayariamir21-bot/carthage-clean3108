import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { sha256, SESSION_COOKIE } from "./session";
import type { AuthUser } from "./rbac";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const tokenHash = sha256(token);
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  return { id: row.id, email: row.email, role: row.role };
}
