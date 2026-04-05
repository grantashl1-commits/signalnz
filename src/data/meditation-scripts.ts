// ── Signal Meditation & Mindfulness Script Library ──────────
// Original Signal content. Frameworks referenced for inspiration only.
// Uses same structure as somatic-scripts.ts for player compatibility.

export type MeditationCategory = "meditation" | "reading" | "inner-work" | "sleep" | "phase-practice";
export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface MeditationStep {
  id: string;
  title: string;
  body: string;
  startTimeSec?: number;
  endTimeSec?: number;
}

export interface MeditationScript {
  id: string;
  title: string;
  subtitle: string;
  category: MeditationCategory;
  durationSec: number;
  description: string;
  ttsScript: string;
  steps: MeditationStep[];
  phase?: CyclePhase[] | "all";
  tags: string[];
  evidenceSource: string;
  backgroundMusic?: "none" | "gentle" | "nature" | "binaural";
}

// ═══════════════════════════════════════════════════════════
// GUIDED MEDITATIONS
// ═══════════════════════════════════════════════════════════

const medBodyScan: MeditationScript = {
  id: "med-001",
  title: "The Signal Body Scan",
  subtitle: "Full-body awareness meditation",
  category: "meditation",
  durationSec: 1200,
  description: "A 20-minute progressive body scan that moves attention from the feet to the crown, building interoceptive awareness and releasing held tension. Signal's foundational meditation.",
  evidenceSource: "MBSR body scan research (Kabat-Zinn); Polyvagal Theory (Porges)",
  tags: ["nervous-system", "body-awareness", "sleep", "all-phases"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Find a comfortable position. Lying down is ideal, but sitting is fine too. Let your body be supported. You don't need to hold anything up right now.

Close your eyes, or let your gaze soften downward.

Take three slow breaths. Not deep, not forced. Just a little slower than your natural rhythm. In through the nose. Out through the mouth.

We're going to move attention through your body. Not to fix anything. Not to change anything. Just to notice. The only task here is noticing.

Begin with your feet. Feel the weight of them. The soles, the toes, the arches. Maybe there's warmth. Maybe tension. Maybe nothing. All of that is fine.

Move to your ankles. Your shins. Your calves. Notice the texture of sensation here — heaviness, lightness, tingling, stillness. Whatever you find, let it be.

Now your knees. The backs of your knees. Your thighs. The muscles here carry so much of your day. Just acknowledge them.

Your hips. Your pelvis. This is the body's centre of gravity. Let it be heavy. Let the surface beneath you take the weight.

Your lower back. The sacrum. Many women hold tension here without knowing it. Breathe into it. Not to release — just to acknowledge.

Your belly. Let it be soft. We spend so much time holding our stomachs in. Right now, let it go. Let your belly rise and fall with each breath.

Your ribs. Your chest. Feel the expansion and contraction of breathing. The heart beating beneath. Steady, quiet, always working for you.

Your shoulders. Let them drop. Whatever you're carrying — set it down for these next few minutes.

Your arms. Your elbows. Your forearms. Your wrists. Your hands. Your fingers. Notice any warmth, any pulsing, any stillness.

Your neck. Your throat. The jaw. Let your teeth part slightly. Soften the muscles around your eyes.

Your forehead. The crown of your head.

Now hold your whole body in awareness. All at once. One living, breathing whole. You don't have to do anything with it. Just be here. Just be this.

Stay here for a moment. Breathing. Being.

When you're ready, begin to move your fingers and toes. Take a deeper breath. And gently open your eyes.

You have just practised the most fundamental act of self-care — paying attention to yourself.`,
  steps: [
    { id: "s1", title: "Settle", body: "Find a comfortable position. Take three slow breaths.", startTimeSec: 0, endTimeSec: 60 },
    { id: "s2", title: "Feet & Legs", body: "Move attention through your feet, ankles, shins, calves, knees, and thighs.", startTimeSec: 60, endTimeSec: 300 },
    { id: "s3", title: "Hips & Core", body: "Notice your hips, pelvis, lower back, and belly. Let your belly be soft.", startTimeSec: 300, endTimeSec: 540 },
    { id: "s4", title: "Chest & Shoulders", body: "Feel your ribs, chest, and shoulders. Let them drop.", startTimeSec: 540, endTimeSec: 720 },
    { id: "s5", title: "Arms & Hands", body: "Move through your arms, wrists, hands, fingers.", startTimeSec: 720, endTimeSec: 840 },
    { id: "s6", title: "Head & Face", body: "Soften your jaw, eyes, forehead. Reach the crown.", startTimeSec: 840, endTimeSec: 1020 },
    { id: "s7", title: "Whole Body", body: "Hold your whole body in awareness. Just be here.", startTimeSec: 1020, endTimeSec: 1140 },
    { id: "s8", title: "Return", body: "Gently begin to move and open your eyes.", startTimeSec: 1140, endTimeSec: 1200 },
  ],
};

const medRain: MeditationScript = {
  id: "med-002",
  title: "RAIN — Working with Difficult Emotions",
  subtitle: "Meet what you feel with compassion",
  category: "meditation",
  durationSec: 900,
  description: "Guides you through Recognise, Allow, Investigate, and Nurture — a four-step process for meeting difficult emotions with compassion rather than resistance. Inspired by the RAIN framework.",
  evidenceSource: "RAIN framework (Brach); self-compassion research (Neff)",
  tags: ["emotional-processing", "self-compassion", "luteal", "menstrual"],
  phase: ["menstrual", "luteal"],
  backgroundMusic: "gentle",
  ttsScript: `Settle into a comfortable position. Let your body be held by whatever surface is beneath you.

This practice is for when something feels difficult. An emotion. A thought. A weight you've been carrying. You don't need to know what it is yet. Just notice that something is here.

The first step is to Recognise. Simply name what's present. Not to analyse. Just to acknowledge. You might say silently: "I notice anxiety." Or "There's sadness here." Or "Something feels heavy." Just name it. That's enough.

The second step is to Allow. This is the hardest part. We want to fix, push away, distract, numb. Instead — just allow it to be here. You're not approving of it. You're not making it permanent. You're just letting it exist without fighting it. Say to yourself: "I can let this be here."

The third step is to Investigate. With gentleness, ask: where do I feel this in my body? What does it feel like? Is there a younger part of me that knows this feeling? You're not looking for answers. You're looking with curiosity.

The final step is to Nurture. Place a hand on your heart, or wherever feels natural. Offer yourself what you would offer a close friend: "I see you. This is hard. You don't have to carry this alone."

Stay here with this feeling of nurture. Breathing. Holding yourself.

The luteal and menstrual phases bring emotions closer to the surface. This is not a malfunction. This is your biology giving you access to what needs attention. Trust it.

When you're ready, take a deeper breath. Open your eyes. Carry this gentleness forward.`,
  steps: [
    { id: "s1", title: "Settle", body: "Find your position. Notice that something is present.", startTimeSec: 0, endTimeSec: 60 },
    { id: "s2", title: "Recognise", body: "Name what's here. 'I notice…'", startTimeSec: 60, endTimeSec: 240 },
    { id: "s3", title: "Allow", body: "Let it exist without fighting. 'I can let this be here.'", startTimeSec: 240, endTimeSec: 420 },
    { id: "s4", title: "Investigate", body: "Where is this in your body? What does it feel like?", startTimeSec: 420, endTimeSec: 600 },
    { id: "s5", title: "Nurture", body: "Offer yourself compassion. Place a hand on your heart.", startTimeSec: 600, endTimeSec: 840 },
    { id: "s6", title: "Return", body: "Breathe. Open your eyes. Carry this gentleness forward.", startTimeSec: 840, endTimeSec: 900 },
  ],
};

const medLovingKindness: MeditationScript = {
  id: "med-003",
  title: "Loving-Kindness — Beginning with Yourself",
  subtitle: "Metta meditation for self-compassion",
  category: "meditation",
  durationSec: 900,
  description: "A loving-kindness practice that begins with the self before extending to others. Opens with an acknowledgement of the difficulty most women have in receiving care for themselves.",
  evidenceSource: "Frederickson (2008) loving-kindness; Salzberg Metta tradition",
  tags: ["self-compassion", "warmth", "nervous-system"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Close your eyes. Settle into your body.

Here is a truth most women know but rarely say aloud: it is easier to give care than to receive it. Easier to hold others than to be held. Easier to love outward than inward.

This practice begins where it should — with you.

Place your hands wherever they feel natural. On your lap. On your heart. On your belly.

Repeat these phrases silently, directed at yourself:

May I be safe. May I be healthy. May I be at peace. May I live with ease.

Don't worry if you don't believe them yet. The practice is the repetition, not the belief. Say them anyway.

May I be safe. May I be healthy. May I be at peace. May I live with ease.

Now think of someone you care about. Hold their face in your mind. Direct the same words to them:

May you be safe. May you be healthy. May you be at peace. May you live with ease.

Now expand further. Think of someone neutral — someone you don't know well. Offer the same:

May you be safe. May you be healthy. May you be at peace. May you live with ease.

Finally, expand to all beings. All women. All people struggling right now:

May all beings be safe. May all beings be healthy. May all beings be at peace. May all beings live with ease.

Return to yourself. One more time:

May I be safe. May I be healthy. May I be at peace. May I live with ease.

You deserve the care you give so freely to others.`,
  steps: [
    { id: "s1", title: "Settle", body: "Close your eyes. Acknowledge that receiving care is hard.", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "Self", body: "Direct loving-kindness to yourself. May I be safe…", startTimeSec: 90, endTimeSec: 300 },
    { id: "s3", title: "Loved One", body: "Think of someone you care about. Offer the same words.", startTimeSec: 300, endTimeSec: 480 },
    { id: "s4", title: "Neutral Person", body: "Extend to someone you don't know well.", startTimeSec: 480, endTimeSec: 600 },
    { id: "s5", title: "All Beings", body: "Expand to all beings everywhere.", startTimeSec: 600, endTimeSec: 750 },
    { id: "s6", title: "Return to Self", body: "Come back to yourself. You deserve this care.", startTimeSec: 750, endTimeSec: 900 },
  ],
};

const medRelaxationResponse: MeditationScript = {
  id: "med-004",
  title: "The Relaxation Response",
  subtitle: "Evidence-based stress reduction",
  category: "meditation",
  durationSec: 600,
  description: "The evidence-based relaxation technique from Dr. Herbert Benson at Harvard — one of the first scientifically validated meditation protocols. Two conditions: a mental device and a passive attitude. 10 minutes reduces cortisol measurably.",
  evidenceSource: "Benson et al. (1974–2000); multiple RCTs on cortisol, blood pressure, anxiety",
  tags: ["stress-reduction", "parasympathetic", "nervous-system", "evidence-based"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `Sit comfortably. Close your eyes.

This practice was developed at Harvard Medical School. It has one purpose: to activate your body's built-in relaxation system. It requires two things — a focus word, and a passive attitude.

Choose a word to repeat silently. Something neutral and calming. "Release" works well. "Peace" works. "Let go" works. Choose whatever feels right.

Now begin repeating that word silently on each exhale. Breathe in naturally. As you breathe out, silently say your word.

Release. Release. Release.

When thoughts come — and they will — simply notice them and return to the word. Don't judge the thoughts. Don't judge yourself for having them. Just return to the word. This passive return is the practice.

Continue breathing. Continue repeating.

There's nothing to achieve here. No state to reach. The repetition itself activates the response. Your heart rate is slowing. Your blood pressure is dropping. Cortisol is clearing.

Keep going. Breath in. Word on the exhale.

You are doing something profoundly simple and profoundly powerful.

Continue for the next few minutes. If you lose the word, find it again. No rush. No effort.

When you hear the gentle chime, keep your eyes closed for another moment. Then slowly open them. Sit quietly for a moment before standing.

Well done. Ten minutes of this practice changes your biochemistry for hours.`,
  steps: [
    { id: "s1", title: "Choose Your Word", body: "Pick a neutral focus word — 'release', 'peace', or your own.", startTimeSec: 0, endTimeSec: 60 },
    { id: "s2", title: "Begin Repeating", body: "Silently say the word on each exhale. Breathe naturally.", startTimeSec: 60, endTimeSec: 180 },
    { id: "s3", title: "Passive Return", body: "When thoughts come, notice and return to the word.", startTimeSec: 180, endTimeSec: 360 },
    { id: "s4", title: "Deepening", body: "Continue repeating. Your body is responding.", startTimeSec: 360, endTimeSec: 540 },
    { id: "s5", title: "Return", body: "Keep eyes closed a moment. Then slowly open.", startTimeSec: 540, endTimeSec: 600 },
  ],
};

const medNSDR: MeditationScript = {
  id: "med-005",
  title: "Non-Sleep Deep Rest",
  subtitle: "Neurological restoration protocol",
  category: "meditation",
  durationSec: 600,
  description: "A deliberate rest practice — not sleep, but neurological restoration. 10 minutes produces measurable dopamine replenishment and skill consolidation. Ideal for afternoons.",
  evidenceSource: "Huberman (Stanford Neuroscience); NSDR research; Stickgold sleep-learning",
  tags: ["rest", "recovery", "afternoon", "sleep"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Lie down or recline. Close your eyes. You're going to rest — deeply — without sleeping.

Take a long exhale. Longer than your inhale. Let your body become heavy.

Bring your attention to the space behind your eyelids. There's nothing to see, nothing to visualise. Just rest in that darkness.

Feel the weight of your body. Let every muscle release. Your jaw. Your shoulders. Your hands. Your legs.

Breathe naturally. On each exhale, feel yourself sink a little deeper into the surface beneath you. Not sleeping. Just resting.

Your mind may produce thoughts, images, fragments. Let them pass like clouds. You don't need to follow them. You don't need to push them away.

This is not sleep. This is a deliberate neurological rest state. Your brain is clearing adenosine, restoring dopamine, consolidating learning. All you need to do is lie here.

Continue resting. If you drift toward sleep, that's fine. If you stay awake, that's fine too. The practice is the same.

Let the next few minutes be completely yours. No tasks. No obligations. Just rest.

When you hear the gentle tone, begin to move your fingers and toes. Take a few deeper breaths. Roll to one side if you're lying down. And when you're ready, come back to the room. Refreshed. Restored.`,
  steps: [
    { id: "s1", title: "Settle", body: "Lie down. Long exhale. Let your body become heavy.", startTimeSec: 0, endTimeSec: 60 },
    { id: "s2", title: "Release", body: "Rest in the darkness behind your eyelids. Let every muscle release.", startTimeSec: 60, endTimeSec: 180 },
    { id: "s3", title: "Deep Rest", body: "Not sleeping. Just resting. Let thoughts pass like clouds.", startTimeSec: 180, endTimeSec: 480 },
    { id: "s4", title: "Return", body: "Move fingers and toes. Deeper breaths. Come back refreshed.", startTimeSec: 480, endTimeSec: 600 },
  ],
};

const medIFS: MeditationScript = {
  id: "med-006",
  title: "IFS — Meeting a Part of You",
  subtitle: "Internal Family Systems introduction",
  category: "inner-work",
  durationSec: 1200,
  description: "An introduction to IFS — the idea that we contain multiple inner 'parts,' each with its own needs and strategies. This practice guides you to meet one part with curiosity rather than judgement.",
  evidenceSource: "Schwartz IFS model; van der Kolk trauma and parts; Oshenska inner child work",
  tags: ["inner-work", "self-compassion", "parts-work", "emotional-processing"],
  phase: ["menstrual", "luteal"],
  backgroundMusic: "gentle",
  ttsScript: `Find a quiet, private space. This practice asks something of you — gentleness, curiosity, and a willingness to listen inward.

Close your eyes. Take three settling breaths.

Inside you, there are many parts. Not in a broken way — in a human way. There's a part that protects. A part that worries. A part that pushes forward. A part that wants to hide. Each of them developed for a reason. Each was trying to help.

Right now, notice which part is most present. You don't have to search. Just notice what's already here. Maybe it's anxiety. Maybe it's a critical voice. Maybe it's exhaustion. Maybe it's numbness.

Once you've noticed it, turn toward it. Not to fix. Not to argue. Just to acknowledge.

Say silently: "I see you. I know you're there."

Ask it: "What are you feeling?" Listen. Not with your mind, but with your body. Notice where this part lives in your physical self. Your chest? Your throat? Your stomach?

Ask it: "What do you need?" Again, listen. The answer might come as a word, a feeling, an image, or nothing. All responses are valid.

Now offer it compassion. Say: "Thank you for trying to protect me. I'm here now. You don't have to work so hard."

Sit with this. Breathing. Holding this part of yourself the way you would hold a child who's been scared.

You are not your parts. You are the awareness that can hold them all. That awareness is always here. Steady. Kind. Present.

When you're ready, take a deeper breath. Acknowledge this part one more time. And gently open your eyes.`,
  steps: [
    { id: "s1", title: "Settle", body: "Find a quiet space. Three settling breaths.", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "Notice a Part", body: "Which part is most present right now? Anxiety? A critical voice?", startTimeSec: 90, endTimeSec: 300 },
    { id: "s3", title: "Turn Toward It", body: "'I see you. I know you're there.'", startTimeSec: 300, endTimeSec: 540 },
    { id: "s4", title: "Ask and Listen", body: "What are you feeling? What do you need?", startTimeSec: 540, endTimeSec: 780 },
    { id: "s5", title: "Offer Compassion", body: "'Thank you for trying to protect me.'", startTimeSec: 780, endTimeSec: 1020 },
    { id: "s6", title: "Rest in Awareness", body: "You are the awareness that can hold them all.", startTimeSec: 1020, endTimeSec: 1140 },
    { id: "s7", title: "Return", body: "Deeper breath. Acknowledge. Open your eyes.", startTimeSec: 1140, endTimeSec: 1200 },
  ],
};

// ═══════════════════════════════════════════════════════════
// READINGS & REFLECTIONS
// ═══════════════════════════════════════════════════════════

const readMorningStoic: MeditationScript = {
  id: "read-001",
  title: "Morning Stoic Reflection",
  subtitle: "Amor Fati — love of fate",
  category: "reading",
  durationSec: 300,
  description: "A short morning reflection drawing on Stoic philosophy. Begins with a core principle, connects it to daily life, and closes with a single question to carry into the day.",
  evidenceSource: "Stoic philosophy (Marcus Aurelius, Seneca, Epictetus); Holiday (thematic reference)",
  tags: ["morning", "reflection", "philosophy", "intention"],
  phase: ["follicular", "ovulatory"],
  backgroundMusic: "none",
  ttsScript: `Good morning.

The Stoics had a practice they called Amor Fati — love of fate. Not acceptance as resignation, but an active embrace of what is.

Marcus Aurelius wrote that the impediment to action advances action. What stands in the way becomes the way.

Today, before you meet what the day brings, consider: what are you resisting right now? Your phase, your energy, your body's signals?

What if instead of pushing past it, you moved with it? That resistance might be your clearest guide today.

Your body is telling you something. Your energy is telling you something. Your phase is telling you something. What if you listened?

Carry this question with you today: What would it look like to move with — rather than against — what I'm feeling?

That's your practice for today. Not to force. Not to fight. To move with.`,
  steps: [
    { id: "s1", title: "The Principle", body: "Amor Fati — love of fate. An active embrace of what is.", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "The Question", body: "What are you resisting right now?", startTimeSec: 90, endTimeSec: 210 },
    { id: "s3", title: "The Practice", body: "Move with — rather than against — what you're feeling.", startTimeSec: 210, endTimeSec: 300 },
  ],
};

const readRealSelfCare: MeditationScript = {
  id: "read-002",
  title: "What Real Self-Care Actually Is",
  subtitle: "Beyond the bath bombs",
  category: "reading",
  durationSec: 480,
  description: "A Signal essay on the difference between performative self-care and authentic self-care — values clarification, saying no, making hard decisions.",
  evidenceSource: "Lakshmin Real Self-Care framework; Signal philosophy",
  tags: ["self-care", "boundaries", "inner-work", "reflection"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `There's a version of self-care that gets sold to women constantly. It involves products, pampering, and treats. Face masks. Bubble baths. Wine at the end of a long day.

There's nothing wrong with any of those things. But they're not self-care. They're comfort. And comfort is not the same as care.

Real self-care is harder. It's less Instagram-friendly. It looks like setting a boundary with someone you love. It looks like saying no to something everyone expects you to say yes to. It looks like sitting with an uncomfortable emotion instead of numbing it.

Real self-care asks: what do I actually need right now? Not what would feel good for five minutes — but what would genuinely serve me?

Sometimes the answer is rest. Sometimes it's movement. Sometimes it's a difficult conversation. Sometimes it's asking for help.

The question isn't "what can I do to treat myself?" The question is "what does my body, my mind, my nervous system actually need?"

And here's what makes this cycle-relevant: different phases create different needs. Your luteal phase might need boundaries. Your menstrual phase might need permission to do nothing. Your follicular phase might need challenge.

Real self-care is listening to those signals. Not overriding them with someone else's wellness plan.

What does real self-care look like for you today? Sit with that for a moment.`,
  steps: [
    { id: "s1", title: "The Problem", body: "Self-care as sold to women: products and pampering.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "The Truth", body: "Real self-care is harder. Boundaries. Saying no. Sitting with discomfort.", startTimeSec: 120, endTimeSec: 300 },
    { id: "s3", title: "The Cycle Connection", body: "Different phases create different needs.", startTimeSec: 300, endTimeSec: 420 },
    { id: "s4", title: "Your Question", body: "What does real self-care look like for you today?", startTimeSec: 420, endTimeSec: 480 },
  ],
};

const readBodyKeepsScore: MeditationScript = {
  id: "read-003",
  title: "The Body Keeps the Score",
  subtitle: "Why somatic practices work",
  category: "reading",
  durationSec: 600,
  description: "Signal's accessible introduction to the concept that unresolved stress and trauma are held in the body — not just the mind. Explains why somatic practices work.",
  evidenceSource: "van der Kolk somatic healing; Porges Polyvagal Theory",
  tags: ["somatic", "nervous-system", "healing", "inner-work"],
  phase: ["menstrual", "luteal"],
  backgroundMusic: "gentle",
  ttsScript: `Here is something that changes everything once you understand it: your body remembers what your mind forgets.

Every experience you've had — every stress, every joy, every moment of fear or safety — is stored not just in your memory, but in your muscles, your fascia, your nervous system, your breath patterns.

This is why you can feel anxious for no apparent reason. Why certain situations trigger reactions that seem disproportionate. Why you might tense your shoulders without knowing it, or hold your breath when you're concentrating.

Your body is not malfunctioning. It's remembering.

This is the foundation of somatic healing — the understanding that the body and mind are not separate systems. They are one system.

When we practise breathwork, body scans, or movement, we're not just "relaxing." We're giving the body a chance to complete stress cycles that got interrupted. To release tension that's been held — sometimes for years.

The menstrual phase often surfaces emotions and body memories that feel disproportionate. This isn't breakdown. This is the body completing unfinished processing. Your biology is giving you a window to heal — if you'll let it.

You don't need to understand why your body holds what it holds. You just need to give it permission to let go. That's what these practices are for.

Your body has been carrying this so you didn't have to. Now you're here. You're paying attention. That's the beginning.`,
  steps: [
    { id: "s1", title: "The Principle", body: "Your body remembers what your mind forgets.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "The Evidence", body: "Stress, fear, and safety stored in muscles and breath patterns.", startTimeSec: 120, endTimeSec: 300 },
    { id: "s3", title: "How Practices Work", body: "Breathwork and body scans complete interrupted stress cycles.", startTimeSec: 300, endTimeSec: 450 },
    { id: "s4", title: "The Cycle Connection", body: "The menstrual phase surfaces what needs processing.", startTimeSec: 450, endTimeSec: 540 },
    { id: "s5", title: "Permission", body: "Give your body permission to let go.", startTimeSec: 540, endTimeSec: 600 },
  ],
};

const readEveningReview: MeditationScript = {
  id: "read-004",
  title: "Signal Evening Review",
  subtitle: "Close the day with curiosity",
  category: "reading",
  durationSec: 300,
  description: "An evening reflection that invites you to review the day with curiosity rather than judgement — what happened, what you felt, what you'd do differently. Closes with gratitude and release.",
  evidenceSource: "Stoic evening examen (Marcus Aurelius, Seneca); Wiest reflective frameworks",
  tags: ["evening", "reflection", "journaling", "wind-down"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `The day is nearly done. Before you let it go, take a few minutes to look back — not with judgement, but with curiosity.

What happened today? Not the to-do list. The real events. What did you feel? Where did your energy go? What surprised you?

Was there a moment when you felt fully alive? Even briefly? Hold that.

Was there a moment that was hard? A reaction that felt too big, or a situation that drained you? Notice that too. You don't have to fix it. Just see it.

If you could do one thing differently, what would it be? Not as criticism — as learning. Every day teaches you something about yourself. What did today teach?

Now — one thing you're grateful for. It doesn't have to be grand. A cup of tea. A text from a friend. A moment of quiet.

Finally, release the day. Whatever happened, it's done. Whatever you didn't finish can wait. Right now, your only job is to rest.

Let it go. Let yourself be held by the night.`,
  steps: [
    { id: "s1", title: "Review", body: "What happened today? What did you feel?", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "Alive Moment", body: "A moment when you felt fully alive.", startTimeSec: 90, endTimeSec: 150 },
    { id: "s3", title: "Hard Moment", body: "A moment that was hard. See it without fixing.", startTimeSec: 150, endTimeSec: 210 },
    { id: "s4", title: "Gratitude", body: "One thing you're grateful for.", startTimeSec: 210, endTimeSec: 260 },
    { id: "s5", title: "Release", body: "Let the day go. Your only job now is rest.", startTimeSec: 260, endTimeSec: 300 },
  ],
};

const readInnerWork: MeditationScript = {
  id: "read-005",
  title: "The Stories We Tell Ourselves",
  subtitle: "Inner work essay series",
  category: "reading",
  durationSec: 480,
  description: "A Signal essay on the narratives we construct about ourselves and how they shape our reality. Ends with a journaling prompt.",
  evidenceSource: "Wiest psychological frameworks; cognitive behavioural foundations",
  tags: ["inner-work", "psychology", "self-understanding", "reflection"],
  phase: ["menstrual", "luteal"],
  backgroundMusic: "none",
  ttsScript: `You are the author of a story you've been telling for years. It's a story about who you are, what you're capable of, what you deserve, and what's possible.

Most of this story was written before you were old enough to question it. Pieces were written by your parents, your teachers, your earliest experiences. Other people's opinions became your inner voice. Their limitations became your boundaries.

The thing about stories is this: they feel like facts. "I'm not good at this." "I always do that." "People like me don't get to have that." These feel true because you've been repeating them so long. But they're not truth. They're narrative.

And here's what's powerful: you can edit the narrative. Not by pretending the past didn't happen. Not by positive affirmations that feel hollow. But by questioning. By asking: "Is this actually true? Or is this a story I've been telling?"

The menstrual and luteal phases are when these stories surface most clearly. The inner critic gets louder. The self-doubt feels more real. But this isn't your cycle making you weak. It's your cycle giving you access to the material.

Here's your journaling prompt: What story am I telling about myself that might not be true? Write for five minutes. Don't edit. Don't judge. Just let it come.`,
  steps: [
    { id: "s1", title: "The Story", body: "You've been telling a story about who you are for years.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "How It Formed", body: "Written before you could question it — by others' opinions.", startTimeSec: 120, endTimeSec: 240 },
    { id: "s3", title: "Editing the Narrative", body: "Stories feel like facts. But they can be questioned.", startTimeSec: 240, endTimeSec: 360 },
    { id: "s4", title: "Journaling Prompt", body: "What story am I telling that might not be true? Write for 5 min.", startTimeSec: 360, endTimeSec: 480 },
  ],
};

// ═══════════════════════════════════════════════════════════
// INNER WORK SESSIONS
// ═══════════════════════════════════════════════════════════

const innerChild: MeditationScript = {
  id: "inner-001",
  title: "Inner Child Healing — Meeting Younger You",
  subtitle: "A guided journey to meet the younger self",
  category: "inner-work",
  durationSec: 1500,
  description: "A guided journey to meet the younger self — the part that formed strategies and beliefs that may no longer serve you. Trauma-sensitive, slow-paced, deeply somatic.",
  evidenceSource: "Oshenska inner child framework; Schwartz IFS; van der Kolk developmental trauma",
  tags: ["inner-child", "healing", "somatic", "deep-work", "menstrual"],
  phase: ["menstrual"],
  backgroundMusic: "gentle",
  ttsScript: `This practice asks something of you. The menstrual phase — your inner winter — is the most receptive time for this kind of work. You don't have to do it. But if you feel called, this is the time.

Find a private, quiet space. Sit or lie comfortably. You are safe here.

Begin with the Butterfly Hug. Cross your arms over your chest, hands resting on opposite shoulders. Alternate tapping — left, right, left, right — slowly. This grounds you in the present moment.

Continue tapping gently as we begin.

Close your eyes. Imagine a safe place — somewhere real or imagined where you feel completely held. Notice the details. The light. The temperature. The feeling of safety.

From this safe place, allow an image of your younger self to appear. She might be a child. She might be a teenager. Let her come to you at whatever age feels right.

Notice her. How old is she? What is she wearing? What does her face look like?

Move toward her slowly. She might be cautious. That's OK. She's been waiting a long time for someone to come back for her.

Say to her: "I see you. I'm here now. You did the best you could."

Ask her: "What do you need me to know?" Listen. The answer may come as words, feelings, images, or silence.

Whatever she shows you, receive it. You don't have to fix it. You don't have to understand it all right now. Just witness it.

Now offer her what she needed. Maybe it's safety. Maybe it's words she never heard. Maybe it's just someone sitting quietly beside her.

Say: "I won't leave you behind again. I carry you with me now — not as a burden, but as someone I love."

Hold her. In your mind, in your heart. Let the warmth of this connection fill your chest.

Stay here as long as you need.

When you're ready, take a deeper breath. Let the image soften. Return to the room. Open your eyes.

You have just done some of the bravest work there is. Be gentle with yourself for the rest of the day.`,
  steps: [
    { id: "s1", title: "Grounding", body: "Butterfly Hug — cross arms, alternate tapping.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "Safe Place", body: "Imagine a safe place where you feel completely held.", startTimeSec: 120, endTimeSec: 300 },
    { id: "s3", title: "Meet Younger You", body: "Allow an image of your younger self to appear.", startTimeSec: 300, endTimeSec: 540 },
    { id: "s4", title: "Listen", body: "'What do you need me to know?' Receive what she shows you.", startTimeSec: 540, endTimeSec: 900 },
    { id: "s5", title: "Offer What She Needed", body: "Safety, words, quiet presence.", startTimeSec: 900, endTimeSec: 1200 },
    { id: "s6", title: "Hold & Return", body: "'I carry you with me now.' Return gently.", startTimeSec: 1200, endTimeSec: 1500 },
  ],
};

const innerReparenting: MeditationScript = {
  id: "inner-002",
  title: "Reparenting — What You Needed to Hear",
  subtitle: "Offering yourself the words you needed",
  category: "inner-work",
  durationSec: 1200,
  description: "A softer inner child practice — offering the words, safety, and presence to the younger self that she needed but may not have received.",
  evidenceSource: "Oshenska inner child framework; Schwartz IFS; self-compassion research",
  tags: ["inner-child", "self-compassion", "reparenting"],
  phase: ["menstrual", "luteal"],
  backgroundMusic: "gentle",
  ttsScript: `Close your eyes. Let your body settle.

Think about what you needed to hear as a child. Not what you were told — what you needed. The words that would have changed everything.

Maybe it was: "You are enough, exactly as you are."
Maybe it was: "Your feelings matter."
Maybe it was: "You don't have to earn love."
Maybe it was: "It's not your fault."
Maybe it was simply: "I'm here. I'm not going anywhere."

Whatever words come — let them be here.

Now, here is the practice: you are going to say these words to yourself. Not as a performance. Not as a trick. As a genuine act of reparenting — becoming the parent you needed.

Place a hand on your heart. Feel the warmth.

Say the words. Silently or aloud:

"You are enough."
"Your feelings matter."
"You don't have to earn love."
"I'm here. I'm not going anywhere."

Say them again. And again. Let them sink below the surface.

You might feel resistance. You might feel emotion. You might feel nothing. All of those responses are valid.

The reparenting isn't a one-time event. It's a practice. Every time you speak kindly to yourself, every time you honour a boundary, every time you choose rest over pushing — you are reparenting.

You are becoming the safe adult your younger self needed.

Stay here for a moment. Breathing. Holding yourself.

When you're ready, open your eyes. Carry these words with you.`,
  steps: [
    { id: "s1", title: "Reflect", body: "What did you need to hear as a child?", startTimeSec: 0, endTimeSec: 180 },
    { id: "s2", title: "The Words", body: "Let the words come. 'You are enough.' 'Your feelings matter.'", startTimeSec: 180, endTimeSec: 420 },
    { id: "s3", title: "Say Them", body: "Place a hand on your heart. Speak the words to yourself.", startTimeSec: 420, endTimeSec: 720 },
    { id: "s4", title: "Reparenting Practice", body: "Every act of self-kindness is reparenting.", startTimeSec: 720, endTimeSec: 1080 },
    { id: "s5", title: "Return", body: "Open your eyes. Carry these words with you.", startTimeSec: 1080, endTimeSec: 1200 },
  ],
};

const innerSelfCareInquiry: MeditationScript = {
  id: "inner-003",
  title: "Authentic Self-Care Inquiry",
  subtitle: "What do you actually need?",
  category: "inner-work",
  durationSec: 900,
  description: "A guided self-inquiry practice using four principles of real self-care: setting boundaries, identifying values, practising self-compassion, and identifying actual needs.",
  evidenceSource: "Lakshmin Real Self-Care framework; Signal philosophy",
  tags: ["self-care", "values", "boundaries", "inner-work"],
  phase: "all",
  backgroundMusic: "none",
  ttsScript: `Close your eyes. Take a settling breath.

We're going to ask four questions. There are no wrong answers. Just honest ones.

Question one: Boundaries. Is there something in your life right now that you keep saying yes to — but your body says no? What would it feel like to set that boundary? Sit with this for a moment.

Question two: Values. What matters most to you right now? Not what should matter. Not what other people think should matter. What actually, genuinely matters to you in this season of your life?

Question three: Self-compassion. Where are you being hardest on yourself? What would you say to a friend in the same situation? Can you say that to yourself now?

Question four: True needs. Strip away the noise. What do you actually need right now? Not what you want to buy. Not what Instagram tells you. What does your body, your mind, your spirit genuinely need?

Take a moment. Let the answers settle.

Real self-care isn't always comfortable. Sometimes it's the hardest thing you'll do today. But it's the only kind that actually works.

Open your eyes when you're ready. If you want to go deeper, open your journal and write about one of these questions.`,
  steps: [
    { id: "s1", title: "Boundaries", body: "What are you saying yes to when your body says no?", startTimeSec: 0, endTimeSec: 210 },
    { id: "s2", title: "Values", body: "What genuinely matters to you right now?", startTimeSec: 210, endTimeSec: 420 },
    { id: "s3", title: "Self-Compassion", body: "Where are you hardest on yourself?", startTimeSec: 420, endTimeSec: 600 },
    { id: "s4", title: "True Needs", body: "What do you actually need right now?", startTimeSec: 600, endTimeSec: 810 },
    { id: "s5", title: "Integration", body: "Let the answers settle. Open your journal if you want to go deeper.", startTimeSec: 810, endTimeSec: 900 },
  ],
};

// ═══════════════════════════════════════════════════════════
// SLEEP PRACTICES
// ═══════════════════════════════════════════════════════════

const sleepYogaNidra: MeditationScript = {
  id: "sleep-001",
  title: "Signal Yoga Nidra — Deep Rest",
  subtitle: "30-minute guided sleep practice",
  category: "sleep",
  durationSec: 1800,
  description: "Signal's full Yoga Nidra practice. Begins with a Sankalpa (heartfelt intention), then systematic body rotation, breath awareness, and deep rest.",
  evidenceSource: "Richard Miller iRest; traditional Yoga Nidra; Signal adaptation",
  tags: ["sleep", "yoga-nidra", "rest", "evening"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Lie down comfortably. Cover yourself with a blanket if you'd like. Close your eyes.

You are about to enter Yoga Nidra — a state between waking and sleeping where the body rests completely while awareness remains. You don't need to do anything. Just listen.

Begin with your Sankalpa — a heartfelt intention. A short, positive statement in present tense. Something like: "I am at peace." "I trust my body." "I am enough." Hold this intention quietly in your heart.

Now we'll move through the body. Simply notice each part as I name it. No need to move or respond. Just notice.

Right hand. Right thumb. Index finger. Middle finger. Ring finger. Little finger. Palm. Back of the hand. Wrist. Forearm. Elbow. Upper arm. Shoulder. Armpit. Right side of the chest. Right side of the waist. Right hip. Right thigh. Right knee. Right shin. Right ankle. Right foot. Right toes.

Left hand. Left thumb. Index finger. Middle finger. Ring finger. Little finger. Palm. Back of the hand. Wrist. Forearm. Elbow. Upper arm. Shoulder. Armpit. Left side of the chest. Left side of the waist. Left hip. Left thigh. Left knee. Left shin. Left ankle. Left foot. Left toes.

Back of the head. Back of the neck. Upper back. Middle back. Lower back. Buttocks.

Top of the head. Forehead. Right eyebrow. Left eyebrow. The space between. Right eye. Left eye. Right ear. Left ear. Right cheek. Left cheek. Nose. Upper lip. Lower lip. Chin. Throat. Chest. Belly. Pelvis.

The whole body together. One whole. One living, resting whole.

Now become aware of your breath. Don't change it. Just count backwards from 27 on each exhale. 27... 26... 25... If you lose count, start again from 27. There's nowhere to get to.

Now experience pairs of opposites. Heaviness... and lightness. Warmth... and coolness. Tension... and release.

Rest here. In the space between.

Return to your Sankalpa. State it once more, silently. Feel it as already true.

Begin to deepen your breath. Become aware of the room around you. The sounds. The temperature. Move your fingers. Your toes. When you're ready, roll to one side. Rest there for a moment before sitting up.

Welcome back.`,
  steps: [
    { id: "s1", title: "Settle & Sankalpa", body: "Lie down. Set your heartfelt intention.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "Body Rotation", body: "Move attention through every part of the body.", startTimeSec: 120, endTimeSec: 720 },
    { id: "s3", title: "Breath Counting", body: "Count backwards from 27 on each exhale.", startTimeSec: 720, endTimeSec: 1080 },
    { id: "s4", title: "Opposites", body: "Experience heaviness and lightness, warmth and coolness.", startTimeSec: 1080, endTimeSec: 1380 },
    { id: "s5", title: "Deep Rest", body: "Rest in the space between. Pure awareness.", startTimeSec: 1380, endTimeSec: 1620 },
    { id: "s6", title: "Return", body: "Sankalpa once more. Gradually come back.", startTimeSec: 1620, endTimeSec: 1800 },
  ],
};

const sleep478: MeditationScript = {
  id: "sleep-002",
  title: "The 4-7-8 Sleep Protocol",
  subtitle: "Extended sleep preparation",
  category: "sleep",
  durationSec: 900,
  description: "An extended sleep-preparation session built around the 4-7-8 breath. Body relaxation, guided breathing cycles, then release into silence.",
  evidenceSource: "Weil 4-7-8 technique; Signal adaptation with body relaxation",
  tags: ["sleep", "breathwork", "evening", "anxiety"],
  phase: ["luteal", "menstrual"],
  backgroundMusic: "gentle",
  ttsScript: `Lie down. Get comfortable. This practice will prepare your body and mind for sleep.

Begin by softening your body. Let your jaw drop slightly. Let your tongue rest on the roof of your mouth. Let your shoulders melt into the surface beneath you.

Take a moment to notice where you're holding tension. Your forehead? Your stomach? Your hands? Wherever you find it, breathe into that space. Not to force a release — just to acknowledge.

Now we'll begin the 4-7-8 breath. This pattern activates your parasympathetic nervous system — the part that tells your body it's safe to sleep.

Breathe in through your nose for 4 counts. Hold gently for 7 counts. Exhale slowly through your mouth for 8 counts. The exhale is the important part — longer than the inhale signals safety to your nervous system.

In for 4. Hold for 7. Out for 8.

Again. In for 4. Hold for 7. Out for 8.

Continue at your own pace. Don't force anything. Let each breath be softer than the last.

If your mind wanders — to tomorrow's tasks, to today's worries — that's OK. Just return to the count. 4. 7. 8.

Your body is doing what it needs to do. Your heart rate is slowing. Your muscles are releasing. You are safe.

Continue breathing. Let the counting fall away when you're ready. Let the breath become natural. Let yourself drift.

You don't need to finish this practice. If sleep takes you, let it. That's the whole point.

Good night.`,
  steps: [
    { id: "s1", title: "Body Softening", body: "Soften jaw, shoulders, stomach. Notice tension.", startTimeSec: 0, endTimeSec: 180 },
    { id: "s2", title: "4-7-8 Breathing", body: "In for 4, hold for 7, out for 8.", startTimeSec: 180, endTimeSec: 540 },
    { id: "s3", title: "Deepening", body: "Continue at your own pace. Each breath softer.", startTimeSec: 540, endTimeSec: 780 },
    { id: "s4", title: "Release into Sleep", body: "Let the counting fall away. Let sleep take you.", startTimeSec: 780, endTimeSec: 900 },
  ],
};

const sleepLettingGo: MeditationScript = {
  id: "sleep-003",
  title: "Letting Go of the Day",
  subtitle: "Evening release practice",
  category: "sleep",
  durationSec: 720,
  description: "A brief evening practice combining a 3-minute mental review with 9 minutes of progressive physical relaxation. Designed to close the day consciously.",
  evidenceSource: "Stoic evening review; somatic release techniques; Signal original",
  tags: ["sleep", "evening", "release", "reflection"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Lie down. Close your eyes. The day is done.

For the next two minutes, let the day replay. Not in detail — just the highlights. What happened? What did you feel? What are you still carrying?

Notice anything that's unfinished. Anything you're holding. And silently say: "I release this. It can wait until tomorrow."

Now we let the body release what the mind just set down.

Tense your feet — curl your toes tight — hold for 3 seconds — and release. Feel the difference between tension and release.

Tense your calves — hold — and release.

Your thighs — hold — and release.

Your hips and glutes — hold — and release.

Your stomach — pull it in tight — hold — and release. Let your belly be completely soft.

Your hands — make fists — squeeze — and release.

Your arms — biceps tight — hold — and release.

Your shoulders — lift them to your ears — hold — and release. Feel them drop.

Your face — scrunch everything tight — hold — and release.

Now lie completely still. Completely soft. Every muscle released.

Breathe naturally. Each exhale, you sink a little deeper.

The day is done. You did enough. You are enough.

Let sleep come when it's ready.`,
  steps: [
    { id: "s1", title: "Day Review", body: "Let the day replay. What are you still carrying?", startTimeSec: 0, endTimeSec: 180 },
    { id: "s2", title: "Progressive Release", body: "Tense and release each muscle group from feet to face.", startTimeSec: 180, endTimeSec: 540 },
    { id: "s3", title: "Rest", body: "Lie completely soft. You did enough. You are enough.", startTimeSec: 540, endTimeSec: 720 },
  ],
};

// ═══════════════════════════════════════════════════════════
// PHASE PRACTICES
// ═══════════════════════════════════════════════════════════

const phaseMenstrual: MeditationScript = {
  id: "phase-001",
  title: "Menstrual — Into the Dark",
  subtitle: "Restorative practice for inner winter",
  category: "phase-practice",
  durationSec: 1200,
  description: "A deeply restorative practice for days 1–5. Acknowledges the cycle completing, moves through a slow body scan with warmth visualisation.",
  evidenceSource: "Cycle-phase research (Sims); somatic healing; Signal original",
  tags: ["menstrual", "rest", "inner-winter", "yin"],
  phase: ["menstrual"],
  backgroundMusic: "gentle",
  ttsScript: `Welcome to your inner winter.

Your cycle has completed. Something is ending so something can begin. This is not a time for pushing, planning, or producing. This is a time for rest, reflection, and returning to yourself.

Lie down. Let yourself be completely held.

Imagine warmth — like gentle sunlight or warm water — beginning at your feet. Slowly rising through your body. Your ankles. Your calves. Your knees. Each area it touches softens.

The warmth reaches your hips. Your lower belly. This is where the work is happening. Your body is doing something profound right now — releasing, renewing, preparing. Honour it.

The warmth moves through your chest. Your shoulders. Your arms. Your neck. Your face. Your whole body is warm. Soft. Held.

Now ask yourself: what has this cycle taught me? Not just the last few days — the whole cycle. What did I learn about my energy? My emotions? My needs? My boundaries?

Let the answers come without judgement.

What do I want to carry forward into the next cycle? And what am I ready to release?

Hold both of these — what you're keeping and what you're releasing — in your awareness.

Breathe. Rest. You are in the most powerful phase of your cycle. The one that looks like nothing is happening — but everything is happening.

Stay here as long as you need.`,
  steps: [
    { id: "s1", title: "Arrival", body: "Welcome to inner winter. This is a time for rest.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "Warmth Scan", body: "Imagine warmth rising slowly through your body.", startTimeSec: 120, endTimeSec: 540 },
    { id: "s3", title: "Cycle Reflection", body: "What has this cycle taught you?", startTimeSec: 540, endTimeSec: 900 },
    { id: "s4", title: "Release & Keep", body: "What are you carrying forward? What are you releasing?", startTimeSec: 900, endTimeSec: 1200 },
  ],
};

const phaseFollicular: MeditationScript = {
  id: "phase-002",
  title: "Follicular — New Beginning",
  subtitle: "Setting intention for the rising phase",
  category: "phase-practice",
  durationSec: 900,
  description: "An energising practice for the rising phase. Sets intention for the cycle ahead using a visualisation of expanding light.",
  evidenceSource: "Cycle-phase research (Sims); intention-setting practices; Signal original",
  tags: ["follicular", "intention", "energy-rising", "morning"],
  phase: ["follicular"],
  backgroundMusic: "none",
  ttsScript: `Good morning. Your energy is rising.

The follicular phase is your inner spring — oestrogen is climbing, energy is returning, your brain is primed for learning and planning. This is the time to plant seeds.

Sit comfortably. Spine tall. Eyes closed.

Take three energising breaths. Not rushed — purposeful. In through the nose, filling your lungs completely. Out with a strong exhale.

Visualise a small light in your centre — your solar plexus. With each breath, it grows. Expanding outward. Filling your body with warmth and possibility.

Now set your intention. Not a goal — an intention. Something you want to embody this cycle. "I listen to my body." "I create space for what matters." "I trust my own timing." Choose one that resonates.

Say it silently three times. Feel it in your body, not just your mind.

Visualise yourself one month from now, having lived this intention. What does your life look like? How do you feel?

Take that image and compress it into a single feeling. Hold it in your chest.

Open your eyes. You are at the beginning of something. Let yourself begin.`,
  steps: [
    { id: "s1", title: "Rising Energy", body: "Your inner spring. Oestrogen climbing.", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "Energising Breath", body: "Three purposeful breaths. Strong exhales.", startTimeSec: 90, endTimeSec: 210 },
    { id: "s3", title: "Expanding Light", body: "Visualise light growing from your centre.", startTimeSec: 210, endTimeSec: 420 },
    { id: "s4", title: "Set Intention", body: "Choose one intention. Say it three times.", startTimeSec: 420, endTimeSec: 660 },
    { id: "s5", title: "Visualise & Begin", body: "See yourself one month from now. Then begin.", startTimeSec: 660, endTimeSec: 900 },
  ],
};

const phaseOvulatory: MeditationScript = {
  id: "phase-003",
  title: "Ovulatory — Full Presence",
  subtitle: "Peak-energy heart-opening practice",
  category: "phase-practice",
  durationSec: 900,
  description: "A peak-energy practice for the ovulatory window. Opens the heart centre, uses loving-kindness toward self and others.",
  evidenceSource: "TCM Heart meridian; Metta tradition; cycle-phase research (Sims)",
  tags: ["ovulatory", "peak-energy", "heart", "connection"],
  phase: ["ovulatory"],
  backgroundMusic: "none",
  ttsScript: `You are at your peak.

Oestrogen and testosterone are at their highest. Your energy, your confidence, your capacity for connection — all amplified. This is your inner summer.

Sit tall. Open your chest. Draw your shoulders back slightly — not with tension, but with openness.

Bring your attention to the centre of your chest. In TCM, the Heart meridian is most active during ovulation. You are literally more heart-open right now.

Breathe into this space. With each inhale, imagine the chest expanding. With each exhale, softening.

Now direct loving-kindness outward. Think of someone you love. Hold their face. Send them warmth.

Think of someone struggling. A friend, a colleague, a stranger. Send them the same warmth.

Now turn it back to yourself. This is the hardest part for most women. Send yourself the same warmth you just gave so freely to others.

May I be well. May I trust this moment. May I give freely without losing myself.

This phase gives generously. Make sure you're included in that generosity.

Take a deep breath. Feel the fullness of this moment. You are at your peak. Use it wisely. And don't forget to rest tomorrow.`,
  steps: [
    { id: "s1", title: "Peak Energy", body: "Your inner summer. Heart meridian active.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "Heart Opening", body: "Breathe into your chest. Expanding and softening.", startTimeSec: 120, endTimeSec: 300 },
    { id: "s3", title: "Loving-Kindness", body: "Send warmth to a loved one, a stranger, then yourself.", startTimeSec: 300, endTimeSec: 660 },
    { id: "s4", title: "Self-Inclusion", body: "Include yourself in the generosity.", startTimeSec: 660, endTimeSec: 900 },
  ],
};

const phaseLuteal: MeditationScript = {
  id: "phase-004",
  title: "Luteal — Holding Yourself Through It",
  subtitle: "Support for the inner autumn",
  category: "phase-practice",
  durationSec: 1200,
  description: "A supportive practice for the luteal phase. Names what's hard, uses RAIN for whatever emotion is present, and closes with a self-care commitment.",
  evidenceSource: "Brach RAIN; self-compassion (Neff); cycle-phase research (Sims)",
  tags: ["luteal", "emotional-support", "self-compassion", "inner-autumn"],
  phase: ["luteal"],
  backgroundMusic: "gentle",
  ttsScript: `Hello. The luteal phase can be hard. Let's not pretend otherwise.

Progesterone is dominant. Oestrogen is falling. Your energy may be lower. Your emotions may feel closer to the surface. Your tolerance for noise, chaos, and other people's needs may be thinner.

None of this is weakness. This is biochemistry.

Close your eyes. Take a slow breath.

Name what's hard right now. Not what you think should be hard — what actually feels hard. Maybe it's fatigue. Maybe it's irritability. Maybe it's sadness without a clear reason. Maybe it's cramps, bloating, or brain fog.

Say to yourself: "This is hard. And it's OK that it's hard."

Now let's use the RAIN practice briefly. Recognise what's here. Allow it without fighting. Investigate where you feel it in your body. And Nurture — offer yourself compassion.

Place a hand on your heart. Or your belly. Wherever feels right.

Say: "I'm not broken. My body is doing something. I can honour it without understanding every part of it."

Now make one small commitment to yourself for today. Just one. Something realistic. Maybe it's going to bed earlier. Maybe it's saying no to one thing. Maybe it's 10 minutes of quiet.

This phase isn't comfortable. But it's valuable. The inner critic that gets louder right now? She's pointing at what needs attention. Not in a cruel way — in a true way. The luteal phase is your truth-teller.

Listen to her. But be kind to yourself while you do.

Open your eyes when you're ready.`,
  steps: [
    { id: "s1", title: "Acknowledge", body: "The luteal phase can be hard. Name what's hard right now.", startTimeSec: 0, endTimeSec: 180 },
    { id: "s2", title: "RAIN", body: "Recognise. Allow. Investigate. Nurture.", startTimeSec: 180, endTimeSec: 600 },
    { id: "s3", title: "Self-Compassion", body: "'I'm not broken. My body is doing something.'", startTimeSec: 600, endTimeSec: 900 },
    { id: "s4", title: "One Commitment", body: "Choose one small act of self-care for today.", startTimeSec: 900, endTimeSec: 1080 },
    { id: "s5", title: "Truth-Teller", body: "The luteal phase shows what needs attention. Listen kindly.", startTimeSec: 1080, endTimeSec: 1200 },
  ],
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

import {
  ALL_EXERCISES,
  QUICK_PRACTICES,
  GROUNDING_PRACTICES,
  PRESENCE_PRACTICES,
} from "./mindfulness-exercises";

export {
  QUICK_PRACTICES,
  GROUNDING_PRACTICES,
  PRESENCE_PRACTICES,
};

export const MEDITATION_SCRIPTS: MeditationScript[] = [
  medBodyScan,
  medRain,
  medLovingKindness,
  medRelaxationResponse,
  medNSDR,
  medIFS,
];

export const READING_SCRIPTS: MeditationScript[] = [
  readMorningStoic,
  readRealSelfCare,
  readBodyKeepsScore,
  readEveningReview,
  readInnerWork,
];

export const INNER_WORK_SCRIPTS: MeditationScript[] = [
  innerChild,
  innerReparenting,
  innerSelfCareInquiry,
];

export const SLEEP_SCRIPTS: MeditationScript[] = [
  sleepYogaNidra,
  sleep478,
  sleepLettingGo,
];

export const PHASE_SCRIPTS: MeditationScript[] = [
  phaseMenstrual,
  phaseFollicular,
  phaseOvulatory,
  phaseLuteal,
];

export const ALL_MEDITATION_SCRIPTS: MeditationScript[] = [
  ...MEDITATION_SCRIPTS,
  ...READING_SCRIPTS,
  ...INNER_WORK_SCRIPTS,
  ...SLEEP_SCRIPTS,
  ...PHASE_SCRIPTS,
  ...ALL_EXERCISES,
];

export function getMeditationById(id: string): MeditationScript | undefined {
  return ALL_MEDITATION_SCRIPTS.find((s) => s.id === id);
}

export function getMeditationsForPhase(phase: string): MeditationScript[] {
  return ALL_MEDITATION_SCRIPTS.filter(
    (s) => s.phase === "all" || (Array.isArray(s.phase) && s.phase.includes(phase as CyclePhase))
  );
}

export function formatMeditationDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}
