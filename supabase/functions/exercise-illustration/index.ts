import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Use the static GymX-Fitness dataset (ExerciseDB mirror) — no API key needed
const GYMX_URL = "https://raw.githubusercontent.com/mauryashiva/GymX-Fitness/main/src/data/exercises.json";

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

// Manual curated mappings for exercises that don't fuzzy-match
const MANUAL: Record<string, string> = {
  "cat-cow": "https://static.exercisedb.dev/media/vu1p9la.gif",
  "catcow": "https://static.exercisedb.dev/media/vu1p9la.gif",
  "barbell hip thrust": "https://static.exercisedb.dev/media/HrkUxqY.gif",
  "clamshell with band": "https://static.exercisedb.dev/media/uxH2kQv.gif",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Step 1: Fetch static exercise database from GitHub
    console.log("Fetching GymX exercise data from GitHub...");
    const resp = await fetch(GYMX_URL);
    if (!resp.ok) throw new Error(`GitHub fetch failed: ${resp.status}`);
    const gymxData: Array<{ exerciseId: string; name: string; gifUrl: string; targetMuscles: string[]; bodyParts: string[] }> = await resp.json();
    console.log(`Fetched ${gymxData.length} exercises from GymX dataset`);

    // Build normalized lookup
    const gymxNorm = new Map<string, typeof gymxData[0]>();
    for (const e of gymxData) {
      gymxNorm.set(norm(e.name), e);
    }

    // Step 2: Get our exercises missing gif_url
    const { data: exercises, error } = await supabase
      .from("exercises")
      .select("id, name, target, body_part")
      .is("gif_url", null);
    
    if (error) throw error;
    if (!exercises?.length) {
      return new Response(JSON.stringify({ message: "All exercises have GIFs", matched: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Matching ${exercises.length} exercises without GIFs...`);

    let matchCount = 0;
    const results: Array<{ id: string; name: string; matched_to?: string; gif_url?: string; error?: string }> = [];

    for (const ex of exercises) {
      const n = norm(ex.name);

      // 1. Manual override
      if (MANUAL[n]) {
        const { error: ue } = await supabase.from("exercises").update({ gif_url: MANUAL[n] }).eq("id", ex.id);
        if (!ue) matchCount++;
        results.push({ id: ex.id, name: ex.name, matched_to: "manual", gif_url: MANUAL[n], error: ue?.message });
        continue;
      }

      // 2. Exact normalized match
      if (gymxNorm.has(n)) {
        const match = gymxNorm.get(n)!;
        const { error: ue } = await supabase.from("exercises").update({ gif_url: match.gifUrl }).eq("id", ex.id);
        if (!ue) matchCount++;
        results.push({ id: ex.id, name: ex.name, matched_to: match.name, gif_url: match.gifUrl, error: ue?.message });
        continue;
      }

      // 3. Substring containment (our name appears in gymx name, prefer shortest)
      let candidates: Array<[number, typeof gymxData[0]]> = [];
      for (const [gn, e] of gymxNorm.entries()) {
        if (gn.includes(n) || n.includes(gn)) {
          candidates.push([gn.length, e]);
        }
      }
      if (candidates.length > 0) {
        candidates.sort((a, b) => a[0] - b[0]);
        const match = candidates[0][1];
        const { error: ue } = await supabase.from("exercises").update({ gif_url: match.gifUrl }).eq("id", ex.id);
        if (!ue) matchCount++;
        results.push({ id: ex.id, name: ex.name, matched_to: match.name, gif_url: match.gifUrl, error: ue?.message });
        continue;
      }

      // 4. Word overlap (≥50%)
      const nameWords = new Set(n.split(" "));
      let bestScore = 0;
      let bestMatch: typeof gymxData[0] | null = null;
      for (const e of gymxData) {
        const eWords = new Set(norm(e.name).split(" "));
        let overlap = 0;
        for (const w of nameWords) if (eWords.has(w)) overlap++;
        let score = overlap / Math.max(nameWords.size, eWords.size);
        // Bonus if all our words exist in target
        let allMatch = true;
        for (const w of nameWords) if (!eWords.has(w)) { allMatch = false; break; }
        if (allMatch && nameWords.size > 0) score = Math.max(score, 0.8);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = e;
        }
      }

      if (bestMatch && bestScore >= 0.5) {
        const { error: ue } = await supabase.from("exercises").update({ gif_url: bestMatch.gifUrl }).eq("id", ex.id);
        if (!ue) matchCount++;
        results.push({ id: ex.id, name: ex.name, matched_to: bestMatch.name, gif_url: bestMatch.gifUrl, error: ue?.message });
      } else {
        results.push({ id: ex.id, name: ex.name, error: `No match (best: ${bestScore.toFixed(2)})` });
      }
    }

    return new Response(JSON.stringify({
      total_missing: exercises.length,
      matched: matchCount,
      unmatched: exercises.length - matchCount,
      gymx_library_size: gymxData.length,
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
