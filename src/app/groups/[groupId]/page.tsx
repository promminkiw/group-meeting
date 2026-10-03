import { ShieldCheck, User } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmDangerZone } from "@/components/ui/danger-zone";
import { getGroupContext, getGroupMembers } from "@/lib/groups/dal";
import { ROLE_LABELS } from "@/lib/groups/labels";
import { can, isLastAdmin } from "@/lib/permissions";
import { getGroupAssigneeRows } from "@/lib/tasks/dal";
import { computeSummary, computeWorkload } from "@/lib/tasks/workload";
import { Dashboard } from "./dashboard";
import { DeleteGroupForm } from "./delete-group-form";
import { LeaveGroupForm } from "./leave-group-form";

export default async function GroupOverviewPage({ params }: PageProps<"/groups/[groupId]">) {
  const { groupId } = await params;
  const { group, role, userId } = await getGroupContext(groupId);
  const [members, assigneeData] = await Promise.all([
    getGroupMembers(group.id),
    getGroupAssigneeRows(group.id),
  ]);
  const now = new Date();
  const summary = computeSummary(assigneeData.rows, now);
  const workload = computeWorkload(assigneeData.rows, members, now);
  const blockedByLastAdmin = isLastAdmin(members, userId);
  const canLeave = can(role, "leaveGroup");
  const canDelete = can(role, "deleteGroup");

  return (
    <div className="space-y-8">
      {group.description && (
        <Card>
          <p className="whitespace-pre-line break-words text-sm text-ink-muted">
            {group.description}
          </p>
        </Card>
      )}

      <Dashboard
        groupId={group.id}
        currentUserId={userId}
        summary={summary}
        workload={workload}
        truncated={assigneeData.truncated}
        canCreateTask={can(role, "createTask")}
      />

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="mb-3 text-xl font-semibold leading-[1.4]">
          สมาชิก (<span className="tabular-nums">{members.length}</span>)
        </h2>
        <Card as="section" padding="none">
          <ul className="divide-y divide-line">
            {members.map((member) => (
              <li key={member.userId} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={member.displayName} size="md" />
                  <span className="min-w-0 break-words text-sm">
                    {member.displayName}
                    {member.userId === userId && <span className="text-ink-subtle"> (คุณ)</span>}
                  </span>
                </div>
                <Badge
                  tone={member.role === "admin" ? "primary" : "neutral"}
                  icon={member.role === "admin" ? ShieldCheck : User}
                  className="shrink-0"
                >
                  {ROLE_LABELS[member.role]}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {(canLeave || canDelete) && (
        <div className="space-y-6 border-t border-line pt-8">
          {canLeave &&
            (blockedByLastAdmin ? (
              <Alert tone="warning" title="ออกจากกลุ่มไม่ได้">
                คุณเป็นผู้ดูแลคนเดียวของกลุ่มนี้ จึงยังออกจากกลุ่มไม่ได้ กรุณามอบสิทธิ์ผู้ดูแลให้สมาชิกคนอื่นก่อน
                (ที่เมนูจัดการสมาชิก) หรือหากไม่ต้องการใช้กลุ่มนี้แล้ว สามารถลบกลุ่มได้ที่ส่วน
                &quot;ลบกลุ่ม&quot; ด้านล่าง
              </Alert>
            ) : (
              <ConfirmDangerZone
                title="ออกจากกลุ่ม"
                description="คุณจะไม่เห็นข้อมูลของกลุ่มนี้อีก จนกว่าจะได้รับเชิญเข้ากลุ่มใหม่"
              >
                <LeaveGroupForm groupId={group.id} />
              </ConfirmDangerZone>
            ))}

          {canDelete && (
            <ConfirmDangerZone
              title="ลบกลุ่ม"
              description="การลบกลุ่มจะลบสมาชิก งาน และข้อมูลทั้งหมดของกลุ่มอย่างถาวร ไม่สามารถย้อนกลับได้"
            >
              <DeleteGroupForm groupId={group.id} groupName={group.name} />
            </ConfirmDangerZone>
          )}
        </div>
      )}
    </div>
  );
}
