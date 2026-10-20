import { describe, expect, it } from "vitest";
import type { PartnerSession, PartnerStation } from "@/data/partner-program";
import { isPlausibleBpm, parseHeartRateMeasurement } from "@/hooks/useMultiHeartRate";
import { backTurn, buildPrefill, classTurns, commitTurn, createActiveClass, hrSummary, isClassComplete, remainingSeconds, restoreActiveClass, swapNow, tickClass, type ClassContext } from "../class-engine";

const st = (i: number): PartnerStation => ({
  id: `s${i}`, name: `Station ${i}`, shortLabel: `S${i}`, block: i < 3 ? "Strength" : i < 6 ? "Reformer" : "Core",
  reps: "8–10", repRange: [8, 10], load: "", equipment: i < 3 ? ["barbell"] : i < 6 ? ["reformer"] : ["bodyweight"], cue: "", muscles: [],
});
const session: PartnerSession = {
  id: "w1-s1", week: 1, index: 1, focus: "Lower", style: "Foundation", title: "Week 1 · Lower · Foundation",
  stations: Array.from({ length: 9 }, (_, i) => st(i)), rounds: 2, workSeconds: 3, transitionSeconds: 2,
  warmup: [], cooldown: [], treadmill: "Brisk walk", coachNote: "", estMinutes: 45,
};
const partners = { A: "Sarah", B: "Jess" };
const ctx: ClassContext = { session, prefill: buildPrefill(session, []) };
const start = (mode: "pace" | "timer" = "pace") => createActiveClass(ctx, { id: "c1", date: "2026-10-18", mode, partners });

