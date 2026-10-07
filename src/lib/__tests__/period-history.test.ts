import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) } },
}));

import {
  getPeriodHistory, logPeriodStart, logPeriodEnd, removePeriod, getCycleStats, periodDayKind,
} from "@/lib/period-history";

describe("period history", () => {
  beforeEach(() => localStorage.clear());

  it("keeps previous months instead of overwriting", () => {
    logPeriodStart("2026-07-03");
    logPeriodStart("2026-07-31");
    logPeriodStart("2026-08-29");
    expect(getPeriodHistory().map((p) => p.start)).toEqual(["2026-07-03", "2026-07-31", "2026-08-29"]);
    expect(localStorage.getItem("cycleStartDate")).toBe("2026-08-29");
  });

  it("treats a start within 10 days of another as an edit, not a new period", () => {
    logPeriodStart("2026-08-29");
    logPeriodStart("2026-08-31");
    expect(getPeriodHistory()).toEqual([{ start: "2026-08-31" }]);
  });

  it("records end dates against the right period and computes averages", () => {
    logPeriodStart("2026-07-03"); logPeriodEnd("2026-07-07");
    logPeriodStart("2026-07-31"); logPeriodEnd("2026-08-05");
    logPeriodStart("2026-08-29");
    const s = getCycleStats();
    expect(s.cycleLengths).toEqual([28, 29]);
    expect(s.avgCycleLength).toBe(29);
    expect(s.avgPeriodLength).toBe(6); // (5 + 6) / 2 rounded
    expect(s.nextPredictedStart).toBe("2026-09-27");
  });

  it("marks logged and predicted days", () => {
    logPeriodStart("2026-08-29"); logPeriodEnd("2026-09-02");
    const s = getCycleStats();
    expect(periodDayKind("2026-08-30", s, "2026-09-10")).toBe("period");
    expect(periodDayKind("2026-09-03", s, "2026-09-10")).toBe(null);
    expect(periodDayKind("2026-09-26", s, "2026-09-10")).toBe("predicted");
  });

  it("migrates the old single-date model and can remove a period", () => {
    localStorage.setItem("cycleStartDate", "2026-09-01");
    localStorage.setItem("periodEnd:2026-09", "2026-09-05");
    expect(getPeriodHistory()).toEqual([{ start: "2026-09-01", end: "2026-09-05" }]);
    removePeriod("2026-09-01");
    expect(getPeriodHistory()).toEqual([]);
    expect(localStorage.getItem("cycleStartDate")).toBeNull();
  });
});
