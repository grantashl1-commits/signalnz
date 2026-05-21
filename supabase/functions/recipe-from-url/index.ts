import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function stripHtml(html: string): string {
  // Remove scripts and styles wholesale
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Replace block elements with newlines
  text = text.replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, "\n");
  // Strip all remaining tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities
  text = text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  // Collapse whitespace
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Derive user from JWT — never trust body-supplied identifier
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || !url.startsWith("http")) {
      return new Response(JSON.stringify({ error: "A valid URL is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await sb.auth.getUser(token);
    const userIdentifier = user?.id ?? null;

    // Optional credit deduction (1 credit per import)
    if (userIdentifier) {
      const { data: rl } = await sb.rpc("check_rate_limit", {
        _user_id: userIdentifier, _function_name: "recipe-from-url", _max_per_minute: 10,
      });
      if (rl && !rl.allowed) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: creditError } = await sb.rpc("deduct_ai_credits", {
        p_user_identifier: userIdentifier,
        p_cost: 1,
        p_function_name: "recipe-from-url",
      });
      if (creditError?.message?.includes("insufficient_credits")) {
        return new Response(JSON.stringify({ error: "You need 1 AI credit to import a recipe. Top up in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch the webpage — try direct first with a realistic browser UA, then
    // fall back to Jina Reader (r.jina.ai) which bypasses Cloudflare/bot walls
    // and returns clean markdown.
    const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    let html = "";
    let usedReader = false;
    try {
      const pageRes = await fetch(url, {
        headers: {
          "User-Agent": BROWSER_UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-NZ,en;q=0.9",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!pageRes.ok) throw new Error(`status ${pageRes.status}`);
      html = await pageRes.text();
    } catch (_e) {
      try {
        const readerRes = await fetch(`https://r.jina.ai/${url}`, {
          headers: { "User-Agent": BROWSER_UA, "Accept": "text/plain" },
          signal: AbortSignal.timeout(15000),
        });
        if (!readerRes.ok) throw new Error(`reader status ${readerRes.status}`);
        html = await readerRes.text();
        usedReader = true;
      } catch (_e2) {
        return new Response(JSON.stringify({ error: "Could not fetch that URL. Try copying the recipe text manually." }), {
          status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const pageText = (usedReader ? html : stripHtml(html)).slice(0, 12000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a recipe extraction assistant. Extract the recipe from the provided webpage text.
Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "title": "Recipe name",
  "category": "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Baking" | "Other",
  "estimated_time": <number in minutes, or null if not found>,
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount", ...],
  "instructions": ["Step 1 text", "Step 2 text", ...],
  "image_url": "https://... if a recipe image URL is present, else null",
  "source_url": "${url}"
}

Rules:
- Each ingredient must include the amount (e.g. "1 cup rolled oats", "200g chicken breast")
- Instructions must be individual steps, not combined paragraphs
- Use metric measurements where possible
- If no clear recipe is found, return {"error": "No recipe found on this page"} `;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract the recipe from this webpage:\n\n${pageText}` },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "The AI service is temporarily over capacity. Please try again shortly — your credits are safe." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI extraction failed");
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let recipe;
    try {
      recipe = JSON.parse(content);
    } catch {
      throw new Error("AI returned invalid format");
    }

    if (recipe.error) {
      return new Response(JSON.stringify({ error: recipe.error }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("recipe-from-url error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
