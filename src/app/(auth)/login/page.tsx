import Link from "next/link";
import { sanitizeNextPath } from "@/lib/auth/paths";
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
      <h1 className="text-xl font-semibold">เข้าสู่ระบบ</h1>
      {hasAuthError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      )}
      <LoginForm next={next} />
      <div className="text-center text-xs text-zinc-500">หรือ</div>
      <GoogleButton next={next} />
      <p className="text-center text-sm text-zinc-600">
        ยังไม่มีบัญชี?{" "}
        <Link href={signupHref} className="font-medium text-zinc-900 underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
