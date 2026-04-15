import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, X, ChevronRight, ArrowRight, Check, Trash2, Archive, Sparkles, CalendarPlus, Download, Loader2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { haptic, useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useTodos } from "@/hooks/useTodos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { loadVault, saveVault, type VaultEntry } from "@/lib/journal-store";
import { useTodayFocus } from "@/hooks/useTodayFocus";

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

/* ── TODAY Page — Focus + To-Do ── */
function TodayPage({ today }: { today: Date }) {
  const { user } = useAuth();
  const { focus } = useTodayFocus();
  const { todos, loading, addTodo, toggleTodo, archiveTodo, deleteTodo } = useTodos();
  const [newTask, setNewTask] = useState("");
  const [showInput, setShowInput] = useState(false);

  const active = todos.filter((t) => !t.completed);
  const justDone = todos.filter((t) => t.completed);

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    haptic("medium");
    await addTodo(newTask);
    setNewTask("");
    setShowInput(false);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    haptic("light");
    await toggleTodo(id, completed);
  };

  const handleArchive = async (id: string) => {
    haptic("medium");
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const ve: VaultEntry = {
        id: Date.now().toString(),
        entryId: todo.id,
        category: "look-what-youve-done",
        title: todo.title,
        preview: `Completed ${todo.completed_at ? new Date(todo.completed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" }) : "today"}`,
        date: new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" }),
        timestamp: Date.now(),
      };
      const vault = loadVault();
      saveVault([ve, ...vault]);
      if (user) {
        await supabase.from("vault_entries").upsert({
          id: ve.id, user_id: user.id, entry_id: ve.entryId,
          category: ve.category, title: ve.title, preview: ve.preview,
          date: ve.date, timestamp: ve.timestamp,
        } as any);
      }
      toast.success("Saved to Look What You've Done ✨", {
        description: "Find it in your Memory Vault",
      });
    }
    await archiveTodo(id);
  };

  return (
    <div className="space-y-5">
      {/* Today's Focus */}
      <div>
        <p className="font-hand text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">✦ Today's Focus</p>
        <div className="space-y-1.5">
          {[
            { label: "eat", value: focus.eat, href: "/nutrition" },
            { label: "move", value: focus.move, href: "/movement" },
            { label: "rest", value: focus.rest, href: "/practice" },
            { label: "cycle", value: focus.cycle, href: "/cycle" },
          ].map(({ label, value, href }) => (
            <Link key={label} to={href} className="flex gap-3 items-start group hover:bg-foreground/[0.03] -mx-2 px-2 py-1.5 rounded-lg transition-colors relative">
              <span className="font-hand text-sm w-10 pt-0.5 text-primary/50">{label}</span>
              <p className="font-hand text-[15px] text-foreground/65 leading-snug flex-1 group-hover:text-foreground transition-colors border-b border-dotted border-foreground/8 pb-1">{value}</p>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all mt-1 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <DottedLine />

      {/* To-Do List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M8 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-hand text-[10px] text-muted-foreground/40 uppercase tracking-wider">To-Do</p>
          </div>
          <button
            onClick={() => setShowInput(!showInput)}
            className="text-primary active:opacity-70 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Add input */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="What needs doing?"
                  className="flex-1 font-hand text-sm text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ fontSize: "16px" }}
                  autoFocus
                />
                <button
                  onClick={handleAdd}
                  className="rounded-xl bg-primary px-3.5 py-2 font-body text-xs font-medium text-primary-foreground active:opacity-90"
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="font-hand text-sm italic text-muted-foreground/50 text-center py-2">Loading...</p>
        ) : active.length === 0 && justDone.length === 0 && !showInput ? (
          <p className="font-hand text-[13px] italic text-muted-foreground/40 text-center py-2">
            Nothing on your list — what a beautiful feeling ✨
          </p>
        ) : (
          <div className="space-y-0.5">
            <AnimatePresence>
              {active.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8, height: 0 }}
                  className="flex items-center gap-3 group py-1.5"
                >
                  <button
                    onClick={() => handleToggle(todo.id, true)}
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-colors"
                  />
                  <p className="flex-1 font-hand text-[14px] text-foreground leading-snug min-w-0">{todo.title}</p>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-muted-foreground/0 group-hover:text-muted-foreground/40 hover:!text-destructive transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {justDone.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 group py-1.5"
                >
                  <button
                    onClick={() => handleToggle(todo.id, false)}
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-primary" />
                  </button>
                  <p className="flex-1 font-hand text-[14px] text-muted-foreground/50 line-through leading-snug min-w-0">{todo.title}</p>
                  <button
                    onClick={() => handleArchive(todo.id)}
                    title="Archive to vault"
                    className="text-muted-foreground/0 group-hover:text-primary/50 hover:!text-primary transition-colors flex-shrink-0"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {justDone.length > 0 && (
          <p className="font-body text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-2">
            <Sparkles className="h-3 w-3" />
            Tap <Archive className="h-3 w-3 inline" /> to save completed tasks to your "Look What You've Done" vault
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Calendar import hook ── */
interface ImportedEvent {
  summary: string;
  start: string;
  end: string;
  time: string;
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
          return { ...ev, time };
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

  // Auto-fetch on mount if URL is saved
  useEffect(() => {
    if (icsUrl) {
      // Use cache if less than 30 minutes old
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

/* ── WEEK Page — Planner + Calendar Import ── */
function WeekPage({ today, events, showAddEvent, setShowAddEvent, newTime, setNewTime, newTitle, setNewTitle, addEvent, removeEvent, intention, setIntention, mantra, setMantra }: {
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
  intention: string;
  setIntention: (v: string) => void;
  mantra: string;
  setMantra: (v: string) => void;
}) {
  const dayOfWeek = today.getDay();
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const cal = useImportedCalendar(today);
  const [importUrl, setImportUrl] = useState("");

  const generateICSData = () => {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Signal//EN",
    ];
    events.forEach((ev) => {
      const [h, m] = ev.time.split(":");
      const start = new Date(today);
      start.setHours(parseInt(h), parseInt(m), 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      lines.push("BEGIN:VEVENT", `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${ev.title}`, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  };

  const handleCalendarExport = (type: "google" | "outlook" | "apple") => {
    if (events.length === 0) {
      toast.info("No events to export");
      return;
    }
    if (type === "google") {
      const ev = events[0];
      const [h, m] = ev.time.split(":");
      const start = new Date(today);
      start.setHours(parseInt(h), parseInt(m), 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${fmt(start)}/${fmt(end)}`;
      window.open(url, "_blank");
    } else {
      const ics = generateICSData();
      const blob = new Blob([ics], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "signal-events.ics";
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowCalendarOptions(false);
    toast.success("Calendar export ready");
  };

  const handleImportCalendar = () => {
    if (!importUrl.trim()) return;
    haptic("medium");
    cal.fetchCalendar(importUrl.trim());
    cal.setIcsUrl(importUrl.trim());
    cal.setShowImportInput(false);
    setImportUrl("");
  };

  return (
    <div className="space-y-3">
      {/* Week header */}
      <div className="text-center">
        <p className="font-hand text-[11px] text-muted-foreground/60 uppercase tracking-widest">
          Week of
        </p>
        <p className="font-hand text-lg text-foreground/80">
          {format(today, "d MMMM")}
        </p>
      </div>

      {/* Week day strip */}
      <div className="flex items-center justify-between gap-0.5 px-0.5 mb-1">
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

      {/* Intention + Mantra */}
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

      <DottedLine />

      {/* Imported calendar events (read-only) */}
      {cal.importedEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="font-hand text-[10px] text-muted-foreground/40 uppercase tracking-wider">📅 My Calendar</p>
            <button onClick={cal.clearCalendar} className="font-hand text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
              disconnect
            </button>
          </div>
          <div className="space-y-1 mb-2">
            {cal.importedEvents.slice(0, 8).map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-hand text-[11px] text-primary/40 w-10 flex-shrink-0 pt-0.5">{ev.time}</span>
                <p className="font-hand text-[12px] text-foreground/50 flex-1 leading-snug">{ev.summary}</p>
              </div>
            ))}
            {cal.importedEvents.length > 8 && (
              <p className="font-hand text-[10px] text-muted-foreground/30 text-center">
                +{cal.importedEvents.length - 8} more
              </p>
            )}
          </div>
          <DottedLine />
        </div>
      )}

      {/* Manual events */}
      <div className="space-y-1.5 min-h-[40px]">
        {events.length === 0 && !showAddEvent && cal.importedEvents.length === 0 ? (
          <div className="text-center py-3">
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

      {/* Calendar import input */}
      <AnimatePresence>
        {cal.showImportInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
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
                <button
                  onClick={handleImportCalendar}
                  disabled={cal.importing}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-body text-xs disabled:opacity-50"
                >
                  {cal.importing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Import"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons row */}
      <div className="flex items-center justify-between flex-wrap gap-y-1">
        <button
          onClick={() => {
            haptic("light");
            setShowAddEvent(!showAddEvent);
          }}
          className="flex items-center gap-1.5 font-hand text-[11px] text-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" />
          add event
        </button>
        {!cal.icsUrl && (
          <button
            onClick={() => {
              haptic("light");
              cal.setShowImportInput(!cal.showImportInput);
            }}
            className="flex items-center gap-1.5 font-hand text-[11px] text-primary/50 hover:text-primary transition-colors"
          >
            <Download className="h-3 w-3" />
            import calendar
          </button>
        )}
        <button
          onClick={() => {
            haptic("light");
            setShowCalendarOptions(!showCalendarOptions);
          }}
          className="flex items-center gap-1.5 font-hand text-[11px] text-primary/50 hover:text-primary transition-colors"
        >
          <CalendarPlus className="h-3 w-3" />
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
            className="overflow-hidden"
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

      {/* Gratitude */}
      <DottedLine />
      <div>
        <p className="font-hand text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1">✦ Gratitude</p>
        <textarea
          rows={2}
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

      <div className="flex justify-center pt-1">
        <img src={botanicalSprig} alt="" className="w-8 h-12 opacity-15" loading="lazy" />
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
  const [mobilePage, setMobilePage] = useState<"today" | "week">("today");

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

  const weekPageProps = {
    today, events, showAddEvent, setShowAddEvent, newTime, setNewTime, newTitle, setNewTitle, addEvent, removeEvent,
    intention, setIntention, mantra, setMantra,
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
        {isMobile ? (
          <div>
            {/* Page tab indicator — Today first */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => { haptic("light"); setMobilePage("today"); }}
                className={`font-hand text-[12px] px-3 py-1 rounded-full transition-all ${
                  mobilePage === "today"
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground/40"
                }`}
              >
                Today →
              </button>
              <span className="text-muted-foreground/20 text-[10px]">|</span>
              <button
                onClick={() => { haptic("light"); setMobilePage("week"); }}
                className={`font-hand text-[12px] px-3 py-1 rounded-full transition-all ${
                  mobilePage === "week"
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground/40"
                }`}
              >
                ✦ This Week
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mobilePage}
                initial={{ opacity: 0, x: mobilePage === "week" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mobilePage === "week" ? -20 : 20 }}
                transition={{ duration: 0.25 }}
              >
                {mobilePage === "today" ? (
                  <TodayPage today={today} />
                ) : (
                  <WeekPage {...weekPageProps} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Page dots */}
            <div className="flex justify-center gap-2 mt-4">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${mobilePage === "today" ? "bg-primary/50" : "bg-muted-foreground/20"}`} />
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${mobilePage === "week" ? "bg-primary/50" : "bg-muted-foreground/20"}`} />
            </div>
          </div>
        ) : (
          /* ── DESKTOP: Open book spread ── */
          <div className="grid grid-cols-2 gap-4" style={{ minHeight: 380 }}>
            <div className="pr-3 border-r border-dotted border-foreground/8">
              <TodayPage today={today} />
            </div>
            <div className="pl-1">
              <WeekPage {...weekPageProps} />
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
