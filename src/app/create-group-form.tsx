"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Input, Textarea } from "@/components/ui/field";
import { createGroup, type FormState } from "./actions";

const initialState: FormState = {};

export function CreateGroupForm() {
  const [state, formAction] = useActionState(createGroup, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="ชื่อกลุ่ม"
        name="name"
        type="text"
        required
        maxLength={100}
        defaultValue={state.values?.name}
      />
      <Textarea
        label="คำอธิบาย (ไม่บังคับ)"
        name="description"
        rows={2}
        maxLength={500}
        defaultValue={state.values?.description}
      />
      <Alert tone="error">{state.error}</Alert>
      <PendingButton label="สร้างกลุ่ม" pendingLabel="กำลังสร้าง..." className="w-full sm:w-auto" />
    </form>
  );
}
