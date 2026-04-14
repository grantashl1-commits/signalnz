import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Leaf } from "lucide-react";
import { format } from "date-fns";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function BotanicDivider() {
  return (
    <svg viewBox="0 0 200 16" className="w-24 h-3 mx-auto opacity-20" fill="none" stroke="currentColor" strokeWidth="0.8">
      <path d="M10 8 Q50 2 100 8 Q150 14 190 8" />
      <circle cx="100" cy="8" r="2" fill="currentColor" opacity="0.4" />
      <path d="M90 6 Q95 2 100 6" />
      <path d="M100 6 Q105 2 110 6" />
    </svg>
  );
}

function MiniWeekStrip() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  return (
    <div className="flex items-center justify-between gap-1 px-1">
      {DAYS_OF_WEEK.map((d, i) => {
        const isToday = i === dayOfWeek;
        const date = new Date(today);
        date.setDate(today.getDate() + (i - dayOfWeek));
        return (
          <div key={d} className="flex flex-col items-center gap-0.5">
            <span className="font-body text-[9px] uppercase text-muted-foreground/50">{d}</span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body transition-colors ${
                isToday
                  ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
                  : "text-muted-foreground/40"
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePlannerCard() {
  const today = new Date();
  const [calendarConnected] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="card-warm space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-3.5 w-3.5 text-primary/60" />
          <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
            your day
          </p>
        </div>
        <p className="font-display text-xs italic text-muted-foreground/60">
          {format(today, "EEEE, d MMMM")}
        </p>
      </div>

      {/* Mini week strip */}
      <MiniWeekStrip />

      <BotanicDivider />

      {/* Calendar status */}
      {!calendarConnected ? (
        <div className="text-center py-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/8 mb-2">
            <Calendar className="h-5 w-5 text-primary/50" />
          </div>
          <p className="font-display text-sm italic text-muted-foreground mb-1">
            See your schedule here
          </p>
          <p className="font-body text-[11px] text-muted-foreground/50 mb-3 max-w-[220px] mx-auto leading-relaxed">
            Connect your Google Calendar to see today's events beautifully laid out
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 font-body text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
            onClick={() => {
              /* Will implement Google Calendar OAuth */
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Connect your calendar
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="space-y-2 py-1">
          {/* Calendar events would render here */}
          <p className="font-display text-sm italic text-muted-foreground/50 text-center py-2">
            No events today — a blank page to fill
          </p>
        </div>
      )}

      {/* Botanic footer flourish */}
      <div className="flex justify-center pt-1">
        <svg viewBox="0 0 60 20" className="w-10 h-3 opacity-15">
          <path d="M30 18 Q20 8 10 12 Q15 4 30 2 Q45 4 50 12 Q40 8 30 18Z" fill="currentColor" />
        </svg>
      </div>
    </motion.div>
  );
}
