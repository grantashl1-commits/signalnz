import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPartnerSession, type PartnerSession, type PartnerStation } from "@/data/partner-program";
import { PARTNER_PATH_ID, partnerSeries } from "@/data/training-paths/partner";
import { getNextSession, getSelectedPath, markSessionCompleted, resetPathProgress, sessionStartHref, setSelectedPathId } from "@/lib/training-path-utils";
import {
  PARTNER_PROGRESS_EVENT, addSessionLog, buildWorkoutLogRow, getNextSessionId, getPartnerProgress, getPartnerSettings,
  lastLogFor, markSessionDone, nearestDumbbell, nextDumbbell, parseLoadKg, parsePartnerNotes, partnerCalories, partnerNotes, plannedLoad, repTarget, rowCounts,
  savePartnerProgress, savePartnerSettings, stationStartTurn, suggestNext, summarisePartner, totalTurns, turnAt,
  type PartnerProgress, type PartnerSessionLog, type PartnerTurnRecord,
} from "../partner-progress";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) }, from: () => ({ upsert: async () => ({}), insert: async () => ({}) }) },
}));

const station = (over: Partial<PartnerStation>): PartnerStation => ({
  id: "x", name: "X", shortLabel: "X", block: "Strength", reps: "8–10", load: "", equipment: ["barbell"], cue: "", muscles: [], ...over,
});
const session = (week: number, index: 1 | 2 | 3): PartnerSession => ({
  id: `w${week}-s${index}`, week, index, focus: index === 2 ? "Upper" : "Lower", style: "Strength", title: `Week ${week} · ${index}`,
  stations: [], rounds: 2, workSeconds: 60, transitionSeconds: 15, warmup: [], cooldown: [], treadmill: "", coachNote: "", estMinutes: 45,
});
const rec = (over: Partial<PartnerTurnRecord>): PartnerTurnRecord => ({
  exercise_id: "squat", exercise_name: "Barbell Back Squat", block: "Strength", partner: "A", partnerName: "Sarah", round: 1, reps: "10", weight: "40 kg", completed: true, ...over,
});
const log = (id: string, sessionId: string, date: string, records: PartnerTurnRecord[]): PartnerSessionLog => ({
  id, sessionId, title: sessionId, date, elapsed: 2700, mode: "pace", partners: { A: "Sarah", B: "Jess" }, records, turnsPlanned: 36, synced: false,
});
const empty = (): PartnerProgress => ({ completed: {}, logs: [] });

beforeEach(() => localStorage.clear());

describe("turn order", () => {
  it("does A, B, A, B at each station before moving on (36 turns)", () => {
    expect(totalTurns(9, 2)).toBe(36);
    expect(turnAt(0)).toEqual({ round: 1, station: 0, worker: "A", treadmill: "B" });
    expect(turnAt(1)).toEqual({ round: 1, station: 0, worker: "B", treadmill: "A" });
    expect(turnAt(2)).toEqual({ round: 2, station: 0, worker: "A", treadmill: "B" });
    expect(turnAt(3)).toEqual({ round: 2, station: 0, worker: "B", treadmill: "A" });
    expect(turnAt(4)).toEqual({ round: 1, station: 1, worker: "A", treadmill: "B" });
    expect(turnAt(34)).toMatchObject({ round: 2, station: 8, worker: "A" });
    expect(turnAt(35)).toMatchObject({ round: 2, station: 8, worker: "B" });
    expect(turnAt(99)).toMatchObject({ round: 2, station: 8, worker: "B" });
    expect(stationStartTurn(1)).toBe(4);
    expect(stationStartTurn(9)).toBe(36);
  });

  it("adds a third A/B pair at each strength station when asked (42 turns)", () => {
    expect(totalTurns(9, 2, 3)).toBe(42);
    expect(turnAt(4, 9, 2, 3)).toEqual({ round: 3, station: 0, worker: "A", treadmill: "B" });
    expect(turnAt(5, 9, 2, 3)).toMatchObject({ round: 3, station: 0, worker: "B" });
    expect(turnAt(6, 9, 2, 3)).toMatchObject({ round: 1, station: 1, worker: "A" });
    expect(turnAt(18, 9, 2, 3)).toMatchObject({ round: 1, station: 3, worker: "A" });
    expect(stationStartTurn(3, 9, 2, 3)).toBe(18);
    expect(turnAt(41, 9, 2, 3)).toMatchObject({ round: 2, station: 8, worker: "B" });
  });
});

