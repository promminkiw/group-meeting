import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { AuthDivider } from "../auth-divider";
import { GoogleButton } from "../google-button";
import { LoginForm } from "../login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : undefined;
  const next = sanitizeNextPath(rawNext);
  const signupHref = next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;
  const hasAuthError = params.error === "auth";

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold leading-[1.4]">เข้าสู่ระบบ</h1>
      {hasAuthError && <Alert tone="error">เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</Alert>}
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
