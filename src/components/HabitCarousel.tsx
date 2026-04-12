import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { HABIT_CAROUSEL_CARDS, type HabitCarouselCard } from "@/data/habit-carousel-data";
import { haptic } from "@/hooks/use-mobile";

const CATEGORY_LABELS: Record<string, string> = {
  mindset: "Mindset",
  science: "Science",
  strategy: "Strategy",
  motivation: "Motivation",
  "self-care": "Self Care",
  foundations: "Foundations",
};

/* subtle star-field dots for the card background */
function TarotStars() {
  const positions = [
    { top: "8%", left: "12%" },
    { top: "14%", right: "18%" },
    { top: "38%", left: "6%" },
    { top: "55%", right: "8%" },
    { top: "78%", left: "15%" },
    { top: "85%", right: "22%" },
    { top: "25%", right: "10%" },
    { top: "65%", left: "10%" },
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary-foreground/20"
          style={pos}
        />
      ))}
    </>
  );
}

/* decorative corner ornaments */
function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute w-5 h-5 text-primary-foreground/25 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 2 L2 10 M2 2 L10 2" />
      <circle cx="2" cy="2" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function HabitCarousel() {
  const [current, setCurrent] = useState(0);
  const card = HABIT_CAROUSEL_CARDS[current];

  const go = (dir: 1 | -1) => {
    haptic("light");
    setCurrent(prev => {
      const next = prev + dir;
      if (next < 0) return HABIT_CAROUSEL_CARDS.length - 1;
      if (next >= HABIT_CAROUSEL_CARDS.length) return 0;
      return next;
    });
  };

  return (
    <div className="mt-8 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">Inner Wisdom</h3>
        <span className="font-body text-[10px] text-muted-foreground ml-auto tracking-wider uppercase">
          {card.numeral} of XII
        </span>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, rotateY: 12, scale: 0.96 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[20px] bg-gradient-to-b from-primary via-primary-soft to-primary-glow p-[1px]"
            style={{ perspective: "800px" }}
          >
            {/* Inner card */}
            <div className="relative rounded-[19px] bg-gradient-to-b from-[hsl(284,30%,18%)] via-[hsl(284,25%,22%)] to-[hsl(284,20%,16%)] px-6 py-7 min-h-[280px] flex flex-col">
              <TarotStars />

              {/* Corner ornaments */}
              <CornerOrnament className="top-3 left-3" />
              <CornerOrnament className="top-3 right-3 -scale-x-100" />
              <CornerOrnament className="bottom-3 left-3 -scale-y-100" />
              <CornerOrnament className="bottom-3 right-3 -scale-x-100 -scale-y-100" />

              {/* Arcana name */}
              <div className="text-center mb-4 relative z-10">
                <span className="font-display text-[10px] uppercase tracking-[0.25em] text-primary-foreground/40">
                  {card.arcana}
                </span>
                <h4 className="font-display text-xl font-bold text-primary-foreground mt-1 leading-snug">
                  {card.title}
                </h4>
                <span className="inline-block mt-1.5 text-[10px] uppercase tracking-widest text-primary-glow/60 font-medium">
                  {CATEGORY_LABELS[card.category]}
                </span>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2 relative z-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
                <Sparkles className="h-3 w-3 text-primary-foreground/30" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
              </div>

              {/* Wisdom & Vision */}
              <div className="flex-1 flex flex-col justify-center relative z-10 my-2">
                <p className="font-body text-sm text-primary-foreground/80 leading-relaxed italic text-center">
                  {card.wisdom}
                </p>
                <p className="font-body text-sm text-primary-foreground font-medium leading-relaxed text-center mt-3">
                  {card.vision}
                </p>
              </div>

              {/* Source */}
              <div className="relative z-10 mt-3 pt-3 border-t border-primary-foreground/10 text-center">
                <p className="font-body text-[10px] text-primary-foreground/35 italic">
                  {card.book} — {card.author}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={() => go(-1)}
          className="absolute left-[-8px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card shadow-soft flex items-center justify-center z-10 touch-btn"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-[-8px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card shadow-soft flex items-center justify-center z-10 touch-btn"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {HABIT_CAROUSEL_CARDS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { haptic("light"); setCurrent(i); }}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-4 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
