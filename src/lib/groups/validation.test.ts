import { describe, expect, it } from "vitest";
import { extractInviteCode, isInviteCode, isUuid } from "./validation";

describe("isUuid", () => {
  it("รับ uuid ที่ถูกต้อง", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });
  it.each(["", "abc", "123e4567-e89b-12d3-a456-42661417400", "../x"])("ปฏิเสธ %s", (v) => {
    expect(isUuid(v)).toBe(false);
  });
});

describe("isInviteCode", () => {
  it("รับโค้ด 12 ตัว", () => {
    expect(isInviteCode("a1b2c3d4e5f6")).toBe(true);
  });
  it.each(["short", "has space 123456", "a1b2c3d4e5f6/../"])("ปฏิเสธ %s", (v) => {
    expect(isInviteCode(v)).toBe(false);
  });
});

describe("extractInviteCode", () => {
  it("ดึงโค้ดจากลิงก์เต็ม", () => {
    expect(extractInviteCode("https://x.app/join/a1b2c3d4e5f6?x=1")).toBe("a1b2c3d4e5f6");
  });
  it("คืนโค้ดเปล่าหลัง trim", () => {
    expect(extractInviteCode("  a1b2c3d4e5f6 ")).toBe("a1b2c3d4e5f6");
  });
});
