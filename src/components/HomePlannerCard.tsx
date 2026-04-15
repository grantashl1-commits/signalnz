import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, X, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { haptic } from "@/hooks/use-mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

import botanicalSprig from "@/assets/journal/botanical-sprig.png";
import botanicalCorner from "@/assets/journal/botanical-corner.png";
import botanicalLavender from "@/assets/journal/botanical-lavender.png";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ManualEvent {
  id: string;
  time: string;
  title: string;
}

function loadEvents(dateKey: string): ManualEvent[] {
  try {
    const raw = localStorage.getItem(`signal_events_${dateKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveEvents(dateKey: string, events: ManualEvent[]) {
  localStorage.setItem(`signal_events_${dateKey}`, JSON.stringify(events));
}

function DottedLine({ className = "" }: { className?: string }) {
  return <div className={`border-b border-dotted border-foreground/10 ${className}`} />;
}

function useWeeklyIntention() {
  const weekKey = format(new Date(), "yyyy-'W'II");
  const [intention, setIntention] = useState(() =>
    localStorage.getItem(`signal_intention_${weekKey}`) || ""
  );
  const save = useCallback((val: string) => {
    setIntention(val);
    localStorage.setItem(`signal_intention_${weekKey}`, val);
  }, [weekKey]);
  return { intention, setIntention: save };
}

function useWeeklyMantra() {
  const weekKey = format(new Date(), "yyyy-'W'II");
  const [mantra, setMantra] = useState(() =>
    localStorage.getItem(`signal_mantra_${weekKey}`) || ""
  );
  const save = useCallback((val: string) => {
    setMantra(val);
    localStorage.setItem(`signal_mantra_${weekKey}`, val);
  }, [weekKey]);
  return { mantra, setMantra: save };
}

/* ── Left Page Content ── */
function LeftPage({ today, intention, setIntention, mantra, setMantra }: {
  today: Date;
  intention: string;
  setIntention: (v: string) => void;
  mantra: string;
  setMantra: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="font-hand text-[11px] text-muted-foreground/60 uppercase tracking-widest">
          Week of
        </p>
        <p className="font-hand text-lg text-foreground/80">
          {format(today, "d MMMM")}
        </p>
      </div>
      <DottedLine />
      <div>
        <p className="font-hand text-[11px] text-muted-foreground/50 mb-1">Weekly Intention</p>
        <input
          type="text"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="What am I focusing on?"
          className="w-full bg-transparent font-hand text-sm text-foreground placeholder:text-muted-foreground/30 border-b border-dotted border-foreground/10 pb-1 outline-none focus:border-primary/30 transition-colors"
        />
      </div>
      <div>
        <p className="font-hand text-[11px] text-muted-foreground/50 mb-1">Goal or Mantra</p>
        <input
          type="text"
          value={mantra}
          onChange={(e) => setMantra(e.target.value)}
          placeholder="I am becoming..."
          className="w-full bg-transparent font-hand text-sm text-foreground placeholder:text-muted-foreground/30 border-b border-dotted border-foreground/10 pb-1 outline-none focus:border-primary/30 transition-colors"
        />
      </div>
      <DottedLine className="mt-3" />
      <div className="pt-1">
        <p className="font-hand text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1">✦ Gratitude</p>
        <textarea
          rows={3}
          placeholder="I am grateful for..."
          className="w-full bg-transparent font-hand text-[13px] text-foreground placeholder:text-muted-foreground/25 resize-none outline-none leading-relaxed"
          onChange={(e) => {
            const weekKey = format(today, "yyyy-'W'II");
            localStorage.setItem(`signal_gratitude_${weekKey}`, e.target.value);
          }}
          defaultValue={(() => {
            try { return localStorage.getItem(`signal_gratitude_${format(today, "yyyy-'W'II")}`) || ""; } catch { return ""; }
          })()}
        />
      </div>
      <div className="flex justify-center pt-2">
        <img src={botanicalSprig} alt="" className="w-10 h-16 opacity-15" loading="lazy" />
      </div>
    </div>
  );
}

/* ── Right Page Content ── */
function RightPage({ today, events, showAddEvent, setShowAddEvent, newTime, setNewTime, newTitle, setNewTitle, addEvent, removeEvent }: {
  today: Date;
  events: ManualEvent[];
  showAddEvent: boolean;
  setShowAddEvent: (v: boolean) => void;
  newTime: string;
  setNewTime: (v: string) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  addEvent: () => void;
  removeEvent: (id: string) => void;
}) {
  const dayOfWeek = today.getDay();
  return (
    <div className="space-y-2">
      <div className="text-center mb-1">
        <p className="font-hand text-lg text-foreground/80">
          {format(today, "EEEE")}
        </p>
        <p className="font-hand text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          {format(today, "d MMM yyyy")}
        </p>
      </div>
      <div className="flex items-center justify-between gap-0.5 px-0.5 mb-2">
        {DAYS_OF_WEEK.map((d, i) => {
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const isToday = i === adjustedDay;
          const date = new Date(today);
          date.setDate(today.getDate() + (i - adjustedDay));
          return (
            <div key={d} className="flex flex-col items-center gap-0.5">
              <span className="font-hand text-[8px] text-muted-foreground/40">{d}</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-hand text-[10px] transition-colors ${
                isToday
                  ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
                  : "text-muted-foreground/30"
              }`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <DottedLine />
      <div className="space-y-1.5 min-h-[80px]">
        {events.length === 0 && !showAddEvent ? (
          <div className="text-center py-4">
            <Calendar className="h-5 w-5 text-muted-foreground/20 mx-auto mb-2" />
            <p className="font-hand text-[13px] italic text-muted-foreground/40">
              A blank page to fill...
            </p>
          </div>
        ) : (
          events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 group"
            >
              <span className="font-hand text-[11px] text-primary/60 w-10 flex-shrink-0 pt-0.5">
                {ev.time}
              </span>
              <p className="font-hand text-[13px] text-foreground/70 flex-1 leading-snug">
                {ev.title}
              </p>
              <button
                onClick={() => removeEvent(ev.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="h-3 w-3 text-muted-foreground/40" />
              </button>
            </motion.div>
          ))
        )}
      </div>
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-1.5 items-end">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="font-hand text-[11px] bg-transparent border-b border-dotted border-foreground/15 w-16 outline-none text-foreground/60"
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEvent()}
                placeholder="What's happening?"
                className="flex-1 font-hand text-[12px] bg-transparent border-b border-dotted border-foreground/15 outline-none placeholder:text-muted-foreground/25 text-foreground/70"
                autoFocus
              />
              <button onClick={addEvent} className="p-1 text-primary">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => {
          haptic("light");
          setShowAddEvent(!showAddEvent);
        }}
        className="flex items-center gap-1.5 font-hand text-[11px] text-primary/50 hover:text-primary transition-colors mt-1"
      >
        <Plus className="h-3 w-3" />
        add to today
      </button>
      <div className="mt-auto pt-3">
        <DottedLine className="mb-2" />
        <p className="font-hand text-[11px] text-muted-foreground/35 italic text-center leading-relaxed">
          {getWeeklyPrompt()}
        </p>
      </div>
    </div>
  );
}

