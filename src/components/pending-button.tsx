"use client";

import { useFormStatus } from "react-dom";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700",
  secondary: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
  danger: "border border-red-300 bg-white text-red-700 hover:bg-red-50",
};

type Props = {
  label: string;
  pendingLabel: string;
  variant?: Variant;
  className?: string;
};

export function PendingButton({ label, pendingLabel, variant = "primary", className = "" }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
