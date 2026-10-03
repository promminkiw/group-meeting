import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { isInviteCode } from "@/lib/groups/validation";
import { JoinForm } from "./join-form";

export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  // GET เปิดหน้านี้ไม่ทำให้เข้ากลุ่ม ต้องกดยืนยัน (POST ผ่าน Server Action)
  await verifySession();
  const { code } = await params;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        {isInviteCode(code) ? (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">คุณได้รับเชิญเข้ากลุ่ม</h1>
            <p className="text-sm text-zinc-600">กดปุ่มด้านล่างเพื่อยืนยันการเข้าร่วมกลุ่มนี้</p>
            <JoinForm code={code} />
          </div>
        ) : (
          <div role="alert" className="space-y-4">
            <h1 className="text-xl font-semibold">ลิงก์เชิญไม่ถูกต้อง</h1>
            <p className="text-sm text-zinc-600">กรุณาตรวจสอบลิงก์ หรือขอลิงก์ใหม่จากผู้ดูแลกลุ่ม</p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              กลับหน้าแรก
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
