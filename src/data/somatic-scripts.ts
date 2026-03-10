// ── Somatic Practice Scripts ────────────────────────────────
// Full narration scripts for ElevenLabs TTS and on-screen guidance.
// Each script is written in a trauma-sensitive, warm, grounding tone.

export interface SomaticPracticeScript {
  id: string;
  title: string;
  subtitle: string;
  durationSec: number;
  description: string;
  narration: string;
  ttsScript: string;
  steps: {
    id: string;
    title: string;
    body: string;
    startTimeSec?: number;
    endTimeSec?: number;
  }[];
}

// ── Butterfly Hug ───────────────────────────────────────────

const butterflyHug: SomaticPracticeScript = {
  id: "butterfly-hug",
  title: "Butterfly Hug",
  subtitle: "Bilateral self-soothing",
  durationSec: 300,
  description:
    "A gentle bilateral stimulation practice used in trauma therapy to calm the nervous system. The alternating tapping activates both hemispheres of the brain, helping to process emotion and restore a sense of safety.",
  narration: `Find a comfortable seated position. Let your body settle here.

Allow your shoulders to soften. Let your hands rest in your lap for a moment.

Take a slow breath in. And a long, easy breath out.

When you're ready, cross your arms over your chest. Rest your hands gently on your opposite shoulders. Your arms are like wings folded inward.

You can close your eyes. Or soften your gaze downward toward the floor.

Now begin gently tapping. Left. Right. Left. Right. Like butterfly wings. Slow and steady.

There is no rush here. Let each tap be soft and deliberate.

As you continue tapping, let your breath stay slow and natural. You do not need to control it. Simply let it flow.

Notice what arises in your body. Sensations. Images. Feelings. You do not need to understand them. Just notice. Observe without judgement.

If a strong emotion surfaces, slow the tapping down. You are in control. You can pause at any time. You are safe right here.

Continue tapping gently. Left. Right. Left. Right.

Let the rhythm soothe you. Like a gentle rocking. Like the steady beat of your own heart.

If your mind begins to wander, that is okay. Simply return to the feeling of your hands on your shoulders. Return to the rhythm.

Continue for a few more moments. There is no destination. Just presence.

Now, slowly begin to still your hands. Let the tapping come to a natural stop.

Rest both hands over your heart. Feel it beating beneath your palms. Steady. Faithful. Yours.

Take one more slow breath in. And let it go.

You are held. You are here. You are safe.

When you are ready, gently open your eyes.`,
  ttsScript: `Find a comfortable seated position. Let your body settle here.

Allow your shoulders to soften. Let your hands rest in your lap for a moment.

Take a slow breath in. And a long, easy breath out.

When you're ready, cross your arms over your chest. Rest your hands gently on your opposite shoulders. Your arms are like wings folded inward.

You can close your eyes. Or soften your gaze downward toward the floor.

Now begin gently tapping. Left. Right. Left. Right. Like butterfly wings. Slow and steady.

There is no rush here. Let each tap be soft and deliberate.

As you continue tapping, let your breath stay slow and natural. You do not need to control it. Simply let it flow.

Notice what arises in your body. Sensations. Images. Feelings. You do not need to understand them. Just notice. Observe without judgement.

If a strong emotion surfaces, slow the tapping down. You are in control. You can pause at any time. You are safe right here.

Continue tapping gently. Left. Right. Left. Right.

Let the rhythm soothe you. Like a gentle rocking. Like the steady beat of your own heart.

If your mind begins to wander, that is okay. Simply return to the feeling of your hands on your shoulders. Return to the rhythm.

Continue for a few more moments. There is no destination. Just presence.

Now, slowly begin to still your hands. Let the tapping come to a natural stop.

Rest both hands over your heart. Feel it beating beneath your palms. Steady. Faithful. Yours.

Take one more slow breath in. And let it go.

You are held. You are here. You are safe.

When you are ready, gently open your eyes.`,
  steps: [
    {
      id: "1",
      title: "Settle",
      body: "Find a comfortable seated position. Let your body settle here. Allow your shoulders to soften.",
      startTimeSec: 0,
      endTimeSec: 30,
    },
    {
      id: "2",
      title: "Breathe",
      body: "Take a slow breath in. And a long, easy breath out.",
      startTimeSec: 30,
      endTimeSec: 50,
    },
    {
      id: "3",
      title: "Cross your arms",
      body: "Cross your arms over your chest. Rest your hands gently on your opposite shoulders. Your arms are like wings folded inward.",
      startTimeSec: 50,
      endTimeSec: 75,
    },
    {
      id: "4",
      title: "Soften your gaze",
      body: "Close your eyes, or soften your gaze downward toward the floor.",
      startTimeSec: 75,
      endTimeSec: 90,
    },
    {
      id: "5",
      title: "Begin tapping",
      body: "Gently tap left, right, left, right. Like butterfly wings. Slow and steady. There is no rush.",
      startTimeSec: 90,
      endTimeSec: 130,
    },
    {
      id: "6",
      title: "Breathe naturally",
      body: "Let your breath stay slow and natural. You do not need to control it. Simply let it flow.",
      startTimeSec: 130,
      endTimeSec: 155,
    },
    {
      id: "7",
      title: "Notice",
      body: "Notice what arises. Sensations. Images. Feelings. Observe without judgement. You are safe right here.",
      startTimeSec: 155,
      endTimeSec: 195,
    },
    {
      id: "8",
      title: "Continue",
      body: "Continue tapping gently. Let the rhythm soothe you. Like the steady beat of your own heart.",
      startTimeSec: 195,
      endTimeSec: 240,
    },
    {
      id: "9",
      title: "Slow down",
      body: "Continue for a few more moments. There is no destination. Just presence.",
      startTimeSec: 240,
      endTimeSec: 265,
    },
    {
      id: "10",
      title: "Rest",
      body: "Rest both hands over your heart. Feel it beating. Steady. Faithful. Yours. You are held. You are here. You are safe.",
      startTimeSec: 265,
      endTimeSec: 300,
    },
  ],
};

