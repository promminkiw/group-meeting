"use client";

import { useActionState, useState } from "react";
import { PendingButton } from "@/components/pending-button";
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
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2 py-0.5 ${active ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"}`}
        >
          {statusLabel}
        </span>
        <span className="text-zinc-600">{summary}</span>
      </div>
      <input
        type="text"
        readOnly
        aria-label="ลิงก์เชิญ"
        value={link}
        onFocus={(event) => event.currentTarget.select()}
        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm"
      />
      {active && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            คัดลอกลิงก์
          </button>
          <form action={revokeAction}>
            <input type="hidden" name="groupId" value={groupId} />
            <input type="hidden" name="inviteId" value={inviteId} />
            <PendingButton label="ยกเลิกลิงก์" pendingLabel="กำลังยกเลิก..." variant="danger" />
          </form>
          <span role="status" className="text-sm text-zinc-600">
            {copyStatus === "copied" && "คัดลอกแล้ว"}
            {copyStatus === "failed" && "คัดลอกไม่สำเร็จ กรุณาคัดลอกจากช่องด้านบน"}
          </span>
        </div>
      )}
      {revokeState.error && (
        <p role="alert" className="text-sm text-red-600">
          {revokeState.error}
        </p>
      )}
    </li>
  );
}
