// ── Signal Mindfulness Exercises — Short & Grounding Practices ──
// 12 original Signal scripts for quick, grounding, and presence work.
// Companion to meditation-scripts.ts

import type { MeditationScript } from "./meditation-scripts";

// ═══════════════════════════════════════════════════════════
// QUICK PRACTICES (2–5 min)
// ═══════════════════════════════════════════════════════════

export const quickHalfSmile: MeditationScript = {
  id: "quick-001",
  title: "The Half-Smile",
  subtitle: "A 3-minute nervous system reset",
  category: "meditation",
  durationSec: 180,
  description: "A soft, conscious lift at the corners of the mouth that sends a signal of ease to the nervous system. Use this at any moment: waking up, waiting, before a difficult conversation.",
  evidenceSource: "Thich Nhat Hanh — The Miracle of Mindfulness",
  tags: ["quick", "nervous-system", "reset", "any-time"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `Find a comfortable position — sitting, lying, or standing. It doesn't matter.

Bring your attention to your face. Let your jaw soften. Let the muscles around your eyes release.

Now, very gently, allow the corners of your mouth to lift just slightly. Not a smile for anyone else. A half-smile — soft, turned inward. The Zen teacher Thich Nhat Hanh calls this the smile of someone who knows they are alive.

Take a slow breath in. As you exhale, let the half-smile settle into your face like something you've always known.

Breathe in. Half-smile.
Breathe out. Let it stay.

Notice what shifts. Not in the world — in you.

One more breath. In — and out.

Carry this with you today.`,
  steps: [
    { id: "s1", title: "Soften", body: "Let your jaw and eyes relax.", startTimeSec: 0, endTimeSec: 40 },
    { id: "s2", title: "Half-Smile", body: "Gently lift the corners of your mouth.", startTimeSec: 40, endTimeSec: 100 },
    { id: "s3", title: "Breathe", body: "Breathe with the half-smile. Notice what shifts.", startTimeSec: 100, endTimeSec: 160 },
    { id: "s4", title: "Carry", body: "Carry this with you today.", startTimeSec: 160, endTimeSec: 180 },
  ],
};

export const quickPebble: MeditationScript = {
  id: "quick-002",
  title: "The Pebble",
  subtitle: "Settle without effort",
  category: "meditation",
  durationSec: 300,
  description: "Imagine yourself as a pebble falling through clear water — settling without effort to the riverbed. For overwhelm, racing thoughts, or the feeling of needing to do something.",
  evidenceSource: "Thich Nhat Hanh — The Miracle of Mindfulness",
  tags: ["quick", "grounding", "anxiety", "nervous-system"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Close your eyes if that's comfortable. Let your body settle into whatever is holding it — a chair, a bed, the floor.

Take one slow breath. Let it go.

I want to invite you to imagine something.

You are a pebble. Small, smooth, rounded by time. You are held above a clear stream — cool water, sunlight moving through it.

And then you are released.

You begin to fall — slowly — through the water. There is nothing you need to do. No effort. The water holds you as you descend. You pass through light and shadow, turning gently as you go.

There is no hurry.

You are sinking toward the riverbed — soft sand and smooth stone waiting for you. Your mind may drift — let it drift, the way a leaf drifts to the surface above you. You keep sinking, gently.

You land. On the sand. Completely still. Completely held.

The water moves above you. The world moves above you. And here — at the bottom of this clear stream — there is only rest.

Breathe here for a moment. You are the pebble. You have arrived.

When you are ready, take a deeper breath. Let your awareness return to your body. To the room. To this moment.

You can return to the riverbed any time you need.`,
  steps: [
    { id: "s1", title: "Settle", body: "Close your eyes. Let your body be held.", startTimeSec: 0, endTimeSec: 30 },
    { id: "s2", title: "The Pebble", body: "Imagine yourself as a pebble above clear water.", startTimeSec: 30, endTimeSec: 90 },
    { id: "s3", title: "Falling", body: "Sinking slowly through the water. No effort.", startTimeSec: 90, endTimeSec: 180 },
    { id: "s4", title: "Landing", body: "You land on the riverbed. Completely held.", startTimeSec: 180, endTimeSec: 260 },
    { id: "s5", title: "Return", body: "Take a deeper breath. Return to the room.", startTimeSec: 260, endTimeSec: 300 },
  ],
};

export const quickCountingBreath: MeditationScript = {
  id: "quick-003",
  title: "Counting Your Breath",
  subtitle: "The simplest anchor",
  category: "meditation",
  durationSec: 300,
  description: "Counting each breath from 1 to 10, then returning to 1. When you lose count (and you will), you simply begin again. The losing count is the practice.",
  evidenceSource: "Thich Nhat Hanh — The Miracle of Mindfulness",
  tags: ["quick", "focus", "beginner", "anxiety", "nervous-system"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `This practice is as simple as it sounds — and harder than it looks.

We are going to count our breaths. From one to ten. Then return to one. That's it.

When your mind wanders — and it will — you'll notice, you'll return to one, and you'll begin again. The returning is the practice. Every time you come back, you're strengthening something.

Find your breath. Natural. Unhurried.

As you breathe in — one.
As you breathe out — one.

Breathe in — two.
Breathe out — two.

[continue internally... three... four... five... six... seven... eight... nine... ten... returning to one]

When you lose count — and notice you've lost count — just smile gently at your mind. It did what minds do. Then return to one.

Breathe in — one.

[continue for remaining time]

When you're ready, let the counting go. Just breathe.

Notice how your mind feels now compared to how it felt when you started. Even a little quieter is enough.`,
  steps: [
    { id: "s1", title: "Instruction", body: "Count breaths from 1 to 10, then return to 1.", startTimeSec: 0, endTimeSec: 40 },
    { id: "s2", title: "Count", body: "Breathe in — one. Breathe out — one.", startTimeSec: 40, endTimeSec: 120 },
    { id: "s3", title: "Continue", body: "Keep counting. When you lose count, return to one.", startTimeSec: 120, endTimeSec: 260 },
    { id: "s4", title: "Notice", body: "Let the counting go. Notice how your mind feels.", startTimeSec: 260, endTimeSec: 300 },
  ],
};

export const quickBreathingToArrive: MeditationScript = {
  id: "quick-004",
  title: "Breathing to Arrive",
  subtitle: "For transitions between roles",
  category: "meditation",
  durationSec: 240,
  description: "A short breath-and-mantra practice for transitions — moving between work and home, between tasks, between roles. Uses the mantra 'Breathing in, I have arrived. Breathing out, I am home.'",
  evidenceSource: "Diana Hill — Wise Effort (mantra breathing practice)",
  tags: ["quick", "transition", "reset", "commute", "nervous-system"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `This practice is for transitions. For the moments between one thing and the next.

Before you enter the house after work. After you put the kids to bed. Between one meeting and another. Before you open your phone in the morning.

Wherever you are right now — this is your moment between.

Take one breath longer than usual. Let the exhale be a little longer than the inhale.

Now, with the next breath in, say silently to yourself:

Breathing in — I have arrived.

And as you breathe out:

Breathing out — I am home.

Again.

Breathing in — I have arrived.
Breathing out — I am home.

You don't need to go anywhere. You don't need to become anything. You have arrived — here, in this breath, in this body.

One more time.

Breathing in — I have arrived.
Breathing out — I am home.

Let that land for a moment.

This is the practice. You can do it any time you cross a threshold — physical or internal. Two minutes is enough. One breath is enough. Arriving is always available.`,
  steps: [
    { id: "s1", title: "Transition", body: "This is your moment between.", startTimeSec: 0, endTimeSec: 40 },
    { id: "s2", title: "Arrive", body: "Breathing in — I have arrived. Breathing out — I am home.", startTimeSec: 40, endTimeSec: 140 },
    { id: "s3", title: "Repeat", body: "Continue the mantra at your own pace.", startTimeSec: 140, endTimeSec: 210 },
    { id: "s4", title: "Land", body: "Let it land. Arriving is always available.", startTimeSec: 210, endTimeSec: 240 },
  ],
};

export const quickValuesCheckin: MeditationScript = {
  id: "quick-005",
  title: "The Values Check-In",
  subtitle: "Three questions before you decide",
  category: "meditation",
  durationSec: 300,
  description: "A short reflective practice for checking in with what actually matters before making a decision, entering a hard conversation, or starting the day. Three questions. Two minutes each.",
  evidenceSource: "Diana Hill — Wise Effort (values clarification + centering)",
  tags: ["quick", "values", "intention", "clarity", "inner-work"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `Before we begin — place one hand on your chest and one on your belly.

Take three slow breaths. Let your body settle.

Now I'm going to ask you three questions. You don't need to analyse them. Just notice what arises. Sensation, image, word, feeling — all of it counts.

First question. Let it land before you answer.

What do I care about most right now?

[pause — 20 seconds]

Let your answer be simple. One thing. What matters?

Second question.

What am I protecting by not moving forward?

[pause — 20 seconds]

Something in you knows the answer. You don't have to fix it. Just see it.

Third question.

What would the version of me I most respect do right now?

[pause — 20 seconds]

Take a breath.

These questions are not a to-do list. They are a compass. You can return to them any time you feel lost in the noise of what everyone else needs from you.

What do you care about? What are you protecting? What would the best version of you do?

That's enough to work with today.`,
  steps: [
    { id: "s1", title: "Ground", body: "Hands on chest and belly. Three slow breaths.", startTimeSec: 0, endTimeSec: 30 },
    { id: "s2", title: "Question 1", body: "What do I care about most right now?", startTimeSec: 30, endTimeSec: 100 },
    { id: "s3", title: "Question 2", body: "What am I protecting by not moving forward?", startTimeSec: 100, endTimeSec: 180 },
    { id: "s4", title: "Question 3", body: "What would the version of me I most respect do?", startTimeSec: 180, endTimeSec: 260 },
    { id: "s5", title: "Compass", body: "These are your compass. That's enough for today.", startTimeSec: 260, endTimeSec: 300 },
  ],
};

// ═══════════════════════════════════════════════════════════
// GROUNDING PRACTICES (5–10 min)
// ═══════════════════════════════════════════════════════════

export const groundMindfulTea: MeditationScript = {
  id: "ground-001",
  title: "Mindful Tea or Coffee",
  subtitle: "Everyday mindfulness in a cup",
  category: "meditation",
  durationSec: 420,
  description: "A guided everyday mindfulness practice done while preparing and drinking a warm drink. Teaches the core principle that mindfulness is not a separate activity from life.",
  evidenceSource: "Thich Nhat Hanh — The Miracle of Mindfulness (Mindfulness while making tea)",
  tags: ["everyday-mindfulness", "morning", "sensory", "presence"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `When you make your next cup of tea or coffee, try this.

Not with your phone in hand. Not thinking about what comes next. Just you and the cup and the small ceremony of making something warm.

Here's what I want you to notice.

The weight of the kettle as you lift it. The sound of water beginning to heat. The smell — when does it arrive? Before the steam, before the colour changes, there's a moment when fragrance appears. Notice that moment.

Hold the cup before you pour. Feel its weight. Its texture. Then pour slowly — not because you have to, but because this is worth your full attention.

And when you bring the cup to your lips — pause.

Just for one breath.

Breathe in the steam. Let the warmth reach your face.

Then drink.

This is mindfulness. Not sitting on a cushion in silence. Not a special technique. This — the cup, the warmth, the smell, the full arrival into this ordinary moment — is the whole practice.

Thich Nhat Hanh says: if you can wash the dishes with full attention, you can meditate in silence. It begins here. With a cup.

Give that cup your full presence today.`,
  steps: [
    { id: "s1", title: "Intention", body: "Just you and the cup. No phone.", startTimeSec: 0, endTimeSec: 40 },
    { id: "s2", title: "Notice", body: "Weight of the kettle. Sound of water. The fragrance.", startTimeSec: 40, endTimeSec: 160 },
    { id: "s3", title: "Pour", body: "Hold the cup. Feel its weight. Pour slowly.", startTimeSec: 160, endTimeSec: 280 },
    { id: "s4", title: "Drink", body: "Pause. Breathe in the steam. Then drink.", startTimeSec: 280, endTimeSec: 380 },
    { id: "s5", title: "This Is Practice", body: "This ordinary moment is the whole practice.", startTimeSec: 380, endTimeSec: 420 },
  ],
};

export const groundFullBodyRelease: MeditationScript = {
  id: "ground-002",
  title: "Letting Go — The Full Body Release",
  subtitle: "Surrender each body part to gravity",
  category: "sleep",
  durationSec: 600,
  description: "A 10-minute progressive physical release done lying down. The focus is on letting go of muscular effort rather than observing sensation. Excellent for pre-sleep or post-workout.",
  evidenceSource: "Thich Nhat Hanh — The Miracle of Mindfulness (Letting go in lying-down position)",
  tags: ["relaxation", "body-scan", "sleep", "tension-release", "evening"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Lie down on your back. Arms slightly away from your sides — palms up, a soft open gesture. Legs a little apart.

Let your eyes close.

Take one breath. Let it go all the way.

Now I want to invite you to imagine that every muscle in your body — starting with your face — is as soft as silk hanging in the breeze.

Forehead. Release. Let it fall.

Eyes. Let the muscles around them soften. Not squeezed. Not held. Just resting.

Jaw. Let it fall slightly open. This is where we hold so much — the unsaid things, the clenched replies, the late-night worrying. Let it go.

Neck. The back of the neck first — that tight column of effort. Let it sink into the floor. Then the front.

Shoulders. Take a breath in — and as you breathe out, let your shoulders fall away from your ears. Fall back. Melt.

Arms. Your upper arms first — heavy, resting. Forearms. Hands. Fingers. Completely still.

Chest. Stop managing your breath for a moment. Let your body breathe by itself. Watch it happen.

Belly. Let it be soft. You don't need to hold it in. Let it rise and fall freely.

Lower back. Hips. The places we brace and carry and guard. Let the floor hold you.

Upper legs. Heavy. Thighs sinking.

Knees. Calves. Ankles.

Feet. Let them fall open. Let them be completely still.

You are the cat asleep by the fire. You are the pebble resting on the riverbed. Nothing needs doing. Nowhere to be.

Rest here. Just breathe. Your body is doing the rest.`,
  steps: [
    { id: "s1", title: "Settle", body: "Lie down. Arms open. Eyes closed.", startTimeSec: 0, endTimeSec: 40 },
    { id: "s2", title: "Face & Neck", body: "Forehead, eyes, jaw, neck — release each one.", startTimeSec: 40, endTimeSec: 160 },
    { id: "s3", title: "Shoulders & Arms", body: "Let shoulders melt. Arms heavy and still.", startTimeSec: 160, endTimeSec: 280 },
    { id: "s4", title: "Torso", body: "Chest, belly, lower back. Let the floor hold you.", startTimeSec: 280, endTimeSec: 420 },
    { id: "s5", title: "Legs & Feet", body: "Thighs, knees, calves, feet. Completely still.", startTimeSec: 420, endTimeSec: 520 },
    { id: "s6", title: "Rest", body: "Nothing needs doing. Nowhere to be.", startTimeSec: 520, endTimeSec: 600 },
  ],
};

export const groundHoldingSolid: MeditationScript = {
  id: "ground-003",
  title: "Holding Something Solid",
  subtitle: "A physical anchor for anxiety",
  category: "meditation",
  durationSec: 300,
  description: "A somatic grounding practice using physical touch with a solid object — a stone, a cup, the floor, a wall. For moments of intense anxiety, dissociation, or feeling untethered.",
  evidenceSource: "Diana Hill — Wise Effort (Hold on to Something Solid)",
  tags: ["grounding", "anxiety", "overwhelm", "quick", "sensory"],
  phase: ["luteal", "menstrual"],
  backgroundMusic: "none",
  ttsScript: `Find something solid right now.

It might be the floor beneath your feet. The seat beneath you. A cup in your hands. A smooth stone if you have one. The wall beside you.

Press into it. Gently at first — then firmer.

Feel the resistance. The thing you're pressing against does not move. It holds.

This is what solid feels like.

Now bring your full attention to the places where your body meets this solid thing. Where your feet press down. Where your hands hold. Notice the temperature. The texture. The weight.

You are here. In this body. In this room. Right now.

Sometimes when anxiety rises or the mind spirals, the fastest way back is not through the mind — it's through the body. Through sensation. Through the undeniable reality of something real beneath your hands.

Press a little firmer. Breathe.

Say quietly to yourself: I am here.

You don't need to solve anything right now. You don't need to figure it out. You just need to be here — pressing your feet into the floor, feeling the weight of something real in your hands.

Take three more breaths like this.

Breathe in — pressing down.
Breathe out — here.

Breathe in — solid ground.
Breathe out — still here.

Breathe in — I can handle this.
Breathe out — one moment at a time.

Good. That's the practice. You can return to it any time your mind gets ahead of your body.`,
  steps: [
    { id: "s1", title: "Find Something Solid", body: "The floor, a cup, a stone, a wall.", startTimeSec: 0, endTimeSec: 30 },
    { id: "s2", title: "Press", body: "Press into it. Feel the resistance.", startTimeSec: 30, endTimeSec: 80 },
    { id: "s3", title: "Notice", body: "Temperature, texture, weight. You are here.", startTimeSec: 80, endTimeSec: 160 },
    { id: "s4", title: "Anchor Breaths", body: "Three breaths. I am here. Solid ground.", startTimeSec: 160, endTimeSec: 260 },
    { id: "s5", title: "Return", body: "You can return any time your mind gets ahead.", startTimeSec: 260, endTimeSec: 300 },
  ],
};

// ═══════════════════════════════════════════════════════════
// PRESENCE & INNER WORK (7–10 min)
// ═══════════════════════════════════════════════════════════

export const presenceDayOfMindfulness: MeditationScript = {
  id: "presence-001",
  title: "A Day of Mindfulness",
  subtitle: "An invitation to slow down",
  category: "reading",
  durationSec: 480,
  description: "A listening practice for a rest day or slow morning. Introduces the idea that one day a week done slowly, intentionally, and without agenda is itself a practice.",
  evidenceSource: "Thich Nhat Hanh — The Miracle of Mindfulness (A Day of Mindfulness)",
  tags: ["intention", "rest-day", "slow-living", "self-care", "reflection"],
  phase: ["menstrual", "follicular"],
  backgroundMusic: "none",
  ttsScript: `What would it mean to give one day entirely to yourself?

Not a spa day. Not a productive self-care day where you check off your wellbeing routine. Not a day of optimising rest.

A day where you move through ordinary things — washing dishes, making food, tidying — but at two-thirds your usual speed. Where you bring your full attention to each small task as if it is the most important thing you'll do that day.

Because it is.

Thich Nhat Hanh suggests this: one day a week, set aside the work of the other days. Don't schedule meetings. Don't have people over. Do only simple work — cooking, cleaning, washing. Take a slow bath. Drink tea without your phone.

This sounds easy. Most people find it almost impossible at first.

Because we have confused busyness with aliveness.

The practice is this: every movement two or three times slower than usual. If you're placing a book on a shelf, feel the weight of it. Know that you are placing this particular book in this particular spot. When you pour water, watch it. When you eat, taste it.

The whole point is not efficiency. The whole point is presence.

If you can give one day a month to this — even one morning — you will begin to notice something shift. Not in the day itself, but in all the days that follow it.

Thich Nhat Hanh says: "This spot where you sit is your own spot. It is on this very spot and in this very moment that you can become enlightened."

Not in some distant future. Not when things calm down.

Here. On a slow Tuesday. Washing dishes.

What would your next slow day look like?`,
  steps: [
    { id: "s1", title: "The Invitation", body: "What would it mean to give one day entirely to yourself?", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "Simple Work", body: "Only simple tasks. Two-thirds speed.", startTimeSec: 90, endTimeSec: 240 },
    { id: "s3", title: "Presence", body: "Every movement with full attention.", startTimeSec: 240, endTimeSec: 380 },
    { id: "s4", title: "Your Day", body: "What would your next slow day look like?", startTimeSec: 380, endTimeSec: 480 },
  ],
};

export const presenceWhoAmI: MeditationScript = {
  id: "presence-002",
  title: "Who Am I Right Now?",
  subtitle: "A gentle self-inquiry",
  category: "inner-work",
  durationSec: 600,
  description: "A 10-minute self-inquiry practice that begins with the breath and ends with a question you carry into your journal. Gentler and more accessible — using the physical body as a starting point.",
  evidenceSource: "Thich Nhat Hanh — The Miracle of Mindfulness (Contemplation on interdependence)",
  tags: ["self-inquiry", "identity", "inner-work", "reflection", "menstrual"],
  phase: ["menstrual"],
  backgroundMusic: "gentle",
  ttsScript: `Sit comfortably. Let your hands rest in your lap.

Take three slow breaths.

I want to ask you a question. Not to answer quickly. To hold.

Who are you right now?

Not who you were last year. Not who you're trying to become. Not your roles — partner, mother, colleague, daughter.

Who are you in this moment, in this body, on this day?

Start with the physical. Notice: this is a body breathing. A heart beating without your instruction. Lungs filling and emptying. Blood moving.

There is so much of you that runs without your permission.

Now notice: there are thoughts arising. Sensations. A mood that colours how the room looks right now. This is also you.

Now notice: there is something here that is watching all of this. The one who observes the thoughts. The one who notices the sensation. Who is that?

This question — who am I? — is not meant to be answered in the way you'd answer "what is my name?" It is meant to be held, the way you might hold a smooth stone, feeling its weight, its edges, without needing to do anything with it.

Take a breath.

What is most alive in you right now? Not what is most urgent. What is most alive.

Spend the next few minutes with this question. Breathing. Noticing. You don't need an answer. The sitting with the question is the whole practice.

[pause 3 minutes]

When you're ready — open your eyes slowly. If you have a journal nearby, write one sentence: what you noticed. What is most alive. Even if it's hard to name.`,
  steps: [
    { id: "s1", title: "Settle", body: "Sit comfortably. Three slow breaths.", startTimeSec: 0, endTimeSec: 30 },
    { id: "s2", title: "The Question", body: "Who are you right now? Not your roles.", startTimeSec: 30, endTimeSec: 120 },
    { id: "s3", title: "Physical", body: "Notice your body breathing, heart beating.", startTimeSec: 120, endTimeSec: 210 },
    { id: "s4", title: "The Observer", body: "Who is watching all of this?", startTimeSec: 210, endTimeSec: 300 },
    { id: "s5", title: "Most Alive", body: "What is most alive in you right now?", startTimeSec: 300, endTimeSec: 420 },
    { id: "s6", title: "Sit With It", body: "You don't need an answer. The sitting is the practice.", startTimeSec: 420, endTimeSec: 560 },
    { id: "s7", title: "Journal", body: "Write one sentence. What is most alive.", startTimeSec: 560, endTimeSec: 600 },
  ],
};

export const presenceMakingRoom: MeditationScript = {
  id: "presence-003",
  title: "Making Room for What's Hard",
  subtitle: "Move toward instead of away",
  category: "inner-work",
  durationSec: 600,
  description: "An imagery-based practice for moving toward a feeling rather than away from it. For the luteal and menstrual phases when emotions are closer to the surface and avoidance is highest.",
  evidenceSource: "Diana Hill — Wise Effort (Make Room for What's Hard)",
  tags: ["emotional-processing", "acceptance", "inner-work", "ACT", "feelings"],
  phase: ["luteal", "menstrual"],
  backgroundMusic: "gentle",
  ttsScript: `There is something you've been avoiding.

You know what it is. You don't have to name it out loud — just let it be present with you right now, the way a cloud might be present in a room without touching anything.

Let it be here.

Take a breath.

Research on emotion — and everything I've seen working with hundreds of women — tells us this: the feelings we run from don't dissolve. They get stored. In the body. In the jaw, the shoulders, the chest. They come out sideways at the wrong moment. They show up louder in the luteal phase because your body is asking you to complete them.

You don't need to fix this feeling. You just need to make room for it.

Let's try something.

Notice where in your body you feel it right now. Not in your mind — in your body. Chest? Throat? Belly? The backs of your eyes?

Put your hand there.

Breathe into it. Not to push it away. Not to make it go away. Breathe toward it. Like you would lean toward a friend who is struggling.

And say — quietly, internally:

I can hold this.

This is what brave feels like.

Not the absence of difficulty. Not having it together. Brave is leaning toward the thing that's hard and saying: I can be with this.

Take another breath. Stay with it for a moment longer than feels comfortable.

[pause 2 minutes]

Now slowly — let your hand fall. Take a deeper breath.

Notice: you're still here. The feeling didn't consume you. You were with it, and you're still here.

This is the practice. Not resolving the feeling. Making room for it. Over and over. Until it becomes familiar — until it loses its power to make you run.

What did you notice?`,
  steps: [
    { id: "s1", title: "Acknowledge", body: "There is something you've been avoiding. Let it be here.", startTimeSec: 0, endTimeSec: 60 },
    { id: "s2", title: "The Science", body: "Feelings we run from get stored in the body.", startTimeSec: 60, endTimeSec: 140 },
    { id: "s3", title: "Locate", body: "Where in your body do you feel it? Put your hand there.", startTimeSec: 140, endTimeSec: 220 },
    { id: "s4", title: "Breathe Toward", body: "Breathe toward it. I can hold this.", startTimeSec: 220, endTimeSec: 320 },
    { id: "s5", title: "Stay", body: "Stay with it a moment longer than feels comfortable.", startTimeSec: 320, endTimeSec: 500 },
    { id: "s6", title: "Notice", body: "You're still here. The feeling didn't consume you.", startTimeSec: 500, endTimeSec: 600 },
  ],
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export const QUICK_PRACTICES: MeditationScript[] = [
  quickHalfSmile,
  quickPebble,
  quickCountingBreath,
  quickBreathingToArrive,
  quickValuesCheckin,
];

export const GROUNDING_PRACTICES: MeditationScript[] = [
  groundMindfulTea,
  groundFullBodyRelease,
  groundHoldingSolid,
];

export const PRESENCE_PRACTICES: MeditationScript[] = [
  presenceDayOfMindfulness,
  presenceWhoAmI,
  presenceMakingRoom,
];

export const ALL_EXERCISES: MeditationScript[] = [
  ...QUICK_PRACTICES,
  ...GROUNDING_PRACTICES,
  ...PRESENCE_PRACTICES,
];
