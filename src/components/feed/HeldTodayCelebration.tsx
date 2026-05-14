import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const STORAGE_KEY = "signal_feed_celebrated_";

interface Props {
  /** True when today's read count has hit the daily total. */
  complete: boolean;
}

/**
 * "You're held today" — botanical micro-celebration shown once per day
 * the moment a user finishes all of today's daily insights.
 */
export default function HeldTodayCelebration({ complete }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!complete) return;
    const k = STORAGE_KEY + format(new Date(), "yyyy-MM-dd");
    if (localStorage.getItem(k)) return;
    localStorage.setItem(k, "1");
    setShow(true);
    const t = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(t);
  }, [complete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          onAnimationStart={() => {
            try { (navigator as any).vibrate?.(30); } catch {}
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            className="relative bg-card/95 backdrop-blur-md rounded-3xl px-8 py-6 border border-primary/20 shadow-2xl text-center max-w-xs mx-4"
          >
            {/* Botanical sprig SVG */}
            <svg viewBox="0 0 120 80" className="mx-auto mb-3 w-24 h-16" fill="none">
              {/* stem */}
              <motion.path
                d="M60 75 C 58 55, 62 35, 60 10"
                stroke="hsl(145 35% 40%)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
              {/* leaves */}
              {[
                { d: "M60 60 C 45 55, 38 45, 35 38", delay: 0.6 },
                { d: "M60 50 C 75 47, 82 38, 84 30", delay: 0.85 },
                { d: "M60 38 C 48 33, 44 24, 43 18", delay: 1.05 },
                { d: "M60 28 C 70 24, 75 18, 76 12", delay: 1.2 },
              ].map((l, i) => (
                <motion.path
                  key={i}
                  d={l.d}
                  stroke="hsl(145 35% 40%)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="hsl(145 35% 60% / 0.18)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: l.delay, ease: "easeOut" }}
                />
              ))}
              {/* tiny bloom */}
              <motion.circle
                cx="60" cy="9" r="3"
                fill="hsl(340 55% 70%)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4, type: "spring", damping: 10 }}
              />
            </svg>

            <p className="font-display italic text-xl text-foreground leading-snug">
              You're held today.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1.5">
              All five — taken in. Tomorrow brings five more.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