// ── 5-4-3-2-1 Grounding ────────────────────────────────────

const grounding54321: SomaticPracticeScript = {
  id: "grounding-54321",
  title: "5-4-3-2-1 Grounding",
  subtitle: "Sensory anchoring",
  durationSec: 300,
  description:
    "A sensory-based grounding technique that gently anchors your awareness in the present moment by engaging all five senses. It interrupts anxiety spirals and brings you back to the here and now.",
  narration: `Find a comfortable place to sit or stand. Let your feet connect with the ground beneath you.

Take a slow, deep breath in through your nose. And a long, gentle exhale through your mouth.

Let your shoulders drop. Let your jaw soften. You are arriving here. Right now.

We are going to move through your five senses, one at a time. There is no right way to do this. Just notice.

Begin with sight. Look around you and notice five things you can see. Name them silently to yourself, one by one. A colour. A shape. A shadow. A texture. Something small you might normally overlook.

Take your time.

Now, notice four things you can touch. Feel the fabric beneath your hands. The temperature of the air on your skin. The weight of your body in the chair. The ground beneath your feet. Let each sensation anchor you a little deeper.

Now, listen. Notice three things you can hear. Perhaps a distant sound. Something close. The hum of a room. The rhythm of your own breath. Let the sounds wash over you without needing to name them.

Now, two things you can smell. Perhaps something faint. Something familiar. If nothing is present, bring to mind a scent you love. Freshly cut grass. Warm bread. Rain on pavement.

And finally, one thing you can taste. Perhaps just the inside of your mouth. Perhaps a lingering flavour from your last sip of water or tea. Just notice.

Now, take a slow breath in. And let it go.

Feel the weight of your body. The ground beneath you. The air around you. You are here. You are present. You are safe.

When you are ready, gently open your eyes.`,
  ttsScript: `Find a comfortable place to sit or stand. Let your feet connect with the ground beneath you.

Take a slow, deep breath in through your nose. And a long, gentle exhale through your mouth.

Let your shoulders drop. Let your jaw soften. You are arriving here. Right now.

We are going to move through your five senses, one at a time. There is no right way to do this. Just notice.

Begin with sight. Look around you and notice five things you can see. Name them silently to yourself, one by one. A colour. A shape. A shadow. A texture. Something small you might normally overlook.

Take your time.

Now, notice four things you can touch. Feel the fabric beneath your hands. The temperature of the air on your skin. The weight of your body in the chair. The ground beneath your feet. Let each sensation anchor you a little deeper.

Now, listen. Notice three things you can hear. Perhaps a distant sound. Something close. The hum of a room. The rhythm of your own breath. Let the sounds wash over you without needing to name them.

Now, two things you can smell. Perhaps something faint. Something familiar. If nothing is present, bring to mind a scent you love. Freshly cut grass. Warm bread. Rain on pavement.

And finally, one thing you can taste. Perhaps just the inside of your mouth. Perhaps a lingering flavour from your last sip of water or tea. Just notice.

Now, take a slow breath in. And let it go.

Feel the weight of your body. The ground beneath you. The air around you. You are here. You are present. You are safe.

When you are ready, gently open your eyes.`,
  steps: [
    {
      id: "1",
      title: "Arrive",
      body: "Find a comfortable place to sit or stand. Let your feet connect with the ground. Take a slow breath and let your shoulders drop.",
      startTimeSec: 0,
      endTimeSec: 35,
    },
    {
      id: "2",
      title: "5 things you see",
      body: "Look around and notice five things you can see. A colour. A shape. A shadow. Something small you might normally overlook.",
      startTimeSec: 35,
      endTimeSec: 80,
    },
    {
      id: "3",
      title: "4 things you touch",
      body: "Notice four things you can touch. The fabric beneath your hands. The temperature of the air. The weight of your body. The ground beneath your feet.",
      startTimeSec: 80,
      endTimeSec: 130,
    },
    {
      id: "4",
      title: "3 things you hear",
      body: "Listen for three things you can hear. A distant sound. Something close. The rhythm of your own breath.",
      startTimeSec: 130,
      endTimeSec: 180,
    },
    {
      id: "5",
      title: "2 things you smell",
      body: "Notice two things you can smell. If nothing is present, bring to mind a scent you love.",
      startTimeSec: 180,
      endTimeSec: 225,
    },
    {
      id: "6",
      title: "1 thing you taste",
      body: "Notice one thing you can taste. Perhaps just the inside of your mouth. Just notice.",
      startTimeSec: 225,
      endTimeSec: 260,
    },
    {
      id: "7",
      title: "Return",
      body: "Feel the weight of your body. The ground beneath you. The air around you. You are here. You are present. You are safe.",
      startTimeSec: 260,
      endTimeSec: 300,
    },
  ],
};

