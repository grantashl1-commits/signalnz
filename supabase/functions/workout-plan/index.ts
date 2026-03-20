import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an evidence-based exercise programming specialist. The user has selected one or more fitness goals. Your job is to generate:
1. A personalised AI Plan summary (3–5 sentences)
2. A full 4-week, 7-day-per-week exercise plan

GOALS AVAILABLE (user may select multiple):
- Lose weight
- Build muscle
- Tone & define
- Improve flexibility
- Build endurance
- Stress relief
- Fix posture
- More energy

PROGRAMMING PRINCIPLES (non-negotiable):
- Apply periodisation: Week 1 = Foundation, Week 2 = Build, Week 3 = Peak, Week 4 = Deload/consolidate
- Use progressive overload: increase reps, sets, or intensity each week
- Every week must include: 3–4 resistance sessions, 2–3 cardio/conditioning sessions, 1–2 active recovery/mobility sessions
- Sessions should specify: warm-up exercises, main block (with sets × reps/duration, rest periods), cool-down stretches
- Include form cues for every exercise
- When multiple goals are selected, blend programming using the priority weighting below
- Never recommend more than 2 consecutive hard training days
- Always include a deload or light week in Week 4

GOAL PRIORITY WEIGHTING RULES:
- Lose weight + Build muscle → 3 full-body strength sessions + 2 HIIT/metabolic + 1 Zone 2 cardio + 1 active recovery
- Lose weight + Tone & define → 3 circuit strength sessions + 2 HIIT + 1 steady-state cardio + 1 mobility
- Build muscle + More energy → 4 hypertrophy sessions (Push/Pull/Legs/Full Body) + 2 low-intensity cardio + 1 mobility
- Build endurance + Lose weight → 3 run/cycle progressions + 2 strength + 1 HIIT + 1 rest
- Fix posture + any goal → Add 15-min corrective block to every session (wall angels, face pulls, dead bugs, hip flexor stretch, thoracic rotation, chin tucks)
- Stress relief + any goal → Replace 1 HIIT session with yoga flow or walk; all sessions end with 10-min breathwork cool-down
- Improve flexibility + any goal → All warm-ups are dynamic mobility (not static); add 15-min post-session PNF stretching
- More energy + any goal → Prioritise morning sessions, emphasise Zone 2 cardio, no sessions over 60 min

PROGRESSIVE OVERLOAD RULES BY WEEK:
- Week 1 (Foundation): Base sets/reps. RPE 6-7. Establish movement patterns.
- Week 2 (Build): Add 1 set to compound lifts, increase reps by 1-2, or add 2.5-5kg. HIIT work:rest improves to 45:15.
- Week 3 (Peak): Highest intensity. RPE 8-9. Introduce tempo reps (3 sec eccentric). HIIT 50:10. Add load again.
- Week 4 (Deload): Reduce all sets to 2-3. Drop reps by 2-3. Replace HIIT with brisk walk. Nothing above RPE 6.

SESSION STRUCTURE RULES:
- Every session MUST have: warm_up exercises, at least one main_block section, and cool_down stretches
- Warm-ups: 7-10 min of dynamic mobility specific to the session type
- Cool-downs: 5-10 min of stretching targeting worked muscles
- Rest periods: 60-90 sec for hypertrophy, 90-120 sec for strength, 20-30 sec for circuits
- Every exercise needs a specific form cue (not generic)

EVIDENCE REFERENCES TO WEAVE INTO COACHING NOTES:
- Progressive overload: Schoenfeld (2010)
- Combination training for fat loss: Willis et al. (2012)
- EPOC and HIIT: Børsheim & Bahr (2003)
- Hip Thrust EMG: Contreras et al. (2015)
- Deload and supercompensation: Kiely (2012)
- Zone 2 and mitochondria: Holloszy (1967)

AI PLAN SUMMARY FORMAT:
- Mention the selected goals by name
- Explain the 4-week arc (what changes week to week)
- Reference one specific evidence-based principle being applied
- Keep it under 90 words
- End with: "Your first session is ready in the Today tab."`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goals, phase, cycleDay } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const goalsList = (goals as string[]).join(", ");

    const userPrompt = `Create a 4-week workout plan for a woman with these goals: ${goalsList}.
She is currently in her ${phase} phase (cycle day ${cycleDay}).

Generate all 28 sessions (7 days × 4 weeks) following all programming principles and progressive overload rules.
Each session must have detailed warm_up exercises, structured main_block sections with exercises including sets, reps_or_duration, rest periods, tempo, and form_cues, and cool_down stretches.
Include a coaching_note for each session citing relevant evidence.

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
            description: "Create a structured 4-week, 7-day evidence-based workout plan with full session details",
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
                            name: { type: "string", description: "e.g. Full Body Strength (Foundation)" },
                            category: { type: "string", enum: ["strength", "cardio", "hiit", "yoga", "mobility", "circuit", "active-recovery", "rest"] },
                            durationMin: { type: "number" },
                            intensity: { type: "string", enum: ["low", "moderate", "high", "very-high"] },
                            warm_up: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  duration: { type: "string", description: "e.g. 1 min, 10 reps, 30 sec per side" }
                                },
                                required: ["name", "duration"]
                              }
                            },
                            main_block: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  section_label: { type: "string", description: "e.g. Strength A, Circuit A — Lower Body, Conditioning Finisher" },
                                  exercises: {
                                    type: "array",
                                    items: {
                                      type: "object",
                                      properties: {
                                        name: { type: "string" },
                                        sets: { type: "number" },
                                        reps_or_duration: { type: "string", description: "e.g. 12, 10 per side, 40 sec, 30 sec hold" },
                                        rest: { type: "string", description: "e.g. 60 sec, 20 sec, 90 sec" },
                                        tempo: { type: "string", description: "e.g. 3-1-1, 2-0-1, controlled" },
                                        form_cue: { type: "string", description: "Specific biomechanical cue for this exercise" }
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
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  duration: { type: "string" }
                                },
                                required: ["name", "duration"]
                              }
                            },
                            coaching_note: { type: "string", description: "Evidence-based coaching insight for this session" }
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
