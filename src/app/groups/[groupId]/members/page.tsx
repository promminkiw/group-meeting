import { redirect } from "next/navigation";
import { Link2, ShieldCheck, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader as="h2" title="จัดการสมาชิก" />

      <section aria-labelledby="manage-members-heading">
        <h2 id="manage-members-heading" className="mb-3 text-xl font-semibold leading-[1.4]">
          สมาชิก (<span className="tabular-nums">{members.length}</span>)
        </h2>
        <Card padding="none">
          <ul className="divide-y divide-line">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={member.displayName} size="md" />
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="break-words text-sm font-medium">
                      {member.displayName}
                      {member.userId === userId && (
                        <span className="font-normal text-ink-subtle"> (คุณ)</span>
                      )}
                    </span>
                    <Badge
                      tone={member.role === "admin" ? "primary" : "neutral"}
                      icon={member.role === "admin" ? ShieldCheck : User}
                    >
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </div>
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
        </Card>
      </section>

      <section aria-labelledby="invites-heading" className="space-y-4">
        <h2 id="invites-heading" className="text-xl font-semibold leading-[1.4]">
          ลิงก์เชิญ
        </h2>
        <Card>
          <InviteForm groupId={group.id} />
        </Card>
        {invites.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="ยังไม่มีลิงก์เชิญ"
            description="สร้างลิงก์เพื่อชวนเพื่อนเข้ากลุ่ม"
          />
        ) : (
          <Card padding="none">
            <ul className="divide-y divide-line">
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
          </Card>
        )}
      </section>
    </div>
  );
}
