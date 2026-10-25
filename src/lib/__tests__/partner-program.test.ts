import { describe, it, expect } from "vitest";
import imageMaps from "@/data/image-maps.json";
import { getExerciseImageByName } from "@/lib/exercise-image-lookup";
import { getCorrectedExerciseArt } from "@/lib/corrected-exercise-art";
import {
  PARTNER_PROGRAM,
  PARTNER_TURNS,
  adaptForKit,
  barbellStations,
  fractionalSetsPerMuscle,
  getPartnerSession,
  getPartnerSessionsForWeek,
  stationWorkSeconds,
  type PartnerSession,
} from "@/data/partner-program";
import { PARTNER_PATH_ID, partnerSeries } from "@/data/training-paths/partner";

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

  it("lands each session at about 45–55 minutes, worked out from its own station timings", () => {
    for (const s of sessions) {
      expect(s.estMinutes, s.id).toBeGreaterThanOrEqual(40);
      expect(s.estMinutes, s.id).toBeLessThanOrEqual(55);
      const circuitMinutes = s.stations.reduce((sum, st) => sum + 2 * s.rounds * (stationWorkSeconds(s, st) + s.transitionSeconds), 0) / 60;
      expect(s.estMinutes - circuitMinutes, s.id).toBeGreaterThanOrEqual(5);
      expect(s.estMinutes - circuitMinutes, s.id).toBeLessThanOrEqual(10);
    }
  });

  it("gives all 24 sessions a distinct combination in each of the three blocks", () => {
    for (const block of ["Strength", "Reformer", "Core"] as const) {
      for (const focus of ["Upper", "Lower"] as const) {
        const signatures = sessions.filter(s => s.focus === focus).map(s =>
          s.stations.filter(st => st.block === block).map(st => st.id).sort().join("|"));
        expect(new Set(signatures).size, `${focus}/${block}`).toBe(12);
      }
    }
  });

  it("returns familiar exercises later for logged progression", () => {
    for (const focus of ["Upper", "Lower"] as const) {
      const ids = sessions.filter(s => s.focus === focus).flatMap(strengthIds);
      expect(new Set(ids).size).toBeLessThan(ids.length);
      expect(new Set(ids).size).toBeGreaterThanOrEqual(8);
    }
  });

  it("shares one barbell sensibly: at most 2 barbell stations and 1 rack lift per session", () => {
    for (const s of sessions) {
      const bars = barbellStations(s);
      expect(bars.length, s.id).toBeLessThanOrEqual(2);
      expect(bars.filter((st) => st.equipment.includes("rack")).length, s.id).toBeLessThanOrEqual(1);
      if (bars.length === 2) expect(s.coachNote, s.id).toMatch(/plates/);
    }
  });

  it("keeps Week 6 on the Week 5 lifts and reps (lifted fast), behind a power opener", () => {
    for (const id of ["w6-s1", "w6-s2", "w6-s3"]) {
      const [opener, ...mains] = getPartnerSession(id)!.stations.filter((st) => st.block === "Strength");
      expect(opener.rir, id).toBe("4–5");
      for (const st of mains) expect(st.repRange, `${id}/${st.id}`).toEqual([6, 8]);
    }
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

  it("gives every station an exercise illustration, never the stretch-figure fallback", () => {
    const local = imageMaps.exercises as Record<string, string>;
    const kit = sessions.flatMap((s) => [s, adaptForKit(s, { safeties: false })]);
    for (const s of kit) {
      for (const st of s.stations) {
        // Same order as StationArt: name match, then imageKey (the exercise DB is not available here).
        const src = getExerciseImageByName(st.name) ?? (st.imageKey ? local[st.imageKey] : undefined);
        expect(src, `${s.id}/${st.id}`).toBeTruthy();
      }
    }
  });

  it("fits each prescription inside its class-timer work window", () => {
    // Independent, conservative model: tempo seconds per rep (3 s, or 3.5 s per unilateral rep, when
    // none), series add every number, 6 s to switch sides and 8 s to unrack a barbell.
    const secondsPerRep = (st: PartnerSession["stations"][number]) => {
      const parts = st.tempo?.match(/^(\d)-(\d)-(\d|X)$/);
      if (parts) return Number(parts[1]) + Number(parts[2]) + (parts[3] === "X" ? 1 : Number(parts[3]));
      if (st.tempo) return 4;
      return st.perSide && st.block === "Strength" ? 3.5 : 3;
    };
    for (const s of sessions) {
      for (const st of s.stations) {
        const where = `${s.id}/${st.id} (${st.reps})`;
        const window = stationWorkSeconds(s, st);
        expect(window, where).toBeLessThanOrEqual(75);
        const sides = st.perSide ? 2 : 1;
        const extra = (st.perSide ? 6 : 0) + (st.equipment.includes("barbell") ? 8 : 0);
        if (st.timed) {
          const secs = Number(st.reps.match(/^(\d+) s/)?.[1]);
          expect(secs, where).toBeGreaterThan(0);
          expect(secs * sides + extra, where).toBeLessThanOrEqual(window);
        } else {
          const nums: string[] = st.reps.match(/\d+/g) ?? [];
          const reps = st.repRange ? st.repRange[1] : nums.reduce((n, x) => n + Number(x), 0);
          expect(reps, where).toBeGreaterThan(0);
          expect(reps * sides * secondsPerRep(st) + extra, where).toBeLessThanOrEqual(window + 5);
        }
      }
    }
  });

  it("keeps standing and lateral reformer work stable: medium springs or heavier, never a fast tempo", () => {
    for (const s of sessions) {
      for (const st of s.stations.filter((x) => x.standing)) {
        const where = `${s.id}/${st.id}`;
        expect(st.load, where).not.toMatch(/Springs: light/);
        expect(st.tempo ?? "", where).not.toMatch(/fast/);
        expect(st.cue, where).toMatch(/carriage home and still/);
      }
    }
  });

  it("puts the doming / pelvic-heaviness swap on every harder core station", () => {
    const ids = ["ball-pike", "ball-knee-tuck", "hollow-body-hold", "reverse-crunch", "renegade-row", "stir-the-pot", "plank-shoulder-tap"];
    for (const s of sessions) {
      for (const st of s.stations.filter((x) => ids.includes(x.id))) expect(st.cue, `${s.id}/${st.id}`).toMatch(/domes/);
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

  it("swaps the rack lifts for dumbbells (3+ in reserve) when the rack has no safeties", () => {
    for (const s of sessions) {
      expect(adaptForKit(s, { safeties: true })).toBe(s);
      expect(adaptForKit(s, { safeties: null })).toBe(s);
      const a = adaptForKit(s, { safeties: false });
      const ids = a.stations.map((st) => st.id);
      expect(ids, s.id).not.toContain("barbell-back-squat");
      expect(ids, s.id).not.toContain("barbell-bench-press");
      for (const st of a.stations.filter((x) => x.id === "db-goblet-squat" || (x.id === "db-bench-press" && s.week >= 5))) {
        expect(Number(st.rir?.match(/\d+/)?.[0]), `${s.id}/${st.id}`).toBeGreaterThanOrEqual(3);
      }
      expect(a.stations.map((st) => st.block)).toEqual(s.stations.map((st) => st.block));
    }
  });

  it("states the treadmill swap and spotter rules without contradicting itself", () => {
    expect(PARTNER_PROGRAM.summary).not.toMatch(/keep the belt at walking pace/);
    expect(PARTNER_PROGRAM.safety.join(" ")).toMatch(/side rails/);
    expect(PARTNER_PROGRAM.safety.join(" ")).toMatch(/need no spotter/);
  });

  it("keeps brand names out of user-facing copy", () => {
    const { id: _id, ...copy } = PARTNER_PROGRAM;
    expect(JSON.stringify(copy)).not.toMatch(/\bBFT\b|Body Fit/i);
  });
});

describe("partner program volume", () => {
  it("prescribes a loaded hinge in every lower lesson", () => {
    for (const session of sessions.filter((s) => s.focus === "Lower")) {
      expect(session.stations.filter((s) => ["db-rdl", "barbell-rdl", "db-single-leg-rdl"].includes(s.id))).toHaveLength(1);
    }
  });

  it("includes direct arm work across each upper fortnight", () => {
    for (const weeks of [[1, 2], [3, 4], [5, 6], [7, 8]]) {
      const group = sessions.filter(s => weeks.includes(s.week) && s.focus === "Upper");
      expect(group.some(s => s.stations.some(st => st.id === "reformer-biceps-curl"))).toBe(true);
      expect(group.some(s => s.stations.some(st => st.id === "reformer-overhead-triceps"))).toBe(true);
    }
  });
  it("includes calf resistance across each lower fortnight", () => {
    for (const weeks of [[1, 2], [3, 4], [5, 6], [7, 8]]) {
      const group = sessions.filter(s => weeks.includes(s.week) && s.focus === "Lower");
      expect(group.filter(s => s.stations.some(st => st.id === "reformer-calf-raise")).length).toBeGreaterThanOrEqual(1);
    }
  });
  it("averages at least 4 prescribed fractional credits per week across each fortnight, not hard sets", () => {
    for (const block of [[1, 2], [3, 4], [5, 6], [7, 8]]) {
      const sets = fractionalSetsPerMuscle(sessions.filter((s) => block.includes(s.week)));
      for (const m of ["quads", "glutes", "hamstrings", "chest", "back", "shoulders"]) {
        expect(sets[m] / 2, `W${block[0]}-${block[1]} ${m}`).toBeGreaterThanOrEqual(4);
      }
    }
  });
});

describe("partner corrected illustration coverage", () => {
  it("resolves every partner station and rack swap through exact art", () => {
    for (const session of sessions.flatMap((s) => [s, adaptForKit(s, { safeties: false })])) {
      for (const station of session.stations) {
        expect(getCorrectedExerciseArt(station.name), `${session.id}/${station.id}`).toBeTruthy();
      }
    }
  });
});

describe("partner series as a training path", () => {
  it("mirrors the 24 sessions as 8 weeks × 3 with Strength / Reformer / Core blocks", () => {
    expect(partnerSeries.id).toBe(PARTNER_PATH_ID);
    expect(partnerSeries.id).not.toMatch(/bft/i);
    expect(partnerSeries.weeks).toHaveLength(8);
    expect(partnerSeries.daysPerWeek).toBe(3);
    for (const w of partnerSeries.weeks) {
      expect(w.sessions.map((s) => s.day)).toEqual([1, 2, 3]);
      for (const s of w.sessions) {
        const source = getPartnerSession(`w${w.week}-s${s.day}`)!;
        expect(s.durationMin).toBe(source.estMinutes);
        expect(s.supersets!.map((b) => b.label)).toEqual(["Strength", "Reformer", "Core"]);
        expect(s.supersets!.every((b) => b.rounds === 2 && b.exercises.length === 3)).toBe(true);
        expect(s.supersets!.flatMap((b) => b.exercises.map((e) => e.name))).toEqual(source.stations.map((st) => st.name));
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
