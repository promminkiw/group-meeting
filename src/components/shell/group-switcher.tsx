"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type SwitcherGroup = { id: string; name: string };

const GROUP_PATH_PATTERN = /^\/groups\/([^/]+)/;

export function GroupSwitcher({ groups }: { groups: SwitcherGroup[] }) {
  const pathname = usePathname();
  const currentId = GROUP_PATH_PATTERN.exec(pathname)?.[1];
  if (!currentId) return null;

  const currentName = groups.find((group) => group.id === currentId)?.name ?? "เลือกกลุ่ม";

  // key ตาม pathname เพื่อให้ <details> ปิดเองเมื่อเปลี่ยนหน้า
  return (
    <details key={pathname} className="relative min-w-0">
      <summary
        aria-label="สลับกลุ่ม"
        className="flex cursor-pointer list-none items-center gap-2 rounded-control px-2 py-1.5 text-sm font-medium transition-colors hover:bg-surface-muted motion-reduce:transition-none [&::-webkit-details-marker]:hidden"
      >
        <span className="max-w-[12rem] break-words text-left leading-[1.4]">{currentName}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </summary>
      <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-card border border-line bg-surface p-1 shadow-pop">
        <ul className="max-h-72 overflow-y-auto">
          {groups.map((group) => {
            const isCurrent = group.id === currentId;
            return (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.id}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-control px-3 py-2 text-sm hover:bg-surface-muted",
                    isCurrent && "font-medium text-primary-700",
                  )}
                >
                  <span className="break-words leading-[1.5]">{group.name}</span>
                  {isCurrent && <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-1 border-t border-line pt-1">
          <Link
            href="/"
            className="block rounded-control px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            ทุกกลุ่ม
          </Link>
        </div>
      </div>
    </details>
  );
}
