import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sleep music generation with caching.
 * 
 * Caches generated audio in "practice-audio" bucket under sleep/<hash>.mp3.
 * Since most users use similar/default prompts, this dramatically reduces
 * ElevenLabs music generation calls.
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
    return new Response("ok", { headers: corsHeaders });
  }

  // Derive user from JWT — never trust body-supplied identifier
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, duration } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    const user_identifier = user?.id ?? null;

    // Rate limiting: 3 per minute (expensive audio generation)
    if (user_identifier) {
      const { data: rl } = await supabase.rpc("check_rate_limit", {
        _user_id: user_identifier, _function_name: "sleep-music", _max_per_minute: 3,
      });
      if (rl && !rl.allowed) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const musicPrompt = prompt || 
      "Gentle, ambient sleep music with soft piano notes, warm pad synths, and subtle nature sounds. " +
      "Very slow tempo, calming and peaceful. No percussion, no sudden changes. " +
      "Perfect for falling asleep. Quiet and serene.";

    const durationSeconds = Math.min(duration || 120, 300);

    // (supabase client already created above)

    // --- CACHE CHECK ---
    const cacheKey = await hashText(`${musicPrompt}::${durationSeconds}`);
    const cachePath = `sleep/${cacheKey}.mp3`;
    const { data: urlData } = supabase.storage
      .from("practice-audio")
      .getPublicUrl(cachePath);

    if (urlData?.publicUrl) {
      try {
        const headResp = await fetch(urlData.publicUrl, { method: "HEAD" });
        if (headResp.ok) {
          // Serve cached — redirect to stored file
          const cachedResp = await fetch(urlData.publicUrl);
          const cachedBuffer = await cachedResp.arrayBuffer();
          return new Response(cachedBuffer, {
            headers: {
              ...corsHeaders,
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch {
        // Not cached yet
      }
    }

    // --- CREDIT CHECK (atomic) ---
    if (user_identifier) {
      const { error: creditError } = await supabase.rpc("deduct_ai_credits", {
        p_user_identifier: user_identifier,
        p_cost: 3,
        p_function_name: "sleep-music",
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

    // --- CACHE STORE ---
    await supabase.storage
      .from("practice-audio")
      .upload(cachePath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

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
