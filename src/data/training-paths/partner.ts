import type { Session, TrainingPath, Week } from "./types";
import { PARTNER_PROGRAM, type PartnerSession, type PartnerStation, type StationBlock } from "../partner-program";

/**
 * The 8-week partner class series as a Training path, so it sits in Move →
 * Training paths and threads through Today like every other plan. The
 * programme itself (stations, loads, progression) lives in partner-program.ts;
 * this file only reshapes it. Completion comes from the partner hub's own
 * progress (see training-path-utils), and "Start" opens the partner class.
 */
export const PARTNER_PATH_ID = "partner-strength-series";

/** Deep link to the partner class hub for one session, e.g. `/movement?tab=partner&session=w3-s2`. */
export const partnerSessionHref = (week: number, day: number) => `/movement?tab=partner&session=w${week}-s${day}`;

const BLOCKS: StationBlock[] = ["Strength", "Reformer", "Core"];

function exercise(st: PartnerStation) {
  return {
    name: st.name,
    sets: 2,
    reps: st.reps,
    ...(st.tempo ? { tempo: st.tempo } : {}),
    ...(st.rir ? { rir: st.rir } : {}),
    ...(st.repRange ? { repRange: st.repRange } : {}),
    cue: st.cue,
    ...(st.alt ? { alt: st.alt } : {}),
  };
}

function toSession(s: PartnerSession): Session {
  return {
    day: s.index,
    name: `${s.focus} body · ${s.style}`,
    focus: "3 strength · 3 reformer · 3 core, 2 rounds, swapping with the treadmill",
    durationMin: s.estMinutes,
    equipment: "Rack, barbell, dumbbells, bench, reformer, treadmill",
    warmup: s.warmup,
    supersets: BLOCKS.map(block => ({
      label: block,
      rounds: s.rounds,
      exercises: s.stations.filter(st => st.block === block).map(exercise),
    })),
    coolDown: s.cooldown,
    coachingNote: s.coachNote,
  };
}

const weeks: Week[] = [...new Set(PARTNER_PROGRAM.sessions.map(s => s.week))].sort((a, b) => a - b).map(week => {
  const phase = PARTNER_PROGRAM.phases.find(p => p.weeks.includes(week));
  return {
    week,
    theme: phase?.name ?? `Week ${week}`,
    progression: phase ? `${phase.reps} reps · RIR ${phase.rir}` : "",
    ...(phase ? { phaseGoal: phase.goal } : {}),
    sessions: PARTNER_PROGRAM.sessions.filter(s => s.week === week).sort((a, b) => a.index - b.index).map(toSession),
  };
});

const minutes = PARTNER_PROGRAM.sessions.map(s => s.estMinutes);

export const partnerSeries: TrainingPath = {
  id: PARTNER_PATH_ID,
  name: "Partner Strength Series",
  subtitle: "Train together: 9 stations, one treadmill",
  // "hybrid" reuses the existing strength artwork.
  focus: "hybrid",
  description:
    "An 8-week class-style series for you and a friend. Each session is 3 strength, 3 reformer and 3 core stations for 2 rounds: one of you works a station while the other walks the treadmill, then you swap. Upper and lower days alternate (12 of each), loads are set by reps in reserve, and your saved weights suggest the next step every session.",
  whoItIsFor:
    "For two people training at home with a rack, barbell, dumbbells, a bench, a reformer and a treadmill, 3 times a week. Your walks are your extra cardio, so there's no separate cardio day.",
  weeks,
  equipmentLevel: "gym",
  daysPerWeek: 3,
  sessionMinutes: [Math.min(...minutes), Math.max(...minutes)],
};