// ── Somatic Orienting ───────────────────────────────────────

const somaticOrienting: SomaticPracticeScript = {
  id: "somatic-orienting",
  title: "Somatic Orienting",
  subtitle: "Vagal safety signalling",
  durationSec: 300,
  description:
    "A polyvagal-informed practice that activates your ventral vagal system by slowly orienting your gaze around your environment. It signals safety to the nervous system and gently brings you out of freeze or shutdown states.",
  narration: `Find a place to sit or stand where you feel relatively comfortable. Let your body land here.

Take a moment to notice the weight of your body. The contact between you and whatever is supporting you right now. Chair. Floor. Ground.

Take a slow breath in. And a long, easy exhale.

Now, like a curious animal scanning a new environment, begin to slowly look around the space you are in.

Let your gaze move gently. Without urgency. Without agenda. Simply notice.

Let your head and neck follow your eyes naturally. There is no need to hold anything still.

Look left. Look right. Look up. Look down.

Move slowly. As if you are discovering this room for the very first time.

Notice anything that catches your eye. A colour. A texture. A source of light. Something beautiful. Something ordinary.

If your gaze lands somewhere that feels pleasant or neutral, rest there for a moment. Let your eyes settle. Notice what happens in your body when you do.

Perhaps a softening. A slight drop in the shoulders. A deeper breath. These are signs of your nervous system recalibrating. You are safe.

Continue looking around at your own pace. There is nothing to achieve here. You are simply orienting. Telling your body where you are. And that you are okay.

Now, let your gaze come to rest somewhere soft. A blank wall. Your hands. The floor.

Feel your feet on the ground. The weight of gravity holding you here.

Take one more slow breath in. And let it go.

You are here. You are oriented. You are safe.

When you are ready, gently return.`,
  ttsScript: `Find a place to sit or stand where you feel relatively comfortable. Let your body land here.

Take a moment to notice the weight of your body. The contact between you and whatever is supporting you right now. Chair. Floor. Ground.

Take a slow breath in. And a long, easy exhale.

Now, like a curious animal scanning a new environment, begin to slowly look around the space you are in.

Let your gaze move gently. Without urgency. Without agenda. Simply notice.

Let your head and neck follow your eyes naturally. There is no need to hold anything still.

Look left. Look right. Look up. Look down.

Move slowly. As if you are discovering this room for the very first time.

Notice anything that catches your eye. A colour. A texture. A source of light. Something beautiful. Something ordinary.

If your gaze lands somewhere that feels pleasant or neutral, rest there for a moment. Let your eyes settle. Notice what happens in your body when you do.

Perhaps a softening. A slight drop in the shoulders. A deeper breath. These are signs of your nervous system recalibrating. You are safe.

Continue looking around at your own pace. There is nothing to achieve here. You are simply orienting. Telling your body where you are. And that you are okay.

Now, let your gaze come to rest somewhere soft. A blank wall. Your hands. The floor.

Feel your feet on the ground. The weight of gravity holding you here.

Take one more slow breath in. And let it go.

You are here. You are oriented. You are safe.

When you are ready, gently return.`,
  steps: [
    {
      id: "1",
      title: "Arrive",
      body: "Find a place to sit or stand. Let your body land here. Notice the weight of your body and the contact with whatever supports you.",
      startTimeSec: 0,
      endTimeSec: 35,
    },
    {
      id: "2",
      title: "Breathe",
      body: "Take a slow breath in. And a long, easy exhale.",
      startTimeSec: 35,
      endTimeSec: 55,
    },
    {
      id: "3",
      title: "Look around",
      body: "Like a curious animal, slowly begin to look around your space. Let your gaze move gently. Without urgency. Without agenda.",
      startTimeSec: 55,
      endTimeSec: 95,
    },
    {
      id: "4",
      title: "Follow naturally",
      body: "Let your head and neck follow your eyes naturally. Look left. Right. Up. Down. As if discovering this room for the first time.",
      startTimeSec: 95,
      endTimeSec: 140,
    },
    {
      id: "5",
      title: "Find something pleasant",
      body: "Notice anything that catches your eye. If your gaze lands somewhere pleasant, rest there. Notice what happens in your body.",
      startTimeSec: 140,
      endTimeSec: 190,
    },
    {
      id: "6",
      title: "Continue orienting",
      body: "Continue looking around at your own pace. There is nothing to achieve. You are simply telling your body where you are.",
      startTimeSec: 190,
      endTimeSec: 240,
    },
    {
      id: "7",
      title: "Rest your gaze",
      body: "Let your gaze come to rest somewhere soft. A blank wall. Your hands. The floor.",
      startTimeSec: 240,
      endTimeSec: 265,
    },
    {
      id: "8",
      title: "Ground",
      body: "Feel your feet on the ground. The weight of gravity holding you. You are here. You are oriented. You are safe.",
      startTimeSec: 265,
      endTimeSec: 300,
    },
  ],
};

