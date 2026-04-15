import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { format } from "date-fns";

/* ── Generic fallbacks per phase (shown to free / logged-out users) ── */
const GENERIC: Record<Phase, { eat: string; move: string; rest: string[]; cycle: string }> = {
  follicular: {
    eat: "Embrace fermented foods and complex carbs as estrogen rises.",
    move: "This is your strength window — lift heavy, push harder.",
    rest: [
      "Coherent breathing — 5 breaths per minute for 5 minutes.",
      "Try a 10-minute walking meditation in nature.",
      "Journal three things you're excited about this week.",
      "Stretch for 10 minutes — your body is waking up.",
      "Listen to something that lifts your mood today.",
      "Try a cold-water face splash to reset your nervous system.",
      "Do a 5-minute gratitude scan before bed tonight.",
    ],
    cycle: "Estrogen is climbing — energy and clarity are your superpowers right now.",
  },
  menstrual: {
    eat: "Focus on iron-rich foods with vitamin C to support your body.",
    move: "Rest is productive. Gentle yoga and walking only.",
    rest: [
      "Physiological sigh — instant calm when you need it.",
      "Run a warm bath with magnesium salts tonight.",
      "Legs up the wall for 10 minutes — let gravity do the work.",
      "Wrap yourself in a blanket and do nothing for 15 minutes.",
      "Try a body scan meditation before sleep.",
      "Sip on chamomile or ginger tea this evening.",
      "Give yourself permission to cancel one thing today.",
    ],
    cycle: "Honour your need for rest. This is your inner winter.",
  },
  ovulatory: {
    eat: "Antioxidants, folate, and zinc for peak hormonal output.",
    move: "Peak energy — go for high intensity and group workouts.",
    rest: [
      "You're naturally more social — lean into connection.",
      "Call or voice-note someone you love today.",
      "Dance to your favourite song — no rules, just feel it.",
      "Take a creative break — draw, write, or daydream for 10 minutes.",
      "Try laughter yoga — yes, it's real, and it works.",
      "Spend time outdoors — sunlight boosts your peak-phase glow.",
      "Do something spontaneous today — say yes to the unexpected.",
    ],
    cycle: "You're at your communicative peak — use this window wisely.",
  },
  luteal: {
    eat: "Higher calorie needs are normal. Eat nutrient-dense complex carbs.",
    move: "Intuitive movement. Pilates, moderate strength, walk when in doubt.",
    rest: [
      "4-7-8 breathing before bed for deeper sleep.",
      "Try a 10-minute yin yoga sequence to calm your nervous system.",
      "Light a candle and sit quietly for 5 minutes tonight.",
      "Write down anything weighing on your mind — then close the notebook.",
      "Gentle self-massage on your neck and shoulders before bed.",
      "Diffuse lavender or cedarwood — your body craves grounding scents.",
      "Put your phone away an hour before bed — your future self will thank you.",
    ],
    cycle: "Progesterone is rising — turn inward and prioritise rest.",
  },
};

/** Pick a rest tip that rotates daily based on the day of year */
function pickDailyRest(tips: string[]): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return tips[dayOfYear % tips.length];
}

export interface TodayFocus {
  eat: string;
  move: string;
  rest: string;
  cycle: string;
  /** Whether the data is personalised (true) or generic fallback (false) */
  personalised: boolean;
}

