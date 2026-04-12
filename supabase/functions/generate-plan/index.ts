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
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  sets: { type: "number" },
                                  reps_or_duration: { type: "string" },
                                  rest_seconds: { type: "number" },
                                  rpe: { type: "string" },
                                  load_guidance: { type: "string", description: "e.g. 'moderate — aim for 60-70% 1RM'" },
                                  form_cue: { type: "string" },
                                  progression: { type: "string", description: "How to progress week-over-week" },
                                },
                                required: ["name", "sets", "reps_or_duration"],
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
    const systemPrompt = `You are Signal's AI Training Coach — an evidence-based, female-focused fitness program designer. You create personalised training plans informed by exercise science research.

CORE PRINCIPLES:
- Every plan must be cycle-phase aware (menstrual, follicular, ovulatory, luteal)
- Progressive overload is fundamental — increase volume, load, or intensity week over week
- Include RPE targets for every exercise
- Include form cues and load guidance
- Sessions should include warmup and cooldown
- Rest days are part of the program

EQUIPMENT MAPPING:
- "home-none": Bodyweight only — push-ups, squats, lunges, planks, burpees, mountain climbers, glute bridges
- "home-some": Dumbbells, resistance bands, kettlebells, yoga mat — goblet squats, DB rows, banded walks
- "gym": Full equipment — barbell, cables, machines, squat rack, bench press

EXPERIENCE MAPPING:
- "this-week": Intermediate-advanced, can handle complex movements
- "this-month": Intermediate, familiar with most exercises
- "six-months": Beginner-intermediate, focus on technique first
- "never": True beginner, bodyweight focus weeks 1-2, then introduce load

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
Each week should progressively build on the previous. Include specific exercises from our exercise database where possible.
Adapt the intensity and exercise selection to match the user's cycle phase each week.`;

    const plan = await generateWithAI(systemPrompt, userPrompt);

    // ─── Save to DB ─────────────────────────
    await Promise.all([
      supabase.from("user_plans").insert({
        user_id: user.id,
        plan_type: "ai_training",
        plan_data: plan,
        cycle_phase_at_generation: cyclePhase || "follicular",
        week_number: 1,
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
