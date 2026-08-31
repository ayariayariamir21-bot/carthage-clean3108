import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE = "cc_session";
export const SESSION_TTL_DAYS = 30;

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}
