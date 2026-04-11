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

    const { prompt, mode, context, userIdentifier, insightProfile, recentSignals, isAMA, userData } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tiered credit cost: AMA=2, Signal=1
    const creditCost = isAMA ? 2 : 1;

    if (userIdentifier) {
      const { data: credits } = await supabase
        .from("ai_credits")
        .select("*")
        .eq("user_identifier", userIdentifier)
        .maybeSingle();

      if (credits) {
        if ((credits.credits_remaining || 0) < creditCost) {
          return new Response(
            JSON.stringify({ error: `You need ${creditCost} AI credits for this feature. Top up or upgrade your plan to continue.` }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (credits.tier !== "unlimited") {
          await supabase
            .from("ai_credits")
            .update({ credits_remaining: (credits.credits_remaining || 0) - creditCost, updated_at: new Date().toISOString() })
            .eq("user_identifier", userIdentifier);
        }
      }
      if (!credits) {
        await supabase.from("ai_credits").insert({
          user_identifier: userIdentifier,
          credits_remaining: 5 - creditCost,
          tier: "free",
        });
      }

      await supabase.from("ai_usage").insert({
        user_identifier: userIdentifier,
        function_name: isAMA ? "signal-ama" : "signal-ai",
        tokens_used: creditCost,
      });
    }

    let systemPrompt: string;

    if (isAMA) {
      // ── AMA (Ask Me Anything) Mode ──
      systemPrompt = `You are the personal health intelligence behind Signal — a cycle-aware wellness app for women in New Zealand.

The user is asking you a specific health question. You have access to their COMPLETE personal data history below. Use it to give an answer that is UNCANNILY specific to them — not generic health advice.

YOUR APPROACH:
- Answer their exact question directly and specifically
- Reference their actual data (cycle phase, habits, journal entries, supplements, diet) where relevant
- Suggest concrete next steps they can take within the app (add a habit, try a recipe, adjust supplements)
- Be warm, clear, and practical — not preachy or clinical
- If the question is medical, remind them to consult their GP but still provide evidence-based guidance
- Use NZ-specific references where relevant (NZ brands, NZ foods, local availability)

RESPONSE FORMAT:
Return valid JSON with this structure:
{
  "answer": "Your direct, specific answer to their question — 3-6 sentences, clear and actionable",
  "insights": ["2-3 short bullet points connecting their data to the answer"],
  "recommendations": [
    { "type": "habit|supplement|recipe|practice", "name": "Name", "reason": "Why this specifically for them" }
  ],
  "followUps": ["2-3 natural follow-up questions they might want to ask"]
}`;

      // Append user data context
      if (userData) {
        systemPrompt += `\n\nUSER DATA:\n`;
        if (userData.profile) {
          systemPrompt += `- Age: ${userData.profile.age || "unknown"}\n`;
          systemPrompt += `- Cycle mode: ${userData.profile.cycleMode || "cycling"}\n`;
          systemPrompt += `- Fitness level: ${userData.profile.fitnessLevel || "unknown"}\n`;
          systemPrompt += `- Dietary preferences: ${JSON.stringify(userData.profile.dietaryPreferences || [])}\n`;
          systemPrompt += `- Dietary dislikes: ${JSON.stringify(userData.profile.dietaryDislikes || [])}\n`;
          systemPrompt += `- Weight: ${userData.profile.weightKg || "unknown"}kg\n`;
          systemPrompt += `- Height: ${userData.profile.heightCm || "unknown"}cm\n`;
          systemPrompt += `- Movement goals: ${JSON.stringify(userData.profile.movementGoals || [])}\n`;
        }
        if (userData.cycleContext) {
          systemPrompt += `- Current cycle day: ${userData.cycleContext.cycleDay}\n`;
          systemPrompt += `- Current phase: ${userData.cycleContext.phase}\n`;
          if (userData.cycleContext.mood) systemPrompt += `- Current mood: ${userData.cycleContext.mood}\n`;
          if (userData.cycleContext.symptoms) systemPrompt += `- Recent symptoms: ${userData.cycleContext.symptoms}\n`;
        }
        if (userData.habits && userData.habits.length > 0) {
          systemPrompt += `- Active habits: ${userData.habits.join(", ")}\n`;
        }
        if (userData.supplements && userData.supplements.length > 0) {
          systemPrompt += `- Current supplements: ${userData.supplements.join(", ")}\n`;
        }
        if (userData.recentJournalEntries && userData.recentJournalEntries.length > 0) {
          systemPrompt += `\nRECENT JOURNAL ENTRIES:\n`;
          for (const entry of userData.recentJournalEntries.slice(0, 5)) {
            systemPrompt += `- ${entry.date}: ${entry.mood || ""} — ${(entry.content || "").slice(0, 200)}\n`;
          }
        }
        if (userData.recentCycleLogs && userData.recentCycleLogs.length > 0) {
          systemPrompt += `\nRECENT CYCLE LOGS:\n`;
          for (const log of userData.recentCycleLogs.slice(0, 7)) {
            systemPrompt += `- Day ${log.cycle_day} (${log.phase}): mood=${log.mood || "?"}, energy=${log.energy || "?"}, symptoms=${(log.symptoms || []).join(",") || "none"}\n`;
          }
        }
      }

      systemPrompt += `\nAlways return ONLY valid JSON. No markdown wrapping, no code fences.`;
    } else {
      // ── Standard Signal Mode ──
      systemPrompt = `You are the inner voice of Signal — a calm, emotionally intelligent, cycle-aware wellness companion for women. You generate what we call "signals": gentle, observant, poetic-but-useful guidance.

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
    }

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

    const userMessage = isAMA
      ? `Question: "${prompt}"`
      : `Mode: ${mode || "today"}
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
