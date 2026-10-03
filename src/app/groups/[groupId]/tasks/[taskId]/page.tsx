import { notFound } from "next/navigation";
import { CalendarClock, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ConfirmDangerZone } from "@/components/ui/danger-zone";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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

const SECTION_HEADING = "mb-3 text-xl font-semibold leading-[1.4]";

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
      <div>
        <PageHeader
          as="h2"
          title={task.title}
          backHref={`/groups/${group.id}/tasks`}
          backLabel="กลับไปรายการงาน"
        />
        <div className="-mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
            <span>กำหนดส่ง: {formatDeadline(task.deadline)}</span>
          </span>
          <DeadlineBadge state={state} />
        </div>
        {task.description && (
          <Card className="mt-4">
            <p className="whitespace-pre-line break-words text-sm text-ink-muted">
              {task.description}
            </p>
          </Card>
        )}
      </div>

      <section aria-labelledby="assignees-heading">
        <h3 id="assignees-heading" className={SECTION_HEADING}>
          ผู้รับผิดชอบ (<span className="tabular-nums">{task.assignees.length}</span>)
        </h3>
        {task.assignees.length === 0 ? (
          <EmptyState icon={Users} title="ยังไม่มีผู้รับผิดชอบ" />
        ) : (
          <Card padding="none">
            <ul className="divide-y divide-line">
              {task.assignees.map((assignee) => {
                const displayName = nameById.get(assignee.userId) ?? "ไม่ทราบชื่อ";
                return (
                  <li
                    key={assignee.userId}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Avatar name={displayName} size="md" />
                      <span className="min-w-0 break-words text-sm font-medium">
                        {displayName}
                        {assignee.userId === userId && (
                          <span className="font-normal text-ink-subtle"> (คุณ)</span>
                        )}
                      </span>
                      <StatusBadge status={assignee.status} />
                    </div>
                    {isAdmin && (
                      <RemoveAssigneeButton
                        groupId={group.id}
                        taskId={task.id}
                        userId={assignee.userId}
                        displayName={nameById.get(assignee.userId) ?? "ผู้รับผิดชอบ"}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
        {isAdmin && (
          <div className="mt-4">
            {assignableMembers.length > 0 ? (
              <Card>
                <AddAssigneeForm
                  groupId={group.id}
                  taskId={task.id}
                  options={assignableMembers.map((member) => ({
                    userId: member.userId,
                    displayName: member.displayName,
                  }))}
                />
              </Card>
            ) : (
              <p className="text-sm text-ink-muted">สมาชิกทุกคนเป็นผู้รับผิดชอบงานนี้แล้ว</p>
            )}
          </div>
        )}
      </section>

      {myAssignment && can(role, "updateOwnTaskStatus") && (
        <section aria-labelledby="my-status-heading">
          <h3 id="my-status-heading" className={SECTION_HEADING}>
            สถานะงานของคุณ
          </h3>
          <Card>
            <MyStatusForm groupId={group.id} taskId={task.id} currentStatus={myAssignment.status} />
          </Card>
        </section>
      )}

      {isAdmin && (
        <>
          <section aria-labelledby="edit-heading">
            <h3 id="edit-heading" className={SECTION_HEADING}>
              แก้ไขงาน
            </h3>
            <Card>
              <TaskEditForm
                groupId={group.id}
                taskId={task.id}
                title={task.title}
                description={task.description ?? ""}
                deadline={toDateTimeLocalValue(task.deadline)}
              />
            </Card>
          </section>

          <div className="border-t border-line pt-8">
            <ConfirmDangerZone
              title="ลบงาน"
              description="การลบงานจะลบผู้รับผิดชอบและสถานะของทุกคนในงานนี้อย่างถาวร ไม่สามารถย้อนกลับได้"
            >
              <DeleteTaskForm groupId={group.id} taskId={task.id} />
            </ConfirmDangerZone>
          </div>
        </>
      )}
    </div>
  );
}
