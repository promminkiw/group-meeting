"use client";

import { PendingButton } from "@/components/pending-button";
import type { IconComponent } from "@/components/ui/icon";

type Props = {
  label: string;
  pendingLabel: string;
  variant?: "primary" | "secondary";
  icon?: IconComponent;
};

export function SubmitButton({ label, pendingLabel, variant = "primary", icon }: Props) {
  return (
    <PendingButton
      label={label}
      pendingLabel={pendingLabel}
      variant={variant}
      size="lg"
      icon={icon}
      fullWidth
    />
  );
}
