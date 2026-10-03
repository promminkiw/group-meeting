import Link from "next/link";
import { getGroupContext } from "@/lib/groups/dal";
import { ROLE_LABELS } from "@/lib/groups/labels";
import { can } from "@/lib/permissions";

export default async function GroupLayout({ children, params }: LayoutProps<"/groups/[groupId]">) {
  const { groupId } = await params;
  const { group, role } = await getGroupContext(groupId);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
        &larr; กลุ่มของฉัน
      </Link>
      <header className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="break-words text-xl font-semibold sm:text-2xl">{group.name}</h1>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
          {ROLE_LABELS[role]}
        </span>
      </header>
      <nav
        aria-label="เมนูกลุ่ม"
        className="mt-4 flex flex-wrap gap-x-4 border-b border-zinc-200 text-sm"
      >
        <Link href={`/groups/${group.id}`} className="-mb-px border-b-2 border-transparent pb-2 hover:border-zinc-400">
          ภาพรวม
        </Link>
        <Link
          href={`/groups/${group.id}/tasks`}
          className="-mb-px border-b-2 border-transparent pb-2 hover:border-zinc-400"
        >
          งาน
        </Link>
        <Link
          href={`/groups/${group.id}/calendar`}
          className="-mb-px border-b-2 border-transparent pb-2 hover:border-zinc-400"
        >
          ปฏิทิน
        </Link>
        {can(role, "fillAvailability") && (
          <Link
            href={`/groups/${group.id}/availability`}
            className="-mb-px border-b-2 border-transparent pb-2 hover:border-zinc-400"
          >
            เวลาว่างของฉัน
          </Link>
        )}
        {can(role, "manageMembers") && (
          <Link
            href={`/groups/${group.id}/members`}
            className="-mb-px border-b-2 border-transparent pb-2 hover:border-zinc-400"
          >
            จัดการสมาชิก
          </Link>
        )}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
