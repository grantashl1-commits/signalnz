/**
 * Exercise Detail Drawer
 * Opens when tapping an exercise row in a workout.
 * Shows: animation, name, sets/reps, tempo, coaching cue, equipment.
 * Includes optional "3D View" toggle for Sketchfab embeds.
 */

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { X, Box, Eye } from "lucide-react";
import ExerciseRig3D from "@/components/movement/ExerciseRig3D";
import ExerciseSilhouette from "@/components/movement/ExerciseSilhouette";
import { getAnimationForExercise } from "@/data/exercise-animations";
import type { Exercise } from "@/data/workouts";
import type { Phase } from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

// ── Sketchfab 3D model embeds by exercise category ───────────────────
const SKETCHFAB_BASE = "?autospin=1&autostart=1&ui_theme=dark&dnt=1&ui_stop=0&ui_inspector=0&ui_watermark=0&ui_watermark_link=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0";

const SKETCHFAB_MODELS: Record<string, { url: string; label: string }> = {
  squat: {
    url: `https://sketchfab.com/models/a29613e02baf4e0e8ae1c37fd56a3358/embed${SKETCHFAB_BASE}`,
    label: "Squat Form",
  },
  push: {
    url: `https://sketchfab.com/models/7c3e6dcbaee24e7fb80d50a2b0985f5d/embed${SKETCHFAB_BASE}`,
    label: "Upper Body Push",
  },
  pull: {
    url: `https://sketchfab.com/models/40bc8652e20d4bae9fb07e1ea2a3f94c/embed${SKETCHFAB_BASE}`,
    label: "Back & Pull",
  },
  lunge: {
    url: `https://sketchfab.com/models/a29613e02baf4e0e8ae1c37fd56a3358/embed${SKETCHFAB_BASE}`,
    label: "Lunge Pattern",
  },
  hinge: {
    url: `https://sketchfab.com/models/a29613e02baf4e0e8ae1c37fd56a3358/embed${SKETCHFAB_BASE}`,
    label: "Hip Hinge",
  },
  core: {
    url: `https://sketchfab.com/models/40bc8652e20d4bae9fb07e1ea2a3f94c/embed${SKETCHFAB_BASE}`,
    label: "Core Anatomy",
  },
  compound: {
    url: `https://sketchfab.com/models/a29613e02baf4e0e8ae1c37fd56a3358/embed${SKETCHFAB_BASE}`,
    label: "Full Body",
  },
};

function classifyForSketchfab(name: string): string | null {
  const n = name.toLowerCase();
  if (/squat|goblet|wall.?sit|thruster/i.test(n)) return "squat";
  if (/push|press|dip|bench|chest|fly/i.test(n)) return "push";
  if (/pull|row|curl|chin|face.?pull/i.test(n)) return "pull";
  if (/lunge|split|step|bulgarian/i.test(n)) return "lunge";
  if (/deadlift|rdl|hinge|good.?morning|hip.?thrust/i.test(n)) return "hinge";
  if (/crunch|plank|core|dead.?bug|hollow|v.?up|twist|ab|hundred|bird/i.test(n)) return "core";
  if (/clean|snatch/i.test(n)) return "compound";
  return null;
}

interface ExerciseDetailDrawerProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  phase: Phase;
}

export default function ExerciseDetailDrawer({ exercise, open, onClose, phase }: ExerciseDetailDrawerProps) {
  const [playing, setPlaying] = useState(true);
  const [show3D, setShow3D] = useState(false);

  if (!exercise) return null;

  const animation = getAnimationForExercise(exercise.name);
  const phaseColor = PHASE_HEX[phase];
  const sketchfabCategory = classifyForSketchfab(exercise.name);
  const sketchfabModel = sketchfabCategory ? SKETCHFAB_MODELS[sketchfabCategory] : null;

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) { onClose(); setShow3D(false); } }}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="relative pb-0">
          <button
            onClick={() => { onClose(); setShow3D(false); }}
            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <DrawerTitle className="font-display text-xl italic text-foreground pr-10">
            {exercise.name}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-8 pt-4 space-y-5 overflow-y-auto">
          {/* 3D Sketchfab View */}
          {show3D && sketchfabModel ? (
            <div className="flex flex-col items-center gap-2">
            <div
                className="rounded-2xl w-full overflow-hidden relative"
                style={{
                  aspectRatio: "3/2",
                  background: "linear-gradient(160deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.5) 50%, hsl(var(--primary) / 0.05) 100%)",
                }}
              >
                <iframe
                  title={sketchfabModel.label}
                  src={sketchfabModel.url}
                  className="absolute inset-0 w-full h-full rounded-2xl"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  style={{ border: "none" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShow3D(false)}
                  className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center gap-1.5 transition-colors hover:bg-primary/15"
                >
                  <Eye className="h-3 w-3" />
                  animation view
                </button>
                <span className="font-mono text-[9px] text-muted-foreground">{sketchfabModel.label}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Standard animation area */}
              {animation ? (
                <div className="flex flex-col items-center">
                  <div className="bg-secondary/30 rounded-2xl w-full overflow-hidden">
                    <ExerciseRig3D
                      animation={animation}
                      playing={playing}
                      mirrored={false}
                      height={280}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setPlaying(!playing)}
                      className="px-4 py-1.5 rounded-full bg-secondary text-muted-foreground font-mono text-[10px]"
                    >
                      {playing ? "pause" : "play"}
                    </button>
                    {sketchfabModel && (
                      <button
                        onClick={() => setShow3D(true)}
                        className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center gap-1.5 transition-colors hover:bg-primary/15"
                      >
                        <Box className="h-3 w-3" />
                        3D view
                      </button>
                    )}
                  </div>
                  {animation.unilateral && (
                    <p className="font-mono text-[9px] text-muted-foreground mt-1">unilateral · each side</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-secondary/30 rounded-2xl w-full flex items-center justify-center py-4">
                    <ExerciseSilhouette
                      exerciseName={exercise.name}
                      size={160}
                      playing={playing}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setPlaying(!playing)}
                      className="px-4 py-1.5 rounded-full bg-secondary text-muted-foreground font-mono text-[10px]"
                    >
                      {playing ? "pause" : "play"}
                    </button>
                    {sketchfabModel && (
                      <button
                        onClick={() => setShow3D(true)}
                        className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center gap-1.5 transition-colors hover:bg-primary/15"
                      >
                        <Box className="h-3 w-3" />
                        3D view
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
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