describe("planned loads (nothing typed in class)", () => {
  it("starts from the 10 kg dumbbells and the 20 kg bar, climbs, then drops back for the deload", () => {
    const rdl = station({ name: "Dumbbell Romanian Deadlift", reps: "10–12", equipment: ["dumbbell"] });
    expect(plannedLoad(rdl, 1)).toMatchObject({ reps: "10–12", load: "10 kg dumbbells", kg: 10, kind: "dumbbell" });
    expect(plannedLoad(rdl, 3).kg).toBe(12);
    expect(plannedLoad(rdl, 5).kg).toBe(14);
    expect(plannedLoad(rdl, 7).kg).toBe(16);
    expect(plannedLoad(rdl, 8).kg).toBe(10);
    const squat = station({ name: "Barbell Back Squat", equipment: ["barbell", "rack"] });
    expect(plannedLoad(squat, 1)).toMatchObject({ load: "20 kg bar", kg: 20 });
    expect(plannedLoad(squat, 4)).toMatchObject({ load: "30 kg total (incl. bar)", kg: 30 });
    expect(plannedLoad(squat, 8).kg).toBeLessThan(plannedLoad(squat, 7).kg!);
    const bench = station({ name: "Barbell Bench Press", equipment: ["barbell", "bench", "rack"] });
    expect(plannedLoad(bench, 7).kg).toBeLessThan(plannedLoad(squat, 7).kg!);
  });
  it("keeps isolation moves lighter and single-bell moves heavier", () => {
    expect(plannedLoad(station({ name: "Dumbbell Lateral Raise", equipment: ["dumbbell"] }), 1).load).toBe("6 kg dumbbells");
    expect(plannedLoad(station({ name: "Goblet Squat", equipment: ["dumbbell"] }), 1).load).toBe("12 kg dumbbell");
  });
  it("shows springs for reformer work and nothing for bodyweight", () => {
    expect(plannedLoad(station({ block: "Reformer", equipment: ["reformer"], load: "Springs: medium. Brands differ, so log your setting." }), 2).load).toBe("Springs: medium");
    expect(plannedLoad(station({ block: "Core", reps: "30 s", equipment: ["bodyweight"] }), 2)).toMatchObject({ reps: "30 s", load: null });
  });
});

describe("calories", () => {
  it("uses heart rate where a strap was on and a moderate circuit estimate otherwise", () => {
    const withStrap = partnerCalories({ sum: 130 * 2700, count: 2700 }, 2700, { age: 38, weightKg: 65 });
    expect(withStrap.fromHR).toBe(true);
    // Keytel (women): (0.4472·130 − 0.1263·65 + 0.074·38 − 20.4022) / 4.184 ≈ 7.7 kcal/min × 45 min.
    expect(withStrap.kcal).toBe(348);
    const noStrap = partnerCalories(null, 2700, { weightKg: 65 });
    expect(noStrap.fromHR).toBe(false);
    expect(noStrap.kcal).toBe(256); // 5 MET × 3.5 × 65 / 200 × 45
    expect(partnerCalories({ sum: 0, count: 0 }, 0).kcal).toBe(0);
  });
});

describe("programme order", () => {
  const sessions = [session(2, 1), session(1, 3), session(1, 1), session(1, 2)];
  it("offers the first undone session in week/index order", () => {
    expect(getNextSessionId(empty(), sessions)).toBe("w1-s1");
    const p1 = markSessionDone(empty(), "w1-s1", "2026-10-18", "log-1");
    expect(getNextSessionId(p1, sessions)).toBe("w1-s2");
    // Out of order is allowed; the earliest gap is still offered next.
    const p2 = markSessionDone(p1, "w1-s3", "2026-10-19", "log-2");
    expect(getNextSessionId(p2, sessions)).toBe("w1-s2");
  });
  it("returns null when every session is done", () => {
    const all = sessions.reduce((p, s) => markSessionDone(p, s.id, "2026-10-18", s.id), empty());
    expect(getNextSessionId(all, sessions)).toBeNull();
  });
  it("upserts logs by id and only ticks the session when counted", () => {
    const a = addSessionLog(empty(), log("l1", "w1-s1", "2026-10-18", []), false);
    expect(a.completed["w1-s1"]).toBeUndefined();
    const b = addSessionLog(a, { ...log("l1", "w1-s1", "2026-10-18", [rec({})]), synced: true });
    expect(b.logs).toHaveLength(1);
    expect(b.logs[0].records).toHaveLength(1);
    expect(b.completed["w1-s1"]).toEqual({ date: "2026-10-18", logId: "l1" });
  });
});

