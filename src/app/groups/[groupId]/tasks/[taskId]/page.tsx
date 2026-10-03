import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupContext, getGroupMembers } from "@/lib/groups/dal";
import { can } from "@/lib/permissions";
import { classifyTaskDeadline } from "@/lib/tasks/deadline";
import { getTask } from "@/lib/tasks/dal";
import { formatDeadline, toDateTimeLocalValue } from "@/lib/tasks/time";
import { DeadlineBadge, StatusBadge } from "../task-badges";
import { AddAssigneeForm, RemoveAssigneeButton } from "./assignee-forms";
import { DeleteTaskForm } from "./delete-task-form";
import { MyStatusForm } from "./my-status-form";
import { TaskEditForm } from "./task-edit-form";

export default async function TaskDetailPage({
  params,
}: PageProps<"/groups/[groupId]/tasks/[taskId]">) {
  const { groupId, taskId } = await params;
  const { group, role, userId } = await getGroupContext(groupId);
  const [task, members] = await Promise.all([getTask(group.id, taskId), getGroupMembers(group.id)]);
  if (!task) notFound();

  const nameById = new Map(members.map((member) => [member.userId, member.displayName]));
  const myAssignment = task.assignees.find((assignee) => assignee.userId === userId);
  const isAdmin = can(role, "assignTask");
  const assignedIds = new Set(task.assignees.map((assignee) => assignee.userId));
  const assignableMembers = members.filter((member) => !assignedIds.has(member.userId));
  const state = classifyTaskDeadline(
    task.deadline,
    task.assignees.map((assignee) => assignee.status),
    new Date(),
  );

  return (
    <div className="space-y-8">
      <Link href={`/groups/${group.id}/tasks`} className="text-sm text-zinc-600 hover:text-zinc-900">
        &larr; กลับไปรายการงาน
      </Link>

      <section aria-labelledby="task-heading" className="space-y-2">
        <div className="flex flex-wrap items-start gap-2">
          <h2 id="task-heading" className="min-w-0 break-words text-xl font-semibold">
            {task.title}
          </h2>
          <DeadlineBadge state={state} />
        </div>
        <p className="text-sm text-zinc-600">กำหนดส่ง: {formatDeadline(task.deadline)}</p>
        {task.description && (
          <p className="whitespace-pre-line break-words text-sm text-zinc-700">{task.description}</p>
        )}
      </section>

      <section aria-labelledby="assignees-heading">
        <h3 id="assignees-heading" className="text-lg font-semibold">
          ผู้รับผิดชอบ ({task.assignees.length})
        </h3>
        {task.assignees.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
            ยังไม่มีผู้รับผิดชอบ
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {task.assignees.map((assignee) => (
              <li
                key={assignee.userId}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="break-words">
                    {nameById.get(assignee.userId) ?? "ไม่ทราบชื่อ"}
                    {assignee.userId === userId && <span className="text-zinc-500"> (คุณ)</span>}
                  </span>
                  <StatusBadge status={assignee.status} />
                </span>
                {isAdmin && (
                  <RemoveAssigneeButton
                    groupId={group.id}
                    taskId={task.id}
                    userId={assignee.userId}
                    displayName={nameById.get(assignee.userId) ?? "ผู้รับผิดชอบ"}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        {isAdmin && (
          <div className="mt-3">
            {assignableMembers.length > 0 ? (
              <AddAssigneeForm
                groupId={group.id}
                taskId={task.id}
                options={assignableMembers.map((member) => ({
                  userId: member.userId,
                  displayName: member.displayName,
                }))}
              />
            ) : (
              <p className="text-sm text-zinc-600">สมาชิกทุกคนเป็นผู้รับผิดชอบงานนี้แล้ว</p>
            )}
          </div>
        )}
      </section>

      {myAssignment && can(role, "updateOwnTaskStatus") && (
        <section aria-labelledby="my-status-heading">
          <h3 id="my-status-heading" className="text-lg font-semibold">
            สถานะงานของคุณ
          </h3>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4">
            <MyStatusForm groupId={group.id} taskId={task.id} currentStatus={myAssignment.status} />
          </div>
        </section>
      )}

      {isAdmin && (
        <>
          <section aria-labelledby="edit-heading">
            <h3 id="edit-heading" className="text-lg font-semibold">
              แก้ไขงาน
            </h3>
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <TaskEditForm
                groupId={group.id}
                taskId={task.id}
                title={task.title}
                description={task.description ?? ""}
                deadline={toDateTimeLocalValue(task.deadline)}
              />
            </div>
          </section>

          <section aria-labelledby="delete-heading">
            <h3 id="delete-heading" className="text-lg font-semibold">
              ลบงาน
            </h3>
            <div className="mt-3">
              <DeleteTaskForm groupId={group.id} taskId={task.id} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
