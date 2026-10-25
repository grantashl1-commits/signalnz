import { useEffect, useRef, useState } from "react";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { useExerciseIllustrations } from "@/hooks/useExerciseIllustrations";
import { getExerciseImageByName } from "@/lib/exercise-image-lookup";
import imageMaps from "@/data/image-maps.json";
import type { PartnerStation } from "@/data/partner-program";
import { getCorrectedExerciseArt } from "@/lib/corrected-exercise-art";

const EXERCISE_IMAGES = imageMaps.exercises as Record<string, string>;

type Lookup = (name: string | null | undefined) => string | undefined;

/**
 * Same preference order as ExerciseDemonstration (exercise-DB pencil sketch,
 * then the local watercolour by name), plus the station's `imageKey` as a
 * last local match before the anatomy fallback.
 */
export function stationImageUrl(lookup: Lookup, station: Pick<PartnerStation, "name" | "imageKey">): string | null {
  return getCorrectedExerciseArt(station.name)
    ?? lookup(station.name)
    ?? getExerciseImageByName(station.name)
    ?? (station.imageKey ? EXERCISE_IMAGES[station.imageKey] : undefined)
    ?? null;
}

/**
 * Anatomy-figure keyword for the last-resort fallback. MuscleIllustration has no
 * chest/shoulder/quad figure; quads are left out so a squat falls through to its
 * glutes rather than showing a hip-flexor stretch. (Every station has a local
 * `imageKey`, so this only shows if an image fails to load.)
 */
const ANATOMY_ALIASES: Record<string, string> = {
  back: "upper back", "upper back": "upper back", lats: "lats", chest: "arms", shoulders: "arms",
  biceps: "bicep", triceps: "tricep", glutes: "glutes", hamstrings: "hamstrings", calves: "calves", adductors: "adductors",
  core: "core", obliques: "oblique", "lower back": "lower back",
};
export function anatomyTarget(muscles: string[] | undefined): string | undefined {
  for (const m of muscles ?? []) {
    const hit = ANATOMY_ALIASES[m.toLowerCase()];
    if (hit) return hit;
  }
  return undefined;
}

interface Props {
  station: Pick<PartnerStation, "name" | "imageKey"> & { muscles?: string[] };
  /** Active station: gentle looping "demo" movement (or start/end crossfade when an end pose exists). */
  animate?: boolean;
  className?: string;
  fallbackSize?: number;
}

/** Square exercise illustration that fills its box (measured), so grids can be fluid. */
export default function StationArt({ station, animate = false, className = "", fallbackSize = 96 }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(fallbackSize);
  const lookup = useExerciseIllustrations();
  // End poses are optional art (`<imageKey>-end.png`); only try one the image map knows about.
  const endUrl = station.imageKey ? EXERCISE_IMAGES[`${station.imageKey}-end`] : undefined;
  const [endFailed, setEndFailed] = useState(false);
  const crossfade = animate && !!endUrl && !endFailed && !getCorrectedExerciseArt(station.name);
  const imageUrl = crossfade && station.imageKey ? EXERCISE_IMAGES[station.imageKey] : stationImageUrl(lookup, station);

  useEffect(() => { setEndFailed(false); }, [station.imageKey]);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const next = Math.floor(Math.min(width, height || width));
      if (next > 24) setSize(prev => (Math.abs(prev - next) > 1 ? next : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}>
      <div className={crossfade ? "pc-pose-start" : animate ? "pc-demo-loop" : undefined}>
        <ExerciseDemonstration exerciseName={station.name} imageUrl={imageUrl} targetMuscle={anatomyTarget(station.muscles)} size={size} className="!bg-transparent" />
      </div>
      {crossfade && (
        <img
          src={endUrl}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          className="pc-pose-end absolute object-contain"
          style={{ width: size, height: size }}
          onError={() => setEndFailed(true)}
        />
      )}
    </div>
  );
}
