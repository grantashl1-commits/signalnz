import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function makePrompt(ex: { name: string; category: string | null; body_part: string | null; target: string | null }) {
  const bp = ex.body_part || "full body";
  const cat = ex.category || "exercise";
  const target = ex.target || bp;
  return (
    `Generate an image: Hand-drawn minimalist watercolor sketch of a person performing '${ex.name}' ` +
    `(${cat} exercise targeting ${target}). Show a neutral gray figure in the exercise position with ` +
    `the ${target} muscles highlighted in coral red watercolor wash. Thin brown pen outlines, ` +
    `subtle watercolor accents. Clean white background. No text, no labels. ` +
    `Simple, elegant anatomical illustration style.`
  );
}

async function generateAndUpload(ex: { id: string; name: string; category: string | null; body_part: string | null; target: string | null }): Promise<{ id: string; name: string; success: boolean; error?: string }> {
  try {
    const prompt = makePrompt(ex);
    
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
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

    // Decode base64
    const b64 = imgUrl.split(",")[1];
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

    // Upload to storage
    const filePath = `illustrations/${ex.id}.png`;
    const { error: uploadErr } = await supabase.storage
      .from("exercise-assets")
      .upload(filePath, bytes, { contentType: "image/png", upsert: true });

    if (uploadErr) {
      return { id: ex.id, name: ex.name, success: false, error: `upload: ${uploadErr.message}` };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/exercise-assets/${filePath}`;

    // Update DB
    const { error: dbErr } = await supabase
      .from("exercises")
      .update({ illustration_url: publicUrl })
      .eq("id", ex.id);

    if (dbErr) {
      return { id: ex.id, name: ex.name, success: false, error: `db: ${dbErr.message}` };
    }

    return { id: ex.id, name: ex.name, success: true };
  } catch (e) {
    return { id: ex.id, name: ex.name, success: false, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { batch = 0, batchSize = 10 } = await req.json().catch(() => ({}));
    
    // Fetch exercises needing custom illustrations:
    // Those with gif_url null AND illustration_url not pointing to our custom bucket
    const { data: exercises, error } = await supabase
      .from("exercises")
      .select("id, name, category, body_part, target")
      .is("gif_url", null)
      .order("name")
      .range(batch * batchSize, (batch + 1) * batchSize - 1);

    if (error) throw error;
    if (!exercises?.length) {
      return new Response(JSON.stringify({ message: "No more exercises to process", batch }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing batch ${batch}: ${exercises.length} exercises`);
    const results = [];
    
    for (const ex of exercises) {
      console.log(`Generating: ${ex.name}`);
      const result = await generateAndUpload(ex);
      results.push(result);
      console.log(`${result.success ? "✓" : "✗"} ${ex.name} ${result.error || ""}`);
      
      // Rate limit buffer
      if (result.error === "rate_limited") {
        console.log("Rate limited, waiting 30s...");
        await new Promise(r => setTimeout(r, 30000));
        // Retry once
        const retry = await generateAndUpload(ex);
        results[results.length - 1] = retry;
      } else {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Count remaining
    const { count } = await supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .is("illustration_url", null);

    return new Response(JSON.stringify({
      batch,
      processed: exercises.length,
      success,
      failed,
      remaining: count,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
