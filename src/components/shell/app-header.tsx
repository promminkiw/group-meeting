import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/dal";
import { getMyGroups } from "@/lib/groups/dal";
import { GroupSwitcher } from "./group-switcher";
import { UserMenu } from "./user-menu";

export async function AppHeader() {
  // dal ใช้ cache() จึงไม่ query ซ้ำกับหน้าที่ดึงข้อมูลเดียวกัน
  const [profile, groups] = await Promise.all([getCurrentProfile(), getMyGroups()]);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-line bg-surface/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-pop"
      >
        ข้ามไปยังเนื้อหา
      </a>
      <div className="mx-auto flex h-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-control">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600">
            <CalendarCheck className="size-[18px] text-white" aria-hidden="true" />
          </span>
          <span className="hidden font-semibold sm:inline">Group Meeting</span>
          <span className="sr-only sm:hidden">Group Meeting</span>
        </Link>
        <GroupSwitcher groups={groups.map(({ id, name }) => ({ id, name }))} />
        <div className="ml-auto">
          <UserMenu displayName={profile?.display_name ?? null} />
        </div>
      </div>
    </header>
  );
}
