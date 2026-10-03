import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardPadding = "none" | "sm" | "md" | "lg";

const BASE = "rounded-card border border-line bg-surface shadow-card";
const INTERACTIVE =
  "block transition-shadow duration-200 hover:border-primary-200 hover:shadow-pop motion-reduce:transition-none";
const PADDING_CLASSES: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-4 md:p-5",
  lg: "p-6 md:p-8",
};

type CardProps = HTMLAttributes<HTMLElement> & {
  padding?: CardPadding;
  as?: "div" | "section" | "article" | "li";
  children?: ReactNode;
};

export function Card({ padding = "md", as: Tag = "div", className, ...rest }: CardProps) {
  return <Tag className={cn(BASE, PADDING_CLASSES[padding], className)} {...rest} />;
}

type CardLinkProps = {
  href: string;
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
};

// การ์ดที่กดได้ทั้งใบ ให้ focus ring อยู่ที่ Link
export function CardLink({ href, padding = "md", className, children }: CardLinkProps) {
  return (
    <Link href={href} className={cn(BASE, INTERACTIVE, PADDING_CLASSES[padding], className)}>
      {children}
    </Link>
  );
}
