import { describe, expect, it } from "vitest";
import { getInitials, hashName } from "./initials";

describe("getInitials", () => {
  it("skips Thai leading vowels", () => {
    expect(getInitials("เมษา")).toBe("ม");
    expect(getInitials("ไพโรจน์")).toBe("พ");
  });

  it("uppercases Latin and uses two words when present", () => {
    expect(getInitials("alice")).toBe("A");
    expect(getInitials("alice bob carol")).toBe("AB");
  });

  it("falls back for empty names", () => {
    expect(getInitials("   ")).toBe("?");
  });
});

describe("hashName", () => {
  it("is stable and within bucket range", () => {
    const first = hashName("สมชาย", 6);
    expect(hashName("สมชาย", 6)).toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(6);
  });
});
