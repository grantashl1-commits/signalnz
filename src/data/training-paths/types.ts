export interface Exercise {
  name: string;
  sets: number;
  reps: number | string;
  tempo?: string;
  weight?: string;
  notes?: string;
  /** Home / no-equipment swap shown next to the exercise. */
  alt?: string;
  /** Target rep range for double progression, e.g. [8, 12]. */
  repRange?: [number, number];
  /** Reps in reserve target, e.g. "2-3". */
  rir?: string;
  /** One-line technique cue. */
  cue?: string;
}

export interface Superset {
  exercises: Exercise[];
  rounds: number;
  restAfterSuperset?: number; // seconds
  /** Optional display label for the block, e.g. "Main lift", "Finisher". */
  label?: string;
}

export interface Session {
  day: number;
  name: string;
  focus?: string;
  durationMin?: number;
  equipment?: string;
  feel?: string;
  warmup?: string[];
  supersets?: Superset[];
  coolDown?: string[];
  /** Lowercase alias of coolDown — both are accepted by the renderer. */
  cooldown?: string[];
  /** Marks pure rest / walk-and-restore days so the renderer can skip the table layout. */
  isRestDay?: boolean;
  /** Optional sessions (walks, extra conditioning) don't block plan progress. */
  optional?: boolean;
  /** Legacy flat-string structure used by some paths (Pilates, Rest & Restore, Glute Power weeks). */
  structure?: string[];
  coachingNote?: string;
  /** Optional session-level enrichment (filled at runtime from CSVs). */
  warmupNotes?: string;
  cooldownNotes?: string;
  sessionNotes?: string;
}

export interface Week {
  week: number;
  theme: string;
  progression: string;
  sessions: Session[];
  /** Optional phase-level enrichment from Supabase program_phases CSV. */
  phaseGoal?: string;
  rpeMin?: number;
  rpeMax?: number;
}

export interface TrainingPath {
  id: string;
  name: string;
  subtitle: string;
  /** Free-form so paths can be cardio-hybrids, glute-power, run, pilates, etc. */
  focus: string;
  description: string;
  whoItIsFor: string;
  weeks: Week[];
  /** 'home' = dumbbells/bands/mat, 'gym' = full gym, 'studio' = reformer studio. */
  equipmentLevel?: "none" | "home" | "gym" | "studio";
  /** Core (non-optional) sessions per week. */
  daysPerWeek?: number;
  /** Typical session length range in minutes. */
  sessionMinutes?: [number, number];
}

/** Legacy alias — equivalent to Session with optional structure[]. */
export type DaySession = Session;
export type TrainingWeek = Week;
export type TrainingFocus =
  | "strength"
  | "muscle"
  | "cardio"
  | "run"
  | "pilates"
  | "reformer"
  | "restore"
  | "hybrid"
  | "stress-relief"
  | "glute-power";
