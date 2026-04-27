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
    menstrual: "Modest down-regulation only. Keep lifting — drop loads ~10% if needed, RPE cap 7. Skip max-effort PRs. DO NOT skip strength sessions.",
    follicular: "Estrogen rising — strongest neuromuscular window. Heaviest loads of the cycle, push progressive overload, attempt PRs.",
    ovulatory: "Peak power output. Plyometrics, sprint intervals, max-effort lifts all green-lit.",
    luteal: "Slightly higher fatigue + body temp. Keep strength work intact (Sims/Lyon both confirm). Reduce HIIT 10-15% only if symptomatic.",
  };
  return map[phase?.toLowerCase()] || map.follicular;
}

// Goal-driven prescription — overrides cycle when they conflict
function getGoalPrescription(goal: string, weightKg: number, goalWeightKg: number, weeks: number): string {
  const g = (goal || "").toLowerCase();
  const deficitKg = Math.max(0, weightKg - goalWeightKg);
  const kgPerWeek = weeks > 0 ? deficitKg / weeks : 0;
  const aggressive = kgPerWeek >= 1.0;

  if (g.includes("lose") || g.includes("weight") || g.includes("fat")) {
    return `GOAL: AGGRESSIVE FAT LOSS — ${deficitKg.toFixed(1)}kg in ${weeks} weeks (~${kgPerWeek.toFixed(2)}kg/week).
${aggressive ? "⚠️ AGGRESSIVE TARGET — programme MUST match. This is BFT/F45/Shred-style training, not yoga." : ""}
PRESCRIPTION (Lyon + Sims + Schoenfeld + Maffetone):
- 5-6 training days/week MINIMUM
- Every session: 8-12 exercises, 3-4 sets, 45-60 minutes (BFT model)
- Modality rotation across the week: Lower Strength → Upper Strength → Hypertrophy Circuit → Conditioning/HIIT → Full-Body Power → Zone-2 Cardio → Active Recovery
- Compound lifts FIRST every session (squat/deadlift/press/row/hinge variants)
- Supersets and tri-sets for time efficiency and EPOC
- Finishers: 5-10min metcon, sled, sprint intervals, kettlebell complexes
- Protein cue every plan: 1.6-2.2g/kg bodyweight (Lyon's muscle-centric medicine)
- Minimum 10k steps/day non-exercise activity (NEAT)
PHASE OVERRIDES THE GOAL ONLY DURING TRUE MENSTRUAL DAYS 1-2 — and even then, replace with mobility + walking, NOT a rest day.`;
  }
  if (g.includes("muscle") || g.includes("gain") || g.includes("strong")) {
    return `GOAL: HYPERTROPHY / STRENGTH (Schoenfeld + Lyon protocols).
- 4-5 training days/week (upper/lower or push/pull/legs split)
- Every session: 6-9 exercises, 3-4 sets of 6-12 reps, 45-60 minutes
- Compound lift first, then 4-6 accessory movements
- Progressive overload: add load or reps every week
- 10-20 hard sets per muscle group per week`;
  }
  if (g.includes("tone") || g.includes("define") || g.includes("sculpt")) {
    return `GOAL: BODY RECOMPOSITION.
- 4-5 sessions/week mixing strength + conditioning (BFT-style)
- Every session: 7-10 exercises, 3-4 sets, 45 minutes
- Alternate days: lower strength, upper strength, full-body circuit, HIIT, hypertrophy
- Protein priority for muscle preservation`;
  }
  if (g.includes("endurance") || g.includes("cardio")) {
    return `GOAL: CONDITIONING (Maffetone + Joyce).
- 5-6 sessions/week
- 2 strength (6-8 exercises × 3 sets), 2 zone-2 (45-60min), 2 intervals
- Every session: 6+ exercises minimum when strength-focused`;
  }
  return `GOAL: GENERAL FITNESS.
- 4-5 sessions/week
- Every session: 6-8 exercises, 3 sets, 40-50 minutes
- Mix strength, conditioning, mobility across the week`;
}

