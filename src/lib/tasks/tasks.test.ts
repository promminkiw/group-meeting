import { describe, expect, it } from "vitest";
import { classifyDeadline, classifyTaskDeadline, deadlineFilterBounds } from "./deadline";
import { describeTaskDbError, TASK_GENERIC_ERROR } from "./errors";
import { buildTaskQuery, hasActiveFilters, parseTaskFilters } from "./filters";
import { paginate } from "./pagination";
import { parseAssigneeIds, parseTaskInput } from "./validation";
import { computeSummary, computeWorkload, type AssigneeRow } from "./workload";

const USER_A = "123e4567-e89b-12d3-a456-426614174000";
const USER_B = "123e4567-e89b-12d3-a456-426614174001";
// 2026-10-03 15:00 เวลาไทย
const NOW = new Date("2026-10-03T08:00:00Z");

describe("parseTaskFilters", () => {
  it("ค่าเริ่มต้น", () => {
    expect(parseTaskFilters({})).toEqual({ page: 1 });
  });
  it("รับค่าที่ถูกต้องทั้งหมด", () => {
    expect(
      parseTaskFilters({ assignee: USER_A, status: "doing", deadline: "week", page: "3" }),
    ).toEqual({ assignee: USER_A, status: "doing", deadline: "week", page: 3 });
  });
  it("รับ assignee=me", () => {
    expect(parseTaskFilters({ assignee: "me" }).assignee).toBe("me");
  });
  it("ทิ้งค่าที่ไม่ถูกต้องโดยไม่ throw", () => {
    expect(
      parseTaskFilters({ assignee: "bad", status: "finished", deadline: "later", page: "abc" }),
    ).toEqual({ page: 1 });
  });
  it.each(["0", "-1", "1.5", "1e3", " ", "999999999999999999999", "100001"])("page %j -> 1", (page) => {
    expect(parseTaskFilters({ page }).page).toBe(1);
  });
  it("ใช้ค่าแรกเมื่อเป็น array และจัด uuid เป็นตัวพิมพ์เล็ก", () => {
    const parsed = parseTaskFilters({ status: ["done", "todo"], assignee: [USER_A.toUpperCase()] });
    expect(parsed.status).toBe("done");
    expect(parsed.assignee).toBe(USER_A);
  });
  it("ไม่รับ array ว่าง", () => {
    expect(parseTaskFilters({ status: [] })).toEqual({ page: 1 });
  });
});

describe("buildTaskQuery / hasActiveFilters", () => {
  it("ไม่มี filter ได้สตริงว่าง", () => {
    expect(buildTaskQuery({ page: 1 })).toBe("");
    expect(hasActiveFilters({ page: 2 })).toBe(false);
  });
  it("คง filter และเปลี่ยนหน้า", () => {
    expect(buildTaskQuery({ status: "todo", page: 1 }, { page: 2 })).toBe("?status=todo&page=2");
    expect(hasActiveFilters({ status: "todo", page: 1 })).toBe(true);
  });
});

describe("classifyDeadline", () => {
  it("ไม่มี deadline", () => {
    expect(classifyDeadline(null, "todo", NOW)).toBe("none");
  });
  it("งานที่ done ไม่นับ overdue", () => {
    expect(classifyDeadline("2026-10-01T00:00:00Z", "done", NOW)).toBe("completed");
  });
  it("เลยกำหนด", () => {
    expect(classifyDeadline("2026-10-03T07:59:59Z", "doing", NOW)).toBe("overdue");
  });
  it("วันนี้ตามเวลาไทยแต่ยังไม่ถึงเวลา", () => {
    expect(classifyDeadline("2026-10-03T16:59:00Z", "todo", NOW)).toBe("today");
  });
  it("เลยกำหนดภายในวันเดียวกันก็ยังเป็น overdue", () => {
    expect(classifyDeadline("2026-10-03T05:00:00Z", "todo", NOW)).toBe("overdue");
  });
  it("ขอบวัน: 17:00Z คือเที่ยงคืนไทยของวันถัดไป -> upcoming", () => {
    expect(classifyDeadline("2026-10-03T17:00:00Z", "todo", NOW)).toBe("upcoming");
  });
  it("วันนี้ตามเวลาไทย แม้ UTC เป็นคนละวัน", () => {
    const earlyThai = new Date("2026-10-02T18:00:00Z"); // 01:00 วันที่ 3 เวลาไทย
    expect(classifyDeadline("2026-10-03T10:00:00Z", "todo", earlyThai)).toBe("today");
  });
  it("deadline เสีย -> none", () => {
    expect(classifyDeadline("garbage", "todo", NOW)).toBe("none");
  });
});

