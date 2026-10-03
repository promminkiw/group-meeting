"use client";

import { useActionState, useState } from "react";
import { PendingButton } from "@/components/pending-button";
import { deleteGroup, type DeleteGroupState } from "./actions";

const initialState: DeleteGroupState = {};

export function DeleteGroupForm({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [state, formAction] = useActionState(deleteGroup, initialState);
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === groupName;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="groupId" value={groupId} />
      <p className="text-sm text-zinc-700">
        การลบกลุ่มจะลบสมาชิก งาน และข้อมูลทั้งหมดของกลุ่มอย่างถาวร ไม่สามารถย้อนกลับได้
      </p>
      <div>
        <label htmlFor="confirm-group-name" className="block text-sm font-medium text-zinc-700">
          พิมพ์ชื่อกลุ่ม <span className="font-semibold break-words">{groupName}</span> เพื่อยืนยัน
        </label>
        <input
          id="confirm-group-name"
          name="confirmName"
          type="text"
          autoComplete="off"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <DeleteSubmit disabled={!matches} />
    </form>
  );
}

function DeleteSubmit({ disabled }: { disabled: boolean }) {
  return (
    <fieldset disabled={disabled} className="contents">
      <PendingButton label="ลบกลุ่มนี้" pendingLabel="กำลังลบ..." variant="danger" />
    </fieldset>
  );
}
