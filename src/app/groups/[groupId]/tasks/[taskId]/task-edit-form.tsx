"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Input, Textarea } from "@/components/ui/field";
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
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <Input
        id="edit-title"
        name="title"
        type="text"
        label="ชื่องาน"
        required
        maxLength={TASK_TITLE_MAX_LENGTH}
        defaultValue={current.title}
      />
      <Textarea
        id="edit-description"
        name="description"
        label="รายละเอียด (ไม่บังคับ)"
        rows={4}
        maxLength={TASK_DESCRIPTION_MAX_LENGTH}
        defaultValue={current.description}
      />
      <Input
        id="edit-deadline"
        name="deadline"
        type="datetime-local"
        label="กำหนดส่ง (ไม่บังคับ, เวลาประเทศไทย)"
        defaultValue={current.deadline}
        step={current.deadline.length > 16 ? 1 : undefined}
        className="sm:w-auto"
      />
      <Alert tone="error">{state.error}</Alert>
      {state.success && <Alert tone="success">บันทึกการแก้ไขแล้ว</Alert>}
      <PendingButton label="บันทึกการแก้ไข" pendingLabel="กำลังบันทึก..." className="max-sm:w-full" />
    </form>
  );
}
