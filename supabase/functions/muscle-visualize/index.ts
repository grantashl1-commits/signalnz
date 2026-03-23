import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const MUSCLE_API_KEY = Deno.env.get("MUSCLE_API_KEY");
    if (!MUSCLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "MUSCLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { muscles, colors, gender, background, size, format } = await req.json();

    const params = new URLSearchParams({
      muscles: muscles || "",
      colors: colors || "",
      gender: gender || "female",
      background: background || "transparent",
      size: size || "large",
      format: format || "png",
    });

    const url = `https://muscle-visualizer-api.p.rapidapi.com/api/v1/visualize/heatmap?${params}`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": "muscle-visualizer-api.p.rapidapi.com",
        "x-rapidapi-key": MUSCLE_API_KEY,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Muscle API error:", res.status, text);
      return new Response(
        JSON.stringify({ error: `API returned ${res.status}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const blob = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";

    return new Response(blob, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("muscle-visualize error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});