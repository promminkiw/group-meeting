import Link from "next/link";
import { formatEventRange, parseCalendarView, visibleSlotRange } from "@/lib/availability/display";
import { getGroupAvailability, getUpcomingEvents } from "@/lib/availability/dal";
import { computeHeatmap, DAYS_PER_WEEK } from "@/lib/availability/heatmap";
import { nextOccurrenceDate } from "@/lib/availability/slots";
import { getGroupContext } from "@/lib/groups/dal";
import { can } from "@/lib/permissions";
import { CalendarHeatmap } from "./calendar-heatmap";
import { DeleteEventForm } from "./delete-event-form";

export default async function CalendarPage({
  params,
  searchParams,
}: PageProps<"/groups/[groupId]/calendar">) {
  const { groupId } = await params;
  const { group, role } = await getGroupContext(groupId);
  const view = parseCalendarView((await searchParams).view);
  const [availability, events] = await Promise.all([
    getGroupAvailability(group.id),
    getUpcomingEvents(group.id),
  ]);

  const { members, truncated } = availability;
  const memberIds = members.map((member) => member.userId);
  const memberIdSet = new Set(memberIds);
  const { start, end } = visibleSlotRange(view);
  const grid = computeHeatmap(availability.slots, memberIds);
  // ส่งให้ client เฉพาะ slot ของสมาชิกในช่วงที่แสดง
  const visibleSlots = availability.slots.filter(
    (slot) => memberIdSet.has(slot.userId) && slot.slotIndex >= start && slot.slotIndex < end,
  );
  const respondedCount = new Set(
    availability.slots.map((slot) => slot.userId).filter((id) => memberIdSet.has(id)),
  ).size;

  const now = new Date();
  const nextDates = Array.from({ length: DAYS_PER_WEEK }, (_, day) => nextOccurrenceDate(day, now));
  const canCreateEvent = can(role, "createEvent");
  const basePath = `/groups/${group.id}/calendar`;

  return (
    <div className="space-y-6">
      <section aria-label="นัดหมายที่จะมาถึง" className="space-y-3">
        <h2 className="text-lg font-semibold">นัดหมายที่จะมาถึง</h2>
        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
            ยังไม่มีนัดหมาย
            {canCreateEvent && " เลือกช่องเวลาในปฏิทินด้านล่างเพื่อสร้างนัดหมาย"}
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="break-words font-medium">{event.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-700">{formatEventRange(event.starts_at, event.ends_at)}</p>
                  {event.description && (
                    <p className="mt-1 whitespace-pre-line break-words text-sm text-zinc-600">{event.description}</p>
                  )}
                </div>
                {canCreateEvent && <DeleteEventForm groupId={group.id} eventId={event.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="ปฏิทินเวลาว่างของกลุ่ม" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">ปฏิทินกลาง</h2>
          <Link
            href={view === "all" ? basePath : `${basePath}?view=all`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100"
          >
            {view === "all" ? "แสดงเฉพาะ 06:00-24:00" : "แสดงทั้งวัน"}
          </Link>
        </div>
        <p className="text-sm text-zinc-700">
          กรอกเวลาว่างแล้ว {respondedCount} จาก {members.length} คน (เวลาประเทศไทย, ซ้ำทุกสัปดาห์)
        </p>

        {truncated && (
          <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            ข้อมูลเวลาว่างมีจำนวนมากเกินกว่าจะแสดงครบ ตัวเลขในตารางอาจต่ำกว่าความจริง
          </p>
        )}

        {respondedCount === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-700">
            <p>ยังไม่มีสมาชิกคนไหนกรอกเวลาว่าง</p>
            <Link
              href={`/groups/${group.id}/availability`}
              className="mt-2 inline-block rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700"
            >
              กรอกเวลาว่างของฉัน
            </Link>
          </div>
        )}

        <CalendarHeatmap
          groupId={group.id}
          grid={grid}
          slots={visibleSlots}
          members={members.map((member) => ({ userId: member.userId, displayName: member.displayName }))}
          startSlot={start}
          endSlot={end}
          nextDates={nextDates}
          canCreateEvent={canCreateEvent}
        />
      </section>
    </div>
  );
}
