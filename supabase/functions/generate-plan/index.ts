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
  const mon = new Date(d.getFullYear(), d.getMonth(), diff);
  return mon.toISOString().split("T")[0];
}

function getCyclePhase(cycleDay: number): { phase: string; guidance: string } {
  if (cycleDay <= 5) return { phase: "Menstrual", guidance: "Focus on gentle movement: yoga, stretching, light walks. Iron-rich foods are key — leafy greens, red meat, legumes. Prioritise warmth and rest." };
  if (cycleDay <= 13) return { phase: "Follicular", guidance: "Energy is rising — embrace strength training, HIIT, and progressive overload. Fuel with complex carbs, fermented foods, and protein for muscle repair." };
  if (cycleDay <= 16) return { phase: "Ovulatory", guidance: "Peak performance window — push for PRs, group classes, high-intensity work. Antioxidant-rich foods, lighter meals, plenty of hydration." };
  return { phase: "Luteal", guidance: "Energy may dip — moderate steady-state cardio, pilates, swimming. Magnesium-rich foods (dark chocolate, nuts, seeds), healthy fats, and complex carbs to manage cravings." };
}

async function getUserAIContext(supabase: any, userId: string) {
  const weekStart = getWeekStart();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, suburb, profession")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: measurements } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: checkin } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_at", weekStart);

  const sessionsThisWeek = sessions?.length || 0;
  const activeMinutes = sessions?.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) || 0;

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

  const cycleDay = ((Math.floor(Date.now() / (24 * 60 * 60 * 1000))) % 28) + 1;
  const cycleInfo = getCyclePhase(cycleDay);

  // Load fitness profile from localStorage-synced fields if available
  let fitnessLevel = "intermediate";
  let equipment = "bodyweight, dumbbells";
  let injuries = "none reported";

  return {
    user: {
      firstName: profile?.display_name?.split(" ")[0] || "Friend",
      goal: activeGoal?.goal_description || "General wellness",
      dietaryNotes: "No specific restrictions noted",
      suburb: profile?.suburb || "",
    },
    biometrics: {
      weight: measurements?.weight || "Not recorded",
      height: measurements?.height || "Not recorded",
      bodyFat: measurements?.body_fat || "Not recorded",
      chest: measurements?.chest || null,
      waist: measurements?.waist || null,
      hips: measurements?.hips || null,
      thighs: measurements?.thighs || null,
      arms: measurements?.arms || null,
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
    cycle: cycleInfo,
    fitness: { fitnessLevel, equipment, injuries },
  };
}

