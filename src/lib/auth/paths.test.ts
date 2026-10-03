import { describe, expect, it } from "vitest";
import { isPublicPath, sanitizeNextPath } from "./paths";

describe("isPublicPath", () => {
  it.each(["/login", "/signup", "/auth/callback", "/auth/x/y"])("%s เป็น public", (p) => {
    expect(isPublicPath(p)).toBe(true);
  });

  it.each(["/", "/groups", "/loginx", "/authx", "/signup/extra", "/app/auth/callback"])(
    "%s ไม่เป็น public",
    (p) => {
      expect(isPublicPath(p)).toBe(false);
    },
  );
});

describe("sanitizeNextPath", () => {
  it.each([
    ["/groups", "/groups"],
    ["/groups/1?tab=tasks", "/groups/1?tab=tasks"],
    ["/", "/"],
  ])("รับ %s", (input, expected) => {
    expect(sanitizeNextPath(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    "groups",
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "http://evil.com/x",
    "javascript:alert(1)",
    "/\t/evil.com",
    "/\n/evil.com",
    "/a\\b",
  ])("คืน / สำหรับค่าไม่ปลอดภัย %j", (input) => {
    expect(sanitizeNextPath(input)).toBe("/");
  });
});
