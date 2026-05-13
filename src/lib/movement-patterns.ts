/**
 * Movement pattern classifier — bucket exercises into the five primal
 * patterns (push, pull, hinge, squat, carry) plus cardio and mobility.
 * Used by ProgressTab to roll up volume trends from `workout_logs`.
 */
export type MovementPattern =
  | "push"
  | "pull"
  | "hinge"
  | "squat"
  | "carry"
  | "cardio"
  | "mobility";

const PATTERN_KEYWORDS: Record<MovementPattern, RegExp> = {
  push: /\b(push[- ]?up|bench|press|shoulder|dip|chest|overhead|ohp|pec|triceps?)\b/i,
  pull: /\b(pull[- ]?up|chin[- ]?up|row|pulldown|curl|lat|back|biceps?|face[- ]?pull|reverse fly)\b/i,
  hinge: /\b(deadlift|rdl|hip[- ]?thrust|hip hinge|good morning|swing|bridge|glute|hamstring)\b/i,
  squat: /\b(squat|lunge|split|step[- ]?up|leg press|pistol|wall sit|goblet)\b/i,
  carry: /\b(carry|farmer|suitcase|loaded carry|sled)\b/i,
  cardio: /\b(run|jog|sprint|bike|cycl|row(?!ing machine)?|swim|hiit|zone[- ]?2|tempo|interval|treadmill|cardio)\b/i,
  mobility: /\b(stretch|yoga|pilates|mobility|breath|cool[- ]?down|warm[- ]?up|foam[- ]?roll|fascia|restore)\b/i,
};

export const PATTERN_LABEL: Record<MovementPattern, string> = {
  push: "Push",
  pull: "Pull",
  hinge: "Hinge",
  squat: "Squat",
  carry: "Carry",
  cardio: "Cardio",
  mobility: "Mobility",
};

export function classifyExercise(name: string): MovementPattern | null {
  if (!name) return null;
  for (const [pattern, re] of Object.entries(PATTERN_KEYWORDS) as [MovementPattern, RegExp][]) {
    if (re.test(name)) return pattern;
  }
  return null;
}

/**
 * Walk an exercises[] payload (from workout_logs.exercises jsonb) and
 * return distinct patterns touched. We dedupe per session so a workout
 * with 4 push exercises still counts once toward "push days".
 */
export function patternsForSession(exercises: any[], fallbackName?: string): MovementPattern[] {
  const seen = new Set<MovementPattern>();
  for (const ex of exercises || []) {
    const name = (ex?.exercise_name || ex?.name || "") as string;
    const p = classifyExercise(name);
    if (p) seen.add(p);
  }
  if (seen.size === 0 && fallbackName) {
    const p = classifyExercise(fallbackName);
    if (p) seen.add(p);
  }
  return [...seen];
}
