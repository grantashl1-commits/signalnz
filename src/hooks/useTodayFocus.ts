import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useCycle } from "@/contexts/CycleContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { format } from "date-fns";

/* ── Generic fallbacks per phase (shown to free / logged-out users) ── */
const GENERIC: Record<Phase, { eat: string; move: string; rest: string; cycle: string }> = {
  follicular: {
    eat: "Embrace fermented foods and complex carbs as estrogen rises.",
    move: "This is your strength window — lift heavy, push harder.",
    rest: "Coherent breathing — 5 breaths per minute for 5 minutes.",
    cycle: "Estrogen is climbing — energy and clarity are your superpowers right now.",
  },
  menstrual: {
    eat: "Focus on iron-rich foods with vitamin C to support your body.",
    move: "Rest is productive. Gentle yoga and walking only.",
    rest: "Physiological sigh — instant calm when you need it.",
    cycle: "Honour your need for rest. This is your inner winter.",
  },
  ovulatory: {
    eat: "Antioxidants, folate, and zinc for peak hormonal output.",
    move: "Peak energy — go for high intensity and group workouts.",
    rest: "You're naturally more social — lean into connection.",
    cycle: "You're at your communicative peak — use this window wisely.",
  },
  luteal: {
    eat: "Higher calorie needs are normal. Eat nutrient-dense complex carbs.",
    move: "Intuitive movement. Pilates, moderate strength, walk when in doubt.",
    rest: "4-7-8 breathing before bed for deeper sleep.",
    cycle: "Progesterone is rising — turn inward and prioritise rest.",
  },
};

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
  const { profile } = useProfile();
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

  const focus = useMemo<TodayFocus>(() => {
    const fallback = GENERIC[currentPhase];
    if (!user) return { ...fallback, personalised: false };

    let eat = "";
    let move = "";
    let rest = "";
    let cycle = "";
    let hasPersonalisation = false;

    // ── EAT: Try to extract today's meal from nutrition plan ──
    const nutritionPlan = plans?.find((p) => p.plan_type === "nutrition");
    if (nutritionPlan?.plan_data) {
      const planData = nutritionPlan.plan_data as any;
      // Try to find today's meals in the plan data
      const todayMeals = extractTodayMeals(planData, dayOfWeek);
      if (todayMeals) {
        eat = todayMeals;
        hasPersonalisation = true;
      }
    }
    if (!eat) {
      // Personalise fallback with dietary preferences
      const prefs = profile?.dietary_preferences;
      if (prefs?.length) {
        eat = `${fallback.eat} Your ${prefs[0].toLowerCase()} preferences are factored in.`;
        hasPersonalisation = true;
      } else {
        eat = fallback.eat;
      }
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
        // Personalise with fitness level
        const level = profile?.fitness_level;
        if (level) {
          move = `${fallback.move} Tailored for your ${level} fitness level.`;
          hasPersonalisation = true;
        } else {
          move = fallback.move;
        }
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
    if (!rest) rest = fallback.rest;

    // ── CYCLE: Always personalise with actual day + phase ──
    if (cycleStartDate) {
      const phaseLabel = PHASE_SHORT[currentPhase];
      cycle = `Day ${currentCycleDay} · ${phaseLabel} — ${fallback.cycle.charAt(0).toLowerCase()}${fallback.cycle.slice(1)}`;
      hasPersonalisation = true;
    } else {
      cycle = fallback.cycle;
    }

    return { eat, move, rest, cycle, personalised: hasPersonalisation };
  }, [user, plans, todayWorkout, todayMindfulness, currentPhase, currentCycleDay, cycleStartDate, profile, dayOfWeek]);

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
      const dayIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(dayKey);
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

    // Try weeks -> sessions structure
    if (Array.isArray(planData.weeks)) {
      const currentWeek = planData.weeks[0]; // Most recent
      if (currentWeek?.sessions) {
        return extractTodaySession({ sessions: currentWeek.sessions }, dayOfWeek);
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
