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

  return (
    <div className="space-y-8">
      {group.description && (
        <p className="whitespace-pre-line break-words text-sm text-zinc-700">{group.description}</p>
      )}

      <Dashboard
        groupId={group.id}
        currentUserId={userId}
        summary={summary}
        workload={workload}
        truncated={assigneeData.truncated}
      />

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="text-lg font-semibold">
          สมาชิก ({members.length})
        </h2>
        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0 break-words text-sm">
                {member.displayName}
                {member.userId === userId && <span className="text-zinc-500"> (คุณ)</span>}
              </span>
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                {ROLE_LABELS[member.role]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {can(role, "leaveGroup") && (
        <section aria-labelledby="leave-heading">
          <h2 id="leave-heading" className="text-lg font-semibold">
            ออกจากกลุ่ม
          </h2>
          {blockedByLastAdmin ? (
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              คุณเป็นผู้ดูแลคนเดียวของกลุ่มนี้ จึงยังออกจากกลุ่มไม่ได้ กรุณามอบสิทธิ์ผู้ดูแลให้สมาชิกคนอื่นก่อน
              (ที่เมนูจัดการสมาชิก) หรือหากไม่ต้องการใช้กลุ่มนี้แล้ว สามารถลบกลุ่มได้ที่ส่วน
              &quot;ลบกลุ่ม&quot; ด้านล่าง
            </p>
          ) : (
            <div className="mt-2">
              <LeaveGroupForm groupId={group.id} />
            </div>
          )}
        </section>
      )}

      {can(role, "deleteGroup") && (
        <section aria-labelledby="delete-group-heading">
          <h2 id="delete-group-heading" className="text-lg font-semibold">
            ลบกลุ่ม
          </h2>
          <div className="mt-2 rounded-xl border border-red-200 bg-white p-4">
            <DeleteGroupForm groupId={group.id} groupName={group.name} />
          </div>
        </section>
      )}
    </div>
  );
}
