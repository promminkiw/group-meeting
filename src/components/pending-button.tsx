"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import type { IconComponent } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  pendingLabel: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconComponent;
  fullWidth?: boolean;
  className?: string;
};

export function PendingButton({
  label,
  pendingLabel,
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  className,
}: Props) {
  const { pending } = useFormStatus();

  // วางข้อความทั้งสองแบบซ้อนกันในช่องเดียว เพื่อให้ความกว้างปุ่มคงที่ตอน pending
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      icon={icon}
      fullWidth={fullWidth}
      disabled={pending}
      aria-busy={pending || undefined}
      className={className}
    >
      <span className="inline-grid">
        <span className={cn("col-start-1 row-start-1", pending && "invisible")}>{label}</span>
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center justify-center gap-2",
            !pending && "invisible",
          )}
          aria-hidden={!pending}
        >
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {pendingLabel}
        </span>
      </span>
    </Button>
  );
}
