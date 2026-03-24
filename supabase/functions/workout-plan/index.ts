import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an evidence-based exercise programming specialist with CSEP and NSCA certifications, specialising in female physiology and menstrual cycle periodisation. Generate comprehensive, professional-grade training programs.

GOALS AVAILABLE (user may select multiple):
- Lose weight
- Build muscle
- Tone & define
- Improve flexibility
- Build endurance
- Stress relief
- Fix posture
- More energy

═══ PERIODISATION MODEL (NON-NEGOTIABLE) ═══

Apply a 4-week undulating periodisation block:
- Week 1 (Foundation): Establish movement patterns. RPE 6-7. Base volume (3 sets). Focus on form mastery and motor learning. HIIT work:rest = 30:30.
- Week 2 (Build): Add 1 set to compound lifts, increase reps by 1-2, or add 2.5-5kg. RPE 7-8. Introduce supersets. HIIT work:rest = 40:20.
- Week 3 (Peak): Highest intensity. RPE 8-9. Introduce tempo reps (3s eccentric on compound lifts). Add drop sets or mechanical drop sets to final set. HIIT work:rest = 45:15. Peak volume.
- Week 4 (Deload): Reduce all working sets to 2. Drop load by 40%. Replace HIIT with Zone 2 cardio (brisk walk, light cycle). Nothing above RPE 6. Active recovery focus. Supercompensation window (Kiely, 2012).

═══ WEEKLY STRUCTURE ═══

Every week must include:
- 3-4 resistance/strength sessions (compound-focused)
- 2-3 cardio/conditioning sessions (mix of HIIT and Zone 2)
- 1-2 active recovery/mobility sessions (yoga flow, foam rolling, walking)
- At least 1 full rest day
- Never 3 consecutive high-intensity days

═══ SESSION STRUCTURE (EVERY SESSION MUST FOLLOW) ═══

### WARM-UP (7-12 minutes, 5-7 exercises)
List specific dynamic movements with exact reps/duration. Must be specific to session type:
- Lower body day: leg swings × 10 each, hip circles × 10 each, banded clamshells × 15, bodyweight squats × 10, walking lunges × 8 each, ankle circles × 10 each
- Upper body day: arm circles × 10 each direction, band pull-aparts × 15, cat-cow × 10, thoracic rotations × 8 each, scapular push-ups × 10, wrist circles × 10 each
- Full body: inchworms × 5, world's greatest stretch × 5 each, hip 90/90 transitions × 8 each, jumping jacks × 20, bear crawl × 10m
- NEVER write "5 min warm-up" or "general warm-up"

### MAIN BLOCK (25-45 minutes, 6-10 exercises)
Organised into labelled sections:
- "Strength A" (compound movements, 3-4 exercises)
- "Strength B / Accessory Work" (isolation/assistance, 3-4 exercises)
- "Conditioning Finisher" (optional, 1-2 exercises or circuit)

Each exercise MUST include ALL of:
- Exercise name
- Sets × reps (or duration for time-based)
- Rest period (60-90s hypertrophy, 90-120s strength, 20-30s circuits)
- Tempo notation where applicable (e.g., "3-1-1" = 3s eccentric, 1s pause, 1s concentric)
- RPE target for that specific exercise
- One specific biomechanical coaching cue (not generic)

Example format:
"Barbell Romanian Deadlift — 3×12 @ RPE 7 | Rest: 90s | Tempo: 3-1-1 | Cue: Hinge at hips with soft knees, bar tracks along thighs, feel the stretch through hamstrings before driving hips forward"

### COOL-DOWN (5-10 minutes, 4-6 stretches)
List specific named stretches with:
- Hold time (30-60s)
- Target muscle group
- Bilateral notation (per side where applicable)

