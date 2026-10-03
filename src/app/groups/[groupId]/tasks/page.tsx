import Link from "next/link";
import { getGroupContext, getGroupMembers } from "@/lib/groups/dal";
import { can } from "@/lib/permissions";
import { classifyTaskDeadline } from "@/lib/tasks/deadline";
import { getTaskList } from "@/lib/tasks/dal";
import {
  buildTaskQuery,
  DEADLINE_FILTERS,
  hasActiveFilters,
  parseTaskFilters,
  TASK_STATUSES,
} from "@/lib/tasks/filters";
import { DEADLINE_FILTER_LABELS, TASK_STATUS_LABELS } from "@/lib/tasks/labels";
import { formatDeadline } from "@/lib/tasks/time";
import { DeadlineBadge, StatusBadge } from "./task-badges";

const SELECT_CLASSES = "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base";

export default async function TasksPage({
  params,
  searchParams,
}: PageProps<"/groups/[groupId]/tasks">) {
  const { groupId } = await params;
  const { group, role, userId } = await getGroupContext(groupId);
  const filters = parseTaskFilters(await searchParams);
  const [members, list] = await Promise.all([getGroupMembers(group.id), getTaskList(group.id, filters)]);

  const now = new Date();
  const nameById = new Map(members.map((member) => [member.userId, member.displayName]));
  const basePath = `/groups/${group.id}/tasks`;
  const filtered = hasActiveFilters(filters);
  const { page, totalPages } = list.pagination;
  // ค่า "me" แสดงเป็นรหัสของตัวเองใน dropdown
  const selectedAssignee = filters.assignee === "me" ? userId : filters.assignee;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">งาน ({list.total})</h2>
        {can(role, "createTask") && (
          <Link
            href={`${basePath}/new`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            สร้างงานใหม่
          </Link>
        )}
      </div>

      <form
        method="get"
        action={basePath}
        aria-label="ตัวกรองงาน"
        className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-3"
      >
        <div>
          <label htmlFor="filter-assignee" className="block text-sm font-medium text-zinc-700">
            ผู้รับผิดชอบ
          </label>
          <select id="filter-assignee" name="assignee" defaultValue={selectedAssignee ?? ""} className={SELECT_CLASSES}>
            <option value="">ทุกคน</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.displayName}
                {member.userId === userId ? " (คุณ)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className="block text-sm font-medium text-zinc-700">
            สถานะ
          </label>
          <select id="filter-status" name="status" defaultValue={filters.status ?? ""} className={SELECT_CLASSES}>
            <option value="">ทุกสถานะ</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-deadline" className="block text-sm font-medium text-zinc-700">
            กำหนดส่ง
          </label>
          <select id="filter-deadline" name="deadline" defaultValue={filters.deadline ?? ""} className={SELECT_CLASSES}>
            <option value="">ทุกช่วง</option>
            {DEADLINE_FILTERS.map((deadline) => (
              <option key={deadline} value={deadline}>
                {DEADLINE_FILTER_LABELS[deadline]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            กรอง
          </button>
          {filtered && (
            <Link
              href={basePath}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
            >
              ล้างตัวกรอง
            </Link>
          )}
        </div>
      </form>

      {filters.status === "done" && filters.deadline === "overdue" && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          ตัวกรอง &quot;เลยกำหนด&quot; แสดงเฉพาะงานที่ยังมีคนทำไม่เสร็จ จึงไม่มีงานที่เสร็จแล้วอยู่ในผลลัพธ์เมื่อเลือกคู่กับสถานะ
          &quot;เสร็จแล้ว&quot;
        </p>
      )}

      {list.tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
          {filtered
            ? "ไม่พบงานที่ตรงกับตัวกรอง ลองเปลี่ยนเงื่อนไขหรือล้างตัวกรอง"
            : "ยังไม่มีงานในกลุ่มนี้"}
        </p>
      ) : (
        <ul className="space-y-3">
          {list.tasks.map((task) => {
            const state = classifyTaskDeadline(
              task.deadline,
              task.assignees.map((assignee) => assignee.status),
              now,
            );
            return (
              <li key={task.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link
                    href={`${basePath}/${task.id}`}
                    className="min-w-0 break-words font-medium hover:underline"
                  >
                    {task.title}
                  </Link>
                  <DeadlineBadge state={state} />
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  กำหนดส่ง: {formatDeadline(task.deadline)}
                </p>
                {task.assignees.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">ยังไม่มีผู้รับผิดชอบ</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {task.assignees.map((assignee) => (
                      <li key={assignee.userId} className="flex items-center gap-1.5">
                        <span className="break-words">
                          {nameById.get(assignee.userId) ?? "ไม่ทราบชื่อ"}
                        </span>
                        <StatusBadge status={assignee.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="แบ่งหน้า" className="flex items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`${basePath}${buildTaskQuery(filters, { page: page - 1 })}`}
              className="rounded-lg border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100"
            >
              &larr; ก่อนหน้า
            </Link>
          ) : (
            <span />
          )}
          <span className="text-zinc-600">
            หน้า {page} จาก {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`${basePath}${buildTaskQuery(filters, { page: page + 1 })}`}
              className="rounded-lg border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100"
            >
              ถัดไป &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
