import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  // Only signed-in members may call this (it uses the service role or paid AI).
  const caller = await requireUser(req, corsHeaders);
  if (caller instanceof Response) return caller;

  try {
    const MUSCLE_API_KEY = Deno.env.get("MUSCLE_API_KEY");
    if (!MUSCLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "MUSCLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { muscles, colors, gender, background, size, format } = await req.json();
    const safeBackground = background === "transparent" ? "transparent" : "transparent";
    const safeColors = (colors || "")
      .split(",")
      .map((color: string) => color.trim())
      .filter(Boolean)
      .map((color: string) =>
        color.startsWith("#") || color.startsWith("rgb") ? color : `#${color}`
      )
      .join(",");

    const params = new URLSearchParams({
      muscles: muscles || "",
      colors: safeColors,
      gender: gender || "female",
      background: safeBackground,
      size: size || "small",
      format: format || "jpeg",
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