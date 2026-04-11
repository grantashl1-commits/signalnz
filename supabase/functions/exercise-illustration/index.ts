const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Fetch ExerciseDB exercises and match by name
async function findExerciseDBId(exerciseName: string): Promise<string | null> {
  const searchName = exerciseName.toLowerCase().trim();
  
  const resp = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchName)}?limit=1&offset=0`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  
  if (!resp.ok) return null;
  const results = await resp.json();
  if (Array.isArray(results) && results.length > 0) {
    return results[0].id;
  }
  return null;
}

async function fetchAndUploadGif(exerciseId: string, edbId: string): Promise<string | null> {
  const resp = await fetch(
    `https://exercisedb.p.rapidapi.com/image?exerciseId=${edbId}&resolution=360`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      },
    }
  );
  
  if (!resp.ok) return null;
  
  const gifData = new Uint8Array(await resp.arrayBuffer());
  if (gifData.length < 1000) return null;
  
  const filename = `${exerciseId}.gif`;
  const { error: uploadError } = await supabase.storage
    .from("exercise-illustrations")
    .upload(filename, gifData, { contentType: "image/gif", upsert: true });
  
  if (uploadError) {
    console.error("Upload error:", uploadError.message);
    return null;
  }
  
  const { data: urlData } = supabase.storage
    .from("exercise-illustrations")
    .getPublicUrl(filename);
  
  return urlData.publicUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { exercise_id, batch_ids } = await req.json();
    const ids = batch_ids || (exercise_id ? [exercise_id] : []);
    
    if (!ids.length) {
      return new Response(JSON.stringify({ error: "No exercise IDs" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: exercises, error } = await supabase
      .from("exercises")
      .select("id, name, target, body_part, primary_muscles")
      .in("id", ids)
      .is("illustration_url", null);

    if (error) throw error;
    if (!exercises?.length) {
      return new Response(JSON.stringify({ message: "All done", generated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; url: string | null; error?: string }[] = [];

    for (const ex of exercises) {
      try {
        const edbId = await findExerciseDBId(ex.name);
        if (!edbId) {
          results.push({ id: ex.id, url: null, error: "No ExerciseDB match" });
          continue;
        }

        const publicUrl = await fetchAndUploadGif(ex.id, edbId);
        if (!publicUrl) {
          results.push({ id: ex.id, url: null, error: "GIF fetch/upload failed" });
          continue;
        }

        await supabase.from("exercises").update({ illustration_url: publicUrl }).eq("id", ex.id);
        results.push({ id: ex.id, url: publicUrl });
      } catch (e) {
        results.push({ id: ex.id, url: null, error: String(e) });
      }
    }

    return new Response(JSON.stringify({
      generated: results.filter(r => r.url).length,
      total: exercises.length,
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
