import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function TaskNotFound() {
  return (
    <div className="mx-auto w-full max-w-md py-10">
      <EmptyState
        icon={SearchX}
        title="ไม่พบงานนี้"
        description="งานอาจถูกลบ หรืออยู่ในกลุ่มอื่น"
        action={<Button href="/">กลับไปรายการกลุ่ม</Button>}
      />
    </div>
  );
}
