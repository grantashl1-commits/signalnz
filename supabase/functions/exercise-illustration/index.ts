const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function generateIllustration(exerciseName: string, targetMuscle: string, primaryMuscles: string[]): Promise<Uint8Array | null> {
  const muscleList = primaryMuscles?.length ? primaryMuscles.join(", ") : targetMuscle || "full body";
  
  const prompt = `Create a clean anatomical illustration of the exercise "${exerciseName}". Show a human figure in the exercise position with the working muscles (${muscleList}) highlighted in warm red/coral color. The style should be a professional medical/anatomical diagram with clean line art on a white background, similar to anatomy textbook illustrations. Include clear muscle fiber detail on the highlighted areas. The figure should be in a neutral gray/charcoal with only the target muscles colored. Include the exercise name "${exerciseName}" as a small label at the bottom. No background, clean and minimal.`;

  const response = await fetch("https://ai.lovable.dev/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error("AI generation failed:", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  
  // Extract base64 image from response
  const choice = data.choices?.[0];
  if (!choice) return null;
  
  // Check for inline image data in the message parts
  const parts = choice.message?.content;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part.type === "image_url" && part.image_url?.url) {
        const dataUrl = part.image_url.url;
        if (dataUrl.startsWith("data:image/")) {
          const base64 = dataUrl.split(",")[1];
          return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        }
      }
    }
  }
  
  // If content is a string with base64
  if (typeof parts === "string" && parts.includes("data:image/")) {
    const match = parts.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (match) {
      return Uint8Array.from(atob(match[1]), c => c.charCodeAt(0));
    }
  }

  console.error("No image data found in response");
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { exercise_id, batch_ids } = await req.json();
    
    const ids = batch_ids || (exercise_id ? [exercise_id] : []);
    if (!ids.length) {
      return new Response(JSON.stringify({ error: "No exercise IDs provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch exercises
    const { data: exercises, error } = await supabase
      .from("exercises")
      .select("id, name, target, body_part, primary_muscles")
      .in("id", ids)
      .is("illustration_url", null);

    if (error) throw error;
    if (!exercises?.length) {
      return new Response(JSON.stringify({ message: "All exercises already have illustrations", generated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; url: string | null; error?: string }[] = [];

    for (const ex of exercises) {
      try {
        const imageData = await generateIllustration(
          ex.name,
          ex.target || ex.body_part || "",
          ex.primary_muscles || []
        );

        if (!imageData) {
          results.push({ id: ex.id, url: null, error: "Generation failed" });
          continue;
        }

        const filename = `${ex.id}.png`;
        const { error: uploadError } = await supabase.storage
          .from("exercise-illustrations")
          .upload(filename, imageData, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          results.push({ id: ex.id, url: null, error: uploadError.message });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("exercise-illustrations")
          .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;

        await supabase
          .from("exercises")
          .update({ illustration_url: publicUrl })
          .eq("id", ex.id);

        results.push({ id: ex.id, url: publicUrl });
      } catch (e) {
        results.push({ id: ex.id, url: null, error: String(e) });
      }
    }

    return new Response(JSON.stringify({ 
      generated: results.filter(r => r.url).length,
      total: exercises.length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
