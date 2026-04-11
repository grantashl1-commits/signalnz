import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Play, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useDailyStoic } from "@/hooks/useStoicJournal";
import { haptic } from "@/hooks/use-mobile";
import StoicAudioPlayer from "@/components/StoicAudioPlayer";

interface DailyStoicCardProps {
  onPlayAudio?: (config: any) => void; // kept for backwards compat, no longer used
}

function buildStoicReadingText(reading: {
  seq_day: number;
  title: string;
  quote: string;
  source: string;
  reflection: string;
}): string {
  return `Day ${reading.seq_day}.\n\n${reading.title}.\n\n"${reading.quote}"\n\n— ${reading.source}\n\n${reading.reflection}`;
}

export default function DailyStoicCard({ onPlayAudio }: DailyStoicCardProps) {
  const { currentDay, reading, listenedToday, loading, markListened, advanceDay, previewDay } = useDailyStoic();
  const [previewOffset, setPreviewOffset] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  if (loading || !reading) return null;

  const displayDay = reading.seq_day;
  const isCurrentDay = displayDay === currentDay;

  const handlePlay = () => {
    haptic("medium");
    setShowPlayer(true);
    if (isCurrentDay) {
      markListened();
      advanceDay();
    }
  };

  const handlePrev = () => {
    const newOffset = previewOffset - 1;
    const targetDay = currentDay + newOffset;
    if (targetDay < 1) return;
    setPreviewOffset(newOffset);
    previewDay(targetDay);
  };

  const handleNext = () => {
    const newOffset = previewOffset + 1;
    const targetDay = currentDay + newOffset;
    if (targetDay > 366) return;
    setPreviewOffset(newOffset);
    previewDay(targetDay);
  };

  const handleBackToCurrent = () => {
    setPreviewOffset(0);
    previewDay(currentDay);
  };

  const progressPct = (currentDay / 366) * 100;
  const dateLabel = reading.month && reading.day_of_month
    ? `${reading.month} ${reading.day_of_month}`
    : `Day ${displayDay}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-warm p-6 border border-primary/20 mb-6"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-hand text-sm font-bold text-primary">The Daily Stoic</span>
          <span className="font-body text-[10px] text-muted-foreground ml-auto">
            Day {displayDay} of 366
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-muted/40 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary/50 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Date & Title */}
        <p className="font-body text-[11px] text-muted-foreground mb-1">{dateLabel}</p>
        <h3 className="font-display text-xl italic text-foreground leading-snug mb-3">
          {reading.title
            .split(" ")
            .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
            .join(" ")}
        </h3>

        {/* Quote */}
        <blockquote className="font-hand text-sm text-muted-foreground leading-relaxed mb-2 pl-3 border-l-2 border-primary/20">
          "{reading.quote.length > 200 ? reading.quote.slice(0, 200) + "…" : reading.quote}"
        </blockquote>
        <p className="font-body text-[10px] text-muted-foreground/60 mb-4">
          — {reading.source}
        </p>

        {/* Listened badge */}
        {isCurrentDay && listenedToday && (
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-body text-[10px] text-primary">Listened today</span>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handlePlay}
            className="touch-btn flex-1 rounded-[14px] bg-primary py-3 font-display text-sm italic text-primary-foreground active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" /> Listen · ~4 min
          </button>
          <a
            href="/journal"
            className="touch-btn flex-1 rounded-[14px] border border-border py-3 font-display text-sm italic text-foreground active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <BookOpen className="h-4 w-4" /> Read in Journal
          </a>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentDay + previewOffset <= 1}
            className="flex items-center gap-1 font-body text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>

          {previewOffset !== 0 && (
            <button
              onClick={handleBackToCurrent}
              className="font-body text-[10px] text-primary hover:underline"
            >
              Back to Day {currentDay}
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentDay + previewOffset >= 366}
            className="flex items-center gap-1 font-body text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPlayer && reading && (
          <StoicAudioPlayer
            title={reading.title}
            text={buildStoicReadingText(reading)}
            onClose={() => setShowPlayer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
