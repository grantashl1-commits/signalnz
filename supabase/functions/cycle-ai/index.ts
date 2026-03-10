import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, messages, cycleDay, phase, phaseDescription, recentSymptoms, recentMoods, periodDueIn } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Build system prompt based on type
    let systemPrompt: string;
    let userMessage: string;

    if (type === "daily-signal") {
      systemPrompt = `You are a warm, knowledgeable women's health guide. You write one daily message for a woman tracking her menstrual cycle. Your tone is like a trusted friend who also happens to know a lot about hormones — warm, encouraging, evidence-based, never preachy.

You speak directly to her: 'you' not 'women'. You acknowledge what her body is doing today and why. You give one practical, specific suggestion. You remind her that her experience is normal and phase-appropriate when relevant.

You never diagnose. You never catastrophise. You always validate and then equip.

Keep it to 2–4 sentences. Warm and human. No bullet points. No headers. Just a message.

Return ONLY the message text. No JSON. No preamble.`;

      const parts = [`Today is cycle day ${cycleDay}. Current phase: ${phase}.`];
      if (phaseDescription) parts.push(`Phase description: ${phaseDescription}.`);
      if (recentSymptoms && recentSymptoms.length > 0) parts.push(`Recently logged symptoms: ${recentSymptoms.join(", ")}.`);
      if (recentMoods && recentMoods.length > 0) parts.push(`Recent mood: ${recentMoods.join(", ")}.`);
      if (periodDueIn !== undefined && periodDueIn <= 4) parts.push(`Period is due in approximately ${periodDueIn} days.`);
      if (cycleDay >= 1 && cycleDay <= 3) parts.push(`Period started ${cycleDay} days ago.`);
      parts.push("Write today's signal.");
      userMessage = parts.join(" ");

    } else if (type === "monthly-reflection") {
      systemPrompt = `You are a warm, knowledgeable women's health guide writing a brief monthly cycle reflection. Compare symptom patterns between cycles with warmth and encouragement. Keep it to 2-3 sentences. Evidence-based but conversational. No bullet points, no headers. Address her as 'you'.`;
      userMessage = messages?.[0]?.content || "Write a monthly reflection.";

    } else if (type === "cycle-coach") {
      systemPrompt = `You are a warm, knowledgeable women's health guide acting as a personal cycle coach. You answer questions about menstrual cycles, hormones, symptoms, and wellness with warmth, evidence-based knowledge, and practical advice. You speak directly to her as 'you'. You never diagnose. Keep answers concise (3-5 sentences) unless the question requires more detail. Be encouraging and validating.`;
      // For cycle coach, messages array contains the conversation
      const allMessages = [
        { role: "system", content: systemPrompt },
        ...(messages || []),
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: allMessages,
          stream: false,
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

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ message: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      throw new Error(`Unknown type: ${type}`);
    }

    // Non-streaming call for daily-signal and monthly-reflection
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
          { role: "user", content: userMessage },
        ],
        stream: false,
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ message: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("cycle-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
