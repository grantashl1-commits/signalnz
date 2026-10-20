import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartnerSession, PartnerStation } from "@/data/partner-program";
import {
  PARTNER_PROGRESS_EVENT, addSessionLog, buildWorkoutLogRow, getNextSessionId, getPartnerProgress, getPartnerSettings,
  lastLogFor, markSessionDone, nextDumbbell, parseLoadKg, parsePartnerNotes, partnerNotes, repTarget, savePartnerProgress,
  savePartnerSettings, suggestNext, summarisePartner, totalTurns, turnAt,
  type PartnerProgress, type PartnerSessionLog, type PartnerTurnRecord,
} from "../partner-progress";

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
  it("alternates A and B at each station, two rounds, 36 turns", () => {
    expect(totalTurns(9, 2)).toBe(36);
    expect(turnAt(0)).toEqual({ round: 1, station: 0, worker: "A", treadmill: "B" });
    expect(turnAt(1)).toEqual({ round: 1, station: 0, worker: "B", treadmill: "A" });
    expect(turnAt(2)).toMatchObject({ round: 1, station: 1, worker: "A" });
    expect(turnAt(17)).toMatchObject({ round: 1, station: 8, worker: "B" });
    expect(turnAt(18)).toMatchObject({ round: 2, station: 0, worker: "A" });
    expect(turnAt(35)).toMatchObject({ round: 2, station: 8, worker: "B" });
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
    savePartnerSettings({ A: { name: "Sarah", age: 38 }, B: { name: "Jess", age: 41 }, mode: "timer", muted: true }, "u");
    expect(getPartnerSettings("u")).toEqual({ A: { name: "Sarah", age: 38 }, B: { name: "Jess", age: 41 }, mode: "timer", muted: true });
    expect(getPartnerSettings("other").mode).toBe("pace");
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
  it("parses loads and rep targets", () => {
    expect(parseLoadKg("12,5 kg")).toBe(12.5);
    expect(parseLoadKg("bar", true)).toBe(20);
    expect(parseLoadKg("medium springs")).toBeNull();
    expect(repTarget({ reps: "10 each side" })).toEqual([10, 10]);
    expect(repTarget({ reps: "8-12" })).toEqual([8, 12]);
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
  });
});
