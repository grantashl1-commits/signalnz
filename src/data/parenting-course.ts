// Parenting course data — inspired by evidence-based infant/toddler/teen approaches
// All content is original and synthesized from multiple parenting philosophies

import type { CourseModule, CourseLesson, CourseActivity } from "@/data/connect-course";

// ─── BABY SLEEP WEEKLY SCHEDULES ───────────────────────────────────────────

export interface SleepScheduleRow {
  time: string;
  activity: string;
  feedNote?: string;
}

export interface WeeklySchedule {
  weekLabel: string;
  ageRange: string;
  totalDaySleep: string;
  totalNightSleep: string;
  keyNotes: string[];
  schedule: SleepScheduleRow[];
}

export const BABY_SLEEP_SCHEDULES: WeeklySchedule[] = [
  {
    weekLabel: "Week 1–2",
    ageRange: "0–14 days",
    totalDaySleep: "5–5.5 hours",
    totalNightSleep: "8–10 hours (with feeds)",
    keyNotes: [
      "Baby will only stay awake 45–60 min at a stretch",
      "Feed on demand but aim for every 2.5–3 hours from start of feed",
      "Breast: 20–25 min on first breast, 10–15 min on second",
      "Bottle: 60–90ml (2–3oz) per feed for avg weight baby"
    ],
    schedule: [
      { time: "7:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20–25 min first side, 10–15 min second | Bottle: 60–90ml" },
      { time: "8:00–9:00 AM", activity: "Nap 1 — morning nap", feedNote: "Baby may only manage 45–60 min awake" },
      { time: "10:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20–25 min first side, 10–15 min second | Bottle: 60–90ml" },
      { time: "11:00–11:45 AM", activity: "Nap 2 — short sleep" },
      { time: "12:00 PM", activity: "Feed", feedNote: "Breast: 20–25 min | Bottle: 60–90ml" },
      { time: "12:30–2:30 PM", activity: "Nap 3 — long midday nap" },
      { time: "2:30 PM", activity: "Wake & Feed", feedNote: "Breast: 20 min each side | Bottle: 60–90ml" },
      { time: "3:30–5:00 PM", activity: "Nap 4 — afternoon nap" },
      { time: "5:00 PM", activity: "Wake & Feed", feedNote: "Breast: 15–20 min each side | Bottle: 60–90ml" },
      { time: "5:45 PM", activity: "Bath time — calm, warm, short (5–10 min)" },
      { time: "6:15 PM", activity: "Feed & settle", feedNote: "Top-up feed — Breast: 10–15 min | Bottle: 30–60ml" },
      { time: "6:30–7:00 PM", activity: "Bedtime — dark room, swaddle" },
      { time: "10:00–10:30 PM", activity: "Dream feed", feedNote: "Breast: 20 min | Bottle: 60–90ml — keep lights dim" },
      { time: "2:00–3:00 AM", activity: "Night feed", feedNote: "Breast: both sides | Bottle: 60–90ml — minimal stimulation" },
    ]
  },
  {
    weekLabel: "Week 2–4",
    ageRange: "2–4 weeks",
    totalDaySleep: "4.5–5 hours",
    totalNightSleep: "9–10 hours (with feeds)",
    keyNotes: [
      "Baby can stay awake 1–1.5 hours between naps",
      "Start distinguishing day from night — bright during day, dim at night",
      "Breast: 20–25 min on fuller breast, 10–15 min second",
      "Bottle: 90–120ml (3–4oz) per feed"
    ],
    schedule: [
      { time: "7:00 AM", activity: "Wake & Feed", feedNote: "Breast: 25 min + 15 min | Bottle: 90–120ml" },
      { time: "8:30–9:45 AM", activity: "Nap 1 — morning nap (max 75 min)" },
      { time: "10:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 90–120ml" },
      { time: "11:30 AM–12:00 PM", activity: "Nap 2 — short bridge nap (30 min)" },
      { time: "12:00 PM", activity: "Feed (if needed)", feedNote: "Breast: 15 min | Bottle: 60ml top-up" },
      { time: "12:30–2:30 PM", activity: "Nap 3 — main midday nap (up to 2 hrs)" },
      { time: "2:30 PM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 15 min | Bottle: 120ml" },
      { time: "4:00–5:00 PM", activity: "Nap 4 — late afternoon catnap" },
      { time: "5:00 PM", activity: "Wake & Feed (split feed part 1)", feedNote: "Breast: 15 min each | Bottle: 90ml" },
      { time: "5:45 PM", activity: "Bath — relaxing routine" },
      { time: "6:15 PM", activity: "Feed (split feed part 2) & settle", feedNote: "Breast: top-up 10 min | Bottle: 60ml" },
      { time: "6:30–7:00 PM", activity: "Bedtime" },
      { time: "10:00–10:30 PM", activity: "Dream feed", feedNote: "Breast: 20 min | Bottle: 120ml" },
      { time: "2:30–3:30 AM", activity: "Night feed (may push later)", feedNote: "Breast: both sides | Bottle: 90–120ml" },
    ]
  },
  {
    weekLabel: "Week 4–6",
    ageRange: "1–1.5 months",
    totalDaySleep: "4–4.5 hours",
    totalNightSleep: "10–11 hours (with feeds)",
    keyNotes: [
      "Baby may start sleeping one 4–5 hour stretch at night",
      "Awake windows extend to 1.5–2 hours",
      "Breast: ensure baby empties first breast before switching",
      "Bottle: 120–150ml (4–5oz) per feed"
    ],
    schedule: [
      { time: "7:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20–25 min + 10–15 min | Bottle: 120–150ml" },
      { time: "8:45–9:45 AM", activity: "Nap 1 (max 60 min)" },
      { time: "10:00 AM", activity: "Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 120–150ml" },
      { time: "11:45 AM", activity: "Small top-up if needed", feedNote: "Breast: 10 min | Bottle: 30–60ml" },
      { time: "12:00–2:00 PM", activity: "Nap 2 — main midday nap (2 hrs)" },
      { time: "2:00 PM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 15 min | Bottle: 150ml" },
      { time: "4:00–4:30 PM", activity: "Nap 3 — short catnap (30 min max)" },
      { time: "5:00 PM", activity: "Feed (split 1)", feedNote: "Breast: 15 min each | Bottle: 90ml" },
      { time: "5:45 PM", activity: "Bath" },
      { time: "6:15 PM", activity: "Feed (split 2) & settle", feedNote: "Breast: top-up | Bottle: 60ml" },
      { time: "7:00 PM", activity: "Bedtime" },
      { time: "10:30 PM", activity: "Dream feed", feedNote: "Breast: 20 min | Bottle: 120–150ml" },
      { time: "3:00–4:00 AM", activity: "Night feed (dropping naturally)", feedNote: "Breast: one side may suffice | Bottle: 90–120ml" },
    ]
  },
  {
    weekLabel: "Week 6–8",
    ageRange: "1.5–2 months",
    totalDaySleep: "3.5–4 hours",
    totalNightSleep: "10–11 hours (1–2 feeds)",
    keyNotes: [
      "Many babies start sleeping 5–6 hour stretches",
      "Awake windows around 1.5–2 hours",
      "This is when sleep cycles start maturing — 40 min cycles emerge",
      "Bottle: 150–180ml (5–6oz) per feed"
    ],
    schedule: [
      { time: "7:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 150–180ml" },
      { time: "9:00–9:45 AM", activity: "Nap 1 (45–60 min)" },
      { time: "10:00 AM", activity: "Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 150–180ml" },
      { time: "12:00–2:00 PM", activity: "Nap 2 — main nap (up to 2 hrs)" },
      { time: "2:00 PM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 15 min | Bottle: 150–180ml" },
      { time: "4:00–4:30 PM", activity: "Nap 3 — catnap (15–30 min)" },
      { time: "5:00 PM", activity: "Feed (split 1)", feedNote: "Breast: 15 min each | Bottle: 120ml" },
      { time: "5:45 PM", activity: "Bath" },
      { time: "6:15 PM", activity: "Feed (split 2) & settle", feedNote: "Top-up to ensure full tummy" },
      { time: "7:00 PM", activity: "Bedtime" },
      { time: "10:30 PM", activity: "Dream feed", feedNote: "Breast: 20 min | Bottle: 150ml" },
      { time: "3:00–5:00 AM", activity: "Night feed (may drop entirely soon)", feedNote: "Breast: one side | Bottle: 90–120ml" },
    ]
  },
  {
    weekLabel: "Week 8–12",
    ageRange: "2–3 months",
    totalDaySleep: "3–3.5 hours",
    totalNightSleep: "11 hours (0–1 feed)",
    keyNotes: [
      "Some babies drop the night feed entirely",
      "Awake windows 1.5–2 hours",
      "Afternoon catnap may start dropping",
      "Bottle: 180–210ml (6–7oz) per feed"
    ],
    schedule: [
      { time: "7:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 180–210ml" },
      { time: "9:00–9:45 AM", activity: "Nap 1 (45 min)" },
      { time: "10:30 AM", activity: "Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 180–210ml" },
      { time: "12:00–2:00 PM", activity: "Nap 2 — main nap (2 hrs)" },
      { time: "2:00 PM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 180–210ml" },
      { time: "4:15–4:30 PM", activity: "Nap 3 — power nap (15 min, dropping soon)" },
      { time: "5:00 PM", activity: "Feed", feedNote: "Breast: 15 min each | Bottle: 150ml" },
      { time: "5:45 PM", activity: "Bath" },
      { time: "6:15 PM", activity: "Top-up feed & settle", feedNote: "Breast: 10 min | Bottle: 60ml" },
      { time: "7:00 PM", activity: "Bedtime" },
      { time: "10:30 PM", activity: "Dream feed (can start dropping at 12 wks)", feedNote: "Breast: 15 min | Bottle: 120–150ml" },
    ]
  },
  {
    weekLabel: "Month 3–4",
    ageRange: "3–4 months",
    totalDaySleep: "3 hours",
    totalNightSleep: "11–12 hours",
    keyNotes: [
      "4-month sleep regression may occur — stay consistent",
      "Awake windows extend to 2–2.5 hours",
      "Afternoon catnap usually dropped",
      "Bottle: 180–240ml (6–8oz) per feed, 4–5 feeds/day"
    ],
    schedule: [
      { time: "7:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 210–240ml" },
      { time: "9:15–10:00 AM", activity: "Nap 1 (45 min)" },
      { time: "10:30 AM", activity: "Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 210–240ml" },
      { time: "12:00–2:00 PM", activity: "Nap 2 — main nap (up to 2 hrs)" },
      { time: "2:00 PM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 210–240ml" },
      { time: "5:00 PM", activity: "Feed & bath routine", feedNote: "Breast: 15 min each | Bottle: 180ml" },
      { time: "6:30 PM", activity: "Top-up & settle", feedNote: "Breast: 10 min | Bottle: 60ml" },
      { time: "7:00 PM", activity: "Bedtime" },
      { time: "10:30 PM", activity: "Dream feed (optional — try dropping)", feedNote: "Breast: 15 min | Bottle: 120ml" },
    ]
  },
  {
    weekLabel: "Month 4–6",
    ageRange: "4–6 months",
    totalDaySleep: "2.5–3 hours",
    totalNightSleep: "11–12 hours",
    keyNotes: [
      "Solids may be introduced around 6 months (talk to your GP/paediatrician)",
      "Awake windows 2–2.5 hours",
      "Dream feed can be dropped if sleeping through",
      "Bottle: 210–240ml (7–8oz) per feed, 4 feeds/day"
    ],
    schedule: [
      { time: "7:00 AM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 210–240ml" },
      { time: "9:30–10:00 AM", activity: "Nap 1 (30–45 min)" },
      { time: "10:30 AM", activity: "Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 210–240ml" },
      { time: "12:15–2:15 PM", activity: "Nap 2 — main nap (2 hrs)" },
      { time: "2:15 PM", activity: "Wake & Feed", feedNote: "Breast: 20 min + 10 min | Bottle: 210–240ml" },
      { time: "5:00 PM", activity: "Feed, bath, bedtime routine", feedNote: "Breast: 15 min each | Bottle: 180–210ml" },
      { time: "6:45 PM", activity: "Top-up & settle" },
      { time: "7:00 PM", activity: "Bedtime" },
    ]
  },
];

