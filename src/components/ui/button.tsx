import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { IconComponent } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white shadow-card not-disabled:hover:bg-primary-700",
  secondary:
    "bg-surface text-ink border border-line-strong not-disabled:hover:bg-surface-muted",
  ghost: "text-ink-muted not-disabled:hover:bg-surface-muted not-disabled:hover:text-ink",
  danger:
    "bg-surface text-overdue-fg border border-overdue-line not-disabled:hover:bg-overdue-bg",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm max-md:min-h-11",
  lg: "h-11 px-5 text-base",
};

export function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean | undefined,
  className: string | undefined,
) {
  return cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && "w-full", className);
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconComponent;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
};

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href"> & { href: string };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = buttonClasses(variant, size, fullWidth, className);

  // ตอน loading ซ่อนเนื้อหาไว้แต่คงพื้นที่ไว้ เพื่อให้ความกว้างปุ่มไม่เปลี่ยน
  const content = (
    <>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </span>
      )}
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "invisible")}>
        {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
        {children}
      </span>
    </>
  );

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, ...buttonProps } = rest;
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
