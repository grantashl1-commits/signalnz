import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══ PRE-BUILT DAILY SIGNAL TEMPLATES ═══
const PHASE_SIGNALS: Record<string, string[]> = {
  menstrual: [
    "Your body is doing important work right now — shedding and renewing. This is your inner winter. Honour the slowdown. A warm drink, gentle stretching, and permission to rest is exactly what this phase asks for.",
    "Day {day} of your cycle. Iron stores need replenishing — reach for dark leafy greens, lentils, or red meat today. Pair with vitamin C (kiwifruit, capsicum) for better absorption. Your energy will return. Be patient with yourself.",
    "Your hormones are at their lowest point right now, and that's okay. This quiet phase is where deep intuition lives. If you can, clear your schedule. Warm soups, gentle walks, and early bedtimes are your best friends.",
    "Cramping? Magnesium-rich foods can help — dark chocolate, pumpkin seeds, almonds. A warm wheat bag on your lower belly and slow, deep breathing will ease tension. Your body knows what it's doing.",
    "This is the phase where your left and right brain hemispheres communicate most effectively. If you've been sitting with a decision, your clarity may surprise you today. Journal what comes up.",
  ],
  follicular: [
    "Your oestrogen is rising and so is your energy. This is your spring — a natural window for starting new things, trying new recipes, and pushing a little harder in your workouts. Lean into the momentum.",
    "Day {day}: Your body is priming for peak performance. Muscles respond better to progressive overload right now. Add an extra rep, try a new exercise, or increase your weight slightly. Your body will thank you.",
    "Fermented foods are your best friend this phase — kimchi, yoghurt, miso, kefir. They support oestrogen metabolism and gut health. Your appetite is naturally lighter, so eat fresh, vibrant meals.",
    "Creative energy is peaking. If there's a project, conversation, or plan you've been putting off, now is the time. Your brain chemistry supports risk-taking and novelty right now.",
    "Zinc supports rising FSH this phase — reach for pumpkin seeds, chickpeas, or red meat. B vitamins from eggs and whole grains fuel your rising energy. You're building toward something. Trust the trajectory.",
  ],
  ovulatory: [
    "You're at your peak right now — communication skills, confidence, and physical performance are all elevated. If there's something to say, say it today. If there's a PR to attempt, this is your window.",
    "Day {day}: Oestrogen and testosterone are both peaking. Your body can handle more intensity, more social energy, more visibility. Light, antioxidant-rich meals (berries, leafy greens, citrus) support this phase.",
    "Your digestive capacity is strong right now. Raw vegetables, salads, and lighter meals feel best. Fibre is key — aim for 30g+ today to support oestrogen clearance. Stay hydrated.",
    "This is your most magnetic phase. Social connections, interviews, important conversations — schedule them here when you can. Your body language and vocal tone naturally draw people in.",
  ],
  luteal: [
    "Progesterone is rising, and your metabolism has shifted up by 100-300 calories per day. Cravings are physiological, not weakness. Redirect to nutrient-dense alternatives — dark chocolate instead of milk chocolate, roasted chickpeas instead of chips.",
    "Day {day}: Complex carbs are your serotonin support system right now. Sweet potato, oats, brown rice — these aren't comfort food indulgences, they're what your brain chemistry is asking for. Honour that.",
    "Energy may dip this week. Swap HIIT for steady-state cardio, pilates, or swimming. Magnesium-rich foods (dark chocolate, nuts, seeds) and B6 (banana, avocado) help ease PMS symptoms.",
    "If you're feeling more irritable or emotional, that's progesterone talking. It's not weakness — it's biology. Journaling, warm baths, and saying 'no' to unnecessary commitments are acts of wisdom right now.",
    "Your inner editor is active this phase. Use it productively — review work, refine plans, organise your space. Just don't let the inner critic convince you that your follicular-phase ideas were bad. They weren't.",
    "Bloating is common and temporary. Reduce salt, stay hydrated, and move gently. Your body is preparing for the next cycle. This is the winding down, the gathering inward. Let it be enough.",
  ],
};

const PERIMENOPAUSE_SIGNALS = [
  "Your cycles may feel unpredictable right now, and that's completely normal during perimenopause. Focus on strength training for bone density, omega-3 for brain health, and self-compassion for the transition.",
  "Hot flushes, brain fog, joint pain — these are hormonal, not psychological. Cooling foods, regular movement, and adequate sleep are your foundation. You're not losing yourself. You're becoming.",
  "Perimenopause can last 4-10 years. There's no timeline you're behind on. Prioritise strength work, calcium, vitamin D, and protein. Your body is resilient and adapting.",
];

