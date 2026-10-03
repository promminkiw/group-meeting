import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  // ใต้กลุ่มชื่อกลุ่มใน layout เป็น h1 อยู่แล้ว จึงต้องส่ง "h2"
  as?: "h1" | "h2";
};

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel,
  as: Heading = "h1",
}: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-primary-700 motion-reduce:transition-none"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {backLabel ?? "ย้อนกลับ"}
          </Link>
        )}
        <Heading className="break-words text-2xl font-bold leading-[1.35] tracking-tight sm:text-3xl">
          {title}
        </Heading>
        {description && <p className="mt-1 max-w-prose text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
