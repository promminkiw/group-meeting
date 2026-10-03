"use client";

import { useActionState } from "react";
import { signInWithPassword, type AuthState } from "./actions";
import { SubmitButton } from "./submit-button";

const initialState: AuthState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signInWithPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
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
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
      <SubmitButton label="เข้าสู่ระบบ" pendingLabel="กำลังเข้าสู่ระบบ..." />
    </form>
  );
}
