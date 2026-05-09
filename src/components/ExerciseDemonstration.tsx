import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import MuscleIllustration from "@/components/movement/MuscleIllustration";

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
  /** Optional explicit target muscle override. If provided, skips the DB lookup. */
  targetMuscle?: string | null;
  /** Legacy prop kept for back-compat — accepted but ignored. We now render anatomy. */
  imageUrl?: string | null;
}

// ── Global exercise→target cache (name → primary muscle / target string) ──
let targetMap: Map<string, string> | null = null;
let loadingPromise: Promise<void> | null = null;

function ensureTargetMap(): Promise<void> {
  if (targetMap) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const map = new Map<string, string>();
    let from = 0;
    const batchSize = 1000;
    while (true) {
      const { data } = await supabase
        .from("exercises")
        .select("name, target, primary_muscles, body_part")
        .range(from, from + batchSize - 1);
      if (!data || data.length === 0) break;
      for (const row of data) {
        const target =
          row.target ||
          (Array.isArray(row.primary_muscles) && row.primary_muscles[0]) ||
          row.body_part ||
          "";
        if (row.name) map.set(row.name.toLowerCase(), String(target));
      }
      if (data.length < batchSize) break;
      from += batchSize;
    }
    targetMap = map;
  })();

  return loadingPromise;
}

/**
 * Fallback heuristic — guess the muscle group directly from the exercise
 * name when the DB has no record (e.g. exercises that only live inside
 * the static training-path data).
 */
function guessTargetFromName(name: string): string {
  const n = name.toLowerCase();
  if (/(squat|lunge|step[- ]?up|wall sit|leg press)/.test(n)) return "quadriceps";
  if (/(deadlift|rdl|hinge|good morning|hamstring)/.test(n)) return "hamstrings";
  if (/(hip thrust|glute|bridge|kickback|clamshell|donkey)/.test(n)) return "glutes";
  if (/(calf|heel raise|gastrocnemius)/.test(n)) return "calves";
  if (/(push[- ]?up|bench|chest|dip\b|fly)/.test(n)) return "chest";
  if (/(row|pull[- ]?up|lat |pulldown|deadhang)/.test(n)) return "lats";
  if (/(press|shoulder|lateral raise|arnold|overhead|upright row)/.test(n)) return "shoulders";
  if (/(curl)/.test(n)) return "biceps";
  if (/(tricep|kickback|skull|extension)/.test(n)) return "triceps";
  if (/(plank|dead bug|bird dog|hollow|crunch|sit[- ]?up|core|pallof|rotation|twist)/.test(n)) return "core";
  if (/(walk|run|jog|skip|jump|burpee|cardio|hiit|sprint)/.test(n)) return "cardiovascular";
  if (/(stretch|yoga|child|pigeon|cat[- ]?cow|fold|breath)/.test(n)) return "spine";
  return "full body";
}

export default function ExerciseDemonstration({
  exerciseName,
  size = 96,
  className = "",
  showLabel = false,
  targetMuscle,
}: Props) {
  const [ready, setReady] = useState(!!targetMap);

  useEffect(() => {
    if (!targetMap) ensureTargetMap().then(() => setReady(true));
  }, []);

  const resolvedTarget = useMemo(() => {
    if (targetMuscle) return targetMuscle;
    const fromMap = targetMap?.get(exerciseName.toLowerCase());
    if (fromMap) return fromMap;
    return guessTargetFromName(exerciseName);
  }, [targetMuscle, exerciseName, ready]);

  const label = showLabel && size >= 64 ? (
    <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-foreground/80 to-transparent px-1 py-0.5">
      <span className="line-clamp-1 text-[8px] font-medium leading-tight text-background">{exerciseName}</span>
    </div>
  ) : null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className={`overflow-hidden rounded-xl bg-accent/30 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <MuscleIllustration
          targetMuscle={resolvedTarget}
          size={Math.round(size * 0.85)}
          className="opacity-90"
        />
      </div>
      {label}
    </div>
  );
}
