import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { getCurrentProfile, verifySession } from "@/lib/auth/dal";
import { getMyGroups } from "@/lib/groups/dal";
import { ROLE_LABELS } from "@/lib/groups/labels";
import { CreateGroupForm } from "./create-group-form";
import { JoinGroupForm } from "./join-group-form";

export default async function Home() {
  await verifySession();
  const [profile, groups] = await Promise.all([getCurrentProfile(), getMyGroups()]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold sm:text-2xl">
          {profile ? `สวัสดี ${profile.display_name}` : "สวัสดี"}
        </h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            ออกจากระบบ
          </button>
        </form>
      </header>
      {!profile && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ในขณะนี้
        </p>
      )}

      <section className="mt-8" aria-labelledby="my-groups-heading">
        <h2 id="my-groups-heading" className="text-lg font-semibold">
          กลุ่มของฉัน
        </h2>
        {groups.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
            คุณยังไม่ได้อยู่ในกลุ่มใด ลองสร้างกลุ่มใหม่ หรือเข้ากลุ่มด้วยโค้ดเชิญด้านล่าง
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="break-words font-medium">{group.name}</span>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                      {ROLE_LABELS[group.role]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{group.memberCount} สมาชิก</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section
          aria-labelledby="create-group-heading"
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 id="create-group-heading" className="mb-3 text-base font-semibold">
            สร้างกลุ่มใหม่
          </h2>
          <CreateGroupForm />
        </section>
        <section
          aria-labelledby="join-group-heading"
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 id="join-group-heading" className="mb-3 text-base font-semibold">
            เข้ากลุ่มด้วยโค้ดเชิญ
          </h2>
          <JoinGroupForm />
        </section>
      </div>
    </main>
  );
}
