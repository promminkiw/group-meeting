"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
  backHref?: string;
  backLabel?: string;
};

export function ErrorPanel({ error, retry, backHref = "/", backLabel = "กลับหน้าแรก" }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto w-full max-w-md px-4 py-16">
      <EmptyState
        tone="danger"
        icon={AlertTriangle}
        title="เกิดข้อผิดพลาด"
        description="ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
        action={
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button icon={RotateCw} onClick={() => retry()}>
              ลองใหม่
            </Button>
            <Button variant="secondary" href={backHref}>
              {backLabel}
            </Button>
          </div>
        }
      />
    </div>
  );
}
