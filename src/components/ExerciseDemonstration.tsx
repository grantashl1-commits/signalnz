import MuscleIllustration from "@/components/movement/MuscleIllustration";

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
  /** Optional explicit target muscle override — used as a hint for the anatomy figure. */
  targetMuscle?: string | null;
  /** Legacy prop kept for back-compat — accepted but ignored. */
  imageUrl?: string | null;
}

/**
 * Unified exercise illustration. Always renders the gray muscle-anatomy figure
 * (the "DB" style used across the exercise library) so every surface — Today,
 * Training paths, Library, Quick workouts — looks identical.
 */
export default function ExerciseDemonstration({
  exerciseName,
  size = 96,
  className = "",
  showLabel = false,
  targetMuscle,
}: Props) {
  const target = targetMuscle || guessTargetFromName(exerciseName);

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
          targetMuscle={target}
          size={Math.round(size * 0.85)}
          className="opacity-90"
        />
      </div>
      {label}
    </div>
  );
}

/** Lightweight body-part guess used to pick the right anatomy figure. */
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
