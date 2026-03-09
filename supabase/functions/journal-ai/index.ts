import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entry, recentEntries } = await req.json();

    const history = (recentEntries || [])
      .slice(0, 5)
      .map((e: any) => `Date: ${e.date}\nMood: ${e.tracking?.mood}/10, Energy: ${e.tracking?.energy}/10\nProud: ${e.prompts?.proud || "—"}\nFeeling: ${e.prompts?.feeling || "—"}\nChallenge: ${e.prompts?.challenge || "—"}\nDesire: ${e.prompts?.desire || "—"}`)
      .join("\n\n---\n\n");

    const PROMPTS = [
      { key: "proud", label: "Today I was proud of…" },
      { key: "feeling", label: "Today I felt…" },
      { key: "grateful", label: "Today I was grateful for…" },
      { key: "working_towards", label: "Right now I am working towards…" },
      { key: "challenge", label: "Today didn't go well when…" },
      { key: "body", label: "In my body today I noticed…" },
      { key: "inner_voice", label: "My inner voice said today…" },
      { key: "desire", label: "Something I secretly want…" },
      { key: "tomorrow", label: "Tomorrow I will…" },
      { key: "free", label: "Anything on my mind…" },
    ];

    const current = PROMPTS.map(
      (p) => `${p.label}\n${entry.prompts?.[p.key] || "(not answered)"}`
    ).join("\n\n");

    const prompt = `You are a compassionate therapist and wellness coach trained in IFS (Internal Family Systems), NLP, somatic therapy and trauma-informed care. Your tone is warm, insightful and non-judgmental.

Analyse this journal entry and return ONLY valid JSON — no markdown, no preamble, no backticks.

CURRENT ENTRY — ${entry.date}
Mood: ${entry.tracking?.mood}/10 | Energy: ${entry.tracking?.energy}/10 | Sleep: ${entry.tracking?.sleep}hrs | Water: ${entry.tracking?.water} glasses

${current}

RECENT HISTORY:
${history || "No prior entries yet."}

Return exactly this JSON:
{
  "summary": "2–3 sentence compassionate summary of today",
  "themes": ["theme1","theme2","theme3"],
  "emotions": ["emotion1","emotion2"],
  "ifs_insight": "1–2 sentences identifying IFS parts, protectors or exiles present",
  "patterns": ["pattern observed across entries or standalone insight"],
  "unspoken_desires": "What this person seems to want but hasn't fully claimed — stated gently",
  "strengths": ["genuine strength shown today"],
  "recommendations": [
    {"type":"book","title":"Title by Author","reason":"personalised reason"},
    {"type":"podcast","title":"Podcast + episode","reason":"personalised reason"},
    {"type":"practice","title":"Therapy, workshop or practice","reason":"personalised reason"}
  ],
  "next_steps": ["compassionate action 1","action 2"],
  "affirmation": "A personalised affirmation written just for this person",
  "tags": ["tag1","tag2","tag3","tag4"]
}`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleaned);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Journal AI error:", error);
    return new Response(
      JSON.stringify({
        summary: "Unable to analyse right now — please try again in a moment.",
        themes: [],
        emotions: [],
        recommendations: [],
        next_steps: [],
        tags: [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
