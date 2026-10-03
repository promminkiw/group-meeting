import { describe, expect, it } from "vitest";
import { can, isLastAdmin, type Action, type GroupRole } from "./index";

const ALL_ACTIONS: Action[] = [
  "viewGroup",
  "viewTasks",
  "createTask",
  "assignTask",
  "updateOwnTaskStatus",
  "inviteMember",
  "manageMembers",
  "createEvent",
  "fillAvailability",
  "deleteGroup",
  "leaveGroup",
];

const EXPECTED: Record<Exclude<GroupRole, null> | "none", Record<Action, boolean>> = {
  admin: {
    viewGroup: true,
    viewTasks: true,
    createTask: true,
    assignTask: true,
    updateOwnTaskStatus: true,
    inviteMember: true,
    manageMembers: true,
    createEvent: true,
    fillAvailability: true,
    deleteGroup: true,
    leaveGroup: true,
  },
  member: {
    viewGroup: true,
    viewTasks: true,
    createTask: false,
    assignTask: false,
    updateOwnTaskStatus: true,
    inviteMember: false,
    manageMembers: false,
    createEvent: false,
    fillAvailability: true,
    deleteGroup: false,
    leaveGroup: true,
  },
  none: {
    viewGroup: false,
    viewTasks: false,
    createTask: false,
    assignTask: false,
    updateOwnTaskStatus: false,
    inviteMember: false,
    manageMembers: false,
    createEvent: false,
    fillAvailability: false,
    deleteGroup: false,
    leaveGroup: false,
  },
};

const ROLES: [string, GroupRole, keyof typeof EXPECTED][] = [
  ["admin", "admin", "admin"],
  ["member", "member", "member"],
  ["ไม่ใช่สมาชิก (null)", null, "none"],
];

describe("can", () => {
  for (const [label, role, key] of ROLES) {
    describe(label, () => {
      it.each(ALL_ACTIONS)("%s", (action) => {
        expect(can(role, action)).toBe(EXPECTED[key][action]);
      });
    });
  }

  it("ตารางคาดหวังครอบคลุมทุก action", () => {
    for (const key of Object.keys(EXPECTED) as (keyof typeof EXPECTED)[]) {
      expect(Object.keys(EXPECTED[key]).sort()).toEqual([...ALL_ACTIONS].sort());
    }
  });
});

describe("isLastAdmin", () => {
  const admin = (userId: string) => ({ userId, role: "admin" as const });
  const member = (userId: string) => ({ userId, role: "member" as const });

  it("admin คนเดียวในกลุ่ม = true", () => {
    expect(isLastAdmin([admin("a"), member("b")], "a")).toBe(true);
  });

  it("admin คนเดียวและเป็นสมาชิกคนเดียว = true", () => {
    expect(isLastAdmin([admin("a")], "a")).toBe(true);
  });

  it("มี admin คนอื่นอยู่ = false", () => {
    expect(isLastAdmin([admin("a"), admin("b")], "a")).toBe(false);
  });

  it("member ธรรมดา = false", () => {
    expect(isLastAdmin([admin("a"), member("b")], "b")).toBe(false);
  });

  it("ไม่อยู่ในรายชื่อ = false", () => {
    expect(isLastAdmin([admin("a")], "zzz")).toBe(false);
  });

  it("รายชื่อว่าง = false", () => {
    expect(isLastAdmin([], "a")).toBe(false);
  });
});
