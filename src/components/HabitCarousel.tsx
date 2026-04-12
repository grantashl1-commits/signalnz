import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { HABIT_CAROUSEL_CARDS } from "@/data/habit-carousel-data";
import { CardMotif } from "@/components/CardMotifs";
import { getAvailableCardIds, recordDraw, canDrawToday } from "@/lib/wisdom-cooldown";
import { haptic } from "@/hooks/use-mobile";

const CATEGORY_LABELS: Record<string, string> = {
  mindset: "Mindset", science: "Science", strategy: "Strategy",
  motivation: "Motivation", "self-care": "Self Care", foundations: "Foundations",
};

export default function HabitCarousel() {
  const [ritualOpen, setRitualOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [todayCard, setTodayCard] = useState<typeof HABIT_CAROUSEL_CARDS[0] | null>(null);
  const drawAllowed = canDrawToday();

  // Get available deck (excluding cooldown cards)
  const availableDeck = useMemo(() => {
    const ids = getAvailableCardIds(HABIT_CAROUSEL_CARDS.map(c => c.id));
    return HABIT_CAROUSEL_CARDS.filter(c => ids.includes(c.id));
  }, []);

  // Shuffle for the fan
  const shuffled = useMemo(() => {
    const arr = [...availableDeck];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [availableDeck]);

  const openRitual = useCallback(() => {
    haptic("medium");
    setRitualOpen(true);
    setSelectedIndex(null);
    setFlipped(false);
  }, []);

  const selectCard = useCallback((index: number) => {
    haptic("light");
    setSelectedIndex(index);
    // Delay the flip for dramatic effect
    setTimeout(() => {
      setFlipped(true);
      haptic("medium");
      const card = shuffled[index];
      recordDraw(card.id);
      setTodayCard(card);
    }, 600);
  }, [shuffled]);

  const closeRitual = useCallback(() => {
    setRitualOpen(false);
    setSelectedIndex(null);
    setFlipped(false);
  }, []);

  return (
    <div className="mt-8 mb-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">Inner Wisdom</h3>
        <span className="font-body text-[10px] text-muted-foreground ml-auto">
          {availableDeck.length} cards in deck
        </span>
      </div>

      {/* Draw button or today's card */}
      {todayCard && !ritualOpen ? (
        <RevealedCard card={todayCard} onDrawAgain={drawAllowed ? openRitual : undefined} />
      ) : (
        <button
          onClick={openRitual}
          disabled={!drawAllowed}
          className="w-full rounded-[20px] bg-gradient-to-b from-[hsl(284,25%,20%)] to-[hsl(284,20%,16%)] p-8 flex flex-col items-center gap-4 shadow-soft transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <div className="w-16 h-16 text-primary-foreground/30">
            <CardMotif motif="moon" className="w-full h-full" />
          </div>
          <span className="font-display text-primary-foreground/90 text-base font-medium">
            {drawAllowed ? "Draw Your Card" : "Return Tomorrow"}
          </span>
          <span className="font-body text-primary-foreground/40 text-xs">
            {drawAllowed
              ? "Tap to receive today's inner wisdom"
              : "Your wisdom needs time to settle"}
          </span>
        </button>
      )}

      {/* Full-screen ritual overlay */}
      <AnimatePresence>
        {ritualOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[hsl(284,30%,8%)]/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={closeRitual}
              className="absolute top-[calc(var(--safe-top)+16px)] right-4 h-11 w-11 rounded-full bg-white/15 border border-white/20 flex items-center justify-center z-10 active:bg-white/25 transition-colors"
            >
              <X className="h-5 w-5 text-white/80" />
            </button>

            {selectedIndex === null ? (
              /* Fan of cards */
              <FanView
                deck={shuffled}
                onSelect={selectCard}
              />
            ) : (
              /* Selected card flipping */
              <FlipCard
                card={shuffled[selectedIndex]}
                flipped={flipped}
                onClose={closeRitual}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Fan View ── */
function FanView({ deck, onSelect }: { deck: typeof HABIT_CAROUSEL_CARDS; onSelect: (i: number) => void }) {
  const total = Math.min(deck.length, 12); // show max 12 in fan
  const arcSpread = 120; // total arc degrees
  const startAngle = -arcSpread / 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex items-center justify-center"
      style={{ width: 320, height: 400 }}
    >
      <p className="absolute top-4 font-display text-sm text-white/50 tracking-widest uppercase">
        Choose your card
      </p>

      {deck.slice(0, total).map((card, i) => {
        const angle = startAngle + (arcSpread / (total - 1)) * i;
        const radians = (angle * Math.PI) / 180;
        const radius = 180;
        const x = Math.sin(radians) * radius * 0.5;
        const y = -Math.cos(radians) * radius * 0.3 + 60;

        return (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 200, rotate: 0 }}
            animate={{
              opacity: 1,
              x,
              y,
              rotate: angle * 0.6,
            }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: y - 20, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(i)}
            className="absolute w-[72px] h-[108px] rounded-xl cursor-pointer"
            style={{
              background: "linear-gradient(135deg, hsl(284,22%,30%), hsl(284,18%,22%))",
              border: "1px solid hsl(284,30%,40%,0.3)",
              boxShadow: "0 4px 20px hsl(284,30%,10%,0.5)",
            }}
          >
            {/* Card back design */}
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              <div className="w-[56px] h-[84px] rounded-lg border border-primary-foreground/10 flex items-center justify-center">
                <CardMotif motif="star" className="w-8 h-8 text-primary-foreground/20" />
              </div>
            </div>
          </motion.button>
        );
      })}

      {/* Decorative dots */}
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={`dot-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
        />
      ))}
    </motion.div>
  );
}

/* ── Flip Card ── */
function FlipCard({
  card,
  flipped,
  onClose,
}: {
  card: typeof HABIT_CAROUSEL_CARDS[0];
  flipped: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-[280px] h-[420px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Back face */}
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, hsl(284,22%,30%), hsl(284,18%,22%))",
            border: "1px solid hsl(284,30%,40%,0.3)",
            boxShadow: "0 8px 40px hsl(284,30%,10%,0.6)",
          }}
        >
          <div className="w-[240px] h-[380px] rounded-xl border border-primary-foreground/10 flex flex-col items-center justify-center gap-4">
            <CardMotif motif="star" className="w-16 h-16 text-primary-foreground/20" />
            <span className="font-display text-xs uppercase tracking-[0.3em] text-primary-foreground/25">
              Inner Wisdom
            </span>
          </div>
        </div>

        {/* Front face (revealed) */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(180deg, hsl(30,33%,97%), hsl(25,25%,93%))",
            border: "1px solid hsl(25,20%,85%)",
            boxShadow: "0 8px 40px hsl(25,20%,30%,0.15)",
          }}
        >
          <div className="h-full flex flex-col items-center px-6 py-7">
            {/* Motif illustration */}
            <CardMotif motif={card.motif} className="w-20 h-20 text-[hsl(284,20%,55%)] opacity-50" />

            {/* Arcana & numeral */}
            <span className="font-body text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 mt-2">
              {card.numeral} · {card.arcana}
            </span>

            {/* Title */}
            <h3 className="font-display text-lg font-bold text-foreground text-center mt-3 leading-snug">
              {card.title}
            </h3>

            {/* Category */}
            <span className="font-body text-[9px] uppercase tracking-widest text-muted-foreground/40 mt-1">
              {CATEGORY_LABELS[card.category]}
            </span>

            {/* Divider with dots */}
            <div className="flex items-center gap-1 my-3">
              {[...Array(9)].map((_, i) => (
                <span key={i} className="w-0.5 h-0.5 rounded-full bg-muted-foreground/20" />
              ))}
            </div>

            {/* Wisdom & Vision */}
            <p className="font-body text-[13px] text-foreground/70 leading-relaxed text-center italic flex-shrink-0">
              {card.wisdom}
            </p>
            <p className="font-body text-[13px] text-foreground font-medium leading-relaxed text-center mt-2.5 flex-1">
              {card.vision}
            </p>

            {/* Source */}
            <div className="mt-auto pt-3 border-t border-border/50 w-full text-center">
              <p className="font-body text-[9px] text-muted-foreground/40 italic">
                {card.book} — {card.author}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {flipped && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onClose}
          className="font-body text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          tap to close
        </motion.button>
      )}
    </div>
  );
}

/* ── Revealed Card (shown after drawing) ── */
function RevealedCard({
  card,
  onDrawAgain,
}: {
  card: typeof HABIT_CAROUSEL_CARDS[0];
  onDrawAgain?: () => void;
}) {
  return (
    <div
      className="rounded-[20px] overflow-hidden p-6 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, hsl(30,33%,97%), hsl(25,25%,93%))",
        border: "1px solid hsl(25,20%,88%)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <CardMotif motif={card.motif} className="w-14 h-14 text-[hsl(284,20%,55%)] opacity-40" />

      <span className="font-body text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 mt-2">
        {card.numeral} · {card.arcana}
      </span>

      <h4 className="font-display text-base font-bold text-foreground text-center mt-2 leading-snug">
        {card.title}
      </h4>

      <div className="flex items-center gap-1 my-2.5">
        {[...Array(7)].map((_, i) => (
          <span key={i} className="w-0.5 h-0.5 rounded-full bg-muted-foreground/20" />
        ))}
      </div>

      <p className="font-body text-xs text-foreground/70 leading-relaxed text-center italic">
        {card.wisdom}
      </p>
      <p className="font-body text-xs text-foreground font-medium leading-relaxed text-center mt-2">
        {card.vision}
      </p>

      <p className="font-body text-[9px] text-muted-foreground/40 italic mt-4">
        {card.book} — {card.author}
      </p>

      {onDrawAgain && (
        <button
          onClick={onDrawAgain}
          className="mt-4 font-body text-[11px] text-primary underline underline-offset-2"
        >
          Draw another card
        </button>
      )}
    </div>
  );
}
