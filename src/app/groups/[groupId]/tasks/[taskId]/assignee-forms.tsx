"use client";

import { useActionState } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/field";
import { addAssignee, removeAssignee, type TaskActionState } from "../actions";

const initialState: TaskActionState = {};

type AddProps = {
  groupId: string;
  taskId: string;
  options: { userId: string; displayName: string }[];
};

export function AddAssigneeForm({ groupId, taskId, options }: AddProps) {
  const [state, formAction] = useActionState(addAssignee, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-xs">
          <Select id="add-assignee" name="userId" label="เพิ่มผู้รับผิดชอบ" required defaultValue="">
            <option value="" disabled>
              เลือกสมาชิก
            </option>
            {options.map((option) => (
              <option key={option.userId} value={option.userId}>
                {option.displayName}
              </option>
            ))}
          </Select>
        </div>
        <PendingButton
          label="เพิ่ม"
          pendingLabel="กำลังเพิ่ม..."
          variant="secondary"
          icon={UserPlus}
          className="max-sm:w-full"
        />
      </div>
      <Alert tone="error">{state.error}</Alert>
    </form>
  );
}

type RemoveProps = { groupId: string; taskId: string; userId: string; displayName: string };

export function RemoveAssigneeButton({ groupId, taskId, userId, displayName }: RemoveProps) {
  const [state, formAction] = useActionState(removeAssignee, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`เอา ${displayName} ออกจากงานนี้?`)) event.preventDefault();
      }}
      className="flex flex-col items-end gap-1.5"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="userId" value={userId} />
      <PendingButton
        label="เอาออก"
        pendingLabel="กำลังเอาออก..."
        variant="danger"
        size="sm"
        icon={UserMinus}
      />
      <Alert tone="error">{state.error}</Alert>
    </form>
  );
}
