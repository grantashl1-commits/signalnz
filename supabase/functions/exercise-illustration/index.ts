import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Normalize name for fuzzy matching
function norm(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Calculate similarity score (word overlap ratio)
function similarity(a: string, b: string): number {
  const wa = new Set(norm(a).split(" "));
  const wb = new Set(norm(b).split(" "));
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  const maxLen = Math.max(wa.size, wb.size);
  return maxLen === 0 ? 0 : overlap / maxLen;
}

// Fetch ALL exercises from ExerciseDB
async function fetchAllExerciseDB(): Promise<Array<{ id: string; name: string; gifUrl: string; target: string; bodyPart: string }>> {
  const all: any[] = [];
  const limit = 100;
  let offset = 0;
  
  while (true) {
    const resp = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises?limit=${limit}&offset=${offset}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        },
      }
    );
    
    if (!resp.ok) {
      console.error(`ExerciseDB fetch failed at offset ${offset}: ${resp.status}`);
      break;
    }
    
    const batch = await resp.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    
    all.push(...batch);
    offset += limit;
    
    if (batch.length < limit) break;
    
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  
  return all;
}

// Find best match for an exercise name among ExerciseDB entries
function findBestMatch(
  name: string,
  edbExercises: Array<{ id: string; name: string; gifUrl: string; target: string; bodyPart: string }>,
  target?: string | null,
  bodyPart?: string | null
): { id: string; gifUrl: string; score: number } | null {
  const normalized = norm(name);
  
  let bestScore = 0;
  let bestMatch: { id: string; gifUrl: string; score: number } | null = null;
  
  for (const edb of edbExercises) {
    let score = similarity(name, edb.name);
    
    // Exact normalized match is perfect
    if (norm(edb.name) === normalized) {
      return { id: edb.id, gifUrl: edb.gifUrl, score: 1.0 };
    }
    
    // Bonus for matching target muscle or body part
    if (target && norm(edb.target) === norm(target)) score += 0.1;
    if (bodyPart && norm(edb.bodyPart) === norm(bodyPart)) score += 0.05;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { id: edb.id, gifUrl: edb.gifUrl, score };
    }
  }
  
  // Minimum threshold to accept a match
  return bestMatch && bestMatch.score >= 0.5 ? bestMatch : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "bulk"; // "bulk" = match all, "batch" = specific IDs
    const minScore = body.min_score || 0.5;
    
    // Step 1: Fetch all ExerciseDB exercises
    console.log("Fetching all ExerciseDB exercises...");
    const edbExercises = await fetchAllExerciseDB();
    console.log(`Fetched ${edbExercises.length} exercises from ExerciseDB`);
    
    if (edbExercises.length === 0) {
      return new Response(JSON.stringify({ error: "Failed to fetch ExerciseDB data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Get our exercises that need illustrations
    let query = supabase
      .from("exercises")
      .select("id, name, target, body_part")
      .is("illustration_url", null);
    
    if (mode === "batch" && body.batch_ids?.length) {
      query = supabase
        .from("exercises")
        .select("id, name, target, body_part")
        .in("id", body.batch_ids);
    }
    
    const { data: exercises, error } = await query;
    if (error) throw error;
    
    if (!exercises?.length) {
      return new Response(JSON.stringify({ message: "All exercises already have illustrations", matched: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Matching ${exercises.length} exercises...`);
    
    const results: Array<{ id: string; name: string; matched_to?: string; gif_url?: string; score?: number; error?: string }> = [];
    let matchCount = 0;

    // Step 3: Match each exercise and update
    for (const ex of exercises) {
      const match = findBestMatch(ex.name, edbExercises, ex.target, ex.body_part);
      
      if (match && match.score >= minScore) {
        // Update the exercise with the ExerciseDB GIF URL as illustration_url
        const { error: updateError } = await supabase
          .from("exercises")
          .update({ illustration_url: match.gifUrl })
          .eq("id", ex.id);
        
        if (updateError) {
          results.push({ id: ex.id, name: ex.name, error: updateError.message });
        } else {
          matchCount++;
          results.push({
            id: ex.id,
            name: ex.name,
            matched_to: edbExercises.find(e => e.id === match.id)?.name,
            gif_url: match.gifUrl,
            score: Math.round(match.score * 100) / 100,
          });
        }
      } else {
        results.push({
          id: ex.id,
          name: ex.name,
          score: match ? Math.round(match.score * 100) / 100 : 0,
          error: "No match above threshold",
        });
      }
    }

    return new Response(JSON.stringify({
      total_exercises: exercises.length,
      matched: matchCount,
      unmatched: exercises.length - matchCount,
      edb_library_size: edbExercises.length,
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
