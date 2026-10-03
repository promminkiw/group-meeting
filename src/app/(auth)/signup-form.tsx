"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { signUpWithPassword, type AuthState } from "./actions";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = {};

export function SignupForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signUpWithPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Input
        label="ชื่อที่แสดง"
        name="displayName"
        type="text"
        autoComplete="name"
        required
        maxLength={80}
        defaultValue={state.values?.displayName}
      />
      <Input
        label="อีเมล"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
      />
      <Input
        label="รหัสผ่าน"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
        helper="อย่างน้อย 6 ตัวอักษร"
      />
      {/* ข้อความยืนยันอีเมลมาทาง state.error แต่ไม่ใช่ความผิดพลาด จึงแสดงเป็น info */}
      <Alert tone={state.needsEmailConfirmation ? "info" : "error"}>{state.error}</Alert>
      {state.needsEmailConfirmation && (
        <p className="text-sm">
          <Link
            href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
      )}
      <SubmitButton label="สมัครสมาชิก" pendingLabel="กำลังสมัครสมาชิก..." />
    </form>
  );
}
