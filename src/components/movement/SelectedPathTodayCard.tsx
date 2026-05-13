/**
 * Card shown at the top of the Today tab when the user has selected a
 * Training plan. It surfaces the next uncompleted session in that plan,
 * with a Connect HR action that hooks into the global heart-rate context.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bluetooth, Check, ChevronRight, Sparkles, Clock, Flame, Wind, X } from "lucide-react";
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
import { noteOffered, daysSinceOffered, offeredWeekday, clearOffered } from "@/lib/session-carryover";
import { fmtMinSec, type HRZoneSummary } from "@/lib/hr-zones";
import { getWarmup, getCooldown, getWarmupCooldownPref, setWarmupCooldownPref } from "@/lib/warmup-cooldown";
import { getPicksForToday, removePickToday, type LibraryPick } from "@/lib/library-picks";

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
  const [carryDays, setCarryDays] = useState(0);
  const [carryFrom, setCarryFrom] = useState<string | null>(null);
  const [hrSummary, setHrSummary] = useState<HRZoneSummary | null>(null);
  const [pref, setPref] = useState(getWarmupCooldownPref());
  const [picks, setPicks] = useState<LibraryPick[]>(getPicksForToday());

  useEffect(() => {
    const refreshPicks = () => setPicks(getPicksForToday());
    window.addEventListener("signal:library-picks-changed", refreshPicks);
    return () => window.removeEventListener("signal:library-picks-changed", refreshPicks);
  }, []);

  const togglePref = (k: "warmup" | "cooldown") => {
    haptic("light");
    const next = { ...pref, [k]: !pref[k] };
    setPref(next);
    setWarmupCooldownPref(next);
  };

  const warmup = currentPhase ? getWarmup(currentPhase) : null;
  const cooldown = currentPhase ? getCooldown(currentPhase) : null;

  useEffect(() => {
    const refresh = () => {
      const path = getSelectedPath();
      const next = path ? getNextSession(path) : null;
      setInfo(next);
      if (next) {
        const key = `${next.path.id}::w${next.week}::d${next.day}`;
        noteOffered(key);
        setCarryDays(daysSinceOffered(key));
        setCarryFrom(offeredWeekday(key));
      }
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
  const sessionKey = `${path.id}::w${week}::d${day}`;

  const handleComplete = () => {
    haptic("medium");
    // Capture HR summary if we were recording.
    if (hr.recording) {
      const summary = hr.endSession();
      if (summary && summary.totalSeconds > 30) {
        setHrSummary(summary);
      }
    }
    markSessionCompleted(path.id, week, day);
    clearOffered(sessionKey);
    toast.success("Held.");
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
        // Begin recording for zone summary
        if (!hr.recording) hr.startSession();
      } catch (e: any) {
        toast.error(e?.message || "Could not connect monitor.");
      }
    }
  };

  // Auto-start recording the moment HR is connected on this card.
  useEffect(() => {
    if (hr.connected && !hr.recording) hr.startSession();
    // we intentionally do not stop on unmount — finishing the workout ends it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hr.connected]);

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

        {/* Carryover hint — gentle, never guilt-laden */}
        {carryDays >= 1 && carryFrom && (
          <div className="rounded-lg bg-secondary/40 border border-border/60 px-3 py-2 flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 text-primary/70 mt-0.5 shrink-0" />
            <p className="font-editorial text-xs italic text-foreground/75 leading-relaxed">
              Picked up from {carryFrom}. Same session, whenever you're ready.
            </p>
          </div>
        )}

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

        {/* HR-zone summary after a session ends */}
        {hrSummary && (
          <div className="rounded-lg bg-card border border-primary/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-primary/70 font-semibold">
                Time in zones
              </p>
              <p className="font-body text-[10px] text-muted-foreground">
                avg {hrSummary.avgBpm} · max {hrSummary.maxBpm} bpm
              </p>
            </div>
            <div className="space-y-1.5">
              {hrSummary.zones.filter(z => z.seconds > 0).map(z => (
                <div key={z.name} className="flex items-center gap-2">
                  <span className="w-16 font-body text-[11px] text-foreground/80">{z.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${z.pct}%` }} />
                  </div>
                  <span className="w-14 text-right font-body text-[10px] text-muted-foreground tabular-nums">
                    {fmtMinSec(z.seconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warm-up / cool-down toggle row */}
        {expanded && (warmup || cooldown) && (
          <div className="flex flex-wrap gap-2">
            {warmup && (
              <button
                onClick={() => togglePref("warmup")}
                aria-pressed={pref.warmup}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[36px] border font-body text-[11px] transition-colors ${
                  pref.warmup
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                Warm-up · {warmup.durationMin} min
              </button>
            )}
            {cooldown && (
              <button
                onClick={() => togglePref("cooldown")}
                aria-pressed={pref.cooldown}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[36px] border font-body text-[11px] transition-colors ${
                  pref.cooldown
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <Wind className="h-3.5 w-3.5" />
                Cool-down · {cooldown.durationMin} min
              </button>
            )}
          </div>
        )}

        {/* Warm-up sequence */}
        {expanded && pref.warmup && warmup && (
          <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 space-y-1.5">
            <p className="font-hand text-[11px] uppercase tracking-[0.18em] text-primary/80">
              {warmup.title}
            </p>
            <ul className="space-y-1">
              {warmup.moves.map((m, i) => (
                <li key={i} className="font-body text-[11px] text-foreground/80 leading-relaxed flex gap-1.5">
                  <span className="text-primary/60">·</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
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

        {/* Picks added from Library */}
        {expanded && picks.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 space-y-2">
            <p className="font-hand text-[11px] uppercase tracking-[0.18em] text-primary/80">
              Added from Library
            </p>
            <ul className="space-y-1.5">
              {picks.map(p => (
                <li key={p.id} className="flex items-center gap-2">
                  <ExerciseDemonstration exerciseName={p.name} imageUrl={p.illustration_url ?? undefined} size={32} className="shrink-0" />
                  <span className="flex-1 font-body text-[12px] text-foreground/85 truncate">{p.name}</span>
                  <button
                    onClick={() => { haptic("light"); removePickToday(p.id); }}
                    aria-label="Remove"
                    className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cool-down sequence */}
        {expanded && pref.cooldown && cooldown && (
          <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 space-y-1.5">
            <p className="font-hand text-[11px] uppercase tracking-[0.18em] text-primary/80">
              {cooldown.title}
            </p>
            <ul className="space-y-1">
              {cooldown.moves.map((m, i) => (
                <li key={i} className="font-body text-[11px] text-foreground/80 leading-relaxed flex gap-1.5">
                  <span className="text-primary/60">·</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
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
