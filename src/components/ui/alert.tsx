import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertTone = "success" | "error" | "warning" | "info";

const TONE_CLASSES: Record<AlertTone, string> = {
  success: "border-done-fg/30 bg-done-bg text-done-fg",
  error: "border-overdue-line bg-overdue-bg text-overdue-fg",
  warning: "border-warning-line bg-warning-bg text-warning-fg",
  info: "border-info-line bg-info-bg text-info-fg",
};

const TONE_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

type AlertProps = {
  tone: AlertTone;
  title?: string;
  className?: string;
  children?: ReactNode;
};

export function Alert({ tone, title, className, children }: AlertProps) {
  if (!children && !title) return null;
  const Icon = TONE_ICONS[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-card border p-3.5 text-sm", TONE_CLASSES[tone], className)}
    >
      <Icon className="mt-0.5 size-[18px] shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}
