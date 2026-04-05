import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGiveSignal, MOON_GLYPHS } from "@/hooks/useGiveSignal";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GiveSignalPanel({ open, onClose }: Props) {
  const { response, loading, error, generate, reset } = useGiveSignal();
  const [showAttribution, setShowAttribution] = useState(false);

  // Auto-generate when panel opens
  useEffect(() => {
    if (open && !response && !loading) {
      generate();
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      reset();
      setShowAttribution(false);
    }, 400);
  };

  const handleAnother = () => {
    haptic("medium");
    reset();
    setShowAttribution(false);
    generate();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
        onClick={handleClose}
      >
        {/* Dark backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, rgba(196, 82, 110, 0.05) 0%, transparent 70%)",
          }}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm mx-4 mb-4 md:mb-0"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="space-y-6">
            {/* Header */}
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/40">
              ✦ your signal
            </p>

            {/* Loading state */}
            {loading && (
              <motion.div className="flex gap-2 items-center py-10">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#C4526E" }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
                  />
                ))}
                <span className="text-white/30 text-[11px] font-mono ml-3 tracking-wide">
                  reading the current...
                </span>
              </motion.div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="py-8 text-center">
                <p className="text-red-400/80 text-sm font-mono mb-3">{error}</p>
                <button
                  onClick={handleAnother}
                  className="text-white/40 text-[11px] font-mono underline underline-offset-4 hover:text-white/60 transition-colors"
                >
                  try again
                </button>
              </div>
            )}

            {/* Message */}
            {response && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="space-y-5"
              >
                {/* Message box */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/[0.08]">
                  <p className="text-white/[0.88] text-lg leading-[1.75] font-display italic">
                    {response.message}
                  </p>
                </div>

                {/* Meta line */}
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-white/40">
                    {MOON_GLYPHS[response.moonPhase] || "🌙"} {response.moonPhase}
                  </p>
                  {response.sunSign && (
                    <p className="font-mono text-[10px] text-white/40">
                      {response.sunSign}
                    </p>
                  )}
                  <button
                    onClick={() => setShowAttribution(!showAttribution)}
                    className="font-mono text-[10px] text-white/40 hover:text-white/60 transition-colors"
                  >
                    from the dao in action
                  </button>
                  {showAttribution && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="font-mono text-[10px] text-white/25 italic"
                    >
                      "{response.fableTitle}" · {response.daoChapter}
                    </motion.p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.08]" />

                {/* Another signal */}
                <div className="flex justify-center">
                  <button
                    onClick={handleAnother}
                    disabled={loading}
                    className="text-white/35 text-[11px] font-mono border border-white/[0.08] rounded-full px-4 py-2 hover:border-[#C4526E]/30 hover:text-white/55 transition-all disabled:opacity-20"
                  >
                    receive another signal
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
