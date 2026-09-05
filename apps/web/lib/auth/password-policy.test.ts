import { describe, expect, it } from "vitest";
import {
  validatePassword,
  validatePasswordStrict,
  hasLeadingOrTrailingSpaces,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_POLICY_DESCRIPTION,
} from "./password-policy";

describe("password-policy", () => {
  describe("validatePassword", () => {
    it("accepts valid password of minimum length", () => {
      expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH))).toEqual({ ok: true });
    });

    it("rejects password shorter than minimum", () => {
      expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).toEqual({
        ok: false,
        error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
      });
    });

    it("accepts password at maximum length", () => {
      expect(validatePassword("a".repeat(PASSWORD_MAX_LENGTH))).toEqual({ ok: true });
    });

    it("rejects password exceeding maximum length", () => {
      expect(validatePassword("a".repeat(PASSWORD_MAX_LENGTH + 1))).toEqual({
        ok: false,
        error: `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX_LENGTH} caractères`,
      });
    });

    it("accepts password with internal spaces", () => {
      expect(validatePassword("valid pass word")).toEqual({ ok: true });
    });
  });

  describe("hasLeadingOrTrailingSpaces", () => {
    it("detects leading space", () => {
      expect(hasLeadingOrTrailingSpaces(" password")).toBe(true);
    });

    it("detects trailing space", () => {
      expect(hasLeadingOrTrailingSpaces("password ")).toBe(true);
    });

    it("detects both leading and trailing spaces", () => {
      expect(hasLeadingOrTrailingSpaces(" password ")).toBe(true);
    });

    it("returns false for password without leading/trailing spaces", () => {
      expect(hasLeadingOrTrailingSpaces("password")).toBe(false);
      expect(hasLeadingOrTrailingSpaces("pass word")).toBe(false);
      expect(hasLeadingOrTrailingSpaces("pass  word")).toBe(false);
    });
  });

  describe("validatePasswordStrict", () => {
    it("accepts valid password without leading/trailing spaces", () => {
      expect(validatePasswordStrict("validPass123")).toEqual({ ok: true });
    });

    it("rejects password with leading space", () => {
      expect(validatePasswordStrict(" validPass123")).toEqual({
        ok: false,
        error: "Le mot de passe ne doit pas commencer ou se terminer par un espace",
      });
    });

    it("rejects password with trailing space", () => {
      expect(validatePasswordStrict("validPass123 ")).toEqual({
        ok: false,
        error: "Le mot de passe ne doit pas commencer ou se terminer par un espace",
      });
    });

    it("rejects password with both leading and trailing spaces", () => {
      expect(validatePasswordStrict(" validPass123 ")).toEqual({
        ok: false,
        error: "Le mot de passe ne doit pas commencer ou se terminer par un espace",
      });
    });

    it("accepts password with internal spaces", () => {
      expect(validatePasswordStrict("valid pass 123")).toEqual({ ok: true });
    });

    it("rejects too short password", () => {
      expect(validatePasswordStrict("short")).toEqual({
        ok: false,
        error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
      });
    });

    it("rejects too long password", () => {
      expect(validatePasswordStrict("a".repeat(PASSWORD_MAX_LENGTH + 1))).toEqual({
        ok: false,
        error: `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX_LENGTH} caractères`,
      });
    });
  });

  describe("PASSWORD_POLICY_DESCRIPTION", () => {
    it("contains key policy information", () => {
      expect(PASSWORD_POLICY_DESCRIPTION).toContain(String(PASSWORD_MIN_LENGTH));
      expect(PASSWORD_POLICY_DESCRIPTION).toContain(String(PASSWORD_MAX_LENGTH));
      expect(PASSWORD_POLICY_DESCRIPTION).toContain("espace");
      expect(PASSWORD_POLICY_DESCRIPTION).toContain("trim");
    });
  });
});
