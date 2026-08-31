import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("S3cret!");
    await expect(verifyPassword("S3cret!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("S3cret!");
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time (salt)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });

  it("does not store the plaintext password", async () => {
    const hash = await hashPassword("S3cret!");
    expect(hash).not.toContain("S3cret!");
  });
});
