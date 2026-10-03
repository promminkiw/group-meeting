"use client";

import { ErrorPanel } from "@/components/error-panel";

export default function RootError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel {...props} />;
}
