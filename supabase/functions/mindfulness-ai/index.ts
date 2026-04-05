import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Practice recommendations mapped by emotional state + phase
const PRACTICE_MAP: Record<string, string[]> = {
  anxiety: ["ground-003", "quick-002", "med-004"],
  stress: ["med-004", "quick-001", "med-005"],
  overwhelm: ["ground-003", "quick-002", "med-005"],
  tired: ["med-005", "sleep-001", "ground-002"],
  sleep: ["sleep-001", "ground-002", "sleep-003"],
  sadness: ["med-002", "med-003", "presence-003"],
  emotional: ["med-002", "presence-003", "inner-001"],
  heavy: ["presence-003", "phase-004", "inner-002"],
  reset: ["quick-001", "quick-004", "med-004"],
  luteal: ["phase-004", "presence-003", "ground-003"],
  menstrual: ["phase-001", "quick-002", "ground-002"],
  short: ["quick-001", "quick-003", "quick-004"],
  morning: ["ground-001", "quick-005", "quick-004"],
  evening: ["ground-002", "sleep-003", "sleep-002"],
  focus: ["quick-003", "quick-005", "med-004"],
  transition: ["quick-004", "quick-001", "ground-001"],
  "inner-child": ["inner-001", "inner-002", "med-006"],
  "self-care": ["inner-003", "presence-001", "quick-005"],
  default: ["quick-001", "med-004", "med-005"],
};

