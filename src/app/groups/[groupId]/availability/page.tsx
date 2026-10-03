import { notFound } from "next/navigation";
import { MousePointerClick } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { getMyAvailability } from "@/lib/availability/dal";
import { slotsToKeySet } from "@/lib/availability/slots";
import { getGroupContext } from "@/lib/groups/dal";
import { can } from "@/lib/permissions";
import { AvailabilityGrid } from "./availability-grid";

export default async function AvailabilityPage({ params }: PageProps<"/groups/[groupId]/availability">) {
  const { groupId } = await params;
  const { group, role } = await getGroupContext(groupId);
  if (!can(role, "fillAvailability")) notFound();

  const mine = await getMyAvailability();
  const initialKeys = [...slotsToKeySet(mine)];

  return (
    <div className="space-y-4">
      <PageHeader
        as="h2"
        title="เวลาว่างของฉัน"
        description="ลากหรือกดช่องที่คุณว่าง ซ้ำทุกสัปดาห์ (ช่องละ 30 นาที, เวลาประเทศไทย)"
      />
      <Alert tone="info">
        เวลาว่างนี้เป็นของคุณคนเดียวและใช้ร่วมกันทุกกลุ่มที่คุณเป็นสมาชิก กรอกครั้งเดียวก็พอ
        สมาชิกในกลุ่มเดียวกันจะเห็นว่าคุณว่างช่วงไหนในหน้าปฏิทิน
        (กลุ่มปัจจุบัน: {group.name})
      </Alert>
      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
        <MousePointerClick className="size-3.5 shrink-0" aria-hidden="true" />
        เดสก์ท็อป: คลิกหรือกดเมาส์ค้างแล้วลากเพื่อเลือกต่อเนื่อง / มือถือ: แตะทีละช่อง
      </p>
      <AvailabilityGrid groupId={group.id} initialKeys={initialKeys} />
    </div>
  );
}
