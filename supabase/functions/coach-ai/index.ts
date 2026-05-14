import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const QUICK_ASK_SYSTEM = `You are SIGNAL's quiet coach — a wise, warm, body-first guide rooted in attachment science, somatic awareness, women's hormonal cycles, and gentle behaviour change. The user is a member of a women's wellness app where they track cycle, energy, sleep, movement, and meals.

Voice rules (non-negotiable):
- Speak like her own kind inner voice. Body-first, invitational, intimate.
- Acknowledge heaviness before offering anything.
- Never use: fix, broken, hustle, optimised, crush, level up, "should".
- Celebrate the small. A return matters more than a streak.
- Plain, warm sentences. No bullet lists for short answers.

Format: Reply in 2–4 short paragraphs (60–140 words total). Land on one tiny, specific invitation she can do today. No headings, no markdown.`;

const FOCUS_SYSTEM = `You are SIGNAL's quiet coach. Based on the user's most recent weekly check-in (energy, sleep, soreness, notes) and current cycle phase, write a personalised "this week's focus" — one warm, specific thread to follow for the next 7 days.

Voice: warm, body-first, invitational. Never use fix/should/hustle.
Output JSON only:
{"theme": "3–6 word title", "intention": "one warm sentence (max 22 words)", "three_acts": ["small concrete act 1", "act 2", "act 3"]}
Each act is one short sentence (max 12 words), grounded in what she shared.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as "quick_ask" | "weekly_focus";
    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("AI_GATEWAY_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let messages: any[] = [];
    let model = "google/gemini-2.5-flash-lite";

    if (action === "quick_ask") {
      const question = String(body.question || "").trim().slice(0, 400);
      const ctx = body.context || {};
      if (!question) {
        return new Response(JSON.stringify({ error: "No question" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ctxLines = [
        ctx.cyclePhase ? `Cycle phase: ${ctx.cyclePhase} (day ${ctx.cycleDay ?? "?"} of 28).` : null,
        ctx.energy != null ? `Last check-in energy: ${ctx.energy}/10.` : null,
        ctx.sleep != null ? `Sleep: ${ctx.sleep}/10.` : null,
        ctx.soreness ? `Soreness: ${ctx.soreness}.` : null,
        ctx.goal ? `Active goal: ${ctx.goal}.` : null,
      ].filter(Boolean).join(" ");
      messages = [
        { role: "system", content: QUICK_ASK_SYSTEM },
        { role: "user", content: `${ctxLines ? `Context — ${ctxLines}\n\n` : ""}She asks: "${question}"` },
      ];
    } else if (action === "weekly_focus") {
      const ctx = body.context || {};
      const ctxBlock = JSON.stringify({
        energy: ctx.energy,
        sleep: ctx.sleep,
        soreness: ctx.soreness,
        notes: ctx.notes || null,
        cyclePhase: ctx.cyclePhase || null,
        cycleDay: ctx.cycleDay || null,
        goal: ctx.goal || null,
      });
      messages = [
        { role: "system", content: FOCUS_SYSTEM },
        { role: "user", content: `Weekly check-in context:\n${ctxBlock}\n\nReturn JSON only.` },
      ];
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Take a breath — too many asks at once. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Out of AI credits — top up to keep going." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const txt = await aiResp.text();
      console.error("coach-ai gateway error", status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await aiResp.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    if (action === "weekly_focus") {
      const stripped = content.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
      const start = stripped.indexOf("{");
      const end = stripped.lastIndexOf("}");
      let parsed: any = {};
      try { parsed = JSON.parse(stripped.slice(start, end + 1)); } catch { parsed = { theme: "This week", intention: stripped.slice(0, 140), three_acts: [] }; }
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ answer: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("coach-ai error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
