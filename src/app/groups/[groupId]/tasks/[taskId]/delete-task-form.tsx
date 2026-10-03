"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { deleteTask, type TaskActionState } from "../actions";

const initialState: TaskActionState = {};

export function DeleteTaskForm({ groupId, taskId }: { groupId: string; taskId: string }) {
  const [state, formAction] = useActionState(deleteTask, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("ลบงานนี้ถาวรใช่หรือไม่? การลบไม่สามารถย้อนกลับได้")) event.preventDefault();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <Alert tone="error">{state.error}</Alert>
      <PendingButton label="ลบงานนี้" pendingLabel="กำลังลบ..." variant="danger" icon={Trash2} />
    </form>
  );
}
