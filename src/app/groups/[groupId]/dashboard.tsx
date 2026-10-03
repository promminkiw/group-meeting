import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, Loader, ListChecks, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard, type StatTone } from "@/components/ui/stat-card";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import type { MemberWorkload, TaskSummary } from "@/lib/tasks/workload";

type Props = {
  groupId: string;
  currentUserId: string;
  summary: TaskSummary;
  workload: MemberWorkload[];
  truncated: boolean;
  canCreateTask: boolean;
};

const SUMMARY_CARDS = [
  { key: "todo", label: "ยังไม่เริ่ม", tone: "todo", icon: Circle },
  { key: "doing", label: "กำลังทำ", tone: "doing", icon: Loader },
  { key: "done", label: "เสร็จแล้ว", tone: "done", icon: CheckCircle2 },
  { key: "overdue", label: "เลยกำหนด", tone: "overdue", icon: AlertTriangle },
] satisfies { key: keyof TaskSummary; label: string; tone: StatTone; icon: typeof Circle }[];

// แถบสัดส่วนงานของคนเดียว: เสร็จ / กำลังทำ / ยังไม่เริ่ม
function ProgressBar({ member }: { member: MemberWorkload }) {
  const total = member.todo + member.doing + member.done;
  const percent = (count: number) => `${(count / total) * 100}%`;

  if (total === 0) return <span className="text-ink-subtle">-</span>;

  return (
    <div className="flex items-center gap-3">
      <div
        role="img"
        aria-label={`เสร็จ ${member.done} จาก ${total} งาน`}
        className="flex h-2 w-full max-w-40 overflow-hidden rounded-full bg-line"
      >
        <span className="h-full bg-success-solid" style={{ width: percent(member.done) }} />
        <span className="h-full bg-doing-fg" style={{ width: percent(member.doing) }} />
        <span className="h-full bg-line-strong" style={{ width: percent(member.todo) }} />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-ink-muted">
        {member.done}/{total}
      </span>
    </div>
  );
}

function OverdueCell({ count }: { count: number }) {
  if (count === 0) return <span className="text-ink-subtle">-</span>;
  return (
    <Badge tone="overdue" icon={AlertTriangle}>
      <span className="tabular-nums">{count}</span>
    </Badge>
  );
}

export function Dashboard({
  groupId,
  currentUserId,
  summary,
  workload,
  truncated,
  canCreateTask,
}: Props) {
  const tasksHref = (userId: string) => `/groups/${groupId}/tasks?assignee=${userId}`;
  const total = summary.todo + summary.doing + summary.done;

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-4">
      <div>
        <h2 id="dashboard-heading" className="text-xl font-semibold leading-[1.4]">
          สรุปงาน
        </h2>
        <p className="mt-1 text-xs leading-[1.6] text-ink-muted">
          นับเป็นจำนวนงานที่มอบหมายให้แต่ละคน (งานเดียวที่มีหลายคนนับหลายครั้ง)
        </p>
      </div>
      {truncated && <Alert tone="warning">ข้อมูลงานมีจำนวนมาก ตัวเลขสรุปนี้อาจไม่ครบทั้งหมด</Alert>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={summary[card.key]}
            tone={card.tone}
            icon={card.icon}
          />
        ))}
      </div>

      <h3 className="pt-2 text-base font-semibold leading-[1.5]">ใครค้างอะไร</h3>
      {total === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="ยังไม่มีงานที่มอบหมาย"
          action={
            canCreateTask ? (
              <Button href={`/groups/${groupId}/tasks/new`} icon={Plus}>
                สร้างงานใหม่
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Table
              caption="จำนวนงานของสมาชิกแต่ละคนแยกตามสถานะ"
              head={
                <>
                  <Th>สมาชิก</Th>
                  <Th className="text-right">ยังไม่เริ่ม</Th>
                  <Th className="text-right">กำลังทำ</Th>
                  <Th className="text-right">เสร็จแล้ว</Th>
                  <Th className="text-right">เลยกำหนด</Th>
                  <Th>ความคืบหน้า</Th>
                </>
              }
            >
              {workload.map((member) => {
                const isSelf = member.userId === currentUserId;
                return (
                  <Tr key={member.userId} className={cn(isSelf && "bg-primary-50/50")}>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={member.displayName} size="sm" />
                        <Link
                          href={tasksHref(member.userId)}
                          className="break-words font-medium text-ink hover:text-primary-700"
                        >
                          {member.displayName}
                        </Link>
                        {isSelf && <span className="shrink-0 text-ink-subtle">(คุณ)</span>}
                      </div>
                    </th>
                    <Td className="text-right tabular-nums">{member.todo}</Td>
                    <Td className="text-right tabular-nums">{member.doing}</Td>
                    <Td className="text-right tabular-nums">{member.done}</Td>
                    <Td className="text-right">
                      <OverdueCell count={member.overdue} />
                    </Td>
                    <Td>
                      <ProgressBar member={member} />
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {workload.map((member) => {
              const isSelf = member.userId === currentUserId;
              return (
                <Card
                  as="li"
                  key={member.userId}
                  padding="sm"
                  className={cn(isSelf && "bg-primary-50/50")}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={member.displayName} size="sm" />
                    <Link
                      href={tasksHref(member.userId)}
                      className="min-w-0 break-words font-medium hover:text-primary-700"
                    >
                      {member.displayName}
                    </Link>
                    {isSelf && <span className="shrink-0 text-sm text-ink-subtle">(คุณ)</span>}
                  </div>
                  <div className="mt-3">
                    <ProgressBar member={member} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                    <dt className="text-ink-muted">ยังไม่เริ่ม</dt>
                    <dd className="tabular-nums">{member.todo}</dd>
                    <dt className="text-ink-muted">กำลังทำ</dt>
                    <dd className="tabular-nums">{member.doing}</dd>
                    <dt className="text-ink-muted">เสร็จแล้ว</dt>
                    <dd className="tabular-nums">{member.done}</dd>
                    <dt className="text-ink-muted">เลยกำหนด</dt>
                    <dd>
                      <OverdueCell count={member.overdue} />
                    </dd>
                  </dl>
                </Card>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