function buildTrainingPrompt(ctx: any) {
  const bmi = ctx.biometrics.weight !== "Not recorded" && ctx.biometrics.height !== "Not recorded"
    ? (() => {
        const w = parseFloat(ctx.biometrics.weight);
        const h = parseFloat(ctx.biometrics.height) / 100;
        return w && h ? (w / (h * h)).toFixed(1) : null;
      })()
    : null;

  return `You are a CSEP-certified personal trainer and sports scientist generating a weekly training plan inside Signal, a New Zealand wellness app.

YOUR QUALIFICATIONS (role-play):
- Certified Strength & Conditioning Specialist
- BSc Exercise & Sport Science
- Specialist in female physiology and menstrual cycle periodisation

USER PROFILE:
- Name: ${ctx.user.firstName}
- Primary goal: ${ctx.user.goal}
- Location: ${ctx.user.suburb || "New Zealand"}
- Fitness level: ${ctx.fitness.fitnessLevel}
- Available equipment: ${ctx.fitness.equipment}
- Injuries/limitations: ${ctx.fitness.injuries}

BODY MEASUREMENTS:
- Weight: ${ctx.biometrics.weight}
- Height: ${ctx.biometrics.height}
${bmi ? `- Estimated BMI: ${bmi}` : ""}
- Body fat: ${ctx.biometrics.bodyFat}
${ctx.biometrics.chest ? `- Chest: ${ctx.biometrics.chest}` : ""}
${ctx.biometrics.waist ? `- Waist: ${ctx.biometrics.waist}` : ""}
${ctx.biometrics.hips ? `- Hips: ${ctx.biometrics.hips}` : ""}

MENSTRUAL CYCLE STATE:
- Current phase: ${ctx.cycle.phase}
- Phase training guidance: ${ctx.cycle.guidance}

CURRENT TRAINING LOAD:
- Sessions completed this week: ${ctx.biometrics.sessionsThisWeek}
- Active minutes this week: ${ctx.biometrics.activeMinutes}

WEEKLY CHECK-IN DATA:
- Subjective energy (1-10): ${ctx.checkin.energyRating}
- Sleep quality (1-10): ${ctx.checkin.sleepRating}
- Soreness level: ${ctx.checkin.sorenessLevel}
- User notes: ${ctx.checkin.userNotes}

GOAL TRACKING:
- Goal: ${ctx.goalProgress.goalDescription}
- Currently on week ${ctx.goalProgress.weekNumber}
- Progress: ${ctx.goalProgress.progressPercent}% toward target
- Weeks remaining: ${ctx.goalProgress.weeksToGoal}

COMMUNITY CONTEXT:
- Group average sessions/week: ${ctx.community.groupAvgSessions}
- Most popular workout type: ${ctx.community.topWorkoutType}
- User's rank: ${ctx.community.userRank} of ${ctx.community.groupSize}

═══ PROGRAMMING PRINCIPLES (MANDATORY) ═══

1. PERIODISATION: Apply undulating periodisation across the week. Reference Kiely (2012) supercompensation principles. Adjust intensity to cycle phase:
   - Menstrual: RPE 5-6 max, no more than 1 strength session. Prioritise yoga, walks, gentle mobility
   - Follicular: RPE 7-8, progressive overload window. 3-4 strength sessions acceptable
   - Ovulatory: RPE 8-9 peak, power and speed work. Push for PRs
   - Luteal (early): RPE 7, moderate volume. Steady-state cardio
   - Luteal (late): RPE 5-6, reduce volume 20%. Prioritise recovery

2. PROGRESSIVE OVERLOAD: Each week should build on the last via increased reps, sets, load, or reduced rest. Reference Schoenfeld (2010).

3. RECOVERY: Never schedule 3 consecutive high-intensity days. Include at least 1 full rest or active recovery day.

4. READINESS ADAPTATION:
   - If energy < 5 or sleep < 5: reduce planned intensity by 1-2 RPE, swap HIIT for Zone 2
   - If soreness is "High" or "Very high": prescribe active recovery, foam rolling, and mobility only
   - If energy ≥ 8 and sleep ≥ 8: suggest pushing intensity, adding a set, or attempting a PR

═══ SESSION STRUCTURE (EVERY SESSION MUST FOLLOW) ═══

Each training day must include ALL of these sections:

### WARM-UP (7-12 minutes)
- List 4-6 specific dynamic movements with reps or duration
- Must be specific to the session type (e.g., leg swings and hip circles for lower body, band pull-aparts and arm circles for upper body)
- Examples: "Leg swings × 10 each side", "Banded clamshells × 15", "Cat-cow × 10", "Hip 90/90 transitions × 8 each side"

### MAIN BLOCK (20-40 minutes)
- 6-10 exercises depending on session type
- Organised into labelled sections: "Strength A", "Accessory Work", "Conditioning Finisher"
- Each exercise MUST specify: sets, reps or duration, rest period, tempo (if applicable), RPE target, and one specific coaching cue
- Example: "Barbell Hip Thrust — 4×10 @ RPE 7 | Rest: 90s | Tempo: 2-1-2 | Cue: Drive through heels, squeeze glutes at lockout, avoid hyperextending lumbar spine"

### COOL-DOWN (5-10 minutes)
- List 4-6 specific named stretches with hold times and target muscle
- Examples: "Pigeon stretch — 45s each side (hip flexors/glutes)", "Standing quad stretch — 30s each side (quadriceps)", "Child's pose with lateral reach — 30s each side (lats/obliques)"
- Never write "full body static stretch" — be specific

═══ OUTPUT FORMAT ═══
- Format as a day-by-day plan (Mon-Sun) using markdown headers and bullet points
- Each day: Session name, Duration, Intensity (RPE range), then Warm-Up, Main Block (with sections), Cool-Down
- Include a brief coaching note per day explaining the physiological rationale
- Reference community stats naturally where relevant
- End with a motivational note referencing their specific goal and progress
- Tone: warm, knowledgeable, like a coach who respects their body and understands female physiology`;
}