// ── Havening Touch ──────────────────────────────────────────

const haveningTouch: SomaticPracticeScript = {
  id: "havening-touch",
  title: "Havening Touch",
  subtitle: "Stress depotentiation",
  durationSec: 480,
  description:
    "Developed by Dr Ronald Ruden, Havening uses gentle self-touch to produce delta waves in the brain, depotentiating the emotional charge of stressful memories. It is deeply calming and accessible to anyone.",
  narration: `Find a comfortable seated position. Allow your body to settle. Let your hands rest in your lap.

Take a slow breath in. And a gentle exhale. Let your body soften with each breath out.

We are going to use a technique called Havening. It involves gentle, rhythmic self-touch to calm your nervous system. You do not need to revisit any difficult memories deeply. This is a gentle practice.

Begin by bringing to mind something mildly stressful. It might be a worry. A tension. A frustration from your day. Nothing overwhelming. Save anything deeply painful for a safe therapeutic space.

Now, notice where you feel that stress in your body. Perhaps a tightness in your chest. A knot in your stomach. A tension in your jaw. Just notice.

On a scale of zero to ten, where ten is the most distressed and zero is completely calm, silently rate how you feel right now. Hold that number lightly.

Now, begin the first Havening touch. Place your hands on your upper arms and slowly stroke downward from your shoulders to your elbows. Again and again. Like you are soothing yourself. Gently. Rhythmically.

Continue stroking your arms. Slow. Steady. Let each stroke feel like a wave of calm washing through you.

Keep going. You might notice the stress beginning to soften. Or you might not. Both are okay.

Now, bring your palms together. Begin to slowly rub your palms against each other. As if gently washing your hands. Soft. Warm. Steady.

Continue this movement. Let your eyes close or soften. Let your breathing find its own rhythm.

Now, bring your fingertips to your face. Place them gently just below your eyes, on your cheekbones. Slowly stroke outward toward your temples. Again and again. Like wiping away tension. Like smoothing out worry.

Continue this gentle stroking. Your touch is telling your brain that you are safe. That there is no threat here. That you can let go.

While you continue, you can silently count to twenty. Or hum a simple melody. This engages a different part of your brain and helps the process work more deeply. One. Two. Three. Count at your own pace.

Now, let your hands come to rest. In your lap. Or over your heart.

Take a slow breath in. And a long exhale.

Check in with yourself. Where is your number now on that zero to ten scale? Has it shifted? Even slightly?

If it has reduced, that is your nervous system recalibrating. If it has not, that is okay too. Sometimes the body needs more time. You can repeat this practice whenever you need it.

You are safe. You are held. You did something brave and gentle for yourself today.

When you are ready, gently open your eyes.`,
  ttsScript: `Find a comfortable seated position. Allow your body to settle. Let your hands rest in your lap.

Take a slow breath in. And a gentle exhale. Let your body soften with each breath out.

We are going to use a technique called Havening. It involves gentle, rhythmic self-touch to calm your nervous system. You do not need to revisit any difficult memories deeply. This is a gentle practice.

Begin by bringing to mind something mildly stressful. It might be a worry. A tension. A frustration from your day. Nothing overwhelming. Save anything deeply painful for a safe therapeutic space.

Now, notice where you feel that stress in your body. Perhaps a tightness in your chest. A knot in your stomach. A tension in your jaw. Just notice.

On a scale of zero to ten, where ten is the most distressed and zero is completely calm, silently rate how you feel right now. Hold that number lightly.

Now, begin the first Havening touch. Place your hands on your upper arms and slowly stroke downward from your shoulders to your elbows. Again and again. Like you are soothing yourself. Gently. Rhythmically.

Continue stroking your arms. Slow. Steady. Let each stroke feel like a wave of calm washing through you.

Keep going. You might notice the stress beginning to soften. Or you might not. Both are okay.

Now, bring your palms together. Begin to slowly rub your palms against each other. As if gently washing your hands. Soft. Warm. Steady.

Continue this movement. Let your eyes close or soften. Let your breathing find its own rhythm.

Now, bring your fingertips to your face. Place them gently just below your eyes, on your cheekbones. Slowly stroke outward toward your temples. Again and again. Like wiping away tension. Like smoothing out worry.

Continue this gentle stroking. Your touch is telling your brain that you are safe. That there is no threat here. That you can let go.

While you continue, you can silently count to twenty. Or hum a simple melody. This engages a different part of your brain and helps the process work more deeply. One. Two. Three. Count at your own pace.

Now, let your hands come to rest. In your lap. Or over your heart.

Take a slow breath in. And a long exhale.

Check in with yourself. Where is your number now on that zero to ten scale? Has it shifted? Even slightly?

If it has reduced, that is your nervous system recalibrating. If it has not, that is okay too. Sometimes the body needs more time. You can repeat this practice whenever you need it.

You are safe. You are held. You did something brave and gentle for yourself today.

When you are ready, gently open your eyes.`,
  steps: [
    {
      id: "1",
      title: "Settle",
      body: "Find a comfortable seated position. Allow your body to settle. Take a slow breath in and a gentle exhale.",
      startTimeSec: 0,
      endTimeSec: 40,
    },
    {
      id: "2",
      title: "Choose a focus",
      body: "Bring to mind something mildly stressful. A worry. A tension. Nothing overwhelming. Save deeply painful memories for a therapeutic space.",
      startTimeSec: 40,
      endTimeSec: 80,
    },
    {
      id: "3",
      title: "Rate your distress",
      body: "Notice where you feel that stress in your body. On a scale of zero to ten, rate how you feel right now. Hold that number lightly.",
      startTimeSec: 80,
      endTimeSec: 115,
    },
    {
      id: "4",
      title: "Stroke your arms",
      body: "Place your hands on your upper arms. Slowly stroke from shoulders to elbows. Again and again. Like soothing yourself. Gently. Rhythmically.",
      startTimeSec: 115,
      endTimeSec: 190,
    },
    {
      id: "5",
      title: "Palms together",
      body: "Bring your palms together. Slowly rub them against each other. As if gently washing your hands. Soft. Warm. Steady.",
      startTimeSec: 190,
      endTimeSec: 260,
    },
    {
      id: "6",
      title: "Face stroking",
      body: "Place fingertips gently below your eyes, on your cheekbones. Slowly stroke outward toward your temples. Like wiping away tension.",
      startTimeSec: 260,
      endTimeSec: 340,
    },
    {
      id: "7",
      title: "Count or hum",
      body: "While continuing, silently count to twenty or hum a simple melody. This engages a different part of your brain and deepens the process.",
      startTimeSec: 340,
      endTimeSec: 410,
    },
    {
      id: "8",
      title: "Check in",
      body: "Let your hands rest. Where is your number now? Has it shifted? Your nervous system is recalibrating. You are safe. You are held.",
      startTimeSec: 410,
      endTimeSec: 480,
    },
  ],
};