function detectIntent(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("anxi") || lower.includes("can't settle") || lower.includes("nervous")) return "anxiety";
  if (lower.includes("stress")) return "stress";
  if (lower.includes("overwhelm")) return "overwhelm";
  if (lower.includes("tired") || lower.includes("exhaust") || lower.includes("fatigue")) return "tired";
  if (lower.includes("sleep") || lower.includes("can't sleep") || lower.includes("insomnia")) return "sleep";
  if (lower.includes("sad") || lower.includes("cry") || lower.includes("grief")) return "sadness";
  if (lower.includes("emotional") || lower.includes("feeling")) return "emotional";
  if (lower.includes("heavy") || lower.includes("weight") || lower.includes("burden")) return "heavy";
  if (lower.includes("reset") || lower.includes("in my head") || lower.includes("stuck")) return "reset";
  if (lower.includes("luteal") || lower.includes("pms")) return "luteal";
  if (lower.includes("menstrual") || lower.includes("period") || lower.includes("bleed")) return "menstrual";
  if (lower.includes("short") || lower.includes("5 min") || lower.includes("quick")) return "short";
  if (lower.includes("morning")) return "morning";
  if (lower.includes("evening") || lower.includes("night") || lower.includes("wind down")) return "evening";
  if (lower.includes("focus") || lower.includes("concentrate") || lower.includes("distracted")) return "focus";
  if (lower.includes("transition") || lower.includes("between") || lower.includes("commute")) return "transition";
  if (lower.includes("inner child") || lower.includes("younger")) return "inner-child";
  if (lower.includes("self-care") || lower.includes("boundaries")) return "self-care";
  return "default";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { input, currentPhase, currentCycleDay, cycleMode, symptoms } = await req.json();

    const intent = detectIntent(input || "");
    const practiceIds = PRACTICE_MAP[intent] || PRACTICE_MAP.default;

    // Phase-aware: prefer phase-specific practices when in menstrual or luteal
    let selectedId = practiceIds[0];
    if (currentPhase === "menstrual" && practiceIds.includes("phase-001")) {
      selectedId = "phase-001";
    } else if (currentPhase === "luteal" && practiceIds.includes("phase-004")) {
      selectedId = "phase-004";
    }

    // Build explanation
    const phaseContext = currentPhase
      ? ` You're on day ${currentCycleDay || "?"} of your ${currentPhase} phase${cycleMode === "perimenopause" ? " (perimenopause mode)" : ""}.`
      : "";

    const symptomContext = symptoms ? ` You've noted ${symptoms} recently.` : "";

    const explanations: Record<string, string> = {
      "med-001": "The body scan is Signal's foundational meditation — 20 minutes of progressive awareness that releases held tension and builds interoceptive connection.",
      "med-002": "RAIN helps you meet difficult emotions with compassion rather than resistance. Perfect for when feelings are close to the surface.",
      "med-003": "Loving-kindness begins where it should — with you. This practice rewires the habit of giving care without receiving it.",
      "med-004": "The Relaxation Response is one of the most evidence-based stress-reduction protocols ever studied. 10 minutes measurably reduces cortisol.",
      "med-005": "Non-Sleep Deep Rest is deliberate neurological restoration. 10 minutes produces measurable dopamine replenishment.",
      "med-006": "IFS helps you meet the inner parts that protect, worry, and push — with curiosity instead of judgement.",
      "read-001": "A 5-minute morning reflection to set your intention. The Stoics practised this daily — Signal adapts it for your cycle.",
      "read-002": "Real self-care isn't bath bombs. It's boundaries, values, and sitting with what's hard.",
      "read-003": "Your body remembers what your mind forgets. This reading explains why somatic practices work.",
      "read-004": "Close the day with curiosity rather than judgement. A 5-minute evening review.",
      "read-005": "The stories we tell ourselves feel like facts — but they can be questioned and rewritten.",
      "inner-001": "A guided journey to meet your younger self. Trauma-sensitive, slow-paced, deeply somatic.",
      "inner-002": "Offering yourself the words you needed to hear. A gentle reparenting practice.",
      "inner-003": "Four questions about boundaries, values, self-compassion, and true needs.",
      "sleep-001": "Signal's full Yoga Nidra — 30 minutes of guided rest between waking and sleeping.",
      "sleep-002": "An extended 4-7-8 sleep protocol with body relaxation and guided breathing cycles.",
      "sleep-003": "Review the day briefly, then progressively release every muscle group into sleep.",
      "phase-001": "A deeply restorative practice for your inner winter — warmth, reflection, and release.",
      "phase-002": "Your energy is rising. Set intention for this cycle with expanding light visualisation.",
      "phase-003": "Your heart meridian is most active at ovulation. A loving-kindness practice for peak energy.",
      "phase-004": "The luteal phase is your truth-teller. This practice holds you through it with RAIN and self-compassion.",
      "quick-001": "The Half-Smile — 3 minutes of soft nervous system reset. A conscious lift at the corners of your mouth that signals ease.",
      "quick-002": "The Pebble — imagine yourself sinking through clear water to the riverbed. 5 minutes of effortless settling.",
      "quick-003": "Counting your breath from 1 to 10. Simple, powerful, and humbling. The losing count is the practice.",
      "quick-004": "Breathing to Arrive — a mantra practice for transitions. 'I have arrived. I am home.'",
      "quick-005": "Three questions to check in with what actually matters. A 5-minute values compass.",
      "ground-001": "Mindful tea or coffee — a 7-minute everyday mindfulness practice. The cup is the whole meditation.",
      "ground-002": "A 10-minute full body release. Surrender each body part to gravity. Excellent before sleep.",
      "ground-003": "Hold something solid — a 5-minute somatic anchor for intense anxiety. The fastest way back is through the body.",
      "presence-001": "A Day of Mindfulness — an invitation to slow everything down. One morning changes all the others.",
      "presence-002": "Who Am I Right Now? — a gentle self-inquiry. Not your roles. What is most alive in you?",
      "presence-003": "Making Room for What's Hard — move toward the feeling rather than away. This is what brave feels like.",
    };

    const explanation = (explanations[selectedId] || "This practice matches what you're describing.") + phaseContext + symptomContext;

    return new Response(
      JSON.stringify({
        practiceId: selectedId,
        explanation,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
