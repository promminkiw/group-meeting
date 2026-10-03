import Link from "next/link";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { AuthDivider } from "../auth-divider";
import { GoogleButton } from "../google-button";
import { SignupForm } from "../signup-form";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : undefined;
  const next = sanitizeNextPath(rawNext);
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold leading-[1.4]">สมัครสมาชิก</h1>
      <GoogleButton next={next} />
      <AuthDivider />
      <SignupForm next={next} />
      <p className="text-center text-sm text-ink-muted">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href={loginHref} className="font-medium text-primary-600 hover:text-primary-700">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
