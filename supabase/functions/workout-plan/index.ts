import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══ PHASE INTENSITY MODIFIERS ═══
const PHASE_CONFIG: Record<string, { rpeMax: number; maxStrength: number; note: string; volumeMod: number }> = {
  Menstrual: { rpeMax: 6, maxStrength: 1, note: "Gentle movement, honour the slowdown. Yoga, walking, light mobility.", volumeMod: 0.7 },
  Follicular: { rpeMax: 8, maxStrength: 4, note: "Energy rising — progressive overload window. Push intensity.", volumeMod: 1.0 },
  Ovulatory: { rpeMax: 9, maxStrength: 4, note: "Peak performance. Power and speed work. Attempt PRs.", volumeMod: 1.0 },
  Luteal: { rpeMax: 7, maxStrength: 3, note: "Moderate steady-state. Reduce HIIT, prioritise recovery.", volumeMod: 0.8 },
};

const WEEK_THEMES = [
  { theme: "Foundation", rpeRange: "RPE 6-7", volumeMod: 1.0, sets: 3 },
  { theme: "Build", rpeRange: "RPE 7-8", volumeMod: 1.15, sets: 4 },
  { theme: "Peak", rpeRange: "RPE 8-9", volumeMod: 1.2, sets: 4 },
  { theme: "Deload", rpeRange: "RPE 5-6", volumeMod: 0.6, sets: 2 },
];

// ═══ PRE-BUILT SESSION TEMPLATES ═══
interface SessionTemplate {
  name: string;
  category: string;
  durationMin: number;
  intensity: string;
  bodyFocus: string[];
  warm_up: { name: string; duration: string }[];
  cool_down: { name: string; duration: string; target: string }[];
  sections: { label: string; exerciseQuery: { body_part?: string; category?: string; limit: number } }[];
}

