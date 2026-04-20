/**
 * FloatingWorkoutTimer
 *
 * Persistent mini-bar shown across the app whenever a workout interval timer
 * is running but the user has navigated away from its screen.
 * Tap the bar to return to the original workout screen.
 */
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import {
  useWorkoutTimer,
  pauseWorkoutTimer,
  resumeWorkoutTimer,
  stopWorkoutTimer,
  getDisplayRemaining,
} from "@/lib/workout-timer-store";
import { haptic } from "@/hooks/use-mobile";

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function FloatingWorkoutTimer() {
  const session = useWorkoutTimer();
  const location = useLocation();

  if (!session) return null;
  if (session.finished) return null;
  // Hide on the page that owns the timer (full UI is already there).
  if (location.pathname === session.returnPath) return null;

  const remaining = getDisplayRemaining(session);
  const current = session.steps[session.stepIdx];
  const isRest = current?.kind === "rest" || current?.kind === "recovery" || current?.kind === "walk";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed left-3 right-3 z-[60] md:left-auto md:right-6 md:w-80"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }}
      >
        <Link
          to={session.returnPath}
          className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md px-3 py-2.5 shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform"
        >
          {/* Live time */}
          <div className="flex flex-col items-center justify-center min-w-[58px] py-1 rounded-xl bg-primary/10">
            <span className="font-display text-lg font-bold tabular-nums text-foreground leading-none">
              {fmt(remaining)}
            </span>
            <span className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {isRest ? "rest" : "work"}
            </span>
          </div>
          {/* Title + step */}
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-semibold text-foreground truncate">{session.title}</p>
            <p className="font-body text-[11px] text-muted-foreground truncate">
              {current?.label} · {session.stepIdx + 1}/{session.steps.length}
            </p>
          </div>
          {/* Controls */}
          <button
            onClick={(e) => {
              e.preventDefault();
              haptic("light");
              if (session.running) pauseWorkoutTimer();
              else resumeWorkoutTimer();
            }}
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            aria-label={session.running ? "Pause" : "Resume"}
          >
            {session.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              haptic("medium");
              stopWorkoutTimer();
            }}
            className="h-9 w-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center"
            aria-label="End timer"
          >
            <X className="h-4 w-4" />
          </button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
