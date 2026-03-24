import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PHASE_GUIDANCE: Record<string, string> = {
  menstrual: `Days 1-5 MENSTRUAL phase:
- Iron-rich foods CRITICAL: lentils, leafy greens (spinach, silverbeet), red meat, beetroot, tofu
- Pair iron sources with vitamin C (capsicum, kiwifruit, citrus) for absorption — avoid tea/coffee with iron-rich meals
- Magnesium: dark chocolate (70%+), pumpkin seeds, almonds, cashews
- Anti-inflammatory: turmeric golden milk, ginger tea, salmon, walnuts
- Warming, easy-to-digest: bone broth soups, slow-cooked stews, porridge with nut butter
- Omega-3 for prostaglandin balance: salmon, sardines, chia seeds, flaxseed
- REDUCE: caffeine (increases cramping), alcohol, processed sugar, excess salt
- Calorie needs are slightly elevated — do NOT restrict. Honour hunger signals.
- Hydration: warm water with lemon, herbal teas (raspberry leaf, chamomile)`,

  follicular: `Days 6-13 FOLLICULAR phase:
- Rising oestrogen supports muscle protein synthesis — ideal time for higher protein intake
- Light, fresh, energising meals — appetite naturally lower
- High fibre: whole grains, legumes, cruciferous vegetables (broccoli, cauliflower)
- Fermented foods for oestrogen metabolism: kimchi, miso, natural yoghurt, sauerkraut, kefir
- Zinc (supports rising FSH): oysters, pumpkin seeds, chickpeas, red meat
- B vitamins for energy metabolism: eggs, leafy greens, whole grains
- Higher carb tolerance — use this window for complex carbs to fuel training
- Phytoestrogens: flaxseed, sesame seeds, tempeh
- Experiment with new recipes — cognitive function and creativity peak`,

  ovulatory: `Days 14-16 OVULATORY phase:
- Anti-inflammatory, antioxidant-rich foods to support ovulation
- Raw or lightly cooked vegetables — digestive capacity is strong
- Cruciferous vegetables support oestrogen detoxification: broccoli sprouts, kale, Brussels sprouts
- Seeds: sunflower seeds, sesame seeds (lignans support progesterone)
- Citrus, berries, dark leafy greens for antioxidants
- Light and fresh — appetite naturally at its lowest
- Fibre is key for excess oestrogen clearance: 30g+ daily target
- Avoid inflammatory triggers: refined sugar, alcohol, processed oils
- Glutathione supporters: asparagus, avocado, garlic`,

  luteal: `Days 17-28 LUTEAL phase:
- Progesterone rises → higher basal metabolic rate (~100-300 cal/day increase)
- Magnesium and B6 to ease PMS: banana, avocado, turkey, lentils, sunflower seeds
- Complex carbs to stabilise blood sugar and support serotonin: sweet potato, oats, brown rice, quinoa
- Calcium (1000mg target): dairy, fortified plant milks, tahini, sardines with bones
- Healthy fats to support progesterone: avocado, olive oil, nuts, fatty fish
- REDUCE: salt (reduces bloating), refined sugar, alcohol, caffeine
- Warming, sustaining, comforting meals — soups, curries, roasted vegetables
- Higher calorie needs are NORMAL — do not restrict. Add an extra snack if needed.
- Cravings are physiological — redirect to nutrient-dense alternatives (dark chocolate not milk chocolate, roasted chickpeas not chips)
- Late luteal: increase anti-inflammatory foods as prostaglandin production ramps up`,
};

