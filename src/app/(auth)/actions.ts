"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { getRequestOrigin } from "@/lib/request-origin";

export type AuthState = {
  error?: string;
  // รหัสผ่านไม่ส่งกลับเด็ดขาด
  values?: { email: string; displayName?: string };
  needsEmailConfirmation?: boolean;
};

// สมัครใหม่ต้อง 8 ตัวขึ้นไป แต่ login ยังรับ 6 เพราะบัญชีเดิมอาจตั้งไว้ 6-7 ตัว
const MIN_SIGNUP_PASSWORD_LENGTH = 8;
const MIN_LOGIN_PASSWORD_LENGTH = 6;
const MAX_DISPLAY_NAME_LENGTH = 80;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validateCredentials(email: string, password: string, minPasswordLength: number): string | null {
  if (!EMAIL_PATTERN.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
  if (password.length < minPasswordLength) {
    return `รหัสผ่านต้องมีอย่างน้อย ${minPasswordLength} ตัวอักษร`;
  }
  return null;
}

export async function signInWithPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = readText(formData, "email").trim();
  const password = readText(formData, "password");
  const next = sanitizeNextPath(readText(formData, "next"));

  const values = { email };

  const validationError = validateCredentials(email, password, MIN_LOGIN_PASSWORD_LENGTH);
  if (validationError) return { error: validationError, values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("signInWithPassword failed:", error.code ?? error.status);
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", values };
  }

  redirect(next);
}

export async function signUpWithPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = readText(formData, "email").trim();
  const password = readText(formData, "password");
  const displayName = readText(formData, "displayName").trim();
  const next = sanitizeNextPath(readText(formData, "next"));
  const values = { email, displayName };

  if (displayName.length < 1 || displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return { error: `ชื่อที่แสดงต้องมี 1-${MAX_DISPLAY_NAME_LENGTH} ตัวอักษร`, values };
  }
  const validationError = validateCredentials(email, password, MIN_SIGNUP_PASSWORD_LENGTH);
  if (validationError) return { error: validationError, values };

  // ให้ลิงก์ยืนยันอีเมลผ่าน callback เพื่อ login ให้เลยและพากลับไปที่ next (เช่นลิงก์เชิญ)
  const origin = await getRequestOrigin();
  let emailRedirectTo: string | undefined;
  if (origin) {
    const callbackUrl = new URL("/auth/callback", origin);
    callbackUrl.searchParams.set("next", next);
    emailRedirectTo = callbackUrl.toString();
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: displayName }, emailRedirectTo },
  });
  if (error) {
    console.error("signUpWithPassword failed:", error.code ?? error.status);
    return { error: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", values };
  }

  // กรณีเปิด email confirmation จะยังไม่มี session
  if (!data.session) {
    return {
      error: "กรุณายืนยันอีเมลของคุณ แล้วเข้าสู่ระบบอีกครั้ง",
      values,
      needsEmailConfirmation: true,
    };
  }

  redirect(next);
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = sanitizeNextPath(readText(formData, "next"));
  const origin = await getRequestOrigin();
  if (!origin) redirect("/login?error=auth");

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });
  if (error || !data.url) {
    console.error("signInWithGoogle failed:", error?.code ?? error?.status);
    redirect("/login?error=auth");
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