const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    name: "Lower Body Strength",
    category: "strength",
    durationMin: 45,
    intensity: "high",
    bodyFocus: ["quadriceps", "hamstrings", "glutes", "calves"],
    warm_up: [
      { name: "Leg swings", duration: "10 each side" },
      { name: "Hip circles", duration: "10 each direction" },
      { name: "Banded clamshells", duration: "15 reps" },
      { name: "Bodyweight squats", duration: "10 reps" },
      { name: "Walking lunges", duration: "8 each leg" },
    ],
    cool_down: [
      { name: "Pigeon stretch", duration: "45s each side", target: "hip flexors/glutes" },
      { name: "Standing quad stretch", duration: "30s each side", target: "quadriceps" },
      { name: "Supine hamstring stretch", duration: "45s each side", target: "hamstrings" },
      { name: "Calf stretch against wall", duration: "30s each side", target: "calves" },
    ],
    sections: [
      { label: "Strength A — Compound Lifts", exerciseQuery: { body_part: "quadriceps", limit: 3 } },
      { label: "Accessory Work — Posterior Chain", exerciseQuery: { body_part: "hamstrings", limit: 3 } },
      { label: "Conditioning Finisher", exerciseQuery: { body_part: "glutes", limit: 2 } },
    ],
  },
  {
    name: "Upper Body Strength",
    category: "strength",
    durationMin: 45,
    intensity: "high",
    bodyFocus: ["chest", "shoulders", "triceps", "biceps", "lats"],
    warm_up: [
      { name: "Arm circles", duration: "10 each direction" },
      { name: "Band pull-aparts", duration: "15 reps" },
      { name: "Cat-cow", duration: "10 reps" },
      { name: "Thoracic rotations", duration: "8 each side" },
      { name: "Scapular push-ups", duration: "10 reps" },
    ],
    cool_down: [
      { name: "Doorway pec stretch", duration: "30s each side", target: "pectorals" },
      { name: "Cross-body shoulder stretch", duration: "30s each side", target: "posterior deltoid" },
      { name: "Tricep overhead stretch", duration: "30s each side", target: "triceps" },
      { name: "Child's pose with lateral reach", duration: "30s each side", target: "lats/obliques" },
    ],
    sections: [
      { label: "Strength A — Push", exerciseQuery: { body_part: "chest", limit: 3 } },
      { label: "Strength B — Pull", exerciseQuery: { body_part: "lats", limit: 3 } },
      { label: "Accessory — Arms", exerciseQuery: { body_part: "biceps", limit: 2 } },
    ],
  },
  {
    name: "Full Body Circuit",
    category: "circuit",
    durationMin: 40,
    intensity: "moderate",
    bodyFocus: ["quadriceps", "chest", "abdominals", "shoulders"],
    warm_up: [
      { name: "Inchworms", duration: "5 reps" },
      { name: "World's greatest stretch", duration: "5 each side" },
      { name: "Hip 90/90 transitions", duration: "8 each side" },
      { name: "Jumping jacks", duration: "20 reps" },
      { name: "Bear crawl", duration: "10m" },
    ],
    cool_down: [
      { name: "Pigeon stretch", duration: "45s each side", target: "hip flexors/glutes" },
      { name: "Doorway pec stretch", duration: "30s each side", target: "pectorals" },
      { name: "Supine twist", duration: "30s each side", target: "lower back/obliques" },
      { name: "Child's pose", duration: "60s", target: "full body relaxation" },
    ],
    sections: [
      { label: "Circuit A — Compound", exerciseQuery: { body_part: "quadriceps", limit: 3 } },
      { label: "Circuit B — Upper/Core", exerciseQuery: { body_part: "abdominals", limit: 3 } },
    ],
  },
  {
    name: "Active Recovery & Mobility",
    category: "active-recovery",
    durationMin: 30,
    intensity: "low",
    bodyFocus: [],
    warm_up: [
      { name: "Gentle walking", duration: "5 minutes" },
      { name: "Neck circles", duration: "10 each direction" },
      { name: "Shoulder rolls", duration: "10 each direction" },
    ],
    cool_down: [
      { name: "Forward fold", duration: "60s", target: "hamstrings/lower back" },
      { name: "Butterfly stretch", duration: "60s", target: "inner thighs" },
      { name: "Supine twist", duration: "45s each side", target: "spine/obliques" },
      { name: "Savasana", duration: "3 minutes", target: "full body relaxation" },
    ],
    sections: [
      { label: "Mobility Flow", exerciseQuery: { category: "stretch", limit: 6 } },
    ],
  },
  {
    name: "HIIT Conditioning",
    category: "hiit",
    durationMin: 30,
    intensity: "very-high",
    bodyFocus: ["quadriceps", "abdominals", "glutes"],
    warm_up: [
      { name: "High knees", duration: "30 seconds" },
      { name: "Butt kicks", duration: "30 seconds" },
      { name: "Arm circles", duration: "10 each direction" },
      { name: "Bodyweight squats", duration: "10 reps" },
      { name: "Mountain climbers", duration: "20 seconds" },
    ],
    cool_down: [
      { name: "Standing quad stretch", duration: "30s each side", target: "quadriceps" },
      { name: "Pigeon stretch", duration: "45s each side", target: "hip flexors" },
      { name: "Standing forward fold", duration: "45s", target: "hamstrings" },
      { name: "Deep breathing", duration: "2 minutes", target: "nervous system recovery" },
    ],
    sections: [
      { label: "HIIT Circuit", exerciseQuery: { body_part: "quadriceps", limit: 4 } },
      { label: "Core Finisher", exerciseQuery: { body_part: "abdominals", limit: 3 } },
    ],
  },
];

// Weekly schedule patterns by goal
const WEEKLY_PATTERNS: Record<string, number[]> = {
  // index into SESSION_TEMPLATES: 0=Lower, 1=Upper, 2=FullBody, 3=Recovery, 4=HIIT
  "Lose weight": [0, 4, 1, 3, 2, 4, -1],
  "Build muscle": [0, 1, 3, 0, 1, 2, -1],
  "Tone & define": [2, 4, 0, 3, 1, 4, -1],
  "Improve flexibility": [3, 2, 3, 0, 3, 2, -1],
  "Build endurance": [4, 2, 4, 3, 2, 4, -1],
  "Stress relief": [3, 2, 3, 0, 3, 2, -1],
  "Fix posture": [1, 3, 2, 3, 1, 3, -1],
  "More energy": [2, 4, 3, 2, 4, 3, -1],
  default: [0, 1, 3, 2, 4, 3, -1],
};

