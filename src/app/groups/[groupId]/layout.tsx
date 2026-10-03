import { GroupNav, type GroupNavItem } from "@/components/shell/group-nav";
import { Badge } from "@/components/ui/badge";
import { getGroupContext } from "@/lib/groups/dal";
import { ROLE_LABELS } from "@/lib/groups/labels";
import { can } from "@/lib/permissions";
import { ShieldCheck, User } from "lucide-react";

export default async function GroupLayout({ children, params }: LayoutProps<"/groups/[groupId]">) {
  const { groupId } = await params;
  const { group, role } = await getGroupContext(groupId);
  const base = `/groups/${group.id}`;

  const navItems: GroupNavItem[] = [
    { key: "overview", href: base, label: "ภาพรวม" },
    { key: "tasks", href: `${base}/tasks`, label: "งาน" },
    { key: "calendar", href: `${base}/calendar`, label: "ปฏิทิน" },
    ...(can(role, "fillAvailability")
      ? [
          {
            key: "availability" as const,
            href: `${base}/availability`,
            label: "เวลาว่างของฉัน",
            shortLabel: "เวลาว่าง",
          },
        ]
      : []),
    ...(can(role, "manageMembers")
      ? [{ key: "members" as const, href: `${base}/members`, label: "จัดการสมาชิก" }]
      : []),
  ];

  return (
    <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-10">
      <header className="flex flex-wrap items-center gap-3 pb-4">
        <h1 className="break-words text-2xl font-bold leading-[1.35] tracking-tight sm:text-3xl">
          {group.name}
        </h1>
        <Badge tone={role === "admin" ? "primary" : "neutral"} icon={role === "admin" ? ShieldCheck : User}>
          {ROLE_LABELS[role]}
        </Badge>
      </header>
      <GroupNav items={navItems} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
