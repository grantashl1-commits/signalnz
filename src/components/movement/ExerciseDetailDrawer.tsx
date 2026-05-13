/**
 * Exercise Detail Drawer
 * Opens when tapping an exercise row in a workout.
 * Shows: GIF demo, name, sets/reps, tempo, coaching cue, muscles targeted.
 */

import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { X, Target } from "lucide-react";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import MuscleIllustration from "@/components/movement/MuscleIllustration";
import { supabase } from "@/integrations/supabase/client";
import type { Exercise } from "@/data/workouts";
import type { Phase } from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

/** Phase-aware "why this exercise" microcopy keyed by the muscle/target it works. */
function whyThisExercise(target: string | null | undefined, phase: Phase): string {
  const t = (target || "").toLowerCase();
  const isCore = /core|abdom|oblique|spine|back/.test(t);
  const isGlute = /glute|hip/.test(t);
  const isLeg = /quad|hamstring|calf|leg/.test(t);
  const isUpper = /chest|shoulder|back|lat|tricep|bicep|arm/.test(t);
  const isCardio = /cardio|heart/.test(t);

  if (phase === "menstrual") {
    if (isCore || isGlute) return "Gentle activation here keeps blood flowing and softens cramping.";
    if (isCardio) return "A light pulse — enough to lift the fog without taxing reserves.";
    return "Move quietly today. This one supports without asking too much.";
  }
  if (phase === "follicular") {
    if (isLeg || isGlute) return "Your body is primed to build strength here right now.";
    if (isUpper) return "Energy is climbing — a great window to push the upper body.";
    return "Estrogen is rising. Strength gains land more easily this week.";
  }
  if (phase === "ovulatory") {
    if (isLeg || isGlute || isUpper) return "Peak power day. Lift heavier, jump higher — your body can take it.";
    return "You're at your strongest. Use it.";
  }
  // luteal
  if (isCore || isGlute) return "Steady volume here calms the nervous system in the second half.";
  if (isCardio) return "Zone 2 over intervals this week — kinder to a busier body.";
  return "Volume eases back. Move with steadiness, not force.";
}

interface ExerciseDB {
  name: string;
  body_part: string | null;
  target: string | null;
  equipment: string | null;
  instructions: string[];
  secondary_muscles: string[];
  gif_url: string | null;
}

interface ExerciseDetailDrawerProps {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  phase: Phase;
}

export default function ExerciseDetailDrawer({ exercise, open, onClose, phase }: ExerciseDetailDrawerProps) {
  const [dbData, setDbData] = useState<ExerciseDB | null>(null);
  const phaseColor = PHASE_HEX[phase];

  useEffect(() => {
    if (!exercise || !open) return;
    setDbData(null);

    const searchTerms = exercise.name.toLowerCase().replace(/[^a-z ]/g, "").split(" ").slice(0, 3).join(" ");
    supabase
      .from("exercises")
      .select("name, body_part, target, equipment, instructions, secondary_muscles, gif_url")
      .ilike("name", `%${searchTerms}%`)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDbData(data as unknown as ExerciseDB);
      });
  }, [exercise?.name, open]);

  if (!exercise) return null;

  const instructions = dbData?.instructions || [];
  const secondaryMuscles = dbData?.secondary_muscles || [];

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
          {/* GIF demonstration */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-2xl w-full flex items-center justify-center py-4"
              style={{
                background: "linear-gradient(160deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.5) 50%, hsl(var(--primary) / 0.05) 100%)",
              }}
            >
              <ExerciseDemonstration exerciseName={exercise.name} size={240} className="rounded-xl" />
            </div>
          </div>

          {/* Exercise details */}
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              {exercise.sets && (
                <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
                  <p className="font-body text-[9px] text-muted-foreground">sets</p>
                  <p className="font-body text-sm text-foreground">{exercise.sets}</p>
                </div>
              )}
              {exercise.reps && (
                <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
                  <p className="font-body text-[9px] text-muted-foreground">reps</p>
                  <p className="font-body text-sm text-foreground">{exercise.reps}</p>
                </div>
              )}
              {exercise.duration && (
                <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
                  <p className="font-body text-[9px] text-muted-foreground">duration</p>
                  <p className="font-body text-sm text-foreground">{exercise.duration}</p>
                </div>
              )}
            </div>

            {/* Muscles targeted */}
            {(dbData?.target || secondaryMuscles.length > 0) && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <p className="font-hand text-xs font-bold text-primary">Muscles targeted</p>
                </div>
                <div className="flex items-start gap-3">
                  {dbData?.target && (
                    <div className="flex-shrink-0">
                      <MuscleIllustration targetMuscle={dbData.target} size={56} />
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap flex-1">
                    {dbData?.target && (
                      <span className="rounded-full px-3 py-1 text-[10px] font-body font-bold" style={{ backgroundColor: `${phaseColor}20`, color: phaseColor }}>
                        {dbData.target}
                      </span>
                    )}
                    {secondaryMuscles.map((m) => (
                      <span key={m} className="rounded-full px-3 py-1 bg-secondary font-body text-[9px] text-muted-foreground">
                        {m}
                      </span>
                    ))}
                    {dbData?.equipment && (
                      <span className="rounded-full px-3 py-1 bg-accent font-body text-[9px] text-muted-foreground">
                        {dbData.equipment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Coaching cue */}
            {exercise.formCue && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="font-hand text-xs font-bold text-primary mb-1">coaching cue</p>
                <p className="font-body text-sm text-foreground">{exercise.formCue}</p>
              </div>
            )}

            {/* Instructions from DB */}
            {instructions.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="font-hand text-xs font-bold text-primary mb-2">step-by-step</p>
                <ol className="space-y-1.5">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-body text-[10px] text-primary font-bold mt-0.5">{i + 1}</span>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
