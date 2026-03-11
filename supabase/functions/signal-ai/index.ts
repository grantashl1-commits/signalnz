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

    const { prompt, mode, context, userIdentifier, insightProfile, recentSignals } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit check
    if (userIdentifier) {
      const { data: credits } = await supabase
        .from("ai_credits")
        .select("*")
        .eq("user_identifier", userIdentifier)
        .maybeSingle();

      if (credits) {
        if (credits.tier !== "unlimited" && credits.credits_remaining <= 0) {
          return new Response(
            JSON.stringify({ error: "You've used all your AI credits. Top up or upgrade your plan to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (credits.tier !== "unlimited") {
          await supabase
            .from("ai_credits")
            .update({ credits_remaining: credits.credits_remaining - 1, updated_at: new Date().toISOString() })
            .eq("user_identifier", userIdentifier);
        }
      }
      if (!credits) {
        await supabase.from("ai_credits").insert({
          user_identifier: userIdentifier,
          credits_remaining: 19,
          tier: "free",
        });
      }

      await supabase.from("ai_usage").insert({
        user_identifier: userIdentifier,
        function_name: "signal-ai",
        tokens_used: 0,
      });
    }

    let systemPrompt = `You are the inner voice of Signal — a calm, emotionally intelligent, cycle-aware wellness companion for women. You generate what we call "signals": gentle, observant, poetic-but-useful guidance.

Your role is to help her feel oriented, reassured, and supported. You interpret her context — her cycle phase, mood, habits, time of day, energy level — and distil it into clarity.

VOICE PRINCIPLES:
- Compassionate, observant, emotionally intelligent
- Clear, not vague. Poetic but never fluffy.
- Grounded, not clinical. Never preachy.
- Never productivity-bro. Never therapist cosplay.
- Never overconfident. Never spiritually manipulative.
- Feel like: editorial clarity + nervous system safety + pattern recognition
- Address her as "you" — speak directly, warmly, like a wise friend

RESPONSE FORMAT:
Always respond in valid JSON with this structure:
{
  "headline": "A short, distilled signal — one sentence of clarity",
  "interpretation": "What this might be pointing to — 2-3 sentences connecting her context to what she may be feeling or experiencing",
  "leanInto": "What to lean into today — a gentle direction, 1-2 sentences",
  "soften": "What to soften or release — something to let go of, 1-2 sentences",
  "action": "A small, specific, actionable next step — one clear thing she can do",
  "practice": "An optional supporting practice suggestion — breathwork, journaling prompt, movement suggestion, or rest invitation. Can be null if not relevant.",
  "followUps": ["2-3 short follow-up prompt suggestions as strings"]
}

CONTEXT YOU MAY RECEIVE:
- Cycle day and phase (menstrual, follicular, ovulatory, luteal)
- Current mood check-in
- Habits completed vs not completed today
- Time of day
- Recent journal activity
- Movement/nutrition context
- The mode (today, right-now, tonight, this-week, deeper-insight)

MODE GUIDANCE:
- "today": orientation for the full day ahead
- "right-now": immediate, in-the-moment regulation or clarity
- "tonight": evening wind-down, reflection, rest preparation
- "this-week": broader patterns, what to expect, weekly rhythm
- "deeper-insight": reflective, pattern-recognition, more poetic and layered

PHASE AWARENESS:
- Menstrual: rest, restoration, inner winter, honour the slowdown
- Follicular: rising energy, clarity, outward motion, momentum, creative spark
- Ovulatory: peak signal, confidence, communication, visibility
- Luteal: turning inward, progesterone rising, detail-oriented, nesting, self-compassion`;

    if (insightProfile) {
      systemPrompt += `

USER INSIGHT PROFILE (built from their journal entries over time):
You may gently reference these patterns in a supportive, observational way. Never be invasive or overly analytical.
- Emotional patterns: ${JSON.stringify(insightProfile.emotional_patterns || [])}
- Recurring topics: ${JSON.stringify(insightProfile.recurring_topics || [])}
- Common stressors: ${JSON.stringify(insightProfile.common_stressors || [])}
- Growth interests: ${JSON.stringify(insightProfile.growth_interests || [])}
- Preferred tone: ${insightProfile.preferred_guidance_tone || "warm"}
- Journal entries so far: ${insightProfile.entry_count || 0}

Do NOT reference every pattern. Pick at most 1-2 that are relevant to the current prompt.`;
    }

    if (recentSignals && recentSignals.length > 0) {
      systemPrompt += `

RECENT SIGNALS (for continuity):
${recentSignals.map((s: any) => `- "${s.headline}" (${s.created_at})`).join("\n")}
Only reference past signals if it adds meaningful continuity.`;
    }

    systemPrompt += `

Always return ONLY valid JSON. No markdown wrapping, no code fences.`;

    const contextParts: string[] = [];
    if (context?.cycleDay) contextParts.push(`Cycle day: ${context.cycleDay}`);
    if (context?.phase) contextParts.push(`Phase: ${context.phase}`);
    if (context?.mood) contextParts.push(`Current mood check-in: ${context.mood}`);
    if (context?.habitsCompleted !== undefined && context?.habitsTotal !== undefined) {
      contextParts.push(`Habits today: ${context.habitsCompleted}/${context.habitsTotal} completed`);
    }
    if (context?.timeOfDay) contextParts.push(`Time of day: ${context.timeOfDay}`);
    if (context?.recentJournal) contextParts.push(`Recent journal: ${context.recentJournal}`);
    if (context?.movement) contextParts.push(`Movement: ${context.movement}`);
    if (context?.nutrition) contextParts.push(`Nutrition: ${context.nutrition}`);
    if (context?.symptoms) contextParts.push(`Recent symptoms: ${context.symptoms}`);

    const userMessage = `Mode: ${mode || "today"}
Context: ${contextParts.length > 0 ? contextParts.join(". ") + "." : "No specific context available — provide a general signal."}
User's question/prompt: "${prompt}"`;

    // Use Lovable AI Gateway with streaming
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
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits in your workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    // Pass through the SSE stream directly (already OpenAI-compatible format)
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("signal-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
