import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Plus, ChevronRight, X } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import botanicalCorner from "@/assets/journal/botanical-corner.png";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* Custom hand-drawn calendar icon */
function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      {/* Page body */}
      <rect x="3" y="5" width="18" height="16" rx="3" />
      {/* Binding rings */}
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      {/* Header line */}
      <path d="M3 10h18" />
      {/* Grid dots — gives a hand-drawn feel */}
      <circle cx="8" cy="14" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface ImportedEvent {
  summary: string;
  start: string;
  end: string;
  time: string;
  dayIndex: number;
}

interface ManualEvent {
  id: string;
  time: string;
  title: string;
  dayIndex: number;
}

function loadManualEvents(weekKey: string): ManualEvent[] {
  try {
    const raw = localStorage.getItem(`signal_week_events_${weekKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveManualEvents(weekKey: string, events: ManualEvent[]) {
  localStorage.setItem(`signal_week_events_${weekKey}`, JSON.stringify(events));
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
    } catch {
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

  const weekKey = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const [manualEvents, setManualEvents] = useState<ManualEvent[]>(() => loadManualEvents(weekKey));
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTime, setNewTime] = useState("09:00");
  const [newTitle, setNewTitle] = useState("");
  const [newDayIdx, setNewDayIdx] = useState(adjustedDay);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);

  const handleImportCalendar = () => {
    if (!importUrl.trim()) return;
    haptic("medium");
    cal.fetchCalendar(importUrl.trim());
    cal.setIcsUrl(importUrl.trim());
    cal.setShowImportInput(false);
    setImportUrl("");
  };

  const addManualEvent = () => {
    if (!newTitle.trim()) return;
    haptic("medium");
    const ev: ManualEvent = { id: Date.now().toString(), time: newTime, title: newTitle.trim(), dayIndex: newDayIdx };
    const updated = [...manualEvents, ev].sort((a, b) => a.dayIndex - b.dayIndex || a.time.localeCompare(b.time));
    setManualEvents(updated);
    saveManualEvents(weekKey, updated);
    setNewTitle("");
    setShowAddEvent(false);
    toast.success("Event added");
  };

  const removeManualEvent = (id: string) => {
    haptic("light");
    const updated = manualEvents.filter(e => e.id !== id);
    setManualEvents(updated);
    saveManualEvents(weekKey, updated);
  };

  const generateICSData = () => {
    const allEvents = [
      ...manualEvents.map(ev => ({ time: ev.time, title: ev.title, dayIndex: ev.dayIndex })),
    ];
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Signal//EN"];
    const ws = startOfWeek(today, { weekStartsOn: 1 });
    allEvents.forEach((ev) => {
      const [h, m] = ev.time.split(":");
      const d = new Date(ws);
      d.setDate(d.getDate() + ev.dayIndex);
      d.setHours(parseInt(h), parseInt(m), 0);
      const end = new Date(d);
      end.setHours(d.getHours() + 1);
      const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      lines.push("BEGIN:VEVENT", `DTSTART:${fmt(d)}`, `DTEND:${fmt(end)}`, `SUMMARY:${ev.title}`, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  };

  const handleCalendarExport = (type: "google" | "outlook" | "apple") => {
    const allCount = manualEvents.length + cal.importedEvents.length;
    if (allCount === 0) { toast.info("No events to export"); return; }
    if (type === "google" && manualEvents.length > 0) {
      const ev = manualEvents[0];
      const ws = startOfWeek(today, { weekStartsOn: 1 });
      const d = new Date(ws);
      d.setDate(d.getDate() + ev.dayIndex);
      const [h, m] = ev.time.split(":");
      d.setHours(parseInt(h), parseInt(m), 0);
      const end = new Date(d); end.setHours(d.getHours() + 1);
      const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${fmt(d)}/${fmt(end)}`, "_blank");
    } else {
      const ics = generateICSData();
      const blob = new Blob([ics], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "signal-events.ics"; a.click();
      URL.revokeObjectURL(url);
    }
    setShowCalendarOptions(false);
    toast.success("Calendar export ready");
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
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary/60" />
            <p className="font-hand text-[11px] text-muted-foreground/50 uppercase tracking-wider">
              My Calendar
            </p>
          </div>
          <div className="flex items-center gap-3">
            {cal.icsUrl && (
              <button onClick={cal.clearCalendar} className="font-hand text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
                disconnect
              </button>
            )}
            {!cal.icsUrl && (
              <button
                onClick={() => { haptic("light"); cal.setShowImportInput(!cal.showImportInput); }}
                className="flex items-center gap-1 font-hand text-[10px] text-primary/50 hover:text-primary transition-colors"
              >
                <Download className="h-3 w-3" />
                import
              </button>
            )}
          </div>
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

          {/* Event cells — imported + manual */}
          {DAYS_OF_WEEK.map((_, colIdx) => {
            const imported = cal.importedEvents.filter(ev => ev.dayIndex === colIdx);
            const manual = manualEvents.filter(ev => ev.dayIndex === colIdx);
            return (
              <div key={colIdx} className="min-h-[60px] space-y-1 border-t border-dotted border-foreground/8 pt-1.5">
                {imported.map((ev, i) => (
                  <div key={`i-${i}`} className="rounded-lg bg-primary/6 px-1.5 py-1">
                    <p className="font-hand text-[8px] text-primary/50 leading-none mb-0.5">{ev.time}</p>
                    <p className="font-hand text-[9px] text-foreground/60 leading-snug break-words">{ev.summary}</p>
                  </div>
                ))}
                {manual.map((ev) => (
                  <div key={ev.id} className="rounded-lg bg-accent/30 px-1.5 py-1 group relative">
                    <p className="font-hand text-[8px] text-primary/50 leading-none mb-0.5">{ev.time}</p>
                    <p className="font-hand text-[9px] text-foreground/60 leading-snug break-words">{ev.title}</p>
                    <button
                      onClick={() => removeManualEvent(ev.id)}
                      className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5 text-muted-foreground/40" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Add event form */}
        <AnimatePresence>
          {showAddEvent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              <div className="flex gap-1.5 items-end flex-wrap">
                <select
                  value={newDayIdx}
                  onChange={(e) => setNewDayIdx(Number(e.target.value))}
                  className="font-hand text-[11px] bg-transparent border-b border-dotted border-foreground/15 outline-none text-foreground/60 w-14"
                >
                  {DAYS_OF_WEEK.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
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
                  onKeyDown={(e) => e.key === "Enter" && addManualEvent()}
                  placeholder="What's happening?"
                  className="flex-1 min-w-[100px] font-hand text-[12px] bg-transparent border-b border-dotted border-foreground/15 outline-none placeholder:text-muted-foreground/25 text-foreground/70"
                  autoFocus
                />
                <button onClick={addManualEvent} className="p-1 text-primary">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => { haptic("light"); setShowAddEvent(!showAddEvent); }}
            className="flex items-center gap-1.5 font-hand text-[11px] text-primary/50 hover:text-primary transition-colors"
          >
            <Plus className="h-3 w-3" />
            add event
          </button>
          <button
            onClick={() => { haptic("light"); setShowCalendarOptions(!showCalendarOptions); }}
            className="flex items-center gap-1.5 font-hand text-[11px] text-primary/50 hover:text-primary transition-colors"
          >
            <CalendarIcon className="w-3 h-3" />
            add to calendar
          </button>
        </div>

        {/* Calendar export options */}
        <AnimatePresence>
          {showCalendarOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              <div className="rounded-xl bg-secondary/30 p-3 space-y-1">
                {[
                  { key: "google" as const, label: "Google Calendar", icon: "📅" },
                  { key: "outlook" as const, label: "Outlook Calendar", icon: "📧" },
                  { key: "apple" as const, label: "Apple Calendar", icon: "🗓️" },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => handleCalendarExport(key)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[44px] text-left hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-base">{icon}</span>
                    <span className="font-body text-sm text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {cal.importedEvents.length === 0 && manualEvents.length === 0 && !cal.icsUrl && !cal.showImportInput && !showAddEvent && (
          <div className="text-center py-2 mt-1">
            <p className="font-hand text-[12px] italic text-muted-foreground/35">
              Connect your calendar or add events to plan your week
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
