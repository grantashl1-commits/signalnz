import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil } from "lucide-react";
import { MOOD_ICONS } from "@/components/TrackingIcons";
import { getMoods, getNotes, getWeight, getWeightUnit, getPhaseFromDay, PHASE_SHORT, Phase } from "@/lib/cycle-utils";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

// Mood → dot colour mapping
const MOOD_DOT_COLORS: Record<string, string> = {
  radiant: "#D4A843",
  energised: "#D4A843",
  calm: "#7BAF7B",
  content: "#7BAF7B",
  grateful: "#7BAF7B",
  tired: "#C9928A",
  foggy: "#C9928A",
  sad: "#C9928A",
  anxious: "#94A3B8",
  irritable: "#94A3B8",
  overwhelmed: "#94A3B8",
  sensitive: "#94A3B8",
};

export function getMoodDotColor(mood: string): string {
  return MOOD_DOT_COLORS[mood.toLowerCase()] || "#B4A7C7"; // lavender default
}

interface Props {
  dateStr: string;
  cycleDay: number | null;
  type: "mood" | "weight";
  onEdit: () => void;
  onClose: () => void;
}

export default function CalendarMoodPopover({ dateStr, cycleDay, type, onEdit, onClose }: Props) {
  const date = new Date(dateStr + "T12:00:00");
  const phase: Phase = cycleDay ? getPhaseFromDay(cycleDay) : "follicular";
  const phaseColor = PHASE_HEX[phase];
  const dateLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const moods = getMoods(dateStr);
  const notes = getNotes(dateStr);
  const weight = getWeight(dateStr);
  const unit = getWeightUnit();
  const displayWeight = weight
    ? unit === "lbs"
      ? `${(weight / 0.453592).toFixed(1)} lbs`
      : `${weight.toFixed(1)} kg`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="fixed inset-x-4 bottom-[20%] z-50 mx-auto max-w-sm bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-8 h-1 rounded-full bg-border mx-auto mt-3" />

        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <div>
            <p className="font-display text-sm italic text-foreground">{dateLabel}</p>
            {cycleDay && (
              <p className="font-hand text-xs" style={{ color: phaseColor }}>
                Day {cycleDay} · {PHASE_SHORT[phase]}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {type === "mood" && (
            <>
              <p className="font-hand text-xs font-bold text-primary">moods logged</p>
              {moods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => {
                    const Icon = MOOD_ICONS[mood];
                    const dotColor = getMoodDotColor(mood);
                    return (
                      <div key={mood} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                        {Icon && <Icon size={18} />}
                        <span className="font-hand text-xs text-foreground">{mood}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-body text-xs text-muted-foreground">No moods logged</p>
              )}
              {notes && (
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="font-hand text-[10px] font-bold text-muted-foreground mb-1">notes</p>
                  <p className="font-body text-xs text-foreground leading-relaxed line-clamp-3">{notes}</p>
                </div>
              )}
            </>
          )}

          {type === "weight" && (
            <>
              <p className="font-hand text-xs font-bold text-primary">weight</p>
              {displayWeight ? (
                <p className="font-body text-2xl text-foreground">{displayWeight}</p>
              ) : (
                <p className="font-body text-xs text-muted-foreground">No weight logged</p>
              )}
            </>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex items-center gap-1.5 font-hand text-xs text-primary"
          >
            <Pencil className="h-3 w-3" /> Edit entry
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