const GOAL_GUIDANCE: Record<string, string> = {
  "lose-weight": `WEIGHT LOSS PROTOCOL:
- Moderate deficit: 300-500 cal below TDEE (never below BMR)
- Protein priority: 1.6-2.0g/kg to preserve lean mass during deficit (Phillips, 2014)
- High-satiety strategy: 30g+ fibre/day, protein at every meal, volume eating with vegetables
- Meal timing: front-load calories (larger breakfast/lunch, lighter dinner)
- Do NOT restrict during menstrual phase — the deficit creates itself through the cycle`,

  "gain-muscle": `MUSCLE GAIN PROTOCOL:
- Calorie surplus: 200-300 cal above TDEE (lean gain approach)
- Protein: 1.8-2.2g/kg distributed across 4 meals for optimal MPS (Schoenfeld & Aragon, 2018)
- Leucine threshold: 2.5-3g per meal (eggs, chicken, Greek yoghurt, whey)
- Carbohydrate: 4-6g/kg for training fuel and glycogen replenishment
- Post-workout: 30-40g protein + 1g/kg carbs within 60 minutes
- Creatine consideration: 3-5g/day (supports female muscle gain without water retention concerns)`,

  "tone-up": `BODY RECOMPOSITION PROTOCOL:
- Maintenance calories or slight deficit (-200 cal)
- Protein: 1.6-2.0g/kg — non-negotiable for recomp
- Balanced macros: 30% protein, 35% carbs, 35% fat
- Nutrient timing: carbs concentrated around training window
- Anti-inflammatory foods to reduce water retention and improve muscle definition`,

  flexibility: "Anti-inflammatory foods (turmeric, ginger, omega-3), magnesium-rich meals for muscle relaxation, collagen-supporting foods (citrus, berries, bone broth), adequate hydration for fascia health.",
  endurance: "Complex carbs for sustained energy (4-7g/kg), iron-rich foods for oxygen transport, adequate hydration with electrolytes, moderate protein (1.4-1.6g/kg) for recovery, beetroot juice for nitric oxide.",
  "stress-relief": "Magnesium-rich foods, B vitamins, omega-3 for brain health, tryptophan-rich foods (turkey, pumpkin seeds) for serotonin, adaptogens (ashwagandha, turmeric), limit caffeine after 12pm, complex carbs for stable mood.",
  posture: "Anti-inflammatory support, calcium (1000mg/day) and vitamin D (600-1000 IU) for bone health, collagen-supporting foods, magnesium for muscle tension relief.",
  energy: "B-vitamin rich foods (whole grains, eggs, nutritional yeast), iron (red meat, lentils, spinach — test if persistent fatigue), CoQ10 sources (sardines, organ meats), complex carbs for sustained energy, reduce refined sugar crashes.",
  "Build muscle": "See gain-muscle protocol above.",
  "Lose weight": "See lose-weight protocol above.",
  "Tone & define": "See tone-up protocol above.",
  strength: "Higher protein (1.8-2.2g/kg), complex carbs for energy, adequate calories to support training recovery, creatine 3-5g/day.",
  "weight-loss": "See lose-weight protocol above.",
  general: "Balanced, phase-focused nutrition: protein 1.2-1.6g/kg, carbs 3-5g/kg, fat 25-35% calories. Prioritise whole foods, 5+ servings vegetables/day.",
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
      equipment?: string[]; bodyGoal?: string; bodyGoals?: string[];
      weight?: string; height?: string; age?: string;
    };

    const goals = prefs.bodyGoals?.length ? prefs.bodyGoals : (prefs.bodyGoal ? [prefs.bodyGoal] : ["general"]);
    const goalAdvice = goals.map(g => GOAL_GUIDANCE[g] || GOAL_GUIDANCE.general).join("\n\n");

    // Calculate TDEE if weight/height available
    let tdeeSection = "";
    const weight = prefs.weight ? parseFloat(prefs.weight) : null;
    const height = prefs.height ? parseFloat(prefs.height) : null;
    const age = prefs.age ? parseInt(prefs.age) : 30;
    if (weight && height) {
      const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      const tdee = Math.round(bmr * 1.55); // moderate activity default
      tdeeSection = `
ESTIMATED TDEE (Mifflin-St Jeor):
- BMR: ~${Math.round(bmr)} kcal
- Estimated TDEE (moderate activity): ~${tdee} kcal/day
- Weight: ${weight}kg, Height: ${height}cm, Est. age: ${age}
- Use this as baseline for all caloric calculations below.
- For fat loss: target ${tdee - 400} kcal/day
- For maintenance: target ${tdee} kcal/day
- For muscle gain: target ${tdee + 250} kcal/day

MACRO TARGETS (calculate based on TDEE and goal):
- Protein: ${Math.round(weight * 1.6)}-${Math.round(weight * 2.0)}g/day (${Math.round(weight * 1.6 * 4)}-${Math.round(weight * 2.0 * 4)} kcal)
- Remaining calories split between carbs (45-55%) and fats (25-35%)
- Hydration target: ${(weight * 35 / 1000).toFixed(1)}L/day minimum`;
    }

    let systemPrompt = `You are a registered dietitian (NZ Dietitians Board) and sports nutritionist creating personalised, evidence-based meal plans for women. You have an MSc in Human Nutrition and specialise in female hormonal health, cycle-syncing nutrition, and sports performance nutrition.

USER PROFILE:
- Diet type: ${prefs.dietType || "No preference"}
- Allergies/intolerances: ${prefs.allergies || "None"}
- Food dislikes: ${prefs.dislikes || "None"}
- Daily calorie target: ${prefs.calorieTarget || "Not specified — calculate from TDEE"}
- Cooking skill: ${prefs.cookingSkill || "confident"}
- Available cooking time: ${prefs.availableTime || "30"} minutes per meal
- Kitchen equipment: ${prefs.equipment?.join(", ") || "oven, stovetop, basic equipment"}
- Cooking for: ${prefs.adults} adult(s)${prefs.kids > 0 ? ` and ${prefs.kids} kid(s)` : ""}
- Body/fitness goals: ${goals.join(", ")}
${tdeeSection}

═══ GOAL-SPECIFIC NUTRITIONAL PROTOCOLS ═══
${goalAdvice}

═══ PREP STYLE CONFIGURATION ═══
- Breakfast: ${prefs.breakfast === "batch" ? "Same breakfast all week (batch prep — e.g., overnight oats, egg muffins)" : prefs.breakfast === "rotate" ? "2-3 options rotated through the week" : "Different each day"}
- Lunch: ${prefs.lunch === "batch" ? "Same lunch all week (batch prep — e.g., grain bowls, soup)" : prefs.lunch === "rotate" ? "2-3 options rotated" : "Different each day"}
- Dinner: ${prefs.dinner === "double" ? "Double batch — cook once, eat leftovers next day. Mark leftover days clearly." : prefs.dinner === "fresh" ? "Fresh dinner each night" : "Mix of fresh and leftover nights"}
- Prep day(s): ${prefs.prepDays.join(", ")}

═══ PHASE-SPECIFIC NUTRITION PROTOCOLS ═══
${Object.values(PHASE_GUIDANCE).join("\n\n")}

═══ MANDATORY REQUIREMENTS ═══

1. EVERY MEAL MUST INCLUDE:
   - Specific food names with exact quantities (e.g., "150g chicken breast", "1 cup cooked brown rice", "2 cups mixed salad greens")
   - Step-by-step numbered method (3-8 steps)
   - Nutritional note explaining why this meal suits the phase and goal
   - Key nutrients as an array (e.g., ["Iron", "Vitamin C", "Protein 35g"])
   - Approximate calories and protein grams
   - NEVER write generic descriptions like "protein + carbs + vegetables"

2. PRE/POST WORKOUT NUTRITION:
   - On training days, breakfast or morning snack should include pre-workout guidance
   - Post-workout meals/snacks should include protein (20-40g) + carbs within 60 minutes
   - Note this in the nutritional note

3. HYDRATION:
   - Include daily hydration target${weight ? ` (${(weight * 35 / 1000).toFixed(1)}L baseline)` : ""}
   - Suggest specific hydration timing (e.g., "500ml upon waking", "500ml during training")
   - Electrolyte notes during luteal phase

4. DEFICIENCY FLAGS:
   - Iron: Flag during menstrual phase. Recommend iron-rich meals + vitamin C pairing. Note: tea/coffee inhibit absorption.
   ${prefs.dietType?.toLowerCase().includes("veg") ? "- B12: CRITICAL for vegetarian/vegan — recommend supplementation (methylcobalamin 1000mcg)\n   - Omega-3 DHA: Recommend algae-based supplement\n   - Zinc: Emphasise pumpkin seeds, chickpeas, lentils, fortified cereals" : ""}
   ${prefs.allergies?.toLowerCase().includes("dairy") || prefs.dietType?.toLowerCase().includes("dairy") ? "- Calcium: Flag — recommend fortified plant milk, tahini, sardines with bones, broccoli (target 1000mg/day)\n   - Vitamin D: Recommend supplement 600-1000 IU/day" : ""}
   - Magnesium: Flag if high training volume or poor sleep reported
   - If persistent low energy: suggest GP blood test for iron, B12, thyroid

5. NZ SUPERMARKET AVAILABILITY:
   - All ingredients must be available at Countdown, New World, or Pak'nSave
   - No specialist ingredients without suggesting accessible alternatives
   - Consider seasonal NZ availability

6. ALLERGEN SAFETY:
   - NEVER include foods the user is allergic to or has listed as dislikes
   - Double-check hidden allergens in sauces and processed ingredients`;

    let userPrompt: string;

    if (mode === "regenerate_meal" && regenerateDay && regenerateMeal && existingPlan) {
      userPrompt = `Regenerate ONLY the ${regenerateMeal} for cycle day ${regenerateDay}.
Current meal: ${JSON.stringify(existingPlan.days?.find((d: any) => d.cycleDay === regenerateDay)?.[regenerateMeal])}

Generate a DIFFERENT meal that fits the same phase requirements. Include specific foods with exact quantities, step-by-step method, approximate calories and protein, and nutritional note.

Return ONLY this single meal as JSON:
{
  "name": "...",
  "phase": "...",
  "mealType": "${regenerateMeal}",
  "prepTime": "...",
  "serves": ...,
  "calories": "...",
  "protein": "...",
  "ingredients": ["150g chicken breast", "1 cup brown rice", ...],
  "method": ["1. ...", "2. ...", ...],
  "nutritionalNote": "...",
  "keyNutrients": ["Iron", "Protein 32g", "Fibre 8g"]
}`;
    } else if (mode === "regenerate_day" && regenerateDay && existingPlan) {
      const lockedForDay = lockedMeals ? Object.entries(lockedMeals)
        .filter(([k, v]) => k.startsWith(`${regenerateDay}-`) && v)
        .map(([k]) => k.split("-")[1]) : [];

      userPrompt = `Regenerate meals for cycle day ${regenerateDay} ONLY.
${lockedForDay.length > 0 ? `Keep these meals locked (do not change): ${lockedForDay.join(", ")}` : "Regenerate all meals for this day."}

Return the full day as JSON matching the AIPlannedDay format below. Include specific foods with exact quantities, calories, and protein per meal.`;
    } else {
      userPrompt = `Generate a complete 28-day meal plan. Each day must include breakfast, morningSnack, lunch, afternoonSnack, and dinner.

${lockedMeals && Object.keys(lockedMeals).length > 0 ? `LOCKED MEALS (do not change these):\n${JSON.stringify(lockedMeals)}` : ""}

Return as JSON array of 28 days:
[
  {
    "cycleDay": 1,
    "phase": "menstrual",
    "dailyCalories": "~1800 kcal",
    "dailyProtein": "~120g",
    "hydrationTarget": "2.5L",
    "deficiencyFlags": ["Iron — include vitamin C pairing", "Magnesium"],
    "preWorkoutNote": "If training today: eat breakfast 1.5 hours before. Include 30g carbs + 15g protein.",
    "postWorkoutNote": "Within 60 min: 30g protein + 40g carbs (e.g., Greek yoghurt with banana and honey)",
    "breakfast": {
      "name": "Iron-Rich Spinach & Mushroom Omelette with Sourdough",
      "phase": "menstrual",
      "mealType": "breakfast",
      "prepTime": "15 min",
      "serves": 1,
      "calories": "~450 kcal",
      "protein": "~28g",
      "ingredients": ["3 large eggs", "2 cups baby spinach", "100g sliced mushrooms", "1 slice sourdough bread", "1 tsp butter", "pinch sea salt and pepper"],
      "method": ["1. Heat butter in a non-stick pan over medium heat", "2. Sauté mushrooms for 3 minutes until golden", "3. Add spinach and cook until wilted, about 1 minute", "4. Pour beaten eggs over vegetables", "5. Cook for 2-3 minutes until edges set, fold in half", "6. Toast sourdough and serve alongside"],
      "nutritionalNote": "Iron-rich spinach paired with eggs (vitamin C in spinach aids iron absorption). Mushrooms provide B vitamins and selenium. Sourdough is easier to digest than regular bread during menstruation.",
      "keyNutrients": ["Iron", "B12", "Protein 28g", "Selenium"]
    },
    "morningSnack": { ... },
    "lunch": { ... },
    "afternoonSnack": { ... },
    "dinner": { ... }
  },
  ...
]

CRITICAL REMINDERS:
- Days 1-5: menstrual (iron focus, anti-inflammatory, warming)
- Days 6-13: follicular (fresh, fermented, higher carbs, rising energy)
- Day 14: ovulatory (antioxidants, light, raw vegetables)
- Days 15-28: luteal (complex carbs, magnesium, manage cravings, slightly higher calories)
- If dinner prep is "double", make day N+1 dinner a leftover: set isLeftover: true and leftoverFrom: N
- Snacks: simple, phase-appropriate, 2-3 ingredients max, include protein
- Include dailyCalories, dailyProtein, hydrationTarget, and deficiencyFlags for each day
- Every single ingredient must have a specific quantity
- All food must be available at NZ supermarkets`;
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
