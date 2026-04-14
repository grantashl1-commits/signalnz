import { useMemo } from "react";
import { getAnimationForExercise } from "@/data/exercise-animations";
import ExerciseRig from "@/components/movement/ExerciseRig";
import ExerciseSilhouette from "@/components/movement/ExerciseSilhouette";

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
  imageUrl?: string | null;
}

export default function ExerciseDemonstration({
  exerciseName,
  size = 96,
  className = "",
  showLabel = false,
  imageUrl,
}: Props) {
  const animation = useMemo(() => getAnimationForExercise(exerciseName), [exerciseName]);

  const label = showLabel && size >= 64 ? (
    <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-foreground/80 to-transparent px-1 py-0.5">
      <span className="line-clamp-1 text-[8px] font-medium leading-tight text-background">{exerciseName}</span>
    </div>
  ) : null;

  if (imageUrl) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className={`overflow-hidden rounded-xl bg-accent/30 ${className}`} style={{ width: size, height: size }}>
          <img
            src={imageUrl}
            alt={`${exerciseName} illustration`}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
        {label}
      </div>
    );
  }

  if (animation) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className={`overflow-hidden rounded-xl bg-accent/30 ${className}`} style={{ width: size, height: size }}>
          <ExerciseRig animation={animation} size={size} playing />
        </div>
        {label}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className={`overflow-hidden rounded-xl bg-accent/30 ${className}`} style={{ width: size, height: size }}>
        <ExerciseSilhouette exerciseName={exerciseName} size={size} />
      </div>
      {label}
    </div>
  );
}
