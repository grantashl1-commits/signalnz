import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split("T")[0];
}

async function getUserAIContext(supabase: any, userId: string) {
  const weekStart = getWeekStart();

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, suburb, profession")
    .eq("user_id", userId)
    .maybeSingle();

  // Latest body measurements
  const { data: measurements } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Latest weekly check-in
  const { data: checkin } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Active goal + progress
  const { data: goals } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const activeGoal = goals?.[0] || null;
  let progressEntries: any[] = [];
  let progressPercent = 0;
  if (activeGoal) {
    const { data: prog } = await supabase
      .from("goal_progress")
      .select("*")
      .eq("goal_id", activeGoal.id)
      .order("logged_at", { ascending: true });
    progressEntries = prog || [];
    if (progressEntries.length > 0 && activeGoal.target_date) {
      const totalWeeks = Math.max(1, Math.ceil(
        (new Date(activeGoal.target_date).getTime() - new Date(activeGoal.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
      ));
      const elapsedWeeks = Math.ceil(
        (Date.now() - new Date(activeGoal.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      progressPercent = Math.min(100, Math.round((elapsedWeeks / totalWeeks) * 100));
    }
  }

  // Workout sessions this week
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_at", weekStart);

  const sessionsThisWeek = sessions?.length || 0;
  const activeMinutes = sessions?.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) || 0;

  // Community stats — all sessions this week across all users
  const { data: allSessions } = await supabase
    .from("workout_sessions")
    .select("user_id, workout_type, duration_minutes")
    .gte("completed_at", weekStart);

  let groupAvgSessions = 0;
  let topWorkoutType = "N/A";
  let userRank = 0;
  let groupSize = 0;

  if (allSessions && allSessions.length > 0) {
    const byUser: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const s of allSessions) {
      byUser[s.user_id] = (byUser[s.user_id] || 0) + 1;
      byType[s.workout_type] = (byType[s.workout_type] || 0) + 1;
    }
    groupSize = Object.keys(byUser).length;
    groupAvgSessions = Math.round(allSessions.length / groupSize * 10) / 10;
    topWorkoutType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const ranked = Object.entries(byUser).sort((a, b) => b[1] - a[1]);
    userRank = ranked.findIndex(([uid]) => uid === userId) + 1;
    if (userRank === 0) userRank = groupSize + 1;
  }

  const weeksToGoal = activeGoal?.target_date
    ? Math.max(0, Math.ceil((new Date(activeGoal.target_date).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
    : null;

  return {
    user: {
      firstName: profile?.display_name?.split(" ")[0] || "Friend",
      goal: activeGoal?.goal_description || "General wellness",
      dietaryNotes: "No specific restrictions noted",
    },
    biometrics: {
      weight: measurements?.weight || "Not recorded",
      height: measurements?.height || "Not recorded",
      bodyFat: measurements?.body_fat || "Not recorded",
      sessionsThisWeek,
      activeMinutes,
    },
    checkin: {
      energyRating: checkin?.energy || "Not submitted",
      sleepRating: checkin?.sleep_quality || "Not submitted",
      sorenessLevel: checkin?.soreness || "Not submitted",
      userNotes: checkin?.notes || "None",
    },
    goalProgress: {
      goalDescription: activeGoal?.goal_description || "No goal set",
      weekNumber: progressEntries.length + 1,
      progressPercent,
      weeksToGoal: weeksToGoal ?? "No target date",
      lastValue: progressEntries.length > 0 ? progressEntries[progressEntries.length - 1].value : null,
    },
    community: {
      groupAvgSessions,
      topWorkoutType,
      userRank,
      groupSize,
    },
  };
}

function buildTrainingPrompt(ctx: any) {
  return `You are a personal health coach inside Signal, a community wellness app based in New Zealand. Generate a weekly training plan for this user.

USER PROFILE:
- Name: ${ctx.user.firstName}
- Goal: ${ctx.user.goal}
- Weight: ${ctx.biometrics.weight}

ACTIVITY THIS WEEK:
- Sessions completed: ${ctx.biometrics.sessionsThisWeek}
- Active minutes: ${ctx.biometrics.activeMinutes}

SELF-REPORTED THIS WEEK:
- Energy (1-10): ${ctx.checkin.energyRating}
- Sleep (1-10): ${ctx.checkin.sleepRating}
- Soreness: ${ctx.checkin.sorenessLevel}
- Notes: ${ctx.checkin.userNotes}

GOAL PROGRESS:
- Goal: ${ctx.goalProgress.goalDescription}
- Week ${ctx.goalProgress.weekNumber} of plan
- Progress: ${ctx.goalProgress.progressPercent}% complete
- Weeks remaining: ${ctx.goalProgress.weeksToGoal}

COMMUNITY (their Signal group):
- Group average sessions: ${ctx.community.groupAvgSessions}
- Most popular workout: ${ctx.community.topWorkoutType}
- Their rank: ${ctx.community.userRank} of ${ctx.community.groupSize} members

RULES:
- If soreness is high, reduce intensity
- Reference community stats naturally in the plan
- 5-7 day plan with 1-2 recovery days
- End with a short motivational note referencing their specific progress
- Format day by day with duration, type, and intensity
- Tone: warm and encouraging, like a coach who knows them well
- Use markdown formatting with headers and bullet points`;
}

function buildNutritionPrompt(ctx: any) {
  return `You are a nutrition coach inside Signal, a New Zealand wellness app. Generate a practical weekly nutrition guide. Never diagnose or treat medical conditions.

USER:
- Name: ${ctx.user.firstName}
- Goal: ${ctx.user.goal}
- Dietary preferences: ${ctx.user.dietaryNotes}
- Activity this week: ${ctx.biometrics.activeMinutes} active minutes
- Sessions: ${ctx.biometrics.sessionsThisWeek}

SELF-REPORTED:
- Energy: ${ctx.checkin.energyRating}/10
- Sleep: ${ctx.checkin.sleepRating}/10
- Notes: ${ctx.checkin.userNotes}

GOAL PROGRESS:
- ${ctx.goalProgress.goalDescription} — ${ctx.goalProgress.progressPercent}% complete

RULES:
- Match calorie guidance to activity level
- 3 practical meal ideas per day, use NZ-available foods
- Include hydration guidance based on activity level
- End with ONE specific actionable focus for the week
- Tone: practical, friendly, not preachy
- Use markdown formatting with headers and bullet points`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { planType } = await req.json();
    if (!planType || !["training", "nutrition"].includes(planType)) {
      throw new Error("planType must be 'training' or 'nutrition'");
    }

    const ctx = await getUserAIContext(supabase, user.id);
    const prompt = planType === "training" ? buildTrainingPrompt(ctx) : buildNutritionPrompt(ctx);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const planContent = aiData.choices?.[0]?.message?.content || "Unable to generate plan.";

    // Save generated plan
    const weekStart = getWeekStart();
    await supabase.from("generated_plans").insert({
      user_id: user.id,
      plan_type: planType,
      plan_content: planContent,
      week_start_date: weekStart,
    });

    return new Response(JSON.stringify({ plan: planContent, context: ctx }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-plan error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