describe("storage", () => {
  it("keeps progress per user and announces changes", () => {
    const spy = vi.fn();
    window.addEventListener(PARTNER_PROGRESS_EVENT, spy);
    expect(savePartnerProgress(markSessionDone(empty(), "w1-s1", "2026-10-18", "l1"), "user-1")).toBe(true);
    window.removeEventListener(PARTNER_PROGRESS_EVENT, spy);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(getPartnerProgress("user-1").completed["w1-s1"]).toBeTruthy();
    expect(getPartnerProgress("user-2").completed).toEqual({});
    expect(localStorage.getItem("signal_partner_program_v1:user-1")).toContain("w1-s1");
  });
  it("survives corrupt storage", () => {
    localStorage.setItem("signal_partner_program_v1:guest", "{not json");
    expect(getPartnerProgress()).toEqual({ completed: {}, logs: [] });
  });
  it("round-trips partner settings", () => {
    const saved = { A: { name: "Sarah", age: 38, weightKg: 64 }, B: { name: "Jess", age: 41, weightKg: null }, mode: "timer" as const, muted: true, safeties: false, extraRound: true };
    savePartnerSettings(saved, "u");
    expect(getPartnerSettings("u")).toEqual(saved);
    expect(getPartnerSettings("other")).toMatchObject({ mode: "pace", safeties: null, extraRound: false });
  });
});

describe("lastLogFor", () => {
  const logs = [
    log("1", "w1-s1", "2026-10-01", [rec({ weight: "35 kg" }), rec({ partner: "B", weight: "30 kg" })]),
    log("2", "w1-s3", "2026-10-05", [rec({ weight: "40 kg" }), rec({ partner: "B", weight: "32.5 kg" })]),
  ];
  it("finds the partner's most recent set of that exercise", () => {
    expect(lastLogFor(logs, "A", "squat")?.weight).toBe("40 kg");
    expect(lastLogFor(logs, "B", "squat")?.weight).toBe("32.5 kg");
    expect(lastLogFor(logs, "A", "bench")).toBeUndefined();
  });
  it("matches older logs by exercise name", () => {
    expect(lastLogFor(logs, "A", "barbell-back-squat", "barbell back squat")?.weight).toBe("40 kg");
  });
  it("follows the person, not the slot: a new friend in slot B does not inherit Jess's loads", () => {
    const named = [log("1", "w1-s1", "2026-10-01", [rec({ weight: "40 kg" }), rec({ partner: "B", partnerName: "Jess", weight: "30 kg" })])];
    expect(lastLogFor(named, "B", "squat", undefined, "Jess")?.weight).toBe("30 kg");
    expect(lastLogFor(named, "B", "squat", undefined, "Kate")).toBeUndefined();
    // Swapped slots: Jess is now partner A and still gets her own numbers.
    expect(lastLogFor(named, "A", "squat", undefined, "jess")?.weight).toBe("30 kg");
    // Default names fall back to the slot.
    expect(lastLogFor(named, "B", "squat", undefined, "Partner B")?.weight).toBe("30 kg");
  });
  it("ignores skipped stations", () => {
    const skipped = [log("1", "w1-s1", "2026-10-01", [rec({ weight: "40 kg" })]), log("2", "w1-s3", "2026-10-05", [rec({ weight: "", completed: false })])];
    expect(lastLogFor(skipped, "A", "squat")?.weight).toBe("40 kg");
    expect(summarisePartner(skipped[1].records, "A").sets).toBe(0);
  });
});

