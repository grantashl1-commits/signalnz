import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronRight, Check, Circle } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { DotPattern } from "@/components/AtmosphericSection";
import { PROMPT_CHIPS } from "@/hooks/useSignalContext";
import { useSignalReadiness } from "@/hooks/useSignalReadiness";
import { haptic } from "@/hooks/use-mobile";
import signalOracle from "@/assets/signal-oracle.png";

interface Props {
  onOpenSignal: (prompt?: string) => void;
}

export default function SignalHomeSection({ onOpenSignal }: Props) {
  const chips = PROMPT_CHIPS.home;
  const { isReady, signalCount, maxSignals, phase, glowIntensity, contextChips, signals } = useSignalReadiness();
  const [hasEverSeen, setHasEverSeen] = useState(false);

  // Track when user first sees Signal unlocked
  useEffect(() => {
    if (isReady && !hasEverSeen) {
      const seen = localStorage.getItem("signal_unlock_seen");
      if (!seen) {
        localStorage.setItem("signal_unlock_seen", "true");
        haptic("medium");
      }
      setHasEverSeen(true);
    }
  }, [isReady, hasEverSeen]);

  // Glow colours that intensify with more data
  const glowOpacity = 0.03 + glowIntensity * 0.12;
  const ringOpacity = 0.1 + glowIntensity * 0.3;
  const pulseScale = 1 + glowIntensity * 0.06;

  // ─── NOT READY STATE ───
  if (!isReady) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative overflow-hidden rounded-[26px] p-8 md:p-10"
        style={{
          background: "linear-gradient(160deg, hsl(var(--card)) 0%, hsl(24 20% 93%) 100%)",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {/* Subtle ambient glow that grows */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[26px]"
          animate={{
            boxShadow: [
              `0 0 ${20 + glowIntensity * 40}px ${glowIntensity * 15}px hsl(284 22% 44% / ${glowOpacity})`,
              `0 0 ${30 + glowIntensity * 60}px ${glowIntensity * 25}px hsl(284 22% 44% / ${glowOpacity * 1.3})`,
              `0 0 ${20 + glowIntensity * 40}px ${glowIntensity * 15}px hsl(284 22% 44% / ${glowOpacity})`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Inner radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 70% at 50% 40%, hsl(284 22% 55% / ${glowOpacity}), transparent)`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Oracle illustration with ambient ring */}
          <div className="relative mb-6">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(284 22% 55% / ${ringOpacity}), transparent 70%)`,
                transform: `scale(${pulseScale})`,
              }}
              animate={{
                scale: [pulseScale, pulseScale * 1.15, pulseScale],
                opacity: [ringOpacity, ringOpacity * 1.4, ringOpacity],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src={signalOracle}
              alt="Signal oracle"
              width={120}
              height={120}
              className="relative z-10 opacity-40"
              style={{ filter: "grayscale(60%)" }}
              animate={{ opacity: [0.3 + glowIntensity * 0.3, 0.4 + glowIntensity * 0.3, 0.3 + glowIntensity * 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {phase === "mystery" ? (
            /* ─── MYSTERY PHASE ─── */
            <>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-3"
              >
                <WildStar size={16} color="hsl(var(--primary))" />
              </motion.div>
              <h3 className="font-display text-lg font-bold italic text-foreground/60 mb-2">
                your signal is tuning in...
              </h3>
              <p className="font-body text-xs text-muted-foreground/60 max-w-[260px] leading-relaxed">
                The more you share with Signal today, the clearer your reading becomes.
              </p>

              {/* Subtle dot progress — no labels, just mystery */}
              <div className="flex gap-2 mt-5">
                {Array.from({ length: maxSignals }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i < signalCount
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground) / 0.15)",
                    }}
                    animate={i < signalCount ? {
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ─── TRANSPARENT PHASE ─── */
            <>
              <h3 className="font-display text-lg font-bold italic text-foreground/60 mb-2">
                your signal is tuning in
              </h3>
              <p className="font-body text-xs text-muted-foreground/60 max-w-[280px] leading-relaxed mb-4">
                Complete a little more today to unlock your personal reading.
              </p>

              {/* Activity checklist */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { key: "habits", label: "2+ habits", done: signals.habits },
                  { key: "journal", label: "journal", done: signals.journal },
                  { key: "cycle", label: "cycle", done: signals.cycle },
                  { key: "mood", label: "mood", done: signals.mood },
                  { key: "movement", label: "movement", done: signals.movement },
                ].map(({ key, label, done }) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body"
                    style={{
                      backgroundColor: done ? "hsl(var(--primary) / 0.1)" : "hsl(var(--muted) / 0.5)",
                      color: done ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)",
                    }}
                  >
                    {done ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <p className="font-body text-[10px] text-muted-foreground/40 mt-3">
                {signalCount}/2 needed to unlock
              </p>
            </>
          )}
        </div>
      </motion.section>
    );
  }

  // ─── READY STATE — Signal is unlocked ───
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-[26px] p-10 md:p-12"
      style={{
        background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(284 22% 40%) 100%)",
      }}
    >
      <DotPattern color="hsl(30 33% 98%)" opacity={0.05} animate />

      {/* Radial glow — intensifies with more data */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [glowIntensity * 0.6, glowIntensity * 0.9, glowIntensity * 0.6],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(ellipse 60% 60% at 50% 30%, hsl(284 30% 64% / 0.2), transparent)`,
        }}
      />

      {/* Oracle illustration — now vivid */}
      <motion.div
        className="absolute top-4 right-4 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <img
          src={signalOracle}
          alt=""
          width={140}
          height={140}
          loading="lazy"
          className="opacity-30"
          style={{ filter: "brightness(2) contrast(0.8)" }}
        />
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <WildStar size={16} color="hsl(30 33% 98%)" />
          </motion.div>
          <span className="font-body text-xs uppercase tracking-[0.25em] text-primary-foreground/40 font-medium">
            your signal is ready
          </span>
        </div>

        <h3 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight mb-3">
          Give me a signal
        </h3>

        {/* Context chips — show what data informed the signal */}
        {contextChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {contextChips.map((chip) => (
              <span
                key={chip}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-body font-medium bg-primary-foreground/10 text-primary-foreground/50"
              >
                <Check className="h-2.5 w-2.5" />
                {chip}
              </span>
            ))}
          </div>
        )}

        <p className="font-body text-sm text-primary-foreground/50 leading-relaxed max-w-md mb-8">
          I've read your {contextChips.length > 0 ? contextChips.join(", ") : "activity"} today. Here's what the pattern is telling me.
        </p>

        {/* Main CTA */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptic("medium");
              onOpenSignal("Give me a signal for today");
            }}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-card text-foreground font-display text-sm font-semibold shadow-elevated hover:shadow-glow transition-shadow"
          >
            <WildStar size={14} color="hsl(var(--primary))" />
            Give me a signal
          </motion.button>

          <button
            onClick={() => {
              haptic("light");
              onOpenSignal();
            }}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-primary-foreground/8 border border-primary-foreground/10 text-primary-foreground/60 font-body text-xs hover:text-primary-foreground hover:bg-primary-foreground/12 transition-all"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Listen
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-2.5">
          {chips.map((chip) => (
            <motion.button
              key={chip}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                haptic("light");
                onOpenSignal(chip);
              }}
              className="group flex items-center gap-1 px-4 py-2.5 rounded-full bg-primary-foreground/6 border border-primary-foreground/8 text-primary-foreground/60 font-body text-xs hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all"
            >
              <span>{chip}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
