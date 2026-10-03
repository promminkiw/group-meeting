"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock, LayoutDashboard, ListChecks, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { IconComponent } from "@/components/ui/icon";

export type GroupNavKey = "overview" | "tasks" | "calendar" | "availability" | "members";

export type GroupNavItem = {
  key: GroupNavKey;
  href: string;
  label: string;
  // ป้ายย่อสำหรับ bottom nav บนมือถือ
  shortLabel?: string;
};

const NAV_ICONS: Record<GroupNavKey, IconComponent> = {
  overview: LayoutDashboard,
  tasks: ListChecks,
  calendar: CalendarDays,
  availability: Clock,
  members: Users,
};

export function GroupNav({ items }: { items: GroupNavItem[] }) {
  const pathname = usePathname();
  // ภาพรวม active เฉพาะ path ตรงเป๊ะ ที่เหลือ active เมื่อ path ขึ้นต้นด้วย href
  const isActive = (item: GroupNavItem) =>
    item.key === "overview"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <>
      <nav aria-label="เมนูกลุ่ม" className="hidden border-b border-line md:flex">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.key];
          const active = isActive(item);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors motion-reduce:transition-none",
                active
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav
        aria-label="เมนูกลุ่ม"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => {
            const Icon = NAV_ICONS[item.key];
            const active = isActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium leading-[1.4] transition-colors motion-reduce:transition-none",
                  active ? "text-primary-700" : "text-ink-muted",
                )}
              >
                {active && (
                  <span
                    className="absolute top-0 h-0.5 w-6 bg-primary-600"
                    aria-hidden="true"
                  />
                )}
                <Icon className="size-5" aria-hidden="true" />
                {item.shortLabel ?? item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
