import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const DEFAULT_VOICE_ID =
      Deno.env.get("ELEVENLABS_VOICE_ID_DEFAULT") || "pFZP5JQG7iQjIQuC4Bku";

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "ElevenLabs API key not configured",
          message: "Audio generation is not available yet.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voiceId, practiceId, user_identifier } = await req.json();

    if (!text || !practiceId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, practiceId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- CREDIT CHECK (atomic) ---
    if (user_identifier) {
      const { error: creditError } = await supabase.rpc("deduct_ai_credits", {
        p_user_identifier: user_identifier,
        p_cost: 2,
        p_function_name: "tts-generate",
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

    const voice = voiceId || DEFAULT_VOICE_ID;

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
            stability: 0.85,
            similarity_boost: 0.6,
            style: 0.15,
            use_speaker_boost: false,
            speed: 0.75,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errBody = await ttsResponse.text();
      console.error("ElevenLabs error:", errBody);
      return new Response(
        JSON.stringify({ error: "TTS generation failed", details: errBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    const filePath = `practices/${practiceId}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("practice-audio")
      .upload(filePath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to store audio", details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: urlData } = supabase.storage
      .from("practice-audio")
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({
        practiceId,
        audioUrl: urlData.publicUrl,
        message: "Audio generated and stored successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("TTS generate error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