// Fetch and summarise key PDF names from reference-pdfs/movement bucket
async function getEvidenceContext(supabase: any): Promise<string> {
  const { data: files } = await supabase.storage
    .from("reference-pdfs")
    .list("movement", { limit: 50 });

  if (!files || files.length === 0) return "No reference materials available.";

  // Extract book titles from filenames for the AI prompt context
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

  // Fetch first 3 PDFs as base64 for deep analysis
  const pdfContents: { name: string; base64: string }[] = [];
  const priorityBooks = [
    "Essentials_of_strength_training",
    "High-Performance_Training",
    "Science_and_Development_of_Muscle_Hypertrophy",
    "The_female_body_bible",
    "In_the_flo",
    "Beginners_Guide_to_Weight_Lifting",
    "The_Forever_Strong_Playbook",
    "Overcoming_gravity",
    "Total_Heart_Rate_Training",
  ];

  for (const book of priorityBooks.slice(0, 3)) {
    const match = files.find((f: any) => f.name.includes(book));
    if (match) {
      try {
        const { data: blob } = await supabase.storage
          .from("reference-pdfs")
          .download(`movement/${match.name}`);
        if (blob) {
          const arrayBuf = await blob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuf);
          // Only take first 500KB to stay within token limits
          const truncated = bytes.slice(0, 500_000);
          const base64 = btoa(String.fromCharCode(...truncated));
          pdfContents.push({ name: match.name, base64 });
        }
      } catch (e) {
        console.log(`Skipping PDF ${match.name}: ${e}`);
      }
    }
  }

  return `EVIDENCE BASE (${books.length} reference books in our library):
${books.join("\n")}

${pdfContents.length > 0 ? `\nDeep analysis available from: ${pdfContents.map(p => p.name).join(", ")}` : ""}`;
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
                title: { type: "string", description: "Plan title e.g. 'Stronger Foundation — 8 Week Program'" },
                overview: { type: "string", description: "2-3 sentence overview of the program approach" },
                duration_weeks: { type: "number" },
                days_per_week: { type: "number" },
                equipment_level: { type: "string" },
                phase_awareness: { type: "string", description: "How the plan adapts to menstrual cycle phases" },
                weeks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week_number: { type: "number" },
                      theme: { type: "string", description: "e.g. 'Foundation & Technique'" },
                      phase_note: { type: "string", description: "Cycle phase adaptation note" },
                      days: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            day: { type: "number" },
                            title: { type: "string" },
                            session_type: { type: "string", description: "e.g. 'strength', 'hiit', 'active-recovery', 'rest'" },
                            duration_minutes: { type: "number" },
                            warmup: { type: "string" },
                            exercises: {
                              type: "array",
                              minItems: 6,
                              description: "MINIMUM 6 exercises per training session, target 8-12 for fat-loss / BFT-style sessions. Compound lifts FIRST, then accessories, then finisher. Rest days are the ONLY exception.",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  sets: { type: "number", description: "MINIMUM 3 sets for any working exercise" },
                                  reps_or_duration: { type: "string" },
                                  rest_seconds: { type: "number" },
                                  rpe: { type: "string" },
                                  load_guidance: { type: "string", description: "e.g. 'moderate — aim for 60-70% 1RM'" },
                                  form_cue: { type: "string", description: "Coaching cue from the certified-PT persona, citing book where relevant" },
                                  progression: { type: "string", description: "How to progress week-over-week" },
                                  block: { type: "string", description: "e.g. 'Compound A', 'Accessory B', 'Superset 1', 'Finisher'" },
                                },
                                required: ["name", "sets", "reps_or_duration", "rest_seconds", "rpe"],
                                additionalProperties: false,
                              },
                            },
                            cooldown: { type: "string" },
                            evidence_note: { type: "string", description: "Cite which reference book(s) inform this session design" },
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
      // Atomic credit deduction — 3 credits for extra plan generation
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
    const weightKg = Number(answers?.weight || profile?.weight_kg || 70);
    const goalWeightKg = Number(answers?.goalWeight || profile?.goal_weight_kg || weightKg);
    const weeksPlan = Number(answers?.weeksPlan || 8);
    const goalPrescription = getGoalPrescription(answers?.goal || "", weightKg, goalWeightKg, weeksPlan);

    const systemPrompt = `You are a CERTIFIED PERSONAL TRAINER and strength coach (NSCA-CSCS equivalent) with 15 years of experience programming for women across all life stages. You have studied and internalised the full Signal reference library — including:
• Gabrielle Lyon — *The Forever Strong Playbook* (muscle-centric medicine, protein 1.6-2.2 g/kg, heavy compound lifting)
• Stacy Sims — *Next Level / Roar* (women are not small men; lift heavy through every cycle phase)
• Brad Schoenfeld — *Science and Development of Muscle Hypertrophy* (10-20 hard sets/muscle/week, mechanical tension)
• Phil Maffetone — *Total Heart Rate Training* (zone-2 base + targeted intervals)
• David Joyce — *High-Performance Training for Sports* (periodisation, conditioning)
• Steven Low — *Overcoming Gravity* (progressive calisthenics)
• Kurt Brungardt — *The Complete Book of Butt and Legs*
• Pat Manocchia — *Anatomy of Exercise* | Emma Ross — *The Female Body Bible* | Alissa Vitti — *In the FLO*
• Plus: Hunt's *Beginners Guide to Weight Lifting*, Friel's *Total Heart Rate Training*

You also know the modern boutique-fitness landscape: BFT (Body Fit Training), F45, Barry's, Shred app, Sweat — and you BEAT them on personalisation while matching their intensity.

═══ NON-NEGOTIABLE RULES ═══
1. **GOAL OVERRIDES CYCLE.** The user's goal is the priority. Cycle phase is a *modifier*, not a brake. Never reduce a fat-loss programme to "yoga and walking" because the user is in luteal — research (Sims, Lyon) is clear: keep lifting through every phase.
2. **MINIMUM 6 EXERCISES per training session.** Fat-loss / BFT-style sessions: 8-12 exercises. NEVER 3 exercises.
3. **MINIMUM 3 SETS per working exercise.** Compound lifts: 3-5 sets.
4. **45-minute sessions** are the BFT/F45 standard — match this duration.
5. **Compound movement FIRST** every session (squat / hinge / push / pull / carry).
6. **Modality rotation across the week** — never two identical sessions back-to-back. Rotate: Lower Strength → Upper Strength → Hypertrophy Circuit → HIIT/Conditioning → Full-Body Power → Zone-2 → Active Recovery.
7. **Every exercise needs**: name, sets (≥3), reps/duration, rest_seconds, RPE, load_guidance, form_cue (pull from a coaching book), progression note, block label.
8. **Cite evidence** in each day's evidence_note (which book informs this session).
9. **Progressive overload week-over-week** — explicit load/rep/set increase.
10. Rest days are scheduled, but for aggressive fat-loss goals replace pure rest with 30-min walks or mobility.

EQUIPMENT MAPPING:
- "home-none" → Bodyweight + tempo manipulation (Steven Low calisthenics progressions, plyo, isometrics). Still hit 8+ exercises.
- "home-some" → Dumbbells, bands, kettlebells, mat. Goblet squats, DB RDLs, KB swings, single-arm rows, Turkish get-ups.
- "gym" → Full barbell, rack, cables, machines, sled. Back squat, deadlift, bench, overhead press, pull-ups, hip thrusts.

EXPERIENCE:
- "this-week" → Intermediate-advanced. Complex movements, heavier loads.
- "this-month" → Intermediate. Most exercises familiar.
- "six-months" → Beginner-intermediate. Technique focus weeks 1-2.
- "never" → True beginner. Bodyweight wks 1-2, introduce load wk 3.

${evidenceContext}`;

    const userPrompt = `Build a personalised, evidence-based training plan.

═══ USER PROFILE ═══
• Height: ${answers?.height || profile?.height_cm || 165}cm
• Weight: ${weightKg}kg → Target: ${goalWeightKg}kg
• Age: ${answers?.age || 30}
• Goal: ${answers?.goal || "stronger"}
• Plan length: ${weeksPlan} weeks
• Days/week: ${answers?.daysPerWeek || 5}
• Experience: ${answers?.lastWorkout || "this-month"}
• Equipment: ${answers?.equipment || "home-some"}
• Current cycle phase: ${cyclePhase || "follicular"}

═══ GOAL-DRIVEN PRESCRIPTION (this is the spine of the plan) ═══
${goalPrescription}

═══ CYCLE PHASE MODIFIER (secondary; NEVER overrides goal) ═══
${phaseGuidance}

═══ DELIVERABLE ═══
Return a ${weeksPlan}-week plan with ${answers?.daysPerWeek || 5} training days/week.
EVERY training day MUST contain at minimum 6 exercises, each with at least 3 sets, RPE, rest, load guidance, form cue, progression, and a block label (Compound A / Accessory / Superset / Finisher).
Periodise: Wk 1 Foundation → Wk 2-3 Build → Wk 4-5 Intensify → Wk 6 Deload → Wk 7-8 Peak (adjust if duration differs).
Cite the reference book that informs each day's design.
This must compete with — and beat — the Shred app and BFT for personalisation and depth.`;

    const plan = await generateWithAI(systemPrompt, userPrompt);

    // ─── Save to DB — delete old plans first ─────────────────────────
    // Remove any previous AI training plans for this user
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
        is_active: true,
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