describe("class engine", () => {
  it("logs 36 alternating turns and stops when complete", () => {
    let a = start();
    for (let i = 0; i < 36; i++) a = commitTurn(a, ctx);
    expect(isClassComplete(a, session)).toBe(true);
    expect(a.running).toBe(false);
    expect(a.records).toHaveLength(36);
    expect(a.records.map(r => r.partnerName).slice(0, 4)).toEqual(["Sarah", "Jess", "Sarah", "Jess"]);
    expect(a.records[18]).toMatchObject({ round: 2, exercise_id: "s0", partner: "A" });
    expect(commitTurn(a, ctx)).toBe(a);
  });

  it("prefills round 2 from the same partner's round 1 entry", () => {
    let a = start();
    a = { ...a, draft: { turn: 0, reps: "9", weight: "40 kg" } };
    for (let i = 0; i < 18; i++) a = commitTurn(a, ctx);
    expect(a.draft).toEqual({ turn: 18, reps: "9", weight: "40 kg" });
    // Partner B never logged anything: reps start empty (the target is only a placeholder).
    expect(buildPrefill(session, [])(1, a.records)).toEqual({ turn: 1, reps: "", weight: "" });
  });

  it("logs an untouched reps field as not logged, and a skipped station as not completed", () => {
    let a = start();
    a = commitTurn(a, ctx);
    expect(a.records[0]).toMatchObject({ reps: "", repsLogged: false, completed: true, style: "Foundation", target: [8, 10] });
    a = commitTurn({ ...a, draft: { turn: 1, reps: "", weight: "", skipped: true } }, ctx);
    expect(a.records[1]).toMatchObject({ partner: "B", completed: false });
    expect(backTurn(a).draft).toMatchObject({ turn: 1, skipped: true });
  });

  it("prefills the phase-adjusted load from history (deload week → about 75 %)", () => {
    const deload: PartnerSession = { ...session, id: "w8-s1", style: "Deload" };
    const history = [{ records: [{ exercise_id: "s0", exercise_name: "Station 0", block: "Strength" as const, partner: "A" as const, partnerName: "Sarah", round: 1, reps: "6", weight: "60 kg", completed: true, session_id: "w7-s2", style: "Peak" as const, target: [5, 6] as [number, number] }] }];
    expect(buildPrefill(deload, history, { partners })(0, [])).toEqual({ turn: 0, reps: "", weight: "45 kg" });
    // A different person in slot A does not inherit Sarah's load.
    expect(buildPrefill(deload, history, { partners: { A: "Kate", B: "Jess" } })(0, [])).toEqual({ turn: 0, reps: "", weight: "" });
  });

  it("runs work → swap → next turn in class-timer mode", () => {
    let a = start("timer");
    expect(remainingSeconds(a, session)).toBe(3);
    a = tickClass(a, ctx, 3);
    expect(a.phase).toBe("swap");
    expect(remainingSeconds(a, session)).toBe(2);
    a = tickClass(a, ctx, 2);
    expect(a.turn).toBe(1);
    expect(a.phase).toBe("work");
    expect(a.records[0]).toMatchObject({ partner: "A", seconds: 3 });
    expect(a.elapsed).toBe(5);
  });

  it("swap now skips to the swap phase, then commits", () => {
    let a = start("timer");
    a = swapNow(a, ctx);
    expect(a.phase).toBe("swap");
    a = swapNow(a, ctx);
    expect(a.turn).toBe(1);
  });

  it("finishes on the last turn without a swap phase (one tap, or when the timer runs out)", () => {
    const last = { ...start("timer"), turn: 35 };
    const tapped = swapNow(last, ctx);
    expect(isClassComplete(tapped, session)).toBe(true);
    expect(tapped.records).toHaveLength(1);
    const timed = tickClass(last, ctx, 3);
    expect(isClassComplete(timed, session)).toBe(true);
    expect(timed.elapsed).toBe(3);
  });

  it("uses each station's own work window in class-timer mode", () => {
    const sized: PartnerSession = { ...session, stations: session.stations.map((x, i) => (i === 0 ? { ...x, workSeconds: 7 } : x)) };
    const c: ClassContext = { session: sized };
    let a = createActiveClass(c, { id: "c2", date: "2026-10-18", mode: "timer", partners });
    expect(remainingSeconds(a, sized)).toBe(7);
    a = tickClass(a, c, 6);
    expect(a.phase).toBe("work");
    a = tickClass(a, c, 1);
    expect(a.phase).toBe("swap");
  });

  it("adds a third round of the strength stations: 42 turns ending on station 3", () => {
    const c: ClassContext = { session, prefill: buildPrefill(session, [], { extraRound: true }) };
    let a = createActiveClass(c, { id: "c3", date: "2026-10-18", mode: "pace", partners, extraRound: true });
    expect(classTurns(session, a)).toBe(42);
    for (let i = 0; i < 42; i++) a = commitTurn(a, c);
    expect(isClassComplete(a, session)).toBe(true);
    expect(a.records.slice(36).map(r => [r.round, r.exercise_id, r.partner])).toEqual([
      [3, "s0", "A"], [3, "s0", "B"], [3, "s1", "A"], [3, "s1", "B"], [3, "s2", "A"], [3, "s2", "B"],
    ]);
  });

  it("goes back one turn and restores the logged values", () => {
    let a = start();
    a = commitTurn({ ...a, draft: { turn: 0, reps: "8", weight: "42.5 kg" } }, ctx);
    a = backTurn(a);
    expect(a.turn).toBe(0);
    expect(a.records).toHaveLength(0);
    expect(a.draft).toEqual({ turn: 0, reps: "8", weight: "42.5 kg" });
  });

  it("tallies heart rate and effort minutes (zone 3+) per partner", () => {
    let a = start();
    a = tickClass(a, ctx, 120, { bpm: { A: 150, B: 100 }, maxHR: { A: 180, B: 180 } });
    expect(hrSummary(a.hr.A)).toEqual({ avg: 150, max: 150, effortMinutes: 2 });
    expect(hrSummary(a.hr.B)).toEqual({ avg: 100, max: 100, effortMinutes: 0 });
  });

  it("restores a saved class paused", () => {
    const saved = JSON.parse(JSON.stringify({ ...start(), turn: 5 }));
    expect(restoreActiveClass(saved, () => true)).toMatchObject({ turn: 5, running: false });
    expect(restoreActiveClass(saved, () => false)).toBeNull();
    expect(restoreActiveClass("nope", () => true)).toBeNull();
  });
});

describe("heart-rate measurement parsing (0x2A37)", () => {
  const view = (...bytes: number[]) => new DataView(new Uint8Array(bytes).buffer);
  it("reads 8- and 16-bit values and rejects short or implausible packets", () => {
    expect(parseHeartRateMeasurement(view(0x00, 72))).toBe(72);
    expect(parseHeartRateMeasurement(view(0x01, 0x90, 0x00))).toBe(144);
    // 16-bit flag but only 2 bytes: no RangeError, just no reading.
    expect(parseHeartRateMeasurement(view(0x01, 0x90))).toBeNull();
    expect(parseHeartRateMeasurement(view(0x00))).toBeNull();
    expect(isPlausibleBpm(parseHeartRateMeasurement(view(0x01, 0x2c, 0x01)))).toBe(false); // 300 bpm
    expect(isPlausibleBpm(0)).toBe(false);
    expect(isPlausibleBpm(150)).toBe(true);
  });
});
