import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getGroupContext, getGroupMembers } from "@/lib/groups/dal";
import { can } from "@/lib/permissions";
import { CreateTaskForm } from "./create-task-form";

export default async function NewTaskPage({ params }: PageProps<"/groups/[groupId]/tasks/new">) {
  const { groupId } = await params;
  const { group, role } = await getGroupContext(groupId);

  if (!can(role, "createTask")) redirect(`/groups/${group.id}/tasks`);

  const members = await getGroupMembers(group.id);

  return (
    <div>
      <PageHeader
        as="h2"
        title="สร้างงานใหม่"
        backHref={`/groups/${group.id}/tasks`}
        backLabel="กลับไปรายการงาน"
      />
      <Card className="max-w-2xl">
        <CreateTaskForm
          groupId={group.id}
          members={members.map((member) => ({
            userId: member.userId,
            displayName: member.displayName,
          }))}
        />
      </Card>
    </div>
  );
}
