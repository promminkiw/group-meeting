"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@/lib/tasks/validation";
import { updateTask, type TaskActionState } from "../actions";

const initialState: TaskActionState = {};

type Props = {
  groupId: string;
  taskId: string;
  title: string;
  description: string;
  deadline: string;
};

export function TaskEditForm({ groupId, taskId, title, description, deadline }: Props) {
  const [state, formAction] = useActionState(updateTask, initialState);
  // ถ้า action ล้มเหลวให้คงค่าที่ผู้ใช้เพิ่งกรอก ไม่เช่นนั้นใช้ค่าจาก server
  const current = state.values ?? { title, description, deadline };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <div>
        <label htmlFor="edit-title" className="block text-sm font-medium text-zinc-700">
          ชื่องาน
        </label>
        <input
          id="edit-title"
          name="title"
          type="text"
          required
          maxLength={TASK_TITLE_MAX_LENGTH}
          defaultValue={current.title}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="edit-description" className="block text-sm font-medium text-zinc-700">
          รายละเอียด (ไม่บังคับ)
        </label>
        <textarea
          id="edit-description"
          name="description"
          rows={4}
          maxLength={TASK_DESCRIPTION_MAX_LENGTH}
          defaultValue={current.description}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="edit-deadline" className="block text-sm font-medium text-zinc-700">
          กำหนดส่ง (ไม่บังคับ, เวลาประเทศไทย)
        </label>
        <input
          id="edit-deadline"
          name="deadline"
          type="datetime-local"
          defaultValue={current.deadline}
          step={current.deadline.length > 16 ? 1 : undefined}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base sm:w-auto"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-700">
          บันทึกการแก้ไขแล้ว
        </p>
      )}
      <PendingButton label="บันทึกการแก้ไข" pendingLabel="กำลังบันทึก..." className="w-full sm:w-auto" />
    </form>
  );
}
