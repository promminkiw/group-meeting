import Link from "next/link";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { GoogleButton } from "../google-button";
import { SignupForm } from "../signup-form";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : undefined;
  const next = sanitizeNextPath(rawNext);
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">สมัครสมาชิก</h1>
      <SignupForm next={next} />
      <div className="text-center text-xs text-zinc-500">หรือ</div>
      <GoogleButton next={next} />
      <p className="text-center text-sm text-zinc-600">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href={loginHref} className="font-medium text-zinc-900 underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
