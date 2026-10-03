import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "./card";

type ConfirmDangerZoneProps = {
  title: string;
  description: string;
  children: ReactNode;
};

// ฟอร์มลบที่ส่งเข้ามาต้องมีขั้นตอนยืนยันของมันเองอยู่แล้ว
export function ConfirmDangerZone({ title, description, children }: ConfirmDangerZoneProps) {
  return (
    <Card as="section" className="border-overdue-line">
      <h2 className="flex items-center gap-2 text-base font-semibold leading-[1.5] text-overdue-fg">
        <AlertTriangle className="size-[18px] shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </Card>
  );
}
