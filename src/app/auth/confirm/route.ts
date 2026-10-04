import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth/paths";

// รับเฉพาะชนิดของการยืนยันอีเมลตอนสมัคร ไม่เปิดให้ลิงก์นี้ใช้กับ recovery หรือ email_change
const CONFIRM_TYPES: readonly EmailOtpType[] = ["email", "signup"];

// ลิงก์ยืนยันอีเมลแบบ token_hash ไม่ต้องใช้ code_verifier ใน cookie จึงเปิดจากอุปกรณ์อื่นได้ (ต่างจาก /auth/callback)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNextPath(searchParams.get("next"));
  // คง next ไว้ให้ login ด้วยมือแล้วยังกลับไปหน้าเดิม (เช่นลิงก์เชิญ)
  const failureUrl = new URL("/login", request.nextUrl);
  failureUrl.searchParams.set("error", "confirm");
  if (next !== "/") failureUrl.searchParams.set("next", next);

  const code = searchParams.get("code");

  // ถ้ายังใช้ email template เดิม ({{ .ConfirmationURL }}) Supabase จะส่ง code แบบ PKCE มาแทน token_hash
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("exchangeCodeForSession failed:", error.code ?? error.status);
      return NextResponse.redirect(failureUrl);
    }
    return NextResponse.redirect(new URL(next, request.nextUrl));
  }

  if (!tokenHash || !type || !CONFIRM_TYPES.includes(type)) {
    return NextResponse.redirect(failureUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    console.error("verifyOtp failed:", error.code ?? error.status);
    return NextResponse.redirect(failureUrl);
  }

  return NextResponse.redirect(new URL(next, request.nextUrl));
}
