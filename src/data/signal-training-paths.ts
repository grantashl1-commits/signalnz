// Training paths live one-per-file in ./training-paths/ so each can be
// edited independently. This module keeps the original import surface.
import type { Session, Superset, TrainingPath } from "./training-paths/types";
import { strengthFromTheGroundUp } from "./training-paths/strength";
import { theForge } from "./training-paths/forge";
import { pilatesPlan } from "./training-paths/pilates";
import { restAndRestore } from "./training-paths/restore";
import { learnToRun } from "./training-paths/run";
import { cardioCircuit } from "./training-paths/cardio";
import { glutePower } from "./training-paths/glute";
import { partnerSeries, PARTNER_PATH_ID, partnerSessionHref } from "./training-paths/partner";

export type * from "./training-paths/types";
export { strengthFromTheGroundUp, theForge, pilatesPlan, restAndRestore, learnToRun, cardioCircuit, glutePower, partnerSeries, PARTNER_PATH_ID, partnerSessionHref };

// ─────────────────────────────────────────────────────────────────
// Aggregator + backwards-compat aliases
//
// Consumers (TrainingTab, training-path-utils, training-csv-enrichment,
// exercise-image-lookup) read from SIGNAL_TRAINING_PATHS and use the
// legacy DaySession / TrainingWeek / TrainingFocus type names. Each
// named TrainingPath above is appended below; any session that has
// supersets/warmup/coolDown but no structure[] gets a derived
// structure[] so the existing string-based renderer keeps working.
// ─────────────────────────────────────────────────────────────────


function flattenSupersetToLines(s: Superset): string[] {
  const lines: string[] = [];
  const round = s.rounds ? ` × ${s.rounds} rounds` : "";
  for (const ex of s.exercises) {
    const reps = typeof ex.reps === "number" ? `${ex.reps}` : ex.reps;
    const tempo = ex.tempo ? ` tempo ${ex.tempo}` : "";
    const weight = ex.weight ? ` @ ${ex.weight}` : "";
    const notes = ex.notes ? ` — ${ex.notes}` : "";
    lines.push(`${ex.name} – ${ex.sets}×${reps}${tempo}${weight}${notes}`);
  }
  if (round) lines[0] = `${lines[0]}${round}`;
  return lines;
}

/**
 * Materialise structure[] for any session that uses the new
 * supersets/warmup/coolDown shape, so the existing renderer + helpers
 * (image lookup, exercise library walker) keep working unchanged.
 */
function withStructure(session: Session): Session {
  if (session.structure && session.structure.length > 0) return session;
  const lines: string[] = [];
  if (session.warmup?.length) lines.push(...session.warmup.map(w => `Warm up: ${w}`));
  if (session.supersets?.length) {
    for (const ss of session.supersets) lines.push(...flattenSupersetToLines(ss));
  }
  if (session.coolDown?.length) lines.push(...session.coolDown.map(c => `Cool down: ${c}`));
  return { ...session, structure: lines.length > 0 ? lines : ["Rest"] };
}

function normalisePath(path: TrainingPath): TrainingPath {
  return {
    ...path,
    weeks: (path.weeks ?? []).map(w => ({
      ...w,
      sessions: Array.isArray((w as any).sessions)
        ? (w as any).sessions.map(withStructure)
        : [],
    })),
  };
}

/**
 * Canonical list of every SIGNAL training path. Order shapes the cards
 * shown on the /movement Training tab.
 */
export const SIGNAL_TRAINING_PATHS: TrainingPath[] = [
  strengthFromTheGroundUp,
  theForge,
  partnerSeries,
  learnToRun,
  pilatesPlan as unknown as TrainingPath,
  cardioCircuit,
  restAndRestore,
  glutePower,
].map(normalisePath);
