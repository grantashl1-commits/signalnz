import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Lightbulb } from "lucide-react";
import { HABIT_CAROUSEL_CARDS, CATEGORY_COLORS, type HabitCarouselCard } from "@/data/habit-carousel-data";
import { haptic } from "@/hooks/use-mobile";

const CATEGORY_LABELS: Record<string, string> = {
  mindset: "Mindset",
  science: "Science",
  strategy: "Strategy",
  motivation: "Motivation",
  "self-care": "Self Care",
  foundations: "Foundations",
};

export default function HabitCarousel() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const card = HABIT_CAROUSEL_CARDS[current];
  const color = CATEGORY_COLORS[card.category] || "hsl(var(--primary))";

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
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">Habit Wisdom</h3>
        <span className="font-body text-[10px] text-muted-foreground ml-auto">
          {current + 1} / {HABIT_CAROUSEL_CARDS.length}
        </span>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="rounded-[20px] bg-card shadow-soft p-5 min-h-[180px] flex flex-col"
          >
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: color }}
              >
                {CATEGORY_LABELS[card.category]}
              </span>
            </div>

            {/* Title & lesson */}
            <h4 className="font-display text-lg font-bold text-foreground leading-snug mb-1.5">
              {card.title}
            </h4>
            <p className="font-body text-sm text-foreground/80 leading-relaxed mb-3">
              {card.lesson}
            </p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed flex-1">
              {card.detail}
            </p>

            {/* Source */}
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border">
              <BookOpen className="h-3 w-3 text-muted-foreground/60" />
              <p className="font-body text-[10px] text-muted-foreground/60 italic">
                {card.book} — {card.author}
              </p>
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
