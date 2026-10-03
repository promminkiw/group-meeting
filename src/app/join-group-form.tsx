"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { joinGroupFromCode, type FormState } from "./actions";

const initialState: FormState = {};

export function JoinGroupForm() {
  const [state, formAction] = useActionState(joinGroupFromCode, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="invite-code" className="block text-sm font-medium text-zinc-700">
          โค้ดเชิญหรือลิงก์เชิญ
        </label>
        <input
          id="invite-code"
          name="code"
          type="text"
          required
          autoComplete="off"
          defaultValue={state.values?.code}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <PendingButton
        label="เข้ากลุ่ม"
        pendingLabel="กำลังเข้ากลุ่ม..."
        variant="secondary"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
