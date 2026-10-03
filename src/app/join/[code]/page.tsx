import { AlertTriangle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/auth/dal";
import { isInviteCode } from "@/lib/groups/validation";
import { JoinForm } from "./join-form";

export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  // GET เปิดหน้านี้ไม่ทำให้เข้ากลุ่ม ต้องกดยืนยัน (POST ผ่าน Server Action)
  await verifySession();
  const { code } = await params;

  return (
    <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-md rounded-panel border border-line bg-surface p-6 text-center shadow-pop sm:p-8">
        {isInviteCode(code) ? (
          <div className="flex flex-col items-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <UserPlus className="size-[22px]" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-semibold leading-[1.4]">คุณได้รับเชิญเข้ากลุ่ม</h1>
            <p className="mt-1 text-sm text-ink-muted">
              กดปุ่มด้านล่างเพื่อยืนยันการเข้าร่วมกลุ่มนี้
            </p>
            <div className="mt-6 w-full">
              <JoinForm code={code} />
            </div>
          </div>
        ) : (
          <div role="alert" className="flex flex-col items-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-overdue-bg text-overdue-fg">
              <AlertTriangle className="size-[22px]" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-semibold leading-[1.4]">ลิงก์เชิญไม่ถูกต้อง</h1>
            <p className="mt-1 text-sm text-ink-muted">
              กรุณาตรวจสอบลิงก์ หรือขอลิงก์ใหม่จากผู้ดูแลกลุ่ม
            </p>
            <div className="mt-6">
              <Button href="/">กลับหน้าแรก</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
