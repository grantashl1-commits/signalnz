import { describe, it, expect } from "vitest";
import imageMaps from "@/data/image-maps.json";
import {
  PARTNER_PROGRAM,
  PARTNER_TURNS,
  fractionalSetsPerMuscle,
  getPartnerSession,
  getPartnerSessionsForWeek,
  type PartnerSession,
} from "@/data/partner-program";

const sessions = PARTNER_PROGRAM.sessions;
const EXERCISE_SLUGS = new Set(Object.keys(imageMaps.exercises));
const strengthIds = (s: PartnerSession) => s.stations.filter((st) => st.block === "Strength").map((st) => st.id);

describe("partner program structure", () => {
  it("has 24 sessions, 3 per week across 8 weeks, with stable ids", () => {
    expect(sessions).toHaveLength(24);
    const ids = sessions.map((s) => s.id);
    expect(new Set(ids).size).toBe(24);
    for (const s of sessions) {
      expect(s.id).toBe(`w${s.week}-s${s.index}`);
      expect(s.week).toBeGreaterThanOrEqual(1);
      expect(s.week).toBeLessThanOrEqual(8);
      expect(s.title).toBe(`Week ${s.week} · ${s.focus} · ${s.style}`);
    }
    for (let w = 1; w <= 8; w++) {
      expect(sessions.filter((s) => s.week === w).map((s) => s.index)).toEqual([1, 2, 3]);
    }
  });

  it("balances 12 upper and 12 lower sessions (odd weeks U-L-U, even weeks L-U-L)", () => {
    expect(sessions.filter((s) => s.focus === "Upper")).toHaveLength(12);
    expect(sessions.filter((s) => s.focus === "Lower")).toHaveLength(12);
    for (const s of sessions) {
      const upperFirst = s.week % 2 === 1;
      const expected = (s.index === 2) === upperFirst ? "Lower" : "Upper";
      expect(s.focus, s.id).toBe(expected);
    }
  });

  it("orders exactly 9 stations as 3 Strength, 3 Reformer, 3 Core with unique ids", () => {
    for (const s of sessions) {
      expect(s.rounds).toBe(2);
      expect(s.stations.map((st) => st.block)).toEqual([
        "Strength", "Strength", "Strength", "Reformer", "Reformer", "Reformer", "Core", "Core", "Core",
      ]);
      expect(new Set(s.stations.map((st) => st.id)).size, s.id).toBe(9);
    }
    expect(PARTNER_TURNS).toBe(9 * 2 * 2);
  });

  it("lands each session at roughly 45 minutes, matching its own timer settings", () => {
    for (const s of sessions) {
      expect(s.estMinutes, s.id).toBeGreaterThanOrEqual(40);
      expect(s.estMinutes, s.id).toBeLessThanOrEqual(50);
      const circuitMinutes = (PARTNER_TURNS * (s.workSeconds + s.transitionSeconds)) / 60;
      expect(s.estMinutes - circuitMinutes, s.id).toBeGreaterThanOrEqual(5);
      expect(s.estMinutes - circuitMinutes, s.id).toBeLessThanOrEqual(10);
    }
  });

  it("keeps the main lifts stable within each 2-week block so saved weights can progress", () => {
    for (const block of [[1, 2], [3, 4], [5, 6], [7, 8]]) {
      for (const focus of ["Upper", "Lower"] as const) {
        const group = sessions.filter((s) => block.includes(s.week) && s.focus === focus);
        expect(group).toHaveLength(3);
        const common = strengthIds(group[0]).filter((id) => group.every((s) => strengthIds(s).includes(id)));
        expect(common.length, `W${block[0]}-${block[1]} ${focus}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("progresses the back squat from higher reps to heavier sets, then deloads", () => {
    const squatTop = (id: string) => getPartnerSession(id)!.stations.find((st) => st.id === "barbell-back-squat")!.repRange![1];
    expect(squatTop("w1-s2")).toBe(12);
    expect(squatTop("w5-s2")).toBe(8);
    expect(squatTop("w7-s2")).toBe(6);
    expect(squatTop("w8-s1")).toBe(8);
  });
});

describe("partner program stations", () => {
  it("fills every tile field the grid needs", () => {
    for (const s of sessions) {
      for (const st of s.stations) {
        const where = `${s.id}/${st.id}`;
        expect(st.shortLabel.length, where).toBeLessThanOrEqual(22);
        expect(st.shortLabel, where).toBe(st.shortLabel.toUpperCase());
        expect(st.name.trim(), where).not.toBe("");
        expect(st.reps.trim(), where).not.toBe("");
        expect(st.load.trim(), where).not.toBe("");
        expect(st.cue.trim(), where).not.toBe("");
        expect(st.alt?.trim(), where).toBeTruthy();
        expect(st.equipment.length, where).toBeGreaterThan(0);
        expect(st.muscles.length, where).toBeGreaterThan(0);
        for (const m of st.muscles) expect(m, where).toBe(m.toLowerCase());
        if (st.repRange) expect(st.repRange[0], where).toBeLessThanOrEqual(st.repRange[1]);
      }
    }
  });

  it("only points imageKey at existing watercolour exercise art", () => {
    for (const s of sessions) {
      for (const st of s.stations) {
        if (st.imageKey) expect(EXERCISE_SLUGS.has(st.imageKey), `${s.id}/${st.id} → ${st.imageKey}`).toBe(true);
      }
    }
  });

  it("fits each prescription inside the class-timer work window", () => {
    const secondsPerRep = (tempo?: string, perSide?: boolean) => {
      const parts = tempo?.match(/^(\d)-(\d)-(\d|X)$/);
      if (parts) return Number(parts[1]) + Number(parts[2]) + (parts[3] === "X" ? 1 : Number(parts[3]));
      return perSide ? 2.5 : 3;
    };
    for (const s of sessions) {
      for (const st of s.stations) {
        const where = `${s.id}/${st.id} (${st.reps})`;
        if (st.timed) {
          const secs = Number(st.reps.match(/^(\d+) s/)?.[1]);
          expect(secs, where).toBeGreaterThan(0);
          expect(secs * (st.perSide ? 2 : 1), where).toBeLessThanOrEqual(s.workSeconds - 5);
        } else if (st.repRange) {
          const reps = st.repRange[1] * (st.perSide ? 2 : 1);
          expect(reps * secondsPerRep(st.tempo, st.perSide), where).toBeLessThanOrEqual(s.workSeconds + 5);
        }
      }
    }
  });

  it("gives every session warm-up, cool-down, treadmill and coaching guidance", () => {
    for (const s of sessions) {
      expect(s.warmup.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.cooldown.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.treadmill, s.id).toMatch(/RPE/);
      expect(s.coachNote.length, s.id).toBeGreaterThan(20);
    }
  });

  it("keeps brand names out of user-facing copy", () => {
    const { id: _id, ...copy } = PARTNER_PROGRAM;
    expect(JSON.stringify(copy)).not.toMatch(/\bBFT\b|Body Fit/i);
  });
});

describe("partner program volume", () => {
  it("reaches at least the time-efficient minimum of 4 fractional sets per muscle per week", () => {
    for (const block of [[1, 2], [3, 4], [5, 6], [7, 8]]) {
      const sets = fractionalSetsPerMuscle(sessions.filter((s) => block.includes(s.week)));
      for (const m of ["quads", "glutes", "hamstrings", "chest", "back", "shoulders"]) {
        expect(sets[m] / 2, `W${block[0]}-${block[1]} ${m}`).toBeGreaterThanOrEqual(4);
      }
    }
  });
});

describe("partner program helpers", () => {
  it("finds sessions by id and by week", () => {
    expect(getPartnerSession("w1-s1")?.focus).toBe("Upper");
    expect(getPartnerSession("w8-s3")?.style).toBe("Deload");
    expect(getPartnerSession("w9-s1")).toBeUndefined();
    expect(getPartnerSessionsForWeek(3).map((s) => s.id)).toEqual(["w3-s1", "w3-s2", "w3-s3"]);
    expect(getPartnerSessionsForWeek(9)).toEqual([]);
  });

  it("covers every week with a phase", () => {
    const weeks = PARTNER_PROGRAM.phases.flatMap((p) => p.weeks).sort((a, b) => a - b);
    expect(weeks).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(PARTNER_PROGRAM.evidence.length).toBeGreaterThanOrEqual(5);
  });
});
