import { useState, useEffect, useMemo } from "react";
import { Dumbbell } from "lucide-react";
import { getAnimationForExercise } from "@/data/exercise-animations";
import ExerciseRig from "@/components/movement/ExerciseRig";
import ExerciseSilhouette from "@/components/movement/ExerciseSilhouette";

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export default function ExerciseDemonstration({ exerciseName, size = 96, className = "", showLabel = false }: Props) {
  // Try mapped animation first (ExerciseRig), then fall back to keyword-based silhouette
  const animation = useMemo(() => getAnimationForExercise(exerciseName), [exerciseName]);

  // If we have a fully mapped animation, use ExerciseRig
  if (animation) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className={`rounded-xl overflow-hidden bg-accent/30 ${className}`} style={{ width: size, height: size }}>
          <ExerciseRig animation={animation} size={size} playing />
        </div>
        {showLabel && size >= 64 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl px-1 py-0.5">
            <span className="text-[8px] text-white font-medium leading-tight line-clamp-1">{exerciseName}</span>
          </div>
        )}
      </div>
    );
  }

  // Fallback: keyword-based animated silhouette
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className={`rounded-xl overflow-hidden bg-accent/30 ${className}`} style={{ width: size, height: size }}>
        <ExerciseSilhouette exerciseName={exerciseName} size={size} />
      </div>
      {showLabel && size >= 64 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl px-1 py-0.5">
          <span className="text-[8px] text-white font-medium leading-tight line-clamp-1">{exerciseName}</span>
        </div>
      )}
    </div>
  );
}