describe("classifyTaskDeadline", () => {
  const past = "2026-10-01T00:00:00Z";
  it("ทุกคนเสร็จ -> completed", () => {
    expect(classifyTaskDeadline(past, ["done", "done"], NOW)).toBe("completed");
  });
  it("ยังมีคนค้าง -> overdue", () => {
    expect(classifyTaskDeadline(past, ["done", "doing"], NOW)).toBe("overdue");
  });
  it("ไม่มีผู้รับผิดชอบ -> ไม่ overdue", () => {
    expect(classifyTaskDeadline(past, [], NOW)).toBe("upcoming");
    expect(classifyTaskDeadline(null, [], NOW)).toBe("none");
  });
});

describe("computeSummary", () => {
  it("ว่าง", () => {
    expect(computeSummary([], NOW)).toEqual({ todo: 0, doing: 0, done: 0, overdue: 0 });
  });
  it("นับต่อสถานะและ overdue เฉพาะที่ยังไม่เสร็จ", () => {
    const rows: AssigneeRow[] = [
      { userId: USER_A, status: "todo", deadline: "2026-10-01T00:00:00Z" },
      { userId: USER_A, status: "doing", deadline: "2026-12-01T00:00:00Z" },
      { userId: USER_B, status: "done", deadline: "2026-10-01T00:00:00Z" },
      { userId: USER_B, status: "todo", deadline: null },
    ];
    expect(computeSummary(rows, NOW)).toEqual({ todo: 2, doing: 1, done: 1, overdue: 1 });
  });
});

describe("computeWorkload", () => {
  const members = [
    { userId: USER_A, displayName: "สมชาย" },
    { userId: USER_B, displayName: "สมหญิง" },
    { userId: "00000000-0000-4000-8000-000000000003", displayName: "ไม่มีงาน" },
  ];
  const rows: AssigneeRow[] = [
    { userId: USER_B, status: "todo", deadline: "2026-10-01T00:00:00Z" },
    { userId: USER_B, status: "doing", deadline: null },
    { userId: USER_A, status: "done", deadline: "2026-10-01T00:00:00Z" },
    { userId: "99999999-0000-4000-8000-000000000000", status: "todo", deadline: null },
  ];

  it("รวมสมาชิกที่ไม่มีงาน เรียงคนค้างมากสุดก่อน และไม่นับแถวของคนนอกกลุ่ม", () => {
    const result = computeWorkload(rows, members, NOW);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ userId: USER_B, todo: 1, doing: 1, done: 0, overdue: 1, open: 2 });
    const idle = result.find((r) => r.displayName === "ไม่มีงาน");
    expect(idle).toMatchObject({ todo: 0, doing: 0, done: 0, overdue: 0, open: 0 });
    const done = result.find((r) => r.userId === USER_A);
    expect(done).toMatchObject({ done: 1, overdue: 0, open: 0 });
  });
  it("ไม่มีสมาชิก -> ว่าง", () => {
    expect(computeWorkload(rows, [], NOW)).toEqual([]);
  });
  it("เสมอกันเรียงตามชื่อ", () => {
    const result = computeWorkload([], members, NOW);
    expect(result.map((r) => r.displayName)).toEqual(
      [...members.map((m) => m.displayName)].sort((a, b) => a.localeCompare(b, "th")),
    );
  });
});

