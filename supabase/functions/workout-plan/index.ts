import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goals, phase, cycleDay } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const goalsList = (goals as string[]).join(", ");

    const systemPrompt = `You are an expert women's fitness coach specializing in cycle-synced training. 
You create evidence-based 4-week workout plans optimized for menstrual cycle phases.
Your plans follow periodization principles and progressive overload.
Always respond with valid JSON matching the requested schema.`;

    const userPrompt = `Create a 4-week workout plan for a woman with these goals: ${goalsList}.
She is currently in her ${phase} phase (cycle day ${cycleDay}).

Requirements:
- 7 workouts per week (include 1-2 active recovery/rest days)
- Each workout: name, duration (minutes), exercises with sets/reps/form cues
- Vary intensity by cycle phase: lighter during menstrual, build during follicular, peak during ovulatory, moderate during luteal
- Progressive overload across the 4 weeks
- Evidence-based exercise selection for the stated goals
- Include warm-up and cool-down notes

Return the plan as a JSON object.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_workout_plan",
            description: "Create a structured 4-week workout plan",
            parameters: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "Brief explanation of the plan's approach and how it addresses the goals"
                },
                weeks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "number" },
                      theme: { type: "string", description: "e.g. Foundation, Build, Peak, Deload" },
                      days: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            day: { type: "number", description: "1-7" },
                            name: { type: "string" },
                            category: { type: "string", enum: ["strength", "cardio", "hiit", "yoga", "pilates", "walk", "rest", "mobility"] },
                            durationMin: { type: "number" },
                            intensity: { type: "string", enum: ["low", "moderate", "high"] },
                            warmUp: { type: "string" },
                            coolDown: { type: "string" },
                            exercises: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  sets: { type: "string" },
                                  reps: { type: "string" },
                                  duration: { type: "string" },
                                  formCue: { type: "string" },
                                  section: { type: "string", description: "e.g. Main, Circuit A, Finisher" }
                                },
                                required: ["name", "formCue"]
                              }
                            }
                          },
                          required: ["day", "name", "category", "durationMin", "exercises"]
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