function getDailySignal(cycleDay: number, phase: string, recentSymptoms: string[], recentMoods: string[], periodDueIn: number | undefined, cycleMode?: string): string {
  if (cycleMode === "perimenopause") {
    return PERIMENOPAUSE_SIGNALS[cycleDay % PERIMENOPAUSE_SIGNALS.length];
  }

  const phaseLower = phase.toLowerCase();
  const signals = PHASE_SIGNALS[phaseLower] || PHASE_SIGNALS.follicular;
  const idx = (cycleDay - 1) % signals.length;
  let signal = signals[idx].replace("{day}", String(cycleDay));

  // Add symptom-specific note
  if (recentSymptoms?.length > 0) {
    const symptoms = recentSymptoms.join(", ").toLowerCase();
    if (symptoms.includes("cramp")) signal += " For cramps, try a warm compress and gentle hip circles.";
    if (symptoms.includes("headache")) signal += " Stay hydrated and consider magnesium if headaches persist.";
    if (symptoms.includes("fatigue")) signal += " Extra rest today isn't laziness — it's recovery.";
    if (symptoms.includes("bloat")) signal += " Reduce salt, sip warm water with lemon, and move gently.";
  }

  if (periodDueIn !== undefined && periodDueIn <= 2 && periodDueIn >= 0) {
    signal += " Your period is due very soon. Stock up on comfort supplies and plan for a quieter day or two.";
  }

  return signal;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, messages, cycleDay, phase, phaseDescription, recentSymptoms, recentMoods, periodDueIn, cycle_mode, current_phase, cycle_day, recent_symptoms } = await req.json();

    if (type === "daily-signal") {
      // ── DETERMINISTIC: No AI needed ──
      const signal = getDailySignal(cycleDay || 1, phase || "follicular", recentSymptoms || [], recentMoods || [], periodDueIn, cycle_mode);
      return new Response(JSON.stringify({ message: signal }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "monthly-reflection") {
      // ── DETERMINISTIC: Template-based ──
      const p = (current_phase || phase || "follicular").toLowerCase();
      const reflections: Record<string, string> = {
        menstrual: "This past cycle, your body went through a complete renewal. Look back at your symptoms and moods — do you notice patterns? Tracking these patterns over time reveals your body's unique rhythm. Each cycle is data, not drama.",
        follicular: "Your energy peaked and your body responded. Notice which workouts felt best, which meals energised you, and which days you felt most creative. These aren't coincidences — they're your hormonal fingerprint.",
        ovulatory: "You likely felt more social, more confident, more capable this cycle. That's oestrogen and testosterone at work. Next cycle, try scheduling important events during this phase and watch what happens.",
        luteal: "The second half of your cycle asked you to slow down. Did you listen? The more you honour luteal energy — rest, boundaries, nourishing food — the smoother your next menstrual phase tends to be.",
      };
      return new Response(JSON.stringify({ message: reflections[p] || reflections.follicular }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "cycle-coach") {
      // ── LIGHT AI: Only for freeform questions ──
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      // Rate limiting: 10 per minute
      const userId = req.headers.get("Authorization")?.replace("Bearer ", "") || "anon";
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: rl } = await sb.rpc("check_rate_limit", {
        _user_id: userId, _function_name: "cycle-ai", _max_per_minute: 10,
      });
      if (rl && !rl.allowed) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const modeContext = cycle_mode === "perimenopause"
        ? " She is in perimenopause."
        : cycle_mode === "post-menopause"
        ? " She is post-menopause."
        : "";

      const symptomContext = recent_symptoms?.length > 0
        ? ` Recent symptoms: ${recent_symptoms.join(", ")}.`
        : "";

      const phaseCtx = current_phase && cycle_day
        ? ` Cycle day ${cycle_day}, ${current_phase} phase.`
        : "";

      const systemPrompt = `You are a warm women's health guide. Answer concisely (3-5 sentences). Evidence-based, never diagnose.${modeContext}${phaseCtx}${symptomContext} Address her as 'you'.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            ...(messages || []),
          ],
          max_tokens: 300,
          stream: false,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit reached." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify({ message: data.choices?.[0]?.message?.content || "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown type: ${type}`);
  } catch (e) {
    console.error("cycle-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
