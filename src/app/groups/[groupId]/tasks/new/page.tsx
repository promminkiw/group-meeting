import Link from "next/link";
import { redirect } from "next/navigation";
import { getGroupContext, getGroupMembers } from "@/lib/groups/dal";
import { can } from "@/lib/permissions";
import { CreateTaskForm } from "./create-task-form";

export default async function NewTaskPage({ params }: PageProps<"/groups/[groupId]/tasks/new">) {
  const { groupId } = await params;
  const { group, role } = await getGroupContext(groupId);

  if (!can(role, "createTask")) redirect(`/groups/${group.id}/tasks`);

  const members = await getGroupMembers(group.id);

  return (
    <div className="space-y-4">
      <Link href={`/groups/${group.id}/tasks`} className="text-sm text-zinc-600 hover:text-zinc-900">
        &larr; กลับไปรายการงาน
      </Link>
      <h2 className="text-lg font-semibold">สร้างงานใหม่</h2>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <CreateTaskForm
          groupId={group.id}
          members={members.map((member) => ({
            userId: member.userId,
            displayName: member.displayName,
          }))}
        />
      </div>
    </div>
  );
}
