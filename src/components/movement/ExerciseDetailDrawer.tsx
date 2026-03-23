/**
 * Exercise Detail Drawer
 * Opens when tapping an exercise row in a workout.
 * Shows: 3D rig animation, name, sets/reps, tempo, coaching cue, tags.
 * Falls back to ExerciseDemonstration GIF when no rig animation exists.
 */

import { useState, useRef } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { X, Camera } from "lucide-react";
import ExerciseRig3D from "@/components/movement/ExerciseRig3D";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { getAnimationForExercise } from "@/data/exercise-animations";
import type { Exercise } from "@/data/workouts";
import type { Phase } from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface ExerciseDetailDrawerProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  phase: Phase;
}

export default function ExerciseDetailDrawer({ exercise, open, onClose, phase }: ExerciseDetailDrawerProps) {
  const [playing, setPlaying] = useState(true);
  const screenshotFnRef = useRef<(() => void) | null>(null);

  if (!exercise) return null;

  const animation = getAnimationForExercise(exercise.name);
  const phaseColor = PHASE_HEX[phase];

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="relative pb-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <DrawerTitle className="font-display text-xl italic text-foreground pr-10">
            {exercise.name}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-8 pt-4 space-y-5 overflow-y-auto">
          {/* Animation area */}
          {animation ? (
            <div className="flex flex-col items-center">
              <div
                className="rounded-2xl w-full overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.5) 50%, hsl(var(--primary) / 0.05) 100%)",
                }}
              >
                <ExerciseRig3D
                  animation={animation}
                  playing={playing}
                  mirrored={false}
                  height={360}
                  onScreenshotReady={(fn) => { screenshotFnRef.current = fn; }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="px-4 py-1.5 rounded-full bg-secondary text-muted-foreground font-mono text-[10px]"
                >
                  {playing ? "pause" : "play"}
                </button>
                <button
                  onClick={() => screenshotFnRef.current?.()}
                  className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center gap-1.5 transition-colors hover:bg-primary/15"
                >
                  <Camera className="h-3 w-3" />
                  save image
                </button>
              </div>
              {animation.unilateral && (
                <p className="font-mono text-[9px] text-muted-foreground mt-1">unilateral · each side</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div
                className="rounded-2xl w-full flex items-center justify-center py-6"
                style={{
                  background: "linear-gradient(160deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.5) 50%, hsl(var(--primary) / 0.05) 100%)",
                }}
              >
                <ExerciseDemonstration exerciseName={exercise.name} size={200} className="rounded-xl" />
              </div>
            </div>
          )}

          {/* Exercise details */}
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              {exercise.sets && (
                <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
                  <p className="font-mono text-[9px] text-muted-foreground">sets</p>
                  <p className="font-mono text-sm text-foreground">{exercise.sets}</p>
                </div>
              )}
              {exercise.reps && (
                <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
                  <p className="font-mono text-[9px] text-muted-foreground">reps</p>
                  <p className="font-mono text-sm text-foreground">{exercise.reps}</p>
                </div>
              )}
              {exercise.duration && (
                <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
                  <p className="font-mono text-[9px] text-muted-foreground">duration</p>
                  <p className="font-mono text-sm text-foreground">{exercise.duration}</p>
                </div>
              )}
              {animation?.defaultTempo && (
                <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
                  <p className="font-mono text-[9px] text-muted-foreground">tempo</p>
                  <p className="font-mono text-sm" style={{ color: phaseColor }}>{animation.defaultTempo}</p>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <p className="font-hand text-xs font-bold text-primary mb-1">coaching cue</p>
              <p className="font-body text-sm text-foreground">{exercise.formCue}</p>
            </div>

            {animation && (
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full px-3 py-1 bg-secondary font-mono text-[9px] text-muted-foreground">
                  {animation.movementType}
                </span>
                <span className="rounded-full px-3 py-1 bg-secondary font-mono text-[9px] text-muted-foreground">
                  {animation.orientation}
                </span>
                {animation.holdable && (
                  <span className="rounded-full px-3 py-1 bg-primary/10 font-mono text-[9px] text-primary">
                    holdable
                  </span>
                )}
                {animation.unilateral && (
                  <span className="rounded-full px-3 py-1 bg-primary/10 font-mono text-[9px] text-primary">
                    unilateral
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
