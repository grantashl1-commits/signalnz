import { AnimatePresence, motion } from "framer-motion";
import { Heart, ChevronUp } from "lucide-react";
import LiveHRView from "@/components/movement/LiveHRView";
import { useGlobalHeartRate } from "@/contexts/HeartRateContext";

function formatElapsed(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Renders the live HR overlay (when open) plus a floating mini-bar that
 * stays visible across the whole app while a session is recording in the
 * background. Tap the bar to restore the overlay.
 */
export default function LiveHRRoot() {
  const hr = useGlobalHeartRate();
  const showBar = hr.live.active && !hr.live.open;

  return (
    <>
      {hr.live.open && <LiveHRView />}

      <AnimatePresence>
        {showBar && (
          <motion.button
            key="hr-mini-bar"
            type="button"
            onClick={hr.restoreLive}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            aria-label="Resume heart rate session"
            className="fixed left-1/2 -translate-x-1/2 bottom-[88px] md:bottom-6 z-[60]
                       flex items-center gap-3 rounded-full bg-primary text-primary-foreground
                       shadow-xl pl-4 pr-3 py-2 max-w-[92vw]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-foreground/60 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-foreground" />
            </span>
            <Heart className="h-4 w-4" />
            <span className="font-body text-sm font-bold tabular-nums">
              {hr.bpm || "—"}
              <span className="font-body text-[10px] font-normal opacity-70 ml-0.5">bpm</span>
            </span>
            <span className="font-body text-xs opacity-80 tabular-nums">
              {formatElapsed(hr.liveElapsed)}
            </span>
            <span className="font-body text-xs italic opacity-90 truncate max-w-[120px]">
              {hr.live.workoutName}
            </span>
            <ChevronUp className="h-4 w-4 opacity-80" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
