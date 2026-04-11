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
  if (cycleDay <= 5) return { phase: "Menstrual", guidance: "Gentle movement: yoga, stretching, walks. Iron-rich foods. Prioritise warmth and rest." };
  if (cycleDay <= 13) return { phase: "Follicular", guidance: "Energy rising — strength training, progressive overload. Fresh, fermented foods, complex carbs." };
  if (cycleDay <= 16) return { phase: "Ovulatory", guidance: "Peak performance — push for PRs, high-intensity. Antioxidant-rich, lighter meals." };
  return { phase: "Luteal", guidance: "Moderate steady-state. Complex carbs for serotonin, magnesium-rich foods, manage cravings." };
}

// ═══ TRAINING TEMPLATE (deterministic, phase-aware) ═══
function buildTrainingPlan(ctx: any): string {
  const { phase, guidance } = ctx.cycle;
  const lines: string[] = [];

  lines.push(`# Weekly Training Plan — ${phase} Phase`);
  lines.push("");
  lines.push(`> ${guidance}`);
  lines.push("");

  // Adjust plan based on check-in data
  let intensityNote = "";
  if (ctx.checkin.energyRating !== "Not submitted") {
    const energy = parseInt(ctx.checkin.energyRating);
    if (energy < 5) intensityNote = "⚡ Energy is low — reduce intensity by 1-2 RPE, swap HIIT for Zone 2 walks.";
    else if (energy >= 8) intensityNote = "🔥 Energy is high — push intensity, add a set, or attempt a PR.";
  }
  if (ctx.checkin.sorenessLevel === "High" || ctx.checkin.sorenessLevel === "Very high") {
    intensityNote = "🧊 Soreness is elevated — active recovery, foam rolling, and mobility only today.";
  }
  if (intensityNote) {
    lines.push(`**Readiness adjustment:** ${intensityNote}`);
    lines.push("");
  }

  const isLow = phase === "Menstrual" || (ctx.checkin.energyRating !== "Not submitted" && parseInt(ctx.checkin.energyRating) < 5);

  const schedule = isLow
    ? [
        { day: "Monday", session: "Gentle Yoga Flow", duration: "30 min", rpe: "3-4" },
        { day: "Tuesday", session: "Light Walk + Mobility", duration: "30 min", rpe: "3-4" },
        { day: "Wednesday", session: "Rest", duration: "-", rpe: "-" },
        { day: "Thursday", session: "Light Full Body Strength", duration: "30 min", rpe: "5-6" },
        { day: "Friday", session: "Gentle Walk", duration: "25 min", rpe: "3" },
        { day: "Saturday", session: "Restorative Stretch", duration: "20 min", rpe: "2-3" },
        { day: "Sunday", session: "Rest", duration: "-", rpe: "-" },
      ]
    : [
        { day: "Monday", session: "Lower Body Strength", duration: "45 min", rpe: "7-8" },
        { day: "Tuesday", session: "HIIT Conditioning", duration: "30 min", rpe: "7-8" },
        { day: "Wednesday", session: "Upper Body Strength", duration: "45 min", rpe: "7-8" },
        { day: "Thursday", session: "Active Recovery & Mobility", duration: "30 min", rpe: "3-4" },
        { day: "Friday", session: "Full Body Circuit", duration: "40 min", rpe: "7" },
        { day: "Saturday", session: "Zone 2 Cardio + Core", duration: "35 min", rpe: "5-6" },
        { day: "Sunday", session: "Rest", duration: "-", rpe: "-" },
      ];

  for (const s of schedule) {
    lines.push(`### ${s.day}: ${s.session}`);
    if (s.duration !== "-") {
      lines.push(`- Duration: ${s.duration} | RPE: ${s.rpe}`);
    }
    lines.push("");
  }

  if (ctx.goalProgress.goalDescription !== "No goal set") {
    lines.push(`**Goal focus:** ${ctx.goalProgress.goalDescription} — ${ctx.goalProgress.progressPercent}% progress. ${ctx.goalProgress.weeksToGoal !== "No target date" ? `${ctx.goalProgress.weeksToGoal} weeks remaining.` : ""}`);
  }

  return lines.join("\n");
}

