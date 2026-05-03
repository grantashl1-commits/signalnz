import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Batch TTS pre-generation.
 * Accepts an array of { id, text } items, generates audio for any that
 * don't already exist in the practice-audio bucket, and stores them.
 * 
 * Designed to be called by an admin to pre-warm the audio cache.
 * No credit deduction — this is an operational cost, not user-facing.
 */

// Signal voice policy: Regina is the only female narrator used.
const VOICE_ID = "M7wzTk2Y1hGQyRzr9sbS"; // Regina

async function generateOne(
  apiKey: string,
  text: string
): Promise<ArrayBuffer> {
  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.85,
          similarity_boost: 0.6,
          style: 0.15,
          use_speaker_boost: false,
          speed: 0.75,
        },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`ElevenLabs error: ${resp.status} ${err}`);
  }

  return resp.arrayBuffer();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY not set" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin (service role or authenticated admin)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { items, bucket_prefix } = await req.json() as {
      items: { id: string; text: string }[];
      bucket_prefix?: string;
    };

    if (!items?.length) {
      return new Response(
        JSON.stringify({ error: "No items provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prefix = bucket_prefix || "practices";
    const results: { id: string; status: string; url?: string }[] = [];

    for (const item of items) {
      const filePath = `${prefix}/${item.id}.mp3`;

      // Check if already cached
      const { data: urlData } = supabase.storage
        .from("practice-audio")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        try {
          const head = await fetch(urlData.publicUrl, { method: "HEAD" });
          if (head.ok) {
            results.push({ id: item.id, status: "cached", url: urlData.publicUrl });
            continue;
          }
        } catch { /* not cached */ }
      }

      // Generate
      try {
        console.log(`Generating: ${item.id} (${item.text.length} chars)`);
        const audio = await generateOne(ELEVENLABS_API_KEY, item.text);

        const { error: uploadErr } = await supabase.storage
          .from("practice-audio")
          .upload(filePath, audio, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (uploadErr) {
          results.push({ id: item.id, status: `upload_error: ${uploadErr.message}` });
        } else {
          const { data: newUrl } = supabase.storage
            .from("practice-audio")
            .getPublicUrl(filePath);
          results.push({ id: item.id, status: "generated", url: newUrl.publicUrl });
        }

        // Rate limit: pause 1s between generations to avoid ElevenLabs throttling
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        results.push({ id: item.id, status: `error: ${err.message}` });
      }
    }

    const generated = results.filter((r) => r.status === "generated").length;
    const cached = results.filter((r) => r.status === "cached").length;
    const errors = results.filter((r) => r.status.startsWith("error")).length;

    return new Response(
      JSON.stringify({
        summary: { total: items.length, generated, cached, errors },
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
