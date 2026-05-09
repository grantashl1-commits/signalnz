import { useState, useEffect } from "react";
import MuscleIllustration from "@/components/movement/MuscleIllustration";
import { findIllustrationUrl, requestIllustrationGeneration } from "@/lib/exercise-illustrations";

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
  /** Optional explicit target muscle override — used only as a fallback hint. */
  targetMuscle?: string | null;
  /** Legacy prop kept for back-compat — accepted but ignored. */
  imageUrl?: string | null;
}

export default function ExerciseDemonstration({
  exerciseName,
  size = 96,
  className = "",
  showLabel = false,
  targetMuscle,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setMissing(false);

    (async () => {
      const found = await findIllustrationUrl(exerciseName);
      if (cancelled) return;
      if (found) {
        setUrl(found);
        return;
      }
      // Not in storage — kick off generation, fall back to anatomy in the meantime.
      setMissing(true);
      const generated = await requestIllustrationGeneration(exerciseName);
      if (!cancelled && generated) {
        setUrl(generated);
        setMissing(false);
      }
    })();

    return () => { cancelled = true; };
  }, [exerciseName]);

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
        {url ? (
          <img
            src={url}
            alt={exerciseName}
            width={size}
            height={size}
            loading="lazy"
            className="h-full w-full object-contain"
            onError={() => { setUrl(null); setMissing(true); }}
          />
        ) : (
          <MuscleIllustration
            targetMuscle={targetMuscle || guessTargetFromName(exerciseName)}
            size={Math.round(size * 0.85)}
            className="opacity-90"
          />
        )}
      </div>
      {label}
    </div>
  );
}

/** Lightweight body-part guess used only when an illustration isn't available. */
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
  if (/(tricep|skull|extension)/.test(n)) return "triceps";
  if (/(plank|dead bug|bird dog|hollow|crunch|sit[- ]?up|core|pallof|rotation|twist)/.test(n)) return "core";
  if (/(walk|run|jog|skip|jump|burpee|cardio|hiit|sprint)/.test(n)) return "cardiovascular";
  if (/(stretch|yoga|child|pigeon|cat[- ]?cow|fold|breath)/.test(n)) return "spine";
  return "full body";
}
