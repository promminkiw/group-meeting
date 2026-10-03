import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserMenu({ displayName }: { displayName: string | null }) {
  const name = displayName ?? "บัญชีของฉัน";

  return (
    <div className="flex items-center gap-2">
      {/* เดสก์ท็อป: แสดงชื่อและปุ่มออกจากระบบตรงๆ */}
      <div className="hidden items-center gap-2 md:flex">
        <Avatar name={name} size="sm" />
        <span className="max-w-[10rem] break-words text-sm leading-[1.4]">{name}</span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" icon={LogOut}>
            ออกจากระบบ
          </Button>
        </form>
      </div>

      {/* มือถือ: เมนู dropdown */}
      <details className="relative md:hidden">
        <summary
          aria-label="เมนูบัญชี"
          className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden"
        >
          <Avatar name={name} size="md" />
        </summary>
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-line bg-surface p-1 shadow-pop">
          <p className="break-words px-3 py-2 text-sm font-medium leading-[1.5]">{name}</p>
          <form action={signOut} className="border-t border-line pt-1">
            <Button type="submit" variant="ghost" icon={LogOut} fullWidth className="justify-start">
              ออกจากระบบ
            </Button>
          </form>
        </div>
      </details>
    </div>
  );
}
