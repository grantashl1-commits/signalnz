import { beforeEach, describe, expect, it, vi } from "vitest";
import { SIGNAL_TRAINING_PATHS, type TrainingPath } from "@/data/signal-training-paths";
import { getCorrectedExerciseArt } from "@/lib/corrected-exercise-art";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: async () => ({ data: { user: null } }) } } }));
const { getNextSession, markSessionCompleted } = await import("@/lib/training-path-utils");

const byId = (id: string) => SIGNAL_TRAINING_PATHS.find(p => p.id === id)!;
const EVIDENCE_PATHS = ["strength-from-the-ground-up", "the-forge", "glute-power", "mat-pilates", "reformer-strength"];
const training = (path: TrainingPath) => path.weeks.flatMap(w => w.sessions.filter(s => (s.durationMin ?? 0) > 0 && !s.optional && !s.isRestDay));

describe("evidence-based training paths", () => {
  it.each(EVIDENCE_PATHS)("%s: 8 weeks, the advertised days per week, sets match rounds, rest on every block", id => {
    const path = byId(id);
    expect(path.weeks).toHaveLength(8);
    for (const w of path.weeks) {
      const core = w.sessions.filter(s => (s.durationMin ?? 0) > 0 && !s.optional);
      expect(core, `${id} week ${w.week}`).toHaveLength(path.daysPerWeek!);
      for (const s of core) {
        expect(s.durationMin!).toBeLessThanOrEqual(path.sessionMinutes![1]);
        for (const b of s.supersets ?? []) {
          expect(b.restAfterSuperset, `${id} w${w.week} ${s.name}`).toBeGreaterThan(0);
          for (const e of b.exercises) expect(e.sets, `${id} w${w.week} ${s.name} ${e.name}`).toBe(b.rounds);
        }
      }
    }
  });

  it("trains push and pull at least twice a week in every strength path", () => {
    const PUSH = /press|push-up|push‑up/i;
    const PULL = /row|pulldown|pull-down|face pull|reverse fly/i;
    for (const id of ["strength-from-the-ground-up", "the-forge", "glute-power"]) {
      const w1 = byId(id).weeks[0].sessions.filter(s => s.supersets?.length && !s.optional);
      const has = (re: RegExp) => w1.filter(s => s.supersets!.some(b => b.exercises.some(e => re.test(e.name)))).length;
      expect(has(PUSH), `${id} push`).toBeGreaterThanOrEqual(2);
      expect(has(PULL), `${id} pull`).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps pilates classes to 30 minutes", () => {
    for (const s of training(byId("mat-pilates"))) expect(s.durationMin).toBe(30);
  });

  it("uses the shared reformer illustrations for the reformer path", () => {
    const names = new Set(training(byId("reformer-strength")).flatMap(s => s.supersets!.flatMap(b => b.exercises.map(e => e.name))));
    const withArt = [...names].filter(n => getCorrectedExerciseArt(n));
    expect(withArt.length).toBeGreaterThanOrEqual(10);
  });
});

describe("next session", () => {
  beforeEach(() => localStorage.clear());

  it("skips optional walks so the plan moves from day 1 to day 3", () => {
    const path = byId("strength-from-the-ground-up");
    expect(getNextSession(path)).toMatchObject({ week: 1, day: 1 });
    markSessionCompleted(path.id, 1, 1);
    expect(getNextSession(path)).toMatchObject({ week: 1, day: 3, totalSessions: 24 });
  });
});
