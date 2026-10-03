import Link from "next/link";
import type { MemberWorkload, TaskSummary } from "@/lib/tasks/workload";

type Props = {
  groupId: string;
  currentUserId: string;
  summary: TaskSummary;
  workload: MemberWorkload[];
  truncated: boolean;
};

const SUMMARY_CARDS: { key: keyof TaskSummary; label: string; tone: string }[] = [
  { key: "todo", label: "ยังไม่เริ่ม", tone: "text-zinc-900" },
  { key: "doing", label: "กำลังทำ", tone: "text-blue-800" },
  { key: "done", label: "เสร็จแล้ว", tone: "text-green-800" },
  { key: "overdue", label: "เลยกำหนด", tone: "text-red-700" },
];

export function Dashboard({ groupId, currentUserId, summary, workload, truncated }: Props) {
  const tasksHref = (userId: string) => `/groups/${groupId}/tasks?assignee=${userId}`;
  const total = summary.todo + summary.doing + summary.done;

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-4">
      <h2 id="dashboard-heading" className="text-lg font-semibold">
        สรุปงาน
      </h2>
      <p className="text-xs text-zinc-600">นับเป็นจำนวนงานที่มอบหมายให้แต่ละคน (งานเดียวที่มีหลายคนนับหลายครั้ง)</p>
      {truncated && (
        <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          ข้อมูลงานมีจำนวนมาก ตัวเลขสรุปนี้อาจไม่ครบทั้งหมด
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <div key={card.key} className="rounded-xl border border-zinc-200 bg-white p-4">
            <dt className="text-sm text-zinc-600">{card.label}</dt>
            <dd className={`mt-1 text-2xl font-semibold ${card.tone}`}>{summary[card.key]}</dd>
          </div>
        ))}
      </dl>

      <h3 className="pt-2 text-base font-semibold">ใครค้างอะไร</h3>
      {total === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
          ยังไม่มีงานที่มอบหมาย
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 bg-white sm:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">จำนวนงานของสมาชิกแต่ละคนแยกตามสถานะ</caption>
              <thead className="border-b border-zinc-200 text-zinc-600">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">สมาชิก</th>
                  <th scope="col" className="px-4 py-2 font-medium">ยังไม่เริ่ม</th>
                  <th scope="col" className="px-4 py-2 font-medium">กำลังทำ</th>
                  <th scope="col" className="px-4 py-2 font-medium">เสร็จแล้ว</th>
                  <th scope="col" className="px-4 py-2 font-medium">เลยกำหนด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {workload.map((member) => (
                  <tr key={member.userId}>
                    <th scope="row" className="px-4 py-2 font-normal">
                      <Link href={tasksHref(member.userId)} className="break-words hover:underline">
                        {member.displayName}
                      </Link>
                      {member.userId === currentUserId && <span className="text-zinc-500"> (คุณ)</span>}
                    </th>
                    <td className="px-4 py-2">{member.todo}</td>
                    <td className="px-4 py-2">{member.doing}</td>
                    <td className="px-4 py-2">{member.done}</td>
                    <td className={`px-4 py-2 ${member.overdue > 0 ? "font-medium text-red-700" : ""}`}>
                      {member.overdue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 sm:hidden">
            {workload.map((member) => (
              <li key={member.userId} className="rounded-xl border border-zinc-200 bg-white p-4">
                <Link href={tasksHref(member.userId)} className="break-words font-medium hover:underline">
                  {member.displayName}
                  {member.userId === currentUserId && <span className="text-zinc-500"> (คุณ)</span>}
                </Link>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <dt className="text-zinc-600">ยังไม่เริ่ม</dt>
                  <dd>{member.todo}</dd>
                  <dt className="text-zinc-600">กำลังทำ</dt>
                  <dd>{member.doing}</dd>
                  <dt className="text-zinc-600">เสร็จแล้ว</dt>
                  <dd>{member.done}</dd>
                  <dt className="text-zinc-600">เลยกำหนด</dt>
                  <dd className={member.overdue > 0 ? "font-medium text-red-700" : ""}>{member.overdue}</dd>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
