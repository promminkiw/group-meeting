import Link from "next/link";
import { CalendarClock, ChevronLeft, ChevronRight, ListChecks, Plus, SearchX } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th, Tr } from "@/components/ui/table";
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
import type { TaskStatus } from "@/types/database";
import { DeadlineBadge, StatusBadge } from "./task-badges";

type AssigneeRow = { userId: string; status: TaskStatus };

function AssigneeStatusList({
  assignees,
  nameById,
}: {
  assignees: AssigneeRow[];
  nameById: Map<string, string>;
}) {
  if (assignees.length === 0) {
    return <span className="text-sm text-ink-subtle">ยังไม่มีผู้รับผิดชอบ</span>;
  }
  return (
    <ul className="space-y-1.5">
      {assignees.map((assignee) => (
        <li key={assignee.userId} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 break-words text-sm">
            {nameById.get(assignee.userId) ?? "ไม่ทราบชื่อ"}
          </span>
          <StatusBadge status={assignee.status} />
        </li>
      ))}
    </ul>
  );
}

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
  const canCreate = can(role, "createTask");
  const { page, totalPages } = list.pagination;
  // ค่า "me" แสดงเป็นรหัสของตัวเองใน dropdown
  const selectedAssignee = filters.assignee === "me" ? userId : filters.assignee;

  const rows = list.tasks.map((task) => ({
    task,
    state: classifyTaskDeadline(
      task.deadline,
      task.assignees.map((assignee) => assignee.status),
      now,
    ),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        as="h2"
        title={
          <>
            งาน{" "}
            <Badge tone="neutral" className="align-middle tabular-nums">
              {list.total}
            </Badge>
          </>
        }
        actions={
          canCreate ? (
            <Button href={`${basePath}/new`} icon={Plus}>
              สร้างงานใหม่
            </Button>
          ) : undefined
        }
      />

      <Card padding="sm">
        <form
          method="get"
          action={basePath}
          aria-label="ตัวกรองงาน"
          className="grid items-end gap-3 sm:grid-cols-4"
        >
          <Select
            id="filter-assignee"
            name="assignee"
            label="ผู้รับผิดชอบ"
            defaultValue={selectedAssignee ?? ""}
          >
            <option value="">ทุกคน</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.displayName}
                {member.userId === userId ? " (คุณ)" : ""}
              </option>
            ))}
          </Select>
          <Select id="filter-status" name="status" label="สถานะ" defaultValue={filters.status ?? ""}>
            <option value="">ทุกสถานะ</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
          <Select
            id="filter-deadline"
            name="deadline"
            label="กำหนดส่ง"
            defaultValue={filters.deadline ?? ""}
          >
            <option value="">ทุกช่วง</option>
            {DEADLINE_FILTERS.map((deadline) => (
              <option key={deadline} value={deadline}>
                {DEADLINE_FILTER_LABELS[deadline]}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary">
              กรอง
            </Button>
            {filtered && (
              <Button href={basePath} variant="ghost">
                ล้างตัวกรอง
              </Button>
            )}
          </div>
        </form>
      </Card>

      {filters.status === "done" && filters.deadline === "overdue" && (
        <Alert tone="warning">
          ตัวกรอง &quot;เลยกำหนด&quot; แสดงเฉพาะงานที่ยังมีคนทำไม่เสร็จ จึงไม่มีงานที่เสร็จแล้วอยู่ในผลลัพธ์เมื่อเลือกคู่กับสถานะ
          &quot;เสร็จแล้ว&quot;
        </Alert>
      )}

      {rows.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={SearchX}
            title="ไม่พบงานที่ตรงกับตัวกรอง"
            description="ลองเปลี่ยนเงื่อนไขหรือล้างตัวกรอง"
            action={
              <Button href={basePath} variant="secondary">
                ล้างตัวกรอง
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={ListChecks}
            title="ยังไม่มีงานในกลุ่มนี้"
            description={canCreate ? "สร้างงานแรกเพื่อเริ่มมอบหมายให้สมาชิก" : undefined}
            action={
              canCreate ? (
                <Button href={`${basePath}/new`} icon={Plus}>
                  สร้างงานใหม่
                </Button>
              ) : undefined
            }
          />
        )
      ) : (
        <>
          <div className="hidden md:block">
            <Table
              caption="รายการงานของกลุ่ม"
              head={
                <>
                  <Th>งาน</Th>
                  <Th>ผู้รับผิดชอบ</Th>
                  <Th>กำหนดส่ง</Th>
                </>
              }
            >
              {rows.map(({ task, state }) => (
                <Tr key={task.id} className="align-top">
                  <Td>
                    <Link
                      href={`${basePath}/${task.id}`}
                      className="break-words font-medium text-ink hover:text-primary-700"
                    >
                      {task.title}
                    </Link>
                  </Td>
                  <Td>
                    <AssigneeStatusList assignees={task.assignees} nameById={nameById} />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="whitespace-nowrap">{formatDeadline(task.deadline)}</span>
                      <DeadlineBadge state={state} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {rows.map(({ task, state }) => (
              <Card as="li" key={task.id} padding="sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link
                    href={`${basePath}/${task.id}`}
                    className="min-w-0 break-words font-medium text-ink hover:text-primary-700"
                  >
                    {task.title}
                  </Link>
                  <DeadlineBadge state={state} />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
                  <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="sr-only">กำหนดส่ง: </span>
                    {formatDeadline(task.deadline)}
                  </span>
                </p>
                <div className="mt-3">
                  <AssigneeStatusList assignees={task.assignees} nameById={nameById} />
                </div>
              </Card>
            ))}
          </ul>
        </>
      )}

      {totalPages > 1 && (
        <nav aria-label="แบ่งหน้า" className="flex items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Button
              href={`${basePath}${buildTaskQuery(filters, { page: page - 1 })}`}
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
            >
              ก่อนหน้า
            </Button>
          ) : (
            <span />
          )}
          <span className="text-ink-muted">
            หน้า <span className="tabular-nums">{page}</span> จาก{" "}
            <span className="tabular-nums">{totalPages}</span>
          </span>
          {page < totalPages ? (
            <Button
              href={`${basePath}${buildTaskQuery(filters, { page: page + 1 })}`}
              variant="secondary"
              size="sm"
            >
              ถัดไป
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
