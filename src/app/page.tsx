import { ChevronRight, KeyRound, Plus, Users } from "lucide-react";
import { AppHeader } from "@/components/shell/app-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardLink } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentProfile, verifySession } from "@/lib/auth/dal";
import { getMyGroups } from "@/lib/groups/dal";
import { ROLE_LABELS } from "@/lib/groups/labels";
import { CreateGroupForm } from "./create-group-form";
import { JoinGroupForm } from "./join-group-form";

export default async function Home() {
  await verifySession();
  const [profile, groups] = await Promise.all([getCurrentProfile(), getMyGroups()]);
  const hasGroups = groups.length > 0;

  const groupsSection = (
    <section aria-labelledby="my-groups-heading">
      <h2 id="my-groups-heading" className="mb-3 text-xl font-semibold leading-[1.4]">
        กลุ่มของฉัน
      </h2>
      {hasGroups ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <li key={group.id}>
              <CardLink href={`/groups/${group.id}`} className="group h-full">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-base font-semibold leading-[1.5]">{group.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone={group.role === "admin" ? "primary" : "neutral"}>
                        {ROLE_LABELS[group.role]}
                      </Badge>
                      <span className="text-xs leading-[1.6] text-ink-muted">
                        <span className="tabular-nums">{group.memberCount}</span> สมาชิก
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="mt-2.5 size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </div>
              </CardLink>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title="ยังไม่มีกลุ่ม"
          description="สร้างกลุ่มแรก หรือเข้ากลุ่มด้วยโค้ดเชิญจากเพื่อน"
        />
      )}
    </section>
  );

  const actionsSection = (
    <div className="grid gap-4 md:grid-cols-2">
      <Card as="section" aria-labelledby="create-group-heading">
        <h2
          id="create-group-heading"
          className="mb-4 flex items-center gap-2 text-base font-semibold leading-[1.5]"
        >
          <Plus className="size-[18px] text-primary-600" aria-hidden="true" />
          สร้างกลุ่มใหม่
        </h2>
        <CreateGroupForm />
      </Card>
      <Card as="section" aria-labelledby="join-group-heading">
        <h2
          id="join-group-heading"
          className="mb-4 flex items-center gap-2 text-base font-semibold leading-[1.5]"
        >
          <KeyRound className="size-[18px] text-primary-600" aria-hidden="true" />
          เข้ากลุ่มด้วยโค้ดเชิญ
        </h2>
        <JoinGroupForm />
      </Card>
    </div>
  );

  return (
    <>
      <AppHeader />
      <main id="main" className="page-wash min-h-[calc(100dvh-3.5rem)]">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-10 sm:px-6 sm:py-8">
          <PageHeader
            title={profile ? `สวัสดี ${profile.display_name}` : "สวัสดี"}
            description="เลือกกลุ่มเพื่อทำงานต่อ"
          />
          {!profile && (
            <Alert tone="warning" className="mb-6">
              ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ในขณะนี้
            </Alert>
          )}
          <div className="space-y-8">
            {hasGroups ? (
              <>
                {groupsSection}
                {actionsSection}
              </>
            ) : (
              <>
                {actionsSection}
                {groupsSection}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
