"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { joinGroupFromCode, type FormState } from "./actions";

const initialState: FormState = {};

export function JoinGroupForm() {
  const [state, formAction] = useActionState(joinGroupFromCode, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="โค้ดเชิญหรือลิงก์เชิญ"
        name="code"
        type="text"
        required
        autoComplete="off"
        defaultValue={state.values?.code}
      />
      <Alert tone="error">{state.error}</Alert>
      <PendingButton
        label="เข้ากลุ่ม"
        pendingLabel="กำลังเข้ากลุ่ม..."
        variant="secondary"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
