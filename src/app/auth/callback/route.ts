import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth/paths";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));
  const failureUrl = new URL("/login?error=auth", request.nextUrl);

  if (!code) return NextResponse.redirect(failureUrl);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession failed:", error.code ?? error.status);
    return NextResponse.redirect(failureUrl);
  }

  // ใช้ origin ของ request เอง ไม่รับ host จาก query
  return NextResponse.redirect(new URL(next, request.nextUrl));
}
