import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PHASE_GUIDANCE: Record<string, string> = {
  menstrual: `Days 1-7 MENSTRUAL phase:
- Iron-rich foods: lentils, leafy greens, red meat (if not vegan/veg), beetroot
- Magnesium: dark chocolate, pumpkin seeds, almonds
- Anti-inflammatory: turmeric, ginger, omega-3 rich foods
- Warming, easy to digest: soups, stews, porridge
- REDUCE: caffeine, alcohol, processed sugar
- Comfort food that nourishes`,

  follicular: `Days 8-13 FOLLICULAR phase:
- Light, fresh, energising meals
- High fibre: whole grains, legumes
- Fermented foods: kimchi, miso, yoghurt, sauerkraut
- Zinc and B vitamins
- Salads, whole grains, legumes
- Experiment with new recipes — energy is rising`,

  ovulatory: `Day 14 OVULATORY phase:
- Anti-inflammatory, antioxidant-rich
- Raw or lightly cooked vegetables
- Seeds, citrus, berries
- Light and fresh — appetite naturally lower
- Avoid heavy processed foods`,

  luteal: `Days 15-28 LUTEAL phase:
- Magnesium and B6 to ease PMS: banana, avocado, turkey, lentils
- Complex carbs to stabilise blood sugar: sweet potato, oats, brown rice
- Calcium: dairy or fortified alternatives
- REDUCE: salt, sugar, alcohol
- Warming, sustaining, comforting meals
- Higher calorie needs are normal — do not restrict`,
};

