import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./card";

type TableProps = {
  caption: string;
  head: ReactNode;
  children: ReactNode;
  className?: string;
};

// ตารางสำหรับ md ขึ้นไป ฝั่งมือถือให้หน้าที่ใช้สลับเป็น list card เอง
export function Table({ caption, head, children, className }: TableProps) {
  return (
    <Card padding="none" className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-muted text-left text-xs font-medium text-ink-muted">
            <tr>{head}</tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn("px-4 py-3 font-medium", className)} {...rest} />;
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3", className)} {...rest} />;
}

export function Tr({ className, children }: { className?: string; children: ReactNode }) {
  return <tr className={cn("hover:bg-surface-muted/60", className)}>{children}</tr>;
}
