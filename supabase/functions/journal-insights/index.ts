import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { entry, analysis, userIdentifier } = await req.json();

    if (!entry || !userIdentifier) {
      return new Response(
        JSON.stringify({ error: "Missing entry or userIdentifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit check: journal insights costs 1 credit
    const cost = 1;
    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_identifier", userIdentifier).maybeSingle();
    if (credits && credits.tier !== "unlimited" && (credits.credits_remaining || 0) < cost) {
      return new Response(JSON.stringify({ error: `You need ${cost} AI credit for journal insights. Top up or upgrade.` }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (credits && credits.tier !== "unlimited") {
      await supabase.from("ai_credits").update({ credits_remaining: (credits.credits_remaining || 0) - cost, updated_at: new Date().toISOString() }).eq("user_identifier", userIdentifier);
    } else if (!credits) {
      await supabase.from("ai_credits").insert({ user_identifier: userIdentifier, credits_remaining: 5 - cost, tier: "free" });
    }
    await supabase.from("ai_usage").insert({ user_identifier: userIdentifier, function_name: "journal-insights", tokens_used: cost });

    // Fetch existing profile
    const { data: existingProfile } = await supabase
      .from("user_insight_profiles")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .maybeSingle();

    const existingContext = existingProfile
      ? `Existing profile:
- Emotional patterns: ${JSON.stringify(existingProfile.emotional_patterns)}
- Recurring topics: ${JSON.stringify(existingProfile.recurring_topics)}
- Common stressors: ${JSON.stringify(existingProfile.common_stressors)}
- Growth interests: ${JSON.stringify(existingProfile.growth_interests)}
- Entry count: ${existingProfile.entry_count}
- Recommended resources: ${JSON.stringify(existingProfile.recommended_resources)}`
      : "No existing profile — this is a new user.";

    const systemPrompt = `You are an insight extraction engine for a women's wellness app called Signal. Your role is to analyse journal entries and build a psychological profile over time.

Given a journal entry and optional AI analysis, extract and MERGE the following into the user's existing profile:

1. emotional_patterns — recurring emotions (e.g., ["overwhelm", "gratitude", "anxiety around work"])
2. recurring_topics — themes that appear across entries (e.g., ["boundaries", "self-worth", "career change"])
3. common_stressors — specific stress triggers (e.g., ["work deadlines", "relationship conflict", "sleep issues"])
4. growth_interests — areas they seem to be exploring or growing in (e.g., ["mindfulness", "self-compassion", "creativity"])
5. preferred_guidance_tone — inferred preferred tone: "warm", "direct", "poetic", or "gentle"
6. recommended_resources — if any topic appears 3+ times, suggest 1-2 relevant books or concepts. Format: [{"title": "...", "author": "...", "reason": "..."}]

IMPORTANT RULES:
- MERGE with existing data, don't replace. Add new patterns, increment frequency.
- Keep each array to max 10 items, prioritise by frequency/recency.
- Be observational, never diagnostic. This is pattern recognition, not therapy.
- Return ONLY valid JSON.

Response format:
{
  "emotional_patterns": ["..."],
  "recurring_topics": ["..."],
  "common_stressors": ["..."],
  "growth_interests": ["..."],
  "preferred_guidance_tone": "warm",
  "recommended_resources": [{"title": "...", "author": "...", "reason": "..."}]
}`;

    const entryText = typeof entry === "string"
      ? entry
      : Object.values(entry.prompts || {}).join("\n") || entry.title || "";

    const userMessage = `${existingContext}

New journal entry:
"${entryText}"

${analysis ? `AI analysis of this entry: ${JSON.stringify(analysis)}` : ""}

Extract insights and merge with existing profile.`;

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
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini error:", response.status, t);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Strip code fences
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const insights = JSON.parse(content);

    // Upsert profile
    const newEntryCount = (existingProfile?.entry_count || 0) + 1;

    await supabase.from("user_insight_profiles").upsert({
      user_identifier: userIdentifier,
      emotional_patterns: insights.emotional_patterns || [],
      recurring_topics: insights.recurring_topics || [],
      common_stressors: insights.common_stressors || [],
      growth_interests: insights.growth_interests || [],
      preferred_guidance_tone: insights.preferred_guidance_tone || "warm",
      recommended_resources: insights.recommended_resources || [],
      entry_count: newEntryCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_identifier" });

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("journal-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