describe("paginate", () => {
  it("ไม่มีข้อมูล -> 1 หน้า", () => {
    expect(paginate(0, 1, 20)).toMatchObject({ page: 1, totalPages: 1, offset: 0, limit: 20 });
  });
  it("หน้าที่สอง", () => {
    expect(paginate(45, 2, 20)).toMatchObject({ page: 2, totalPages: 3, offset: 20 });
  });
  it("หน้าเกินถูก clamp", () => {
    expect(paginate(45, 99, 20)).toMatchObject({ page: 3, offset: 40 });
  });
  it("พอดีเต็มหน้า", () => {
    expect(paginate(40, 2, 20).totalPages).toBe(2);
  });
  it("page ต่ำกว่า 1 หรือ NaN -> 1", () => {
    expect(paginate(45, 0, 20).page).toBe(1);
    expect(paginate(45, Number.NaN, 20).page).toBe(1);
  });
});

describe("parseTaskInput", () => {
  const base = { title: "ทำสไลด์", description: "", deadline: "" };
  it("ผ่านและแปลง deadline เป็น UTC", () => {
    const result = parseTaskInput({ ...base, deadline: "2026-10-03T14:30" });
    expect(result).toEqual({
      ok: true,
      value: { title: "ทำสไลด์", description: null, deadline: "2026-10-03T07:30:00.000Z" },
    });
  });
  it("ชื่อว่าง/ช่องว่างล้วน", () => {
    expect(parseTaskInput({ ...base, title: "   " }).ok).toBe(false);
  });
  it("ชื่อ 200 ผ่าน 201 ไม่ผ่าน", () => {
    expect(parseTaskInput({ ...base, title: "ก".repeat(200) }).ok).toBe(true);
    expect(parseTaskInput({ ...base, title: "ก".repeat(201) }).ok).toBe(false);
  });
  it("deadline รูปแบบผิด", () => {
    expect(parseTaskInput({ ...base, deadline: "tomorrow" }).ok).toBe(false);
  });
  it("รายละเอียดยาวเกิน", () => {
    expect(parseTaskInput({ ...base, description: "x".repeat(2001) }).ok).toBe(false);
  });
});

describe("parseAssigneeIds", () => {
  it("ตัดซ้ำ", () => {
    expect(parseAssigneeIds([USER_A, USER_A, USER_B])).toEqual([USER_A, USER_B]);
  });
  it("ว่างได้", () => {
    expect(parseAssigneeIds([])).toEqual([]);
  });
  it("ค่าที่ไม่ใช่ uuid -> null", () => {
    expect(parseAssigneeIds([USER_A, "nope"])).toBeNull();
  });
});

describe("describeTaskDbError", () => {
  it("assignee ไม่ใช่สมาชิก", () => {
    expect(describeTaskDbError({ message: "assignee must be a member of the task group" })).toContain(
      "สมาชิก",
    );
  });
  it("ซ้ำ", () => {
    expect(describeTaskDbError({ code: "23505", message: "dup" })).toContain("อยู่แล้ว");
  });
  it("ไม่รั่วรายละเอียดภายใน", () => {
    expect(describeTaskDbError({ code: "XX000", message: "relation public.tasks secret" })).toBe(
      TASK_GENERIC_ERROR,
    );
  });
});

describe("deadlineFilterBounds", () => {
  it("today: 00:00 ถึง 24:00 เวลาไทย", () => {
    expect(deadlineFilterBounds("today", NOW)).toEqual({
      from: "2026-10-02T17:00:00.000Z",
      to: "2026-10-03T17:00:00.000Z",
    });
  });
  it("week: 7 วันนับจากวันนี้", () => {
    expect(deadlineFilterBounds("week", NOW).to).toBe("2026-10-09T17:00:00.000Z");
  });
});
