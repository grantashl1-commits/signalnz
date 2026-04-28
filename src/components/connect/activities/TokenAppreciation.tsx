import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, BookHeart, RotateCcw, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { haptic } from "@/hooks/use-mobile";

/* ──────────────────────────────────────────────────────────────
   Token Appreciation Game
   A reframed, copyright-safe twist on a classic couples ritual:
   start the day with a handful of tokens; pass one to your partner
   each time you notice something worth appreciating, with a
   two-level note ("what they did" + "why it mattered"). Inspired by
   Gottman's research on building a culture of appreciation.
   ────────────────────────────────────────────────────────────── */

interface TokenNote {
  id: string;
  what: string;
  why: string;
  at: number;
}

interface Props {
  content: {
    startingTokens?: number;     // default 5
    promptWhat?: string;
    promptWhy?: string;
    storageKey?: string;         // override per-instance
  };
  onComplete: (response: any) => void;
}

const DEFAULT_PROMPT_WHAT = "What did your partner do? Be specific.";
const DEFAULT_PROMPT_WHY = "Why did it matter? How did it leave you feeling?";

export default function TokenAppreciation({ content, onComplete }: Props) {
  const startingTokens = content.startingTokens ?? 5;
  const storageKey = content.storageKey || "connect-token-appreciation-v1";

  const [tokensLeft, setTokensLeft] = useState(startingTokens);
  const [jar, setJar] = useState<TokenNote[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [flying, setFlying] = useState(false);
  const [showJar, setShowJar] = useState(false);
  const [completedOnce, setCompletedOnce] = useState(false);

  // Hydrate from localStorage so the ritual persists across the day
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.tokensLeft === "number") setTokensLeft(data.tokensLeft);
        if (Array.isArray(data.jar)) setJar(data.jar);
        if (data.completedOnce) setCompletedOnce(true);
      }
    } catch {/* ignore */}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ tokensLeft, jar, completedOnce })
      );
    } catch {/* ignore */}
  }, [tokensLeft, jar, completedOnce, storageKey]);

  const canSubmit = what.trim().length >= 3 && why.trim().length >= 3 && tokensLeft > 0;

  const handleOpenCompose = () => {
    if (tokensLeft <= 0) return;
    haptic("light");
    setComposeOpen(true);
  };

  const handleSend = () => {
    if (!canSubmit) return;
    haptic("medium");
    setFlying(true);

    const note: TokenNote = {
      id: crypto.randomUUID(),
      what: what.trim(),
      why: why.trim(),
      at: Date.now(),
    };

    // Slight delay to let the token "fly" before counters update
    window.setTimeout(() => {
      setJar((j) => [note, ...j]);
      setTokensLeft((n) => Math.max(0, n - 1));
      setWhat("");
      setWhy("");
      setComposeOpen(false);
      setFlying(false);

      if (!completedOnce) {
        setCompletedOnce(true);
        onComplete({
          gave: 1,
          totalGiven: jar.length + 1,
          firstNote: note,
        });
      }
    }, 650);
  };

  const handleRefill = () => {
    haptic("light");
    setTokensLeft(startingTokens);
  };

  // Build token slots
  const tokens = useMemo(
    () => Array.from({ length: startingTokens }, (_, i) => i < tokensLeft),
    [startingTokens, tokensLeft]
  );

  return (
    <div className="space-y-5">
      {/* Why this matters */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-display text-sm font-bold text-foreground">
              Notice the good. Out loud.
            </p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Our brains are wired to scan for what's wrong. This little ritual rewires that —
              you'll start spotting (and saying) what's right. Not a competition. A practice.
            </p>
          </div>
        </div>
      </div>

      {/* Token bracelet */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your tokens
          </p>
          <p className="font-display text-xs font-bold text-foreground">
            {tokensLeft} / {startingTokens}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 py-2 min-h-[64px]">
          <AnimatePresence mode="popLayout">
            {tokens.map((isFull, i) => (
              <motion.div
                key={i}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.04 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isFull
                    ? "bg-primary/15 border-2 border-primary/40 shadow-sm"
                    : "bg-transparent border-2 border-dashed border-border"
                }`}
              >
                {isFull && <Heart className="h-4 w-4 text-primary fill-primary/40" />}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Flying token animation */}
          <AnimatePresence>
            {flying && (
              <motion.div
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: 120, y: -90, opacity: 0, scale: 0.6, rotate: 25 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute pointer-events-none"
              >
                <Heart className="h-6 w-6 text-primary fill-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action row */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleOpenCompose}
            disabled={tokensLeft <= 0}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Give a token
          </button>
          {tokensLeft <= 0 && (
            <button
              onClick={handleRefill}
              className="px-4 py-3 rounded-xl bg-secondary text-foreground font-body text-sm font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Refill
            </button>
          )}
        </div>

        {tokensLeft <= 0 && (
          <p className="text-[11px] text-muted-foreground text-center mt-2 italic">
            All given — well noticed. Refill when you're ready for tomorrow.
          </p>
        )}
      </div>

      {/* Jar summary */}
      <button
        onClick={() => setShowJar((s) => !s)}
        className="w-full rounded-2xl border border-border bg-card p-3 flex items-center justify-between active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <BookHeart className="h-4 w-4 text-foreground" />
          </div>
          <div className="text-left">
            <p className="font-display text-sm font-bold text-foreground">
              Appreciation jar
            </p>
            <p className="font-body text-[11px] text-muted-foreground">
              {jar.length === 0
                ? "Empty for now — your first will land here"
                : `${jar.length} ${jar.length === 1 ? "moment" : "moments"} saved`}
            </p>
          </div>
        </div>
        <span className="text-xs font-body text-primary font-semibold">
          {showJar ? "Hide" : "Open"}
        </span>
      </button>

      <AnimatePresence>
        {showJar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {jar.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                When things feel hard, come back here and read.
              </p>
            )}
            {jar.map((n) => (
              <div
                key={n.id}
                className="rounded-xl bg-secondary/40 border border-border/60 p-3 space-y-1"
              >
                <p className="font-body text-xs text-foreground leading-relaxed">
                  <span className="font-semibold">They:</span> {n.what}
                </p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold">It mattered because:</span> {n.why}
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  {new Date(n.at).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gentle reminder */}
      <p className="text-[10px] text-muted-foreground/60 text-center italic px-4 leading-relaxed">
        Not a scoreboard. If you're not giving many, try noticing for a week before judging —
        the brain in resentment mode often misses the small kindnesses already there.
      </p>

      {/* Compose sheet */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setComposeOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-bold text-foreground">
                  A two-level appreciation
                </p>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-body text-xs font-semibold text-foreground">
                  {content.promptWhat || DEFAULT_PROMPT_WHAT}
                </label>
                <Textarea
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  placeholder="e.g. You brought me a cup of tea in bed this morning."
                  rows={3}
                  className="resize-none rounded-xl border-border focus:border-primary text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="font-body text-xs font-semibold text-foreground">
                  {content.promptWhy || DEFAULT_PROMPT_WHY}
                </label>
                <Textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder="e.g. It made me feel cared for and thought of — I felt loved and special."
                  rows={3}
                  className="resize-none rounded-xl border-border focus:border-primary text-sm"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!canSubmit}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Pass the token
              </button>

              <p className="text-[10px] text-muted-foreground text-center italic">
                Say it out loud to your partner as you "pass" the token.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
