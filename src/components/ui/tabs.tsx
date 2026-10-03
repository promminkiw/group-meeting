import Link from "next/link";
import { cn } from "@/lib/cn";

export type SegmentedItem = {
  value: string;
  label: string;
  count?: number;
  href: string;
};

type SegmentedFilterProps = {
  items: SegmentedItem[];
  value: string;
  label?: string;
};

// ใช้ลิงก์ล้วน ไม่พึ่ง JS state
export function SegmentedFilter({ items, value, label }: SegmentedFilterProps) {
  return (
    <nav aria-label={label} className="max-w-full overflow-x-auto">
      <div className="inline-flex gap-1 rounded-control bg-surface-muted p-1">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <Link
              key={item.value}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors motion-reduce:transition-none",
                active ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="text-xs tabular-nums text-ink-subtle">{item.count}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
