import WorkoutCompletionDialog from "./WorkoutCompletionDialog";
import type { WorkoutActual } from "@/lib/training-path-utils";
/**
 * Card shown at the top of the Today tab when the user has selected a
 * Training plan. It surfaces the next uncompleted session in that plan,
 * with a Connect HR action that hooks into the global heart-rate context.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, ChevronRight, Sparkles, Clock, Flame, Wind, X, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";
import { useCycle } from "@/contexts/CycleContext";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import SessionBlocks from "@/components/movement/SessionBlocks";
import type { Phase } from "@/lib/cycle-utils";
import {
  getSelectedPath,
  getNextSession,
  markSessionCompleted,
  plannedExercises,
  resetPathProgress,
  sessionStartHref,
  TRAINING_PATH_EVENTS,
  type NextSessionInfo,
} from "@/lib/training-path-utils";
import type { TrainingFocus } from "@/data/signal-training-paths";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { noteOffered, daysSinceOffered, offeredWeekday, clearOffered } from "@/lib/session-carryover";
import { fmtMinSec, type HRZoneSummary } from "@/lib/hr-zones";
import { getWarmup, getCooldown, getWarmupCooldownPref, setWarmupCooldownPref } from "@/lib/warmup-cooldown";
import { getPicksForToday, removePickToday, type LibraryPick } from "@/lib/library-picks";
import { clearSessionTicks, getSessionTicks, setSessionTick, type SessionTicks } from "@/lib/session-ticks";

import strengthArt from "@/assets/training-paths/strength.png";
import muscleArt from "@/assets/training-paths/muscle.png";
import cardioArt from "@/assets/training-paths/cardio.png";
import runArt from "@/assets/training-paths/run.png";
import pilatesArt from "@/assets/training-paths/pilates.png";
import restoreArt from "@/assets/training-paths/restore.png";
import stressReliefArt from "@/assets/training-paths/stress-relief.png";
import glutePowerArt from "@/assets/training-paths/glute-power.png";
import reformerArt from "@/assets/training-paths/reformer-pilates.png";

const FOCUS_ART: Record<TrainingFocus, string> = {
  strength: strengthArt,
  muscle: muscleArt,
  cardio: cardioArt,
  run: runArt,
  pilates: pilatesArt,
  reformer: reformerArt,
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
  reformer: "Reformer",
  restore: "Restore",
  hybrid: "Hybrid",
  "stress-relief": "Stress Relief",
  "glute-power": "Glute Power",
};

// Research on matching training to cycle phase is mixed, so this nudges by feel, not by calendar.
const PHASE_LOAD_NOTE: Record<Phase, string> = {
  menstrual: "If today feels heavy, drop a round or pick a lighter weight. Many women feel fine; go by feel.",
  follicular: "Many women feel good this week. A nice time to chase a rep or a weight step if you feel it.",
  ovulatory: "If you feel strong, use it. Let reps in reserve, not the calendar, set your weights.",
  luteal: "Heat and sleep can feel harder this week. Same plan; adjust the weight by feel.",
};

export default function SelectedPathTodayCard({ onOpenHR }: { onOpenHR?: () => void }) {
  const { user } = useAuth();
  const userId = user?.id;
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

  const phaseWarmup = currentPhase ? getWarmup(currentPhase) : null;
  const phaseCooldown = currentPhase ? getCooldown(currentPhase) : null;

  useEffect(() => {
    const refresh = () => {
      const path = getSelectedPath();
      const next = path ? getNextSession(path, { userId }) : null;
      setInfo(next);
      if (next) {
        const key = `${next.path.id}::w${next.week}::d${next.day}`;
        noteOffered(key);
        setCarryDays(daysSinceOffered(key));
        setCarryFrom(offeredWeekday(key));
      }
    };
    refresh();
    TRAINING_PATH_EVENTS.forEach(name => window.addEventListener(name, refresh));
    return () => TRAINING_PATH_EVENTS.forEach(name => window.removeEventListener(name, refresh));
  }, [userId]);

  // Auto-start recording the moment HR is connected on this card.
  // Must be declared BEFORE any early return to keep hook order stable.
  useEffect(() => {
    if (hr.connected && !hr.recording) hr.startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hr.connected]);

  const [showCompletion, setShowCompletion] = useState(false);
  // Rounds ticked off during today's session; reloaded when the session changes.
  const tickKey = info ? `${info.path.id}::w${info.week}::d${info.day}` : null;
  const [ticks, setTicks] = useState<SessionTicks>({});
  useEffect(() => { setTicks(tickKey ? getSessionTicks(tickKey) : {}); }, [tickKey]);

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
  // Sessions that carry their own warm-up and cool-down don't need the generic phase ones.
  const ownWarmup = (session.warmup?.length ?? 0) > 0;
  const ownCooldown = ((session.cooldown ?? session.coolDown)?.length ?? 0) > 0;
  const warmup = ownWarmup ? null : phaseWarmup;
  const cooldown = ownCooldown ? null : phaseCooldown;
  const showRestart = week > 1 || completedCount > 0;
  const sessionKey = `${path.id}::w${week}::d${day}`;
  // The partner series is trained (and ticked off) in its class hub.
  const startHref = sessionStartHref(info);

  const handleComplete = (actual: WorkoutActual) => {
    setShowCompletion(false);
    haptic("medium");
    // Capture HR summary if we were recording.
    if (hr.recording) {
      const summary = hr.endSession();
      if (summary && summary.totalSeconds > 30) {
        setHrSummary(summary);
      }
    }
    markSessionCompleted(path.id, week, day, actual);
    clearSessionTicks(sessionKey);
    setTicks({});
    clearOffered(sessionKey);
    toast.success("Held.");
  };

  const handleRestart = () => {
    haptic("light");
    resetPathProgress(path.id, userId);
    toast.success(startHref ? "Back to week 1. Your saved weights carry over." : "Back to week 1.");
  };

  // HR is now driven by the floating pulse icon in Movement.tsx.




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
              Today on {startHref ? "Partner series" : FOCUS_TITLE[path.focus]}
            </p>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground leading-tight">
              {session.name}
            </h3>
            <p className="font-body text-[11px] text-muted-foreground">
              Week {week} · {startHref ? "Session" : "Day"} {day}
              {session.durationMin ? ` · ${session.durationMin} min` : ""}
              {session.equipment ? ` · ${session.equipment}` : ""}
            </p>
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

        {/* Phase-aware load microcopy: one quiet line */}
        {currentPhase && !startHref && (
          <p className="font-editorial text-xs italic text-foreground/70 leading-relaxed">
            {PHASE_LOAD_NOTE[currentPhase]}
          </p>
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

        {/* The session itself: warm-up, blocks with rounds and rest, suggested weights, cool-down */}
        {expanded && !startHref && (
          <SessionBlocks
            session={session}
            ticking={{ ticks, onTick: (name, rounds) => { haptic("light"); setTicks(setSessionTick(sessionKey, name, rounds)); } }}
          />
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

        {showCompletion && <WorkoutCompletionDialog name={session.name} planned={plannedExercises(session, picks.map(p => p.name))} ticked={ticks} onSave={handleComplete} onClose={() => setShowCompletion(false)} />}

        {/* Actions — HR lives in the floating pulse icon; finish stays primary. */}
        <div className="flex flex-col gap-2">
          {hr.connected && (
            <div className="inline-flex items-center justify-center gap-2 font-body text-[11px] text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span>{hr.bpm ? `${hr.bpm} bpm · recording` : "Monitor connected"}</span>
            </div>
          )}
          {startHref ? (
            <Link
              to={startHref}
              onClick={() => { haptic("medium"); clearOffered(sessionKey); }}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <Play className="h-4 w-4" /> {finished ? "Open the partner class" : `Start partner class · week ${week}, session ${day}`}
            </Link>
          ) : (
            <>
            {Object.keys(ticks).length > 0 && (() => {
              const planned = plannedExercises(session);
              const complete = planned.filter(p => (ticks[p.exercise_name] ?? 0) >= (p.sets ?? 1)).length;
              return <p className="text-center font-body text-[11px] text-muted-foreground tabular-nums">{complete} of {planned.length} exercises done</p>;
            })()}
            <button
              onClick={() => setShowCompletion(true)}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold inline-flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              Finish workout
            </button>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}
