// Parenting course data — AI-generated educational content synthesized from
// widely-accepted developmental psychology and parenting research.
// All titles, scripts, and strategies are original. Not a substitute for professional advice.

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
  gentleTips?: { title: string; body: string }[];
  sleepScience?: string;
  sourceNote?: string;
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
    ],
    sleepScience: "Newborns spend 50% of sleep in REM (active sleep) vs 20% in adults. Sleep cycles are only 40–45 minutes long, meaning they may wake every 20–45 minutes. This is biologically protective and completely normal.",
    gentleTips: [
      { title: "The Fourth Trimester", body: "Your newborn has just left a warm, dark, snug environment where every need was instantly met. Recreate womb-like conditions: swaddling, white noise, gentle rocking, skin-to-skin contact. This isn't 'spoiling' — it's honouring their biology." },
      { title: "Night vs Day Confusion", body: "Newborns don't yet have a circadian rhythm. Help them learn: keep daytime bright and social, keep night feeds dim, quiet, and boring. Don't change nappies at night unless soiled — the stimulation wakes them fully." },
      { title: "Safe Sleep Reminder", body: "Always place baby on their back, on a firm flat surface, in the same room as you for all sleep. No loose bedding, pillows, or bumpers. Room temperature 16–20°C. If swaddling, follow safe swaddling guidelines." },
    ],
    sourceNote: "Schedule inspired by Gina Ford's Contented Little Baby routines. Gentle tips synthesized from Sarah Ockwell-Smith's research on infant sleep physiology."
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
    ],
    sleepScience: "Your baby's sleep cycles are still ~40 minutes. They begin each cycle in light REM sleep — easily woken for the first 20 minutes. The 'danger zone' between cycles is where most wakings happen.",
    gentleTips: [
      { title: "Day-Night Distinction", body: "Start building the body clock now: bright light and activity during the day, dim lighting from 5pm onwards. Open curtains when baby wakes, go outside for fresh air. By 4-6 weeks, you'll notice longer night stretches emerging." },
      { title: "Responsive Settling", body: "If baby fusses between sleep cycles, pause for 30 seconds before rushing in. Some babies resettle with gentle shushing or a hand on the chest. Others need a full pick-up. Both responses are fine — follow YOUR baby's cues." },
      { title: "Split Feeds for Bedtime", body: "Splitting the pre-bed feed (half before bath, half after) ensures a full tummy without baby falling asleep mid-feed and missing the second half. A well-fed baby sleeps longer stretches." },
    ],
    sourceNote: "Schedule inspired by Gina Ford's structured routines. Gentle settling strategies informed by Sarah Ockwell-Smith's responsive parenting approach."
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
    ],
    sleepScience: "Around 4-6 weeks, the circadian rhythm begins developing. Your baby's body starts producing melatonin in response to darkness. Sleep cycles are still ~45 minutes but stretches of 4-5 hours at night become possible.",
    gentleTips: [
      { title: "The 45-Minute Intruder", body: "If your baby wakes exactly 45 minutes into every nap, they're waking at the end of a sleep cycle. Try: gentle hand pressure on chest before the 40-min mark, white noise, or a slightly darker room. Some babies just need time to learn to bridge cycles." },
      { title: "Awake Windows Matter", body: "At this age, baby can handle 1.5-2 hours awake. Watch for tired signs: yawning, rubbing eyes, turning away from stimulation. Missing the sleep window leads to overtiredness, which paradoxically makes sleep HARDER." },
      { title: "Dream Feeds Work", body: "The 10:30pm dream feed is your secret weapon. Gently lift baby, offer breast/bottle without fully waking them. This 'tanks them up' and often buys you a 5-6 hour stretch. Keep the room dark and quiet." },
    ],
    sourceNote: "Schedule follows Gina Ford's feed-wake-sleep structure. Gentle tips draw on Ockwell-Smith's emphasis on biological sleep readiness cues."
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
    ],
    sleepScience: "Between 6-8 weeks, many babies start sleeping one 5-6 hour stretch. Their 40-minute sleep cycles start maturing, and they spend slightly less time in easily-woken REM sleep (dropping from 50% to ~40%).",
    gentleTips: [
      { title: "Consistent Bedtime Ritual", body: "By now, a predictable bedtime sequence helps baby's brain anticipate sleep: feed → bath → dim room → feed top-up → song/story → bed. The routine itself becomes a sleep cue. Keep it to 30-45 minutes." },
      { title: "When They Won't Settle", body: "Before assuming hunger, check: too hot/cold? Overstimulated? Undertired? Sometimes a 5-minute break in a dim room with white noise is all they need. Sarah Ockwell-Smith calls this the 'danger zone' — the transition between sleep cycles where small discomforts wake them." },
      { title: "Your Wellbeing Matters Too", body: "Sleep deprivation is cumulative and real. Accept help. Sleep when baby sleeps (even if just once a day). A rested parent is a more responsive parent — this isn't selfish, it's strategic." },
    ],
    sourceNote: "Schedule structure from Gina Ford. Gentle approach informed by Ockwell-Smith's 'danger zone' concept and responsive settling research."
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
    ],
    sleepScience: "By 8-12 weeks, the circadian rhythm is well-established. Melatonin production kicks in at dusk. Sleep cycles begin lengthening toward 50 minutes. Some babies drop the night feed entirely — but many don't until 4-6 months. Both are normal.",
    gentleTips: [
      { title: "Dropping the Dream Feed", body: "Around 12 weeks you can experiment: try reducing the dream feed volume by 30ml every few nights. If baby sleeps through, great. If they wake earlier, bring the dream feed back — they're not ready yet." },
      { title: "The Third Nap Battle", body: "The afternoon catnap often becomes harder to achieve. Don't stress if it's only 15 minutes — a short nap is still better than none. A walk in the pram or a car ride can help if they resist the cot." },
      { title: "Gentle vs Rigid", body: "Gina Ford's schedules give structure; Sarah Ockwell-Smith reminds us that every baby is different. Use the schedule as a GUIDE, not a rulebook. If your baby consistently shows tired signs 30 minutes earlier, follow THEIR cues." },
    ],
    sourceNote: "Combines Gina Ford's structured feed timing with Ockwell-Smith's emphasis on individual baby cues and responsive care."
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
    title: "The Transition Toolkit",
    subtitle: "Navigate changes and transitions without meltdowns",
    description: "Transitions are one of the biggest tantrum triggers. This four-step framework helps your toddler feel in control during everyday changes — from bath time to leaving the park.",
    estimatedMinutes: 20,
    sources: ["Transition Psychology", "Positive Discipline"],
    lessons: [
      {
        id: "toddler-m6-l1",
        title: "Prepare, Preview, Empower",
        description: "Four steps that transform transition chaos into calm cooperation",
        activities: [
          { id: "t-m6-l1-a1", type: "info_carousel" as any, title: "The Transition Framework", content: { slides: [
            { heading: "Step 1 — Prepare Ahead", body: "Before the transition happens, decide what you\u2019ll say and when. Give warnings: \u2018In 10 minutes, we\u2019ll be leaving the park.\u2019 Visual timers work brilliantly for toddlers who can\u2019t grasp abstract time." },
            { heading: "Step 2 — Preview What\u2019s Next", body: "Walk through exactly what will happen, step by step. Be specific: \u2018After we eat lunch, daddy will go to the shop and you\u2019ll stay home with mummy. You and mummy will play together until I get back.\u2019 The more details, the safer they feel." },
            { heading: "Step 3 — Empower With Choice", body: "Give them a micro-job within the transition: \u2018Would you like the blue towel or the grey towel for bath?\u2019 \u2018You can be our toy leader when we pack up!\u2019 Choice = control = cooperation." },
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
    title: "The Gentle Redirect",
    subtitle: "Redirect behaviour without shame or punishment",
    description: "When your toddler does something undesirable, this four-step approach teaches without punishing: Notice, Name, Guide, Follow Through.",
    estimatedMinutes: 15,
    sources: ["Positive Discipline", "Responsive Parenting"],
    lessons: [
      {
        id: "toddler-m7-l1",
        title: "Notice, Name, Guide, Follow Through",
        description: "A calm, structured response for unwanted behaviour",
        activities: [
          { id: "t-m7-l1-a1", type: "info_carousel" as any, title: "The Gentle Redirect Steps", content: { slides: [
            { heading: "Step 1 — Notice the Behaviour", body: "Narrate what you see without judgment: \u2018I see you\u2019re hitting the dog with your cup.\u2019 This shows your child you\u2019re paying attention and gives them a mirror for their actions." },
            { heading: "Step 2 — Name & Guide", body: "Name what\u2019s appropriate: \u2018Cups are for drinking, and the dog likes it when you\u2019re gentle with your hand.\u2019 Then guide them to try again: \u2018Let\u2019s try that again gently.\u2019 Show them what \u2018gentle\u2019 looks like with your hands." },
            { heading: "Step 3 — Follow Through", body: "If the behaviour continues, calmly follow through: \u2018I see you\u2019re still hitting the dog with the cup. The cup is going away for now and we can try again to use it safely and gently later.\u2019 No anger, no lectures. Just a natural outcome." },
          ]}},
          { id: "t-m7-l1-a2", type: "open_response" as any, title: "Write Your Redirect Scripts", content: { prompt: "Think of 3 recurring behaviours that frustrate you. Write a gentle redirect script for each one (Notice what you see, Name the rule, Guide them to try again, Follow through if needed).", saveToVault: true }},
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
  // ─── MODULE 7: SPECIFIC SITUATIONS (Ages 5–8) ──────────────────────────
  {
    id: "kt-m7",
    title: "Specific Situations: Ages 5–8",
    subtitle: "Real-world scenarios and scripts for younger children",
    description: "Young children encounter confusing social situations every day. These are the exact scripts and strategies for the most common ones — what to say, what to do, and how to coach your child through it.",
    estimatedMinutes: 35,
    sources: ["Child Development Research", "Social Skills Training"],
    lessons: [
      {
        id: "kt-m7-l1",
        title: "A Friend Says They Don\u2019t Want to Play",
        description: "Rejection stings at any age \u2014 here\u2019s how to handle it at 5",
        activities: [
          { id: "kt-m7-l1-a1", type: "info_carousel" as any, title: "When Friends Reject", content: { slides: [
            { heading: "Why It Happens", body: "At this age, friendships are fluid. A child who is your kid\u2019s best friend on Monday may ignore them on Tuesday. This is developmentally NORMAL \u2014 they\u2019re learning how relationships work. But it still hurts." },
            { heading: "What to Say to Your Child", body: "\u2022 \u2018That must have felt really sad. It\u2019s okay to feel that way.\u2019\n\u2022 \u2018Sometimes friends need space. It doesn\u2019t mean they don\u2019t like you.\u2019\n\u2022 \u2018What could you do next time? Maybe ask someone else to play, or find something fun to do on your own.\u2019\n\u2022 \u2018You are a great friend. Not everyone will see that every day, and that\u2019s okay.\u2019" },
            { heading: "Build the Skill", body: "Practice \u2018friendship flexibility\u2019 at home:\n\u2022 Role-play: \u2018If Sarah says no, what\u2019s your Plan B?\u2019\n\u2022 Encourage multiple friendships \u2014 not just one best friend\n\u2022 Teach: \u2018You can\u2019t control what others do, only how you respond\u2019\n\u2022 Read books about friendship disappointments together" },
          ]}},
          { id: "kt-m7-l1-a2", type: "single_choice" as any, title: "Practice", content: { question: "Your 6-year-old comes home crying because their friend said \u2018I don\u2019t want to be your friend anymore.\u2019 Best response?", options: [
            { label: "\u2018Don\u2019t worry, they didn\u2019t mean it\u2019", isCorrect: false },
            { label: "\u2018That really hurt, didn\u2019t it? Tell me what happened.\u2019", isCorrect: true },
            { label: "\u2018Well, find a new friend then\u2019", isCorrect: false },
            { label: "\u2018I\u2019ll talk to their mum\u2019", isCorrect: false },
          ], explanation: "Validate the emotion first. Dismissing (\u2018they didn\u2019t mean it\u2019) teaches them their feelings don\u2019t matter. Jumping to fix it removes their agency. Listen, validate, then coach." }},
        ]
      },
      {
        id: "kt-m7-l2",
        title: "Being Left Out at Lunchtime",
        description: "The lonely playground \u2014 what to do when no one will let them join",
        activities: [
          { id: "kt-m7-l2-a1", type: "info_carousel" as any, title: "The Lonely Lunchtime", content: { slides: [
            { heading: "What\u2019s Happening", body: "Exclusion at lunch/recess is one of the most painful experiences for young children. They may not tell you directly \u2014 look for signs: coming home starving (didn\u2019t eat), not wanting to go to school, saying \u2018no one likes me.\u2019" },
            { heading: "Scripts for Your Child", body: "Teach approach strategies:\n\u2022 Walk up and say: \u2018Can I play too?\u2019 (direct and simple)\n\u2022 Offer something: \u2018I\u2019ve got a ball \u2014 want to play?\u2019\n\u2022 Find the other solo kid: \u2018Hey, want to play with me?\u2019\n\u2022 If groups say no: \u2018That\u2019s okay, I\u2019ll find something else\u2019 (and walk away with head up)" },
            { heading: "Behind the Scenes", body: "Talk to the teacher \u2014 ask about buddy systems or structured play. Arrange playdates with one or two children to build connections outside school. Don\u2019t over-manage, but do set up conditions for success." },
          ]}},
          { id: "kt-m7-l2-a2", type: "open_response" as any, title: "Reflect", content: { prompt: "Does your child have at least one solid friendship at school? If not, what\u2019s one step you could take this week to help them build a connection (e.g. invite a classmate over)?", saveToVault: true }},
        ]
      },
      {
        id: "kt-m7-l3",
        title: "Someone Is Being Mean to Them",
        description: "When it\u2019s not quite bullying but still hurts",
        activities: [
          { id: "kt-m7-l3-a1", type: "info_carousel" as any, title: "Handling Meanness", content: { slides: [
            { heading: "Mean vs Bullying", body: "Not all unkindness is bullying. Children at this age are still learning empathy and impulse control. A one-off mean comment is different from repeated, targeted harassment. Both need addressing, but the approach differs." },
            { heading: "Teach the \u2018So What\u2019 Shield", body: "For verbal meanness, practice responses that deflate the power:\n\u2022 \u2018So?\u2019 (said calmly, then walk away)\n\u2022 \u2018Okay\u2019 (shrug and turn to someone else)\n\u2022 \u2018That\u2019s your opinion\u2019 (then move on)\n\nThe goal: remove the reaction the mean child is looking for. Practice until it feels natural." },
            { heading: "When Your Child IS the Mean One", body: "This happens too. If you get the call from school:\n\u2022 Don\u2019t shame: \u2018What happened? Tell me the whole story.\u2019\n\u2022 Build empathy: \u2018How do you think Liam felt when you said that?\u2019\n\u2022 Repair: \u2018What could you do to make this right?\u2019\n\u2022 Investigate: \u2018Is something bothering you that made you act that way?\u2019" },
          ]}},
        ]
      },
      {
        id: "kt-m7-l4",
        title: "First Day Nerves & New Situations",
        description: "Starting school, joining a team, going to a party alone",
        activities: [
          { id: "kt-m7-l4-a1", type: "info_carousel" as any, title: "New Situation Toolkit", content: { slides: [
            { heading: "Prepare, Don\u2019t Protect", body: "Anxiety about new things is normal. Your job isn\u2019t to remove the anxiety but to help them walk INTO it:\n\u2022 Visit the school/venue beforehand if possible\n\u2022 Read social stories about what to expect\n\u2022 Role-play: \u2018Let\u2019s practise what you\u2019ll say when you walk in\u2019\n\u2022 Give a comfort object (small toy in pocket, bracelet)" },
            { heading: "The Brave Ladder", body: "Break scary things into small steps:\n1. Talk about the new thing at home\n2. Drive past the school/building\n3. Visit for 10 minutes\n4. Stay for a short session\n5. Full attendance\n\nCelebrate each step. \u2018You did something brave today.\u2019" },
            { heading: "Morning Drop-Off Struggles", body: "Keep goodbyes SHORT and confident:\n\u2022 \u2018I love you. You\u2019re going to have a great day. I\u2019ll be here at 3.\u2019\n\u2022 Don\u2019t sneak away (breaks trust)\n\u2022 Don\u2019t linger (prolongs the agony)\n\u2022 Create a goodbye ritual (special handshake, three kisses)\n\u2022 Trust the teacher \u2014 most kids calm down within 5 minutes" },
          ]}},
        ]
      },
      {
        id: "kt-m7-l5",
        title: "Lying & Getting Caught",
        description: "Why they lie and how to build honesty",
        activities: [
          { id: "kt-m7-l5-a1", type: "info_carousel" as any, title: "Understanding Lies", content: { slides: [
            { heading: "Why Kids Lie", body: "At 5\u20138, children lie for predictable reasons:\n\u2022 To avoid punishment (\u2018I didn\u2019t break it\u2019)\n\u2022 Wishful thinking (\u2018I have a pony at home\u2019)\n\u2022 To please you (\u2018Yes I brushed my teeth\u2019)\n\u2022 To test boundaries\n\nLying is actually a cognitive milestone \u2014 it requires understanding that other people have different knowledge. But it still needs addressing." },
            { heading: "Don\u2019t Set Traps", body: "If you SAW them eat the cookie, don\u2019t ask \u2018Did you eat a cookie?\u2019 You\u2019re setting them up to lie. Instead: \u2018I see you ate a cookie. We agreed to ask first. Next time, please ask.\u2019\n\nWhen they DO tell the truth about something hard: \u2018Thank you for being honest. That was brave. Let\u2019s figure this out together.\u2019 Make honesty SAFE." },
            { heading: "Build a Truth-Telling Culture", body: "\u2022 Share YOUR mistakes: \u2018I messed up today \u2014 here\u2019s what happened\u2019\n\u2022 Reduce punishment for honesty: \u2018Because you told me the truth, we\u2019ll work this out together\u2019\n\u2022 Praise truth-telling more than you punish lying\n\u2022 Avoid: \u2018Are you LYING to me?\u2019 (threatening) \u2014 try: \u2018Let\u2019s try that again. What really happened?\u2019" },
          ]}},
        ]
      },
      {
        id: "kt-m7-l6",
        title: "Sibling Conflict",
        description: "When they won\u2019t stop fighting",
        activities: [
          { id: "kt-m7-l6-a1", type: "info_carousel" as any, title: "Sibling Wars", content: { slides: [
            { heading: "It\u2019s Normal (But Exhausting)", body: "Siblings aged 5\u20138 fight an average of 3\u20137 times per HOUR. It\u2019s developmentally normal \u2014 they\u2019re practising conflict resolution in the safest environment possible. Your job: teach skills, not referee every battle." },
            { heading: "The Sportscaster Approach", body: "Instead of judging who\u2019s right, narrate what you see:\n\u2022 \u2018I see two kids who both want the same toy.\u2019\n\u2022 \u2018It sounds like you\u2019re both feeling frustrated.\u2019\n\u2022 \u2018What\u2019s a solution that works for both of you?\u2019\n\nThis teaches THEM to solve conflicts rather than relying on you as judge." },
            { heading: "Never Compare", body: "The fastest way to destroy sibling relationships:\n\u2718 \u2018Why can\u2019t you be more like your sister?\u2019\n\u2718 \u2018Your brother never does this\u2019\n\u2718 Praising one in front of the other\n\n\u2714 Instead: celebrate each child\u2019s unique strengths separately\n\u2714 Create one-on-one time with each child\n\u2714 \u2018You two will figure this out\u2019 (show belief in their ability)" },
          ]}},
        ]
      },
      {
        id: "kt-m7-l7",
        title: "Big Questions They Ask",
        description: "Death, divorce, bodies, fairness \u2014 when they catch you off guard",
        activities: [
          { id: "kt-m7-l7-a1", type: "info_carousel" as any, title: "Tricky Questions", content: { slides: [
            { heading: "When They Ask About Death", body: "\u2018Where do people go when they die?\u2019\n\nBe honest and age-appropriate: \u2018When someone dies, their body stops working. Different families believe different things about what happens next. What\u2019s important is that the people we love stay in our hearts and memories.\u2019\n\nDon\u2019t say: \u2018They went to sleep\u2019 (creates fear of sleep) or \u2018They went away\u2019 (creates abandonment fear)." },
            { heading: "When They Ask About Divorce/Separation", body: "\u2018Why don\u2019t you and Daddy live together?\u2019\n\n\u2018Mum and Dad realised we\u2019re better parents when we live in different houses. We both love you MORE than anything. Nothing about this is your fault. You\u2019ll always have both of us.\u2019\n\nReassure: their routine, their stuff, access to both parents. Answer questions honestly but simply." },
            { heading: "Use Little Minds for Metaphors", body: "When your child asks a question you don\u2019t have the words for \u2014 about death, grief, fairness, bodies, or the world \u2014 try the Little Minds Big Questions tool. It creates gentle, age-appropriate metaphor-based stories that help children understand complex topics.\n\nVisit: littleminds.mindcast.co.nz" },
          ]}},
          { id: "kt-m7-l7-a2", type: "open_response" as any, title: "Reflect", content: { prompt: "What\u2019s the hardest question your child has ever asked you? How did you handle it? Looking back, is there anything you\u2019d do differently?", saveToVault: true }},
        ]
      },
    ]
  },
  // ─── MODULE 8: SPECIFIC SITUATIONS (Ages 9–12) ─────────────────────────
  {
    id: "kt-m8",
    title: "Specific Situations: Ages 9\u201312",
    subtitle: "Navigating the tween years \u2014 scripts for the in-between age",
    description: "The tween years are an emotional minefield. Not quite a little kid, not yet a teenager. These are the real situations they\u2019ll face and exactly how to support them.",
    estimatedMinutes: 40,
    sources: ["Tween Development", "Social Psychology"],
    lessons: [
      {
        id: "kt-m8-l1",
        title: "Social Exclusion & Friendship Drama",
        description: "When the group chat goes quiet or the party invite doesn\u2019t come",
        activities: [
          { id: "kt-m8-l1-a1", type: "info_carousel" as any, title: "Friendship Drama", content: { slides: [
            { heading: "The Group Chat Problem", body: "At this age, social dynamics become more complex. Group chats can become weapons: being removed, being ignored, screenshots being shared. Signs your child is struggling:\n\u2022 Obsessively checking their phone\n\u2022 Mood crashes after screen time\n\u2022 Refusing to go to school\n\u2022 Saying \u2018everyone hates me\u2019" },
            { heading: "Scripts for Your Child", body: "When they\u2019re excluded from a party or gathering:\n\u2022 \u2018It\u2019s okay to feel hurt \u2014 that IS hurtful\u2019\n\u2022 \u2018Not being invited doesn\u2019t mean not being valued\u2019\n\u2022 \u2018What could you do this weekend that would make you feel good?\u2019\n\u2022 Help them plan something with a different friend\n\nDon\u2019t: call the other parents, post on social media, or badmouth the other kids." },
            { heading: "The Quality vs Quantity Rule", body: "Help your tween understand: you don\u2019t need 15 friends. You need 2\u20133 people who genuinely care about you. Encourage them to invest in friendships where they feel:\n\u2022 Safe being themselves\n\u2022 Happy after spending time together (not drained)\n\u2022 Supported, not judged\n\u2022 Able to disagree without it being a disaster" },
          ]}},
        ]
      },
      {
        id: "kt-m8-l2",
        title: "Body Image & Comparison",
        description: "When they start noticing (and disliking) their changing body",
        activities: [
          { id: "kt-m8-l2-a1", type: "info_carousel" as any, title: "Body Confidence", content: { slides: [
            { heading: "Why 9\u201312 Is Critical", body: "Puberty starts as early as 8 for some children. Bodies change at wildly different rates \u2014 being the first or last creates intense self-consciousness. At this age, children start comparing themselves to peers, celebrities, and social media images." },
            { heading: "What NOT to Say", body: "\u2718 \u2018You look fine!\u2019 (dismissive)\n\u2718 \u2018Don\u2019t worry about your weight\u2019 (introduces the concept)\n\u2718 Comments about YOUR body (\u2018I\u2019m so fat\u2019 \u2014 they\u2019re listening)\n\u2718 \u2018You\u2019d be so pretty if you just...\u2019\n\u2718 Praising other kids\u2019 appearances\n\n\u2714 Instead: focus on what bodies CAN DO, not what they look like." },
            { heading: "Build Body Respect", body: "\u2022 Talk about bodies in terms of function: \u2018Your legs are strong \u2014 they carried you up that hill!\u2019\n\u2022 Model body neutrality: eat without guilt, move for joy, dress for comfort\n\u2022 Discuss how images are edited: \u2018Let me show you what filters actually do\u2019\n\u2022 Celebrate diversity: different body types in media, sport, life\n\u2022 If concerned about disordered eating, talk to your GP early" },
          ]}},
        ]
      },
      {
        id: "kt-m8-l3",
        title: "Academic Pressure & Homework Battles",
        description: "When school becomes a source of stress rather than growth",
        activities: [
          { id: "kt-m8-l3-a1", type: "info_carousel" as any, title: "School Stress", content: { slides: [
            { heading: "Pressure vs Motivation", body: "There\u2019s a difference between healthy motivation (\u2018I want to do well\u2019) and toxic pressure (\u2018I MUST be the best or I\u2019m a failure\u2019). Watch for:\n\u2022 Perfectionism: refusing to submit work unless it\u2019s flawless\n\u2022 Procrastination: paralysed by fear of failure\n\u2022 Physical symptoms: stomach aches before tests\n\u2022 Cheating (to maintain impossible standards)" },
            { heading: "Homework Without Tears", body: "\u2022 Create a consistent routine (same time, same place)\n\u2022 Break work into chunks: \u201820 minutes on, 5 minutes off\u2019\n\u2022 Be nearby but don\u2019t hover \u2014 available, not managing\n\u2022 If they\u2019re stuck: \u2018What do you think the first step is?\u2019 (don\u2019t give answers)\n\u2022 Let them experience natural consequences of forgotten homework occasionally \u2014 don\u2019t rescue every time" },
            { heading: "Redefine Success", body: "Ask: \u2018Did you try your best?\u2019 not \u2018What did you get?\u2019\n\nCelebrate effort, improvement, curiosity \u2014 not grades.\n\n\u2018I noticed you really pushed through that difficult chapter \u2014 that took real determination.\u2019\n\nYour child needs to know their worth isn\u2019t attached to a number on a page." },
          ]}},
          { id: "kt-m8-l3-a2", type: "single_choice" as any, title: "Scenario", content: { question: "Your 10-year-old is in tears because they got 78% on a test. They say \u2018I\u2019m so stupid.\u2019 Best response?", options: [
            { label: "\u2018That\u2019s a great mark! You should be proud!\u2019", isCorrect: false },
            { label: "\u2018You\u2019re clearly upset. What were you hoping for, and what felt hard about this test?\u2019", isCorrect: true },
            { label: "\u2018Next time study harder and you\u2019ll do better\u2019", isCorrect: false },
            { label: "\u2018Marks don\u2019t matter anyway\u2019", isCorrect: false },
          ], explanation: "Validate the emotion and explore what\u2019s behind it. Dismissing (\u2018great mark!\u2019) ignores their feelings. \u2018Study harder\u2019 implies they didn\u2019t try. \u2018Marks don\u2019t matter\u2019 feels dishonest. Curiosity opens conversation." }},
        ]
      },
      {
        id: "kt-m8-l4",
        title: "When a Friend Is Being a Bad Influence",
        description: "They\u2019re hanging out with someone who worries you",
        activities: [
          { id: "kt-m8-l4-a1", type: "info_carousel" as any, title: "Tricky Friendships", content: { slides: [
            { heading: "Don\u2019t Ban the Friend", body: "Your first instinct may be to forbid the friendship. This almost always backfires \u2014 it makes the friend MORE appealing and pushes your child underground. Instead, keep the friend CLOSE: invite them over, get to know them, observe the dynamic." },
            { heading: "Coach, Don\u2019t Control", body: "Ask curious questions:\n\u2022 \u2018What do you like about hanging out with Jake?\u2019\n\u2022 \u2018How do you feel after spending time with him?\u2019\n\u2022 \u2018Have you ever felt uncomfortable with something he\u2019s suggested?\u2019\n\u2022 \u2018What would you do if he wanted you to do something you weren\u2019t sure about?\u2019\n\nLet THEM evaluate the friendship." },
            { heading: "Red Line Conversations", body: "There ARE situations where you step in:\n\u2022 The friend introduces your child to substances\n\u2022 There\u2019s bullying or coercion happening\n\u2022 Criminal activity is involved\n\u2022 Your child\u2019s personality is fundamentally changing\n\nIn these cases: \u2018I\u2019m not going to let you get hurt. This is a safety decision, not a punishment.\u2019" },
          ]}},
        ]
      },
      {
        id: "kt-m8-l5",
        title: "Online Stranger Danger & Digital Safety",
        description: "The conversation about people who aren\u2019t who they say they are",
        activities: [
          { id: "kt-m8-l5-a1", type: "info_carousel" as any, title: "Digital Safety", content: { slides: [
            { heading: "The Modern Talk", body: "The \u2018stranger danger\u2019 talk now includes screens. At 9\u201312, children may be on gaming platforms, messaging apps, or social media where strangers can contact them. Be direct:\n\u2022 \u2018Some people online pretend to be kids but aren\u2019t\u2019\n\u2022 \u2018Never share personal info: school name, address, full name\u2019\n\u2022 \u2018If anyone online makes you feel weird or asks for photos, tell me immediately \u2014 you won\u2019t be in trouble\u2019" },
            { heading: "Grooming Red Flags", body: "Teach your child to recognise:\n\u2022 Someone who gives them lots of compliments and attention\n\u2022 Asks to keep their conversations secret\n\u2022 Offers gifts, game credits, or money\n\u2022 Asks them to move to a different platform\n\u2022 Asks for photos or video\n\u2022 Tries to isolate them from family/friends\n\nUse real language: \u2018Grooming is when an adult pretends to be your friend to get something from you.\u2019" },
            { heading: "Create a No-Blame Policy", body: "The single most important thing: your child must believe they can come to you WITHOUT getting in trouble. If they\u2019ve broken a screen rule and encountered something scary, the LAST thing you want is for them to hide it because they\u2019re afraid of your reaction.\n\n\u2018If something makes you uncomfortable online, you tell me. I will NEVER be angry at you for telling me. I will always help you.\u2019" },
          ]}},
        ]
      },
      {
        id: "kt-m8-l6",
        title: "Boredom & Independent Play",
        description: "When \u2018I\u2019m bored\u2019 becomes a constant complaint",
        activities: [
          { id: "kt-m8-l6-a1", type: "info_carousel" as any, title: "The Boredom Gift", content: { slides: [
            { heading: "Boredom Is Good For Them", body: "Research shows boredom drives creativity, self-direction, and resilience. Children who are constantly entertained never develop the ability to entertain themselves. When your child says \u2018I\u2019m bored,\u2019 resist the urge to fix it." },
            { heading: "What to Say", body: "\u2022 \u2018That\u2019s great \u2014 your brain is about to come up with something interesting\u2019\n\u2022 \u2018The boredom jar is on the shelf\u2019 (jar of activity ideas they\u2019ve written)\n\u2022 \u2018You have 15 minutes. If you\u2019re still bored after that, I\u2019ve got some chores\u2019\n\u2022 Don\u2019t: hand them a screen, plan an activity, feel guilty" },
            { heading: "Build Independent Play", body: "Set up conditions for self-directed time:\n\u2022 Art supplies accessible (not hidden)\n\u2022 Building materials (cardboard, tape, sticks)\n\u2022 Books everywhere\n\u2022 A \u2018quiet time\u2019 routine: 30\u201360 minutes daily of no screens, no parental entertainment\n\u2022 Get comfortable with them being uncomfortable \u2014 this is where growth happens" },
          ]}},
        ]
      },
    ]
  },
  // ─── MODULE 9: SPECIFIC SITUATIONS (Ages 13–17) ────────────────────────
  {
    id: "kt-m9",
    title: "Specific Situations: Ages 13\u201317",
    subtitle: "High-stakes scenarios and how to navigate them",
    description: "The teenage years bring situations with real consequences. These are the conversations you need to have BEFORE they happen, and exactly what to do when they do.",
    estimatedMinutes: 45,
    sources: ["Adolescent Psychology", "Risk Prevention Research"],
    lessons: [
      {
        id: "kt-m9-l1",
        title: "Peer Pressure to Try Drugs or Alcohol",
        description: "When \u2018everyone\u2019s doing it\u2019 feels real",
        activities: [
          { id: "kt-m9-l1-a1", type: "info_carousel" as any, title: "Substance Pressure", content: { slides: [
            { heading: "Have the Talk EARLY", body: "Don\u2019t wait until they\u2019re offered something. Start at 11\u201312 with age-appropriate facts:\n\u2022 Alcohol affects the developing brain differently than adult brains\n\u2022 Cannabis is NOT harmless for teenagers \u2014 it affects memory, motivation, and developing neural pathways\n\u2022 Vaping is not \u2018just water vapour\u2019\n\nBe factual, not dramatic. Scare tactics don\u2019t work \u2014 they just stop telling you things." },
            { heading: "Exit Scripts", body: "Role-play BEFORE it happens. Give them scripts:\n\u2022 \u2018Nah, I\u2019m good\u2019 (casual, no explanation needed)\n\u2022 \u2018I\u2019ve got training tomorrow\u2019 (blame sport/activity)\n\u2022 \u2018My parents drug test me\u2019 (use you as the excuse \u2014 give permission for this)\n\u2022 \u2018I\u2019m on medication that doesn\u2019t mix with it\u2019\n\u2022 Hold a drink/cup to avoid being offered one\n\nThe code word system: text PIZZA and you come get them, no questions asked." },
            { heading: "If They\u2019ve Already Tried Something", body: "If they tell you (or you find out):\n\u2022 First: breathe. Your reaction determines whether they\u2019ll tell you next time.\n\u2022 \u2018Thank you for telling me. That took courage.\u2019\n\u2022 \u2018Help me understand \u2014 what was the situation?\u2019\n\u2022 Focus on safety, not punishment: \u2018If you\u2019re ever in a situation where you\u2019ve had something and you need a ride, call me. No questions in the car.\u2019\n\u2022 THEN have the boundaries conversation." },
          ]}},
          { id: "kt-m9-l1-a2", type: "true_false" as any, title: "Check", content: { statement: "The most effective approach to preventing teenage substance use is showing them graphic images of drug damage.", isTrue: false, explanation: "Research consistently shows scare tactics are ineffective and can actually increase curiosity. Open, honest conversations about real risks, combined with strong family connection and rehearsed exit strategies, are far more effective." }},
        ]
      },
      {
        id: "kt-m9-l2",
        title: "A Friend Pressures Them to Drive Drunk (or Get in a Car)",
        description: "The life-or-death conversation",
        activities: [
          { id: "kt-m9-l2-a1", type: "info_carousel" as any, title: "Drunk Driving Safety", content: { slides: [
            { heading: "The Non-Negotiable Rule", body: "This is one of the few parenting hills to die on. Make it crystal clear:\n\u2022 \u2018You NEVER get in a car with someone who has been drinking. Ever.\u2019\n\u2022 \u2018You NEVER drive after drinking. Ever.\u2019\n\u2022 \u2018I will come get you from ANYWHERE at ANY time with NO punishment for calling me.\u2019\n\nSay this repeatedly. Make it a family mantra." },
            { heading: "How to Get Out", body: "Practical exit strategies:\n\u2022 Code word text to parent = immediate pick-up\n\u2022 Pre-download a ride-share app with your payment card\n\u2022 \u2018My mum tracks my location \u2014 she\u2019ll know if I\u2019m in a car\u2019\n\u2022 Call ANY family member or trusted adult\n\u2022 Walk if it\u2019s safe, or go to the nearest open business\n\nPractice saying: \u2018I\u2019m going to find another way home.\u2019" },
            { heading: "After the Situation", body: "If they call you at 2am from a party:\n\u2022 Go get them. Say NOTHING in the car (except \u2018I\u2019m glad you called me\u2019).\n\u2022 Talk the next day when everyone is calm.\n\u2022 \u2018I\u2019m proud of you for making the safe choice. That was hard.\u2019\n\u2022 THEN discuss any other issues (were they drinking? were they somewhere they shouldn\u2019t have been?)\n\nThe message: safety first, consequences second." },
          ]}},
        ]
      },
      {
        id: "kt-m9-l3",
        title: "Sexting & Nude Image Pressure",
        description: "When someone asks for photos \u2014 or sends them",
        activities: [
          { id: "kt-m9-l3-a1", type: "info_carousel" as any, title: "Sexting Reality", content: { slides: [
            { heading: "The Facts", body: "By age 17, approximately 1 in 4 teenagers has sent or received a sexually explicit image. This is a reality parents MUST address. In most countries, sharing intimate images of minors is a criminal offence \u2014 even if the person in the photo sent it themselves." },
            { heading: "Prevention Scripts", body: "Have this conversation directly:\n\u2022 \u2018If someone asks for a nude photo, the answer is always no \u2014 no matter how much you trust them\u2019\n\u2022 \u2018Screenshots exist. Images can be shared in seconds.\u2019\n\u2022 \u2018If someone sends you an image, don\u2019t forward it. That\u2019s potentially a crime.\u2019\n\u2022 \u2018If someone pressures you, that\u2019s a red flag about THEM, not about you.\u2019\n\nExit line: \u2018Sorry, that\u2019s not my thing\u2019 or simply \u2018No.\u2019" },
            { heading: "If It\u2019s Already Happened", body: "If your teen\u2019s image has been shared:\n\u2022 Stay calm (they\u2019re already terrified)\n\u2022 \u2018This is not your fault. The person who shared it is responsible.\u2019\n\u2022 Screenshot evidence before anything is deleted\n\u2022 Report to the platform\n\u2022 Contact the school if classmates are involved\n\u2022 Consider contacting police (non-emergency) for advice\n\u2022 Seek support: this can cause significant emotional distress" },
          ]}},
        ]
      },
      {
        id: "kt-m9-l4",
        title: "Depression, Self-Harm & Suicidal Thoughts",
        description: "The hardest conversation \u2014 and the most important",
        activities: [
          { id: "kt-m9-l4-a1", type: "info_carousel" as any, title: "Mental Health Crisis", content: { slides: [
            { heading: "Warning Signs", body: "Take these seriously \u2014 even if they seem \u2018attention-seeking\u2019 (attention-seeking IS a call for help):\n\u2022 Withdrawal from friends, family, activities\n\u2022 Changes in sleep, appetite, energy\n\u2022 Giving away possessions\n\u2022 Talking about being a burden\n\u2022 Unexplained marks or long sleeves in summer\n\u2022 Saying \u2018What\u2019s the point?\u2019 or \u2018I wish I wasn\u2019t here\u2019\n\u2022 Sudden calmness after a period of depression (can indicate a decision has been made)" },
            { heading: "How to Ask the Hard Question", body: "Asking about suicide does NOT plant the idea. Research is clear on this.\n\nSay directly: \u2018Are you thinking about hurting yourself?\u2019 or \u2018Are you having thoughts about not wanting to be alive?\u2019\n\nIf yes:\n\u2022 Stay calm\n\u2022 \u2018I\u2019m really glad you told me. You\u2019re not alone.\u2019\n\u2022 Remove access to means (medications, sharp objects)\n\u2022 Don\u2019t leave them alone\n\u2022 Call your local crisis line or take them to the emergency department" },
            { heading: "Self-Harm Is Communication", body: "Self-harm (cutting, burning, hitting themselves) is usually NOT a suicide attempt \u2014 it\u2019s a coping mechanism for overwhelming emotions. Do not react with horror or anger.\n\n\u2022 \u2018I can see you\u2019re in a lot of pain. I want to help.\u2019\n\u2022 Don\u2019t demand they stop immediately (they need alternative coping strategies first)\n\u2022 Seek professional support (GP referral to a psychologist or counsellor)\n\u2022 NZ Crisis: Need to Talk? Free call or text 1737" },
          ]}},
          { id: "kt-m9-l4-a2", type: "open_response" as any, title: "Your Safety Plan", content: { prompt: "Do you know your local crisis numbers? Does your teen know they can talk to you about dark thoughts without being judged? Write down your family\u2019s mental health safety plan.", saveToVault: true }},
        ]
      },
      {
        id: "kt-m9-l5",
        title: "Romantic Relationships & Heartbreak",
        description: "First love, first breakup, healthy vs unhealthy relationships",
        activities: [
          { id: "kt-m9-l5-a1", type: "info_carousel" as any, title: "Teen Relationships", content: { slides: [
            { heading: "Take It Seriously", body: "A 14-year-old\u2019s heartbreak is as real as an adult\u2019s. Their brain processes it with the same intensity. Never say:\n\u2718 \u2018You\u2019ll get over it\u2019\n\u2718 \u2018You\u2019re too young for a relationship\u2019\n\u2718 \u2018There are plenty more fish\u2019\n\n\u2714 \u2018This really hurts, doesn\u2019t it? I\u2019m here.\u2019\n\u2714 \u2018Tell me about what you liked about this person.\u2019\n\u2714 \u2018Heartbreak is one of the hardest things. It won\u2019t always feel this intense.\u2019" },
            { heading: "Teaching Healthy Relationship Signs", body: "Teach these BEFORE they start dating:\n\n\u2714 Healthy: respects your boundaries, supports your friendships, communicates openly, makes you feel good about yourself\n\n\u2718 Unhealthy: jealous, controlling, isolating you from friends/family, monitoring your phone, making you feel like you\u2019re never good enough, guilt-tripping\n\n\u2018A person who loves you will never make you feel afraid.\u2019" },
            { heading: "The Consent Conversation", body: "Be direct and ongoing:\n\u2022 \u2018You have the right to say no at ANY point \u2014 even if you said yes before\u2019\n\u2022 \u2018If someone is too drunk/high to clearly say yes, that\u2019s a no\u2019\n\u2022 \u2018A real partner respects boundaries without sulking\u2019\n\u2022 \u2018Pressure is not love\u2019\n\nThis conversation isn\u2019t one-off. It\u2019s ongoing, casual, and normalised." },
          ]}},
        ]
      },
      {
        id: "kt-m9-l6",
        title: "School Refusal & Motivation Loss",
        description: "When they won\u2019t go to school or have given up on caring",
        activities: [
          { id: "kt-m9-l6-a1", type: "info_carousel" as any, title: "School Avoidance", content: { slides: [
            { heading: "It\u2019s Usually Not Laziness", body: "A teenager refusing school is almost always communicating something deeper:\n\u2022 Anxiety (social or academic)\n\u2022 Bullying they haven\u2019t disclosed\n\u2022 Learning difficulties (they\u2019d rather look \u2018bad\u2019 than \u2018dumb\u2019)\n\u2022 Depression\n\u2022 Not fitting in\n\u2022 Conflict with a teacher\n\nDon\u2019t start with \u2018you HAVE to go.\u2019 Start with: \u2018Help me understand what\u2019s making school so hard right now.\u2019" },
            { heading: "The Re-Engagement Plan", body: "If they\u2019ve been away:\n1. Meet with the school (pastoral care, dean, counsellor)\n2. Start with partial attendance (just mornings, just favourite subjects)\n3. Identify one adult at school they trust\n4. Address the underlying issue (therapy if needed)\n5. Small wins: \u2018You went for two hours today. That took real courage.\u2019\n\nDon\u2019t: threaten, bribe, or make them feel worse for struggling." },
            { heading: "When They Just Don\u2019t Care", body: "Some teens lose motivation without anxiety \u2014 they\u2019re just... disconnected. This often signals:\n\u2022 They don\u2019t see the relevance\n\u2022 They\u2019re overwhelmed and have shut down\n\u2022 Depression\n\u2022 They need autonomy (being controlled = checking out)\n\nTry: \u2018What DO you care about? Let\u2019s figure out how to connect that to your future.\u2019" },
          ]}},
        ]
      },
      {
        id: "kt-m9-l7",
        title: "Identity, Sexuality & Coming Out",
        description: "When your teen is figuring out who they are",
        activities: [
          { id: "kt-m9-l7-a1", type: "info_carousel" as any, title: "Identity Exploration", content: { slides: [
            { heading: "This Is Normal Development", body: "Adolescence is THE time for identity exploration \u2014 this includes gender, sexuality, beliefs, values, style, and life direction. Your teen trying on different identities isn\u2019t a phase to be corrected \u2014 it\u2019s the developmental task of adolescence." },
            { heading: "If Your Child Comes Out", body: "What they need to hear:\n\u2022 \u2018Thank you for trusting me with this.\u2019\n\u2022 \u2018I love you. Nothing changes that.\u2019\n\u2022 \u2018What do you need from me?\u2019\n\nWhat NOT to do:\n\u2022 Don\u2019t say \u2018Are you sure?\u2019 or \u2018It\u2019s just a phase\u2019\n\u2022 Don\u2019t out them to other family members without permission\n\u2022 Don\u2019t make it about your feelings (process YOUR emotions separately)\n\u2022 Don\u2019t try to change them" },
            { heading: "If You\u2019re Struggling", body: "It\u2019s okay if this wasn\u2019t what you expected. It\u2019s okay to need time to adjust. What matters is:\n\u2022 Your child\u2019s safety and mental health\n\u2022 Research shows family acceptance is THE strongest protective factor against depression and suicide in LGBTQ+ youth\n\u2022 Get support for yourself (parent groups, counselling) so you can show up for your child\n\u2022 Their identity is not a reflection of your parenting" },
          ]}},
        ]
      },
      {
        id: "kt-m9-l8",
        title: "Parties, Alcohol & Staying Safe",
        description: "Practical party safety without being the \u2018uncool\u2019 parent",
        activities: [
          { id: "kt-m9-l8-a1", type: "info_carousel" as any, title: "Party Planning", content: { slides: [
            { heading: "Before the Party", body: "Every time your teen goes to a party, ask:\n\u2022 Where is it?\n\u2022 Whose house? (contact the parents)\n\u2022 Who else is going?\n\u2022 Will there be alcohol?\n\u2022 How will you get home?\n\u2022 What time will you be back?\n\nYes, they\u2019ll roll their eyes. Do it anyway. Frame it as: \u2018This is what caring looks like.\u2019" },
            { heading: "The Safety Toolkit", body: "Give them practical tools:\n\u2022 Phone charged, location sharing on\n\u2022 Cash for emergencies\n\u2022 Code word = pick me up immediately\n\u2022 Never leave your drink unattended\n\u2022 Stick with friends, leave with friends\n\u2022 If something feels wrong, LEAVE\n\u2022 \u2018You can always use me as an excuse: Mum said I have to be home by 11\u2019" },
            { heading: "If You\u2019re Hosting", body: "If the party is at YOUR house:\n\u2022 Be visible but not hovering\n\u2022 No alcohol for under-18s (you\u2019re legally liable)\n\u2022 Lock away your own alcohol and medications\n\u2022 Have food and non-alcoholic drinks available\n\u2022 Know who\u2019s there and how they\u2019re getting home\n\u2022 Have a clear end time\n\u2022 Check the garden/bedrooms periodically" },
          ]}},
        ]
      },
    ]
  },
  // ─── MODULE 10: DIFFICULT FAMILY SITUATIONS ────────────────────────────
  {
    id: "kt-m10",
    title: "Difficult Family Situations",
    subtitle: "Divorce, grief, trauma, and major life changes",
    description: "When life throws your family a curveball, children need extra support. These strategies help you guide your child through the hardest chapters.",
    estimatedMinutes: 30,
    sources: ["Family Therapy", "Trauma-Informed Care"],
    lessons: [
      {
        id: "kt-m10-l1",
        title: "Divorce & Separation",
        description: "How to protect your child\u2019s emotional wellbeing through the split",
        activities: [
          { id: "kt-m10-l1-a1", type: "info_carousel" as any, title: "Through the Split", content: { slides: [
            { heading: "What Children Need to Hear", body: "\u2022 \u2018This is NOT your fault. You didn\u2019t cause this.\u2019\n\u2022 \u2018Both of us love you just as much as always.\u2019\n\u2022 \u2018You don\u2019t have to choose sides.\u2019\n\u2022 \u2018It\u2019s okay to feel sad, angry, confused \u2014 all of those feelings are valid.\u2019\n\u2022 \u2018We\u2019ll figure this out together, and here\u2019s what\u2019s staying the same: [school, friends, sports, bedtime routine].\u2019" },
            { heading: "The Golden Rules", body: "\u2022 NEVER badmouth the other parent in front of your child\n\u2022 Don\u2019t use your child as a messenger\n\u2022 Don\u2019t pump them for information about the other parent\n\u2022 Don\u2019t compete for their love with gifts or leniency\n\u2022 Keep routines as consistent as possible between houses\n\u2022 Let them love both parents freely\n\nYour child is not your therapist. Get adult support for your own pain." },
            { heading: "Age-Specific Reactions", body: "5\u20138: May blame themselves, regress (bedwetting, clinginess), act out\n9\u201312: May take sides, feel responsible for fixing it, anger at both parents\n13\u201317: May withdraw, act out, rush into relationships of their own\n\nAll of these are NORMAL grief responses. Patience, consistency, and professional support if needed." },
          ]}},
        ]
      },
      {
        id: "kt-m10-l2",
        title: "Grief & Loss",
        description: "Supporting your child through death, loss, and transition",
        activities: [
          { id: "kt-m10-l2-a1", type: "info_carousel" as any, title: "Grief Support", content: { slides: [
            { heading: "Children Grieve Differently", body: "Children don\u2019t grieve in a straight line. They may seem fine one moment and devastated the next. They may grieve in \u2018puddles\u2019 \u2014 short, intense bursts followed by playing and seeming normal. This doesn\u2019t mean they don\u2019t care. It means their developing brain processes grief in doses." },
            { heading: "What to Say (And Not Say)", body: "\u2714 \u2018Grandpa died. His body stopped working.\u2019 (clear, honest)\n\u2714 \u2018It\u2019s okay to cry. It\u2019s okay to not cry too.\u2019\n\u2714 \u2018I feel sad too. We can be sad together.\u2019\n\n\u2718 \u2018They\u2019re in a better place\u2019 (why would a better place be away from me?)\n\u2718 \u2018Be strong\u2019 (teaches them to suppress grief)\n\u2718 \u2018They went to sleep\u2019 (creates fear of bedtime)" },
            { heading: "Use Metaphor-Based Stories", body: "Sometimes the right words are hard to find, especially when you\u2019re grieving too. The Little Minds Big Questions tool creates gentle, age-appropriate metaphor stories about death, loss, and difficult topics.\n\nAsk a question like: \u2018Why did grandma have to die?\u2019 and receive a warm, child-friendly story that helps them process.\n\nVisit: littleminds.mindcast.co.nz" },
          ]}},
          { id: "kt-m10-l2-a2", type: "open_response" as any, title: "Reflect", content: { prompt: "Has your family experienced a significant loss? How was it handled? Is there anything you\u2019d do differently knowing what you know now?", saveToVault: true }},
        ]
      },
    ]
  },
  // ─── MODULE 11: RAISING CONFIDENT GIRLS ────────────────────────────────
  {
    id: "kt-m11",
    title: "Raising Confident Girls",
    subtitle: "Building self-worth in a world that challenges it",
    description: "Girls face unique pressures around body image, perfectionism, people-pleasing, and social dynamics. These strategies help your daughter develop unshakeable self-worth.",
    estimatedMinutes: 25,
    sources: ["Girls\u2019 Development Research", "Self-Esteem Studies"],
    lessons: [
      {
        id: "kt-m11-l1",
        title: "The Power Perspective",
        description: "Teaching girls they have agency over their own lives",
        activities: [
          { id: "kt-m11-l1-a1", type: "info_carousel" as any, title: "Girl Confidence", content: { slides: [
            { heading: "Stop Praising Pretty", body: "The first thing most adults say to a girl: \u2018You\u2019re so pretty/cute!\u2019 The message: your appearance is your most notable quality.\n\nInstead: \u2018What are you reading?\u2019 \u2018Tell me about your project\u2019 \u2018You seem like you\u2019ve been thinking hard about something.\u2019\n\nPraise effort, curiosity, kindness, courage \u2014 not appearance." },
            { heading: "Model Imperfection", body: "Your daughter is watching how YOU handle:\n\u2022 Making mistakes (\u2018I messed up. Here\u2019s what I learned.\u2019)\n\u2022 Your body (\u2018I love what my body can do\u2019 \u2014 not \u2018I look fat\u2019)\n\u2022 Conflict (\u2018I disagreed and stood my ground\u2019)\n\u2022 Saying no (\u2018I can\u2019t do that this week\u2019 \u2014 without guilt)\n\u2022 Taking up space (\u2018I have something to say\u2019)\n\nShe will do what you DO, not what you SAY." },
            { heading: "Encourage Risk-Taking", body: "Girls are socialised to be careful. Boys are told \u2018you\u2019ll be fine.\u2019 Consciously:\n\u2022 Let her climb higher\n\u2022 Let her speak up in class (practise at dinner table first)\n\u2022 Let her fail \u2014 and recover\n\u2022 Encourage her to negotiate (pocket money, bedtime)\n\u2022 Don\u2019t rescue her from discomfort\n\u2022 \u2018That was brave\u2019 > \u2018Be careful\u2019" },
          ]}},
        ]
      },
      {
        id: "kt-m11-l2",
        title: "Navigating Girl Friendships",
        description: "The complexities of relational aggression",
        activities: [
          { id: "kt-m11-l2-a1", type: "info_carousel" as any, title: "Girl Social Dynamics", content: { slides: [
            { heading: "Relational Aggression", body: "Girls are more likely to bully through relationships: exclusion, gossip, silent treatment, social media manipulation. This is often invisible to adults but devastating to the target. Don\u2019t dismiss it as \u2018girls being girls.\u2019" },
            { heading: "Help Her Recognise Toxic Friendships", body: "Teach her the friendship audit:\n\u2022 \u2018Do you feel better or worse after spending time with this person?\u2019\n\u2022 \u2018Can you be yourself around them?\u2019\n\u2022 \u2018Do they support your other friendships or try to control them?\u2019\n\u2022 \u2018Do they keep your secrets safe?\u2019\n\u2022 \u2018Would you treat someone the way they treat you?\u2019" },
            { heading: "When She IS the Mean Girl", body: "This is harder to hear, but sometimes your daughter is the one causing harm. If this happens:\n\u2022 Don\u2019t defend or deny (\u2018My child would never...\u2019)\n\u2022 \u2018Help me understand what\u2019s going on for you that you\u2019re acting this way\u2019\n\u2022 Address the root: insecurity, home stress, social pressure\n\u2022 Require repair: genuine apology, changed behaviour\n\u2022 Monitor without hovering" },
          ]}},
        ]
      },
    ]
  },
  // ─── MODULE 12: RAISING GOOD BOYS ──────────────────────────────────────
  {
    id: "kt-m12",
    title: "Raising Emotionally Intelligent Boys",
    subtitle: "Breaking the \u2018man up\u2019 cycle",
    description: "Boys are conditioned to suppress emotions from a young age. These strategies help your son develop emotional literacy, healthy relationships, and genuine confidence.",
    estimatedMinutes: 25,
    sources: ["Masculinity Research", "Emotional Intelligence"],
    lessons: [
      {
        id: "kt-m12-l1",
        title: "Let Him Feel",
        description: "Why \u2018toughen up\u2019 is the worst advice we give boys",
        activities: [
          { id: "kt-m12-l1-a1", type: "info_carousel" as any, title: "Emotional Boys", content: { slides: [
            { heading: "The Shutdown Starts Early", body: "By age 5, boys have already learned to suppress emotions. Research shows:\n\u2022 Boys are told \u2018don\u2019t cry\u2019 or \u2018toughen up\u2019 far more than girls\n\u2022 Parents use fewer emotional words with sons\n\u2022 Boys\u2019 pain is taken less seriously\n\u2022 By adolescence, many boys can only express one emotion: anger (because it\u2019s the only one that feels \u2018acceptable\u2019)" },
            { heading: "What to Do Instead", body: "\u2022 Name emotions: \u2018It looks like you\u2019re feeling frustrated\u2019\n\u2022 Normalise crying: \u2018Crying is your body\u2019s way of releasing big feelings. That\u2019s healthy.\u2019\n\u2022 Model vulnerability: \u2018I felt really sad today when...\u2019\n\u2022 Don\u2019t use gendered emotion language: \u2018Boys don\u2019t cry\u2019 / \u2018Man up\u2019\n\u2022 Create safe spaces: car rides, bedtime, one-on-one walks\n\u2022 Ask open questions: \u2018What was the best/hardest part of your day?\u2019" },
            { heading: "Communication With Teenage Boys", body: "Teenage boys communicate differently:\n\u2022 They talk while DOING something (not face-to-face)\n\u2022 They speak in short bursts (don\u2019t push for more)\n\u2022 They process internally first (give them time)\n\u2022 They respond to genuine interest, not interrogation\n\nBest conversation triggers: cooking, driving, gaming together, physical activity side by side.\n\n\u2018Grunt\u2019 is a language. Learn it. The connection is still there." },
          ]}},
        ]
      },
    ]
  },
  // ─── MODULE 13: THE LITTLE MINDS TOOL ──────────────────────────────────
  {
    id: "kt-m13",
    title: "Answering Tricky Questions",
    subtitle: "When your child asks something you don\u2019t have words for",
    description: "Children ask the hardest questions at the worst times. Use the Little Minds Big Questions tool to create gentle, age-appropriate metaphor stories that help children understand complex topics like death, divorce, feelings, and the world.",
    estimatedMinutes: 10,
    sources: ["Narrative Therapy", "Child Communication"],
    lessons: [
      {
        id: "kt-m13-l1",
        title: "The Power of Metaphor",
        description: "Why stories work better than explanations for young minds",
        activities: [
          { id: "kt-m13-l1-a1", type: "info_carousel" as any, title: "Metaphor Magic", content: { slides: [
            { heading: "Why Metaphors Work", body: "Children\u2019s brains are wired for stories, not lectures. When you explain death as \u2018the body stopped working,\u2019 they understand intellectually. But when you tell them \u2018it\u2019s like a leaf that falls from a tree in autumn \u2014 the tree remembers every leaf,\u2019 they understand EMOTIONALLY.\n\nMetaphors bypass resistance and create understanding at a deeper level." },
            { heading: "Common Hard Questions", body: "Questions that catch parents off guard:\n\u2022 \u2018Why did Grandpa die?\u2019\n\u2022 \u2018What happens when you die?\u2019\n\u2022 \u2018Why are you and Daddy fighting?\u2019\n\u2022 \u2018Why is that person homeless?\u2019\n\u2022 \u2018Am I fat?\u2019\n\u2022 \u2018Why do people have different skin colours?\u2019\n\u2022 \u2018Where do babies come from?\u2019\n\u2022 \u2018Why can\u2019t we afford that?\u2019\n\nYou don\u2019t need perfect answers. You need honest, gentle, age-appropriate ones." },
            { heading: "Little Minds Big Questions", body: "When you\u2019re stuck for words, use the Little Minds tool. It creates warm, age-appropriate metaphor-based stories to help your child understand:\n\n\u2022 Death & grief\n\u2022 Feelings & emotions\n\u2022 Family changes\n\u2022 Fairness & justice\n\u2022 The body\n\u2022 Friendships\n\nJust type your child\u2019s question and get a gentle story you can share together.\n\nVisit: littleminds.mindcast.co.nz" },
          ]}},
          { id: "kt-m13-l1-a2", type: "open_response" as any, title: "Try It", content: { prompt: "Think of a question your child has asked that left you speechless. What was it? How did you handle it? Visit littleminds.mindcast.co.nz and try asking that same question \u2014 write down the metaphor you received.", saveToVault: true }},
        ]
      },
    ]
  },
  // ─── MODULE 14: THRIVING AT SCHOOL (inspired by teen success research) ──
  {
    id: "kt-m14",
    title: "Thriving at School",
    subtitle: "Helping your child own their education",
    description: "School is more than grades — it's where your child learns to persist, manage time, and find their voice. These strategies help them take ownership of their learning journey.",
    estimatedMinutes: 30,
    sourceBooks: ["The 6 Most Important Decisions You'll Ever Make — Sean Covey", "How to Raise an Adult — Julie Lythcott-Haims"],
    sources: ["Education Psychology", "Teen Development Research"],
    lessons: [
      {
        id: "kt-m14-l1",
        title: "Motivation vs Pressure",
        description: "Finding the sweet spot that drives learning without breaking them",
        activities: [
          { id: "kt-m14-l1-a1", type: "info_carousel" as any, title: "Internal Drive", content: { slides: [
            { heading: "The Ownership Shift", body: "Children who see education as THEIR project (not yours) are more motivated. Stop asking 'Did you do your homework?' and start asking 'What's your plan for tonight?' The shift from monitoring to coaching changes everything." },
            { heading: "The Switch Point Metaphor", body: "Every small decision is like a railway switch — just three inches of steel that sends you hundreds of miles in one direction or another. Help your teen see that daily choices about study, effort, and showing up are switch points for their future. Not dramatic — just true." },
            { heading: "When They're Failing", body: "Before you panic:\n• Ask: 'What's going on?' (not 'Why are you failing?')\n• Investigate: learning difficulty? social issue? depression? wrong subject?\n• Separate the person from the grade: 'You are not your marks'\n• Problem-solve together: 'What would help? A tutor? A study group? A different approach?'\n• Let natural consequences teach when appropriate" },
          ]}},
          { id: "kt-m14-l1-a2", type: "single_choice" as any, title: "Scenario", content: { question: "Your 14-year-old says 'School is pointless, I'm going to be a YouTuber.' Best response?", options: [
            { label: "'That's not a real career. Focus on your studies.'", isCorrect: false },
            { label: "'Tell me more about what you'd create. What skills would you need?'", isCorrect: true },
            { label: "'Fine, but you still need to pass.'", isCorrect: false },
          ], explanation: "Curiosity opens dialogue. When you explore their interest, you can naturally connect it to real skills (editing, marketing, communication, business) that school CAN support. Dismissing dreams closes the conversation entirely." }},
        ]
      },
      {
        id: "kt-m14-l2",
        title: "Finding Their Voice",
        description: "Helping your child discover what lights them up",
        activities: [
          { id: "kt-m14-l2-a1", type: "info_carousel" as any, title: "Discover Their Spark", content: { slides: [
            { heading: "Beyond Academics", body: "Not every child thrives in traditional schooling. Help them find their 'thing':\n• What do they lose track of time doing?\n• What topics do they choose to read/watch about?\n• What would they do if no one was watching or judging?\n• What problem in the world bothers them most?\n\nTheir 'thing' might be music, coding, cooking, sport, art, activism — it doesn't have to look like a traditional career path." },
            { heading: "The 10-Year Vision", body: "Try this exercise with your teen: 'Introduce yourself as you'd like to be 10 years from now. Where do you live? What do you do? What matters to you?'\n\nThis isn't about pressure — it's about possibility. When they can see a future worth working toward, daily motivation follows naturally." },
          ]}},
          { id: "kt-m14-l2-a2", type: "open_response" as any, title: "Your Child's Spark", content: { prompt: "What activities make your child come alive? When do you see them most engaged? How could you create more opportunities for that spark this month?", saveToVault: true }},
        ]
      }
    ]
  },
  // ─── MODULE 15: MAKING & KEEPING GOOD FRIENDS (teen friendship skills) ──
  {
    id: "kt-m15",
    title: "Making & Keeping Good Friends",
    subtitle: "Teaching your teen to choose wisely and be a true friend",
    description: "Friendships are one of the biggest influences on your teenager's choices. These strategies help them choose friends who lift them up, handle friendship drama, and stand up to peer pressure.",
    estimatedMinutes: 30,
    sourceBooks: ["The 6 Most Important Decisions You'll Ever Make — Sean Covey", "How to Talk So Teens Will Listen — Adele Faber"],
    sources: ["Social Psychology", "Adolescent Development"],
    lessons: [
      {
        id: "kt-m15-l1",
        title: "The Friendship Filter",
        description: "Choosing friends who make you better, not worse",
        activities: [
          { id: "kt-m15-l1-a1", type: "info_carousel" as any, title: "Choosing Well", content: { slides: [
            { heading: "Steady vs Fickle Friends", body: "Teach your child the difference:\n\nSteady friends: like you for who you are, stick around when things are hard, keep your secrets, celebrate your wins without jealousy.\n\nFickle friends: like you for what you have or who you know, drop you when someone 'better' comes along, use your secrets as weapons.\n\nAsk: 'Would this person still be your friend if you lost everything popular about you?'" },
            { heading: "The Popularity Trap", body: "Popularity isn't good or bad — it depends on WHY someone is popular. Some people are well-liked because they're genuinely kind and capable. Others are 'popular' because people are afraid of them.\n\nHelp your teen see: real influence comes from character, not status. The kids who are comfortable being themselves — not trying to climb the social ladder — often end up happiest." },
            { heading: "Don't Centre Your Life on Friends", body: "Friends make a terrible 'centre of gravity' for your life — they're imperfect, changeable, and human. If your self-worth depends on your friend count or how they treat you today, you'll be an emotional rollercoaster.\n\nBetter centre: your own values. When you know what you stand for, friendships become something you enjoy — not something you desperately need." },
          ]}},
          { id: "kt-m15-l1-a2", type: "open_response" as any, title: "Friendship Audit", content: { prompt: "Think about your child's closest friends. Do they bring out the best in your child? Is there a friendship that concerns you? How could you have a conversation about it without banning anyone?", saveToVault: true }},
        ]
      },
      {
        id: "kt-m15-l2",
        title: "Handling Gossip, Bullying & Betrayal",
        description: "What to do when friends turn on you",
        activities: [
          { id: "kt-m15-l2-a1", type: "info_carousel" as any, title: "When It Goes Wrong", content: { slides: [
            { heading: "When a Friend Betrays You", body: "It happens to almost everyone. A trusted friend shares your secret, talks behind your back, or drops you for a new crowd. Coach your teen:\n\n• 'You have a right to feel hurt — that was a betrayal of trust'\n• 'You can't control what they did, only how you respond'\n• 'Would you want to confront them directly, or let the friendship go?'\n• 'What does this teach you about what you need in a friend?'" },
            { heading: "Responding to Gossip", body: "Two strategies for when people talk:\n\n1. Confront calmly: 'I've heard you've been saying things about me. I'd prefer if you talked to me directly.' (Takes courage, often shuts it down)\n\n2. Rise above: Sometimes the most powerful response is no response. When you stop reacting, gossip loses its fuel.\n\nBoth are valid — help your teen choose based on the situation." },
            { heading: "Forgive the Small Stuff", body: "Friends will annoy each other. They'll be thoughtless, competitive, moody. Before blowing up a friendship over a single incident, ask:\n• 'Is this a pattern or a one-off?'\n• 'Are they going through something hard?'\n• 'Is this worth losing the friendship over?'\n\nForgive the small quirks. Draw the line at repeated cruelty." },
          ]}},
        ]
      },
      {
        id: "kt-m15-l3",
        title: "Being a Good Friend",
        description: "The skills that make people want to be around you",
        activities: [
          { id: "kt-m15-l3-a1", type: "info_carousel" as any, title: "Friendship Skills", content: { slides: [
            { heading: "The Emotional Bank Account", body: "Every relationship has an invisible 'trust bank account'. Deposits: keeping promises, being kind, listening, showing up. Withdrawals: gossip, flaking, selfishness, breaking trust.\n\nWhen the account is full, friendships can survive tough moments. When it's empty, one small conflict can end it.\n\nAsk your teen: 'Are you making more deposits or withdrawals in your friendships?'" },
            { heading: "Listen First", body: "The #1 friendship skill: genuinely listening. Not waiting for your turn to talk. Not looking at your phone. Actually hearing what someone is feeling.\n\nPractice at home:\n• 'Tell me about your day — I'm just going to listen'\n• Model putting your phone down during conversations\n• Reflect back: 'It sounds like you felt...' before offering advice" },
            { heading: "Stand Up, Don't Stand By", body: "A true friend doesn't just avoid being mean — they stand up when someone else IS being mean. Teach your teen:\n• 'If you see someone being excluded, invite them in'\n• 'If a friend is being talked about, change the subject or walk away'\n• 'Being a bystander IS a choice — and it's the wrong one'\n\nCourage in small moments builds character for big ones." },
          ]}},
          { id: "kt-m15-l3-a2", type: "survey" as any, title: "Reflect", content: { question: "Which friendship skill does your family need to practise most?", options: ["Listening without fixing", "Being loyal when it's hard", "Forgiving small stuff", "Standing up for others"] }},
        ]
      }
    ]
  },
  // ─── MODULE 16: AVOIDING ADDICTIONS ─────────────────────────────────────
  {
    id: "kt-m16",
    title: "Addiction-Proofing Your Child",
    subtitle: "Honest conversations about substances, screens, and habits",
    description: "Addiction doesn't start with hard drugs — it starts with coping patterns. These strategies help you have honest, effective conversations about substances, screen dependency, and building healthy habits.",
    estimatedMinutes: 30,
    sourceBooks: ["The 6 Most Important Decisions You'll Ever Make — Sean Covey", "The Teenage Brain — Frances E. Jensen", "Raising Mentally Strong Kids — Daniel Amen"],
    sources: ["Addiction Psychology", "Adolescent Neuroscience"],
    lessons: [
      {
        id: "kt-m16-l1",
        title: "Three Hard Truths About Addiction",
        description: "What every parent and teen needs to understand",
        activities: [
          { id: "kt-m16-l1-a1", type: "info_carousel" as any, title: "Addiction Reality", content: { slides: [
            { heading: "Truth 1: It's Progressive", body: "Nobody plans to become addicted. It starts small and grows slowly. First it's fun, then it's fun with problems, then it's just problems. The teenage brain is especially vulnerable because the reward system is hypersensitive while the 'brake system' (prefrontal cortex) is still developing.\n\nThis isn't a moral failing — it's neuroscience." },
            { heading: "Truth 2: Addiction Replaces Connection", body: "People don't become addicted to substances — they become addicted to the relief substances provide. Loneliness, anxiety, boredom, pain — substances numb these. The antidote isn't willpower — it's CONNECTION.\n\nThe strongest protective factor against addiction: a teen who feels genuinely connected to their family and has at least one trusted adult they can talk to." },
            { heading: "Truth 3: It Can Happen to Anyone", body: "Addiction doesn't discriminate by income, intelligence, or family type. Risk factors include:\n• Family history of addiction\n• Untreated anxiety or depression\n• Early exposure (before age 15)\n• Trauma\n• Social isolation\n• Peer group that normalises substance use\n\nProtective factors: strong family bond, clear boundaries, emotional literacy, meaningful activities, delayed first exposure." },
          ]}},
          { id: "kt-m16-l1-a2", type: "true_false" as any, title: "Fact Check", content: { statement: "Cannabis is completely safe for teenagers because it's a natural plant.", isTrue: false, explanation: "Cannabis significantly affects the developing teenage brain. Research shows regular use before age 25 can impair memory, motivation, attention, and increase risk of psychosis in those predisposed. 'Natural' does not mean safe for a developing brain." }},
        ]
      },
      {
        id: "kt-m16-l2",
        title: "Screen & Social Media Dependency",
        description: "When the phone becomes the problem",
        activities: [
          { id: "kt-m16-l2-a1", type: "info_carousel" as any, title: "Digital Dependency", content: { slides: [
            { heading: "The Dopamine Loop", body: "Social media, gaming, and short-form video are engineered to be addictive. Every notification, like, and new video triggers a dopamine hit in your teen's already-sensitive reward system.\n\nSigns of dependency:\n• Anxiety when phone is taken away\n• Can't go 10 minutes without checking\n• Mood crashes after scrolling\n• Choosing screen over real-life activities\n• Sleep disruption from late-night use" },
            { heading: "Boundaries That Work", body: "Negotiate boundaries WITH them (not imposed on them):\n• No phones at meals or in bedrooms after a set time\n• Screen-free first hour after waking\n• Weekly screen time review together (not as punishment — as awareness)\n• Model it yourself (if you're always on YOUR phone, why shouldn't they be?)\n• Replace screen time with something better, not just nothing" },
            { heading: "The Comparison Trap", body: "Social media creates a distorted mirror. Everyone's life looks better, easier, more exciting. Help your teen see:\n• 'People post their highlights, not their hard days'\n• 'How do you feel AFTER 30 minutes of scrolling? Better or worse?'\n• 'What would you have done with that hour if you didn't have a phone?'\n\nAwareness is the first step. Don't lecture — help them notice the pattern themselves." },
          ]}},
          { id: "kt-m16-l2-a2", type: "open_response" as any, title: "Family Digital Audit", content: { prompt: "How much screen time does your family consume daily? Be honest about YOUR usage too. What's one boundary you could introduce this week that applies to everyone — including you?", saveToVault: true }},
        ]
      },
      {
        id: "kt-m16-l3",
        title: "Striking at the Root",
        description: "Addressing the WHY behind unhealthy coping",
        activities: [
          { id: "kt-m16-l3-a1", type: "info_carousel" as any, title: "Root Causes", content: { slides: [
            { heading: "Ask Why, Not What", body: "Instead of focusing on WHAT they're doing (drinking, vaping, endless scrolling), ask WHY:\n• What are they trying to escape from?\n• What emotion are they trying to manage?\n• What need is being met by this behaviour?\n\n'I'm not asking to judge — I'm asking because I care about what's driving this.'" },
            { heading: "Build Alternative Coping", body: "Your teen needs healthy ways to handle:\n• Stress → physical activity, breathing, journaling\n• Loneliness → genuine connection, community, pets\n• Boredom → creative projects, nature, learning something new\n• Pain → therapy, talking, processing with a safe adult\n\nThe goal: make healthy coping as accessible and rewarding as the unhealthy option." },
            { heading: "If They're Already Struggling", body: "If you suspect substance use or serious dependency:\n• Don't panic publicly (process your fear with another adult first)\n• Approach with care: 'I've noticed some changes. I'm worried, not angry.'\n• Listen more than you talk\n• Seek professional help early (GP, counsellor, addiction service)\n• NZ: Alcohol Drug Helpline 0800 787 797\n• Remember: early intervention dramatically improves outcomes" },
          ]}},
        ]
      }
    ]
  },
  // ─── MODULE 17: BUILDING SELF-WORTH ─────────────────────────────────────
  {
    id: "kt-m17",
    title: "Building Unshakeable Self-Worth",
    subtitle: "Helping your child like who they are — from the inside out",
    description: "Self-worth is the foundation everything else is built on. These strategies help your child develop genuine confidence based on character and competence — not likes, looks, or popularity.",
    estimatedMinutes: 30,
    sourceBooks: ["The 6 Most Important Decisions You'll Ever Make — Sean Covey", "Good Inside — Becky Kennedy", "Raising Girls Who Like Themselves — Kasey Edwards"],
    sources: ["Self-Esteem Research", "Positive Psychology"],
    lessons: [
      {
        id: "kt-m17-l1",
        title: "The Two Mirrors",
        description: "Teaching your child to see themselves clearly",
        activities: [
          { id: "kt-m17-l1-a1", type: "info_carousel" as any, title: "Mirrors of Self-Worth", content: { slides: [
            { heading: "The Social Mirror", body: "The 'social mirror' is what the world reflects back at your child: peer opinions, social media likes, grades, appearance comments. This mirror is distorted — it changes daily, it's based on others' insecurities, and it never gives an accurate picture.\n\nIf your child bases their worth on this mirror, they'll always be searching for validation." },
            { heading: "The True Mirror", body: "The 'true mirror' reflects who they actually are: their values, their effort, their kindness, their growth. This mirror is stable — it doesn't change based on who's looking.\n\nHelp them build this mirror by regularly reflecting THEIR qualities back to them:\n• 'I noticed you helped that kid who was sitting alone. That takes courage.'\n• 'You didn't give up on that project even when it was hard. That's persistence.'\n• 'The way you handled that disagreement showed real maturity.'" },
            { heading: "Character + Competence", body: "True confidence comes from two sources:\n\n1. CHARACTER: Who you are when no one's watching. Integrity, kindness, resilience.\n2. COMPETENCE: Getting good at something through effort. Sport, art, music, academics, cooking, fixing things.\n\nHelp your child develop BOTH. Character without skill feels hollow. Skill without character feels empty." },
          ]}},
          { id: "kt-m17-l1-a2", type: "open_response" as any, title: "Reflect", content: { prompt: "Which mirror does your child look at most — the social mirror or the true mirror? What's one thing you could say this week to strengthen their true mirror?", saveToVault: true }},
        ]
      },
      {
        id: "kt-m17-l2",
        title: "Conquering Their Personal Challenge",
        description: "Everyone has a thing they struggle with — help them face it",
        activities: [
          { id: "kt-m17-l2-a1", type: "info_carousel" as any, title: "Facing the Fear", content: { slides: [
            { heading: "Everyone Has One", body: "Every child has something that feels like their biggest obstacle — their personal dragon to slay. It might be:\n• Speaking up in class\n• Making friends\n• A learning difficulty\n• Body image\n• A family situation\n• Anxiety\n• Not fitting in\n\nThe size of the challenge doesn't matter. What matters is that they face it, not avoid it." },
            { heading: "Small Wins Build Confidence", body: "Confidence doesn't come from affirmations or pep talks. It comes from DOING hard things and surviving. Help your child:\n\n1. Name the challenge (what specifically scares them?)\n2. Break it into tiny steps\n3. Celebrate each step (not just the outcome)\n4. Normalise setbacks ('Everyone falls. Getting up is the skill.')\n5. Model your own struggles ('I was nervous about that presentation too')" },
            { heading: "The Anti-Comparison Practice", body: "Comparison is the thief of joy — especially for teenagers. Help them shift:\n\nFROM: 'Why am I not as good/pretty/smart/popular as them?'\nTO: 'Am I better than I was yesterday?'\n\nCreate a family practice: each person shares one thing they improved at this week, no matter how small. Progress is personal." },
          ]}},
          { id: "kt-m17-l2-a2", type: "survey" as any, title: "Your Child's Challenge", content: { question: "What do you think your child struggles with most?", options: ["Social confidence", "Academic pressure", "Body image", "Family situation", "Finding their identity", "Anxiety or worry"] }},
        ]
      }
    ]
  },
];