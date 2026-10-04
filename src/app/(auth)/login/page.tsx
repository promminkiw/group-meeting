import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { AuthDivider } from "../auth-divider";
import { GoogleButton } from "../google-button";
import { LoginForm } from "../login-form";

// auth = callback ล้ม (OAuth หรือลิงก์ยืนยันแบบเก่าที่เปิดข้ามเบราว์เซอร์), confirm = ลิงก์ยืนยันอีเมลใช้ไม่ได้
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  auth: "เข้าสู่ระบบไม่สำเร็จ ถ้าคุณเพิ่งกดยืนยันอีเมล บัญชีอาจยืนยันแล้ว ลองเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน",
  confirm: "ลิงก์ยืนยันอีเมลใช้ไม่ได้หรือหมดอายุ ถ้าเคยกดยืนยันไปแล้ว ลองเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : undefined;
  const next = sanitizeNextPath(rawNext);
  const signupHref = next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;
  // hasOwn กันค่าอย่าง "constructor" ที่ไปเจอ property ของ Object.prototype
  const errorMessage =
    typeof params.error === "string" && Object.hasOwn(LOGIN_ERROR_MESSAGES, params.error)
      ? LOGIN_ERROR_MESSAGES[params.error]
      : undefined;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold leading-[1.4]">เข้าสู่ระบบ</h1>
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      <GoogleButton next={next} />
      <AuthDivider />
      <LoginForm next={next} />
      <p className="text-center text-sm text-ink-muted">
        ยังไม่มีบัญชี?{" "}
        <Link href={signupHref} className="font-medium text-primary-600 hover:text-primary-700">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
