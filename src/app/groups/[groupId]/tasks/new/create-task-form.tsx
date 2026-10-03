"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { PendingButton } from "@/components/pending-button";
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
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-zinc-700">
          ชื่องาน
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          required
          maxLength={TASK_TITLE_MAX_LENGTH}
          defaultValue={state.values?.title}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-zinc-700">
          รายละเอียด (ไม่บังคับ)
        </label>
        <textarea
          id="task-description"
          name="description"
          rows={4}
          maxLength={TASK_DESCRIPTION_MAX_LENGTH}
          defaultValue={state.values?.description}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="task-deadline" className="block text-sm font-medium text-zinc-700">
          กำหนดส่ง (ไม่บังคับ, เวลาประเทศไทย)
        </label>
        <input
          id="task-deadline"
          name="deadline"
          type="datetime-local"
          defaultValue={state.values?.deadline}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base sm:w-auto"
        />
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-zinc-700">ผู้รับผิดชอบ</legend>
        <ul className="mt-2 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {members.map((member) => (
            <li key={member.userId}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2 text-sm">
                <input
                  type="checkbox"
                  name="assigneeIds"
                  value={member.userId}
                  checked={selected.includes(member.userId)}
                  onChange={() => toggle(member.userId)}
                  className="size-4"
                />
                <span className="min-w-0 break-words">{member.displayName}</span>
              </label>
            </li>
          ))}
        </ul>
        {selected.length === 0 && (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            ยังไม่ได้เลือกผู้รับผิดชอบ งานนี้จะไม่ปรากฏในตารางงานค้างของใคร (เพิ่มภายหลังได้)
          </p>
        )}
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.createdTaskHref && (
        <p className="text-sm">
          <Link href={state.createdTaskHref} className="font-medium text-zinc-900 underline">
            เปิดงานที่สร้างไว้
          </Link>
        </p>
      )}
      <PendingButton label="สร้างงาน" pendingLabel="กำลังสร้าง..." className="w-full sm:w-auto" />
    </form>
  );
}
