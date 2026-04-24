import { useState, useMemo, useEffect } from "react";
import { WildStar } from "@/components/BotanicalElements";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Clock, Zap, Dumbbell } from "lucide-react";
import streakFlame from "@/assets/streak-flame.png";

/* ── Body-part tag derivation from exercise data ── */
const BODY_KEYWORDS: Record<string, string[]> = {
  "Upper Body": ["chest", "shoulder", "bicep", "tricep", "back", "lat", "deltoid", "press", "push-up", "pull-up", "row", "curl", "fly"],
  "Lower Body": ["squat", "lunge", "deadlift", "glute", "hamstring", "quad", "calf", "hip thrust", "leg"],
  "Core": ["plank", "crunch", "ab", "oblique", "hollow", "dead bug", "sit-up", "core"],
  "Cardio": ["run", "jog", "sprint", "bike", "cycle", "rowing", "jump", "burpee", "cardio", "walk"],
  "Flexibility": ["stretch", "yoga", "pigeon", "fold", "twist", "mobility", "somatic", "fascia", "cat cow"],
  "Full Body": ["clean", "snatch", "thruster", "turkish", "circuit"],
};

function deriveBodyTags(exercises: any[], notes?: string | null): string[] {
  const tags = new Set<string>();
  const text = [
    ...(exercises || []).map((e: any) => (e.exercise_name || e.name || "").toLowerCase()),
    (notes || "").toLowerCase(),
  ].join(" ");

  for (const [tag, keywords] of Object.entries(BODY_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) tags.add(tag);
  }
  if (tags.size === 0 && exercises?.length) tags.add("General");
  return Array.from(tags);
}

/* ── Types ── */
interface WorkoutLog {
  id: string;
  session_date: string;
  workout_template_id: string | null;
  duration_minutes: number | null;
  notes: string | null;
  completed: boolean;
  exercises: any[];
  calories: number | null;
  avg_bpm: number | null;
  zone2_plus_percent: number | null;
  template_title?: string;
  session_type?: string;
}

const TAG_COLORS: Record<string, string> = {
  "Upper Body": "bg-primary/15 text-primary",
  "Lower Body": "bg-[hsl(var(--phase-follicular)/0.15)] text-[hsl(var(--phase-follicular))]",
  Core: "bg-[hsl(var(--phase-ovulatory)/0.15)] text-[hsl(var(--phase-ovulatory))]",
  Cardio: "bg-destructive/15 text-destructive",
  Flexibility: "bg-[hsl(var(--phase-luteal)/0.15)] text-[hsl(var(--phase-luteal))]",
  "Full Body": "bg-accent text-accent-foreground",
  General: "bg-secondary text-muted-foreground",
};

