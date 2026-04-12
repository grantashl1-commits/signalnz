import { describe, it, expect } from "vitest";
import {
  getPhaseFromDay,
  getWeekNumber,
  getCycleInfo,
  getCycleDayForDate,
  getNextPhase,
  getDaysUntilNextPhase,
  getPeriodLength,
} from "../cycle-utils";

describe("getPhaseFromDay", () => {
  it("returns menstrual for days 1-5", () => {
    expect(getPhaseFromDay(1)).toBe("menstrual");
    expect(getPhaseFromDay(3)).toBe("menstrual");
    expect(getPhaseFromDay(5)).toBe("menstrual");
  });

  it("returns follicular for days 6-13", () => {
    expect(getPhaseFromDay(6)).toBe("follicular");
    expect(getPhaseFromDay(10)).toBe("follicular");
    expect(getPhaseFromDay(13)).toBe("follicular");
  });

  it("returns ovulatory for day 14", () => {
    expect(getPhaseFromDay(14)).toBe("ovulatory");
  });

  it("returns luteal for days 15-28", () => {
    expect(getPhaseFromDay(15)).toBe("luteal");
    expect(getPhaseFromDay(21)).toBe("luteal");
    expect(getPhaseFromDay(28)).toBe("luteal");
  });

  it("returns luteal for days beyond 28", () => {
    expect(getPhaseFromDay(30)).toBe("luteal");
  });
});

describe("getWeekNumber", () => {
  it("returns correct week numbers", () => {
    expect(getWeekNumber(1)).toBe(1);
    expect(getWeekNumber(7)).toBe(1);
    expect(getWeekNumber(8)).toBe(2);
    expect(getWeekNumber(14)).toBe(2);
    expect(getWeekNumber(28)).toBe(4);
  });
});

describe("getCycleInfo", () => {
  it("returns default follicular when no period date provided", () => {
    const info = getCycleInfo(null);
    expect(info.phase).toBe("follicular");
    expect(info.cycleDay).toBe(8);
  });

  it("returns correct phase for a known start date", () => {
    // Set start date to today → should be day 1 = menstrual
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const info = getCycleInfo(dateStr);
    expect(info.cycleDay).toBe(1);
    expect(info.phase).toBe("menstrual");
    expect(info.day).toBe(1);
  });

  it("wraps around after 28 days", () => {
    const start = new Date();
    start.setDate(start.getDate() - 29); // 30 days ago → day ((29)%28)+1 = 2
    const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const info = getCycleInfo(dateStr);
    expect(info.cycleDay).toBe(2);
    expect(info.phase).toBe("menstrual");
  });
});

describe("getCycleDayForDate", () => {
  it("returns 1 on the start date itself", () => {
    const result = getCycleDayForDate("2025-01-01", new Date(2025, 0, 1));
    expect(result).toBe(1);
  });

  it("returns correct day offset", () => {
    const result = getCycleDayForDate("2025-01-01", new Date(2025, 0, 15));
    expect(result).toBe(15);
  });

  it("wraps around after 28 days", () => {
    const result = getCycleDayForDate("2025-01-01", new Date(2025, 0, 29));
    expect(result).toBe(1);
  });
});

describe("getNextPhase", () => {
  it("cycles through phases correctly", () => {
    expect(getNextPhase("menstrual").phase).toBe("follicular");
    expect(getNextPhase("follicular").phase).toBe("ovulatory");
    expect(getNextPhase("ovulatory").phase).toBe("luteal");
    expect(getNextPhase("luteal").phase).toBe("menstrual");
  });
});

describe("getDaysUntilNextPhase", () => {
  it("calculates remaining days in menstrual phase", () => {
    expect(getDaysUntilNextPhase(1, "menstrual")).toBe(5);
    expect(getDaysUntilNextPhase(5, "menstrual")).toBe(1);
  });

  it("calculates remaining days in luteal phase", () => {
    expect(getDaysUntilNextPhase(15, "luteal")).toBe(14);
    expect(getDaysUntilNextPhase(28, "luteal")).toBe(1);
  });
});

describe("getPeriodLength", () => {
  it("calculates days between two dates (inclusive)", () => {
    expect(getPeriodLength("2025-01-01", "2025-01-05")).toBe(5);
  });

  it("returns 1 for same date (inclusive)", () => {
    expect(getPeriodLength("2025-01-01", "2025-01-01")).toBe(1);
  });
});