describe("double progression", () => {
  const squat = station({ reps: "8–10", repRange: [8, 10], equipment: ["barbell", "rack"] });
  it("adds 2.5 kg to the bar once the top of the range is hit", () => {
    expect(suggestNext(squat, { reps: "10", weight: "40 kg" })).toMatchObject({ text: "Last: 10 @ 40 kg · try 42.5 kg", weight: "42.5 kg", kind: "increase" });
  });
  it("keeps the load and adds a rep below the top", () => {
    expect(suggestNext(squat, { reps: "8", weight: "40" })).toMatchObject({ text: "Last: 8 @ 40 kg · same load, aim for 9", kind: "repeat" });
  });
  it("moves to the next available dumbbell, capped at 25 kg", () => {
    const press = station({ reps: "10–12", equipment: ["dumbbell", "bench"] });
    expect(suggestNext(press, { reps: "12", weight: "12 kg per DB" })?.weight).toBe("14 kg");
    expect(suggestNext(press, { reps: "12", weight: "25" })?.kind).toBe("technique");
    expect(nextDumbbell(10)).toBe(12);
    expect(nextDumbbell(25)).toBeNull();
  });
  it("suggests a spring or slower tempo on the reformer", () => {
    const footwork = station({ block: "Reformer", reps: "12", equipment: ["reformer"] });
    expect(suggestNext(footwork, { reps: "12", weight: "2 red" })?.text).toBe("Last: 12 @ 2 red · add a spring / slow the tempo");
  });
  it("adds 5 s to timed holds", () => {
    const plank = station({ block: "Core", reps: "30 s each side", timed: true, equipment: ["bodyweight"] });
    expect(suggestNext(plank, { reps: "30 s", weight: "" })).toMatchObject({ text: "Last: 30 s · try 35 s", reps: "35 s" });
  });
  it("returns null without a previous log", () => {
    expect(suggestNext(squat, undefined)).toBeNull();
  });
  it("never reads an unlogged rep count as hitting the top of the range", () => {
    expect(suggestNext(squat, { reps: "", weight: "40 kg", repsLogged: false })).toMatchObject({ kind: "repeat", weight: "40 kg" });
    expect(suggestNext(squat, { reps: "", weight: "", repsLogged: false })).toBeNull();
  });
  it("parses loads and rep targets", () => {
    expect(parseLoadKg("12,5 kg")).toBe(12.5);
    expect(parseLoadKg("bar", true)).toBe(20);
    expect(parseLoadKg("bar + 10 a side", true)).toBe(40);
    expect(parseLoadKg("bar + 2.5kg each side")).toBe(25);
    expect(parseLoadKg("2 x 10kg")).toBe(10);
    expect(parseLoadKg("2×12")).toBe(12);
    expect(parseLoadKg("medium springs")).toBeNull();
    expect(repTarget({ reps: "10 each side" })).toEqual([10, 10]);
    expect(repTarget({ reps: "8-12" })).toEqual([8, 12]);
  });
});

describe("phase-aware suggestions (real stations)", () => {
  const st = (sid: string, id: string) => getPartnerSession(sid)!.stations.find((x) => x.id === id)!;
  const last = (sid: string, id: string, reps: string, weight: string): PartnerTurnRecord =>
    rec({ exercise_id: id, session_id: sid, reps, weight });

  it("Pump → Strength: fewer reps, so the bar goes up about 5 kg (not just 2.5)", () => {
    const s = suggestNext(st("w5-s2", "barbell-back-squat"), last("w3-s2", "barbell-back-squat", "12", "40 kg"), { style: "Strength" });
    expect(s).toMatchObject({ weight: "45 kg", reps: "6", kind: "adjust" });
  });
  it("Power week: reaching the top of its rep range allows normal double progression", () => {
    const s = suggestNext(st("w6-s2", "db-bench-press"), last("w6-s2", "db-bench-press", "8", "12 kg"), { style: "Power" });
    expect(s).toMatchObject({ weight: "14 kg", kind: "increase" });
  });
  it("Week 6 → Peak: heavier for 5–6 reps (about Week 5 + 2.5–5 kg)", () => {
    const s = suggestNext(st("w7-s2", "barbell-rdl"), last("w5-s2", "barbell-rdl", "6", "45 kg"), { style: "Peak" });
    expect(s).toMatchObject({ weight: "47.5 kg", reps: "5", kind: "adjust" });
    const top = suggestNext(st("w7-s2", "barbell-rdl"), last("w5-s2", "barbell-rdl", "8", "50 kg"), { style: "Peak" });
    expect(top?.weight).toBe("55 kg");
  });
  it("Peak → Deload: about 75 % of the heavy week, never the same load", () => {
    const s = suggestNext(st("w8-s3", "barbell-back-squat"), last("w6-s3", "barbell-back-squat", "6", "52.5 kg"), { style: "Deload" });
    expect(s).toMatchObject({ weight: "40 kg", kind: "adjust" });
    const db = suggestNext(st("w8-s2", "seated-db-shoulder-press"), last("w7-s1", "seated-db-shoulder-press", "8", "12 kg"), { style: "Deload" });
    expect(db?.weight).toBe("9 kg");
    // Second deload session: stays light.
    expect(suggestNext(st("w8-s3", "barbell-back-squat"), last("w8-s3", "barbell-back-squat", "8", "40 kg"), { style: "Deload" })?.kind).toBe("repeat");
  });
  it("dumbbells step to the nearest bell after a rep drop", () => {
    expect(nearestDumbbell(13.9)).toBe(14);
    expect(nearestDumbbell(11)).toBe(10);
    // Split squats are 6–8 each side in both blocks: same range, so plain double progression.
    const s = suggestNext(st("w5-s2", "db-bulgarian-split-squat"), last("w4-s1", "db-bulgarian-split-squat", "7", "12 kg"), { style: "Strength" });
    expect(s).toMatchObject({ kind: "repeat", weight: "12 kg" });
  });
});

