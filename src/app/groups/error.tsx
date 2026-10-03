"use client";

import { ErrorPanel } from "@/components/error-panel";

export default function GroupsError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel {...props} backLabel="กลับไปรายการกลุ่ม" />;
}
