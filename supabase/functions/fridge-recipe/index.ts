import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { ingredients, imageBase64, phase, dietary, allergies, dislikes, cookingSkill, equipment, calorieTarget, bodyGoal } = body;

    // Credit check: fridge recipe costs 2 credits
    const userIdentifier = body.userIdentifier;
    if (userIdentifier) {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: credits } = await sb.from("ai_credits").select("*").eq("user_identifier", userIdentifier).maybeSingle();
      const cost = 2;
      if (credits && (credits.credits_remaining || 0) < cost) {
        return new Response(JSON.stringify({ error: `You need ${cost} AI credits for recipe generation. Top up or upgrade your plan.` }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (credits) {
        await sb.from("ai_credits").update({ credits_remaining: (credits.credits_remaining || 0) - cost, updated_at: new Date().toISOString() }).eq("user_identifier", userIdentifier);
      } else if (!credits) {
        await sb.from("ai_credits").insert({ user_identifier: userIdentifier, credits_remaining: 5 - cost, tier: "free" });
      }
      await sb.from("ai_usage").insert({ user_identifier: userIdentifier, function_name: "fridge-recipe", tokens_used: cost });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Step 1: If photo provided, identify ingredients first
    let identifiedIngredients = ingredients || "";
    if (imageBase64) {
      const visionRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Look at this fridge/food photo. List EVERY food ingredient you can identify, separated by commas. Be specific (e.g. 'red capsicum' not just 'vegetable'). Only list food items, nothing else. If you can't identify any food, say 'none'." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }],
        }),
      });

      if (!visionRes.ok) {
        const errText = await visionRes.text();
        console.error("Vision API error:", visionRes.status, errText);
        if (visionRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (visionRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("Failed to analyse photo");
      }

      const visionData = await visionRes.json();
      identifiedIngredients = visionData.choices?.[0]?.message?.content || "";
    }

    if (!identifiedIngredients || identifiedIngredients.toLowerCase() === "none") {
      return new Response(JSON.stringify({ error: "No ingredients identified. Please try again with a clearer photo or type your ingredients." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Generate recipes from ingredients
    const dietNote = dietary ? `Dietary requirements: ${dietary}.` : "";
    const allergyNote = allergies ? `Allergies/intolerances (MUST AVOID): ${allergies}.` : "";
    const dislikeNote = dislikes ? `Dislikes (avoid): ${dislikes}.` : "";
    const skillNote = cookingSkill === "beginner" ? "Keep recipes simple, under 6 ingredients, under 20 min prep." : cookingSkill === "confident" ? "Moderate complexity is fine." : "Can handle complex techniques and longer prep.";
    const equipNote = equipment?.length ? `Available equipment: ${equipment.join(", ")}. Prioritise recipes using this equipment.` : "";
    const calNote = calorieTarget ? `Target ~${calorieTarget} calories per meal.` : "";
    const goalNote = bodyGoal === "lose-weight" ? "Lean, lower calorie recipes. High protein, high fibre." : bodyGoal === "build-muscle" ? "Higher protein (30g+), calorie-dense." : "";

    const phaseMap: Record<string, string> = {
      menstrual: "Menstrual phase: warming, iron-rich, anti-inflammatory, easy-digest foods.",
      follicular: "Follicular phase: light, fresh, high-protein, fermented foods welcome.",
      ovulatory: "Ovulatory phase: raw/lightly cooked, antioxidant-rich, cruciferous veg.",
      luteal: "Luteal phase: complex carbs, magnesium-rich, comforting, blood-sugar stabilising.",
    };

    const systemPrompt = `You are a registered nutritionist creating recipes for a female health app in New Zealand.
RULES:
- Use ONLY the listed ingredients plus basic pantry staples (salt, pepper, olive oil, garlic, onion, butter, flour, stock).
- Do NOT add expensive or unusual ingredients beyond what the user listed.
- Each recipe must be practical, delicious, and achievable.
- ${skillNote}
${dietNote}
${allergyNote}
${dislikeNote}
${equipNote}
${calNote}
${goalNote}
- Phase guidance: ${phaseMap[phase] || "General healthy eating."}
- Use NZ-available ingredients and measurements (metric).

Return EXACTLY a JSON array of 3 recipes. Each recipe object:
{
  "name": "Recipe Name",
  "prepTime": "XX mins",
  "serves": 2,
  "ingredients": ["1 cup rice", "200g chicken breast", ...],
  "method": ["Step 1...", "Step 2...", ...],
  "keyNutrients": ["Protein", "Iron", ...],
  "nutritionalNote": "Why this is good for your phase...",
  "usedIngredients": ["chicken", "rice"],
  "addedStaples": ["garlic", "olive oil"]
}

Return ONLY the JSON array, no markdown, no explanation.`;

    const recipeRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `My ingredients: ${identifiedIngredients}\n\nCreate 3 delicious recipes using primarily these ingredients.` }
        ],
      }),
    });

    if (!recipeRes.ok) {
      if (recipeRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (recipeRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("Recipe generation failed");
    }

    const recipeData = await recipeRes.json();
    let content = recipeData.choices?.[0]?.message?.content || "";
    // Strip markdown fences
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let recipes;
    try {
      recipes = JSON.parse(content);
    } catch {
      console.error("Failed to parse recipes:", content);
      throw new Error("AI returned invalid recipe format");
    }

    return new Response(JSON.stringify({
      identifiedIngredients,
      recipes,
      fromPhoto: !!imageBase64,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("fridge-recipe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
