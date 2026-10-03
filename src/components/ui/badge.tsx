import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { IconComponent } from "./icon";

export type BadgeTone =
  | "todo"
  | "doing"
  | "done"
  | "overdue"
  | "warning"
  | "info"
  | "primary"
  | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  todo: "bg-todo-bg text-todo-fg",
  doing: "bg-doing-bg text-doing-fg",
  done: "bg-done-bg text-done-fg",
  overdue: "bg-overdue-bg text-overdue-fg",
  warning: "bg-warning-bg text-warning-fg",
  info: "bg-info-bg text-info-fg",
  primary: "bg-primary-100 text-primary-800",
  neutral: "bg-surface-muted text-ink-muted",
};

type BadgeProps = {
  tone?: BadgeTone;
  icon?: IconComponent;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = "neutral", icon: Icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-[1.6]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {Icon && <Icon className="size-3 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}
