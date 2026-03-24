import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const STRETCHES = [
  { name: "Standing Quad Stretch", target_muscle: "quadriceps", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Stand on one leg, pull opposite foot to glutes", "Keep knees together, hips square", "Hold upright, squeeze glutes gently"] },
  { name: "Standing Hamstring Stretch", target_muscle: "hamstrings", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Place heel on low surface, keep leg straight", "Hinge at hips, reach toward toes", "Feel stretch behind the thigh"] },
  { name: "Hip Flexor Stretch (Half Kneeling)", target_muscle: "hip flexors", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Kneel on one knee, front foot flat", "Shift hips forward, squeeze rear glute", "Keep torso tall, arms overhead for deeper stretch"] },
  { name: "Pigeon Stretch", target_muscle: "glutes / hip external rotators", hold_duration: "45 seconds each side", category: "cool-down", instructions: ["From all fours, bring one knee behind same wrist", "Extend rear leg straight back", "Lower torso toward ground, breathe deeply"] },
  { name: "Cat-Cow Stretch", target_muscle: "spine / core", hold_duration: "60 seconds (8-10 reps)", category: "warm-up", instructions: ["On all fours, inhale arch back (cow)", "Exhale round spine toward ceiling (cat)", "Move slowly with breath"] },
  { name: "World's Greatest Stretch", target_muscle: "hip flexors / thoracic spine", hold_duration: "30 seconds each side", category: "warm-up", instructions: ["Step into deep lunge", "Place inside hand on ground, rotate top arm to ceiling", "Hold, then switch sides"] },
  { name: "Figure-Four Stretch", target_muscle: "glutes / piriformis", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Lie on back, cross ankle over opposite knee", "Pull bottom leg toward chest", "Keep head and shoulders relaxed on ground"] },
  { name: "Chest Doorway Stretch", target_muscle: "chest / anterior deltoids", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Place forearm on door frame at 90°", "Step through with same-side foot", "Feel stretch across chest and front of shoulder"] },
  { name: "Seated Spinal Twist", target_muscle: "thoracic spine / obliques", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Sit with legs extended, cross one foot over opposite knee", "Twist toward bent knee, elbow outside knee", "Lengthen spine on each inhale, deepen on exhale"] },
  { name: "Child's Pose", target_muscle: "lats / lower back", hold_duration: "45 seconds", category: "cool-down", instructions: ["Kneel, sit hips back to heels", "Walk hands forward, lower chest to thighs", "Breathe into lower back"] },
  { name: "Supine Knee-to-Chest", target_muscle: "lower back / glutes", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Lie on back, pull one knee to chest", "Keep opposite leg flat or slightly bent", "Hold and breathe, switch sides"] },
  { name: "Butterfly Stretch", target_muscle: "inner thighs / adductors", hold_duration: "45 seconds", category: "cool-down", instructions: ["Sit with soles of feet together", "Let knees fall outward toward ground", "Gently press knees down with elbows, lean forward"] },
  { name: "Calf Stretch (Wall)", target_muscle: "calves / soleus", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Face wall, place hands at shoulder height", "Step one foot back, press heel into ground", "Keep back leg straight, lean into wall"] },
  { name: "Lying Glute Stretch", target_muscle: "glutes", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Lie face up, cross one ankle over opposite thigh", "Pull thigh toward chest", "Keep head relaxed on ground"] },
  { name: "Triceps Overhead Stretch", target_muscle: "triceps", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Raise one arm overhead, bend elbow", "Use opposite hand to gently press elbow back", "Feel stretch along back of upper arm"] },
  { name: "Neck Side Stretch", target_muscle: "upper trapezius / neck", hold_duration: "20 seconds each side", category: "cool-down", instructions: ["Tilt head to one side, ear toward shoulder", "Gently apply pressure with same-side hand", "Keep opposite shoulder relaxed and down"] },
  { name: "Banded Clamshells", target_muscle: "glute medius / hip abductors", hold_duration: "15 reps each side", category: "warm-up", instructions: ["Lie on side, knees bent 90°, band above knees", "Keep feet together, open top knee like a clamshell", "Slow and controlled, squeeze at top"] },
  { name: "Leg Swings (Front-to-Back)", target_muscle: "hip flexors / hamstrings", hold_duration: "15 swings each leg", category: "warm-up", instructions: ["Hold onto support, stand on one leg", "Swing opposite leg forward and back", "Keep core braced, increase range gradually"] },
  { name: "Hip Circles", target_muscle: "hip joint / glutes", hold_duration: "10 circles each direction per leg", category: "warm-up", instructions: ["Stand on one leg, lift opposite knee to hip height", "Draw large circles with the knee", "Reverse direction after 10 reps"] },
  { name: "Thoracic Rotations", target_muscle: "thoracic spine", hold_duration: "10 reps each side", category: "warm-up", instructions: ["On all fours or side-lying", "Place hand behind head, rotate elbow to ceiling", "Follow elbow with eyes, pause at top"] },
  { name: "Inchworm Walkout", target_muscle: "hamstrings / shoulders / core", hold_duration: "8 reps", category: "warm-up", instructions: ["Stand tall, fold forward touching ground", "Walk hands out to plank position", "Walk feet back to hands, stand up"] },
  { name: "Lat Stretch (Side Reach)", target_muscle: "latissimus dorsi", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Stand with feet hip-width, reach one arm overhead", "Lean away from raised arm side", "Feel stretch along side of torso"] },
  { name: "Cobra Stretch", target_muscle: "abdominals / hip flexors", hold_duration: "30 seconds", category: "cool-down", instructions: ["Lie face down, hands under shoulders", "Press up, extending arms, keep hips on ground", "Look forward, open chest, breathe deeply"] },
  { name: "Cross-Body Shoulder Stretch", target_muscle: "posterior deltoid", hold_duration: "30 seconds each side", category: "cool-down", instructions: ["Bring one arm across body at shoulder height", "Use opposite hand to press arm closer to chest", "Keep shoulders relaxed and down"] },
  { name: "90/90 Hip Stretch", target_muscle: "hip internal/external rotators", hold_duration: "45 seconds each side", category: "cool-down", instructions: ["Sit with front leg bent 90° in front, back leg 90° to side", "Keep both knees at 90°, sit tall", "Lean forward over front shin for deeper stretch"] },
];

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let exercisesSeeded = 0;
    let stretchesSeeded = 0;

    // ── Seed exercises ──
    const { count: exCount } = await supabase.from("exercises").select("id", { count: "exact", head: true });
    if (!exCount || exCount < 100) {
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

      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        const { error } = await supabase.from("exercises").upsert(batch, { onConflict: "id" });
        if (error) throw error;
        exercisesSeeded += batch.length;
      }
    } else {
      exercisesSeeded = exCount;
    }

    // ── Seed stretches ──
    const { count: stCount } = await supabase.from("stretches").select("id", { count: "exact", head: true });
    if (!stCount || stCount < 20) {
      // Try to match stretch names to exercise GIFs
      const stretchRows = [];
      for (const s of STRETCHES) {
        // Look for a matching exercise GIF
        const searchName = s.name.toLowerCase().replace(/[^a-z ]/g, "").split(" ").slice(0, 2).join(" ");
        const { data: match } = await supabase
          .from("exercises")
          .select("gif_url")
          .ilike("name", `%${searchName}%`)
          .limit(1)
          .maybeSingle();

        stretchRows.push({
          name: s.name,
          target_muscle: s.target_muscle,
          hold_duration: s.hold_duration,
          instructions: s.instructions,
          category: s.category,
          gif_url: match?.gif_url || null,
        });
      }

      const { error } = await supabase.from("stretches").insert(stretchRows);
      if (error) throw error;
      stretchesSeeded = stretchRows.length;
    } else {
      stretchesSeeded = stCount;
    }

    return new Response(JSON.stringify({
      message: `Exercises: ${exercisesSeeded}, Stretches: ${stretchesSeeded}`,
    }), {
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
