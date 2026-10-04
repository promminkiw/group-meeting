import { CalendarPlus, Clock, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedFilter } from "@/components/ui/tabs";
import { formatEventRange, parseCalendarView, visibleSlotRange } from "@/lib/availability/display";
import { getGroupAvailability, getUpcomingEvents } from "@/lib/availability/dal";
import { computeHeatmap } from "@/lib/availability/heatmap";
import { getGroupContext } from "@/lib/groups/dal";
import { can } from "@/lib/permissions";
import { CalendarHeatmap } from "./calendar-heatmap";
import { DeleteEventForm } from "./delete-event-form";

const dayFormatter = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", month: "short" });

const SECTION_HEADING = "text-xl font-semibold leading-[1.4]";

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
  const respondedPercent = members.length === 0 ? 0 : Math.round((respondedCount / members.length) * 100);

  const canCreateEvent = can(role, "createEvent");
  const basePath = `/groups/${group.id}/calendar`;

  return (
    <div className="space-y-8">
      <PageHeader as="h2" title="ปฏิทิน" description="ดูนัดหมายและช่วงเวลาที่สมาชิกว่างตรงกัน" />

      <section aria-label="นัดหมายที่จะมาถึง" className="space-y-3">
        <h3 className={SECTION_HEADING}>นัดหมายที่จะมาถึง</h3>
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="ยังไม่มีนัดหมาย"
            description={
              canCreateEvent ? "เลือกช่องเวลาในปฏิทินด้านล่างเพื่อสร้างนัดหมาย" : "เมื่อมีนัดหมายใหม่จะแสดงที่นี่"
            }
          />
        ) : (
          <ul className="space-y-3">
            {events.map((event) => {
              const startsAt = new Date(event.starts_at);
              return (
                <Card as="li" key={event.id} padding="sm" className="flex flex-wrap items-start gap-4">
                  <div
                    aria-hidden="true"
                    className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-700"
                  >
                    <span className="text-lg font-bold leading-[1.2] tabular-nums">
                      {dayFormatter.format(startsAt)}
                    </span>
                    <span className="text-xs leading-[1.4]">{monthFormatter.format(startsAt)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-base font-semibold leading-[1.5]">{event.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-muted">
                      <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                      {formatEventRange(event.starts_at, event.ends_at)}
                    </p>
                    {event.description && (
                      <p className="mt-1 whitespace-pre-line break-words text-sm text-ink-muted">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {canCreateEvent && <DeleteEventForm groupId={group.id} eventId={event.id} title={event.title} />}
                </Card>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-label="ปฏิทินเวลาว่างของกลุ่ม" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className={SECTION_HEADING}>ปฏิทินกลาง</h3>
          <SegmentedFilter
            label="ช่วงเวลาที่แสดง"
            value={view}
            items={[
              { value: "default", label: "06:00-24:00", href: basePath },
              { value: "all", label: "ทั้งวัน", href: `${basePath}?view=all` },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">
              กรอกเวลาว่างแล้ว {respondedCount} จาก {members.length} คน
            </span>
            <span className="text-xs">(เวลาประเทศไทย, ซ้ำทุกสัปดาห์)</span>
          </p>
          <div
            role="img"
            aria-label={`กรอกแล้ว ${respondedCount} จาก ${members.length} คน`}
            className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-line"
          >
            <div className="h-full rounded-full bg-primary-600" style={{ width: `${respondedPercent}%` }} />
          </div>
        </div>

        {truncated && (
          <Alert tone="warning">
            ข้อมูลเวลาว่างมีจำนวนมากเกินกว่าจะแสดงครบ ตัวเลขในตารางอาจต่ำกว่าความจริง
          </Alert>
        )}

        {respondedCount === 0 && (
          <EmptyState
            icon={Clock}
            title="ยังไม่มีใครกรอกเวลาว่าง"
            description="ให้สมาชิกกรอกเวลาว่างก่อน ปฏิทินจะแสดงช่วงเวลาที่ว่างตรงกัน"
            action={
              <Button href={`/groups/${group.id}/availability`}>กรอกเวลาว่างของฉัน</Button>
            }
          />
        )}

        {/* Next 16 ไม่รวม search params ใน state key ของ segment จึงต้องใส่ key เองเพื่อล้างช่องที่เลือกเมื่อเปลี่ยน view */}
        <CalendarHeatmap
          key={view}
          groupId={group.id}
          grid={grid}
          slots={visibleSlots}
          members={members.map((member) => ({ userId: member.userId, displayName: member.displayName }))}
          startSlot={start}
          endSlot={end}
          canCreateEvent={canCreateEvent}
        />
      </section>
    </div>
  );
}