Examples:
- "Pigeon stretch — 45s each side (hip flexors, glutes)"
- "Doorway pec stretch — 30s each side (pectorals, anterior deltoid)"
- "Standing figure-4 — 30s each side (piriformis, external rotators)"
- "Supine hamstring stretch with strap — 45s each side (hamstrings)"
- NEVER write "cool down stretch" or "full body static stretch"

═══ GOAL PRIORITY WEIGHTING ═══

When multiple goals are selected, blend programming:
- Lose weight + Build muscle → 3 full-body strength + 2 HIIT/metabolic conditioning + 1 Zone 2 + 1 active recovery
- Lose weight + Tone & define → 3 circuit-style strength + 2 HIIT + 1 steady-state + 1 mobility
- Build muscle + More energy → 4 hypertrophy (Push/Pull/Legs/Full Body) + 2 low-intensity cardio + 1 mobility
- Build endurance + Lose weight → 3 progressive run/cycle + 2 strength + 1 HIIT + 1 rest
- Fix posture + any goal → Add 15-min corrective block to every session: wall angels × 10, face pulls × 15, dead bugs × 10 each, hip flexor stretch × 30s each, thoracic extension over roller × 10, chin tucks × 15
- Stress relief + any goal → Replace 1 HIIT with yoga flow; all sessions end with 5-min diaphragmatic breathing
- Improve flexibility + any goal → All warm-ups use dynamic mobility; add 15-min post-session PNF stretching
- More energy + any goal → Prioritise morning sessions, Zone 2 cardio, no sessions over 50 min

═══ CYCLE PHASE INTENSITY MODIFIERS ═══

- Menstrual (days 1-5): Cap at RPE 6. Max 1 strength session. Prioritise yoga, walking, gentle mobility. Reduce volume 30%.
- Follicular (days 6-13): Full intensity. RPE 7-8. Progressive overload window. 3-4 strength sessions.
- Ovulatory (days 14-16): Peak performance. RPE 8-9. Power and speed work. Attempt PRs.
- Luteal early (days 17-22): RPE 7. Moderate volume. Steady-state preferred over HIIT.
- Luteal late (days 23-28): RPE 5-6. Reduce volume 20%. Swap HIIT for walking. Prioritise recovery.

═══ EVIDENCE REFERENCES (weave naturally into coaching notes) ═══
- Progressive overload: Schoenfeld et al. (2017) meta-analysis
- Combination training for fat loss: Willis et al. (2012)
- EPOC and HIIT: Børsheim & Bahr (2003)
- Glute activation: Contreras et al. (2015) EMG data
- Deload and supercompensation: Kiely (2012)
- Zone 2 and mitochondrial biogenesis: Holloszy (1967), Seiler (2010)
- Female-specific periodisation: Wikström-Frisén et al. (2017)

═══ AI PLAN SUMMARY ═══
- Mention selected goals by name
- Explain the 4-week arc (what changes week to week)
- Reference one specific evidence-based principle
- Under 90 words
- End with: "Your first session is ready in the Today tab."`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goals, phase, cycleDay, fitnessLevel, equipment, injuries, sessionTime } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const goalsList = (goals as string[]).join(", ");

    const userPrompt = `Create a 4-week workout plan for a woman with these goals: ${goalsList}.
She is currently in her ${phase} phase (cycle day ${cycleDay}).
${fitnessLevel ? `Fitness level: ${fitnessLevel}` : "Fitness level: intermediate"}
${equipment ? `Available equipment: ${equipment}` : "Available equipment: dumbbells, resistance bands, bodyweight"}
${injuries ? `Injuries/limitations: ${injuries}` : "No known injuries"}
${sessionTime ? `Preferred session duration: ${sessionTime} minutes` : "Preferred session duration: 45-60 minutes"}

Generate all 28 sessions (7 days × 4 weeks) following ALL programming principles, progressive overload rules, and session structure requirements.

