"use client";

import { useActionState, useState } from "react";
import { Ban, Copy } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revokeInvite, type MemberActionState } from "./actions";

const initialState: MemberActionState = {};

type Props = {
  groupId: string;
  inviteId: string;
  link: string;
  summary: string;
  active: boolean;
  statusLabel: string;
};

export function InviteItem({ groupId, inviteId, link, summary, active, statusLabel }: Props) {
  const [revokeState, revokeAction] = useActionState(revokeInvite, initialState);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <li className="space-y-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={active ? "done" : "neutral"}>{statusLabel}</Badge>
        <span className="text-xs leading-[1.6] text-ink-muted">{summary}</span>
      </div>
      {/* input อ่านอย่างเดียวเพื่อให้เลือกข้อความทั้งลิงก์ได้ง่าย */}
      <input
        type="text"
        readOnly
        aria-label="ลิงก์เชิญ"
        value={link}
        onFocus={(event) => event.currentTarget.select()}
        className="w-full rounded-control bg-surface-muted px-2 py-1 font-mono text-xs"
      />
      {active && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" icon={Copy} onClick={copyLink}>
            คัดลอกลิงก์
          </Button>
          <form action={revokeAction}>
            <input type="hidden" name="groupId" value={groupId} />
            <input type="hidden" name="inviteId" value={inviteId} />
            <PendingButton
              label="ยกเลิกลิงก์"
              pendingLabel="กำลังยกเลิก..."
              variant="danger"
              size="sm"
              icon={Ban}
            />
          </form>
          <span role="status" className="text-sm text-ink-muted">
            {copyStatus === "copied" && "คัดลอกแล้ว"}
            {copyStatus === "failed" && "คัดลอกไม่สำเร็จ กรุณาคัดลอกจากช่องด้านบน"}
          </span>
        </div>
      )}
      <Alert tone="error">{revokeState.error}</Alert>
    </li>
  );
}