// NZ-safe local date string (YYYY-MM-DD in Pacific/Auckland)
function nzDateStr(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default function MovementCalendar({ refreshKey = 0 }: { refreshKey?: number }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const todayStr = nzDateStr(today);

  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch full workout_logs + template titles for the month ── */
  useEffect(() => {
    setLoading(true);
    const monthStart = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    const nextMonth = viewMonth === 11 ? `${viewYear + 1}-01-01` : `${viewYear}-${String(viewMonth + 2).padStart(2, "0")}-01`;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase
        .from("workout_logs")
        .select("id, session_date, workout_template_id, duration_minutes, notes, completed, exercises, calories, avg_bpm, zone2_plus_percent")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("session_date", monthStart)
        .lt("session_date", nextMonth)
        .order("session_date", { ascending: false })
        .then(async ({ data }) => {
          if (!data) { setLoading(false); return; }

          // Fetch template titles for any that have a template id
          const templateIds = [...new Set(data.filter(d => d.workout_template_id).map(d => d.workout_template_id!))];
          let templateMap: Record<string, { title: string; session_type: string | null }> = {};
          if (templateIds.length > 0) {
            const { data: templates } = await supabase
              .from("workout_templates")
              .select("id, title, session_type")
              .in("id", templateIds);
            if (templates) {
              for (const t of templates) templateMap[t.id] = { title: t.title, session_type: t.session_type };
            }
          }

          const enriched: WorkoutLog[] = data.map((d: any) => ({
            ...d,
            exercises: d.exercises || [],
            template_title: d.workout_template_id ? templateMap[d.workout_template_id]?.title : undefined,
            session_type: d.workout_template_id ? templateMap[d.workout_template_id]?.session_type : undefined,
          }));

          setLogs(enriched);
          setLoading(false);
        });
    });
  }, [viewYear, viewMonth, refreshKey]);

  /* ── Calendar grid data ── */
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-NZ", { month: "long", year: "numeric" });

  // Group logs by date
  const logsByDate = useMemo(() => {
    const map: Record<string, WorkoutLog[]> = {};
    for (const l of logs) {
      if (!map[l.session_date]) map[l.session_date] = [];
      map[l.session_date].push(l);
    }
    return map;
  }, [logs]);

  // Compute stats
  const { dayCells, workoutCount, totalMinutes, zone2Days, totalCalories, elapsedDays, activityDays } = useMemo(() => {
    const cells: { day: number; dateStr: string; hasWorkout: boolean; isToday: boolean; isPast: boolean; count: number }[] = [];
    let wCount = 0, mins = 0, z2 = 0, cals = 0, actDays = 0, elapsed = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateStr = date.toISOString().split("T")[0];
      const isToday = dateStr === todayStr;
      const isPast = date < today && !isToday;
      const dayLogs = logsByDate[dateStr] || [];
      const hasWorkout = dayLogs.length > 0;

      if (isPast || isToday) elapsed++;
      if (hasWorkout) {
        wCount += dayLogs.length;
        actDays++;
        for (const l of dayLogs) {
          mins += l.duration_minutes || 0;
          cals += l.calories || 0;
          if (l.zone2_plus_percent && l.zone2_plus_percent > 0) z2++;
        }
      }
      cells.push({ day: d, dateStr, hasWorkout, isToday, isPast, count: dayLogs.length });
    }
    return { dayCells: cells, workoutCount: wCount, totalMinutes: mins, zone2Days: z2, totalCalories: cals, elapsedDays: elapsed, activityDays: actDays };
  }, [logsByDate, daysInMonth, viewYear, viewMonth, todayStr]);

  const consistency = elapsedDays > 0 ? Math.round((activityDays / elapsedDays) * 100) : 0;

  // Streak (look back up to 90 days across all data)
  const streak = useMemo(() => {
    const dateSet = new Set(logs.map(l => l.session_date));
    // For streak we need data beyond this month - just use what we have
    let s = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (dateSet.has(ds)) s++;
      else if (i > 0) break; // allow today to not have one yet
      else break;
    }
    return s;
  }, [logs]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="touch-btn font-body text-sm text-muted-foreground px-3 py-1">←</button>
        <h3 className="font-display text-base italic text-foreground">{monthName}</h3>
        <button onClick={nextMonth} className="touch-btn font-body text-sm text-muted-foreground px-3 py-1">→</button>
      </div>

      {/* Summary */}
      <p className="font-body text-xs text-muted-foreground text-center">
        {workoutCount} workouts · {zone2Days} Zone 2+ days · {totalMinutes} min total
      </p>

      {streak > 0 && (
        <p className="font-hand text-sm text-primary text-center flex items-center justify-center gap-1.5">
          <WildStar size={14} /> {streak} day streak
        </p>
      )}

      {/* Calendar grid */}
      <div className="card-warm p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d, i) => (
            <div key={i} className="text-center">
              <span className="font-body text-[9px] text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-11" />
          ))}

          {dayCells.map(cell => (
            <div
              key={cell.dateStr}
              className={`h-11 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                cell.isToday && !cell.hasWorkout ? "ring-2 ring-primary" : ""
              }`}
              style={
                cell.hasWorkout
                  ? { backgroundColor: "hsl(var(--primary))" }
                  : undefined
              }
            >
              <span
                className={`font-body text-[10px] ${
                  cell.hasWorkout
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {cell.day}
              </span>
              {/* Streak flame icon on workout days */}
              {cell.hasWorkout && (
                <img
                  src={streakFlame}
                  alt=""
                  className="absolute -top-1 -right-0.5 w-3.5 h-3.5 opacity-90"
                  loading="lazy"
                  width={14}
                  height={14}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Workouts", value: String(workoutCount), icon: Dumbbell },
          { label: "Minutes", value: String(totalMinutes), icon: Clock },
          { label: "Zone 2+", value: String(zone2Days), icon: Zap },
          { label: "Consistency", value: `${consistency}%`, icon: Flame },
        ].map(stat => (
          <div key={stat.label} className="card-warm p-3 text-center">
            <stat.icon className="h-3.5 w-3.5 mx-auto mb-1 text-primary/60" />
            <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
            <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Enhanced Workout History ── */}
      {logs.length > 0 && (
        <div>
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-2">Workout history</p>
          <div className="space-y-2">
            {logs.map(log => {
              const title = log.template_title
                || (log.exercises?.[0]?.exercise_name ? `${log.exercises[0].exercise_name} session` : "Logged workout");
              const bodyTags = deriveBodyTags(log.exercises, log.notes);
              const z2Mins = log.zone2_plus_percent && log.duration_minutes
                ? Math.round((log.zone2_plus_percent / 100) * log.duration_minutes)
                : 0;

              return (
                <div key={log.id} className="card-warm p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-foreground truncate">{title}</p>
                      <p className="font-body text-[9px] text-muted-foreground mt-0.5">
                        {log.session_date}
                      </p>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <img src={streakFlame} alt="" className="w-3.5 h-3.5" width={14} height={14} />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-[10px]">
                    {log.duration_minutes && (
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <Clock className="h-3 w-3" /> {log.duration_minutes} min
                      </span>
                    )}
                    {log.calories && log.calories > 0 && (
                      <span className="flex items-center gap-0.5 text-destructive">
                        <Flame className="h-3 w-3" /> {log.calories} cal
                      </span>
                    )}
                    {z2Mins > 0 && (
                      <span className="flex items-center gap-0.5 text-primary">
                        <Zap className="h-3 w-3" /> {z2Mins} min Z2+
                      </span>
                    )}
                    {log.avg_bpm && (
                      <span className="text-muted-foreground">
                        ♥ {log.avg_bpm} bpm
                      </span>
                    )}
                  </div>

                  {/* Body-part tags */}
                  {bodyTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bodyTags.map(tag => (
                        <span key={tag} className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${TAG_COLORS[tag] || TAG_COLORS.General}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <p className="font-body text-xs text-muted-foreground italic">"{log.notes}"</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && logs.length === 0 && (
        <p className="font-body text-xs text-muted-foreground text-center animate-pulse">Loading workout data…</p>
      )}
    </div>
  );
}
