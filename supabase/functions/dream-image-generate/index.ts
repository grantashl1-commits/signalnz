import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured. Image generation is temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { prompt, userIdentifier } = body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Your prompt couldn't be processed. Try a shorter or simpler description." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit check: dream image costs 3 credits
    if (userIdentifier) {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: credits } = await sb.from("ai_credits").select("*").eq("user_identifier", userIdentifier).maybeSingle();
      const cost = 3;
      if (credits && (credits.credits_remaining || 0) < cost) {
        return new Response(JSON.stringify({ error: `You need ${cost} AI credits for image generation. Top up or upgrade your plan.` }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (credits && credits.tier !== "unlimited") {
        await sb.from("ai_credits").update({ credits_remaining: (credits.credits_remaining || 0) - cost, updated_at: new Date().toISOString() }).eq("user_identifier", userIdentifier);
      } else if (!credits) {
        await sb.from("ai_credits").insert({ user_identifier: userIdentifier, credits_remaining: 5 - cost, tier: "free" });
      }
      await sb.from("ai_usage").insert({ user_identifier: userIdentifier, function_name: "dream-image-generate", tokens_used: cost });
    }

    console.log("Generating image with prompt:", prompt.slice(0, 120));

    // Use Gemini image generation model via Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Generate this image: ${prompt}`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const statusCode = response.status;
      if (statusCode === 429) {
        return new Response(
          JSON.stringify({ error: "Image generation is temporarily busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (statusCode === 402) {
        return new Response(
          JSON.stringify({ error: "Usage credits exhausted. Please add credits to continue generating images." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", statusCode, t);
      return new Response(
        JSON.stringify({ error: "Image generation is temporarily unavailable. Please try again in a moment." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Validate that we got an image back
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Image generation didn't produce a result. Try a different prompt." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
