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
    const { text } = await req.json();

    const prompt = `You are a compassionate community moderator for a neighbourhood wellness app. Keep the space genuinely kind — not censoring opinions or strong language, but catching messages that would genuinely wound someone.

Message: "${text}"

Return ONLY valid JSON — no markdown, no preamble, no backticks:
{
  "safe": true or false,
  "reflection": "If not safe: a warm curious question for the sender about what might be underneath that feeling",
  "suggested_rewrite": "If not safe: a kinder way to express the same underlying feeling, or null if safe"
}

Only flag: personal attacks, contempt, shaming, belittling. Allow: frustration, directness, disagreement, mild profanity, strong opinions.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      console.error("AI gateway error:", res.status);
      return new Response(JSON.stringify({ safe: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Moderation error:", error);
    return new Response(JSON.stringify({ safe: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
