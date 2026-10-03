"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Textarea } from "@/components/ui/field";
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@/lib/tasks/validation";
import { createTask, type TaskActionState } from "../actions";

const initialState: TaskActionState = {};

type MemberOption = { userId: string; displayName: string };

export function CreateTaskForm({ groupId, members }: { groupId: string; members: MemberOption[] }) {
  const [state, formAction] = useActionState(createTask, initialState);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(userId: string) {
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="groupId" value={groupId} />
      <Input
        id="task-title"
        name="title"
        type="text"
        label="ชื่องาน"
        required
        maxLength={TASK_TITLE_MAX_LENGTH}
        defaultValue={state.values?.title}
      />
      <Textarea
        id="task-description"
        name="description"
        label="รายละเอียด (ไม่บังคับ)"
        rows={4}
        maxLength={TASK_DESCRIPTION_MAX_LENGTH}
        defaultValue={state.values?.description}
      />
      <Input
        id="task-deadline"
        name="deadline"
        type="datetime-local"
        label="กำหนดส่ง (ไม่บังคับ, เวลาประเทศไทย)"
        defaultValue={state.values?.deadline}
        className="sm:w-auto"
      />
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink">ผู้รับผิดชอบ</legend>
        <ul className="divide-y divide-line rounded-card border border-line bg-surface">
          {members.map((member) => (
            <li key={member.userId} className="px-4">
              <Checkbox
                id={`assignee-${member.userId}`}
                name="assigneeIds"
                value={member.userId}
                label={member.displayName}
                checked={selected.includes(member.userId)}
                onChange={() => toggle(member.userId)}
              />
            </li>
          ))}
        </ul>
        {selected.length === 0 && (
          <Alert tone="warning" className="mt-3">
            ยังไม่ได้เลือกผู้รับผิดชอบ งานนี้จะไม่ปรากฏในตารางงานค้างของใคร (เพิ่มภายหลังได้)
          </Alert>
        )}
      </fieldset>
      <Alert tone="error">{state.error}</Alert>
      {state.createdTaskHref && (
        <Alert tone="info">
          <Link href={state.createdTaskHref} className="font-medium underline">
            เปิดงานที่สร้างไว้
          </Link>
        </Alert>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button href={`/groups/${groupId}/tasks`} variant="ghost">
          ยกเลิก
        </Button>
        <PendingButton label="สร้างงาน" pendingLabel="กำลังสร้าง..." className="max-sm:w-full" />
      </div>
    </form>
  );
}