describe("partner series in Training paths", () => {
  it("takes next session and completion from the partner hub, and deep-links Start", () => {
    setSelectedPathId(PARTNER_PATH_ID);
    expect(getSelectedPath()?.id).toBe(PARTNER_PATH_ID);
    let p = markSessionDone(empty(), "w1-s1", "2026-10-18", "l1");
    p = markSessionDone(p, "w1-s2", "2026-10-20", "l2");
    savePartnerProgress(p, "user-1");
    const info = getNextSession(partnerSeries, { userId: "user-1" })!;
    expect(`w${info.week}-s${info.day}`).toBe(getNextSessionId(getPartnerProgress("user-1")));
    expect(info).toMatchObject({ week: 1, day: 3, completedCount: 2, totalSessions: 24, finished: false });
    expect(sessionStartHref(info)).toBe("/movement?tab=partner&session=w1-s3");
    // Another user (or a guest) has their own progress.
    expect(getNextSession(partnerSeries, { userId: "user-2" })).toMatchObject({ week: 1, day: 1, completedCount: 0 });
  });
  it("never double-logs through the generic path logger, and restarting keeps saved weights", () => {
    markSessionCompleted(PARTNER_PATH_ID, 1, 1);
    expect(localStorage.getItem("signal_path_completed_sessions")).toBeNull();
    const withLog = addSessionLog(empty(), log("l1", "w1-s1", "2026-10-18", [rec({})]));
    savePartnerProgress(withLog, "user-1");
    resetPathProgress(PARTNER_PATH_ID, "user-1");
    expect(getPartnerProgress("user-1").completed).toEqual({});
    expect(getPartnerProgress("user-1").logs).toHaveLength(1);
  });
});

describe("summaries and cloud rows", () => {
  it("totals kg moved per partner, skipping reformer springs", () => {
    const records = [rec({ reps: "10", weight: "40 kg", seconds: 50 }), rec({ reps: "12", weight: "2 red", block: "Reformer", seconds: 40 }), rec({ partner: "B", reps: "8", weight: "30" })];
    expect(summarisePartner(records, "A")).toEqual({ sets: 2, kg: 400, seconds: 90 });
    expect(summarisePartner(records, "B")).toEqual({ sets: 1, kg: 240, seconds: 0 });
  });
  it("writes workout_logs rows with the Partner circuit prefix and a recoverable session id", () => {
    const s = { week: 2, index: 1 as const, focus: "Upper" as const, style: "Pump" as const };
    const row = buildWorkoutLogRow({ ...log("l9", "w2-s1", "2026-10-18", [rec({})]), hr: { A: { avg: 132, max: 171, effortMinutes: 18 } } }, "user-1", s);
    expect(row.notes).toBe("Partner circuit · Week 2 · Session 1 · Upper · Pump");
    expect(row.notes!.startsWith("Partner circuit · ")).toBe(true);
    expect(row).toMatchObject({ id: "l9", user_id: "user-1", session_date: "2026-10-18", duration_minutes: 45, completed: true, avg_bpm: 132, max_bpm: 171 });
    expect((row.exercises as Array<{ session_id: string }>)[0].session_id).toBe("w2-s1");
    expect(parsePartnerNotes(partnerNotes(s))).toBe("w2-s1");
    expect(parsePartnerNotes("Partner circuit · Lower body · Strength · 2 rounds")).toBeNull();
    expect(rowCounts(row)).toBe(true);
  });
  it("keeps an unticked save unticked on every device", () => {
    const s = { week: 1, index: 3 as const, focus: "Upper" as const, style: "Foundation" as const };
    const row = buildWorkoutLogRow({ ...log("l10", "w1-s3", "2026-10-18", [rec({})]), counted: false }, "user-1", s);
    expect(row.notes).toBe("Partner circuit · Week 1 · Session 3 · Upper · Foundation · not counted");
    expect(parsePartnerNotes(row.notes)).toBe("w1-s3");
    expect((row.exercises as Array<{ counted: boolean }>)[0].counted).toBe(false);
    expect(rowCounts(row)).toBe(false);
    expect(rowCounts({ notes: "Partner circuit · Week 1 · Session 3 · Upper · Foundation", exercises: [{ counted: false }] })).toBe(false);
  });
});
