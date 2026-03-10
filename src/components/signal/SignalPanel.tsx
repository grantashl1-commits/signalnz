import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Sparkles, ArrowRight, RotateCcw, ChevronRight } from "lucide-react";
import { useSignalContext, SIGNAL_MODES, PROMPT_CHIPS, type SignalMode } from "@/hooks/useSignalContext";
import { useSignalAI } from "@/hooks/useSignalAI";
import SignalResponseCard from "./SignalResponseCard";
import { WildStar, BotanicalSprig } from "@/components/BotanicalElements";
import { DotPattern } from "@/components/AtmosphericSection";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  open: boolean;
  onClose: () => void;
  initialPrompt?: string;
  pageContext?: string;
}

export default function SignalPanel({ open, onClose, initialPrompt, pageContext }: Props) {
  const [mode, setMode] = useState<SignalMode>("today");
  const [input, setInput] = useState("");
  const [hasEverGenerated, setHasEverGenerated] = useState(false);
  const context = useSignalContext();
  const { response, loading, error, generate, reset, rawText } = useSignalAI();

  useEffect(() => {
    if (open && initialPrompt && !hasEverGenerated) {
      handleGenerate(initialPrompt);
    }
  }, [open, initialPrompt]);

  const handleGenerate = useCallback(
    (prompt: string) => {
      haptic("medium");
      setHasEverGenerated(true);
      generate(prompt, mode, context);
      setInput("");
    },
    [generate, mode, context]
  );

  const handleReset = () => {
    haptic("light");
    reset();
    setHasEverGenerated(false);
  };

  const chips = PROMPT_CHIPS[pageContext || "general"] || PROMPT_CHIPS.general;

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "this morning" : hour < 17 ? "this afternoon" : "this evening";

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-foreground/30 backdrop-blur-md" />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-[28px] overflow-hidden flex flex-col"
          style={{
            background: "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(284 22% 38%) 100%)",
          }}
        >
          {/* Atmospheric background */}
          <DotPattern color="hsl(30 33% 98%)" opacity={0.06} />

          {/* Header */}
          <div className="relative z-10 px-8 pt-8 pb-4 flex-shrink-0">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {hasEverGenerated && (
                <button
                  onClick={handleReset}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  aria-label="New signal"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <WildStar size={18} color="hsl(30 33% 98%)" />
              </motion.div>
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50 font-medium">
                Signal
              </span>
            </div>

            {!hasEverGenerated ? (
              <>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight">
                  Give me a signal
                </h2>
                <p className="font-body text-sm text-primary-foreground/60 mt-3 leading-relaxed max-w-md">
                  A gentle read on where you are {timeGreeting}, what may be shaping this moment, and what might support you next.
                </p>
              </>
            ) : (
              <h2 className="font-display text-2xl font-extrabold text-primary-foreground">
                Your signal
              </h2>
            )}

            {/* Mode tabs */}
            <div className="flex gap-1.5 mt-6 overflow-x-auto pb-1 -mx-1 px-1">
              {SIGNAL_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { haptic("light"); setMode(m.id); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-body font-medium transition-all ${
                    mode === m.id
                      ? "bg-primary-foreground text-primary shadow-sm"
                      : "bg-primary-foreground/10 text-primary-foreground/60 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content area — cream card inside purple */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-4">
            <div className="rounded-[20px] bg-card/95 backdrop-blur-sm border border-border/30 p-6" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}>
              {/* Loading state */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <WildStar size={32} color="hsl(var(--primary))" />
                  </motion.div>
                  <p className="font-display text-sm italic text-muted-foreground">
                    Reading your signal...
                  </p>
                </motion.div>
              )}

              {/* Error state */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-8 text-center"
                >
                  <p className="font-body text-sm text-destructive mb-3">{error}</p>
                  <button
                    onClick={() => handleGenerate("Give me a signal for today")}
                    className="font-body text-sm text-primary underline underline-offset-4"
                  >
                    Try again
                  </button>
                </motion.div>
              )}

              {/* Response */}
              {response && !loading && (
                <SignalResponseCard
                  response={response}
                  onFollowUp={handleGenerate}
                  phase={context.phaseFull}
                />
              )}

              {/* Welcome / prompt chips */}
              {!response && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6 py-2"
                >
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.15em] text-primary mb-3 font-medium">
                      Tap a prompt, or ask your own
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chips.map((chip) => (
                        <motion.button
                          key={chip}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleGenerate(chip)}
                          className="group flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary border border-border text-foreground font-body text-xs leading-tight hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                          <span>{chip}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Context summary */}
                  <div className="rounded-2xl bg-secondary/60 p-4">
                    <p className="font-body text-[10px] uppercase tracking-[0.15em] text-primary mb-2 font-medium">
                      What I know about you right now
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-card text-xs font-body text-muted-foreground">
                        Day {context.cycleDay} · {context.phase}
                      </span>
                      {context.mood && (
                        <span className="px-2.5 py-1 rounded-full bg-card text-xs font-body text-muted-foreground">
                          Feeling {context.mood.toLowerCase()}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-card text-xs font-body text-muted-foreground">
                        {context.timeOfDay}
                      </span>
                      {context.habitsTotal > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-card text-xs font-body text-muted-foreground">
                          {context.habitsCompleted}/{context.habitsTotal} habits
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <BotanicalSprig width={140} opacity={0.15} />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="relative z-10 flex-shrink-0 px-8 pb-8 pt-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) handleGenerate(input.trim());
                  }}
                  placeholder="Ask for a signal..."
                  className="w-full px-5 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 text-primary-foreground font-body text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => input.trim() && handleGenerate(input.trim())}
                disabled={!input.trim() || loading}
                className="w-12 h-12 rounded-full bg-card text-primary flex items-center justify-center disabled:opacity-40 transition-opacity shadow-md"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </motion.button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3 opacity-40">
              <Volume2 className="h-3 w-3 text-primary-foreground/50" />
              <span className="font-body text-[10px] text-primary-foreground/50">
                Voice signals coming soon
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
