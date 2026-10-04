import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyOtp = vi.fn();
const exchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { verifyOtp, exchangeCodeForSession } }),
}));

const { GET } = await import("./route");

function call(query: string) {
  return GET(new NextRequest(`https://app.example/auth/confirm${query}`));
}

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    verifyOtp.mockReset().mockResolvedValue({ error: null });
    exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("ยืนยันด้วย token_hash แล้วพาไป next", async () => {
    const response = await call("?token_hash=abc&type=email&next=/join/code123");
    expect(verifyOtp).toHaveBeenCalledWith({ type: "email", token_hash: "abc" });
    expect(response.headers.get("location")).toBe("https://app.example/join/code123");
  });

  it("ไม่รับ type อื่นนอกจาก email/signup", async () => {
    const response = await call("?token_hash=abc&type=recovery&next=/join/x");
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://app.example/login?error=confirm&next=%2Fjoin%2Fx");
  });

  it("verifyOtp ล้มแล้วพาไปหน้า login พร้อม error=confirm", async () => {
    verifyOtp.mockResolvedValue({ error: { code: "otp_expired" } });
    const response = await call("?token_hash=abc&type=email");
    expect(response.headers.get("location")).toBe("https://app.example/login?error=confirm");
  });

  it("กัน open redirect ใน next", async () => {
    const response = await call("?token_hash=abc&type=email&next=//evil.example");
    expect(response.headers.get("location")).toBe("https://app.example/");
  });

  it("รองรับ code แบบ PKCE จาก email template เดิม", async () => {
    const response = await call("?code=xyz&next=/groups");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("xyz");
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://app.example/groups");
  });

  it("code แลก session ไม่ได้ (เปิดข้ามเบราว์เซอร์) พาไปหน้า login พร้อม error=confirm", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { code: "bad_code_verifier" } });
    const response = await call("?code=xyz");
    expect(response.headers.get("location")).toBe("https://app.example/login?error=confirm");
  });

  it("ไม่มี token_hash และ code", async () => {
    const response = await call("");
    expect(response.headers.get("location")).toBe("https://app.example/login?error=confirm");
  });
});
