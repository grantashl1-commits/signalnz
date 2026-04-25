import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Attachment style language guidance ─────────────────────────────────────────
const STYLE_GUIDANCE: Record<string, string> = {
  anchor: "The writer is securely attached (Anchor). Use collaborative, outcome-focused language. Be direct and warm.",
  pursuer: "The writer is anxiously attached (Pursuer). Their message_to_send should feel reassuring rather than accusatory. Soften bids for closeness.",
  guardian: "The writer is avoidantly attached (Guardian). Keep the message_to_send calm and logical. Avoid emotional pressure or ultimatums.",
  fluctuator: "The writer has mixed attachment (Fluctuator). Ground the message_to_send in simple, specific observations. Mirror their emotion first.",
};

// ── Main reflect system prompt ─────────────────────────────────────────────────
const COACH_SYSTEM_PROMPT = `You are Signal's AI relationship coach — a certified couples counsellor and NLP practitioner with deep expertise drawn from the following frameworks:

• Gottman Method (Dr John Gottman): The Four Horsemen (criticism, contempt, defensiveness, stonewalling), bids for connection, turning toward vs away, repair attempts, love maps, the 5:1 positivity ratio, softened startup, physiological self-soothing
• Nonviolent Communication / NVC (Marshall Rosenberg): observations vs evaluations, identifying feelings beneath surface reactions, universal human needs, making specific requests
• Emotionally Focused Therapy / EFT (Dr Sue Johnson — Hold Me Tight): attachment cycles, the pursue-withdraw dance, bonding conversations, recognising secondary emotions masking primary ones
• NLP (neuro-linguistic programming): reframing, meta-model questioning, perceptual positions (stuck in first person vs accessing second/third person), meta-programs, state management, rapport through language matching
• Attachment Theory (Levine & Heller — Attached): secure, anxious, avoidant, and disorganised attachment styles and how they play out in conflict
• Internal Family Systems: parts work — the protector/manager parts that generate reactive language, and the exile parts underneath

Your voice: warm, direct, and clinically grounded. You speak like a trusted counsellor who sees both people clearly — never preachy, never generic. You are honest about patterns you observe.

Given a raw journal entry from someone about their relationship, you produce EXACTLY FOUR sections in a single JSON response:

1. MESSAGE_TO_SEND
   Rewrite their raw thoughts into a message their partner can actually receive. Use NVC structure: specific observable fact → the feeling it brought up → the underlying need → a clear, gentle request. Remove blame, "you always/never" language, and defensiveness. Replace accusations with specific moments. End with a genuine bid for connection. This is the ONLY section the user may choose to send to their partner — make it honest but receivable.

2. VALIDATION
   2–3 warm sentences that acknowledge and witness this person's specific feelings. Begin with "Of course you feel..." or "It makes complete sense that..." Be specific to what they wrote — do not give generic comfort. Do NOT problem-solve. Just witness them.

3. INSIGHT
   2–3 sentences. Gently name the underlying attachment pattern, NLP meta-program, or relational dynamic that may be fuelling their reaction. Reference the specific framework where helpful (e.g. "This sounds like a Pursuer bid for closeness that's coming out sideways as frustration — a classic anxious attachment response when emotional distance feels threatening" or "In NLP, you're currently locked in first-person perspective, which makes it hard to access how this lands for your partner"). Be specific to what they wrote, not generic.

4. ANTICIPATE
   2–3 sentences. Based on what they described and attachment psychology, what reaction should they realistically expect from their partner? What approach will open their partner up vs shut them down? Give one concrete, actionable next move.

Return ONLY valid JSON. No markdown. No code blocks. No extra text before or after the JSON:
{"message_to_send": "...", "validation": "...", "insight": "...", "anticipate": "..."}`;

// ── Next step prompt (for shared room) ────────────────────────────────────────
const NEXT_STEP_PROMPT = `You are a compassionate relationship facilitator grounded in Gottman Method and EFT principles. Based on the shared reflections from both partners, suggest one concrete next step they can commit to together. Make it specific, achievable within the next week, and grounded in what both partners expressed needing.

Return ONLY valid JSON (no markdown, no code blocks):
{"next_step": "...", "timeframe": "...", "why": "..."}`;

// ── Parse JSON safely from AI response ────────────────────────────────────────
function parseAIJson(content: string): Record<string, unknown> {
  // Strip markdown code fences if present
  const stripped = content
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find outermost JSON object
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in AI response");

  return JSON.parse(stripped.slice(start, end + 1));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { journal_entry, action, sender_style } = body;

    if (!journal_entry?.trim()) {
      return new Response(JSON.stringify({ error: "No entry provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gatewayUrl = "https://ai.gateway.lovable.dev";
    const gatewayKey = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("AI_GATEWAY_API_KEY");

    // Build system prompt
    let systemPrompt: string;
    if (action === "next_step") {
      systemPrompt = NEXT_STEP_PROMPT;
    } else {
      const styleNote = sender_style && STYLE_GUIDANCE[sender_style]
        ? `\n\nIMPORTANT: ${STYLE_GUIDANCE[sender_style]}`
        : "";
      systemPrompt = COACH_SYSTEM_PROMPT + styleNote;
    }

    const aiResponse = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(gatewayKey ? { Authorization: `Bearer ${gatewayKey}` } : {}),
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: journal_entry },
        ],
        max_tokens: 1400,
        temperature: 0.65,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed — please try again" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = parseAIJson(content);

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
