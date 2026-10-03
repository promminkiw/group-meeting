"use client";

import { useParams } from "next/navigation";
import { ErrorPanel } from "@/components/error-panel";

export default function CalendarError(props: { error: Error & { digest?: string }; retry: () => void }) {
  const { groupId } = useParams<{ groupId: string }>();
  return <ErrorPanel {...props} backHref={`/groups/${groupId}`} backLabel="กลับไปภาพรวมกลุ่ม" />;
}
