/**
 * Merge session-level metadata from the Supabase CSV exports onto the
 * SIGNAL training paths at read time.
 *
 * The TS data files hold the canonical SIGNAL voice for descriptions,
 * coaching notes, and exercise structure. The CSV enrichment fills in
 * any session-level fields (warmup, cooldown, session notes) and any
 * phase-level fields (phaseGoal, RPE band) that aren't already set.
 * TS values always win — enrichment only fills empty slots.
 *
 * Re-run `node scripts/ingest-training-csvs.mjs` whenever the Supabase
 * tables change to refresh `src/data/training-csv-enrichment.json`.
 */
import enrichment from "@/data/training-csv-enrichment.json";
import type { TrainingPath } from "@/data/signal-training-paths";

interface CsvPhase {
  id: string;
  number: number;
  title: string;
  goal: string;
  rpeMin: number | null;
  rpeMax: number | null;
  weekStart: number | null;
  weekEnd: number | null;
}

interface CsvSession {
  id: string;
  phaseId: string;
  sessionNumber: number | null;
  dayLabel: string;
  title: string;
  warmupNotes: string;
  cooldownNotes: string;
  sessionNotes: string;
  estimatedMinutes: number | null;
}

interface CsvProgram {
  id: string;
  phases: CsvPhase[];
  sessions: CsvSession[];
}

const ENRICHMENT_BY_SIGNAL_ID = enrichment.programs as Record<string, CsvProgram | null>;

/**
 * Returns the path with any empty session-level / phase-level fields
 * filled in from the CSV enrichment. Sessions are matched by week + day
 * order: week N's day M is filled from the Mth CSV session of the Nth
 * matching phase.
 */
export function enrichTrainingPath(path: TrainingPath): TrainingPath {
  const data = ENRICHMENT_BY_SIGNAL_ID[path.id];
  if (!data) return path;

  // Map each TS week to a CSV phase by week-range overlap (best effort).
  return {
    ...path,
    weeks: path.weeks.map(week => {
      const phase = data.phases.find(p =>
        p.weekStart != null && p.weekEnd != null &&
        week.week >= p.weekStart && week.week <= p.weekEnd
      ) || data.phases[Math.min(data.phases.length - 1, Math.floor((week.week - 1) / 4))];

      const phaseSessions = phase
        ? data.sessions.filter(s => s.phaseId === phase.id)
        : data.sessions;

      return {
        ...week,
        phaseGoal: week.phaseGoal ?? phase?.goal ?? undefined,
        rpeMin: week.rpeMin ?? phase?.rpeMin ?? undefined,
        rpeMax: week.rpeMax ?? phase?.rpeMax ?? undefined,
        sessions: week.sessions.map((session, idx) => {
          const csv = phaseSessions[idx % Math.max(phaseSessions.length, 1)];
          if (!csv) return session;
          return {
            ...session,
            warmupNotes: session.warmupNotes ?? (csv.warmupNotes || undefined),
            cooldownNotes: session.cooldownNotes ?? (csv.cooldownNotes || undefined),
            sessionNotes: session.sessionNotes ?? (csv.sessionNotes || undefined),
          };
        }),
      };
    }),
  };
}

/** Convenience: enrich every path in the supplied list. */
export function enrichAllTrainingPaths(paths: TrainingPath[]): TrainingPath[] {
  return paths.map(enrichTrainingPath);
}

export const TRAINING_CSV_PROGRAMS = ENRICHMENT_BY_SIGNAL_ID;
