import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let currentUser: { id: string } | null = null;

vi.mock("@/lib/supabase/proxy", () => ({
  updateSession: async () => ({ response: NextResponse.next(), user: currentUser }),
}));

const { proxy } = await import("./proxy");

function call(path: string) {
  return proxy(new NextRequest(`https://app.example${path}`));
}

describe("proxy", () => {
  beforeEach(() => {
    currentUser = null;
  });

  it("ยังไม่ login เข้าหน้าที่ต้อง login: พาไป /login พร้อม next", async () => {
    const response = await call("/groups/1/tasks?status=done");
    expect(response.headers.get("location")).toBe(
      "https://app.example/login?next=%2Fgroups%2F1%2Ftasks%3Fstatus%3Ddone",
    );
  });

  it("ยังไม่ login เข้าหน้า public ได้", async () => {
    for (const path of ["/login", "/signup", "/auth/confirm?token_hash=x"]) {
      const response = await call(path);
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("login แล้วเปิด /login?next=... พาไป next", async () => {
    currentUser = { id: "u1" };
    const response = await call("/login?next=%2Fjoin%2Fcode123");
    expect(response.headers.get("location")).toBe("https://app.example/join/code123");
  });

  it("login แล้วเปิด /login?next=//evil พาไป / บนโดเมนเดิม", async () => {
    currentUser = { id: "u1" };
    const response = await call("/login?next=%2F%2Fevil.example");
    expect(response.headers.get("location")).toBe("https://app.example/");
  });

  it("login แล้วเปิด /signup ไม่มี next พาไป /", async () => {
    currentUser = { id: "u1" };
    const response = await call("/signup");
    expect(response.headers.get("location")).toBe("https://app.example/");
  });
});
