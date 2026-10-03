import { notFound } from "next/navigation";
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
      <div>
        <h2 className="text-lg font-semibold">เวลาว่างของฉัน</h2>
        <p className="mt-1 text-sm text-zinc-600">
          เลือกช่วงเวลาที่คุณว่างในแต่ละสัปดาห์ (ช่องละ 30 นาที, เวลาประเทศไทย) ซ้ำทุกสัปดาห์
        </p>
      </div>
      <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
        เวลาว่างนี้เป็นของคุณคนเดียวและใช้ร่วมกันทุกกลุ่มที่คุณเป็นสมาชิก กรอกครั้งเดียวก็พอ
        สมาชิกในกลุ่มเดียวกันจะเห็นว่าคุณว่างช่วงไหนในหน้าปฏิทิน
        (กลุ่มปัจจุบัน: {group.name})
      </p>
      <p className="text-xs text-zinc-600">
        เดสก์ท็อป: คลิกหรือกดเมาส์ค้างแล้วลากเพื่อเลือกต่อเนื่อง / มือถือ: แตะทีละช่อง
      </p>
      <AvailabilityGrid groupId={group.id} initialKeys={initialKeys} />
    </div>
  );
}
