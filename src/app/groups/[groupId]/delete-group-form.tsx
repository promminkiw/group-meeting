"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { deleteGroup, type DeleteGroupState } from "./actions";

const initialState: DeleteGroupState = {};

export function DeleteGroupForm({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [state, formAction] = useActionState(deleteGroup, initialState);
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === groupName;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="groupId" value={groupId} />
      <Input
        id="confirm-group-name"
        name="confirmName"
        type="text"
        autoComplete="off"
        label={`พิมพ์ชื่อกลุ่ม "${groupName}" เพื่อยืนยัน`}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
      />
      <Alert tone="error">{state.error}</Alert>
      <DeleteSubmit disabled={!matches} />
    </form>
  );
}

function DeleteSubmit({ disabled }: { disabled: boolean }) {
  return (
    <fieldset disabled={disabled} className="contents">
      <PendingButton label="ลบกลุ่มนี้" pendingLabel="กำลังลบ..." variant="danger" icon={Trash2} />
    </fieldset>
  );
}
