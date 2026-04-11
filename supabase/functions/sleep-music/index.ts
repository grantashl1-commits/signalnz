import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, duration } = await req.json();

    const musicPrompt = prompt || 
      "Gentle, ambient sleep music with soft piano notes, warm pad synths, and subtle nature sounds. " +
      "Very slow tempo, calming and peaceful. No percussion, no sudden changes. " +
      "Perfect for falling asleep. Quiet and serene.";

    const durationSeconds = Math.min(duration || 120, 300);

    const response = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: musicPrompt,
        duration_seconds: durationSeconds,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs music error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: `Music generation failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Sleep music error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
