// Generates a small, child-friendly illustration for a chore so kids who can't
// read yet can recognise it. Uses Lovable AI Gateway (no API key required from user).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";
import { geminiImage } from "../_shared/image.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // Only signed-in members may call this (it uses the service role or paid AI).
  const caller = await requireUser(req, corsHeaders);
  if (caller instanceof Response) return caller;

  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return new Response(
        JSON.stringify({ error: "Chore name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `A small simple hand-drawn watercolor illustration representing this child's chore: "${name.trim()}". Friendly, warm, soft pastel watercolor style, single object or scene, no people, no text, no labels. Centered on a clean white background. Painterly, gentle, child-friendly, suitable for a 3-year-old to recognise.`;

    const imageUrl = await geminiImage(prompt).catch((e) => {
      console.error("chore-illustration error:", e);
      return "";
    });

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No image produced" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("chore-illustration error:", err);
    return new Response(
      JSON.stringify({ error: "Image generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
