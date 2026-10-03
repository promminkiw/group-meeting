"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpWithPassword, type AuthState } from "./actions";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = {};

export function SignupForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signUpWithPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700">
          ชื่อที่แสดง
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={state.values?.displayName}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
          รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.needsEmailConfirmation && (
        <p className="text-sm">
          <Link
            href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
            className="font-medium text-zinc-900 underline"
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
      )}
      <SubmitButton label="สมัครสมาชิก" pendingLabel="กำลังสมัครสมาชิก..." />
    </form>
  );
}