// ─── TODDLER COURSE MODULES ───────────────────────────────────────────────

export const TODDLER_COURSE: CourseModule[] = [
  {
    id: "toddler-m1",
    title: "Understanding Your Toddler's Brain",
    subtitle: "Why they do what they do — the neuroscience of toddlerhood",
    description: "Toddlers aren't 'being naughty' — their brains are under construction. Learn how the developing prefrontal cortex affects behaviour, why emotional outbursts are developmentally normal, and how your response literally shapes their neural pathways.",
    estimatedMinutes: 25,
    sources: ["Developmental Psychology", "Attachment Theory"],
    lessons: [
      {
        id: "toddler-m1-l1",
        title: "The Upstairs & Downstairs Brain",
        description: "Why your toddler can't 'just calm down' — their emotional brain is driving the bus",
        activities: [
          { id: "t-m1-l1-a1", type: "info_carousel" as any, title: "Brain Under Construction", content: { slides: [
            { heading: "Two Floors of the Brain", body: "Imagine your toddler's brain as a two-storey house. The downstairs (brainstem & limbic system) handles big emotions, fight-or-flight, and basic needs. The upstairs (prefrontal cortex) handles reasoning, empathy, and self-control. Here's the thing: the upstairs isn't fully built until their mid-twenties." },
            { heading: "Why They Flip Their Lid", body: "When your toddler is overwhelmed, the 'staircase' connecting upstairs and downstairs disconnects. They literally cannot access rational thinking. This isn't defiance — it's biology. Your job isn't to reason with them in that moment, it's to help them feel safe so the staircase reconnects." },
            { heading: "You Are the External Regulator", body: "Until their upstairs brain matures, YOU are their regulation system. When you stay calm during their storm, you're teaching their nervous system what calm feels like. This is called co-regulation, and it's the single most powerful parenting tool you have." },
          ]}},
          { id: "t-m1-l1-a2", type: "single_choice" as any, title: "Check Your Understanding", content: { question: "When your toddler is mid-meltdown, why doesn't reasoning work?", options: [
            { label: "They're choosing not to listen", isCorrect: false },
            { label: "Their rational brain is temporarily offline", isCorrect: true },
            { label: "They haven't learned words yet", isCorrect: false },
            { label: "They need more discipline", isCorrect: false },
          ], explanation: "During emotional overwhelm, the prefrontal cortex (rational brain) temporarily disconnects. This is why calm presence works better than logic in the moment." }},
          { id: "t-m1-l1-a3", type: "open_response" as any, title: "Reflect", content: { prompt: "Think about the last time your toddler had a meltdown. What was your automatic response? How might understanding their brain change your approach next time?", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m1-l2",
        title: "Attachment & Emotional Safety",
        description: "How secure attachment gives your toddler the confidence to explore the world",
        activities: [
          { id: "t-m1-l2-a1", type: "info_carousel" as any, title: "The Safety Signal", content: { slides: [
            { heading: "What Secure Attachment Looks Like", body: "A securely attached toddler uses you as a 'safe base'. They explore confidently, check back with you, and come to you when upset. This doesn't mean they never cry or protest — it means they trust that you'll respond." },
            { heading: "Repair Matters More Than Perfection", body: "You don't need to get it right every time. Research shows what matters most is 'rupture and repair'. When you lose your temper (and you will), coming back to your child, acknowledging what happened, and reconnecting is what builds resilience." },
            { heading: "Connection Before Correction", body: "Before any boundary-setting or teaching moment can land, your toddler needs to feel connected to you. A child who feels disconnected will fight harder, cling more, or shut down. Connect first, then redirect." },
          ]}},
          { id: "t-m1-l2-a2", type: "true_false" as any, title: "Myth vs Reality", content: { statement: "Picking up a crying toddler every time will 'spoil' them and make them more clingy.", isTrue: false, explanation: "Research consistently shows the opposite — responding to your child's distress builds security, which actually leads to MORE independence over time, not less." }},
        ]
      }
    ]
  },
  {
    id: "toddler-m2",
    title: "Tantrums & Big Emotions",
    subtitle: "Strategies that actually work when feelings are huge",
    description: "Tantrums aren't manipulation — they're communication. Learn the difference between emotional meltdowns and limit-testing behaviour, and master practical strategies for both.",
    estimatedMinutes: 30,
    sources: ["Emotion Coaching", "Positive Discipline"],
    lessons: [
      {
        id: "toddler-m2-l1",
        title: "Meltdown vs. Manipulation",
        description: "Understanding the crucial difference between emotional overwhelm and boundary-testing",
        activities: [
          { id: "t-m2-l1-a1", type: "info_carousel" as any, title: "Two Types of 'Tantrum'", content: { slides: [
            { heading: "The Emotional Meltdown", body: "Signs: glazed eyes, can't hear you, body rigid or flailing, inconsolable. This child has LOST control. They need your calm presence, not consequences. Hold space. Stay close. Ride the wave." },
            { heading: "The Boundary Test", body: "Signs: checking your reaction, can stop/start crying, negotiating. This child is TESTING a limit (which is healthy!). They need you to hold the boundary with empathy: 'I know you really want that. The answer is still no.'" },
            { heading: "Your Response Formula", body: "For meltdowns: Get low, stay calm, validate ('You're so frustrated'). For boundary tests: Acknowledge + Hold firm ('I hear you want more screen time. It's still time to turn it off.'). Both require warmth — neither requires punishment." },
          ]}},
          { id: "t-m2-l1-a2", type: "survey" as any, title: "Your Experience", content: { question: "When your toddler has a tantrum in public, what's your biggest concern?", options: ["Judgement from other parents", "Not knowing how to help them", "Feeling like I'm failing", "Worry I'm reinforcing bad behaviour"], allowMultiple: true }},
          { id: "t-m2-l1-a3", type: "open_response" as any, title: "Your Toolkit", content: { prompt: "Write down 3 things you can say to yourself during your toddler's next meltdown to help YOU stay regulated (e.g., 'This is not an emergency', 'They need me calm right now').", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m2-l2",
        title: "The ACE Method",
        description: "Acknowledge, Contain, Explore — a framework for any emotional moment",
        activities: [
          { id: "t-m2-l2-a1", type: "info_carousel" as any, title: "A.C.E.", content: { slides: [
            { heading: "A — Acknowledge", body: "Name what you see: 'You're really angry that we have to leave the park.' This isn't giving in — it's saying 'I see you.' Children whose emotions are acknowledged recover faster." },
            { heading: "C — Contain", body: "Create safety: 'I'm going to stay right here with you.' If they're hitting, gently hold their hands: 'I won't let you hit. I'll keep us both safe.' You're the container for feelings that are too big for their small body." },
            { heading: "E — Explore (After)", body: "Once they're calm (not during!): 'You were really upset about leaving. What could we do differently next time?' This is where the learning happens — but ONLY when the emotional brain has settled." },
          ]}},
          { id: "t-m2-l2-a2", type: "single_choice" as any, title: "Practice Scenario", content: { question: "Your 2-year-old throws their plate on the floor because you cut their toast 'wrong'. What's your first move?", options: [
            { label: "Say 'We don't throw food!' firmly", isCorrect: false },
            { label: "Acknowledge: 'Oh no! You wanted your toast different. That's frustrating.'", isCorrect: true },
            { label: "Ignore the behaviour completely", isCorrect: false },
            { label: "Make them clean it up as a consequence", isCorrect: false },
          ], explanation: "Acknowledging the emotion first helps the child feel heard. Then you can address the behaviour: 'Food stays on the table. Let me help you with the toast.'" }},
        ]
      },
      {
        id: "toddler-m2-l3",
        title: "Practical Calm-Down Strategies",
        description: "Age-appropriate tools to help your toddler (and you!) regulate",
        activities: [
          { id: "t-m2-l3-a1", type: "info_carousel" as any, title: "Your Regulation Toolkit", content: { slides: [
            { heading: "For Ages 1–2", body: "• Sensory soothing: rocking, humming, gentle pressure\n• Distraction & redirection (not avoidance)\n• Physical comfort: pick up, hold against your chest\n• Simple narration: 'You're crying. You're sad. I'm here.'" },
            { heading: "For Ages 2–3", body: "• Breathing: 'Let's blow out the birthday candles' (hold up fingers)\n• Movement: stomping, jumping, squeezing a cushion\n• Safe space: a cozy corner with soft items\n• Choice-giving: 'Do you want a cuddle or to sit in your calm corner?'" },
            { heading: "For Ages 3–4", body: "• Feelings chart: point to how they feel\n• Body scan: 'Where do you feel the angry? In your tummy?'\n• Story-telling after: 'First you felt angry, then we took breaths, then you felt better'\n• Empathy practice: 'How do you think teddy feels when he's thrown?'" },
          ]}},
          { id: "t-m2-l3-a2", type: "open_response" as any, title: "Build Your Calm-Down Kit", content: { prompt: "What 3 items could you put in a 'calm-down basket' for your child? Think about what sensory things soothe them (texture, weight, sound).", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "toddler-m3",
    title: "Boundaries With Love",
    subtitle: "How to be firm and warm at the same time",
    description: "Children NEED limits — but how you set them matters enormously. Learn to hold boundaries without breaking connection, and why 'gentle' parenting doesn't mean 'permissive' parenting.",
    estimatedMinutes: 25,
    sources: ["Authoritative Parenting Research", "Positive Discipline"],
    lessons: [
      {
        id: "toddler-m3-l1",
        title: "Why Boundaries Feel Like Love",
        description: "How consistent limits create safety and trust",
        activities: [
          { id: "t-m3-l1-a1", type: "info_carousel" as any, title: "The Fence Analogy", content: { slides: [
            { heading: "Picture a Playground", body: "Imagine children playing in an open field next to a cliff. They cluster in the middle, afraid to explore. Now imagine a sturdy fence at the edge. They run, play, explore the whole space. Boundaries are the fence. They make exploration feel safe." },
            { heading: "Firm ≠ Harsh", body: "You can be warm AND firm. 'I love you AND the answer is no.' 'I can see you're disappointed AND we're still leaving.' The word AND is more powerful than BUT. Practice replacing 'but' with 'and' in your limit-setting." },
            { heading: "Consistency is Kindness", body: "When boundaries shift based on your mood or their crying, children learn that pushing harder works. Consistent limits (even when inconvenient) teach children that the world is predictable and safe." },
          ]}},
          { id: "t-m3-l1-a2", type: "true_false" as any, title: "Quick Check", content: { statement: "Giving in to a tantrum 'just this once' doesn't affect future behaviour.", isTrue: false, explanation: "Intermittent reinforcement (sometimes giving in) actually creates MORE persistent behaviour than never giving in. It's the same principle behind slot machines — the unpredictability keeps you pulling the lever." }},
        ]
      },
      {
        id: "toddler-m3-l2",
        title: "Natural & Logical Consequences",
        description: "Moving beyond time-outs to consequences that actually teach",
        activities: [
          { id: "t-m3-l2-a1", type: "info_carousel" as any, title: "Consequences That Work", content: { slides: [
            { heading: "Natural Consequences", body: "Let reality be the teacher (when safe): Won't wear a jacket → feels cold. Won't eat dinner → feels hungry later. These teach cause-and-effect naturally. Your job: empathise without rescuing. 'You're cold? That makes sense — no jacket. Want to go get it?'" },
            { heading: "Logical Consequences", body: "When natural consequences aren't safe/appropriate, create related ones: Throwing toys → toys go away for a bit. Drawing on walls → helping to clean. Running in the car park → must hold hands. Key: the consequence should RELATE to the behaviour." },
            { heading: "What Doesn't Work", body: "Unrelated punishments ('No TV because you hit your sister') don't teach the lesson. They just breed resentment. The consequence should help them understand the impact of their choice, not simply feel bad." },
          ]}},
          { id: "t-m3-l2-a2", type: "single_choice" as any, title: "Scenario Practice", content: { question: "Your 3-year-old keeps throwing sand at other children at the playground. What's the best logical consequence?", options: [
            { label: "No dessert tonight", isCorrect: false },
            { label: "Leave the playground after a clear warning", isCorrect: true },
            { label: "Time-out on the bench for 3 minutes", isCorrect: false },
            { label: "Tell them sand throwing is naughty", isCorrect: false },
          ], explanation: "Leaving the playground directly relates to the behaviour. First warn: 'If you throw sand again, we'll need to leave because it's not safe.' Then follow through calmly if it continues." }},
        ]
      }
    ]
  },
  {
    id: "toddler-m4",
    title: "Sleep Solutions for Toddlers",
    subtitle: "Bedtime battles, night wakings, and transitions",
    description: "Sleep is the foundation everything else is built on. Address bedtime resistance, night wakings, transitioning from cot to bed, fear of the dark, and more.",
    estimatedMinutes: 35,
    sources: ["Paediatric Sleep Science", "Behavioural Sleep Methods"],
    lessons: [
      {
        id: "toddler-m4-l1",
        title: "The Bedtime Routine Blueprint",
        description: "Creating a predictable, calming wind-down that actually works",
        activities: [
          { id: "t-m4-l1-a1", type: "info_carousel" as any, title: "The Golden Routine", content: { slides: [
            { heading: "Timing Matters", body: "Most toddlers need 11–14 hours of total sleep. Bedtime should be early enough that they're tired but not overtired. Watch for the 'window' — rubbing eyes, getting clumsy, becoming hyperactive (yes, hyperactivity can mean overtiredness!)." },
            { heading: "The 4-Step Wind-Down", body: "1. Warning: 'Bedtime in 10 minutes!' (use a visual timer)\n2. Bath: warm, calming, no wild play\n3. Stories: 2–3 books in their bed (not the couch)\n4. Goodnight ritual: same words, same order, every night\n\nThe whole routine should take 30–45 minutes." },
            { heading: "Common Saboteurs", body: "• Screens within 1 hour of bed (blue light suppresses melatonin)\n• Sugar after 3pm\n• Rough play or exciting activities close to bedtime\n• Inconsistent timing (bedtime varying by more than 30 min)\n• Too many 'one more' negotiations" },
          ]}},
          { id: "t-m4-l1-a2", type: "open_response" as any, title: "Design Your Routine", content: { prompt: "Write out your ideal bedtime routine step by step, including specific times. What's one thing you could change tonight to make bedtime smoother?", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m4-l2",
        title: "Night Wakings & Fears",
        description: "Helping your toddler feel safe through the night",
        activities: [
          { id: "t-m4-l2-a1", type: "info_carousel" as any, title: "Through the Night", content: { slides: [
            { heading: "Why They Wake", body: "All humans wake between sleep cycles (every 60–90 min for toddlers). The difference is whether they can settle themselves back. If they fall asleep WITH you, they'll need you to recreate those conditions when they wake at 2am." },
            { heading: "Scared of the Dark", body: "This is developmentally normal from age 2+. Their imagination is developing but they can't yet distinguish real from imaginary. Don't dismiss fears — acknowledge and problem-solve: 'Let's check together. What if we leave the night-light on?'" },
            { heading: "The Gradual Retreat", body: "If you currently lie with them to fall asleep:\nWeek 1: Sit on their bed\nWeek 2: Sit beside the bed\nWeek 3: Sit near the door\nWeek 4: Sit just outside\nThis teaches self-settling without abandoning them." },
          ]}},
          { id: "t-m4-l2-a2", type: "survey" as any, title: "Your Sleep Challenge", content: { question: "What's your biggest toddler sleep challenge right now?", options: ["Won't go to sleep without me lying there", "Wakes multiple times at night", "Too early morning wake-ups", "Bedtime battles/stalling", "Transitioning from cot to bed"] }},
        ]
      },
      {
        id: "toddler-m4-l3",
        title: "Transitioning to a Big Bed",
        description: "When and how to make the move smoothly",
        activities: [
          { id: "t-m4-l3-a1", type: "info_carousel" as any, title: "The Big Bed Move", content: { slides: [
            { heading: "When to Transition", body: "Don't rush! Most children do best transitioning between 2.5–3.5 years. Too early (before 2) often leads to constant bed-escaping because they don't yet understand 'stay in bed'. Signs of readiness: climbing out of cot, asking for big bed, new sibling needing the cot." },
            { heading: "Setting Up for Success", body: "• Let them help choose bedding (builds ownership)\n• Keep the same bedtime routine\n• Use a toddler bed rail if needed\n• Place the bed in the same position as the cot\n• Make a big deal of their 'big kid' achievement" },
            { heading: "When They Keep Getting Out", body: "Stay boring. Walk them back calmly, say 'It's bedtime,' and leave. No negotiation, no cuddles, no anger. The first 3 nights are the hardest. If you stay consistent, most children adjust within a week. You may need to walk them back 30+ times the first night — that's normal!" },
          ]}},
          { id: "t-m4-l3-a2", type: "true_false" as any, title: "Check", content: { statement: "You should transition your toddler to a big bed as soon as they turn 2.", isTrue: false, explanation: "There's no magic age. Most sleep experts recommend waiting until 2.5–3 unless safety requires it sooner (e.g., climbing out of the cot). Early transitions often create more sleep problems." }},
        ]
      }
    ]
  },
  {
    id: "toddler-m5",
    title: "Feeding Your Toddler",
    subtitle: "Picky eating, meal battles, and building healthy relationships with food",
    description: "Most toddler eating 'problems' are actually normal developmental stages. Learn why forcing food backfires, how to manage picky eating without stress, and the division of responsibility that changes everything.",
    estimatedMinutes: 25,
    sources: ["Ellyn Satter Division of Responsibility", "Paediatric Nutrition"],
    lessons: [
      {
        id: "toddler-m5-l1",
        title: "The Division of Responsibility",
        description: "The framework that takes the stress out of mealtimes",
        activities: [
          { id: "t-m5-l1-a1", type: "info_carousel" as any, title: "Your Job vs Their Job", content: { slides: [
            { heading: "The Parent's Job", body: "You decide WHAT food is served, WHEN meals happen, and WHERE they eat. That's it. You stock the options. You set the schedule. You create the environment." },
            { heading: "The Child's Job", body: "They decide WHETHER they eat and HOW MUCH. This is the hardest part to let go of. But when children control their own intake, they develop a healthier relationship with food long-term." },
            { heading: "Why Forcing Backfires", body: "'Just try one bite' actually increases food refusal over time. Pressure creates negative associations with food. Instead: serve the meal, eat together, model enjoyment, and trust your child's appetite signals." },
          ]}},
          { id: "t-m5-l1-a2", type: "open_response" as any, title: "Mealtime Audit", content: { prompt: "Think about a recent stressful meal. Were you trying to control your child's eating (how much, what they ate)? How might the Division of Responsibility change that meal?", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m5-l2",
        title: "Managing Picky Eating",
        description: "Evidence-based strategies for expanding their palette",
        activities: [
          { id: "t-m5-l2-a1", type: "info_carousel" as any, title: "The Picky Eating Playbook", content: { slides: [
            { heading: "It Takes 15–20 Exposures", body: "Children may need to see, touch, smell, and taste a food 15–20 times before accepting it. Each exposure counts — even if they just touch it and put it aside. Don't give up after 3 tries." },
            { heading: "The 'Safe Food' Strategy", body: "Always include at least ONE food you know they'll eat at every meal. This prevents the meal becoming a power struggle and ensures they won't go hungry while being exposed to new foods alongside their safe option." },
            { heading: "Get Them Involved", body: "Children who help choose, shop for, and prepare food are significantly more likely to eat it. Even toddlers can wash vegetables, tear lettuce, stir ingredients. Ownership creates curiosity." },
          ]}},
          { id: "t-m5-l2-a2", type: "single_choice" as any, title: "What Would You Do?", content: { question: "Your toddler refuses dinner and asks for a biscuit instead. Best approach?", options: [
            { label: "'No biscuit until you eat your vegetables'", isCorrect: false },
            { label: "Give them the biscuit to avoid conflict", isCorrect: false },
            { label: "'Dinner is what we're having now. Your tummy might be hungry later — that's okay.'", isCorrect: true },
            { label: "Make them something different they'll eat", isCorrect: false },
          ], explanation: "This approach holds the boundary (dinner is dinner) without punishment or power struggles. If they choose not to eat, they learn that mealtimes are structured and that being hungry is a natural consequence — not a punishment." }},
        ]
      }
    ]
  },
  {
    id: "toddler-m6",
    title: "Specific Situations",
    subtitle: "Hitting, biting, sharing, and other daily challenges",
    description: "Practical, in-the-moment strategies for the most common toddler behaviours that push buttons.",
    estimatedMinutes: 25,
    sources: ["Child Development Research", "Positive Discipline"],
    lessons: [
      {
        id: "toddler-m6-l1",
        title: "Hitting, Biting & Aggression",
        description: "Why it happens and what to do (and not do)",
        activities: [
          { id: "t-m6-l1-a1", type: "info_carousel" as any, title: "Physical Aggression", content: { slides: [
            { heading: "Why They Hit/Bite", body: "Toddlers hit and bite because:\n• They can't express feelings in words yet\n• Their impulse control is undeveloped\n• They're testing cause-and-effect\n• They're overwhelmed\n\nIt's NOT because they're 'mean' or you're a bad parent." },
            { heading: "What to Do In the Moment", body: "1. Block/stop the behaviour: 'I won't let you hit'\n2. Check the other child first (this also teaches empathy)\n3. Name the feeling: 'You were angry'\n4. Offer the alternative: 'Hands are for gentle touch. You can stamp your feet when you're angry'\n\nStay neutral — big reactions (positive OR negative) reinforce the behaviour." },
            { heading: "When Another Child Hits Yours", body: "This is hard! Model the response you'd want:\n• Comfort your child first\n• Don't shame the other child\n• 'That hurt. We need to use gentle hands'\n• Remove your child from the situation if needed\n• Don't force your child to 'hit back'" },
          ]}},
          { id: "t-m6-l1-a2", type: "open_response" as any, title: "Your Plan", content: { prompt: "Write a specific script you'll use next time your toddler hits. Include what you'll say to them AND what you'll do with your body (get low, hold hands, etc.).", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m6-l2",
        title: "Sharing & Turn-Taking",
        description: "Why forced sharing doesn't work and what to do instead",
        activities: [
          { id: "t-m6-l2-a1", type: "info_carousel" as any, title: "The Sharing Myth", content: { slides: [
            { heading: "Forced Sharing Doesn't Teach Sharing", body: "Imagine someone at work took your coffee and said 'You need to share!' You'd be furious. Forced sharing teaches that other people can take your things whenever they want. True generosity comes from choice, not force." },
            { heading: "What to Do Instead", body: "• Teach turn-taking: 'When you're finished, then it's their turn'\n• Use a timer for popular toys\n• Protect their right to finish: 'She's still using that. You can have it when she's done'\n• Model generosity: 'Would you like to share some of my snack?'\n• Praise genuine sharing when it naturally occurs" },
          ]}},
        ]
      }
    ]
  },
];

// ─── BABY COURSE MODULES ──────────────────────────────────────────────────

export const BABY_COURSE: CourseModule[] = [
  {
    id: "baby-m1",
    title: "Your Newborn's Sleep Foundations",
    subtitle: "Understanding sleep cycles, safe sleep, and realistic expectations",
    description: "Everything you need to know about how babies sleep, why they wake, and how to build healthy sleep habits from day one — without crying it out.",
    estimatedMinutes: 30,
    sources: ["Paediatric Sleep Science", "Safe Sleep Guidelines"],
    lessons: [
      {
        id: "baby-m1-l1",
        title: "How Baby Sleep Works",
        description: "Sleep cycles, active vs quiet sleep, and why babies wake",
        activities: [
          { id: "b-m1-l1-a1", type: "info_carousel" as any, title: "Sleep Science 101", content: { slides: [
            { heading: "Active vs Quiet Sleep", body: "Newborns enter active (REM) sleep first — you'll see twitching, eye movement, irregular breathing. This is normal! They spend 50% of sleep in this light phase. Deep (quiet) sleep develops over the first 3 months. Don't assume twitching means they're waking up — wait before intervening." },
            { heading: "The 40-Minute Cycle", body: "Baby sleep cycles are about 40 minutes (adults: 90 min). Between cycles, babies naturally surface to light sleep. If they can self-settle, they link cycles. If they've been rocked/fed to sleep, they need that again at each cycle transition. This is why self-settling matters." },
            { heading: "When Can They Sleep Through?", body: "Most healthy, full-term babies at a good weight can do one 4–5 hour stretch by 4–6 weeks, and sleep 10–12 hours (with a dream feed) by 3–4 months. But EVERY baby is different. Focus on foundations, not timelines." },
          ]}},
          { id: "b-m1-l1-a2", type: "single_choice" as any, title: "Quick Check", content: { question: "A newborn enters which type of sleep first?", options: [
            { label: "Deep/quiet sleep", isCorrect: false },
            { label: "Active/REM sleep", isCorrect: true },
            { label: "They alternate randomly", isCorrect: false },
          ], explanation: "Unlike adults who enter deep sleep first, newborns go straight into active (REM) sleep. This is why they often seem restless when first falling asleep." }},
        ]
      },
      {
        id: "baby-m1-l2",
        title: "Safe Sleep Essentials",
        description: "Evidence-based safe sleep practices every parent must know",
        activities: [
          { id: "b-m1-l2-a1", type: "info_carousel" as any, title: "Safe Sleep ABCs", content: { slides: [
            { heading: "The Non-Negotiables", body: "• Always on their BACK to sleep\n• Firm, flat mattress with fitted sheet only\n• No loose bedding, pillows, or soft toys\n• Room temperature 16–20°C (61–68°F)\n• Same room as you for first 6 months\n• No sleeping on sofas or armchairs\n• Feet-to-foot position (feet at the end of the cot)" },
            { heading: "Swaddling Guide", body: "Swaddling can help newborns feel secure and reduce the startle reflex. Stop swaddling when baby shows signs of rolling (usually 3–4 months). Arms should be positioned naturally — not forced straight. Hips should be loose enough to bend. Never swaddle in a hot room." },
            { heading: "Room Sharing", body: "The safest arrangement for the first 6 months is baby sleeping in a cot/bassinet in YOUR room. This reduces risk by up to 50%. Use blackout curtains and a white noise machine to create a sleep-conducive environment while sharing your room." },
          ]}},
          { id: "b-m1-l2-a2", type: "true_false" as any, title: "Safety Check", content: { statement: "A baby who sleeps on their tummy is at no increased risk as long as the mattress is firm.", isTrue: false, explanation: "Back sleeping is the single most important safe sleep practice. Always place your baby on their back for every sleep. Once they can roll independently (usually 5–6 months), it's safe to let them find their own position." }},
        ]
      },
      {
        id: "baby-m1-l3",
        title: "Week-by-Week Sleep & Feed Guide",
        description: "Your structured daily schedule from birth to 6 months",
        activities: [
          { id: "b-m1-l3-a1", type: "info_carousel" as any, title: "Your Roadmap", content: { slides: [
            { heading: "How to Use the Schedule", body: "The weekly schedules on the next screen are a GUIDE, not a rigid timetable. Every baby is different. Use them as a framework and adjust based on your baby's hunger cues and sleep signals. The key principles: structured day → better night." },
            { heading: "Feed Amounts", body: "Breastfeeding: time on each breast is listed as a guide. Let baby fully drain one breast before switching. Bottle-feeding: amounts are calculated at roughly 150ml per kg of body weight per day, divided across feeds. Adjust up or down based on your baby's needs." },
            { heading: "Awake Windows", body: "0–4 weeks: 45–60 minutes\n4–8 weeks: 1–1.5 hours\n8–12 weeks: 1.5–2 hours\n3–4 months: 2–2.5 hours\n4–6 months: 2–2.5 hours\n\nWatch for sleepy cues: yawning, eye rubbing, fussiness. Put down BEFORE they're overtired." },
          ]}},
          { id: "b-m1-l3-a2", type: "open_response" as any, title: "Track Your Baby", content: { prompt: "Note your baby's current age and approximate schedule. Where does it differ from the guide? What's one adjustment you could try this week?", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "baby-m2",
    title: "Feeding Foundations",
    subtitle: "Breast, bottle, or combo — making it work for your family",
    description: "Evidence-based feeding guidance without the guilt. Whether you breastfeed, formula-feed, or combine both, learn how to nourish your baby and protect your own wellbeing.",
    estimatedMinutes: 25,
    sources: ["Lactation Science", "Paediatric Nutrition"],
    lessons: [
      {
        id: "baby-m2-l1",
        title: "Breastfeeding Success",
        description: "Positioning, latch, supply, and troubleshooting",
        activities: [
          { id: "b-m2-l1-a1", type: "info_carousel" as any, title: "Getting It Right", content: { slides: [
            { heading: "The Latch", body: "A good latch is the foundation of comfortable, effective breastfeeding. Baby should have a wide mouth covering the areola (not just the nipple), their chin tucked into the breast, nose clear, and you should hear rhythmic swallowing. Pain beyond mild discomfort in the first 30 seconds is a sign of poor latch — break suction and try again." },
            { heading: "Building Supply", body: "Milk production works on supply and demand. To build supply:\n• Feed frequently (8–12 times in 24 hrs initially)\n• Fully drain one breast before switching\n• Express/pump after morning feeds\n• Stay hydrated and well-nourished\n• Rest when baby rests\n\nThe morning is when supply is naturally highest." },
            { heading: "One Bottle a Day", body: "Introducing one bottle of expressed milk per day from week 2–4 gives flexibility, lets your partner bond through feeding, and ensures baby can take a bottle if needed. This does NOT harm breastfeeding when done correctly. Express the same volume to maintain supply." },
          ]}},
          { id: "b-m2-l1-a2", type: "open_response" as any, title: "Your Feeding Plan", content: { prompt: "What's your current feeding approach and what's your biggest challenge? Write down one question you'd like answered.", saveToVault: true }},
        ]
      },
      {
        id: "baby-m2-l2",
        title: "Bottle-Feeding With Confidence",
        description: "Whether formula or expressed milk — doing it well",
        activities: [
          { id: "b-m2-l2-a1", type: "info_carousel" as any, title: "Bottle Basics", content: { slides: [
            { heading: "Calculating Amounts", body: "General guide: 150ml per kg of body weight per day, divided across feeds.\n\nExample: 4kg baby = 600ml/day ÷ 6 feeds = 100ml per feed\n\nThis is a STARTING POINT. Some babies need more, some less. Watch for hunger and fullness cues rather than fixating on exact amounts." },
            { heading: "Paced Bottle Feeding", body: "Hold baby semi-upright (not lying flat). Hold bottle horizontal so milk doesn't flow too fast. Let baby draw milk in at their own pace. Pause every few minutes to burp. A feed should take 15–20 minutes (not 5 minutes of guzzling). This prevents overfeeding and gas." },
            { heading: "Combination Feeding", body: "Many families combine breast and bottle successfully. The key: maintain breast stimulation by expressing whenever you give a bottle. This protects supply while giving you flexibility. No guilt — fed is best, and your mental health matters." },
          ]}},
        ]
      }
    ]
  },
  {
    id: "baby-m3",
    title: "Self-Settling & Sleep Training",
    subtitle: "Gentle approaches to teaching independent sleep",
    description: "When you're ready, these evidence-based methods help your baby learn to fall asleep independently — ranging from very gentle to structured approaches.",
    estimatedMinutes: 25,
    sources: ["Behavioural Sleep Science", "Graduated Approach Research"],
    lessons: [
      {
        id: "baby-m3-l1",
        title: "The Spectrum of Sleep Methods",
        description: "From gradual retreat to controlled settling — find your fit",
        activities: [
          { id: "b-m3-l1-a1", type: "info_carousel" as any, title: "Choose Your Approach", content: { slides: [
            { heading: "The Gradual Retreat", body: "Gentlest approach. Over 2–3 weeks, gradually reduce your presence:\n1. Pat/shush in cot → 2. Hand on chest → 3. Sit beside cot → 4. Near door → 5. Outside room\n\nBest for: Sensitive babies, anxiety-prone parents. Takes longer but very gentle." },
            { heading: "Pick Up / Put Down", body: "When baby cries, pick up and comfort until calm, then put back down awake. Repeat as many times as needed. Can be exhausting (30+ times in one session) but effective within 3–7 days. Best for: Babies 3–6 months." },
            { heading: "Controlled Settling", body: "Put baby down awake. Leave room. Return at increasing intervals (2 min, 4 min, 6 min) to briefly reassure (pat, shush) then leave again. Research shows this does NOT cause harm or damage attachment when done at 6+ months. Best for: Babies 6+ months who need a clear reset." },
          ]}},
          { id: "b-m3-l1-a2", type: "survey" as any, title: "Your Comfort Level", content: { question: "Which approach feels right for your family?", options: ["Gradual retreat (very gentle, slower)", "Pick up / Put down (moderate)", "Controlled settling (faster, more structured)", "Not sure yet — need more info"] }},
          { id: "b-m3-l1-a3", type: "open_response" as any, title: "Your Sleep Plan", content: { prompt: "Based on your baby's age and temperament, which approach will you try first? What specific steps will you take this week? Note any concerns.", saveToVault: true }},
        ]
      }
    ]
  },
];

// ─── KIDS & TEENS COURSE ──────────────────────────────────────────────────

export const KIDS_TEENS_COURSE: CourseModule[] = [
  {
    id: "kt-m1",
    title: "Building Emotional Resilience",
    subtitle: "Helping your child bounce back from setbacks",
    description: "Resilience isn't something children are born with — it's built through how we respond to their struggles. Learn the coaching approach that transforms setbacks into growth.",
    estimatedMinutes: 25,
    sources: ["Resilience Research", "Growth Mindset"],
    lessons: [
      {
        id: "kt-m1-l1",
        title: "The Resilience Framework",
        description: "What resilience actually is (and isn't) and how to cultivate it",
        activities: [
          { id: "kt-m1-l1-a1", type: "info_carousel" as any, title: "What Builds Resilience", content: { slides: [
            { heading: "Resilience ≠ Toughness", body: "Resilience isn't about suppressing emotions or 'hardening up'. It's the ability to feel difficult feelings, navigate setbacks, and bounce back with support. The foundation? A secure relationship with at least one trusted adult." },
            { heading: "The 3 Pillars", body: "1. CONNECTION: 'I have people who love me'\n2. CAPABILITY: 'I can handle hard things'\n3. CONTRIBUTION: 'I matter and can make a difference'\n\nEvery interaction with your child either builds or undermines these pillars." },
            { heading: "Let Them Struggle (A Little)", body: "The urge to rescue is strong, but children learn resilience through manageable challenges — not through having every obstacle removed. Ask yourself: 'Is this a situation where they need my help, or where they need my belief in them?'" },
          ]}},
          { id: "kt-m1-l1-a2", type: "open_response" as any, title: "Reflect", content: { prompt: "Think about a recent time your child faced a challenge. Did you step in to solve it, or support them in solving it themselves? What would the 'coaching approach' have looked like?", saveToVault: true }},
        ]
      },
      {
        id: "kt-m1-l2",
        title: "Growth Mindset in Practice",
        description: "Moving from 'I can't' to 'I can't YET'",
        activities: [
          { id: "kt-m1-l2-a1", type: "info_carousel" as any, title: "The Power of Yet", content: { slides: [
            { heading: "Praise the Process", body: "Instead of 'You're so smart!' try 'You worked really hard on that!' Process praise builds internal motivation. Trait praise creates fragility ('If I'm smart, what does it mean when I fail?')." },
            { heading: "Normalise Failure", body: "Share your own mistakes: 'I messed up at work today. Here's what I learned.' Let them see you struggle and persist. Model the self-talk: 'This is hard. I'm going to try a different approach.'" },
            { heading: "The YET Poster", body: "Make a family 'YET wall'. When someone says 'I can't do this', add 'yet' and put it on the wall:\n• 'I can't ride a bike... yet'\n• 'I can't do long division... yet'\n• 'I can't make friends at my new school... yet'\n\nRevisit it monthly to celebrate progress." },
          ]}},
          { id: "kt-m1-l2-a2", type: "single_choice" as any, title: "Practice", content: { question: "Your child says 'I'm terrible at maths, I'll never get it.' Best response?", options: [
            { label: "'No you're not — you got an A last year!'", isCorrect: false },
            { label: "'Maths is really hard for you right now. What part is tricky? Let's figure it out.'", isCorrect: true },
            { label: "'Maybe maths just isn't your thing — focus on what you're good at'", isCorrect: false },
            { label: "'You just need to practice more — try harder'", isCorrect: false },
          ], explanation: "Acknowledging the struggle validates their feeling while 'right now' implies it's temporary. Asking what's tricky shows belief they CAN work through it with support." }},
        ]
      }
    ]
  },
  {
    id: "kt-m2",
    title: "Navigating Bullying",
    subtitle: "Practical strategies for parents when your child is being targeted",
    description: "Bullying can be devastating. Learn how to recognise the signs, respond effectively, work with schools, and build your child's social confidence and assertiveness skills.",
    estimatedMinutes: 30,
    sources: ["Anti-Bullying Research", "Social Skills Development"],
    lessons: [
      {
        id: "kt-m2-l1",
        title: "Recognising the Signs",
        description: "When your child won't tell you, their behaviour will",
        activities: [
          { id: "kt-m2-l1-a1", type: "info_carousel" as any, title: "Warning Signs", content: { slides: [
            { heading: "Behavioural Red Flags", body: "• Reluctance to go to school (stomach aches, headaches)\n• Coming home hungry (lunch stolen or afraid to eat alone)\n• Withdrawal from friends or activities they used to enjoy\n• Unexplained marks, torn clothing, missing belongings\n• Mood changes: irritability, sadness, anger\n• Sleep disruption, bed-wetting in older children\n• Decline in schoolwork" },
            { heading: "Digital Bullying Signs", body: "• Anxiety around their phone/device\n• Deleting messages or hiding screens\n• Refusing to go online (or obsessively checking)\n• Emotional after being online\n• New accounts or changed passwords\n• Withdrawal from family life" },
            { heading: "How to Open the Conversation", body: "Don't ask 'Are you being bullied?' (they'll say no). Instead:\n• 'What was the worst part of your day?'\n• 'If I asked your best friend how you're going, what would they say?'\n• 'Is there anyone at school who's not very kind?'\n• 'What's lunchtime like? Who do you hang out with?'" },
          ]}},
          { id: "kt-m2-l1-a2", type: "open_response" as any, title: "Your Child's World", content: { prompt: "Answer honestly: How much do you know about your child's social world at school? Who are their friends? Who do they avoid? What happens at lunchtime?", saveToVault: true }},
        ]
      },
      {
        id: "kt-m2-l2",
        title: "Response Strategies",
        description: "What works (and what makes it worse)",
        activities: [
          { id: "kt-m2-l2-a1", type: "info_carousel" as any, title: "What to Do", content: { slides: [
            { heading: "First: Listen Without Fixing", body: "Your child needs to feel heard before they can accept help. Don't immediately call the school or tell them to 'just ignore it' (this minimises their pain). Say: 'Thank you for telling me. That sounds really hard. I'm glad you trust me with this.'" },
            { heading: "Teach Assertiveness (Not Aggression)", body: "Practice scripts they can use:\n• 'Stop. I don't like that.'\n• Walk away with confidence (head up, shoulders back)\n• Find a buddy — bullies target kids who are alone\n• 'That's your opinion' (for verbal bullying)\n\nRole-play these at home until they feel natural." },
            { heading: "Working With the School", body: "Document everything (dates, what happened, who witnessed).\nRequest a meeting with the teacher AND pastoral care.\nAsk: 'What is the school's specific plan to address this?'\nFollow up in writing.\nIf nothing changes, escalate to the principal.\nKeep your child informed: 'I spoke to the school. Here's what's happening.'" },
          ]}},
          { id: "kt-m2-l2-a2", type: "single_choice" as any, title: "Scenario", content: { question: "Your child tells you a classmate is calling them names every day. What's your first response?", options: [
            { label: "'Just ignore them — they'll stop eventually'", isCorrect: false },
            { label: "'That must really hurt. Tell me more about what's been happening.'", isCorrect: true },
            { label: "'I'm calling the school right now'", isCorrect: false },
            { label: "'Next time, say something mean back'", isCorrect: false },
          ], explanation: "Always listen first. 'Just ignore it' dismisses their pain. Calling the school immediately takes away their agency. Retaliating escalates. First validate, then strategise together." }},
        ]
      }
    ]
  },
  {
    id: "kt-m3",
    title: "Anxiety in Children & Teens",
    subtitle: "Understanding and supporting your anxious child",
    description: "Anxiety in children has risen significantly. Learn to recognise it, understand the anxious brain, and use evidence-based strategies to help your child manage worry without accommodation.",
    estimatedMinutes: 30,
    sources: ["CBT for Children", "Anxiety Research"],
    lessons: [
      {
        id: "kt-m3-l1",
        title: "The Anxious Brain Explained",
        description: "Why anxiety is the brain's fire alarm — and how to turn down the volume",
        activities: [
          { id: "kt-m3-l1-a1", type: "info_carousel" as any, title: "Understanding Anxiety", content: { slides: [
            { heading: "The Smoke Detector Analogy", body: "Everyone has a 'smoke detector' in their brain (the amygdala). In anxious children, this alarm is too sensitive — it goes off when there's no real danger, like when toast burns and sets off the fire alarm. The alarm isn't broken — it's just set too sensitive. Our job is to help recalibrate it." },
            { heading: "Anxiety vs Normal Worry", body: "ALL children worry sometimes. Anxiety becomes a concern when it:\n• Stops them doing things they want to do\n• Causes regular physical symptoms\n• Lasts weeks/months, not days\n• Is disproportionate to the situation\n• Impacts school, friendships, or family life" },
            { heading: "The Accommodation Trap", body: "The most natural parenting instinct — removing the thing causing anxiety — actually makes anxiety WORSE long-term. When we let them avoid scary things, we confirm their brain's message: 'This IS dangerous.' Gradual, supported exposure is the evidence-based alternative." },
          ]}},
          { id: "kt-m3-l1-a2", type: "true_false" as any, title: "Check", content: { statement: "The best way to help an anxious child is to remove the source of their anxiety.", isTrue: false, explanation: "While it feels kind, accommodation (removing the scary thing) reinforces the anxiety loop. Gradual exposure — facing the fear in small, supported steps — is how the brain learns 'I can handle this.'" }},
        ]
      },
      {
        id: "kt-m3-l2",
        title: "Practical Anxiety Tools",
        description: "Strategies your child can use anywhere",
        activities: [
          { id: "kt-m3-l2-a1", type: "info_carousel" as any, title: "The Toolkit", content: { slides: [
            { heading: "Name It to Tame It", body: "Give the anxiety a name and character. 'Oh, Worry Monster is visiting again. What's he saying today?' This externalises the anxiety — your child isn't anxious, the Worry Monster is bothering them. This creates distance and a sense of control." },
            { heading: "The Worry Window", body: "Designate a 15-minute 'worry time' each day. When anxious thoughts arise, they write them on a note and put them in a 'worry box' to discuss at worry time. Most worries feel smaller by then. This teaches them they can postpone worry — it doesn't have to consume their whole day." },
            { heading: "The 5-4-3-2-1 Grounding", body: "For acute anxiety moments:\n• 5 things you can SEE\n• 4 things you can TOUCH\n• 3 things you can HEAR\n• 2 things you can SMELL\n• 1 thing you can TASTE\n\nThis brings them out of their head and into the present moment." },
          ]}},
          { id: "kt-m3-l2-a2", type: "open_response" as any, title: "Your Family Plan", content: { prompt: "Which of these strategies would work best for your child? How will you introduce it? Write down a specific plan for this week.", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "kt-m4",
    title: "Screen Time & Digital Wellness",
    subtitle: "Managing technology without constant battles",
    description: "Screens aren't going away. Learn how to set healthy boundaries, recognise problematic use, and help your child develop a balanced relationship with technology.",
    estimatedMinutes: 20,
    sources: ["Digital Wellness Research", "AAP Guidelines"],
    lessons: [
      {
        id: "kt-m4-l1",
        title: "Setting Smart Screen Boundaries",
        description: "Practical frameworks for different ages",
        activities: [
          { id: "kt-m4-l1-a1", type: "info_carousel" as any, title: "Screen Time Guidelines", content: { slides: [
            { heading: "Age-Based Framework", body: "Under 2: Minimal/no screens (video calls okay)\n2–5: Max 1 hour/day of quality content\n6–12: Clear limits — focus on balance with physical activity, sleep, homework\n13+: Collaborative agreements — involve them in setting boundaries\n\nQuality matters more than quantity. Interactive > passive." },
            { heading: "The Family Media Agreement", body: "Create together (not imposed):\n• Screen-free zones (bedrooms, dinner table)\n• Screen-free times (1 hour before bed, morning routine)\n• What content is/isn't okay\n• Consequences for breaking agreements\n• Regular review dates\n\nDisplay it where everyone can see — this applies to PARENTS too." },
            { heading: "Signs of Problematic Use", body: "Watch for:\n• Irritability/meltdowns when screens are taken away\n• Sneaking screen time\n• Neglecting friends, activities, homework\n• Sleep disruption\n• Declining interest in non-screen activities\n• Using screens to manage emotions exclusively" },
          ]}},
          { id: "kt-m4-l1-a2", type: "open_response" as any, title: "Your Screen Plan", content: { prompt: "What are the current screen time rules in your house? Are they working? Draft a Family Media Agreement with input from your child(ren).", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "kt-m5",
    title: "Communicating With Teenagers",
    subtitle: "Staying connected through the toughest developmental stage",
    description: "The teenage brain is undergoing a massive renovation. Understanding what's happening biologically will transform how you communicate with and support your teen.",
    estimatedMinutes: 30,
    sources: ["Adolescent Psychology", "Family Systems Therapy"],
    lessons: [
      {
        id: "kt-m5-l1",
        title: "The Teenage Brain Explained",
        description: "Why they act like they've lost their mind (they kind of have)",
        activities: [
          { id: "kt-m5-l1-a1", type: "info_carousel" as any, title: "Under Renovation", content: { slides: [
            { heading: "The Brain Renovation", body: "The teenage brain is undergoing the biggest remodel since toddlerhood. The emotional centre (amygdala) is fully active, but the rational centre (prefrontal cortex) won't be complete until their mid-twenties. They're driving a car with a powerful accelerator and underdeveloped brakes." },
            { heading: "Why They're So Emotional", body: "Puberty floods the brain with hormones that amplify emotions. Everything feels more intense — happiness, sadness, embarrassment, anger. They're not being dramatic — they genuinely FEEL things more strongly than you do. Saying 'calm down' is as useful as telling someone to stop hiccupping." },
            { heading: "Risk-Taking Is Biological", body: "The reward centre of the teenage brain is hypersensitive, especially around peers. This is why they do things that seem stupid — the brain's reward signal (dopamine hit) literally drowns out the risk assessment. This is especially true in groups." },
          ]}},
          { id: "kt-m5-l1-a2", type: "single_choice" as any, title: "Understanding", content: { question: "Why do teenagers take more risks when they're with friends?", options: [
            { label: "They want to show off", isCorrect: false },
            { label: "Their brain's reward system is amplified by peer presence", isCorrect: true },
            { label: "They don't care about consequences", isCorrect: false },
            { label: "They haven't been taught better", isCorrect: false },
          ], explanation: "Brain scans show the reward centres of teenage brains literally fire more intensely in the presence of peers. It's not attitude — it's neuroscience." }},
        ]
      },
      {
        id: "kt-m5-l2",
        title: "Keeping the Door Open",
        description: "Communication strategies that keep teens talking to you",
        activities: [
          { id: "kt-m5-l2-a1", type: "info_carousel" as any, title: "Stay Connected", content: { slides: [
            { heading: "Talk Side by Side", body: "Teenagers often talk more when you're NOT face to face. The best conversations happen:\n• In the car\n• While cooking together\n• On a walk\n• At bedtime (they'll suddenly want to talk at 10pm)\n\nDon't force 'sit down and talk' sessions — create conditions for spontaneous connection." },
            { heading: "Listen Without Fixing", body: "Your teenager doesn't want you to solve their problems (even when the solution is obvious). They want to feel heard. Try:\n• 'Tell me more about that'\n• 'That sounds really hard'\n• 'What do YOU think you should do?'\n• 'I'm here if you want to talk more'\n\nAdvice that isn't asked for is rarely received well." },
            { heading: "Choose Your Battles", body: "Ask yourself: 'Will this matter in 5 years?'\n\nWorth fighting for: Safety, respect, values, education\nNot worth fighting for: Messy room, hair colour, clothing choices, music taste\n\nEvery battle costs relationship capital. Spend it on what truly matters." },
          ]}},
          { id: "kt-m5-l2-a2", type: "open_response" as any, title: "Connection Audit", content: { prompt: "When was the last time you had a meaningful conversation with your teen? What conditions were present? How can you create more of those conditions this week?", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "kt-m6",
    title: "Peer Pressure & Identity",
    subtitle: "Helping your child stay true to themselves",
    description: "As children grow, peer influence grows with them. Learn how to help your child develop a strong sense of self, navigate peer pressure, and make values-based decisions.",
    estimatedMinutes: 20,
    sources: ["Identity Development", "Social Psychology"],
    lessons: [
      {
        id: "kt-m6-l1",
        title: "Building a Strong Identity",
        description: "Helping your child know who they are before the world tells them",
        activities: [
          { id: "kt-m6-l1-a1", type: "info_carousel" as any, title: "Identity Building", content: { slides: [
            { heading: "The Values Conversation", body: "Children who know their family's values have an anchor when peer pressure hits. But values must be DISCUSSED, not just assumed. Try: 'In our family, we value kindness, honesty, and showing up for each other. What values are important to YOU?'" },
            { heading: "Rehearsing 'No'", body: "Role-play peer pressure scenarios BEFORE they happen:\n• 'Everyone's doing it — come on!'\n• 'You're such a baby if you don't'\n• 'No one will know'\n\nPractice responses: 'Nah, I'm good', 'I'll pass', 'My parents will literally kill me' (giving them a way out that saves face)." },
            { heading: "The Code Word", body: "Agree on a code word or text your child can send when they need rescuing from a situation without losing face. 'I\u2019m going to text you PIZZA and you call me and say I have to come home.' No questions asked in the moment \u2014 debrief later." },
          ]}},
          { id: "kt-m6-l1-a2", type: "open_response" as any, title: "Family Values", content: { prompt: "List your top 5 family values. Have you ever explicitly discussed these with your children? How could you bring these into a natural conversation this week?", saveToVault: true }},
        ]
      }
    ]
  },
];
