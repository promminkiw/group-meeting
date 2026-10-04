import { beforeEach, describe, expect, it, vi } from "vitest";

const signUp = vi.fn();
const signInWithPassword = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { signUp, signInWithPassword } }),
}));
vi.mock("@/lib/request-origin", () => ({
  getRequestOrigin: async () => "https://app.example",
}));
// redirect() ของ Next โยน error เพื่อหยุด action จึงจำลองแบบเดียวกัน
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const { signInWithPassword: signInAction, signUpWithPassword } = await import("./actions");

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const validSignup = {
  displayName: "Test",
  email: "test@example.test",
  password: "abcd1234",
  confirmPassword: "abcd1234",
  next: "/join/code123",
};

describe("signUpWithPassword", () => {
  beforeEach(() => {
    signUp.mockReset().mockResolvedValue({ data: { session: null }, error: null });
  });

  it("รหัสผ่านสองช่องไม่ตรงกัน: ไม่เรียก signUp", async () => {
    const result = await signUpWithPassword({}, form({ ...validSignup, confirmPassword: "abcd9999" }));
    expect(signUp).not.toHaveBeenCalled();
    expect(result.error).toBe("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
  });

  it("รหัสผ่านสั้นกว่า 8 ตัว: ไม่เรียก signUp", async () => {
    const result = await signUpWithPassword(
      {},
      form({ ...validSignup, password: "abc1234", confirmPassword: "abc1234" }),
    );
    expect(signUp).not.toHaveBeenCalled();
    expect(result.error).toContain("8");
  });

  it("ไม่ส่งรหัสผ่านกลับใน state", async () => {
    const result = await signUpWithPassword({}, form({ ...validSignup, confirmPassword: "x" }));
    expect(JSON.stringify(result)).not.toContain("abcd1234");
  });

  it("ส่ง emailRedirectTo ไปที่ /auth/confirm พร้อม next", async () => {
    const result = await signUpWithPassword({}, form(validSignup));
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: "https://app.example/auth/confirm?next=%2Fjoin%2Fcode123",
        }),
      }),
    );
    expect(result.needsEmailConfirmation).toBe(true);
  });

  it("next ที่พาออกนอกเว็บถูกแทนด้วย /", async () => {
    await signUpWithPassword({}, form({ ...validSignup, next: "//evil.example" }));
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ emailRedirectTo: "https://app.example/auth/confirm?next=%2F" }),
      }),
    );
  });
});

describe("signInWithPassword", () => {
  beforeEach(() => {
    signInWithPassword.mockReset().mockResolvedValue({ error: null });
  });

  it("รหัสผ่าน 6 ตัวของบัญชีเดิมยัง login ได้", async () => {
    await expect(
      signInAction({}, form({ email: "old@example.test", password: "abc123", next: "/" })),
    ).rejects.toThrow("REDIRECT:/");
    expect(signInWithPassword).toHaveBeenCalled();
  });

  it("login ไม่สำเร็จตอบข้อความเดียวกันทุกกรณี", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials" } });
    const result = await signInAction({}, form({ email: "a@example.test", password: "abc123" }));
    expect(result.error).toBe("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  });
});
