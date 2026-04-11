import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, RotateCcw, ChevronRight, Zap, MessageCircleQuestion } from "lucide-react";
import { useSignalContext, SIGNAL_MODES, PROMPT_CHIPS, type SignalMode } from "@/hooks/useSignalContext";
import { useSignalAI } from "@/hooks/useSignalAI";
import { useAMASignal } from "@/hooks/useAMASignal";
import { useAICredits } from "@/hooks/useAICredits";
import SignalResponseCard from "./SignalResponseCard";
import AMAResponseCard from "./AMAResponseCard";
import SignalListeningState from "./SignalListeningState";
import { WildStar, BotanicalSprig } from "@/components/BotanicalElements";
import { DotPattern } from "@/components/AtmosphericSection";
import { haptic } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  initialPrompt?: string;
  pageContext?: string;
}

type Stage = "invitation" | "listening" | "signal";
type PanelMode = "signal" | "ama";

const AMA_CHIPS = [
  "My urine always smells — what should I do?",
  "Am I getting enough protein?",
  "What supplements am I missing?",
  "Why am I so tired in the afternoon?",
  "What should I eat during this phase?",
  "How can I improve my sleep?",
];

export default function SignalPanel({ open, onClose, initialPrompt, pageContext }: Props) {
  const [mode, setMode] = useState<SignalMode>("today");
  const [panelMode, setPanelMode] = useState<PanelMode>("signal");
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<Stage>("invitation");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const context = useSignalContext();
  const { response: signalResponse, loading: signalLoading, error: signalError, generate, reset: signalReset, rawText: signalRawText } = useSignalAI();
  const { response: amaResponse, loading: amaLoading, error: amaError, ask, reset: amaReset, rawText: amaRawText } = useAMASignal();
  const { creditsRemaining, tier, refresh: refreshCredits } = useAICredits();
  const navigate = useNavigate();

  const loading = panelMode === "ama" ? amaLoading : signalLoading;
  const error = panelMode === "ama" ? amaError : signalError;
  const response = panelMode === "ama" ? amaResponse : signalResponse;

  // When response arrives, move to signal stage
  useEffect(() => {
    if (response && !loading) {
      setStage("signal");
    }
  }, [response, loading]);

  // Handle error — go back to invitation
  useEffect(() => {
    if (error && !loading) {
      setStage("invitation");
    }
  }, [error, loading]);

  // Auto-generate from initial prompt
  useEffect(() => {
    if (open && initialPrompt && stage === "invitation") {
      handleGenerate(initialPrompt);
    }
  }, [open, initialPrompt]);

  const handleGenerate = useCallback(
    (prompt: string) => {
      // Gate free users who have exhausted credits
      if (tier === "free" && creditsRemaining <= 0) {
        setShowUpgradeGate(true);
        return;
      }
      haptic("medium");
      setCurrentPrompt(prompt);
      setStage("listening");
      if (panelMode === "ama") {
        ask(prompt, context);
      } else {
        generate(prompt, mode, context);
      }
      setInput("");
      setShowCustomInput(false);
    },
    [generate, ask, mode, context, tier, creditsRemaining, panelMode]
  );

  const handleReset = () => {
    haptic("light");
    signalReset();
    amaReset();
    setStage("invitation");
    setCurrentPrompt("");
    setShowCustomInput(false);
  };

  const handleClose = () => {
    onClose();
    // Reset after animation completes
    setTimeout(() => {
      signalReset();
      amaReset();
      setStage("invitation");
      setCurrentPrompt("");
      setShowCustomInput(false);
      setShowUpgradeGate(false);
    }, 400);
  };

  const togglePanelMode = () => {
    haptic("light");
    handleReset();
    setPanelMode(prev => prev === "signal" ? "ama" : "signal");
  };

  // Refresh credits after a signal is generated
  useEffect(() => {
    if (response && !loading) {
      refreshCredits();
    }
  }, [response, loading, refreshCredits]);

  const chips = panelMode === "ama" ? AMA_CHIPS : (PROMPT_CHIPS[pageContext || "general"] || PROMPT_CHIPS.general);

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "this morning" : hour < 17 ? "this afternoon" : "this evening";

  if (!open) return null;

  // Upgrade gate modal for free users with 0 credits
  if (showUpgradeGate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onClick={() => { setShowUpgradeGate(false); handleClose(); }}
      >
        <div className="absolute inset-0 bg-foreground/30 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm mx-4 rounded-[24px] p-8 text-center"
          style={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }}
        >
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold italic text-foreground mb-2">
            You've used your 5 free signals this month
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Upgrade to Nourished for 150 signals — or Thriving for unlimited.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { setShowUpgradeGate(false); handleClose(); navigate("/membership"); }}
              className="w-full rounded-xl bg-primary px-4 py-3 font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-opacity"
            >
              See plans
            </button>
            <button
              onClick={() => { setShowUpgradeGate(false); handleClose(); }}
              className="w-full rounded-xl bg-secondary px-4 py-3 font-body text-sm font-medium text-foreground active:bg-secondary/80 transition-opacity"
            >
              Not now
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onClick={handleClose}
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
            background: panelMode === "ama"
              ? "linear-gradient(180deg, hsl(200 30% 28%) 0%, hsl(220 25% 22%) 100%)"
              : "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(284 22% 38%) 100%)",
          }}
        >
          {/* Atmospheric background */}
          <DotPattern color="hsl(30 33% 98%)" opacity={0.05} animate />

          {/* Header */}
          <div className="relative z-10 px-8 pt-8 pb-4 flex-shrink-0">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {stage === "signal" && (
                <button
                  onClick={handleReset}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  aria-label="New signal"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleClose}
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
                {panelMode === "ama" ? (
                  <MessageCircleQuestion size={18} color="hsl(30 33% 98%)" />
                ) : (
                  <WildStar size={18} color="hsl(30 33% 98%)" />
                )}
              </motion.div>
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50 font-medium">
                {panelMode === "ama" ? "Ask me anything" : "Signal"}
              </span>
            </div>

            {stage === "invitation" && (
              <>
                <h2 className="font-display text-[2.5rem] md:text-[3rem] font-extrabold text-primary-foreground leading-tight">
                  {panelMode === "ama" ? "Ask me anything" : "Give me a signal"}
                </h2>
                <p className="font-body text-sm text-primary-foreground/60 mt-3 leading-relaxed max-w-md">
                  {panelMode === "ama"
                    ? "I've read your journal, tracked your habits, and know your cycle. Ask me anything about your health — I'll answer specifically for you."
                    : `A gentle read on where you are ${timeGreeting}, what may be shaping this moment, and what might support you next.`}
                </p>
              </>
            )}

            {stage === "listening" && (
              <h2 className="font-display text-2xl font-extrabold text-primary-foreground">
                {panelMode === "ama" ? "Thinking..." : "Your signal"}
              </h2>
            )}

            {stage === "signal" && (
              <h2 className="font-display text-2xl font-extrabold text-primary-foreground">
                {panelMode === "ama" ? "Here's what I found" : "Your signal"}
              </h2>
            )}

            {/* Mode tabs — show on invitation for signal mode */}
            {stage === "invitation" && panelMode === "signal" && (
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
            )}

            {/* AMA/Signal toggle — show on invitation */}
            {stage === "invitation" && (
              <div className="mt-4">
                <button
                  onClick={togglePanelMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/15 hover:text-primary-foreground font-body text-xs font-medium transition-all"
                >
                  {panelMode === "ama" ? (
                    <>
                      <WildStar size={14} color="currentColor" />
                      <span>Switch to Signal mode</span>
                    </>
                  ) : (
                    <>
                      <MessageCircleQuestion className="h-3.5 w-3.5" />
                      <span>Ask me anything instead</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-4">
              <div
                className="rounded-[22px] backdrop-blur-sm p-7"
                style={{
                  backgroundColor: "hsl(24 33% 96%)",
                  color: "hsl(280 20% 25%)",
                  boxShadow: "var(--shadow-elevated)",
                }}
              >
              <AnimatePresence mode="wait">
                {/* === INVITATION STAGE === */}
                {stage === "invitation" && !error && (
                  <motion.div
                    key="invitation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 py-2"
                  >
                    {/* AMA mode: show input first */}
                    {panelMode === "ama" ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && input.trim()) handleGenerate(input.trim());
                            }}
                            placeholder="Ask anything about your health..."
                            className="flex-1 px-4 py-3 rounded-full bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            style={{ fontSize: "16px" }}
                          />
                          <button
                            onClick={() => input.trim() && handleGenerate(input.trim())}
                            disabled={!input.trim()}
                            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div>
                          <p className="font-body text-[10px] uppercase tracking-[0.15em] text-primary mb-3 font-medium">
                            Or try one of these
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {chips.map((chip, i) => (
                              <motion.button
                                key={chip}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
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
                      </>
                    ) : (
                      /* Signal mode chips */
                      <>
                        <div>
                          <p className="font-body text-[10px] uppercase tracking-[0.15em] text-primary mb-3 font-medium">
                            Choose a prompt, or ask your own
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {chips.map((chip, i) => (
                              <motion.button
                                key={chip}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
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

                        {/* "Or ask your own" */}
                        {!showCustomInput ? (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            onClick={() => { setShowCustomInput(true); haptic("light"); }}
                            className="font-body text-xs text-primary/70 underline underline-offset-4 hover:text-primary transition-colors"
                          >
                            Or ask your own question
                          </motion.button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex gap-2"
                          >
                            <input
                              autoFocus
                              type="text"
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && input.trim()) handleGenerate(input.trim());
                              }}
                              placeholder="What would you like to know?"
                              className="flex-1 px-4 py-2.5 rounded-full bg-secondary border border-border text-foreground font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              style={{ fontSize: "16px" }}
                            />
                            <button
                              onClick={() => input.trim() && handleGenerate(input.trim())}
                              disabled={!input.trim()}
                              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </motion.div>
                        )}
                      </>
                    )}

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
                        {panelMode === "ama" && (
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-body text-primary">
                            + journal · habits · supplements
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center pt-2">
                      <BotanicalSprig width={140} opacity={0.15} />
                    </div>
                  </motion.div>
                )}

                {/* === LISTENING STAGE === */}
                {stage === "listening" && (
                  <SignalListeningState key="listening" prompt={currentPrompt} />
                )}

                {/* === SIGNAL/AMA RESPONSE STAGE === */}
                {stage === "signal" && panelMode === "signal" && signalResponse && (
                  <motion.div
                    key="signal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SignalResponseCard
                      response={signalResponse}
                      onFollowUp={handleGenerate}
                      phase={context.phaseFull}
                    />
                  </motion.div>
                )}

                {stage === "signal" && panelMode === "ama" && amaResponse && (
                  <AMAResponseCard
                    key="ama"
                    response={amaResponse}
                    onFollowUp={handleGenerate}
                  />
                )}
              </AnimatePresence>

              {/* Error state */}
              {error && stage === "invitation" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-8 text-center"
                >
                  <p className="font-body text-sm text-destructive mb-3">{error}</p>
                  <button
                    onClick={() => handleGenerate(panelMode === "ama" ? "What supplements should I take?" : "Give me a signal for today")}
                    className="font-body text-sm text-primary underline underline-offset-4"
                  >
                    Try again
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Follow-up input — only after response is shown */}
          {stage === "signal" && (
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
                    placeholder={panelMode === "ama" ? "Ask a follow-up..." : "Go deeper..."}
                    className="w-full px-5 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 text-primary-foreground font-body text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 transition-all"
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => input.trim() && handleGenerate(input.trim())}
                  disabled={!input.trim() || loading}
                  className="w-12 h-12 rounded-full bg-card text-primary flex items-center justify-center disabled:opacity-40 transition-opacity shadow-md"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