export default function HomePlannerCard() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const { intention, setIntention } = useWeeklyIntention();
  const { mantra, setMantra } = useWeeklyMantra();
  const [events, setEvents] = useState<ManualEvent[]>(() => loadEvents(todayStr));
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTime, setNewTime] = useState("09:00");
  const [newTitle, setNewTitle] = useState("");
  const isMobile = useIsMobile();
  const [mobilePage, setMobilePage] = useState<"left" | "right">("left");

  const addEvent = useCallback(() => {
    if (!newTitle.trim()) return;
    haptic("medium");
    const ev: ManualEvent = { id: Date.now().toString(), time: newTime, title: newTitle.trim() };
    const updated = [...events, ev].sort((a, b) => a.time.localeCompare(b.time));
    setEvents(updated);
    saveEvents(todayStr, updated);
    setNewTitle("");
    setShowAddEvent(false);
    toast.success("Event added");
  }, [events, newTime, newTitle, todayStr]);

  const removeEvent = useCallback((id: string) => {
    haptic("light");
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(todayStr, updated);
  }, [events, todayStr]);

  const rightPageProps = {
    today, events, showAddEvent, setShowAddEvent, newTime, setNewTime, newTitle, setNewTitle, addEvent, removeEvent,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="relative overflow-hidden rounded-[20px] bg-card"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      {/* Journal page texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, hsl(var(--foreground)) 28px)`,
      }} />

      {/* Botanical decorations */}
      <img src={botanicalCorner} alt="" className="absolute top-2 right-2 w-14 h-14 opacity-15 pointer-events-none" loading="lazy" />
      <img src={botanicalLavender} alt="" className="absolute bottom-4 left-3 w-8 h-16 opacity-10 pointer-events-none" loading="lazy" />

      <div className="relative p-5">
        {/* ── MOBILE: Single page with tab toggle ── */}
        {isMobile ? (
          <div>
            {/* Page tab indicator */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => { haptic("light"); setMobilePage("left"); }}
                className={`font-hand text-[12px] px-3 py-1 rounded-full transition-all ${
                  mobilePage === "left"
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground/40"
                }`}
              >
                ✦ This Week
              </button>
              <span className="text-muted-foreground/20 text-[10px]">|</span>
              <button
                onClick={() => { haptic("light"); setMobilePage("right"); }}
                className={`font-hand text-[12px] px-3 py-1 rounded-full transition-all ${
                  mobilePage === "right"
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground/40"
                }`}
              >
                Today →
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mobilePage}
                initial={{ opacity: 0, x: mobilePage === "right" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mobilePage === "right" ? -20 : 20 }}
                transition={{ duration: 0.25 }}
              >
                {mobilePage === "left" ? (
                  <LeftPage today={today} intention={intention} setIntention={setIntention} mantra={mantra} setMantra={setMantra} />
                ) : (
                  <RightPage {...rightPageProps} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Page dots */}
            <div className="flex justify-center gap-2 mt-4">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${mobilePage === "left" ? "bg-primary/50" : "bg-muted-foreground/20"}`} />
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${mobilePage === "right" ? "bg-primary/50" : "bg-muted-foreground/20"}`} />
            </div>
          </div>
        ) : (
          /* ── DESKTOP: Open book spread ── */
          <div className="grid grid-cols-2 gap-4" style={{ minHeight: 280 }}>
            <div className="pr-3 border-r border-dotted border-foreground/8">
              <LeftPage today={today} intention={intention} setIntention={setIntention} mantra={mantra} setMantra={setMantra} />
            </div>
            <div className="pl-1">
              <RightPage {...rightPageProps} />
            </div>
          </div>
        )}

        {/* Journal spine effect — desktop only */}
        {!isMobile && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent, hsl(var(--foreground) / 0.06) 15%, hsl(var(--foreground) / 0.04) 85%, transparent)",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

function getWeeklyPrompt(): string {
  const prompts = [
    "What does your heart need most this week?",
    "Where can you be kinder to yourself today?",
    "What small joy can you create this week?",
    "What are you ready to let go of?",
    "How can you nourish your body and soul today?",
    "What would courage look like for you this week?",
    "Where do you want to grow?",
    "What pattern are you ready to break?",
  ];
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return prompts[weekNumber % prompts.length];
}
