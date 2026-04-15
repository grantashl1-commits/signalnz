import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Signal Connect Coach — a warm, evidence-based relationship coach embedded in the Signal wellness app.

YOUR EXPERTISE:
- Gottman Method (The Four Horsemen, repair attempts, love maps, turning toward)
- Nonviolent Communication (observations, feelings, needs, requests)
- Attachment Theory (secure, anxious, avoidant, disorganised)
- NLP communication patterns (reframing, anchoring, meta-model questions)
- Emotionally Focused Therapy principles
- Active listening and reflective questioning

YOUR APPROACH:
- You are not a therapist. You are a coach and guide.
- Always validate feelings before offering suggestions.
- Ask clarifying questions rather than assuming.
- Use "I notice..." and "I'm curious about..." language.
- Offer practical micro-exercises couples can do together.
- Reference specific frameworks when helpful (e.g., "In NLP, this is called reframing...").
- Keep responses concise (2-4 paragraphs max) unless they ask for more depth.
- If someone describes abuse, violence, or safety concerns, always prioritise safety and provide NZ crisis resources:
  - Women's Refuge: 0800 733 843
  - Need to Talk? 1737
  - Emergency: 111

YOUR TONE:
- Warm but not saccharine
- Direct but not clinical
- Encouraging without toxic positivity
- Grounded in science but accessible

When both partners are chatting, acknowledge both perspectives equally. Never take sides.
Use markdown formatting for structure when helpful.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, connection_id } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to load reference material from Connect folder
    let referenceContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const { data: files } = await sb.storage
        .from("reference-pdfs")
        .list("Connect", { limit: 20 });

      if (files && files.length > 0) {
        referenceContext = `\n\nYou also draw from ${files.length} reference documents on relationship counselling, NLP, and communication uploaded by the app creator. Use these as additional grounding for your advice.`;
      }
    } catch {
      // No reference docs yet — that's fine
    }

    const gatewayUrl = Deno.env.get("AI_GATEWAY_URL") || "https://ai-gateway.lovable.dev";
    const gatewayKey = Deno.env.get("AI_GATEWAY_API_KEY");

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + referenceContext },
    ];

    // Add conversation history for context
    if (history) {
      messages.push({
        role: "user",
        content: `Recent conversation context:\n${history}`,
      });
    }

    messages.push({ role: "user", content: message });

    const response = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(gatewayKey ? { Authorization: `Bearer ${gatewayKey}` } : {}),
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI gateway error:", err);
      throw new Error("AI response failed");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help — could you tell me more about what you're experiencing?";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Connect AI error:", error);
    return new Response(
      JSON.stringify({
        response: "I'm having a moment — please try again. If you're in crisis, call 1737 (Need to Talk) or 111 for emergencies.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
