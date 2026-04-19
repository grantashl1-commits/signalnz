import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getCyclePhaseGuidance(phase: string): string {
  const map: Record<string, string> = {
    menstrual: "Prioritise gentle movement, yoga, stretching, walks. Lower intensity (RPE 3-5). Focus on iron-rich recovery.",
    follicular: "Energy rising — progressive overload, heavier lifts welcome. Fresh fermented foods, complex carbs.",
    ovulatory: "Peak performance window — push for PRs, HIIT, high-intensity circuits. Antioxidant-rich lighter meals.",
    luteal: "Moderate steady-state. Complex carbs for serotonin, magnesium-rich foods. Reduce volume 10-20%.",
  };
  return map[phase?.toLowerCase()] || map.follicular;
}

// ── Exercise matching helpers ─────────────────────────────────────
type ExerciseRow = {
  id: string;
  name: string;
  slug: string | null;
  illustration_url: string | null;
  gif_url: string | null;
  primary_muscles: string[] | null;
  body_part: string | null;
};

function normaliseName(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): Set<string> {
  const stop = new Set(["the","a","an","with","and","of","to","on","in","for","or","x","kg","lbs","reps","set","sets"]);
  return new Set(normaliseName(s).split(" ").filter(t => t.length > 1 && !stop.has(t)));
}

function jaccardScore(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return inter / union;
}

function findBestExerciseMatch(
  name: string,
  library: ExerciseRow[],
): ExerciseRow | null {
  const target = tokenize(name);
  if (target.size === 0) return null;

  let best: ExerciseRow | null = null;
  let bestScore = 0;

  for (const ex of library) {
    const score = jaccardScore(target, tokenize(ex.name));
    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  }

  return bestScore >= 0.4 ? best : null;
}

// ── Run interval generation ─────────────────────────────────────
function isRunSession(sessionType: string | undefined, title: string | undefined): boolean {
  const s = `${sessionType || ""} ${title || ""}`.toLowerCase();
  return /\b(run|jog|sprint|interval|c25k|hiit|cardio)\b/.test(s);
}

function generateRunIntervals(durationMinutes: number, weekNumber: number): any[] {
  // Simple progressive C25K-style: warmup walk + run/walk repeats + cooldown
  const totalSec = (durationMinutes || 30) * 60;
  const warmup = 300; // 5 min walk
  const cooldown = 300; // 5 min walk
  const workSec = Math.max(600, totalSec - warmup - cooldown);

  // Progress run duration with week number
  const runDur = Math.min(60 + weekNumber * 30, 240); // 60s → 240s
  const walkDur = Math.max(60, 120 - weekNumber * 10); // 120s → 60s
  const cycleSec = runDur + walkDur;
  const repeats = Math.max(4, Math.floor(workSec / cycleSec));

  return [
    { kind: "warmup", duration_sec: warmup, repeat_count: 1, label: "Warm-up walk", intensity_cue: "Brisk walking pace, conversational." },
    { kind: "run", duration_sec: runDur, repeat_count: repeats, label: `Run ${runDur}s`, intensity_cue: "RPE 6-7, can speak short phrases." },
    { kind: "walk", duration_sec: walkDur, repeat_count: repeats, label: `Walk ${walkDur}s`, intensity_cue: "Recovery walk, breathe deeply." },
    { kind: "cooldown", duration_sec: cooldown, repeat_count: 1, label: "Cool-down walk", intensity_cue: "Slow down, lower heart rate." },
  ];
}

// ── Enrichment: attach GIFs and library matches ─────────────────────────────────────
async function enrichPlanWithExerciseData(plan: any, supabase: any): Promise<any> {
  // Fetch all exercises once
  const { data: library, error } = await supabase
    .from("exercises")
    .select("id, name, slug, illustration_url, gif_url, primary_muscles, body_part");

  if (error || !library) {
    console.warn("Could not fetch exercise library:", error);
    return plan;
  }

  for (const week of plan.weeks || []) {
    for (const day of week.days || []) {
      // Add intervals[] for run sessions
      if (isRunSession(day.session_type, day.title)) {
        day.intervals = generateRunIntervals(day.duration_minutes || 30, week.week_number || 1);
      }

      // Enrich each exercise
      for (const ex of day.exercises || []) {
        const match = findBestExerciseMatch(ex.name, library);
        if (match) {
          ex.exercise_id = match.id;
          ex.slug = match.slug;
          ex.illustration_url = match.illustration_url;
          ex.gif_url = match.gif_url;
          ex.primary_muscles = match.primary_muscles;
          ex.body_part = match.body_part;
        }
      }
    }
  }

  return plan;
}

