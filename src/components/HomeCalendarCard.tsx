import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import botanicalCorner from "@/assets/journal/botanical-corner.png";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ImportedEvent {
  summary: string;
  start: string;
  end: string;
  time: string;
  dayIndex: number;
}

function useImportedCalendar(today: Date) {
  const [icsUrl, setIcsUrl] = useState<string>(() =>
    localStorage.getItem("signal_calendar_url") || ""
  );
  const [importedEvents, setImportedEvents] = useState<ImportedEvent[]>([]);
  const [importing, setImporting] = useState(false);
  const [showImportInput, setShowImportInput] = useState(false);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const fetchCalendar = useCallback(async (url: string) => {
    if (!url) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("calendar-proxy", {
        body: { url },
      });
      if (error) throw error;
      const events: ImportedEvent[] = (data?.events || [])
        .filter((ev: any) => {
          try {
            const d = parseISO(ev.start);
            return isWithinInterval(d, { start: weekStart, end: weekEnd });
          } catch { return false; }
        })
        .map((ev: any) => {
          const d = new Date(ev.start);
          const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          const jsDay = d.getDay();
          const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
          return { ...ev, time, dayIndex };
        })
        .sort((a: ImportedEvent, b: ImportedEvent) => a.start.localeCompare(b.start));
      setImportedEvents(events);
      localStorage.setItem("signal_calendar_url", url);
      localStorage.setItem("signal_calendar_cache", JSON.stringify({ events, fetched: Date.now() }));
    } catch (e) {
      console.error("Calendar import failed:", e);
      toast.error("Could not fetch calendar", { description: "Check your URL and try again" });
    } finally {
      setImporting(false);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    if (icsUrl) {
      try {
        const cached = JSON.parse(localStorage.getItem("signal_calendar_cache") || "{}");
        if (cached.events && Date.now() - cached.fetched < 30 * 60 * 1000) {
          const filtered = cached.events.filter((ev: any) => {
            try {
              const d = parseISO(ev.start);
              return isWithinInterval(d, { start: weekStart, end: weekEnd });
            } catch { return false; }
          });
          setImportedEvents(filtered);
          return;
        }
      } catch {}
      fetchCalendar(icsUrl);
    }
  }, [icsUrl]);

  return {
    icsUrl, setIcsUrl, importedEvents, importing, showImportInput, setShowImportInput, fetchCalendar,
    clearCalendar: () => {
      setIcsUrl("");
      setImportedEvents([]);
      localStorage.removeItem("signal_calendar_url");
      localStorage.removeItem("signal_calendar_cache");
    },
  };
}

export default function HomeCalendarCard() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const cal = useImportedCalendar(today);
  const [importUrl, setImportUrl] = useState("");

  const handleImportCalendar = () => {
    if (!importUrl.trim()) return;
    haptic("medium");
    cal.fetchCalendar(importUrl.trim());
    cal.setIcsUrl(importUrl.trim());
    cal.setShowImportInput(false);
    setImportUrl("");
  };

  // Build week dates
  const weekDates = DAYS_OF_WEEK.map((d, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + (i - adjustedDay));
    return { day: d, date: date.getDate(), isToday: i === adjustedDay };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="relative overflow-hidden rounded-[20px] bg-card"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      {/* Journal ruled lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, hsl(var(--foreground)) 28px)`,
      }} />
      <img src={botanicalCorner} alt="" className="absolute top-2 right-2 w-10 h-10 opacity-15 pointer-events-none" loading="lazy" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="font-hand text-[11px] text-muted-foreground/50 uppercase tracking-wider">
            📅 My Calendar
          </p>
          {cal.icsUrl ? (
            <button onClick={cal.clearCalendar} className="font-hand text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
              disconnect
            </button>
          ) : (
            <button
              onClick={() => { haptic("light"); cal.setShowImportInput(!cal.showImportInput); }}
              className="flex items-center gap-1 font-hand text-[10px] text-primary/50 hover:text-primary transition-colors"
            >
              <Download className="h-3 w-3" />
              import
            </button>
          )}
        </div>

        {/* Import input */}
        <AnimatePresence>
          {cal.showImportInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="rounded-xl bg-secondary/30 p-3 space-y-2">
                <p className="font-hand text-[11px] text-foreground/60">
                  Paste your calendar's ICS/subscription URL
                </p>
                <p className="font-body text-[10px] text-muted-foreground/50 leading-snug">
                  Google: Calendar Settings → "Secret address in iCal format"
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleImportCalendar()}
                    placeholder="https://calendar.google.com/..."
                    className="flex-1 font-body text-[12px] bg-transparent border-b border-dotted border-foreground/15 outline-none placeholder:text-muted-foreground/25 text-foreground/70"
                    style={{ fontSize: "16px" }}
                    autoFocus
                  />
                  {cal.importing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary/50" />
                  ) : (
                    <button onClick={handleImportCalendar} className="font-hand text-[11px] text-primary font-semibold px-2">
                      Import
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly grid with combined day/date headers */}
        <div className="grid grid-cols-7 gap-[2px]">
          {/* Column headers — day + date combined */}
          {weekDates.map(({ day, date, isToday }, i) => (
            <div key={i} className="flex flex-col items-center pb-2">
              <span className="font-hand text-[9px] text-muted-foreground/40 leading-none">{day}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-hand text-[11px] mt-0.5 ${
                isToday
                  ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
                  : "text-muted-foreground/35"
              }`}>
                {date}
              </div>
            </div>
          ))}

          {/* Event cells */}
          {DAYS_OF_WEEK.map((_, colIdx) => {
            const dayEvents = cal.importedEvents.filter(ev => ev.dayIndex === colIdx);
            return (
              <div key={colIdx} className="min-h-[60px] space-y-1 border-t border-dotted border-foreground/8 pt-1.5">
                {dayEvents.length === 0 && (
                  <div className="h-full" />
                )}
                {dayEvents.map((ev, i) => (
                  <div key={i} className="rounded-lg bg-primary/6 px-1.5 py-1">
                    <p className="font-hand text-[9px] text-primary/50 leading-none mb-0.5">{ev.time}</p>
                    <p className="font-hand text-[10px] text-foreground/60 leading-snug break-words">{ev.summary}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {cal.importedEvents.length === 0 && !cal.icsUrl && !cal.showImportInput && (
          <div className="text-center py-4">
            <p className="font-hand text-[12px] italic text-muted-foreground/35">
              Connect your calendar to see your week at a glance
            </p>
          </div>
        )}

        {cal.importing && (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
            <p className="font-hand text-[11px] text-muted-foreground/40">Fetching events...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
