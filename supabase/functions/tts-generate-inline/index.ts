import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * TTS-generate-inline — used primarily for Stoic read-aloud (Lily voice).
 *
 * Cost-saving strategy:
 * 1. Hash the input text to create a deterministic cache key.
 * 2. Check if audio already exists in the "practice-audio" bucket under stoic/<hash>.mp3.
 * 3. If cached → return the public URL (zero ElevenLabs cost).
 * 4. If not cached → deduct 1 AI credit, generate via ElevenLabs, cache to storage, return URL.
 *
 * This means the 366 unique Stoic readings are generated at most ONCE each,
 * reducing ElevenLabs costs by ~99% across all users.
 */

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    // Signal voice policy: only Regina (female, default) and Theo (male) are allowed.
    const REGINA_VOICE_ID = "M7wzTk2Y1hGQyRzr9sbS";
    const THEO_VOICE_ID = "UmQN7jS1Ee8B1czsUtQh";
    const ALLOWED_VOICES = new Set([REGINA_VOICE_ID, THEO_VOICE_ID]);
    const DEFAULT_VOICE_ID = REGINA_VOICE_ID;

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voiceId, user_identifier } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Missing required field: text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- CACHE CHECK ---
    const voice = voiceId && ALLOWED_VOICES.has(voiceId) ? voiceId : DEFAULT_VOICE_ID;
    const textHash = await hashText(`${voice}:calm-reader-v2:${text}`);
    const cachePath = `inline/calm-reader-v2/${textHash}.mp3`;
    const { data: urlData } = supabase.storage
      .from("practice-audio")
      .getPublicUrl(cachePath);

    // Verify file exists with HEAD request
    if (urlData?.publicUrl) {
      try {
        const headResp = await fetch(urlData.publicUrl, { method: "HEAD" });
        if (headResp.ok) {
          // Serve cached audio — no ElevenLabs cost, no credit deduction
          return new Response(
            JSON.stringify({ audioUrl: urlData.publicUrl, cached: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch {
        // File doesn't exist yet, continue to generate
      }
    }

    // --- CREDIT CHECK (atomic) ---
    if (user_identifier) {
      const { error: creditError } = await supabase.rpc("deduct_ai_credits", {
        p_user_identifier: user_identifier,
        p_cost: 1,
        p_function_name: "tts-generate-inline",
      });
      if (creditError) {
        if (creditError.message?.includes("insufficient_credits")) {
          return new Response(
            JSON.stringify({ error: "You've used all your credits for this month. Upgrade your plan for more." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error("Credit deduction error:", creditError);
      }
    }

    // --- GENERATE ---
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.58,
            similarity_boost: 0.74,
            style: 0.2,
            use_speaker_boost: true,
            speed: 0.88,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errBody = await ttsResponse.text();
      console.error("ElevenLabs error:", errBody);
      return new Response(
        JSON.stringify({ error: "TTS generation failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    // --- CACHE STORE ---
    await supabase.storage
      .from("practice-audio")
      .upload(cachePath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    const { data: newUrl } = supabase.storage
      .from("practice-audio")
      .getPublicUrl(cachePath);

    return new Response(
      JSON.stringify({ audioUrl: newUrl.publicUrl, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("TTS inline error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
