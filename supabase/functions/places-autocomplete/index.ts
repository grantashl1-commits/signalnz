import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  // Only signed-in members may call this (it uses the service role or paid AI).
  const caller = await requireUser(req, corsHeaders);
  if (caller instanceof Response) return caller;

  try {
    const { input } = await req.json();
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY not configured");

    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", input);
    url.searchParams.set("types", "(regions)");
    url.searchParams.set("components", "country:nz");
    url.searchParams.set("key", apiKey);

    const resp = await fetch(url.toString());
    const data = await resp.json();

    return new Response(JSON.stringify({
      predictions: (data.predictions || []).map((p: any) => ({
        description: p.description,
        placeId: p.place_id,
        suburb: p.structured_formatting?.main_text || p.description.split(",")[0],
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
