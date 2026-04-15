import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STYLE_GUIDANCE: Record<string, string> = {
  anchor: "The recipient is an Anchor (securely attached). Use outcome-focused, collaborative language. Be direct but warm.",
  pursuer: "The recipient is a Pursuer (anxiously attached). Start with validation and reassurance. Avoid anything that sounds like criticism. Use rapport-first language.",
  guardian: "The recipient is a Guardian (avoidantly attached). Use calm, logical framing. Avoid emotional pressure. Keep it concise. Respect their pace.",
  fluctuator: "The recipient is a Fluctuator (mixed attachment). Use grounding, simple language. Mirror the emotion first, then gently shift.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { journal_entry, mode, action, sender_style, recipient_style } = await req.json();

    if (!journal_entry?.trim()) {
      return new Response(JSON.stringify({ error: "No entry provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gatewayUrl = Deno.env.get("AI_GATEWAY_URL") || "https://ai-gateway.lovable.dev";
    const gatewayKey = Deno.env.get("AI_GATEWAY_API_KEY");

    let systemPrompt: string;
    let userPrompt: string = journal_entry;

    if (action === "next_step") {
      systemPrompt = `You are a compassionate relationship facilitator. Based on the shared reflections and partner responses, suggest one concrete next step this couple can commit to. Also include a brief "why" explaining the reasoning.
Return ONLY valid JSON: {"next_step": string, "timeframe": string, "why": string}`;
    } else if (action === "reframe") {
      const modeCtx = mode === "family"
        ? "This is a parent-teen relationship. Focus on respect, autonomy, and generational understanding."
        : "This is a romantic partnership.";
      const senderCtx = sender_style && STYLE_GUIDANCE[sender_style] ? `\nAbout the sender: ${STYLE_GUIDANCE[sender_style]}` : "";
      const recipientCtx = recipient_style && STYLE_GUIDANCE[recipient_style] ? `\nAbout the recipient: ${STYLE_GUIDANCE[recipient_style]}` : "";

      systemPrompt = `You are a compassionate communication translator for couples. ${modeCtx}${senderCtx}${recipientCtx}

The user wrote raw thoughts. Reframe them into a gentler version their partner can receive.
- Keep the core meaning and emotion intact
- Soften accusations into observations
- Replace "you always/never" with specific moments
- Add acknowledgement of the partner's perspective
- The tone should feel like a letter, not a complaint

Return ONLY valid JSON:
{"what_happened": string, "how_i_felt": string, "what_i_need": string, "what_i_want_to_say": string, "reframe_note": string}`;
    } else {
      // Default: organise/reflect
      const modeContext = mode === "family"
        ? "The user is reflecting on a parent-teen relationship."
        : "The user is reflecting on a romantic partnership.";
      const styleCtx = sender_style && STYLE_GUIDANCE[sender_style]
        ? `\nThe writer's love style: ${STYLE_GUIDANCE[sender_style]} Tailor the organisation to gently highlight their patterns.`
        : "";

      systemPrompt = `You are a compassionate reflection assistant. ${modeContext}${styleCtx} Structure the journal entry into four categories. Use warm, gentle language. Return ONLY valid JSON: {"what_happened": string, "how_i_felt": string, "what_i_need": string, "what_i_want_to_say": string}`;
    }

    const response = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(gatewayKey ? { Authorization: `Bearer ${gatewayKey}` } : {}),
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI gateway error:", response.status, err);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    // Extract JSON from potentially markdown-wrapped response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    return new Response(JSON.stringify(result), {
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
