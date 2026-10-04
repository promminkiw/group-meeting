"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { MIN_SIGNUP_PASSWORD_LENGTH, PASSWORD_MISMATCH_MESSAGE } from "@/lib/auth/password";
import { signUpWithPassword, type AuthState } from "./actions";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = {};

export function SignupForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signUpWithPassword, initialState);
  const [mismatchError, setMismatchError] = useState<string>();

  // เตือนก่อนส่งฟอร์ม server ตรวจซ้ำอีกชั้นใน signUpWithPassword
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    if (formData.get("password") !== formData.get("confirmPassword")) {
      event.preventDefault();
      setMismatchError(PASSWORD_MISMATCH_MESSAGE);
      return;
    }
    // กรณีแก้ช่องรหัสผ่านแรกจนตรงแล้ว ข้อความเดิมต้องหาย
    setMismatchError(undefined);
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
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
      <PasswordInput
        label="รหัสผ่าน"
        name="password"
        autoComplete="new-password"
        required
        minLength={MIN_SIGNUP_PASSWORD_LENGTH}
        helper={`อย่างน้อย ${MIN_SIGNUP_PASSWORD_LENGTH} ตัวอักษร`}
      />
      <PasswordInput
        label="ยืนยันรหัสผ่าน"
        name="confirmPassword"
        autoComplete="new-password"
        required
        minLength={MIN_SIGNUP_PASSWORD_LENGTH}
        error={mismatchError}
        onChange={() => setMismatchError(undefined)}
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
