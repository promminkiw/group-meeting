"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
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
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-xs">
          <label htmlFor="add-assignee" className="block text-sm font-medium text-zinc-700">
            เพิ่มผู้รับผิดชอบ
          </label>
          <select
            id="add-assignee"
            name="userId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base"
          >
            <option value="" disabled>
              เลือกสมาชิก
            </option>
            {options.map((option) => (
              <option key={option.userId} value={option.userId}>
                {option.displayName}
              </option>
            ))}
          </select>
        </div>
        <PendingButton label="เพิ่ม" pendingLabel="กำลังเพิ่ม..." variant="secondary" />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
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
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="userId" value={userId} />
      <PendingButton label="เอาออก" pendingLabel="กำลังเอาออก..." variant="danger" />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