// ═══ NUTRITION TEMPLATE (deterministic, phase-aware) ═══
function buildNutritionPlan(ctx: any): string {
  const { phase, guidance } = ctx.cycle;
  const lines: string[] = [];

  lines.push(`# Weekly Nutrition Guide — ${phase} Phase`);
  lines.push("");
  lines.push(`> ${guidance}`);
  lines.push("");

  // TDEE estimate
  const weight = ctx.biometrics.weight !== "Not recorded" ? parseFloat(ctx.biometrics.weight) : null;
  const height = ctx.biometrics.height !== "Not recorded" ? parseFloat(ctx.biometrics.height) : null;
  if (weight && height) {
    const bmr = 10 * weight + 6.25 * height - 5 * 30 - 161;
    const mult = ctx.biometrics.sessionsThisWeek >= 5 ? 1.725 : ctx.biometrics.sessionsThisWeek >= 3 ? 1.55 : 1.375;
    const tdee = Math.round(bmr * mult);
    lines.push(`**Estimated TDEE:** ~${tdee} kcal/day`);
    lines.push(`**Protein target:** ${Math.round(weight * 1.6)}-${Math.round(weight * 2.0)}g/day`);
    lines.push(`**Hydration:** ${(weight * 35 / 1000).toFixed(1)}L/day + 500ml per hour exercise`);
    lines.push("");
  }

  // Phase-specific meal suggestions from recipe bank
  const phaseRecipes: Record<string, { breakfast: string; lunch: string; dinner: string; snack: string }> = {
    Menstrual: { breakfast: "Signal Sunrise Bowl or Signal Omega-3 Breakfast Bowl", lunch: "Signal Iron Restore Bowl", dinner: "Signal Golden Immunity Soup or Signal Anti-Inflammatory Curry", snack: "Signal Date Cacao Bliss Balls" },
    Follicular: { breakfast: "Signal Garden Frittata or Signal Hormone Balance Smoothie", lunch: "Signal Spring Grain Bowl or Signal Citrus Tempeh Salad", dinner: "Signal Herbed Chickpea Flatbread", snack: "Signal Seed Cycling Granola" },
    Ovulatory: { breakfast: "Signal Hormone Balance Smoothie", lunch: "Signal Rainbow Nourish Plate or Signal Green Goddess Wrap", dinner: "Signal Protein Recovery Bowl", snack: "Signal Carrot Cake Bliss Balls" },
    Luteal: { breakfast: "Signal Berry Bircher or Signal Savoury Egg Bites", lunch: "Signal Magnesium Power Bowl", dinner: "Signal Comfort Dhal or Signal PMS Ease Stew", snack: "Signal Adaptogen Hot Cacao" },
  };
  const recs = phaseRecipes[phase] || phaseRecipes.Follicular;

  lines.push("## This Week's Meal Focus");
  lines.push(`- **Breakfast:** ${recs.breakfast}`);
  lines.push(`- **Lunch:** ${recs.lunch}`);
  lines.push(`- **Dinner:** ${recs.dinner}`);
  lines.push(`- **Snack:** ${recs.snack}`);
  lines.push("");

  // Deficiency flags
  lines.push("## Nutrient Watch");
  if (phase === "Menstrual") {
    lines.push("- ⚠️ **Iron** — pair iron-rich foods with vitamin C. Avoid tea/coffee with meals.");
    lines.push("- **Magnesium** — dark chocolate, pumpkin seeds, almonds for cramp relief.");
    lines.push("- **Omega-3** — salmon, chia seeds, walnuts for prostaglandin balance.");
  } else if (phase === "Luteal") {
    lines.push("- **Magnesium & B6** — banana, avocado, lentils to ease PMS.");
    lines.push("- **Calcium** — target 1000mg/day. Yoghurt, fortified plant milk, tahini.");
    lines.push("- **Complex carbs** — sweet potato, oats for serotonin support. Cravings are normal.");
  } else if (phase === "Follicular") {
    lines.push("- **Zinc** — pumpkin seeds, chickpeas for rising FSH support.");
    lines.push("- **Fermented foods** — kimchi, miso, yoghurt for oestrogen metabolism.");
  } else {
    lines.push("- **Antioxidants** — berries, leafy greens for ovulation support.");
    lines.push("- **Fibre** — 30g+ daily for oestrogen clearance.");
  }

  return lines.join("\n");
}

async function getUserContext(supabase: any, userId: string) {
  const weekStart = getWeekStart();

  const [profileRes, measureRes, checkinRes, goalsRes] = await Promise.all([
    supabase.from("profiles").select("display_name, suburb, profession, weight_kg, height_cm").eq("user_id", userId).maybeSingle(),
    supabase.from("body_measurements").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("weekly_checkins").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("user_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
  ]);

  const profile = profileRes.data;
  const measurements = measureRes.data;
  const checkin = checkinRes.data;
  const activeGoal = goalsRes.data?.[0] || null;

  const cycleDay = ((Math.floor(Date.now() / (24 * 60 * 60 * 1000))) % 28) + 1;

  return {
    user: { firstName: profile?.display_name?.split(" ")[0] || "Friend" },
    biometrics: {
      weight: measurements?.weight || profile?.weight_kg || "Not recorded",
      height: measurements?.height || profile?.height_cm || "Not recorded",
      bodyFat: measurements?.body_fat || "Not recorded",
      sessionsThisWeek: 0,
      activeMinutes: 0,
    },
    checkin: {
      energyRating: checkin?.energy || "Not submitted",
      sleepRating: checkin?.sleep_quality || "Not submitted",
      sorenessLevel: checkin?.soreness || "Not submitted",
      userNotes: checkin?.notes || "None",
    },
    goalProgress: {
      goalDescription: activeGoal?.goal_description || "No goal set",
      progressPercent: 0,
      weeksToGoal: "No target date",
    },
    cycle: getCyclePhase(cycleDay),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const ctx = await getUserContext(supabase, user.id);
    const planContent = planType === "training" ? buildTrainingPlan(ctx) : buildNutritionPlan(ctx);

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
