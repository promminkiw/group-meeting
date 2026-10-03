"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { createGroup, type FormState } from "./actions";

const initialState: FormState = {};

export function CreateGroupForm() {
  const [state, formAction] = useActionState(createGroup, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="group-name" className="block text-sm font-medium text-zinc-700">
          ชื่อกลุ่ม
        </label>
        <input
          id="group-name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={state.values?.name}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="group-description" className="block text-sm font-medium text-zinc-700">
          คำอธิบาย (ไม่บังคับ)
        </label>
        <textarea
          id="group-description"
          name="description"
          rows={2}
          maxLength={500}
          defaultValue={state.values?.description}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <PendingButton label="สร้างกลุ่ม" pendingLabel="กำลังสร้าง..." className="w-full sm:w-auto" />
    </form>
  );
}
