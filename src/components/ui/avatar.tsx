import { cn } from "@/lib/cn";
import { getInitials, hashName } from "@/lib/initials";

export type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
};

// คู่สี bg/fg ที่ผ่าน AA
const PALETTE = [
  "bg-[#E0E7FF] text-[#3730A3]",
  "bg-[#DCFCE7] text-[#166534]",
  "bg-[#FEF3C7] text-[#92400E]",
  "bg-[#E0F2FE] text-[#075985]",
  "bg-[#FCE7F3] text-[#9D174D]",
  "bg-[#EDE9FE] text-[#5B21B6]",
];

type AvatarProps = { name: string; size?: AvatarSize; className?: string };

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold leading-none",
        SIZE_CLASSES[size],
        PALETTE[hashName(name, PALETTE.length)],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