// Fetch and summarise key PDF names from reference-pdfs/movement bucket
async function getEvidenceContext(supabase: any): Promise<string> {
  const { data: files } = await supabase.storage
    .from("reference-pdfs")
    .list("movement", { limit: 50 });

  if (!files || files.length === 0) return "No reference materials available.";

  const books = files
    .filter((f: any) => f.name.endsWith(".pdf"))
    .map((f: any) => {
      const clean = f.name
        .replace(/_OceanofPDF\.com_/g, "")
        .replace(/\.pdf$/, "")
        .replace(/_/g, " ")
        .replace(/ - /g, " by ");
      return clean;
    });

  return `EVIDENCE BASE (${books.length} reference books in our library):
${books.slice(0, 25).join("\n")}`;
}

async function generateWithAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "training_plan",
            description: "Return a structured multi-week training plan",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                overview: { type: "string" },
                duration_weeks: { type: "number" },
                days_per_week: { type: "number" },
                equipment_level: { type: "string" },
                phase_awareness: { type: "string" },
                weeks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week_number: { type: "number" },
                      theme: { type: "string" },
                      phase_note: { type: "string" },
                      days: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            day: { type: "number" },
                            title: { type: "string" },
                            session_type: { type: "string", description: "strength | hiit | run | active-recovery | rest | mobility" },
                            duration_minutes: { type: "number" },
                            warmup: { type: "string" },
                            exercises: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  sets: { type: "number" },
                                  reps_or_duration: { type: "string" },
                                  rest_seconds: { type: "number" },
                                  rpe: { type: "string", description: "e.g. 'RPE 6-7'" },
                                  tempo: { type: "string", description: "e.g. '3-1-1' (eccentric-pause-concentric)" },
                                  weight_kg_min: { type: "number", description: "Lower bound of suggested kg load (omit for bodyweight)" },
                                  weight_kg_max: { type: "number", description: "Upper bound of suggested kg load (omit for bodyweight)" },
                                  load_guidance: { type: "string" },
                                  form_cue: { type: "string" },
                                  tip: { type: "string", description: "A short coaching tip or technique cue" },
                                  progression: { type: "string" },
                                },
                                required: ["name", "sets", "reps_or_duration", "rpe", "tip"],
                                additionalProperties: false,
                              },
                            },
                            cooldown: { type: "string" },
                          },
                          required: ["day", "title", "exercises"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["week_number", "theme", "days"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "overview", "duration_weeks", "days_per_week", "weeks"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "training_plan" } },
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    if (response.status === 429) throw new Error("Rate limited — please try again in a moment");
    if (response.status === 402) throw new Error("AI credits exhausted — please top up in Settings");
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured plan");

  return JSON.parse(toolCall.function.arguments);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { answers, cyclePhase } = body;

    // ─── Monthly limit check ─────────────────────────
    const monthKey = getMonthKey();
    const { count: genCount } = await supabase
      .from("plan_generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("month_key", monthKey)
      .eq("plan_type", "ai_training");

    const isFirstFree = (genCount || 0) === 0;

    if (!isFirstFree) {
      const { error: creditError } = await supabase.rpc("deduct_ai_credits", {
        p_user_identifier: user.id,
        p_cost: 3,
        p_function_name: "generate-plan",
      });
      if (creditError) {
        if (creditError.message?.includes("insufficient_credits")) {
          return new Response(
            JSON.stringify({
              error: "insufficient_credits",
              message: "You've used your free plan this month. Extra plans cost 3 credits.",
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        console.error("Credit deduction error:", creditError);
      }
    }

    // ─── Gather context ─────────────────────────
    const [profileRes, evidenceContext] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      getEvidenceContext(supabase),
    ]);

    const profile = profileRes.data;
    const phaseGuidance = getCyclePhaseGuidance(cyclePhase || "follicular");

    // ─── Build AI prompt ─────────────────────────
    const systemPrompt = `You are an evidence-based, female-focused training coach. You design personalised programmes informed by exercise science research.

CORE PRINCIPLES:
- Every plan must be cycle-phase aware (menstrual, follicular, ovulatory, luteal).
- Progressive overload is fundamental — increase volume, load, or intensity week over week.
- Every exercise MUST have: name, sets, reps_or_duration, rpe, and a short tip (training cue).
- For loaded exercises (gym/home-some), include weight_kg_min and weight_kg_max as numeric kg ranges.
- For bodyweight exercises (home-none), omit weight fields and use form_cue / tip for progression.
- Sessions should include warmup and cooldown.
- Rest days are part of the programme.
- Do NOT use the word "Signal" in any title, exercise name, programme name, theme, or coaching note.
- Do NOT use emoji anywhere in the output.

EXERCISE NAMING (CRITICAL — for library matching):
- Use canonical, library-style names so they can be matched to our exercise database with anatomy GIFs.
- Examples: "Barbell Back Squat", "Romanian Deadlift", "Goblet Squat", "Dumbbell Bench Press", "Bent-Over Row", "Glute Bridge", "Bird Dog", "Plank", "Walking Lunge", "Hip Thrust", "Lat Pulldown", "Cable Row", "Push-Up", "Pull-Up", "Overhead Press".
- Avoid creative names ("Power Pulse Squat") — use the standard term.

EQUIPMENT MAPPING:
- "home-none": Bodyweight only.
- "home-some": Dumbbells, bands, kettlebells, mat.
- "gym": Full equipment incl. barbell, cables, machines.

KG LOAD FORMULA (use bodyweight + goal + experience):
- Lower-body compound (squat/deadlift/hip thrust): beginner ~0.4-0.6× BW, intermediate ~0.6-0.8× BW, advanced ~1.0-1.2× BW.
- Upper-body compound (bench/OHP/row): intermediate ~0.4-0.5× BW.
- Single-arm/leg accessories: ~25-35% of bilateral lift weight per side.
- Isolation: ~10-25% of bodyweight.

UPPER/LOWER ALTERNATION (HARD RULE):
- Each non-rest training day must be tagged in the title (e.g. "Lower Body — Glute Focus", "Upper Body Push", "Posterior Chain & Core").
- Two consecutive training days NEVER target the same primary movement pattern.

RUN / CARDIO SESSIONS:
- If a day is a run/cardio session, set session_type to "run" or "hiit" and include warmup + cooldown notes. Intervals will be auto-generated by the system based on duration.

${evidenceContext}`;

    const userPrompt = `Create a personalised training plan with these parameters:

USER PROFILE:
- Height: ${answers?.height || profile?.height_cm || 165}cm
- Weight: ${answers?.weight || profile?.weight_kg || 70}kg
- Age: ${answers?.age || 30}
- Goal: ${answers?.goal || "stronger"} ${answers?.goal === "lose-weight" ? `(target: ${answers?.goalWeight}kg over ${answers?.weeksPlan || 8} weeks)` : ""}
- Days per week: ${answers?.daysPerWeek || 4}
- Last workout: ${answers?.lastWorkout || "this-month"}
- Equipment access: ${answers?.equipment || "home-some"}
- Current cycle phase: ${cyclePhase || "follicular"}

CYCLE PHASE GUIDANCE: ${phaseGuidance}

Generate a ${answers?.weeksPlan || 8}-week plan with ${answers?.daysPerWeek || 4} training days per week.

CRITICAL EXERCISE COUNT RULES:
- Every non-rest training session MUST include a MINIMUM of 6 exercises (excluding warm-up/cool-down).
- 4-5 days/week → aim for 7-9 exercises.
- "Lose weight" + gym → 8-10 exercises.
- "Get Stronger" → 8+ exercises with 90-180s rest.

CRITICAL FIELDS PER EXERCISE:
- Always provide: name (canonical library term), sets, reps_or_duration, rpe (e.g. "RPE 6-7"), tip (one-sentence cue).
- For loaded movements: weight_kg_min, weight_kg_max as numbers.
- Optional: tempo (e.g. "3-1-1"), form_cue, progression.

Each week progressively builds on the previous. Adapt intensity and selection to the cycle phase each week.`;

    let plan = await generateWithAI(systemPrompt, userPrompt);

    // ─── Enrich plan with exercise library data (GIFs, slugs, intervals) ─────────────────────────
    plan = await enrichPlanWithExerciseData(plan, supabase);

    // ─── Save to DB — delete old plans first ─────────────────────────
    await supabase
      .from("user_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("plan_type", "ai_training");

    await Promise.all([
      supabase.from("user_plans").insert({
        user_id: user.id,
        plan_type: "ai_training",
        plan_data: plan,
        cycle_phase_at_generation: cyclePhase || "follicular",
        week_number: 1,
        current_session_index: 0,
      }),
      supabase.from("plan_generations").insert({
        user_id: user.id,
        plan_type: "ai_training",
        month_key: monthKey,
      }),
    ]);

    return new Response(
      JSON.stringify({
        plan,
        is_first_free: isFirstFree,
        credits_used: isFirstFree ? 0 : 3,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("generate-plan error:", e);
    const status = e.message?.includes("insufficient_credits") ? 402
      : e.message?.includes("Rate limited") ? 429
      : 500;
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error" }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
