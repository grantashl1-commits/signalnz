import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Pause, Play, RotateCcw } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

const PRESETS = [
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
  { label: "60 min", seconds: 3600 },
];

interface SleepTimerProps {
  /** Called when the timer reaches zero */
  onTimerEnd?: () => void;
}

export default function SleepTimer({ onTimerEnd }: SleepTimerProps) {
  const [selectedSeconds, setSelectedSeconds] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running || remaining <= 0) {
      clear();
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clear();
          setRunning(false);
          onTimerEnd?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return clear;
  }, [running, clear, onTimerEnd]);

  const start = (secs: number) => {
    haptic("medium");
    setSelectedSeconds(secs);
    setRemaining(secs);
    setRunning(true);
  };

  const togglePause = () => {
    haptic("light");
    setRunning((r) => !r);
  };

  const reset = () => {
    haptic("light");
    clear();
    setRunning(false);
    setRemaining(0);
    setSelectedSeconds(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = selectedSeconds ? 1 - remaining / selectedSeconds : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-[#1a1625]/95 p-5 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <Moon className="h-4 w-4 text-indigo-300" />
        <span className="font-display text-sm italic text-indigo-200">Sleep Timer</span>
      </div>

      <AnimatePresence mode="wait">
        {!selectedSeconds ? (
          <motion.div
            key="presets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-body text-xs text-indigo-300/70 mb-3">
              Set a timer to auto-stop your guided practice
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  onClick={() => start(p.seconds)}
                  className="rounded-xl bg-indigo-500/15 border border-indigo-400/20 py-3 px-2 font-display text-sm italic text-indigo-200 hover:bg-indigo-500/25 active:scale-[0.96] transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            {/* Circular timer */}
            <div className="relative w-32 h-32 mb-4">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="rgba(129,140,248,0.1)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="rgba(129,140,248,0.6)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  transition={{ duration: 0.5, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-indigo-100">
                  {formatTime(remaining)}
                </span>
                <span className="font-body text-[10px] text-indigo-300/50 mt-0.5">remaining</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePause}
                className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-200 hover:bg-indigo-500/30 active:scale-95 transition-all"
              >
                {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button
                onClick={reset}
                className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-400/15 flex items-center justify-center text-indigo-300/60 hover:text-indigo-200 active:scale-95 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background music toggle */}
      {onToggleMusic && (
        <div className="mt-4 pt-3 border-t border-indigo-400/10">
          <button
            onClick={() => { haptic("light"); onToggleMusic(); }}
            disabled={musicLoading}
            className="w-full flex items-center justify-between rounded-xl bg-indigo-500/10 border border-indigo-400/15 px-4 py-3 hover:bg-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              {musicPlaying ? (
                <Volume2 className="h-4 w-4 text-indigo-300" />
              ) : (
                <VolumeX className="h-4 w-4 text-indigo-400/50" />
              )}
              <span className="font-body text-xs text-indigo-200">
                {musicLoading ? "Generating ambient sounds…" : "Background music"}
              </span>
            </div>
            <div
              className={`w-9 h-5 rounded-full transition-colors relative ${
                musicPlaying ? "bg-indigo-500" : "bg-indigo-500/20"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                animate={{ left: musicPlaying ? 18 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </div>
      )}
    </motion.div>
  );
}
