import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

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
      // Check if gif_url is populated
      const { data: sample } = await supabase.from("exercises").select("gif_url").limit(1).single();
      if (sample?.gif_url) {
        return new Response(JSON.stringify({ message: `Already seeded (${count} rows)` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // gif_url empty — re-seed
      await supabase.from("exercises").delete().neq("id", "");
    }

    const res = await fetch(
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
    );
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    const exercises = await res.json();

    const rows = exercises.map((e: any) => ({
      id: e.id,
      name: e.name,
      body_part: (e.primaryMuscles || [])[0] || e.category || null,
      equipment: e.equipment || null,
      target: (e.primaryMuscles || [])[0] || null,
      gif_url: e.images?.[0] ? `${IMG_BASE}/${e.images[0]}` : null,
      instructions: e.instructions || [],
      secondary_muscles: e.secondaryMuscles || [],
    }));

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