CRITICAL REQUIREMENTS:
- Every session warm_up must list 5-7 specific dynamic exercises with reps/duration
- Every main_block must have 6-10 exercises across labelled sections (Strength A, Accessory Work, Conditioning Finisher)
- Every exercise must include sets, reps_or_duration, rest period, tempo, RPE, and a specific biomechanical coaching cue
- Every cool_down must list 4-6 specific named stretches with hold times and target muscles
- Apply cycle phase intensity modifiers to the current phase
- Apply progressive overload across weeks (Foundation → Build → Peak → Deload)

Return the complete plan using the create_workout_plan function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_workout_plan",
            description: "Create a structured 4-week evidence-based workout plan with comprehensive session details including specific warm-ups, multi-section main blocks, and targeted cool-downs",
            parameters: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "3-5 sentence plan summary mentioning goals, 4-week arc, and evidence-based principle. End with: Your first session is ready in the Today tab."
                },
                weeks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "number" },
                      theme: { type: "string", enum: ["Foundation", "Build", "Peak", "Deload"] },
                      days: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            day: { type: "number", description: "1-7 (Mon-Sun)" },
                            name: { type: "string", description: "e.g. Lower Body Strength (Foundation)" },
                            category: { type: "string", enum: ["strength", "cardio", "hiit", "yoga", "mobility", "circuit", "active-recovery", "rest"] },
                            durationMin: { type: "number" },
                            intensity: { type: "string", enum: ["low", "moderate", "high", "very-high"] },
                            rpe_range: { type: "string", description: "e.g. RPE 6-7, RPE 8-9" },
                            warm_up: {
                              type: "array",
                              description: "5-7 specific dynamic movements with reps/duration, specific to session type",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string", description: "Specific exercise name e.g. Leg swings, Banded clamshells" },
                                  duration: { type: "string", description: "e.g. 10 each side, 15 reps, 30 sec, 10m" }
                                },
                                required: ["name", "duration"]
                              }
                            },
                            main_block: {
                              type: "array",
                              description: "2-3 sections (Strength A, Accessory Work, Conditioning Finisher) with 6-10 total exercises",
                              items: {
                                type: "object",
                                properties: {
                                  section_label: { type: "string", description: "e.g. Strength A — Compound Lifts, Accessory Work — Posterior Chain, Conditioning Finisher" },
                                  exercises: {
                                    type: "array",
                                    items: {
                                      type: "object",
                                      properties: {
                                        name: { type: "string" },
                                        sets: { type: "number" },
                                        reps_or_duration: { type: "string", description: "e.g. 12, 10 per side, 40 sec, 30 sec hold" },
                                        rest: { type: "string", description: "e.g. 60 sec, 90 sec, 20 sec" },
                                        tempo: { type: "string", description: "e.g. 3-1-1, 2-0-1, controlled, explosive" },
                                        rpe: { type: "string", description: "e.g. RPE 7, RPE 8-9" },
                                        form_cue: { type: "string", description: "Specific biomechanical coaching cue for this exercise" }
                                      },
                                      required: ["name", "sets", "reps_or_duration", "rest", "form_cue"]
                                    }
                                  }
                                },
                                required: ["section_label", "exercises"]
                              }
                            },
                            cool_down: {
                              type: "array",
                              description: "4-6 specific named stretches with hold times and target muscle groups",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string", description: "Specific stretch name e.g. Pigeon stretch, Doorway pec stretch" },
                                  duration: { type: "string", description: "e.g. 45s each side, 30s hold, 60s" },
                                  target: { type: "string", description: "Target muscle group e.g. hip flexors/glutes, hamstrings" }
                                },
                                required: ["name", "duration", "target"]
                              }
                            },
                            coaching_note: { type: "string", description: "Evidence-based coaching insight for this session, referencing relevant research" }
                          },
                          required: ["day", "name", "category", "durationMin", "intensity", "warm_up", "main_block", "cool_down", "coaching_note"]
                        }
                      }
                    },
                    required: ["week", "theme", "days"]
                  }
                }
              },
              required: ["summary", "weeks"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_workout_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const plan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("workout-plan error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
