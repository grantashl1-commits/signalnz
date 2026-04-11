import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    if (body.milestoneType) {
      return handleMilestoneAnalysis(body);
    }

    return handleEntryAnalysis(body);
  } catch (error) {
    console.error("Journal AI error:", error);
    return new Response(
      JSON.stringify({
        summary: "Unable to analyse right now — please try again in a moment.",
        themes: [], emotions: [], recommendations: [], next_steps: [], tags: [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});

async function callAI(prompt: string, maxTokens = 800) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    throw new Error(`AI error: ${status}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

const PROMPTS_MAP = [
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

async function handleEntryAnalysis(body: any) {
  const { entry } = body;

  const current = PROMPTS_MAP.map(p => `${p.label}\n${entry.prompts?.[p.key] || "(not answered)"}`).join("\n\n");

  // Shortened prompt — uses flash-lite model
  const prompt = `Analyse this journal entry. Return ONLY valid JSON.

ENTRY — ${entry.date}
Mood: ${entry.tracking?.mood}/10 | Energy: ${entry.tracking?.energy}/10

${current}

Return:
{
  "summary": "2 sentence compassionate summary",
  "themes": ["theme1","theme2","theme3"],
  "emotions": ["emotion1","emotion2"],
  "strengths": ["strength shown"],
  "recommendations": [{"type":"practice","title":"Name","reason":"why"}],
  "next_steps": ["action 1","action 2"],
  "affirmation": "personalised affirmation",
  "tags": ["tag1","tag2","tag3"]
}`;

  const analysis = await callAI(prompt);
  if (analysis instanceof Response) return analysis;

  return new Response(JSON.stringify(analysis), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleMilestoneAnalysis(body: any) {
  const { milestoneCount, milestoneLabel, allEntries } = body;

  const entrySummaries = (allEntries || []).slice(0, 10).map((e: any, i: number) => {
    return `${e.date} | Mood: ${e.tracking?.mood}/10 | Proud: ${e.prompts?.proud || "—"} | Challenge: ${e.prompts?.challenge || "—"}`;
  }).join("\n");

  const prompt = `${milestoneLabel} for ${milestoneCount} journal entries. Return ONLY valid JSON.

ENTRIES:
${entrySummaries}

Return:
{
  "milestone_title": "${milestoneLabel}",
  "summary": "3 sentence overview",
  "growth_arc": "2 sentences on evolution",
  "themes": ["theme1","theme2"],
  "strengths": ["strength1","strength2"],
  "next_steps": ["action 1","action 2"],
  "affirmation": "personalised affirmation",
  "tags": ["tag1","tag2","tag3"]
}`;

  const analysis = await callAI(prompt, 1000);
  if (analysis instanceof Response) return analysis;

  return new Response(JSON.stringify(analysis), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
