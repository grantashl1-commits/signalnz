// Signal Learning Modules — cycle-rooted education
// 6 modules · 22 lessons. Rendered with the shared course player
// (LessonPlayer / ActivityRenderer) used by the Connect & Embodiment courses.
//
// Activity ids are prefixed "mod-" so progress can be filtered out of the
// shared connect_course_progress table (same pattern as the "emb-" course).
//
// Educational content only — general wellbeing information, not medical
// advice. Where a topic touches clinical territory (supplements, iron,
// nervous-system distress) the lessons point the reader to a clinician.

import type { CourseModule } from "@/data/connect-course";

export const MODULES_COURSE: CourseModule[] = [
  // ───────────────────────── MODULE 1 ─────────────────────────
  {
    id: "mod-module-1",
    title: "Cycle Literacy",
    subtitle: "Understand your hormonal blueprint.",
    description:
      "Your cycle is a monthly rhythm, not a monthly problem. This module walks through the four phases, what your hormones are actually doing in each, and how to read your own signals — without turning it into another thing to obsess over.",
    icon: "lucide-moon",
    estimatedMinutes: 45,
    sourceBooks: ["In the FLO — Alisa Vitti", "Period Repair Manual — Lara Briden", "Roar / Next Level — Stacy Sims"],
    lessons: [
      {
        id: "mod-m1-l1",
        title: "Lesson 1 · The Four Phases, Simply",
        description: "A plain-language map of the menstrual, follicular, ovulatory, and luteal phases.",
        estimatedMinutes: 12,
        activities: [
          {
            id: "mod-m1-l1-a1",
            type: "carousel",
            title: "One Cycle, Four Seasons",
            instruction: "The cycle is often described as four inner seasons. Swipe through each one.",
            content: {
              cards: [
                { title: "🌑 Menstrual — Winter (days ~1–5)", body: "Bleeding begins. Oestrogen and progesterone are at their lowest. Energy is often lower and inward-facing. A time for rest, reflection, and gentleness — not a time you have to push through." },
                { title: "🌱 Follicular — Spring (days ~6–13)", body: "Oestrogen rises as follicles develop. Energy, mood, and motivation tend to climb. Ideas come easily. A natural window for starting things and building." },
                { title: "☀️ Ovulatory — Summer (days ~14–16)", body: "Oestrogen peaks and an egg is released. Many feel most confident, social, and strong here. Verbal and physical capacity often peak around this time." },
                { title: "🍂 Luteal — Autumn (days ~17–28)", body: "Progesterone rises to support a possible pregnancy, then both hormones fall if there's no conception. Energy winds down; you may crave calm, warmth, and completion over novelty." },
                { title: "Why day counts vary", body: "These day ranges assume a ~28-day cycle, but anywhere from 21 to 35 days is common. Yours is yours. The phases still happen in the same order — the lengths just shift." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m1-l1-a2",
            type: "find_the_pair",
            title: "Match the Phase to Its Feeling",
            instruction: "Connect each phase with how it commonly shows up.",
            content: {
              instruction: "Tap a phase on the left, then its match on the right.",
              pairs: [
                ["Menstrual", "Lowest hormones — inward, restful, reflective"],
                ["Follicular", "Rising oestrogen — energised, curious, ready to begin"],
                ["Ovulatory", "Peak oestrogen — confident, social, strong"],
                ["Luteal", "Rising then falling progesterone — winding down, nesting"],
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m1-l1-a3",
            type: "reaction_slider",
            title: "Where Are You Today?",
            instruction: "No wrong answer — just noticing.",
            content: {
              question: "Which inner season does your body feel closest to right now?",
              options: ["Winter — low & inward", "Spring — building", "Summer — bright & open", "Autumn — winding down"],
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m1-l2",
        title: "Lesson 2 · What Your Hormones Are Doing",
        description: "Meet the four key hormones and the jobs they're actually performing.",
        estimatedMinutes: 12,
        activities: [
          {
            id: "mod-m1-l2-a1",
            type: "carousel",
            title: "The Cast of Characters",
            instruction: "Four hormones do most of the work across your cycle.",
            content: {
              cards: [
                { title: "Oestrogen — the builder", body: "Builds the uterine lining, supports mood, memory, and bone. Rises through the follicular phase and peaks at ovulation. Higher oestrogen often means more energy, verbal fluency, and drive." },
                { title: "Progesterone — the calmer", body: "Rises after ovulation to maintain the lining. It's warming and calming — it can raise body temperature slightly and improve sleep for some, but its withdrawal at the end of the cycle is linked to PMS symptoms." },
                { title: "LH & FSH — the messengers", body: "Follicle-stimulating hormone (FSH) recruits follicles early on; a luteinising hormone (LH) surge triggers ovulation. These are the brain's signals to the ovaries, rising and falling to keep the cycle moving." },
                { title: "It's a conversation, not a switch", body: "These hormones rise and fall in a coordinated loop between your brain and ovaries. Stress, under-eating, illness, and travel can all change the volume of that conversation." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m1-l2-a2",
            type: "single_choice",
            title: "Quick Check",
            instruction: "Which hormone rises after ovulation and has a calming, warming quality?",
            content: {
              question: "Which hormone rises after ovulation and tends to feel calming and warming?",
              options: ["Oestrogen", "Progesterone", "FSH", "Testosterone"],
              correctIndex: 1,
              explanation: "Progesterone rises in the luteal phase after ovulation. It's warming (it nudges body temperature up slightly) and calming for many — and its drop at cycle's end is tied to PMS.",
            },
            saveToVault: false,
          },
          {
            id: "mod-m1-l2-a3",
            type: "true_false",
            title: "Myth or Fact",
            instruction: "Consider the statement.",
            content: {
              statement: "A regular cycle has to be exactly 28 days to be healthy.",
              correctAnswer: false,
              explanation: "A cycle anywhere from about 21 to 35 days, that's reasonably consistent for you, is considered typical. 28 is an average, not a rule.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m1-l3",
        title: "Lesson 3 · Reading Your Own Signals",
        description: "The body signs that tell you where you are — no app required.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m1-l3-a1",
            type: "carousel",
            title: "Signals Worth Noticing",
            instruction: "Your body broadcasts where it is. A few reliable signs:",
            content: {
              cards: [
                { title: "Cervical fluid", body: "Dry or sticky early in the cycle, then wetter and stretchy (like egg white) approaching ovulation, then drier again after. This is one of the clearest real-time signs of your fertile window." },
                { title: "Energy & mood", body: "Many feel a lift in the follicular and ovulatory phases and a softening in the luteal phase. Tracking your energy is often more useful than tracking dates." },
                { title: "Basal body temperature", body: "Taken first thing on waking, temperature tends to be lower before ovulation and rises slightly after (thanks to progesterone). A sustained rise confirms ovulation has happened." },
                { title: "Cravings & appetite", body: "Appetite commonly increases in the luteal phase — your body's metabolic rate genuinely rises a little. Extra hunger before your period is physiology, not a failure of willpower." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m1-l3-a2",
            type: "open_response",
            title: "Your Own Pattern",
            instruction: "Reflection — this saves privately to your vault if you have journaling.",
            content: {
              prompt: "Think back over the last month or two. What's one signal your body reliably gives you — a shift in energy, sleep, appetite, mood, or skin — and roughly when in your cycle does it show up?",
              placeholder: "About a week before my period I notice...",
              minWords: 25,
            },
            tip: "You don't need perfect data. Noticing one honest pattern is the whole skill.",
            saveToVault: true,
          },
        ],
      },
      {
        id: "mod-m1-l4",
        title: "Lesson 4 · Charting Without Obsessing",
        description: "Track enough to learn from, little enough to stay free.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m1-l4-a1",
            type: "carousel",
            title: "Light-Touch Tracking",
            instruction: "Tracking should serve you, not rule you.",
            content: {
              cards: [
                { title: "Track the minimum", body: "Cycle start date plus one or two signals (energy, sleep, or mood) is plenty for most people. You're looking for patterns over months, not precision each day." },
                { title: "Watch the obsession line", body: "If tracking is raising anxiety, tightening control around food or exercise, or making you feel worse — that's a signal to zoom out or take a break. The goal is self-knowledge, not surveillance." },
                { title: "Three months tells a story", body: "One cycle is a data point; three cycles is a pattern. Give yourself a season before drawing conclusions about what's 'normal' for you." },
                { title: "When to get curious with a clinician", body: "Cycles consistently shorter than 21 or longer than 35 days, very heavy or very painful periods, or a sudden change from your normal are all worth raising with a healthcare professional." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m1-l4-a2",
            type: "knowledge_check",
            title: "Cycle Literacy Check",
            instruction: "A few questions to lock it in.",
            content: {
              intro: "Four quick questions on what you've learned.",
              passMark: 3,
              questions: [
                { question: "In which phase are oestrogen and progesterone both at their lowest?", options: ["Menstrual", "Follicular", "Ovulatory", "Luteal"], correct: 0, explanation: "The menstrual phase — hormones bottom out as bleeding begins." },
                { question: "What triggers ovulation?", options: ["A drop in FSH", "A surge in luteinising hormone (LH)", "A rise in progesterone", "The start of your period"], correct: 1, explanation: "An LH surge triggers the release of the egg around mid-cycle." },
                { question: "Which is a normal cycle length range?", options: ["Exactly 28 days", "21–35 days", "14–21 days", "35–50 days"], correct: 1, explanation: "Roughly 21–35 days, reasonably consistent for you, is typical." },
                { question: "What's the healthiest relationship with tracking?", options: ["Log everything, every day, precisely", "Track a minimum and watch for anxiety", "Never track anything", "Only track if trying to conceive"], correct: 1, explanation: "Track enough to learn from, and notice if it starts to feel like surveillance." },
              ],
            },
            saveToVault: false,
          },
        ],
      },
    ],
  },

  // ───────────────────────── MODULE 2 ─────────────────────────
  {
    id: "mod-module-2",
    title: "Vegan Hormonal Nutrition",
    subtitle: "Eat for your cycle, not against it.",
    description:
      "Eating plant-based through your cycle is entirely doable — it just asks for a little intention around protein, iron, and a few key nutrients. This module covers plant proteins, iron absorption, phase-by-phase plates, and when a supplement genuinely earns its place.",
    icon: "lucide-leaf",
    estimatedMinutes: 45,
    sourceBooks: ["How Not to Die — Michael Greger", "The Vegan Athlete", "Period Repair Manual — Lara Briden"],
    lessons: [
      {
        id: "mod-m2-l1",
        title: "Lesson 1 · Plant Proteins That Hold You",
        description: "Getting enough protein — and all the amino acids — on plants.",
        estimatedMinutes: 12,
        activities: [
          {
            id: "mod-m2-l1-a1",
            type: "carousel",
            title: "Protein, Built From Plants",
            instruction: "Protein matters more as we age and around strength training. Here's how plants deliver.",
            content: {
              cards: [
                { title: "Why protein matters", body: "Protein maintains muscle, supports hormone and neurotransmitter production, and keeps you full. Needs often rise with age and with strength training — many active women aim for roughly 1.4–2.0 g per kg of bodyweight." },
                { title: "The complete-protein myth", body: "You don't need to combine proteins at every meal. Eat a variety of legumes, grains, soy, nuts, and seeds across the day and you'll get all essential amino acids. Your body pools them." },
                { title: "The heavy hitters", body: "Tofu, tempeh, edamame, lentils, chickpeas, black beans, seitan, and soy milk are the density leaders. A cup of lentils or a block of tofu each carries roughly 18–20 g of protein." },
                { title: "Leucine — the muscle trigger", body: "Leucine helps switch on muscle-building. Soy (tofu, tempeh, edamame) is especially leucine-rich, which is why it's a useful anchor for plant-based strength eaters." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m2-l1-a2",
            type: "single_choice",
            title: "Quick Check",
            instruction: "Which statement about plant protein is true?",
            content: {
              question: "Do you need to combine specific plant proteins at every meal to get complete protein?",
              options: ["Yes — always pair rice and beans together", "No — variety across the day is enough", "Only at breakfast", "Only if you don't eat soy"],
              correctIndex: 1,
              explanation: "The 'complete protein at every meal' idea is outdated. Eating a variety of plant proteins across the day covers all essential amino acids.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m2-l2",
        title: "Lesson 2 · Iron Without the Slump",
        description: "Plant iron is real iron — you just help it land.",
        estimatedMinutes: 12,
        activities: [
          {
            id: "mod-m2-l2-a1",
            type: "carousel",
            title: "Getting Iron to Absorb",
            instruction: "Menstruating bodies lose iron monthly, so absorption matters.",
            content: {
              cards: [
                { title: "Non-heme iron", body: "Plant iron (non-heme) is absorbed less efficiently than animal iron — but you can dramatically improve uptake with a few simple pairings. Sources: lentils, tofu, pumpkin seeds, spinach, fortified cereals, blackstrap molasses." },
                { title: "Pair with vitamin C", body: "Vitamin C can multiply non-heme iron absorption several times over. Squeeze lemon on lentils, add capsicum to a stir-fry, or have citrus or kiwifruit alongside an iron-rich meal." },
                { title: "Mind the blockers", body: "Tea and coffee contain tannins that block iron absorption. Keep them away from iron-rich meals by an hour or so, especially if your iron runs low." },
                { title: "Don't self-diagnose", body: "Fatigue has many causes. If you suspect low iron, ask for a blood test rather than guessing — and don't take high-dose iron supplements without testing, as too much iron is harmful." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m2-l2-a2",
            type: "true_false",
            title: "Myth or Fact",
            instruction: "Consider the statement.",
            content: {
              statement: "Having a glass of orange juice with a lentil meal helps you absorb more iron.",
              correctAnswer: true,
              explanation: "True — vitamin C markedly boosts absorption of plant (non-heme) iron. Citrus, capsicum, kiwifruit, and berries all help.",
            },
            saveToVault: false,
          },
          {
            id: "mod-m2-l2-a3",
            type: "find_the_pair",
            title: "Helpers & Blockers",
            instruction: "Sort what helps iron absorption from what hinders it.",
            content: {
              instruction: "Match each item to its effect.",
              pairs: [
                ["Vitamin C (lemon, capsicum)", "Boosts plant iron absorption"],
                ["Tea & coffee with meals", "Blocks iron absorption"],
                ["Cooking in a cast-iron pan", "Adds a little iron to food"],
                ["Very high-dose iron, untested", "Potentially harmful — test first"],
              ],
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m2-l3",
        title: "Lesson 3 · Phase-by-Phase Plates",
        description: "Small shifts in what you eat across the cycle.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m2-l3-a1",
            type: "carousel",
            title: "Eating With the Rhythm",
            instruction: "You don't need a different diet each week — just gentle emphasis.",
            content: {
              cards: [
                { title: "Menstrual — replenish", body: "You're losing iron, so lean into iron-rich plants with vitamin C, warming cooked foods, and enough to eat. Soups, stews, lentil dhal, and dark leafy greens suit this inward time." },
                { title: "Follicular — build & brighten", body: "Rising energy pairs well with fresh, lighter foods, sprouted things, and plenty of variety. A good window for trying new recipes and lighter plant proteins like tempeh and edamame." },
                { title: "Ovulatory — support with fibre", body: "Higher oestrogen is supported by fibre, which helps your body clear hormones it's finished with. Load up on vegetables, whole grains, and colourful raw foods." },
                { title: "Luteal — steady the blood sugar", body: "Appetite rises and cravings peak. Steady blood sugar with protein, healthy fats, complex carbs, and magnesium-rich foods (dark chocolate, pumpkin seeds, leafy greens). Don't under-eat — your needs are genuinely higher here." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m2-l3-a2",
            type: "reaction_slider",
            title: "Your Cravings",
            instruction: "Just noticing your own pattern.",
            content: {
              question: "When do your cravings tend to peak?",
              options: ["Around my period", "The week before my period", "Mid-cycle", "They feel fairly constant"],
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m2-l4",
        title: "Lesson 4 · When Supplements Help",
        description: "The few worth considering on a plant-based diet — and how to be smart about it.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m2-l4-a1",
            type: "carousel",
            title: "Supplements, Honestly",
            instruction: "Food first — but a handful of nutrients genuinely deserve attention.",
            content: {
              cards: [
                { title: "B12 — non-negotiable", body: "Vitamin B12 isn't reliably available from plants. If you eat fully plant-based, a B12 supplement (or reliably fortified foods) is essential — a deficiency develops slowly and can cause lasting harm." },
                { title: "Vitamin D & omega-3", body: "Vitamin D depends on sun exposure and is widely low, especially in winter. Omega-3s (EPA/DHA) can come from an algae-based supplement rather than fish. Both are worth discussing with a clinician." },
                { title: "Iron, only if tested", body: "Iron is common to run low on when menstruating, but supplement only based on a blood test — not a guess. Excess iron is genuinely harmful." },
                { title: "The golden rule", body: "Supplements support a good diet; they don't replace one, and they aren't automatically safe. Talk to a doctor or dietitian before starting anything, especially if you're pregnant, trying, or on medication." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m2-l4-a2",
            type: "knowledge_check",
            title: "Nutrition Check",
            instruction: "Lock in the essentials.",
            content: {
              intro: "Four quick questions.",
              passMark: 3,
              questions: [
                { question: "Which nutrient is essentially not available from plants and must be supplemented on a vegan diet?", options: ["Vitamin C", "Vitamin B12", "Magnesium", "Fibre"], correct: 1, explanation: "B12 must come from a supplement or reliably fortified foods on a fully plant-based diet." },
                { question: "What best improves absorption of plant iron?", options: ["Tea with the meal", "Vitamin C with the meal", "Eating it cold", "Avoiding all fat"], correct: 1, explanation: "Vitamin C substantially boosts non-heme iron absorption." },
                { question: "Which soy foods are useful protein anchors?", options: ["Tofu, tempeh, edamame", "None — soy has no protein", "Only soy sauce", "Only soy oil"], correct: 0, explanation: "Tofu, tempeh, and edamame are protein- and leucine-rich." },
                { question: "Before starting an iron supplement you should…", options: ["Just take a high dose to be safe", "Get a blood test first", "Only take it at night", "Take it with coffee"], correct: 1, explanation: "Test first — excess iron is harmful, so supplement based on results, not guesses." },
              ],
            },
            saveToVault: false,
          },
        ],
      },
    ],
  },

  // ───────────────────────── MODULE 3 ─────────────────────────
  {
    id: "mod-module-3",
    title: "Strength Foundations",
    subtitle: "Build a body that supports your hormones.",
    description:
      "Strength training is one of the highest-leverage things you can do for long-term health — for bone, metabolism, mood, and resilience through perimenopause and beyond. This module demystifies why it matters now, your first lifts, how to load without burning out, and kind ways to track.",
    icon: "lucide-dumbbell",
    estimatedMinutes: 45,
    sourceBooks: ["Next Level — Stacy Sims", "Roar — Stacy Sims", "Starting Strength (adapted)"],
    lessons: [
      {
        id: "mod-m3-l1",
        title: "Lesson 1 · Why Strength Matters Now",
        description: "The case for lifting — especially for women, especially with age.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m3-l1-a1",
            type: "carousel",
            title: "What Strength Actually Buys You",
            instruction: "This isn't about aesthetics. It's about capacity.",
            content: {
              cards: [
                { title: "Bone insurance", body: "Bone density naturally declines with age and drops faster around menopause as oestrogen falls. Loading your skeleton through resistance training is one of the few things shown to protect and build bone." },
                { title: "Metabolic engine", body: "Muscle is metabolically active tissue. More muscle improves insulin sensitivity and how your body handles fuel — it's metabolic currency you spend for decades." },
                { title: "Mood & brain", body: "Resistance training is linked to lower anxiety and depression and better sleep. The strength you build in the gym shows up as steadiness in your life." },
                { title: "Independence, later", body: "The strength you build now is what lets you carry, climb, catch yourself, and stay independent decades from now. You're training for your 80-year-old self." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m3-l1-a2",
            type: "true_false",
            title: "Myth or Fact",
            instruction: "Consider the statement.",
            content: {
              statement: "Lifting weights will inevitably make women bulky.",
              correctAnswer: false,
              explanation: "Building large amounts of muscle is slow and hard, and hormonally most women won't 'bulk' easily. Strength training builds density, capacity, and shape — not automatic bulk.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m3-l2",
        title: "Lesson 2 · Your First Lifts",
        description: "The handful of movement patterns that cover almost everything.",
        estimatedMinutes: 12,
        activities: [
          {
            id: "mod-m3-l2-a1",
            type: "carousel",
            title: "The Foundational Patterns",
            instruction: "Master a few patterns and you can train your whole body.",
            content: {
              cards: [
                { title: "Squat", body: "Sit down and stand up under load — goblet squats, box squats, or bodyweight to start. Trains quads, glutes, and core. The pattern behind every chair you'll ever rise from." },
                { title: "Hinge", body: "Bend at the hips with a flat back — deadlifts, Romanian deadlifts, hip thrusts. Trains the powerful posterior chain: hamstrings, glutes, back. The pattern behind picking anything up safely." },
                { title: "Push & pull", body: "Push things away (press-ups, overhead press) and pull things toward you (rows, pulldowns). Together they build a balanced, capable upper body and protect your shoulders." },
                { title: "Carry & core", body: "Pick something heavy up and walk with it (farmer's carries), and brace the midline (planks). Carries build grip, posture, and whole-body strength that transfers straight to daily life." },
                { title: "Start light, earn load", body: "Learn each pattern with bodyweight or light weight until it feels smooth. Good technique first; heavier weight is a reward you earn once the movement is grooved." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m3-l2-a2",
            type: "find_the_pair",
            title: "Match Pattern to Movement",
            instruction: "Connect each pattern to an example lift.",
            content: {
              instruction: "Tap a pattern, then a matching exercise.",
              pairs: [
                ["Squat", "Goblet squat"],
                ["Hinge", "Romanian deadlift"],
                ["Push", "Overhead press"],
                ["Pull", "Dumbbell row"],
                ["Carry", "Farmer's carry"],
              ],
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m3-l3",
        title: "Lesson 3 · Loading Without Burning Out",
        description: "Progressive overload, recovery, and the art of adding just enough.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m3-l3-a1",
            type: "carousel",
            title: "How Strength Is Actually Built",
            instruction: "You get stronger between sessions, not during them.",
            content: {
              cards: [
                { title: "Progressive overload", body: "Muscle adapts to a demand slightly beyond what it's used to. Gradually add reps, sets, or weight over weeks. Small, steady increases beat big painful jumps every time." },
                { title: "Effort, not failure", body: "You don't need to train to total failure. Leaving one to three reps 'in the tank' (an RPE of 7–8) builds strength while keeping form clean and recovery manageable." },
                { title: "Recovery is the workout's other half", body: "Growth happens during rest, sleep, and eating enough. Train a muscle group hard, then give it 48-ish hours. More sessions with poor recovery isn't more progress." },
                { title: "Deload on purpose", body: "Every several weeks, ease off — lighter weights or less volume for a week. Planned backing-off prevents burnout and lets adaptation catch up. It's part of the plan, not a failure of it." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m3-l3-a2",
            type: "single_choice",
            title: "Quick Check",
            instruction: "What does 'progressive overload' mean?",
            content: {
              question: "Which best describes progressive overload?",
              options: ["Training to complete failure every set", "Gradually asking the body to do slightly more over time", "Doing the exact same workout forever", "Only ever lifting very heavy"],
              correctIndex: 1,
              explanation: "It's the gradual, steady increase in demand — more reps, sets, or load over weeks — that drives adaptation.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m3-l4",
        title: "Lesson 4 · Tracking That Feels Kind",
        description: "Measuring progress without turning training into pressure.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m3-l4-a1",
            type: "carousel",
            title: "Progress You Can Feel",
            instruction: "Numbers are one signal. They aren't the only one.",
            content: {
              cards: [
                { title: "Log the essentials", body: "Jot the exercise, weight, and reps. Next time, aim to beat one small thing — one more rep, a touch more weight, cleaner form. That's the whole game." },
                { title: "Progress is more than weight", body: "Strength, stamina, mood, sleep, confidence, and how daily tasks feel are all progress. On days the numbers stall, these are often still climbing." },
                { title: "Consistency over intensity", body: "Two or three sessions a week, done consistently for months, beats heroic weeks followed by burnout. Show up repeatedly and the results compound." },
                { title: "Be kind on off days", body: "Cycle phase, sleep, and stress all move your strength around day to day. A lighter session on a low day is wisdom, not weakness. Adjust the load, keep the habit." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m3-l4-a2",
            type: "open_response",
            title: "Your Strength Intention",
            instruction: "Reflection — saves privately to your vault if you have journaling.",
            content: {
              prompt: "What would you like strength training to give you over the next year — not a look, but a capability or feeling? What's one small, repeatable way you could start this week?",
              placeholder: "I want to feel... I could start by...",
              minWords: 25,
            },
            tip: "Capability goals ('carry the groceries in one trip', 'feel steady on stairs') keep training kind and motivating.",
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ───────────────────────── MODULE 4 ─────────────────────────
  {
    id: "mod-module-4",
    title: "Nervous System Reset",
    subtitle: "Regulate from the inside out.",
    description:
      "So much of how we feel is really the state of our nervous system. This module gently explains dysregulation, the vagus nerve, simple daily resets you can actually keep, and — importantly — how to tell when it's time to reach for deeper support.",
    icon: "lucide-activity",
    estimatedMinutes: 42,
    sourceBooks: ["The Polyvagal Theory — Stephen Porges", "The Body Keeps the Score — Bessel van der Kolk", "Anchored — Deb Dana"],
    lessons: [
      {
        id: "mod-m4-l1",
        title: "Lesson 1 · What Dysregulation Feels Like",
        description: "Naming the states your nervous system moves through.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m4-l1-a1",
            type: "carousel",
            title: "Three States, One System",
            instruction: "Your nervous system is always asking one question: am I safe?",
            content: {
              cards: [
                { title: "🟢 Regulated & safe", body: "Calm, connected, and able to think clearly. You can feel challenge without being overwhelmed, and rest without shutting down. This is the state where healing and connection happen." },
                { title: "🟡 Activated — fight or flight", body: "Sympathetic mobilisation: racing heart, tight chest, restlessness, irritability, anxiety. Your body has decided there's a threat and is preparing to act, whether or not there's real danger." },
                { title: "🔴 Shut down — freeze", body: "When threat feels inescapable, the system collapses: numbness, fog, exhaustion, disconnection, going through the motions. This is protection too — the body conserving and hiding." },
                { title: "It's not a character flaw", body: "These are automatic, ancient survival responses — not choices or weaknesses. You can't 'think' your way out, but you can work with the body to shift states. That's a skill you can build." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m4-l1-a2",
            type: "reaction_slider",
            title: "Checking In",
            instruction: "Honestly — where are you right now?",
            content: {
              question: "Which state feels closest for you today?",
              options: ["Green — settled", "Yellow — activated", "Red — shut down", "Somewhere in between"],
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m4-l2",
        title: "Lesson 2 · The Vagus Nerve, Gently Explained",
        description: "The body's brake pedal — and how to use it.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m4-l2-a1",
            type: "carousel",
            title: "Meet Your Vagus Nerve",
            instruction: "A long, wandering nerve that helps bring you back to calm.",
            content: {
              cards: [
                { title: "The calming highway", body: "The vagus nerve runs from your brainstem to your heart, lungs, and gut. It's the main pathway of the parasympathetic 'rest and digest' system — your body's brake pedal after stress." },
                { title: "The exhale is the key", body: "A long, slow exhale stimulates the vagus nerve and downshifts your system. Breathe in for a count of four, out for six or eight. Longer out-breaths than in-breaths, repeated, are quietly powerful." },
                { title: "Sound and cold", body: "The vagus connects to your vocal cords and face — so humming, singing, and gargling gently tone it. So can splashing cold water on your face, which triggers a natural calming reflex." },
                { title: "Co-regulation", body: "The fastest route to calm is often another calm nervous system. A safe person's steady presence, a warm voice, or a trusted animal can settle you faster than doing it alone. We're wired to regulate together." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m4-l2-a2",
            type: "true_false",
            title: "Myth or Fact",
            instruction: "Consider the statement.",
            content: {
              statement: "A longer exhale than inhale helps calm the nervous system.",
              correctAnswer: true,
              explanation: "True — extending the out-breath stimulates the vagus nerve and shifts you toward the parasympathetic 'rest and digest' state.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m4-l3",
        title: "Lesson 3 · Daily Resets",
        description: "Small, repeatable practices that keep you regulated.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m4-l3-a1",
            type: "carousel",
            title: "A Toolkit for the Day",
            instruction: "You don't need an hour. You need repetition.",
            content: {
              cards: [
                { title: "Physiological sigh", body: "Two inhales through the nose (a big one, then a small top-up), followed by a long exhale through the mouth. A couple of rounds can noticeably lower stress in under a minute." },
                { title: "Orient to safety", body: "Slowly look around the room and let your eyes rest on things that are neutral or pleasant. This tells your brain, in its own language, that there's no threat here right now." },
                { title: "Move it through", body: "Activation is energy meant for movement. A brisk walk, a shake-out, or a stretch lets the stress chemistry complete its cycle rather than staying stuck in the body." },
                { title: "Anchor the morning & night", body: "A minute of slow breathing when you wake, and again before bed, trains your baseline over time. Small daily doses beat occasional big efforts. Consistency is the active ingredient." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m4-l3-a2",
            type: "single_choice",
            title: "Quick Check",
            instruction: "Which is the 'physiological sigh'?",
            content: {
              question: "How do you perform a physiological sigh?",
              options: ["One slow breath in and out", "Two inhales through the nose, then a long exhale out the mouth", "Holding your breath as long as possible", "Breathing fast for a minute"],
              correctIndex: 1,
              explanation: "A double inhale (big, then a small top-up) followed by a long exhale is the physiological sigh — a fast way to downshift.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m4-l4",
        title: "Lesson 4 · When to Seek Deeper Support",
        description: "Self-regulation is powerful — and it has limits worth respecting.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m4-l4-a1",
            type: "carousel",
            title: "Knowing When to Reach Out",
            instruction: "Tools help. Sometimes you also need a person.",
            content: {
              cards: [
                { title: "Tools have a ceiling", body: "Breathing and grounding are genuinely useful, but they're not a substitute for care when distress is deep, persistent, or rooted in trauma. Needing more than self-help is human, not failure." },
                { title: "Signs it's time", body: "Persistent low mood or anxiety, sleep that won't settle, feeling numb or disconnected for weeks, flashbacks, or relying on substances to cope are all signals to talk to a professional." },
                { title: "Who can help", body: "A GP is a good first door — they can rule out physical causes and refer you. Trauma-informed therapists, and modalities like somatic therapy or EMDR, are specifically designed for a dysregulated system." },
                { title: "In crisis, reach out now", body: "If you're thinking about harming yourself, please contact a crisis line or emergency services immediately. In New Zealand you can call or text 1737 any time to talk with a trained counsellor. You deserve support." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m4-l4-a2",
            type: "knowledge_check",
            title: "Nervous System Check",
            instruction: "A gentle recap.",
            content: {
              intro: "Four questions to close the module.",
              passMark: 3,
              questions: [
                { question: "Which nerve is central to the body's 'rest and digest' calming response?", options: ["The sciatic nerve", "The vagus nerve", "The optic nerve", "The femoral nerve"], correct: 1, explanation: "The vagus nerve is the main pathway of the parasympathetic calming system." },
                { question: "Which breathing pattern helps you calm down?", options: ["Longer exhale than inhale", "Rapid shallow breathing", "Holding your breath", "Longer inhale than exhale"], correct: 0, explanation: "Extending the exhale stimulates the vagus nerve and downshifts the system." },
                { question: "A red / 'freeze' state usually feels like…", options: ["Racing and restless", "Numb, foggy, shut down", "Calm and connected", "Energised and social"], correct: 1, explanation: "Freeze is the shut-down state — numbness, fog, disconnection, collapse." },
                { question: "Self-regulation tools are…", options: ["A full replacement for professional care", "Useful, but not a substitute for support when distress is deep", "Only for people without real problems", "A sign of weakness"], correct: 1, explanation: "They're genuinely helpful and also have limits — deeper or persistent distress deserves professional support." },
              ],
            },
            saveToVault: false,
          },
        ],
      },
    ],
  },

  // ───────────────────────── MODULE 5 ─────────────────────────
  {
    id: "mod-module-5",
    title: "Seed Cycling & Phytoestrogens",
    subtitle: "Harness plant power for hormonal balance.",
    description:
      "Seed cycling is a popular, gentle food practice some use to support their cycle. This module explains the rhythm, what phytoestrogens actually are, and how to build it into your week — with an honest note on what the evidence does and doesn't show.",
    icon: "lucide-sprout",
    estimatedMinutes: 32,
    sourceBooks: ["Period Repair Manual — Lara Briden", "WomanCode — Alisa Vitti"],
    lessons: [
      {
        id: "mod-m5-l1",
        title: "Lesson 1 · The Seed-Cycling Rhythm",
        description: "Which seeds, when, and why people do it.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m5-l1-a1",
            type: "carousel",
            title: "How Seed Cycling Works",
            instruction: "A simple two-phase food rhythm across the month.",
            content: {
              cards: [
                { title: "First half — flax & pumpkin", body: "From day 1 (first day of your period) to ovulation, the practice uses a daily tablespoon each of ground flaxseed and pumpkin seeds — chosen to gently support the oestrogen-rising follicular phase." },
                { title: "Second half — sesame & sunflower", body: "From ovulation to your next period, the practice switches to a daily tablespoon each of ground sesame and sunflower seeds — chosen to support the progesterone-dominant luteal phase." },
                { title: "Grind them fresh", body: "Seeds are best ground and eaten fresh so their oils and lignans stay intact. Stir into porridge, smoothies, yoghurt, or salads. Store ground seeds in the fridge." },
                { title: "An honest note on evidence", body: "Seed cycling is popular and low-risk, but robust scientific evidence that it changes hormone levels is limited. The seeds are genuinely nutritious regardless — think of it as a nourishing habit, not a guaranteed treatment." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m5-l1-a2",
            type: "find_the_pair",
            title: "Match Phase to Seeds",
            instruction: "Which seeds go with which half of the cycle?",
            content: {
              instruction: "Tap a phase, then its seeds.",
              pairs: [
                ["First half (menstrual → ovulation)", "Flax + pumpkin seeds"],
                ["Second half (ovulation → period)", "Sesame + sunflower seeds"],
              ],
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m5-l2",
        title: "Lesson 2 · Phytoestrogens, Demystified",
        description: "What these plant compounds are — and aren't.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m5-l2-a1",
            type: "carousel",
            title: "Understanding Phytoestrogens",
            instruction: "Plant compounds that gently interact with oestrogen receptors.",
            content: {
              cards: [
                { title: "What they are", body: "Phytoestrogens are natural plant compounds with a structure loosely similar to oestrogen. They can weakly attach to oestrogen receptors — far more gently than your own hormones. Main types: lignans (flax, sesame) and isoflavones (soy, legumes)." },
                { title: "A gentle modulator", body: "Because they're weak, phytoestrogens can act as a soft buffer — nudging effects up where your own oestrogen is low, and gently competing where it's high. 'Gentle' is the key word." },
                { title: "The soy myth", body: "Moderate whole-soy intake (tofu, tempeh, edamame, soy milk) is safe and, in research, is associated with neutral-to-beneficial effects for most people — not the hormonal havoc internet myths suggest." },
                { title: "Food, not megadose", body: "The benefits are tied to whole foods in normal amounts, not concentrated supplements. If you have a hormone-sensitive condition, check high-dose phytoestrogen supplements with your doctor first." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m5-l2-a2",
            type: "true_false",
            title: "Myth or Fact",
            instruction: "Consider the statement.",
            content: {
              statement: "Eating moderate amounts of whole soy foods is dangerous for hormones.",
              correctAnswer: false,
              explanation: "False — moderate whole-soy intake is considered safe and often beneficial in research. The 'soy wrecks hormones' claim isn't supported for typical dietary amounts.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m5-l3",
        title: "Lesson 3 · Building It Into Your Week",
        description: "Making the habit stick without fuss.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m5-l3-a1",
            type: "carousel",
            title: "Make It Effortless",
            instruction: "A habit only helps if it's easy to keep.",
            content: {
              cards: [
                { title: "Batch and store", body: "Grind a few days of seeds at once and keep them in a labelled jar in the fridge — 'first half' and 'second half'. Two jars, ready to sprinkle, removes the daily friction." },
                { title: "Anchor to a meal", body: "Attach your daily tablespoon to something you already do — morning porridge, a smoothie, or yoghurt. Habits stick best when they ride on an existing routine." },
                { title: "If your cycle is irregular", body: "No clear ovulation to switch on? You can simply alternate two weeks on each seed blend, or focus on eating all four seeds regularly. The nourishment stands regardless of precise timing." },
                { title: "Keep it light", body: "This is a gentle, optional practice — not a test to pass. Missed days don't undo anything. Let it be a small act of care, not another rule." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m5-l3-a2",
            type: "open_response",
            title: "Your Simple Plan",
            instruction: "Reflection — saves privately to your vault if you have journaling.",
            content: {
              prompt: "If you wanted to try seed cycling, which existing meal could you attach it to, and what's one thing that would make it easy to remember?",
              placeholder: "I could add the seeds to my... and keep the jar...",
              minWords: 20,
            },
            saveToVault: true,
          },
        ],
      },
    ],
  },

  // ───────────────────────── MODULE 6 ─────────────────────────
  {
    id: "mod-module-6",
    title: "Sleep & Cortisol",
    subtitle: "The foundation everything else depends on.",
    description:
      "Sleep and your stress hormone, cortisol, sit underneath everything — mood, cycle, appetite, training, recovery. This module maps your cortisol curve, builds a wind-down that actually works, and helps you reclaim mornings without dread.",
    icon: "lucide-sunrise",
    estimatedMinutes: 32,
    sourceBooks: ["Why We Sleep — Matthew Walker", "Roar — Stacy Sims", "Period Repair Manual — Lara Briden"],
    lessons: [
      {
        id: "mod-m6-l1",
        title: "Lesson 1 · Your Cortisol Curve",
        description: "The daily rhythm of your main stress hormone.",
        estimatedMinutes: 11,
        activities: [
          {
            id: "mod-m6-l1-a1",
            type: "carousel",
            title: "Cortisol Across the Day",
            instruction: "Cortisol isn't the enemy — its timing is what matters.",
            content: {
              cards: [
                { title: "Morning peak", body: "Healthy cortisol rises sharply in the first hour after waking — the 'cortisol awakening response'. This is what helps you feel alert and get going. A morning peak is exactly what you want." },
                { title: "The gentle slide", body: "From that peak, cortisol should taper down across the day, reaching its lowest in the evening so melatonin can rise and sleep can come. A smooth downward curve is the goal." },
                { title: "When the curve flattens", body: "Chronic stress, poor sleep, and under-recovery can flatten or invert the curve — groggy mornings, wired nights ('tired but wired'). The fix is rarely more caffeine; it's supporting the rhythm itself." },
                { title: "Cortisol and your cycle", body: "Cortisol and reproductive hormones share resources. Sustained high stress can disrupt ovulation and worsen PMS — which is why sleep and stress care are genuine cycle care, not extras." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m6-l1-a2",
            type: "single_choice",
            title: "Quick Check",
            instruction: "When should cortisol naturally be highest?",
            content: {
              question: "In a healthy rhythm, cortisol is highest…",
              options: ["Late at night", "In the first hour after waking", "Right before bed", "It should stay flat all day"],
              correctIndex: 1,
              explanation: "Cortisol should peak in the morning (the cortisol awakening response) and taper down through the day.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m6-l2",
        title: "Lesson 2 · Wind-Down That Actually Works",
        description: "An evening routine that lets cortisol fall and melatonin rise.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m6-l2-a1",
            type: "carousel",
            title: "Building the Off-Ramp",
            instruction: "Sleep isn't a switch — it's a landing you set up for.",
            content: {
              cards: [
                { title: "Dim the light", body: "Bright light — especially blue light from screens — suppresses melatonin. In the last hour before bed, dim the lights, lower your screens' brightness, and let your body read the cue that night has come." },
                { title: "Cool and dark", body: "Your core temperature needs to drop slightly for deep sleep. A cool (around 18°C), dark, quiet room is one of the most reliable upgrades you can make. Blackout and a fan or open window help." },
                { title: "Mind the stimulants", body: "Caffeine can linger 6–8 hours, so an afternoon coffee may still be in your system at bedtime. Alcohol helps you fall asleep but fragments the second half of the night. Both are worth watching." },
                { title: "A consistent landing", body: "Going to bed and waking at similar times — even on weekends — anchors your whole rhythm. A short repeated wind-down (dim lights, warm shower, a few pages, slow breathing) signals your body it's safe to let go." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m6-l2-a2",
            type: "true_false",
            title: "Myth or Fact",
            instruction: "Consider the statement.",
            content: {
              statement: "A nightcap of alcohol improves the quality of your sleep.",
              correctAnswer: false,
              explanation: "Alcohol can help you fall asleep faster but it fragments sleep later in the night and suppresses restorative REM — so overall quality drops.",
            },
            saveToVault: false,
          },
        ],
      },
      {
        id: "mod-m6-l3",
        title: "Lesson 3 · Reclaiming Morning",
        description: "Using light and rhythm to wake up without dread.",
        estimatedMinutes: 10,
        activities: [
          {
            id: "mod-m6-l3-a1",
            type: "carousel",
            title: "Setting the Day's Clock",
            instruction: "Morning is where tomorrow night's sleep is decided.",
            content: {
              cards: [
                { title: "Morning light first", body: "Getting daylight into your eyes soon after waking — a walk, a coffee outside, or by a bright window — anchors your body clock, sharpens the morning cortisol peak, and helps melatonin arrive on time that night." },
                { title: "Delay the caffeine", body: "Waiting 60–90 minutes after waking for your first coffee lets your natural cortisol do its job first, and can mean steadier energy with less of an afternoon crash." },
                { title: "Move a little", body: "Gentle morning movement — a stretch, a short walk — reinforces the wake signal and lifts mood. It doesn't need to be a workout; it needs to be light and consistent." },
                { title: "Be patient with the shift", body: "A rhythm that's been off for months won't reset in one day. Hold the light, timing, and wind-down cues steadily for a couple of weeks and your body will follow. You're re-teaching a clock, gently." },
              ],
            },
            saveToVault: false,
          },
          {
            id: "mod-m6-l3-a2",
            type: "knowledge_check",
            title: "Sleep & Cortisol Check",
            instruction: "One last recap to finish the course.",
            content: {
              intro: "Four questions to close it out.",
              passMark: 3,
              questions: [
                { question: "A healthy cortisol curve looks like…", options: ["Flat all day", "High at night, low in the morning", "High in the morning, tapering down through the day", "Random spikes"], correct: 2, explanation: "Cortisol should peak in the morning and slide down toward evening." },
                { question: "What most reliably suppresses melatonin at night?", options: ["A cool room", "Bright and blue light", "A long exhale", "Morning sunlight"], correct: 1, explanation: "Bright, blue-rich light in the evening suppresses melatonin and delays sleep." },
                { question: "The best thing for anchoring your body clock in the morning is…", options: ["An immediate strong coffee", "Getting daylight into your eyes", "Staying in a dark room", "Checking your phone in bed"], correct: 1, explanation: "Early daylight sets your circadian clock and improves that night's sleep." },
                { question: "Why does sleep count as cycle care?", options: ["It doesn't — they're unrelated", "Cortisol and reproductive hormones share resources, so stress and sleep affect the cycle", "Only because you feel tired", "Only during your period"], correct: 1, explanation: "Chronic stress and poor sleep can disrupt ovulation and worsen PMS — sleep and stress care are genuine cycle care." },
              ],
            },
            saveToVault: false,
          },
        ],
      },
    ],
  },
];
