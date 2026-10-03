import Link from "next/link";
import { cn } from "@/lib/cn";
import type { IconComponent } from "./icon";

export type StatTone = "todo" | "doing" | "done" | "overdue";

const ICON_TONE_CLASSES: Record<StatTone, string> = {
  todo: "bg-todo-bg text-todo-fg",
  doing: "bg-doing-bg text-doing-fg",
  done: "bg-done-bg text-done-fg",
  overdue: "bg-overdue-bg text-overdue-fg",
};

type StatCardProps = {
  label: string;
  value: number | string;
  tone: StatTone;
  icon: IconComponent;
  href?: string;
};

export function StatCard({ label, value, tone, icon: Icon, href }: StatCardProps) {
  const isAlert = tone === "overdue" && Number(value) > 0;
  const classes = cn(
    "block rounded-card border bg-surface p-4 shadow-card",
    isAlert ? "border-overdue-line" : "border-line",
    href && "transition-shadow duration-200 hover:shadow-pop motion-reduce:transition-none",
  );

  const body = (
    <dl>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            ICON_TONE_CLASSES[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <dt className="text-xs leading-[1.6] text-ink-muted">{label}</dt>
      </div>
      <dd
        className={cn(
          "mt-3 text-3xl font-bold leading-[1.2] tabular-nums",
          isAlert ? "text-overdue-fg" : "text-ink",
        )}
      >
        {value}
      </dd>
    </dl>
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
