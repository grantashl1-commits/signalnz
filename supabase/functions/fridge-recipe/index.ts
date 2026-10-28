import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";
import { deepseekChat } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  // Only signed-in members may call this (it uses the service role or paid AI).
  const caller = await requireUser(req, corsHeaders);
  if (caller instanceof Response) return caller;

  try {
    const body = await req.json();
    const { ingredients, imageBase64, phase, dietary, allergies, dislikes, cookingSkill, equipment, calorieTarget, bodyGoal } = body;

    // Credit check: fridge recipe costs 2 credits (atomic)
    const userIdentifier = caller.user.id;
    if (userIdentifier) {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      // Rate limiting: 5 per minute (expensive operation)
      const { data: rl } = await sb.rpc("check_rate_limit", {
        _user_id: userIdentifier, _function_name: "fridge-recipe", _max_per_minute: 5,
      });
      if (rl && !rl.allowed) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: creditError } = await sb.rpc("deduct_ai_credits", {
        p_user_identifier: userIdentifier,
        p_cost: 2,
        p_function_name: "fridge-recipe",
      });
      if (creditError) {
        if (creditError.message?.includes("insufficient_credits")) {
          return new Response(JSON.stringify({ error: "You need 2 AI credits for recipe generation. Top up or upgrade your plan." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        console.error("Credit deduction error:", creditError);
      }
    }

    // Step 1: If photo provided, identify ingredients first
    let identifiedIngredients = ingredients || "";
    if (imageBase64) {
      identifiedIngredients = await deepseekChat(
        [{
          role: "user",
          content: [
            { type: "text", text: "Look at this fridge/food photo. List EVERY food ingredient you can identify, separated by commas. Be specific (e.g. 'red capsicum' not just 'vegetable'). Only list food items, nothing else. If you can't identify any food, say 'none'." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }],
      );
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

    let content = await deepseekChat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `My ingredients: ${identifiedIngredients}\n\nCreate 3 delicious recipes using primarily these ingredients.` }
      ],
    );
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