// ── Neurogenic Tremoring ────────────────────────────────────

const neurogenicTremoring: SomaticPracticeScript = {
  id: "neurogenic-tremoring",
  title: "Neurogenic Tremoring",
  subtitle: "Tension and trauma release",
  durationSec: 900,
  description:
    "Based on TRE (Tension and Trauma Releasing Exercises) by Dr David Berceli. This practice uses gentle muscle fatigue to activate the body's natural tremoring mechanism, releasing deep-held tension from the psoas and core muscles.",
  narration: `Find a quiet space where you can lie down comfortably. You will need a mat or soft surface. Take a moment to settle in.

Take three slow breaths. Let each exhale be longer than the inhale. Allow your body to begin arriving on the floor.

This practice activates your body's natural tremoring response. Tremoring is how mammals release stress and tension from the body. It is completely natural. It is safe. And it can feel unusual the first time. If at any point you feel overwhelmed, simply straighten your legs and the tremoring will stop.

We will begin with some gentle exercises to create mild fatigue in your legs and core. This fatigue invites the tremoring to begin.

Stand up if you are able. Place your feet hip-width apart. Slowly rise up onto your toes. Hold for a moment. And lower back down. Rise up again. And lower. Continue this for about a minute. Let your calves begin to work. You may feel a gentle shaking. That is good.

Now, stand on one leg. Bend the other knee slightly and hold it in front of you. Feel the standing leg begin to work. Switch legs after thirty seconds. Notice any trembling or fatigue. Welcome it.

Now, come into a wide squat. Feet wider than your hips. Toes turned slightly out. Bend your knees and lower yourself halfway down. Hold here. Let your thighs work. Breathe. Stay for about a minute or as long as feels okay. You will feel fatigue building. This is inviting the tremor response.

Slowly stand back up. Shake out your legs gently.

Now, lie down on your back. Bend your knees and place your feet flat on the floor, about hip-width apart.

Bring the soles of your feet together so your knees fall open to the sides like a butterfly. Let your arms rest by your sides with your palms facing up.

Now, very slowly, begin to bring your knees together. Move them just an inch or two toward each other. And pause.

You may begin to notice a trembling or vibration in your legs. This is the neurogenic tremor. It is your body releasing stored tension. Let it happen. Do not try to control it or make it stop.

The tremoring may feel like a gentle shaking. A vibration. A buzzing. It may travel up through your hips, your belly, your chest. Let it move wherever it needs to go.

If the shaking feels too strong, simply move your feet further apart. If you want more, bring your knees a little closer together. You are in control.

Continue lying here and allowing the tremors for several minutes. There is nothing to do. Nothing to achieve. Just let your body do what it knows how to do.

Breathe naturally. Your body is wise. It knows how to release what it has been holding.

If emotions arise, let them. A sigh. A tear. A yawn. These are all signs of release. You are safe.

Continue for a few more minutes. There is no rush.

When you feel ready to finish, slowly straighten your legs out along the floor. The tremoring will gradually stop.

Lie still for a moment. Feel the ground beneath you. The heaviness of your body. The stillness.

Take a slow breath in. And a long exhale.

Notice how you feel now compared to when you began. Perhaps lighter. Perhaps calmer. Perhaps simply different. All of it is valid.

Roll gently to one side. Rest there for a moment. And when you are ready, slowly sit up.

You have just given your body permission to release. That is a powerful and brave act. Be gentle with yourself for the rest of the day.`,
  ttsScript: `Find a quiet space where you can lie down comfortably. You will need a mat or soft surface. Take a moment to settle in.

Take three slow breaths. Let each exhale be longer than the inhale. Allow your body to begin arriving on the floor.

This practice activates your body's natural tremoring response. Tremoring is how mammals release stress and tension from the body. It is completely natural. It is safe. And it can feel unusual the first time. If at any point you feel overwhelmed, simply straighten your legs and the tremoring will stop.

We will begin with some gentle exercises to create mild fatigue in your legs and core. This fatigue invites the tremoring to begin.

Stand up if you are able. Place your feet hip-width apart. Slowly rise up onto your toes. Hold for a moment. And lower back down. Rise up again. And lower. Continue this for about a minute. Let your calves begin to work. You may feel a gentle shaking. That is good.

Now, stand on one leg. Bend the other knee slightly and hold it in front of you. Feel the standing leg begin to work. Switch legs after thirty seconds. Notice any trembling or fatigue. Welcome it.

Now, come into a wide squat. Feet wider than your hips. Toes turned slightly out. Bend your knees and lower yourself halfway down. Hold here. Let your thighs work. Breathe. Stay for about a minute or as long as feels okay. You will feel fatigue building. This is inviting the tremor response.

Slowly stand back up. Shake out your legs gently.

Now, lie down on your back. Bend your knees and place your feet flat on the floor, about hip-width apart.

Bring the soles of your feet together so your knees fall open to the sides like a butterfly. Let your arms rest by your sides with your palms facing up.

Now, very slowly, begin to bring your knees together. Move them just an inch or two toward each other. And pause.

You may begin to notice a trembling or vibration in your legs. This is the neurogenic tremor. It is your body releasing stored tension. Let it happen. Do not try to control it or make it stop.

The tremoring may feel like a gentle shaking. A vibration. A buzzing. It may travel up through your hips, your belly, your chest. Let it move wherever it needs to go.

If the shaking feels too strong, simply move your feet further apart. If you want more, bring your knees a little closer together. You are in control.

Continue lying here and allowing the tremors for several minutes. There is nothing to do. Nothing to achieve. Just let your body do what it knows how to do.

Breathe naturally. Your body is wise. It knows how to release what it has been holding.

If emotions arise, let them. A sigh. A tear. A yawn. These are all signs of release. You are safe.

Continue for a few more minutes. There is no rush.

When you feel ready to finish, slowly straighten your legs out along the floor. The tremoring will gradually stop.

Lie still for a moment. Feel the ground beneath you. The heaviness of your body. The stillness.

Take a slow breath in. And a long exhale.

Notice how you feel now compared to when you began. Perhaps lighter. Perhaps calmer. Perhaps simply different. All of it is valid.

Roll gently to one side. Rest there for a moment. And when you are ready, slowly sit up.

You have just given your body permission to release. That is a powerful and brave act. Be gentle with yourself for the rest of the day.`,
  steps: [
    {
      id: "1",
      title: "Settle",
      body: "Find a quiet space to lie down. Take three slow breaths. Let each exhale be longer than the inhale.",
      startTimeSec: 0,
      endTimeSec: 45,
    },
    {
      id: "2",
      title: "Introduction",
      body: "This practice activates your body's natural tremoring response. It is safe. If overwhelmed at any point, simply straighten your legs.",
      startTimeSec: 45,
      endTimeSec: 90,
    },
    {
      id: "3",
      title: "Calf raises",
      body: "Stand with feet hip-width apart. Rise onto your toes and lower back down. Repeat for about a minute. Let your calves work.",
      startTimeSec: 90,
      endTimeSec: 170,
    },
    {
      id: "4",
      title: "Single leg balance",
      body: "Stand on one leg. Hold the other knee slightly lifted. Switch legs after thirty seconds. Welcome any trembling.",
      startTimeSec: 170,
      endTimeSec: 250,
    },
    {
      id: "5",
      title: "Wide squat hold",
      body: "Come into a wide squat. Hold halfway down. Let your thighs work. Breathe. Stay for about a minute. This invites the tremor response.",
      startTimeSec: 250,
      endTimeSec: 340,
    },
    {
      id: "6",
      title: "Lie down",
      body: "Lie on your back. Bend your knees, feet flat on the floor. Bring the soles of your feet together so your knees fall open.",
      startTimeSec: 340,
      endTimeSec: 400,
    },
    {
      id: "7",
      title: "Invite tremoring",
      body: "Slowly bring your knees an inch toward each other. Pause. Notice any trembling or vibration. Let it happen. Do not control it.",
      startTimeSec: 400,
      endTimeSec: 480,
    },
    {
      id: "8",
      title: "Allow the release",
      body: "Let the tremors move through your body. Hips. Belly. Chest. If shaking feels too strong, move feet further apart. You are in control.",
      startTimeSec: 480,
      endTimeSec: 600,
    },
    {
      id: "9",
      title: "Rest in tremoring",
      body: "Continue allowing the tremors. There is nothing to achieve. If emotions arise, let them. A sigh. A tear. These are signs of release.",
      startTimeSec: 600,
      endTimeSec: 760,
    },
    {
      id: "10",
      title: "Close",
      body: "Slowly straighten your legs. The tremoring will stop. Lie still. Feel the ground beneath you. You have given your body permission to release.",
      startTimeSec: 760,
      endTimeSec: 900,
    },
  ],
};

