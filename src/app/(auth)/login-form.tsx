"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { MIN_LOGIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { signInWithPassword, type AuthState } from "./actions";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signInWithPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
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
        autoComplete="current-password"
        required
        minLength={MIN_LOGIN_PASSWORD_LENGTH}
      />
      <Alert tone="error">{state.error}</Alert>
      <SubmitButton label="เข้าสู่ระบบ" pendingLabel="กำลังเข้าสู่ระบบ..." />
    </form>
  );
}
