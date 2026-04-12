import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WildStar } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { useSignalReadiness } from "@/hooks/useSignalReadiness";

interface Props {
  onClick: () => void;
}

export default function SignalFloatingCTA({ onClick }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { isReady } = useSignalReadiness();

  // Show tooltip on first visit
  useEffect(() => {
    if (!isReady) return;
    const seen = localStorage.getItem("signal_cta_seen");
    if (!seen) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        localStorage.setItem("signal_cta_seen", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // Auto-hide tooltip
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Don't show floating CTA until Signal is ready
  if (!isReady) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] hidden md:flex flex-col items-end gap-2">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="rounded-2xl bg-card border border-border px-4 py-2.5 shadow-lg max-w-[200px]"
          >
            <p className="font-body text-xs text-foreground leading-relaxed">
              Your signal is ready — tap to receive
            </p>
            <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-card border-r border-b border-border" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          haptic("medium");
          setShowTooltip(false);
          onClick();
        }}
        className="group relative flex items-center gap-2.5 pl-5 pr-6 py-3.5 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold italic transition-all"
        style={{
          boxShadow: "var(--shadow-glow), var(--shadow-elevated)",
        }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 hsl(284 22% 44% / 0)",
              "0 0 0 6px hsl(284 22% 44% / 0.1)",
              "0 0 0 0 hsl(284 22% 44% / 0)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <WildStar size={16} color="hsl(30 33% 98%)" />
        </motion.div>
        <span>Give me a signal</span>
      </motion.button>
    </div>
  );
}