// ── Somatic Body Scan ───────────────────────────────────────

const somaticBodyScan: SomaticPracticeScript = {
  id: "body-scan",
  title: "Somatic Body Scan",
  subtitle: "Interoceptive awareness",
  durationSec: 900,
  description:
    "A slow, thorough journey through the body that builds interoceptive awareness — your ability to sense and trust your body's internal signals. This practice strengthens the connection between mind and body, helping you recognise what you feel and what you need.",
  narration: `Find a comfortable place to lie down. A bed. A mat. The floor. Somewhere your body can be fully supported.

Let your legs stretch out long. Let your arms rest by your sides, palms facing up. Let your body be heavy.

Close your eyes. Or soften your gaze toward the ceiling.

Take three slow, deep breaths. With each exhale, let your body sink a little deeper into the surface beneath you.

There is nothing to fix here. Nothing to change. This is simply a practice of noticing. Of listening to your body with kindness and curiosity.

We will move slowly from the top of your head down to the tips of your toes. At each place, simply notice what is there. Sensation. Temperature. Tension. Ease. Numbness. Tingling. Whatever you find is valid.

Begin at the crown of your head. Bring your awareness to the very top of your skull. What do you notice there? Perhaps warmth. Perhaps nothing at all. Just notice.

Now move to your forehead. Your temples. The space between your eyebrows. Is there tightness here? Softness? Let your forehead smooth out. Let it be easy.

Move to your eyes. Your cheeks. Your jaw. The jaw is one of the most common places we hold stress. If your teeth are clenched, let them part slightly. Let your tongue rest on the roof of your mouth. Let your jaw be heavy.

Now, your throat. The front of your neck. The back of your neck. Notice any tension. Any tightness. You do not need to fix it. Simply acknowledging it is enough.

Move down into your shoulders. These faithful carriers. Let them drop. Let them release whatever they have been holding for you today.

Your upper arms. Your elbows. Your forearms. Your wrists. Your hands. Your fingers. Notice the temperature. The weight. The life in your hands.

Now, bring your awareness to your chest. Your ribcage. The rise and fall of your breath. Notice the rhythm. Is it fast? Slow? Shallow? Deep? Let it be whatever it is.

Move deeper. Into the space around your heart. What feelings live here today? Joy? Grief? Love? Worry? Emptiness? Fullness? Whatever is there, let it be. You do not need to understand it. Simply hold it gently.

Now, your belly. Your emotional centre. The place where gut feelings live. Place your awareness here like a warm hand. Breathe into your belly softly. What is your belly telling you today?

Move to your lower back. Your hips. Your pelvis. Notice the weight of your body resting here. These are the foundations. The roots.

Continue down into your thighs. Your knees. Your calves. Your shins. Notice any areas of holding. Any areas of ease.

Now, your ankles. Your feet. The soles of your feet. Your toes. The very tips of your toes. Imagine your awareness flowing all the way down and out through the bottoms of your feet. Grounding into the earth beneath you.

Now, expand your awareness to your whole body at once. Feel yourself as one complete, breathing, living being. From the crown of your head to the soles of your feet.

Take a moment here. In this wholeness.

Ask your body, gently: What do you need to tell me today? And listen. Without judgement. Without needing an answer.

Take one final deep breath in. Fill your whole body with that breath. And let it all go.

Begin to wiggle your fingers. Your toes. Gently move your head from side to side.

When you are ready, roll to one side. Rest there for a moment. And slowly, gently, return.

Thank you for listening to your body today. It has so much wisdom to share.`,
  ttsScript: `Find a comfortable place to lie down. A bed. A mat. The floor. Somewhere your body can be fully supported.

Let your legs stretch out long. Let your arms rest by your sides, palms facing up. Let your body be heavy.

Close your eyes. Or soften your gaze toward the ceiling.

Take three slow, deep breaths. With each exhale, let your body sink a little deeper into the surface beneath you.

There is nothing to fix here. Nothing to change. This is simply a practice of noticing. Of listening to your body with kindness and curiosity.

We will move slowly from the top of your head down to the tips of your toes. At each place, simply notice what is there. Sensation. Temperature. Tension. Ease. Numbness. Tingling. Whatever you find is valid.

Begin at the crown of your head. Bring your awareness to the very top of your skull. What do you notice there? Perhaps warmth. Perhaps nothing at all. Just notice.

Now move to your forehead. Your temples. The space between your eyebrows. Is there tightness here? Softness? Let your forehead smooth out. Let it be easy.

Move to your eyes. Your cheeks. Your jaw. The jaw is one of the most common places we hold stress. If your teeth are clenched, let them part slightly. Let your tongue rest on the roof of your mouth. Let your jaw be heavy.

Now, your throat. The front of your neck. The back of your neck. Notice any tension. Any tightness. You do not need to fix it. Simply acknowledging it is enough.

Move down into your shoulders. These faithful carriers. Let them drop. Let them release whatever they have been holding for you today.

Your upper arms. Your elbows. Your forearms. Your wrists. Your hands. Your fingers. Notice the temperature. The weight. The life in your hands.

Now, bring your awareness to your chest. Your ribcage. The rise and fall of your breath. Notice the rhythm. Is it fast? Slow? Shallow? Deep? Let it be whatever it is.

Move deeper. Into the space around your heart. What feelings live here today? Joy? Grief? Love? Worry? Emptiness? Fullness? Whatever is there, let it be. You do not need to understand it. Simply hold it gently.

Now, your belly. Your emotional centre. The place where gut feelings live. Place your awareness here like a warm hand. Breathe into your belly softly. What is your belly telling you today?

Move to your lower back. Your hips. Your pelvis. Notice the weight of your body resting here. These are the foundations. The roots.

Continue down into your thighs. Your knees. Your calves. Your shins. Notice any areas of holding. Any areas of ease.

Now, your ankles. Your feet. The soles of your feet. Your toes. The very tips of your toes. Imagine your awareness flowing all the way down and out through the bottoms of your feet. Grounding into the earth beneath you.

Now, expand your awareness to your whole body at once. Feel yourself as one complete, breathing, living being. From the crown of your head to the soles of your feet.

Take a moment here. In this wholeness.

Ask your body, gently: What do you need to tell me today? And listen. Without judgement. Without needing an answer.

Take one final deep breath in. Fill your whole body with that breath. And let it all go.

Begin to wiggle your fingers. Your toes. Gently move your head from side to side.

When you are ready, roll to one side. Rest there for a moment. And slowly, gently, return.

Thank you for listening to your body today. It has so much wisdom to share.`,
  steps: [
    {
      id: "1",
      title: "Settle",
      body: "Lie down comfortably. Let your body be heavy. Take three slow, deep breaths. There is nothing to fix. Just notice.",
      startTimeSec: 0,
      endTimeSec: 70,
    },
    {
      id: "2",
      title: "Crown and head",
      body: "Bring awareness to the crown of your head. What do you notice? Perhaps warmth. Perhaps nothing. Just notice.",
      startTimeSec: 70,
      endTimeSec: 140,
    },
    {
      id: "3",
      title: "Face and jaw",
      body: "Move to your forehead, temples, eyes, cheeks, jaw. If your teeth are clenched, let them part. Let your jaw be heavy.",
      startTimeSec: 140,
      endTimeSec: 220,
    },
    {
      id: "4",
      title: "Throat and shoulders",
      body: "Notice your throat, neck, and shoulders. These faithful carriers. Let them drop. Let them release.",
      startTimeSec: 220,
      endTimeSec: 310,
    },
    {
      id: "5",
      title: "Arms and hands",
      body: "Your upper arms. Elbows. Forearms. Wrists. Hands. Fingers. Notice the temperature. The weight. The life in your hands.",
      startTimeSec: 310,
      endTimeSec: 380,
    },
    {
      id: "6",
      title: "Chest and heart",
      body: "Bring awareness to your chest and heart space. What feelings live here today? Let them be. Hold them gently.",
      startTimeSec: 380,
      endTimeSec: 470,
    },
    {
      id: "7",
      title: "Belly",
      body: "Your belly. Your emotional centre. Place awareness here like a warm hand. What is your belly telling you today?",
      startTimeSec: 470,
      endTimeSec: 550,
    },
    {
      id: "8",
      title: "Hips and legs",
      body: "Move to your lower back, hips, thighs, knees, calves. Notice areas of holding. Areas of ease.",
      startTimeSec: 550,
      endTimeSec: 660,
    },
    {
      id: "9",
      title: "Feet and grounding",
      body: "Your ankles. Feet. Toes. Imagine awareness flowing through the soles of your feet, grounding into the earth.",
      startTimeSec: 660,
      endTimeSec: 750,
    },
    {
      id: "10",
      title: "Whole body",
      body: "Expand awareness to your whole body. Ask gently: What do you need to tell me today? Listen without judgement.",
      startTimeSec: 750,
      endTimeSec: 840,
    },
    {
      id: "11",
      title: "Return",
      body: "Take one final deep breath. Wiggle your fingers and toes. Roll to one side. Thank your body for its wisdom.",
      startTimeSec: 840,
      endTimeSec: 900,
    },
  ],
};

// ── Export ───────────────────────────────────────────────────

export const somaticScripts: SomaticPracticeScript[] = [
  butterflyHug,
  grounding54321,
  somaticOrienting,
  haveningTouch,
  neurogenicTremoring,
  somaticBodyScan,
];

/**
 * Look up a somatic script by practice ID.
 */
export function getSomaticScriptById(
  id: string
): SomaticPracticeScript | undefined {
  return somaticScripts.find((s) => s.id === id);
}
