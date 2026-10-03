import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GroupNotFound() {
  return (
    <div className="mx-auto w-full max-w-md py-12">
      <EmptyState
        icon={SearchX}
        title="ไม่พบกลุ่มนี้"
        description="กลุ่มอาจถูกลบ หรือคุณยังไม่ได้เป็นสมาชิกของกลุ่มนี้"
        action={<Button href="/">กลับไปรายการกลุ่ม</Button>}
      />
    </div>
  );
}
