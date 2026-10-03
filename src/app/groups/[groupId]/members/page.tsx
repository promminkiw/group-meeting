import { redirect } from "next/navigation";
import {
  getGroupContext,
  getGroupInvites,
  getGroupMembers,
} from "@/lib/groups/dal";
import { describeInvite } from "@/lib/groups/invites";
import { ROLE_LABELS } from "@/lib/groups/labels";
import { can } from "@/lib/permissions";
import { getRequestOrigin } from "@/lib/request-origin";
import { InviteForm } from "./invite-form";
import { InviteItem } from "./invite-item";
import { MemberActions } from "./member-actions";

export default async function MembersPage({ params }: PageProps<"/groups/[groupId]/members">) {
  const { groupId } = await params;
  const { group, role, userId } = await getGroupContext(groupId);

  // หน้านี้เฉพาะ admin (RLS ซ่อน invites จากสมาชิกทั่วไปอยู่แล้ว)
  if (!can(role, "manageMembers")) redirect(`/groups/${group.id}`);

  const [members, invites, origin] = await Promise.all([
    getGroupMembers(group.id),
    getGroupInvites(group.id),
    getRequestOrigin(),
  ]);

  return (
    <div className="space-y-8">
      <section aria-labelledby="manage-members-heading">
        <h2 id="manage-members-heading" className="text-lg font-semibold">
          สมาชิก ({members.length})
        </h2>
        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">
                  {member.displayName}
                  {member.userId === userId && <span className="text-zinc-500"> (คุณ)</span>}
                </p>
                <p className="text-xs text-zinc-600">{ROLE_LABELS[member.role]}</p>
              </div>
              <MemberActions
                groupId={group.id}
                userId={member.userId}
                displayName={member.displayName}
                role={member.role}
                isSelf={member.userId === userId}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="invites-heading" className="space-y-4">
        <h2 id="invites-heading" className="text-lg font-semibold">
          ลิงก์เชิญ
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <InviteForm groupId={group.id} />
        </div>
        {invites.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
            ยังไม่มีลิงก์เชิญ
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {invites.map((invite) => {
              const status = describeInvite(invite);
              return (
                <InviteItem
                  key={invite.id}
                  groupId={group.id}
                  inviteId={invite.id}
                  link={`${origin ?? ""}/join/${invite.code}`}
                  summary={status.summary}
                  active={status.active}
                  statusLabel={status.statusLabel}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
