import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if already seeded
    const { count } = await supabase.from("exercises").select("id", { count: "exact", head: true });
    if (count && count > 100) {
      return new Response(JSON.stringify({ message: `Already seeded (${count} rows)` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the free dataset
    const res = await fetch(
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
    );
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    const exercises = await res.json();

    // Map to our schema
    const rows = exercises.map((e: any) => ({
      id: e.id,
      name: e.name,
      body_part: e.bodyPart,
      equipment: e.equipment,
      target: e.target,
      gif_url: e.gifUrl,
      instructions: e.instructions || [],
      secondary_muscles: e.secondaryMuscles || [],
    }));

    // Insert in batches of 500
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabase.from("exercises").upsert(batch, { onConflict: "id" });
      if (error) throw error;
      inserted += batch.length;
    }

    return new Response(JSON.stringify({ message: `Seeded ${inserted} exercises` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-exercises error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
