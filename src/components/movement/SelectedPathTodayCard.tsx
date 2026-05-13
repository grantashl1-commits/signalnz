/**
 * Card shown at the top of the Today tab when the user has selected a
 * Training plan. It surfaces the next uncompleted session in that plan,
 * with a Connect HR action that hooks into the global heart-rate context.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bluetooth, Check, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useCycle } from "@/contexts/CycleContext";
import { extractExerciseName } from "@/lib/exercise-image-lookup";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import type { Phase } from "@/lib/cycle-utils";
import {
  getSelectedPath,
  getNextSession,
  markSessionCompleted,
  resetPathProgress,
  type NextSessionInfo,
} from "@/lib/training-path-utils";
import type { TrainingFocus } from "@/data/signal-training-paths";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";

import strengthArt from "@/assets/training-paths/strength.png";
import muscleArt from "@/assets/training-paths/muscle.png";
import cardioArt from "@/assets/training-paths/cardio.png";
import runArt from "@/assets/training-paths/run.png";
import pilatesArt from "@/assets/training-paths/pilates.png";
import restoreArt from "@/assets/training-paths/restore.png";
import stressReliefArt from "@/assets/training-paths/stress-relief.png";
import glutePowerArt from "@/assets/training-paths/glute-power.png";

const FOCUS_ART: Record<TrainingFocus, string> = {
  strength: strengthArt,
  muscle: muscleArt,
  cardio: cardioArt,
  run: runArt,
  pilates: pilatesArt,
  restore: restoreArt,
  hybrid: strengthArt,
  "stress-relief": stressReliefArt,
  "glute-power": glutePowerArt,
};

const FOCUS_TITLE: Record<TrainingFocus, string> = {
  strength: "Strength",
  muscle: "Muscle",
  cardio: "Cardio",
  run: "Run",
  pilates: "Pilates",
  restore: "Restore",
  hybrid: "Hybrid",
  "stress-relief": "Stress Relief",
  "glute-power": "Glute Power",
};

const PHASE_LOAD_NOTE: Record<Phase, string> = {
  menstrual: "Lighter today — your body is reseting. Honour the slow.",
  follicular: "Energy is climbing. A good day to ask a little more of yourself.",
  ovulatory: "Peak power window. Lift heavier or push the pace if it calls.",
  luteal: "Volume eases back. Steady and strong, no chasing PRs.",
};

export default function SelectedPathTodayCard({ onOpenHR }: { onOpenHR?: () => void }) {
  const hr = useGlobalHeartRate();
  const { currentPhase } = useCycle();
  const [info, setInfo] = useState<NextSessionInfo | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const refresh = () => {
      const path = getSelectedPath();
      setInfo(path ? getNextSession(path) : null);
    };
    refresh();
    window.addEventListener("signal:training-path-changed", refresh);
    return () => window.removeEventListener("signal:training-path-changed", refresh);
  }, []);

  if (!info) {
    return (
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          // Cue: scroll to top so user sees Today tab; the Training tab button is in the sticky bar
          window.dispatchEvent(new CustomEvent("signal:open-tab", { detail: "training" }));
        }}
        className="block card-warm p-5 border-2 border-dashed border-primary/30 text-center space-y-2 hover:border-primary/60 transition-colors"
      >
        <Sparkles className="h-5 w-5 text-primary mx-auto" />
        <p className="font-display text-base font-bold text-foreground">Pick a path to begin</p>
        <p className="font-editorial text-sm italic text-muted-foreground">
          Choose a training plan and we'll thread it through your Today.
        </p>
      </Link>
    );
  }

  const { path, week, day, session, completedCount, finished } = info;
  const showRestart = week > 1 || completedCount > 0;

  const handleComplete = () => {
    haptic("medium");
    markSessionCompleted(path.id, week, day);
    toast.success("Marked as complete.");
  };

  const handleRestart = () => {
    haptic("light");
    resetPathProgress(path.id);
    toast.success("Back to week 1.");
  };

  const handleConnectHR = async () => {
    haptic("light");
    if (onOpenHR) onOpenHR();
    else {
      try {
        await hr.connect();
      } catch (e: any) {
        toast.error(e?.message || "Could not connect monitor.");
      }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-primary/20 overflow-hidden shadow-sm"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-xl bg-secondary/30 flex items-center justify-center overflow-hidden">
            <img
              src={FOCUS_ART[path.focus]}
              alt=""
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-hand text-xs uppercase tracking-[0.2em] text-primary">
              Today on {FOCUS_TITLE[path.focus]}
            </p>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground leading-tight">
              {session.name}
            </h3>
            <p className="font-body text-[11px] text-muted-foreground">
              Week {week} · Day {day}
              {session.durationMin ? ` · ${session.durationMin} min` : ""}
              {session.equipment ? ` · ${session.equipment}` : ""}
            </p>
            {session.feel && (
              <p className="font-editorial text-xs italic text-primary/70 mt-1">
                Feels like: {session.feel}
              </p>
            )}
            {showRestart && (
              <button
                onClick={handleRestart}
                className="mt-1.5 font-body text-[10px] text-primary/70 hover:text-primary underline underline-offset-2"
              >
                Restart from week 1
              </button>
            )}
          </div>
        </div>

        {/* Phase-aware load microcopy */}
        {currentPhase && (
          <div className="rounded-lg bg-primary/[0.06] border border-primary/15 px-3 py-2">
            <p className="font-body text-[10px] uppercase tracking-[0.18em] text-primary/70 font-semibold mb-0.5">
              Why today
            </p>
            <p className="font-editorial text-xs italic text-foreground/75 leading-relaxed">
              {PHASE_LOAD_NOTE[currentPhase]}
            </p>
          </div>
        )}

        {/* Structure preview */}
        {expanded && session.structure && session.structure.length > 0 && (
          <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {session.structure.map((line, i) => {
              const name = extractExerciseName(line);
              return (
                <li key={i} className="flex items-start gap-2 font-body text-xs text-foreground/85">
                  {name ? (
                    <ExerciseDemonstration exerciseName={name} size={36} className="shrink-0" />
                  ) : (
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                  )}
                  <span className="flex-1 pt-1 leading-relaxed">{line}</span>
                </li>
              );
            })}
          </ul>
        )}

        {session.coachingNote && expanded && (
          <p className="font-body text-xs text-foreground/70 italic leading-relaxed border-l-2 border-primary/30 pl-3">
            {session.coachingNote}
          </p>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          {expanded ? "Hide details" : "Show details"}
          <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleConnectHR}
            disabled={hr.connected}
            className="flex-1 h-11 rounded-full bg-secondary text-foreground font-body text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.97] transition-transform"
          >
            {hr.connected ? (
              <>
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                {hr.bpm ? `${hr.bpm} bpm` : "Monitor connected"}
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4" />
                Connect HR monitor
              </>
            )}
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 h-11 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Check className="h-4 w-4" />
            Finish workout
          </button>
        </div>
      </div>
    </motion.section>
  );
}
