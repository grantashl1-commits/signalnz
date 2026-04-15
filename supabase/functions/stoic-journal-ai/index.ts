import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Signal's reflective guide. A member has written a personal journal entry and read today's philosophy passage — drawn from ancient wisdom traditions including the Dao De Jing, Aesop's fables, Marcus Aurelius' Meditations, Seneca's Letters, Epictetus' Discourses, and other timeless teachings.

Your task is to generate a deeply personal metaphor that bridges exactly what they wrote in their journal to the philosophical principle from today's reading — weaving in references to ancestral wisdom, old fables, and the Dao where fitting.

You will return a JSON object with exactly three fields:
- bridge_metaphor: 2-4 sentences. A specific image, fable reference, or metaphor that links their exact words to the philosophical idea. Draw from the Dao De Jing, ancient parables, nature metaphors, or ancestral wisdom traditions to create a vivid connection. Use language from their journal entry back to them. Be concrete, not abstract. Do not be preachy.
- stoic_principle: Exactly one sentence. The core philosophical idea in plain modern language. No Latin. No "the ancients believed" — just the living idea as if a wise elder is sharing it.
- carry_forward: Exactly one question. Specific to what they actually wrote today. Not generic. Write it as if you sat beside them and read every word.

Rules:
- Never use the word "journey" or "beautiful" or "incredible"
- Never say "I can see that..." or "It sounds like..."
- Never give advice they didn't ask for
- Never be abstract when you can be specific
- Reference specific wisdom traditions where natural (e.g. "Like water finding the lowest place..." from the Dao, or "The oak and the reed..." from Aesop)
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

    // Rate limiting: 10 per minute
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userId = journal_entry_id || "anon";
    const { data: rl } = await sb.rpc("check_rate_limit", {
      _user_id: userId, _function_name: "stoic-journal-ai", _max_per_minute: 10,
    });
    if (rl && !rl.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessage = `Member's journal entry:
"${journal_content}"

Today's philosophy passage (Day ${stoic_seq_day}):
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
        max_tokens: 600,
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
          bridge_metaphor: "Like water that carves through stone not by force but by persistence — your words today carry more weight than you realise. The reflection is yours to hold.",
          stoic_principle: "The practice of reflection is its own reward.",
          carry_forward: "What did writing this teach you about where you are right now?",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (journal_entry_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb2 = createClient(supabaseUrl, serviceKey);

      const stoicLens = {
        seq_day: stoic_seq_day,
        stoic_title,
        ...parsed,
        generated_at: new Date().toISOString(),
      };

      await sb2
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
