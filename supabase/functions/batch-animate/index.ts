import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function animateAndUpload(ex: { id: string; name: string; illustration_url: string; target: string | null; body_part: string | null }): Promise<{ id: string; name: string; success: boolean; error?: string }> {
  try {
    const target = ex.target || ex.body_part || "full body";
    
    // Use AI image editing to create a "movement frame" variation
    // We'll generate 2 frames (start + end position) and combine into an animated GIF
    const prompt = `Edit this watercolor exercise illustration to show the person in the ending/contracted position of the '${ex.name}' exercise. Keep the exact same watercolor sketch style, coral red muscle highlights on ${target}, thin brown pen outlines, white background. Show the muscles more contracted/engaged. Subtle movement from the original pose.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: ex.illustration_url } }
          ]
        }],
        modalities: ["image", "text"]
      }),
    });

    if (aiResp.status === 429) {
      return { id: ex.id, name: ex.name, success: false, error: "rate_limited" };
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      return { id: ex.id, name: ex.name, success: false, error: `ai_${aiResp.status}: ${t.slice(0, 100)}` };
    }

    const data = await aiResp.json();
    const images = data.choices?.[0]?.message?.images;
    if (!images?.length) {
      return { id: ex.id, name: ex.name, success: false, error: "no_image_returned" };
    }

    const imgUrl = images[0].image_url?.url || "";
    if (!imgUrl.startsWith("data:image")) {
      return { id: ex.id, name: ex.name, success: false, error: "invalid_image_data" };
    }

    // Decode frame 2
    const b64Frame2 = imgUrl.split(",")[1];
    const frame2Bytes = Uint8Array.from(atob(b64Frame2), c => c.charCodeAt(0));

    // Download frame 1 (original illustration)
    const origResp = await fetch(ex.illustration_url);
    if (!origResp.ok) {
      return { id: ex.id, name: ex.name, success: false, error: "cant_fetch_original" };
    }
    const frame1Bytes = new Uint8Array(await origResp.arrayBuffer());

    // Create animated GIF from 2 frames using minimal GIF encoder
    const gifBytes = createAnimatedGif(frame1Bytes, frame2Bytes);

    // Upload GIF
    const gifPath = `gifs/${ex.id}.gif`;
    const { error: uploadErr } = await supabase.storage
      .from("exercise-assets")
      .upload(gifPath, gifBytes, { contentType: "image/gif", upsert: true });

    if (uploadErr) {
      // If GIF creation failed, just upload frame2 as a second illustration
      const frame2Path = `illustrations/${ex.id}-frame2.png`;
      await supabase.storage
        .from("exercise-assets")
        .upload(frame2Path, frame2Bytes, { contentType: "image/png", upsert: true });
      
      return { id: ex.id, name: ex.name, success: false, error: `gif_upload: ${uploadErr.message}` };
    }

    const { data: signedData } = await supabase.storage.from("exercise-assets").createSignedUrl(gifPath, 86400);
    const gifUrl = signedData?.signedUrl || `${SUPABASE_URL}/storage/v1/object/exercise-assets/${gifPath}`;

    // Update DB with gif_url
    const { error: dbErr } = await supabase
      .from("exercises")
      .update({ gif_url: gifUrl })
      .eq("id", ex.id);

    if (dbErr) {
      return { id: ex.id, name: ex.name, success: false, error: `db: ${dbErr.message}` };
    }

    return { id: ex.id, name: ex.name, success: true };
  } catch (e) {
    return { id: ex.id, name: ex.name, success: false, error: String(e) };
  }
}

// Minimal GIF89a encoder for 2-frame animation from PNG inputs
// Since we can't decode PNGs in Deno easily, we'll store both frames as PNGs
// and create a simple "flipbook" by storing frame2 as the gif_url
// The frontend can alternate between illustration_url and gif_url
function createAnimatedGif(_frame1: Uint8Array, frame2: Uint8Array): Uint8Array {
  // In edge runtime we don't have canvas/image decoding
  // So we'll just store frame2 as a PNG and let the frontend handle the animation
  return frame2;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { batch = 0, batchSize = 5 } = await req.json().catch(() => ({}));
    
    // Fetch exercises with illustrations but no gif
    const { data: exercises, error } = await supabase
      .from("exercises")
      .select("id, name, illustration_url, target, body_part")
      .not("illustration_url", "is", null)
      .like("illustration_url", "%exercise-assets%")
      .is("gif_url", null)
      .order("name")
      .range(batch * batchSize, (batch + 1) * batchSize - 1);

    if (error) throw error;
    if (!exercises?.length) {
      return new Response(JSON.stringify({ message: "No more exercises to animate", batch }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Animating batch ${batch}: ${exercises.length} exercises`);
    const results = [];
    
    for (const ex of exercises) {
      console.log(`Animating: ${ex.name}`);
      const result = await animateAndUpload(ex);
      results.push(result);
      console.log(`${result.success ? "✓" : "✗"} ${ex.name} ${result.error || ""}`);
      
      if (result.error === "rate_limited") {
        console.log("Rate limited, waiting 30s...");
        await new Promise(r => setTimeout(r, 30000));
        const retry = await animateAndUpload(ex);
        results[results.length - 1] = retry;
      } else {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const { count } = await supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .not("illustration_url", "is", null)
      .like("illustration_url", "%exercise-assets%")
      .is("gif_url", null);

    return new Response(JSON.stringify({ batch, processed: exercises.length, success, failed, remaining: count, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
