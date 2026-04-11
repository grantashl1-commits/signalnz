const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function generateIllustration(exerciseName: string, targetMuscle: string, primaryMuscles: string[]): Promise<Uint8Array | null> {
  const muscleList = primaryMuscles?.length ? primaryMuscles.join(", ") : targetMuscle || "full body";
  
  const prompt = `A clean anatomical illustration of the exercise "${exerciseName}". Show a human figure performing the exercise with the working muscles (${muscleList}) highlighted in warm red/coral color. Professional medical/anatomical diagram style with clean line art on a white background. The figure should be in neutral gray/charcoal with only the target muscles colored. Simple, clean, minimal. No text overlay.`;

  // Use Imagen 3 for image generation
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "BLOCK_ONLY_HIGH",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Imagen generation failed:", response.status, errText);
    return null;
  }

  const data = await response.json();
  const predictions = data.predictions || [];
  
  if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
    return Uint8Array.from(atob(predictions[0].bytesBase64Encoded), c => c.charCodeAt(0));
  }

  console.error("No image data found in Imagen response");
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