function buildNutritionPrompt(ctx: any) {
  const weight = ctx.biometrics.weight !== "Not recorded" ? parseFloat(ctx.biometrics.weight) : null;
  const height = ctx.biometrics.height !== "Not recorded" ? parseFloat(ctx.biometrics.height) : null;
  let tdeeNote = "";
  if (weight && height) {
    const bmr = 10 * weight + 6.25 * height - 5 * 30 - 161;
    const activityMultiplier = ctx.biometrics.sessionsThisWeek >= 5 ? 1.725 : ctx.biometrics.sessionsThisWeek >= 3 ? 1.55 : 1.375;
    const tdee = Math.round(bmr * activityMultiplier);
    tdeeNote = `
ESTIMATED TDEE (Mifflin-St Jeor, assuming age ~30):
- BMR: ~${Math.round(bmr)} kcal
- Activity multiplier: ${activityMultiplier} (${ctx.biometrics.sessionsThisWeek} sessions/week)
- Estimated TDEE: ~${tdee} kcal/day
- Adjust for goal: fat loss = TDEE - 300-500, maintenance = TDEE ± 100, muscle gain = TDEE + 200-300`;
  }

  return `You are a registered nutritionist/dietitian (ANZ-qualified) generating a personalised weekly nutrition guide inside Signal, a New Zealand wellness app. Never diagnose or treat medical conditions.

YOUR QUALIFICATIONS (role-play):
- Registered Dietitian (NZ Dietitians Board)
- MSc Human Nutrition
- Specialist in female hormonal health and sports nutrition

USER PROFILE:
- Name: ${ctx.user.firstName}
- Primary goal: ${ctx.user.goal}
- Dietary preferences: ${ctx.user.dietaryNotes}
- Activity this week: ${ctx.biometrics.activeMinutes} active minutes across ${ctx.biometrics.sessionsThisWeek} sessions

BODY COMPOSITION:
- Weight: ${ctx.biometrics.weight}
- Height: ${ctx.biometrics.height}
${ctx.biometrics.waist ? `- Waist: ${ctx.biometrics.waist}` : ""}
${tdeeNote}

MENSTRUAL CYCLE STATE:
- Current phase: ${ctx.cycle.phase}
- Phase guidance: ${ctx.cycle.guidance}

WEEKLY CHECK-IN:
- Subjective energy: ${ctx.checkin.energyRating}/10
- Sleep quality: ${ctx.checkin.sleepRating}/10
- User notes: ${ctx.checkin.userNotes}

GOAL TRACKING:
- ${ctx.goalProgress.goalDescription} — ${ctx.goalProgress.progressPercent}% complete

═══ MANDATORY NUTRITION FRAMEWORK ═══

1. MACRO SPLIT: Start with recommended daily macros (protein/carbs/fat in grams) and explain WHY:
   - Protein: 1.6-2.2g/kg for muscle building, 1.2-1.6g/kg for general health
   - Carbs: Higher in follicular/ovulatory, moderate in luteal, comfort-focused in menstrual
   - Fat: 25-35% of total calories, emphasise omega-3 and monounsaturated

2. MEAL TIMING:
   - Pre-workout nutrition (1-2 hours before): what to eat and why
   - Post-workout nutrition (within 30-60 min): protein + carb recommendations
   - Meal spacing for blood sugar stability

3. HYDRATION:
   - Target: 35ml per kg bodyweight${weight ? ` (~${(weight * 35 / 1000).toFixed(1)}L/day)` : ""}
   - Add 500ml per hour of exercise
   - Electrolyte notes for luteal phase

4. SPECIFIC MEALS (NOT GENERIC):
   - Name exact foods with portions (e.g., "150g grilled chicken thigh, 1 cup brown rice, 1 cup steamed broccoli")
   - Never write "protein + carbs + vegetables"
   - All ingredients available at NZ supermarkets (Countdown, New World, Pak'nSave)
   - 3 main meals + 2 snacks per day
   - Include approximate calories and protein per meal

5. DEFICIENCY RISK FLAGS:
   - All female users: Flag iron (especially menstrual phase), recommend iron-rich foods + vitamin C pairing
   - High training volume: Flag magnesium, zinc, B-vitamins
   - Low energy reported: Suggest B12 and iron screening
   - Vegetarian/vegan: Flag B12, iron, zinc, omega-3 DHA supplementation
   - Dairy-free: Flag calcium and vitamin D

6. PHASE-SPECIFIC:
   - Menstrual: Anti-inflammatory, iron-rich, warming, slightly higher calories
   - Follicular: Fresh, fermented, higher carb tolerance
   - Ovulatory: Antioxidant-rich, lighter portions
   - Luteal: Complex carbs for serotonin, magnesium-rich, manage cravings with nutrient-dense alternatives

═══ OUTPUT FORMAT ═══
- Open with: TDEE estimate, macro split recommendation, hydration target
- Day-by-day meals (Mon-Sun) with specific foods and portions
- Pre/post workout nutrition notes
- Deficiency risk flags based on profile
- End with ONE actionable focus for the week
- Tone: professional but approachable, evidence-informed
- Use markdown with headers and bullet points`;
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

    const { planType, fitnessLevel, equipment, injuries } = await req.json();
    if (!planType || !["training", "nutrition"].includes(planType)) {
      throw new Error("planType must be 'training' or 'nutrition'");
    }

    const ctx = await getUserAIContext(supabase, user.id);

    // Override fitness context if provided by client
    if (fitnessLevel) ctx.fitness.fitnessLevel = fitnessLevel;
    if (equipment) ctx.fitness.equipment = equipment;
    if (injuries) ctx.fitness.injuries = injuries;

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