export function useTodayFocus(): { focus: TodayFocus; loading: boolean } {
  const { user } = useAuth();
  const { currentPhase, currentCycleDay, cycleStartDate } = useCycle();
  const profileData = useProfile();
  const today = format(new Date(), "yyyy-MM-dd");
  const dayOfWeek = new Date().toLocaleDateString("en-NZ", { weekday: "long" });

  // Fetch user plans (nutrition + training) for today
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["today-focus-plans", user?.id, today],
    enabled: !!user,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_plans")
        .select("plan_type, plan_data, cycle_phase_at_generation")
        .eq("user_id", user!.id)
        .order("generated_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Fetch today's workout log to show completion or scheduled session
  const { data: todayWorkout, isLoading: workoutLoading } = useQuery({
    queryKey: ["today-focus-workout", user?.id, today],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("completed, duration_minutes, workout_template_id")
        .eq("user_id", user!.id)
        .eq("session_date", today)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch today's mindfulness log
  const { data: todayMindfulness, isLoading: mindLoading } = useQuery({
    queryKey: ["today-focus-mindfulness", user?.id, today],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mindfulness_logs")
        .select("completed, practice_type, duration_sec")
        .eq("user_id", user!.id)
        .eq("log_date", today)
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { dietaryPreferences, fitnessLevel, ...restProfile } = profileData;

  const focus = useMemo<TodayFocus>(() => {
    const fallback = GENERIC[currentPhase];
    if (!user) return { eat: fallback.eat, move: fallback.move, rest: pickDailyRest(fallback.rest), cycle: fallback.cycle, personalised: false };

    let eat = "";
    let move = "";
    let rest = "";
    let cycle = "";
    let hasPersonalisation = false;

    // ── EAT: Try to extract today's meal from nutrition plan ──
    const nutritionPlan = plans?.find((p) => p.plan_type === "nutrition");
    if (nutritionPlan?.plan_data) {
      const planData = nutritionPlan.plan_data as any;
      const todayMeals = extractTodayMeals(planData, dayOfWeek);
      if (todayMeals) {
        eat = todayMeals;
        hasPersonalisation = true;
      }
    }
    // Fallback: check localStorage meal plan (from onboarding auto-gen)
    if (!eat) {
      try {
        const stored = localStorage.getItem("signal_meal_plan");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.plan && Array.isArray(parsed.plan)) {
            const dayIndex = new Date().getDay(); // 0=Sun
            const dayPlan = parsed.plan[dayIndex % parsed.plan.length];
            if (dayPlan) {
              const parts: string[] = [];
              if (dayPlan.breakfast?.name) parts.push(dayPlan.breakfast.name);
              if (dayPlan.lunch?.name) parts.push(dayPlan.lunch.name);
              if (dayPlan.dinner?.name) parts.push(dayPlan.dinner.name);
              if (parts.length > 0) {
                eat = parts.join(" · ");
                hasPersonalisation = true;
              }
            }
          }
        }
      } catch { /* ignore */ }
    }
    if (!eat) {
      eat = fallback.eat;
    }

    // ── MOVE: Show today's session or phase-matched suggestion ──
    if (todayWorkout?.completed) {
      const mins = todayWorkout.duration_minutes;
      move = `✓ Workout complete${mins ? ` — ${mins} min` : ""}. Recovery is now the priority.`;
      hasPersonalisation = true;
    } else {
      const trainingPlan = plans?.find((p) => p.plan_type === "ai_training" || p.plan_type === "workout");
      if (trainingPlan?.plan_data) {
        const session = extractTodaySession(trainingPlan.plan_data as any, dayOfWeek);
        if (session) {
          move = session;
          hasPersonalisation = true;
        }
      }
      if (!move) {
        move = fallback.move;
      }
    }

    // ── REST: Show mindfulness activity or suggestion ──
    if (todayMindfulness?.length) {
      const completed = todayMindfulness.filter((m) => m.completed);
      if (completed.length > 0) {
        const totalSec = completed.reduce((sum, m) => sum + (m.duration_sec || 0), 0);
        const mins = Math.round(totalSec / 60);
        rest = `✓ ${completed.length} practice${completed.length > 1 ? "s" : ""} done today${mins ? ` (${mins} min)` : ""}. Beautiful consistency.`;
        hasPersonalisation = true;
      } else {
        rest = `You have a ${todayMindfulness[0].practice_type} session queued — even 5 minutes counts.`;
        hasPersonalisation = true;
      }
    }
    if (!rest) rest = pickDailyRest(fallback.rest);

    // ── CYCLE: Always personalise with actual day + phase ──
    if (cycleStartDate) {
      const phaseLabel = PHASE_SHORT[currentPhase];
      cycle = `Day ${currentCycleDay} · ${phaseLabel} — ${fallback.cycle.charAt(0).toLowerCase()}${fallback.cycle.slice(1)}`;
      hasPersonalisation = true;
    } else {
      cycle = fallback.cycle;
    }

    return { eat, move, rest, cycle, personalised: hasPersonalisation };
  }, [user, plans, todayWorkout, todayMindfulness, currentPhase, currentCycleDay, cycleStartDate, dietaryPreferences, fitnessLevel, dayOfWeek]);

  return {
    focus,
    loading: !!user && (plansLoading || workoutLoading || mindLoading),
  };
}

/* ── Helpers to extract relevant data from plan JSON ── */

function extractTodayMeals(planData: any, dayOfWeek: string): string | null {
  try {
    // Plan data may be structured as { days: [...] } or { monday: {...} } etc.
    const dayKey = dayOfWeek.toLowerCase();

    // Try object-keyed format
    if (planData[dayKey]) {
      const day = planData[dayKey];
      const meals: string[] = [];
      if (day.breakfast) meals.push(day.breakfast.name || day.breakfast.title || day.breakfast);
      if (day.lunch) meals.push(day.lunch.name || day.lunch.title || day.lunch);
      if (day.dinner) meals.push(day.dinner.name || day.dinner.title || day.dinner);
      if (meals.length) return meals.join(" · ");
    }

    // Try array format
    if (Array.isArray(planData.days)) {
      const dayIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(dayKey);
      const day = planData.days[dayIndex] || planData.days[dayIndex % planData.days.length];
      if (day?.meals) {
        const names = day.meals.map((m: any) => m.name || m.title).filter(Boolean);
        if (names.length) return names.join(" · ");
      }
    }

    // Try plan_data as a string that was JSON-parsed at a higher level
    if (typeof planData === "string") {
      const parsed = JSON.parse(planData);
      return extractTodayMeals(parsed, dayOfWeek);
    }
  } catch {
    // Fall through to null
  }
  return null;
}

function extractTodaySession(planData: any, dayOfWeek: string): string | null {
  try {
    const dayKey = dayOfWeek.toLowerCase();
    const dayIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(dayKey);
    // 1-based day of week (Mon=1 .. Sun=7)
    const isoDayOfWeek = dayIndex === 0 ? 7 : dayIndex;

    // Try object-keyed format
    if (planData[dayKey]) {
      const session = planData[dayKey];
      if (typeof session === "string") return session;
      if (session.title || session.name) {
        const title = session.title || session.name;
        const duration = session.duration || session.estimated_duration_mins;
        return `${title}${duration ? ` — ${duration} min` : ""}`;
      }
    }

    // Try sessions array
    if (Array.isArray(planData.sessions)) {
      const todaySessions = planData.sessions.filter(
        (s: any) => s.day_label?.toLowerCase() === dayKey || s.day_index === dayIndex
      );
      if (todaySessions.length) {
        const s = todaySessions[0];
        const title = s.title || s.name;
        const duration = s.estimated_duration_mins || s.duration;
        return `${title}${duration ? ` — ${duration} min` : ""}`;
      }
    }

    // ── Handle generate-plan format: weeks[].days[] ──
    if (Array.isArray(planData.weeks) && planData.weeks.length > 0) {
      // Use first week (current)
      const week = planData.weeks[0];
      if (Array.isArray(week?.days)) {
        // Match by day number (1-based ISO day of week)
        const dayMatch = week.days.find((d: any) => d.day === isoDayOfWeek);
        if (dayMatch) {
          const title = dayMatch.title || dayMatch.session_type || "Training";
          const duration = dayMatch.duration_minutes;
          const exerciseCount = dayMatch.exercises?.length;
          const parts = [title];
          if (duration) parts.push(`${duration} min`);
          if (exerciseCount) parts.push(`${exerciseCount} exercises`);
          return parts.join(" — ");
        }
        // If no match by ISO day, try sequential: day 1 = first training day this week
        // Find today's position among training days
        const trainingDays = week.days.filter((d: any) => d.session_type !== "rest");
        if (trainingDays.length > 0) {
          // Use modulo to cycle through available days
          const idx = (isoDayOfWeek - 1) % trainingDays.length;
          const d = trainingDays[idx];
          if (d) {
            const title = d.title || d.session_type || "Training";
            const duration = d.duration_minutes;
            return `${title}${duration ? ` — ${duration} min` : ""}`;
          }
        }
      }
      // Try weeks[].sessions fallback
      if (week?.sessions) {
        return extractTodaySession({ sessions: week.sessions }, dayOfWeek);
      }
    }

    if (typeof planData === "string") {
      return extractTodaySession(JSON.parse(planData), dayOfWeek);
    }
  } catch {
    // Fall through
  }
  return null;
}
