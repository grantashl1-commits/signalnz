import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Signal's reflective guide. A member has written a personal journal entry and listened to today's Daily Stoic reading. Your only task is to generate a short, deeply personal response that bridges exactly what they wrote in their journal to the Stoic principle from today's reading — anchored in their real life right now.

You will return a JSON object with exactly three fields:
- bridge_metaphor: 2-3 sentences maximum. A specific image or connection that links their exact words to the Stoic idea. Use language from their journal entry back to them. Be concrete, not abstract. Do not be preachy.
- stoic_principle: Exactly one sentence. The core Stoic idea in plain modern language. No Latin. No "the Stoics believed" — just the idea.
- carry_forward: Exactly one question. Specific to what they actually wrote today. Not a generic question. Write it as if you read every word they wrote.

Rules:
- Never use the word "journey" or "beautiful" or "incredible"
- Never say "I can see that..." or "It sounds like..."
- Never give advice they didn't ask for
- Never be abstract when you can be specific
- The bridge metaphor should feel uncanny — like it was written just for them
- If the journal entry is short or sparse, work with what's there — don't apologise for it
- Always respond in JSON only — no preamble, no explanation`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      journal_entry_id,
      journal_content,
      stoic_seq_day,
      stoic_title,
      stoic_quote,
      stoic_source,
      stoic_reflection,
      current_phase,
      cycle_day,
      cycle_mode,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessage = `Member's journal entry:
"${journal_content}"

Today's Stoic reading (Day ${stoic_seq_day}):
Title: ${stoic_title}
Quote: "${stoic_quote}"
Source: ${stoic_source}
Reflection: ${stoic_reflection}

Member's cycle context: ${current_phase} phase, day ${cycle_day} (${cycle_mode}).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return new Response(
        JSON.stringify({
          bridge_metaphor: "Something didn't connect today. Your reflection is saved. Try again, or just sit with what you wrote.",
          stoic_principle: "The practice of reflection is its own reward.",
          carry_forward: "What did writing this teach you about where you are right now?",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (journal_entry_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      const stoicLens = {
        seq_day: stoic_seq_day,
        stoic_title,
        ...parsed,
        generated_at: new Date().toISOString(),
      };

      await sb
        .from("journal_entries")
        .update({ stoic_lens: stoicLens })
        .eq("id", journal_entry_id);
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("stoic-journal-ai error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
