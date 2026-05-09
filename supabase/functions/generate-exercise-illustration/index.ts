import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "exercise-assets";
const FOLDER = "illustrations";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^A-Za-z0-9 _\-]+/g, "")
    .trim()
    .replace(/\s+/g, "_") || "Exercise";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { exerciseName } = await req.json();
    if (!exerciseName || typeof exerciseName !== "string") {
      return new Response(JSON.stringify({ error: "exerciseName required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const filename = `${sanitizeFilename(exerciseName)}.png`;
    const path = `${FOLDER}/${filename}`;
    const publicBase = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/${BUCKET}/${FOLDER}`;

    // Already exists? Return it.
    const { data: head } = await supabase.storage.from(BUCKET).list(FOLDER, {
      search: filename, limit: 1,
    });
    if (head && head.find((f) => f.name === filename)) {
      return new Response(JSON.stringify({ url: `${publicBase}/${encodeURIComponent(filename)}`, filename, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate via Lovable AI Gateway (Nano Banana).
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Anatomical exercise illustration of "${exerciseName}". Single human figure mid-movement, clean line art with soft gray muscle shading, neutral skin tone, simple white background, centred composition, square format, reference-diagram style consistent with a fitness exercise library. No text, no labels, no equipment branding.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(JSON.stringify({ error: "ai_gateway_error", detail: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const dataUrl: string | undefined = aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl?.startsWith("data:image/")) {
      return new Response(JSON.stringify({ error: "no_image_returned" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const base64 = dataUrl.split(",", 2)[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: "image/png", upsert: true,
    });
    if (upErr) {
      return new Response(JSON.stringify({ error: "upload_failed", detail: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: `${publicBase}/${encodeURIComponent(filename)}`, filename, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "unexpected", detail: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
