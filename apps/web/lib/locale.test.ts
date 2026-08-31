import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES } from "@carthage-clean/types";

describe("shared locale constants", () => {
  it("uses a valid default locale", () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });

  it("contains only supported locales", () => {
    expect(LOCALES).toEqual(["fr", "ar", "en"]);
  });
});