function getCyclePhase(cycleDay: number): string {
  if (cycleDay <= 5) return "Menstrual";
  if (cycleDay <= 13) return "Follicular";
  if (cycleDay <= 16) return "Ovulatory";
  return "Luteal";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goals, phase, cycleDay, fitnessLevel, equipment, injuries, sessionTime } = await req.json();

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Fetch exercises from DB
    const { data: exercises } = await supabase
      .from("exercises")
      .select("id, name, body_part, category, primary_muscles, equipment, cues, difficulty")
      .limit(500);

    const exercisesByPart: Record<string, any[]> = {};
    const exercisesByCat: Record<string, any[]> = {};
    for (const ex of (exercises || [])) {
      if (ex.body_part) {
        if (!exercisesByPart[ex.body_part]) exercisesByPart[ex.body_part] = [];
        exercisesByPart[ex.body_part].push(ex);
      }
      if (ex.category) {
        if (!exercisesByCat[ex.category]) exercisesByCat[ex.category] = [];
        exercisesByCat[ex.category].push(ex);
      }
    }

    const goalsList = (goals as string[]) || ["Tone & define"];
    const primaryGoal = goalsList[0] || "default";
    const pattern = WEEKLY_PATTERNS[primaryGoal] || WEEKLY_PATTERNS.default;
    const currentPhase = getCyclePhase(cycleDay || 14);
    const phaseConfig = PHASE_CONFIG[currentPhase] || PHASE_CONFIG.Follicular;

    const summary = `Your 4-week ${goalsList.join(" & ")} program adapts to your ${currentPhase.toLowerCase()} phase. ${phaseConfig.note} Progressive overload builds across Foundation → Build → Peak → Deload weeks. Your first session is ready in the Today tab.`;

    const weeks = WEEK_THEMES.map((weekTheme, wi) => {
      const days = pattern.map((templateIdx, di) => {
        const dayNum = di + 1;
        if (templateIdx === -1) {
          return {
            day: dayNum,
            name: "Rest Day",
            category: "rest",
            durationMin: 0,
            intensity: "none",
            rpe_range: "N/A",
            warm_up: [],
            main_block: [],
            cool_down: [],
            coaching_note: "Full rest. Hydrate, stretch gently if desired. Your body grows stronger during recovery.",
          };
        }

        const template = SESSION_TEMPLATES[templateIdx];
        const weekName = `${template.name} (${weekTheme.theme})`;
        const effectiveRpe = Math.min(
          parseInt(weekTheme.rpeRange.replace(/\D/g, "").slice(-1)) || 7,
          phaseConfig.rpeMax
        );

        // Build main block from DB exercises
        const mainBlock = template.sections.map(section => {
          const pool = section.exerciseQuery.body_part
            ? (exercisesByPart[section.exerciseQuery.body_part] || [])
            : (exercisesByCat[section.exerciseQuery.category || "strength"] || []);

          // Deterministic selection using week + day as seed
          const offset = (wi * 7 + di) * 3;
          const selected = pool.slice(offset % Math.max(1, pool.length - section.exerciseQuery.limit), offset % Math.max(1, pool.length - section.exerciseQuery.limit) + section.exerciseQuery.limit);
          if (selected.length === 0 && pool.length > 0) {
            selected.push(...pool.slice(0, section.exerciseQuery.limit));
          }

          return {
            section_label: section.label,
            exercises: selected.map(ex => ({
              name: ex.name,
              sets: weekTheme.sets,
              reps_or_duration: template.category === "hiit" ? "40 sec" : "12",
              rest: template.category === "hiit" ? "20 sec" : "90 sec",
              tempo: "2-1-1",
              rpe: `RPE ${effectiveRpe}`,
              form_cue: ex.cues?.[0] || "Control the movement through full range of motion.",
            })),
          };
        });

        return {
          day: dayNum,
          name: weekName,
          category: template.category,
          durationMin: template.durationMin,
          intensity: template.intensity,
          rpe_range: `RPE ${Math.max(5, effectiveRpe - 1)}-${effectiveRpe}`,
          warm_up: template.warm_up,
          main_block: mainBlock,
          cool_down: template.cool_down,
          coaching_note: `${weekTheme.theme} week: ${phaseConfig.note}`,
        };
      });

      return { week: wi + 1, theme: weekTheme.theme, days };
    });

    return new Response(JSON.stringify({ summary, weeks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("workout-plan error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
