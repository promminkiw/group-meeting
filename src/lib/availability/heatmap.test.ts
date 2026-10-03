import { describe, expect, it } from "vitest";
import {
  computeHeatmap,
  computeIntensity,
  getSlotDetail,
  slotIndexToTimeLabel,
} from "@/lib/availability/heatmap";

const slot = (userId: string, dayOfWeek: number, slotIndex: number) => ({
  userId,
  dayOfWeek,
  slotIndex,
});

describe("computeHeatmap", () => {
  it("returns a 7x48 grid of zeros for an empty group", () => {
    const grid = computeHeatmap([], []);
    expect(grid).toHaveLength(7);
    expect(grid.every((row) => row.length === 48)).toBe(true);
    expect(grid.flat().every((n) => n === 0)).toBe(true);
  });

  it("returns zeros when nobody is available", () => {
    const grid = computeHeatmap([], ["a", "b"]);
    expect(grid.flat().every((n) => n === 0)).toBe(true);
  });

  it("counts members per slot", () => {
    const grid = computeHeatmap(
      [slot("a", 1, 10), slot("b", 1, 10), slot("a", 1, 11)],
      ["a", "b"],
    );
    expect(grid[1][10]).toBe(2);
    expect(grid[1][11]).toBe(1);
  });

  it("counts duplicate rows once", () => {
    const grid = computeHeatmap([slot("a", 0, 5), slot("a", 0, 5)], ["a"]);
    expect(grid[0][5]).toBe(1);
  });

  it("ignores out-of-range day and slot values", () => {
    const grid = computeHeatmap(
      [slot("a", 7, 0), slot("a", -1, 0), slot("a", 0, 48), slot("a", 0, -1)],
      ["a"],
    );
    expect(grid.flat().every((n) => n === 0)).toBe(true);
  });

  it("ignores users outside the member list", () => {
    const grid = computeHeatmap([slot("x", 2, 2)], ["a"]);
    expect(grid[2][2]).toBe(0);
  });

  it("handles the boundary slots 0 and 47", () => {
    const grid = computeHeatmap([slot("a", 0, 0), slot("a", 6, 47)], ["a"]);
    expect(grid[0][0]).toBe(1);
    expect(grid[6][47]).toBe(1);
  });
});

describe("getSlotDetail", () => {
  it("splits members into available and unavailable", () => {
    const detail = getSlotDetail(
      [slot("a", 3, 20), slot("x", 3, 20)],
      ["a", "b"],
      3,
      20,
    );
    expect(detail.available).toEqual(["a"]);
    expect(detail.unavailable).toEqual(["b"]);
  });

  it("marks everyone unavailable when no slots match", () => {
    const detail = getSlotDetail([], ["a", "b"], 0, 0);
    expect(detail.available).toEqual([]);
    expect(detail.unavailable).toEqual(["a", "b"]);
  });

  it("does not list a duplicated user twice", () => {
    const detail = getSlotDetail(
      [slot("a", 0, 0), slot("a", 0, 0)],
      ["a"],
      0,
      0,
    );
    expect(detail.available).toEqual(["a"]);
  });
});

describe("slotIndexToTimeLabel", () => {
  it("formats slot indexes as HH:mm", () => {
    expect(slotIndexToTimeLabel(0)).toBe("00:00");
    expect(slotIndexToTimeLabel(1)).toBe("00:30");
    expect(slotIndexToTimeLabel(19)).toBe("09:30");
    expect(slotIndexToTimeLabel(47)).toBe("23:30");
  });
});

describe("computeIntensity", () => {
  it("returns the ratio of available members", () => {
    expect(computeIntensity(1, 4)).toBe(0.25);
    expect(computeIntensity(4, 4)).toBe(1);
    expect(computeIntensity(0, 4)).toBe(0);
  });

  it("returns 0 for an empty group", () => {
    expect(computeIntensity(0, 0)).toBe(0);
  });

  it("clamps to the 0-1 range", () => {
    expect(computeIntensity(5, 4)).toBe(1);
  });
});
