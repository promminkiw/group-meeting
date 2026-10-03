import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { IconComponent } from "./icon";

type EmptyStateProps = {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "primary" | "danger";
  className?: string;
};

const CIRCLE_CLASSES = {
  primary: "bg-primary-50 text-primary-600",
  danger: "bg-overdue-bg text-overdue-fg",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "primary",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center",
        className,
      )}
    >
      <span
        className={cn("flex size-12 items-center justify-center rounded-full", CIRCLE_CLASSES[tone])}
      >
        <Icon className="size-[22px]" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold leading-[1.5]">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
