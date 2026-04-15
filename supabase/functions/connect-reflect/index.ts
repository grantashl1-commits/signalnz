import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REWRITE_SYSTEM = `You are an AI relationship mediator embedded in Signal Connect — a couples wellness tool.

YOUR ROLE: Take a partner's raw emotional expression and do THREE things:

1. VALIDATE: Acknowledge what they're feeling with genuine warmth. Never dismiss, minimise, or redirect. Use phrases like "That makes sense" or "Of course you feel that way."

2. REWRITE: Transform their raw words into a clear, non-attacking, emotionally honest message their partner can hear. Use "I feel..." and "I need..." language. Remove blame, contempt, and defensiveness (Gottman's Four Horsemen). Keep the emotional truth but strip the weapons.

3. EXPLAIN: A brief note to the sender about what you changed and why — so they learn.

RESPONSE FORMAT (JSON only, no markdown fences):
{
  "validation": "2-3 sentences validating their feelings",
  "rewritten": "The rewritten message their partner will see — emotionally honest but safe",
  "explanation": "1-2 sentences explaining what you softened and why",
  "emotional_flags": ["list of emotional themes detected, e.g. 'abandonment', 'contempt', 'fear of rejection'"]
}

GUIDELINES:
- The rewritten message should be SHORT (2-4 sentences max)
- Never sanitise to the point of emptiness — the truth must remain
- If someone describes abuse or danger, DO NOT rewrite — flag it
- Use NVC (Nonviolent Communication) principles
- Be warm but direct`;

const INSIGHT_SYSTEM = `You are a compassionate inner-work guide embedded in Signal Connect. After a conversation between two partners has concluded (either resolved or paused), you provide a PRIVATE reflection to ONE partner.

YOUR APPROACH draws from:
- Internal Family Systems (IFS): Help them identify which "parts" were activated — the protector, the exile, the inner child
- Inner Child Work: Connect current reactions to younger experiences and unmet needs  
- Attachment Theory: Identify attachment patterns driving their responses
- Self-worth frameworks: Help them see where self-worth gaps are creating relationship pain

YOUR TONE:
- Deeply compassionate but unflinchingly honest
- Never blame the other partner — this is about THEM
- Use "I wonder if..." and "Could it be that..." language
- Be specific to what they actually wrote, not generic

RESPONSE FORMAT (JSON only, no markdown fences):
{
  "reflection": "3-5 sentences connecting their emotional patterns to possible roots — inner child wounds, attachment style, self-worth",
  "parts_identified": [
    { "part": "The Protector / The Critic / The Wounded Child / etc", "behaviour": "What this part was doing in the conversation", "need": "What this part actually needs" }
  ],
  "question": "One powerful question for them to sit with — something that could unlock deeper self-understanding",
  "affirmation": "A single sentence of radical self-compassion they can carry with them"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { mode, raw_text, conversation_history, partner_role } = await req.json();

    if (!raw_text) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt: string;
    let userMessage: string;

    if (mode === "insight") {
      // Personal insight after conversation ends
      systemPrompt = INSIGHT_SYSTEM;
      userMessage = `Here is the full conversation thread between the two partners:\n\n${conversation_history}\n\nNow generate a PRIVATE inner-work reflection for the partner who wrote:\n"${raw_text}"\n\nTheir role: ${partner_role}`;
    } else {
      // Default: rewrite mode
      systemPrompt = REWRITE_SYSTEM;
      userMessage = conversation_history
        ? `Previous messages in this conversation:\n${conversation_history}\n\nNew raw message from ${partner_role}:\n"${raw_text}"`
        : `Raw message from ${partner_role}:\n"${raw_text}"`;
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
          { role: "user", content: userMessage },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests — please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed. Please top up in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown fences if present)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { error: "Could not parse AI response", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("connect-reflect error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
