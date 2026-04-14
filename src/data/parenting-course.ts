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
    title: "The PREP Method",
    subtitle: "Navigate changes and transitions without meltdowns",
    description: "Transitions are one of the biggest tantrum triggers. PREP gives you a four-step framework to help your toddler feel in control during everyday changes — from bath time to leaving the park.",
    estimatedMinutes: 20,
    sources: ["Transition Psychology", "Positive Discipline"],
    lessons: [
      {
        id: "toddler-m6-l1",
        title: "Plan, Reveal, Explain, Put in Charge",
        description: "The four PREP steps that transform transition chaos into calm cooperation",
        activities: [
          { id: "t-m6-l1-a1", type: "info_carousel" as any, title: "The PREP Framework", content: { slides: [
            { heading: "P \u2014 Plan Ahead", body: "Before the transition happens, decide what you\u2019ll say and when. Give warnings: \u2018In 10 minutes, we\u2019ll be leaving the park.\u2019 Visual timers work brilliantly for toddlers who can\u2019t grasp abstract time." },
            { heading: "R \u2014 Reveal the Plan & E \u2014 Explain Details", body: "Walk through exactly what will happen, step by step. Be specific: \u2018After we eat lunch, daddy will go to the shop and you\u2019ll stay home with mummy. You and mummy will play together until I get back.\u2019 The more details, the safer they feel." },
            { heading: "P \u2014 Put Them in Charge of Something Small", body: "Give them a micro-job within the transition: \u2018Would you like the blue towel or the grey towel for bath?\u2019 \u2018You can be our toy leader when we pack up!\u2019 Choice = control = cooperation." },
          ]}},
          { id: "t-m6-l1-a2", type: "open_response" as any, title: "Script Your PREPs", content: { prompt: "Pick three transitions that regularly cause meltdowns in your household (e.g., leaving the park, bathtime, mealtimes). Write a PREP script for each one, including the specific warning, explanation, and choice you\u2019ll offer.", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m6-l2",
        title: "PREP in Action",
        description: "Real scenarios showing how to apply PREP throughout the day",
        activities: [
          { id: "t-m6-l2-a1", type: "info_carousel" as any, title: "Everyday PREP Examples", content: { slides: [
            { heading: "Bedtime PREP", body: "\u2018In 5 more minutes, we\u2019ll say night night to our toys, put pyjamas on, brush teeth, read two books, snuggle and say night night. Would you like to listen to a song during snuggles or have quiet snuggles tonight?\u2019" },
            { heading: "Car Seat PREP", body: "\u2018You\u2019re going to put one arm in, then the other. Then I\u2019ll buckle in the middle. Can you show your toy puppy how car seats work? Puppy doesn\u2019t know!\u2019 Making them the \u2018teacher\u2019 gives them agency and distracts from resistance." },
            { heading: "Playdate Ending PREP", body: "\u2018In 15 minutes, your friend\u2019s mummy will come to pick him up. We\u2019ll gather up all his things and then say bye bye. Should we bring our dog out with us to wave goodbye?\u2019 Involving them in the \u2018closing ceremony\u2019 helps them process the ending." },
          ]}},
          { id: "t-m6-l2-a2", type: "single_choice" as any, title: "PREP Practice", content: { question: "You need to leave for school in 10 minutes and your toddler is deep in play. What\u2019s the best PREP approach?", options: [
            { label: "Just pick them up and go when it\u2019s time", isCorrect: false },
            { label: "Give a warning, explain what\u2019s next, offer a choice about what to bring", isCorrect: true },
            { label: "Wait until they finish playing naturally", isCorrect: false },
            { label: "Bribe them with a treat to leave", isCorrect: false },
          ], explanation: "PREP in action: \u2018In 10 minutes, we\u2019ll say bye to toys, get shoes on, and drive to school. Do you want to bring teddy or bunny in the car?\u2019 Warn, explain, give a small choice." }},
        ]
      }
    ]
  },
  {
    id: "toddler-m7",
    title: "The REDO Method",
    subtitle: "Redirect behaviour without shame or punishment",
    description: "When your toddler does something undesirable, the REDO method gives you a four-step script: Reflect, Explain, Direct, and Own. It teaches without punishing.",
    estimatedMinutes: 15,
    sources: ["Positive Discipline", "Responsive Parenting"],
    lessons: [
      {
        id: "toddler-m7-l1",
        title: "Reflect, Explain, Direct, Own",
        description: "A calm, structured response for unwanted behaviour",
        activities: [
          { id: "t-m7-l1-a1", type: "info_carousel" as any, title: "The REDO Steps", content: { slides: [
            { heading: "R \u2014 Reflect the Behaviour", body: "Narrate what you see without judgment: \u2018I see you\u2019re hitting the dog with your cup.\u2019 This shows your child you\u2019re paying attention and gives them a mirror for their actions." },
            { heading: "E \u2014 Explain & D \u2014 Direct", body: "Explain what\u2019s appropriate: \u2018Cups are for drinking, and the dog likes it when you\u2019re gentle with your hand.\u2019 Then direct them to try again: \u2018Let\u2019s have a redo and try being gentle.\u2019 Show them what \u2018gentle\u2019 looks like with your hands." },
            { heading: "O \u2014 Own the Situation", body: "If the behaviour continues after the redo, calmly follow through: \u2018I see you\u2019re still hitting the dog with the cup. The cup is going away for now and we can try again to use it safely and gently later.\u2019 No anger, no lectures. Just a natural outcome." },
          ]}},
          { id: "t-m7-l1-a2", type: "open_response" as any, title: "Write Your REDO Scripts", content: { prompt: "Think of 3 recurring behaviours that frustrate you. Write a REDO script for each one (Reflect what you see, Explain the rule, Direct them to redo it, Own with a consequence if needed).", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "toddler-m8",
    title: "Teaching Coping Skills",
    subtitle: "Build your child\u2019s emotional toolkit before they need it",
    description: "Coping skills are best taught in calm moments, not mid-meltdown. Learn age-appropriate techniques across breathing, physical release, creativity, sensory soothing, and helpful words.",
    estimatedMinutes: 20,
    sources: ["Child Development", "Emotional Regulation Research"],
    lessons: [
      {
        id: "toddler-m8-l1",
        title: "Breathing & Physical Release",
        description: "Techniques to help your toddler release big energy safely",
        activities: [
          { id: "t-m8-l1-a1", type: "info_carousel" as any, title: "Coping Techniques", content: { slides: [
            { heading: "Deep Breathing for Little Ones", body: "Slow breathing releases GABA in the brain \u2014 a chemical that creates feelings of safety and relaxation. Make it fun:\n\u2022 Bunny breath (quick sniffs)\n\u2022 Smell the flower, blow the candle\n\u2022 Lion breath (big roar exhale)\n\u2022 Dragon breath\n\u2022 Blow bubbles\n\nSay: \u2018When big feelings come, we can take a BIG breath to feel better.\u2019" },
            { heading: "Physical Release", body: "Help your child channel aggressive energy into something safe:\n\u2022 Stomp feet like a dinosaur\n\u2022 Jumping jacks\n\u2022 Bounce a ball hard\n\u2022 Tense and release: \u2018Squeeze your whole body tight like a lemon... now let go!\u2019\n\nSay: \u2018If we feel like hitting, first we can stomp our feet to let the anger out.\u2019" },
            { heading: "When Can They Use These?", body: "Important: your child may not be able to access coping tools IN THE MOMENT until around age 4. But start introducing and practising them early, during calm moments. You\u2019re wiring their brain to cope in the future. Think of it as depositing tools into their emotional bank account." },
          ]}},
          { id: "t-m8-l1-a2", type: "survey" as any, title: "Which Fits Your Child?", content: { question: "Which coping category do you think your toddler would respond to best?", options: ["Deep breathing (bunny breath, lion breath)", "Physical release (stomping, jumping)", "Creative release (angry chalk, feelings painting)", "Sensory soothing (playdough, water, textures)"], allowMultiple: true }},
        ]
      },
      {
        id: "toddler-m8-l2",
        title: "Creative, Sensory & Verbal Coping",
        description: "Art, nature, senses, and giving them the words",
        activities: [
          { id: "t-m8-l2-a1", type: "info_carousel" as any, title: "More Coping Tools", content: { slides: [
            { heading: "Creative Release", body: "Show your toddler how to express feelings through art:\n\u2022 Angry chalk: designate a special colour for when they\u2019re upset\n\u2022 Feelings painting or drawing\n\u2022 Build something that represents the feeling with blocks\n\u2022 Use animals and toys to act out the situation\n\nFrom age 3, encourage them to tell the story of their emotions." },
            { heading: "Sensory & Nature", body: "Sensory input helps the body relax:\n\u2022 Squish playdough or putty\n\u2022 Smell something pleasant (flower, essential oil)\n\u2022 Listen to birds or water\n\u2022 Drink some water slowly\n\nNature walks are deeply restorative: take a \u2018rainbow walk\u2019 finding something red, orange, yellow, green, blue, purple." },
            { heading: "Helpful Words to Practise", body: "Give them phrases to use instead of hitting, screaming, or shutting down:\n\u2022 \u2018I wasn\u2019t done with that!\u2019\n\u2022 \u2018Mummy/Daddy, I need help.\u2019\n\u2022 \u2018I feel sad/mad.\u2019\n\u2022 \u2018I didn\u2019t like that.\u2019\n\u2022 \u2018I need a hug.\u2019\n\u2022 \u2018That wasn\u2019t OK with me.\u2019\n\nPractise these in calm moments and celebrate when they use words instead of actions." },
          ]}},
          { id: "t-m8-l2-a2", type: "open_response" as any, title: "Build a Coping Kit", content: { prompt: "Design a personalised \u2018calm-down kit\u2019 for your child. What breathing technique will you practise? What physical release? What sensory item? What helpful phrases will you start teaching this week?", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "toddler-m9",
    title: "Managing YOUR Emotions",
    subtitle: "When you\u2019re about to lose it \u2014 the parent emotion thermometer",
    description: "Toddlers push us to our limits. Learn to monitor your own stress signals and have a plan BEFORE you reach boiling point. Includes the emotion thermometer and repair strategies for when you do lose your cool.",
    estimatedMinutes: 20,
    sources: ["Parent Self-Regulation", "Attachment Theory"],
    lessons: [
      {
        id: "toddler-m9-l1",
        title: "Your Emotion Thermometer",
        description: "Recognise your stress levels before they boil over",
        activities: [
          { id: "t-m9-l1-a1", type: "info_carousel" as any, title: "The Thermometer", content: { slides: [
            { heading: "Calm \u2192 Frustrated", body: "CALM: Feeling light, open, rolling with the chaos. Strategy: accept feelings, hold boundaries, teach coping skills.\n\nFRUSTRATED: Tension in arms and chest. \u2018Ugh, just do what I say\u2019 thoughts creeping in. Strategy: deep breaths, sip of water to reset." },
            { heading: "Angry \u2192 Explosive", body: "ANGRY: Breathing intensified, difficult to speak constructively. Strategy: take a breath, feel your feet on the ground, relax your shoulders.\n\nEXPLOSIVE: Heart pounding, physically aggressive urges, dizzying rage. Strategy: STOP. Take a break. Leave the room if children are safe. Schedule self-care time." },
            { heading: "The Repair Roadmap", body: "When you\u2019ve totally lost it (and you will \u2014 you\u2019re human):\n1. Stop. Walk away if safe.\n2. Cool down (splash water on face, breathe).\n3. Come back and repair: \u2018I\u2019m sorry I yelled. That wasn\u2019t okay. I was feeling really frustrated and I didn\u2019t handle it well. I love you.\u2019\n\nRepair teaches children that relationships can recover from ruptures." },
          ]}},
          { id: "t-m9-l1-a2", type: "open_response" as any, title: "Your Personal Thermometer", content: { prompt: "Fill in your own thermometer: What does your body feel like at each level (calm, frustrated, angry, explosive)? What specific strategies will you use at each stage to bring yourself back down?", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m9-l2",
        title: "The Lost-It Roadmap",
        description: "What to do when you\u2019ve gone past your limit",
        activities: [
          { id: "t-m9-l2-a1", type: "info_carousel" as any, title: "From Snap to Repair", content: { slides: [
            { heading: "The Stages of Losing It", body: "GO \u2014 Cool, confident. You\u2019re responding well.\nSLOW DOWN \u2014 Tone rising, impatience creeping in.\nPAUSE \u2014 Harsh tone, unkind words slipping out.\nRESTART \u2014 You\u2019ve snapped. Time to step back.\nRED HOT \u2014 You\u2019ve totally lost it. Body shaking, kids crying. Stop everything." },
            { heading: "The Restart Protocol", body: "At any \u2018restart\u2019 level:\n1. Say: \u2018I need a moment.\u2019 Walk away (ensure children are safe).\n2. Physical reset: cold water on wrists, step outside, 10 deep breaths.\n3. Self-talk: \u2018I\u2019m a good parent having a hard moment.\u2019\n4. Return when your heart rate has slowed." },
            { heading: "Repair, Don\u2019t Shame-Spiral", body: "Rather than beating yourself up, use these moments to model emotional recovery for your children:\n\u2018I yelled and that wasn\u2019t okay. Even grown-ups have big feelings sometimes. I\u2019m working on handling mine better. I love you.\u2019\n\nThis teaches them that mistakes don\u2019t define us \u2014 repair does." },
          ]}},
          { id: "t-m9-l2-a2", type: "true_false" as any, title: "Reality Check", content: { statement: "Yelling at your toddler occasionally means you\u2019re a bad parent.", isTrue: false, explanation: "Every parent loses their cool sometimes. What matters is what you do AFTER. Repair \u2014 acknowledging the rupture and reconnecting \u2014 actually builds resilience in your child and models healthy emotional processing." }},
        ]
      }
    ]
  },
  {
    id: "toddler-m10",
    title: "Routines, Naps & School Readiness",
    subtitle: "Flexible structure, dropping the nap, and preparing for kindergarten",
    description: "Daily routines provide the predictability toddlers crave. Learn how to build flexible daily flow, recognise when to drop the nap, and prepare your child for their first school experience.",
    estimatedMinutes: 25,
    sources: ["Child Development", "Early Childhood Education"],
    lessons: [
      {
        id: "toddler-m10-l1",
        title: "Building a Flexible Routine",
        description: "Predictable flow without rigid schedules",
        activities: [
          { id: "t-m10-l1-a1", type: "info_carousel" as any, title: "Flow, Not Schedule", content: { slides: [
            { heading: "Why Routines Matter", body: "Toddlers thrive on knowing what comes next. A flexible routine \u2014 a \u2018flow\u2019 \u2014 lets them mentally prepare for transitions without the stress of rigid timing. We\u2019re NOT aiming for minute-by-minute schedules that leave everyone stressed." },
            { heading: "Morning Flow Example", body: "Wake up \u2192 Go potty \u2192 Breakfast \u2192 Playtime (while you do dishes) \u2192 Brush hair \u2192 Get dressed \u2192 Leave for school/activities.\n\nThe ORDER stays consistent. The exact TIMES can flex based on the day." },
            { heading: "Evening Flow Example", body: "Dinner \u2192 Bath time \u2192 Pyjamas \u2192 Brush teeth \u2192 2 books \u2192 Bed.\n\nKeeping the same sequence every evening signals to their brain: \u2018Sleep is coming.\u2019 This reduces bedtime battles dramatically because there are no surprises." },
          ]}},
          { id: "t-m10-l1-a2", type: "open_response" as any, title: "Design Your Flow", content: { prompt: "Map out your ideal morning and evening routine \u2018flow\u2019. What order works for your family? Where do the biggest friction points happen, and how could consistency help?", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m10-l2",
        title: "When to Drop the Nap",
        description: "Signs, strategies, and surviving the transition",
        activities: [
          { id: "t-m10-l2-a1", type: "info_carousel" as any, title: "Nap Transition Guide", content: { slides: [
            { heading: "Signs It\u2019s Time", body: "Usually between ages 3\u20135 (rarely at 2.5):\n\u2022 Taking 20+ minutes to fall asleep at night\n\u2022 Night wakings increasing\n\u2022 Refusing 2+ naps per week consistently\n\u2022 Early morning wake-ups\n\nDon\u2019t rush it! Try capping the nap first before dropping entirely." },
            { heading: "Cap Before You Cut", body: "Before eliminating naps, try reducing duration:\n\u2022 Age 1\u20132.5: around 2 hours\n\u2022 Age 2.5: reduce to 1\u20131.5 hours\n\u2022 Age 3: maximum 1 hour\n\nIf capping doesn\u2019t solve night-time issues, it may be time to transition to quiet rest time instead." },
            { heading: "The Little-By-Little Sleep Plan", body: "For bedtime battles and teaching independent sleep:\n1. Place a chair next to their bed\n2. Stay quiet and boring \u2014 no engaging, singing, or back rubs\n3. Repeat your \u2018boring script\u2019: \u2018I\u2019m here, you\u2019re safe. Close your eyes.\u2019\n4. Each night, move the chair slightly further toward the door\n5. After ~2 weeks, you\u2019re at the door, then outside\n\nThis builds self-soothing without abandonment." },
          ]}},
          { id: "t-m10-l2-a2", type: "true_false" as any, title: "Nap Check", content: { statement: "Most children should stop napping by age 2.", isTrue: false, explanation: "Most children still benefit from naps until age 3\u20135. Dropping too early often leads to overtiredness and worse behaviour. Look for consistent signs over several weeks before making the change." }},
        ]
      },
      {
        id: "toddler-m10-l3",
        title: "Kindergarten Readiness",
        description: "Preparing your child (and yourself!) for the big school transition",
        activities: [
          { id: "t-m10-l3-a1", type: "info_carousel" as any, title: "Ready for School", content: { slides: [
            { heading: "Focus on Independence, Not ABCs", body: "It\u2019s tempting to worry about counting and letters. But the skill that matters most is independence:\n\u2022 Can they open their lunchbox?\n\u2022 Can they ask when they need something?\n\u2022 Can they use the toilet on their own?\n\u2022 Can they put on shoes and jacket?\n\nPractise these through play and low-pressure games." },
            { heading: "PREP for Drop-Off", body: "Use PREP to walk through every detail before the first day. Role-play school life with dolls. Read school-themed books together.\n\nAt drop-off: stay calm, stay confident. Your feelings are contagious! If you waver, they\u2019ll worry something\u2019s wrong.\n\nGive a comfort anchor: a bracelet, a drawn heart on their hand, a note in their lunchbox." },
            { heading: "Expect After-School Meltdowns", body: "They\u2019ve been keeping it together all day in a new environment. That\u2019s exhausting! They\u2019ll melt down at home because YOU are their safe person.\n\nThe meltdown won\u2019t be about school \u2014 it\u2019ll be about crayons or bananas. Look beneath the surface and validate: \u2018You\u2019re feeling really upset. Sometimes I feel upset too.\u2019" },
          ]}},
          { id: "t-m10-l3-a2", type: "open_response" as any, title: "School Readiness Plan", content: { prompt: "List 3 independence skills you can start practising with your child this week (opening containers, dressing themselves, asking for help). How will you make each one fun?", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "toddler-m11",
    title: "Specific Situations",
    subtitle: "Hitting, biting, sharing, and other daily challenges",
    description: "Practical, in-the-moment strategies for the most common toddler behaviours that push buttons.",
    estimatedMinutes: 25,
    sources: ["Child Development Research", "Positive Discipline"],
    lessons: [
      {
        id: "toddler-m11-l1",
        title: "Hitting, Biting & Aggression",
        description: "Why it happens and what to do (and not do)",
        activities: [
          { id: "t-m11-l1-a1", type: "info_carousel" as any, title: "Physical Aggression", content: { slides: [
            { heading: "Why They Hit/Bite", body: "Toddlers hit and bite because:\n\u2022 They can\u2019t express feelings in words yet\n\u2022 Their impulse control is undeveloped\n\u2022 They\u2019re testing cause-and-effect\n\u2022 They\u2019re overwhelmed\n\nIt\u2019s NOT because they\u2019re \u2018mean\u2019 or you\u2019re a bad parent." },
            { heading: "What to Do In the Moment", body: "1. Block/stop the behaviour: \u2018I won\u2019t let you hit\u2019\n2. Check the other child first (this also teaches empathy)\n3. Name the feeling: \u2018You were angry\u2019\n4. Offer the alternative: \u2018Hands are for gentle touch. You can stamp your feet when you\u2019re angry\u2019\n\nStay neutral \u2014 big reactions (positive OR negative) reinforce the behaviour." },
            { heading: "When Another Child Hits Yours", body: "This is hard! Model the response you\u2019d want:\n\u2022 Comfort your child first\n\u2022 Don\u2019t shame the other child\n\u2022 \u2018That hurt. We need to use gentle hands\u2019\n\u2022 Remove your child from the situation if needed\n\u2022 Don\u2019t force your child to \u2018hit back\u2019" },
          ]}},
          { id: "t-m11-l1-a2", type: "open_response" as any, title: "Your Plan", content: { prompt: "Write a specific script you\u2019ll use next time your toddler hits. Include what you\u2019ll say to them AND what you\u2019ll do with your body (get low, hold hands, etc.).", saveToVault: true }},
        ]
      },
      {
        id: "toddler-m11-l2",
        title: "Sharing & Turn-Taking",
        description: "Why forced sharing doesn\u2019t work and what to do instead",
        activities: [
          { id: "t-m11-l2-a1", type: "info_carousel" as any, title: "The Sharing Myth", content: { slides: [
            { heading: "Forced Sharing Doesn\u2019t Teach Sharing", body: "Imagine someone at work took your coffee and said \u2018You need to share!\u2019 You\u2019d be furious. Forced sharing teaches that other people can take your things whenever they want. True generosity comes from choice, not force." },
            { heading: "What to Do Instead", body: "\u2022 Teach turn-taking: \u2018When you\u2019re finished, then it\u2019s their turn\u2019\n\u2022 Use a timer for popular toys\n\u2022 Protect their right to finish: \u2018She\u2019s still using that. You can have it when she\u2019s done\u2019\n\u2022 Model generosity: \u2018Would you like to share some of my snack?\u2019\n\u2022 Praise genuine sharing when it naturally occurs" },
          ]}},
        ]
      }
    ]
  },
  {
    id: "toddler-m12",
    title: "The BREATHE Method",
    subtitle: "A seven-step framework for navigating tantrums and meltdowns",
    description: "When a tantrum hits, you need a clear, step-by-step process. BREATHE gives you seven anchoring steps to stay calm, connect with your child, and guide them through their biggest feelings.",
    estimatedMinutes: 25,
    lessons: [
      {
        id: "toddler-m12-l1",
        title: "The Seven Steps of BREATHE",
        description: "Your complete tantrum navigation system",
        activities: [
          { id: "t-m12-l1-a1", type: "info_carousel" as any, title: "B.R.E.A.T.H.E.", content: { slides: [
            { heading: "B \u2014 Be Clear Ahead of Time", body: "Before a tantrum even starts, set your child up for success. Use PREP to explain what\u2019s happening, what\u2019s expected, and what comes next. When children know the plan, they feel safer and tantrums reduce dramatically.\n\nR \u2014 Release Your Reaction When It Begins\nWhen the tantrum starts, YOUR first job is to regulate yourself. Take a breath. Drop your shoulders. Unclench your jaw. Your child is a sponge for your energy \u2014 if you escalate, they will too." },
            { heading: "E \u2014 Eye Level & A \u2014 Allow the Feels", body: "Get down to their level physically. This is powerful body language that says \u2018I\u2019m here, I\u2019m safe, I\u2019m not a threat.\u2019 Keep your voice low and calm.\n\nAllow the feelings to flow without trying to fix, distract, or shut them down. Tantrums aren\u2019t the time to teach \u2014 they\u2019re the time to CONNECT. \u2018You\u2019re really upset right now. I\u2019m right here.\u2019" },
            { heading: "T.H.E. \u2014 Tell, Highlight, Echo", body: "T \u2014 Tell Them Where the Bumpers Are: Once calming, set the boundary: \u2018It\u2019s not okay to throw things. I\u2019ll keep you safe.\u2019\n\nH \u2014 Highlight a Yes: Redirect to what they CAN do: \u2018You can\u2019t throw the blocks, but you CAN stomp your feet!\u2019\n\nE \u2014 Echo the Same Thing Over and Over: Repeat your calm phrase like a broken record. Repetition is soothing and helps their overwhelmed brain process." },
          ]}},
          { id: "t-m12-l1-a2", type: "open_response" as any, title: "Your BREATHE Script", content: { prompt: "Write your personal BREATHE script for a common tantrum scenario in your house. What will you say at each step? What does your \u2018broken record\u2019 phrase sound like?", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "toddler-m13",
    title: "Expectations & Milestones",
    subtitle: "What your child can actually do at each age",
    description: "Many parenting struggles come from expecting things children aren\u2019t developmentally ready for. Understand realistic expectations for impulse control, sharing, emotions, and sitting still at each age.",
    estimatedMinutes: 20,
    lessons: [
      {
        id: "toddler-m13-l1",
        title: "Realistic Expectations by Age",
        description: "What to actually expect from your 1, 2, 3, and 4-year-old",
        activities: [
          { id: "t-m13-l1-a1", type: "info_carousel" as any, title: "Age-Appropriate Expectations", content: { slides: [
            { heading: "Impulse Control & Limits", body: "Age 1\u20132: Can\u2019t consistently understand \u2018forbidden\u2019 or manage impulses. This is NORMAL.\nAge 3: Understands rules only SOME of the time.\nAge 4: Can manage impulses MORE of the time.\n\n56% of parents have inaccurate expectations here. 36% believe children under 2 have self-control. They simply don\u2019t yet." },
            { heading: "Sharing & Turn-Taking", body: "Age 1\u20132: Cannot grasp the concept of sharing.\nAge 3: Starting to understand, but still difficult.\nAge 4: More capable, but still needs practice.\n\nSharing skills genuinely develop between ages 3\u20134. 43% of parents inaccurately expect it before age 3." },
            { heading: "Tantrums & Sitting Still", body: "Tantrums are normal from age 1. Self-control develops around 3.5\u20134 and takes years to be consistent.\n\nSitting still:\n\u2022 Age 1: Can\u2019t expect it\n\u2022 Age 2: 1\u20133 minutes max\n\u2022 Age 3: 5\u201310 minutes\n\u2022 Age 4: ~10 minutes\n\u2022 Age 5: ~15 minutes\n\nHave food plated and ready BEFORE asking your toddler to sit." },
          ]}},
          { id: "t-m13-l1-a2", type: "true_false" as any, title: "Reality Check", content: { statement: "A typical 2-year-old should be able to sit still at the dinner table for 10 minutes.", isTrue: false, explanation: "A 2-year-old can realistically sit for only 1\u20133 minutes. Having overly high expectations leads to unnecessary power struggles." }},
        ]
      },
      {
        id: "toddler-m13-l2",
        title: "Developmental Milestones",
        description: "What\u2019s typical cognitively, emotionally, and physically from 1\u20134",
        activities: [
          { id: "t-m13-l2-a1", type: "info_carousel" as any, title: "Growth by Age", content: { slides: [
            { heading: "By Age 1", body: "Cognitive: Connects objects to names, knows things exist even if hidden.\nSocial: Develops toy preferences, enjoys peekaboo, separation anxiety starts.\nCommunication: Understands some words, responds to name, says simple words.\nPhysical: Walking alone or with support, pincer grasp, tosses balls." },
            { heading: "By Age 2", body: "Cognitive: Explores new places, experiments to solve problems, sorts by colour.\nSocial: Imitates social behaviour, says \u2018No\u2019, tantrums emerge with big emotions.\nCommunication: Up to 50 words, sentences up to 4 words.\nPhysical: Walks stairs with rail, uses spoon/fork, ready for potty training (20\u201330 months)." },
            { heading: "By Age 3\u20134", body: "Age 3: Learns names easily, enjoys independence, anticipates routines, beginning to share, speaks in sentences, dresses self, advanced climbing.\n\nAge 4: Understands time and size concepts, engages in cooperative play, can resolve some conflicts, tells detailed stories, hops and balances, draws recognisable shapes." },
          ]}},
          { id: "t-m13-l2-a2", type: "open_response" as any, title: "Calibrate Your Expectations", content: { prompt: "Think about one area where you might have had unrealistic expectations for your child\u2019s age. How does knowing the developmental timeline change your perspective?", saveToVault: true }},
        ]
      }
    ]
  },
  {
    id: "toddler-m14",
    title: "Daycare, Childcare & Consistency",
    subtitle: "Making these strategies work when you\u2019re not there all day",
    description: "Whether your child is in daycare, with a nanny, or with grandparents \u2014 you don\u2019t need to be with them 24/7 for these methods to work.",
    estimatedMinutes: 10,
    lessons: [
      {
        id: "toddler-m14-l1",
        title: "Consistency at Home is Enough",
        description: "How to make these strategies work regardless of your childcare setup",
        activities: [
          { id: "t-m14-l1-a1", type: "info_carousel" as any, title: "For Working Parents", content: { slides: [
            { heading: "You Don\u2019t Need to Be There 24/7", body: "These strategies work for every family setup \u2014 stay-at-home, working, single parents. The magic happens when you\u2019re consistent in YOUR home. Your child will flourish inside and outside your home when you provide that predictable, safe foundation." },
            { heading: "If They\u2019re in Daycare/School", body: "\u2022 Choose a daycare that aligns with your parenting approach\n\u2022 Be consistent at home \u2014 both parents and caregivers using the same strategies\n\u2022 Release the worry about what happens when they\u2019re not with you\n\nWhen home is consistent, that\u2019s MORE than enough." },
            { heading: "If They Have a Nanny or Grandparent", body: "\u2022 Share these strategies with your caregiver\n\u2022 Discuss approaches daily so you\u2019re on the same page\n\u2022 Focus on your home being the anchor of consistency\n\nThe most important thing: all caregivers in your home using the same language, the same boundaries, the same warmth." },
          ]}},
          { id: "t-m14-l1-a2", type: "open_response" as any, title: "Your Consistency Plan", content: { prompt: "Who are the caregivers in your child\u2019s life? List them and note one thing you could share with each person to help create consistency across environments.", saveToVault: true }},
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