const GOAL_GUIDANCE: Record<string, string> = {
  "Build muscle": "Prioritise higher protein (1.6-2g per kg body weight), complex carbs for recovery, calorie surplus of ~300-500 cal. Include protein in every meal.",
  "Lose weight": "Moderate calorie deficit (~300-500 cal below maintenance), high fibre, high satiety meals, lean protein at every meal. Avoid drastic restriction.",
  "Tone & define": "Balanced macros with emphasis on lean protein, moderate carbs around training, healthy fats. Slight deficit or maintenance calories.",
  strength: "Higher protein intake, complex carbs for energy, adequate calories to support training recovery.",
  "weight-loss": "Moderate calorie deficit, high protein to preserve muscle, fibre-rich vegetables for satiety.",
  flexibility: "Anti-inflammatory foods, adequate hydration, balanced macros.",
  "stress-relief": "Magnesium-rich foods, B vitamins, omega-3, complex carbs for serotonin production.",
  general: "Balanced, phase-focused nutrition with adequate protein, complex carbs, and healthy fats.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { preferences, mode, lockedMeals, existingPlan, regenerateDay, regenerateMeal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prefs = preferences as {
      breakfast: string; lunch: string; dinner: string;
      prepDays: string[]; adults: number; kids: number;
      dietType?: string; allergies?: string; dislikes?: string;
      calorieTarget?: string; cookingSkill?: string; availableTime?: string;
      equipment?: string[]; bodyGoal?: string;
    };

    // Build system prompt
    const goalKey = prefs.bodyGoal || "general";
    const goalAdvice = GOAL_GUIDANCE[goalKey] || GOAL_GUIDANCE.general;

    let systemPrompt = `You are a specialist cycle-syncing nutritionist creating personalised meal plans for women.

USER PROFILE:
- Diet: ${prefs.dietType || "No preference"}
- Allergies: ${prefs.allergies || "None"}
- Dislikes: ${prefs.dislikes || "None"}
- Daily calorie target: ${prefs.calorieTarget || "No preference"}
- Cooking skill: ${prefs.cookingSkill || "confident"}
- Available cooking time: ${prefs.availableTime || "30"} minutes per meal
- Equipment: ${prefs.equipment?.join(", ") || "oven, stovetop"}
- Cooking for: ${prefs.adults} adult(s)${prefs.kids > 0 ? ` and ${prefs.kids} kid(s)` : ""}
- Body goal: ${goalKey}

BODY GOAL GUIDANCE:
${goalAdvice}

PREP STYLE:
- Breakfast: ${prefs.breakfast === "batch" ? "Same breakfast all week (batch prep)" : prefs.breakfast === "rotate" ? "2-3 options, rotated" : "Different each day"}
- Lunch: ${prefs.lunch === "batch" ? "Same lunch all week (batch prep)" : prefs.lunch === "rotate" ? "2-3 options, rotated" : "Different each day"}
- Dinner: ${prefs.dinner === "double" ? "Double batch — cook once, eat twice. Mark second day as leftover." : prefs.dinner === "fresh" ? "Fresh dinner each night" : "Mix of fresh and leftover nights"}
- Prep day(s): ${prefs.prepDays.join(", ")}

PHASE-SPECIFIC NUTRITION RULES:
${Object.values(PHASE_GUIDANCE).join("\n\n")}

CRITICAL RULES:
1. Every meal MUST have exact ingredient quantities (e.g. "1 cup rolled oats", "200g chicken breast")
2. Every meal MUST have a step-by-step method (3-8 numbered steps)
3. Every meal MUST have a nutritional note explaining why it suits the phase
4. NEVER include foods the user is allergic to or dislikes
5. If batch cooking, mark leftover days with isLeftover: true and reference the original day
6. Prep time must be realistic for the user's skill level and available time
7. Include key nutrients as an array (e.g. ["Iron", "Magnesium", "B6"])`;

    let userPrompt: string;

    if (mode === "regenerate_meal" && regenerateDay && regenerateMeal && existingPlan) {
      // Regenerate single meal
      userPrompt = `Regenerate ONLY the ${regenerateMeal} for cycle day ${regenerateDay}.
Current meal: ${JSON.stringify(existingPlan.days?.find((d: any) => d.cycleDay === regenerateDay)?.[regenerateMeal])}

Generate a different meal that fits the same phase requirements. Return ONLY this single meal as JSON:
{
  "name": "...",
  "phase": "...",
  "mealType": "${regenerateMeal}",
  "prepTime": "...",
  "serves": ...,
  "ingredients": ["..."],
  "method": ["..."],
  "nutritionalNote": "...",
  "keyNutrients": ["..."]
}`;
    } else if (mode === "regenerate_day" && regenerateDay && existingPlan) {
      // Regenerate single day
      const lockedForDay = lockedMeals ? Object.entries(lockedMeals)
        .filter(([k, v]) => k.startsWith(`${regenerateDay}-`) && v)
        .map(([k]) => k.split("-")[1]) : [];

      userPrompt = `Regenerate meals for cycle day ${regenerateDay} ONLY.
${lockedForDay.length > 0 ? `Keep these meals locked (do not change): ${lockedForDay.join(", ")}` : "Regenerate all meals for this day."}

Return the full day as JSON matching the AIPlannedDay format below.`;
    } else {
      // Full 28-day plan
      userPrompt = `Generate a complete 28-day meal plan. Each day must include breakfast, morningSnack, lunch, afternoonSnack, and dinner.

${lockedMeals && Object.keys(lockedMeals).length > 0 ? `LOCKED MEALS (do not change these):\n${JSON.stringify(lockedMeals)}` : ""}

Return as JSON array of 28 days:
[
  {
    "cycleDay": 1,
    "phase": "menstrual",
    "breakfast": { "name": "...", "phase": "menstrual", "mealType": "breakfast", "prepTime": "10 min", "serves": 2, "ingredients": ["1 cup rolled oats", "..."], "method": ["Step 1...", "Step 2..."], "nutritionalNote": "...", "keyNutrients": ["Iron", "Magnesium"] },
    "morningSnack": { "name": "...", "phase": "menstrual", "mealType": "snack", "prepTime": "2 min", "serves": 1, "ingredients": ["..."], "method": ["..."], "nutritionalNote": "...", "keyNutrients": ["..."] },
    "lunch": { ... },
    "afternoonSnack": { ... },
    "dinner": { ... }
  },
  ...
]

IMPORTANT:
- Days 1-5: menstrual phase
- Days 6-13: follicular phase  
- Day 14: ovulatory phase
- Days 15-28: luteal phase
- If dinner prep is "double", make day N+1 dinner a leftover: set isLeftover: true and leftoverFrom: N
- Snacks should be simple, phase-appropriate, 2-3 ingredients max`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Failed to generate meal plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse meal plan response", raw: content.substring(0, 200) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ plan: parsed, mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meal-plan-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
