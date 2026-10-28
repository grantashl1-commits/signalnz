import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";
import { geminiImage } from "../_shared/image.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // Only signed-in members may call this (it uses the service role or paid AI).
  const caller = await requireUser(req, corsHeaders);
  if (caller instanceof Response) return caller;

  try {
    const body = await req.json();
    const { prompt } = body;
    const userIdentifier = caller.user.id;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Your prompt couldn't be processed. Try a shorter or simpler description." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit check: dream image costs 3 credits (atomic)
    if (userIdentifier) {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      // Rate limiting: 3 per minute (expensive image generation)
      const { data: rl } = await sb.rpc("check_rate_limit", {
        _user_id: userIdentifier, _function_name: "dream-image-generate", _max_per_minute: 3,
      });
      if (rl && !rl.allowed) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: creditError } = await sb.rpc("deduct_ai_credits", {
        p_user_identifier: userIdentifier,
        p_cost: 3,
        p_function_name: "dream-image-generate",
      });
      if (creditError) {
        if (creditError.message?.includes("insufficient_credits")) {
          return new Response(JSON.stringify({ error: "You need 3 AI credits for image generation. Top up or upgrade your plan." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        console.error("Credit deduction error:", creditError);
      }
    }

    console.log("Generating image with prompt:", prompt.slice(0, 120));

    let imageUrl: string;
    try {
      imageUrl = await geminiImage(`Generate this image: ${prompt}`);
    } catch (e) {
      console.error("dream-image-generate error:", e);
      if (/429/.test(String(e?.message ?? ""))) {
        return new Response(
          JSON.stringify({ error: "Image generation is temporarily busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw e;
    }

    // Reconstruct the OpenAI-compatible shape the client parses.
    const data = {
      choices: [{ message: { images: [{ image_url: { url: imageUrl } }] } }],
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("dream-image-generate error:", err);
    return new Response(
      JSON.stringify({ error: "Image generation is temporarily unavailable. Please try again in a moment." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
