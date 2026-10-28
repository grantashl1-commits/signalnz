import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";
import { deepseekChat } from "../_shared/ai.ts";

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
  // Only signed-in members may call this (it uses the service role or paid AI).
  const caller = await requireUser(req, corsHeaders);
  if (caller instanceof Response) return caller;

  try {
    const { message, history } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting: 10 per minute, per member
    {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: rl } = await sb.rpc("check_rate_limit", {
        _user_id: caller.user.id, _function_name: "connect-ai", _max_per_minute: 10,
      });
      if (rl && !rl.allowed) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    const aiResponse = (await deepseekChat(messages, { maxTokens: 800, temperature: 0.7 })) || "I'm here to help — could you tell me more about what you're experiencing?";

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
