import { describe, expect, it } from "vitest";
import type { PartnerSession, PartnerStation } from "@/data/partner-program";
import { backTurn, buildPrefill, commitTurn, createActiveClass, hrSummary, isClassComplete, remainingSeconds, restoreActiveClass, swapNow, tickClass, type ClassContext } from "../class-engine";

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
    // Partner B never logged a load, so they get the prescription.
    expect(buildPrefill(session, [])(1, a.records)).toEqual({ turn: 1, reps: "10", weight: "" });
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
