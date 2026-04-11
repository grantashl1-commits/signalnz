// ── AI-Generated Mindfulness Scripts ────────────────────────
// Created from reference PDFs: Brianna Wiest (Human Element),
// Thich Nhat Hanh, Herbert Benson, Eckhart Tolle, Beyond Addiction
// Voice: ElevenLabs Lily (pFZP5JQG7iQjIQuC4Bku) at 0.75 speed

import type { MeditationScript } from "./meditation-scripts";
import {
  childhoodBlueprint,
  shameInventory,
  emotionalLandscape,
  letterNeverSent,
  reclaimingPower,
} from "./addiction-inner-work-scripts";

// ═══════════════════════════════════════════════════════════
// MEDITATIONS — PDF-sourced guided practices
// ═══════════════════════════════════════════════════════════

const washingDishes: MeditationScript = {
  id: "gen-washing-dishes",
  title: "The Washing Dishes Meditation",
  subtitle: "Full presence in everyday tasks",
  category: "meditation",
  durationSec: 300,
  description: "Transform a mundane chore into meditative practice by fully engaging your senses and attention.",
  evidenceSource: "Thich Nhat Hanh, The Miracle of Mindfulness",
  tags: ["mindfulness", "everyday", "presence"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Welcome to the Washing Dishes Meditation.
Find a comfortable standing position at your sink, or imagine yourself there. This practice is about bringing our full, gentle awareness to a simple, everyday task. No need to rush, no need to think about what comes next. Just this moment.

Let's begin by taking a deep, calming breath together. Inhale slowly through your nose, feeling your lungs expand. And exhale gently through your mouth, letting go of any tension. Do this one more time. Inhale. And exhale.

Now, bring your attention to the water. Feel its temperature as it flows over your hands. Is it warm, cool, just right? Notice the sensation.
Perhaps you're holding a dish. Feel its shape, its weight. Is it smooth, or does it have a texture?
As you pick up the sponge, notice its softness, its absorbency. The gentle friction against your fingers.

Now, add a little soap. Watch as the bubbles begin to form. See their delicate iridescence, reflecting the light.
Begin to wash a dish. Slowly, mindfully. Feel the warm water, the slippery soap, the gentle rub of the sponge.
Notice the sound of the water, the quiet hum of the kitchen, or perhaps the complete stillness.

Allow your mind to stay with these sensations. If your thoughts drift to the past or the future, gently guide them back to the water, the soap, the dish in your hands. This is not about achieving a perfect state of mind, but about practicing gentle return.

Be fully present with each movement. The rinse, the way the water cascades off the clean surface. The feeling of the dish becoming clean and smooth.

There is no need to rush, no goal to achieve other than to be right here, right now, washing this dish. Each dish you wash is a moment of presence. Each stroke of the sponge, a gentle act of awareness.

As we come to the end of this short practice, take one more slow, mindful breath.
Feel the gratitude for this simple act, for the gift of your senses, and for the opportunity to find peace in the everyday.
When you're ready, you can gently open your eyes, or simply carry this quiet awareness with you into the rest of your day.`,
  steps: [
    { id: "s1", title: "Settle", body: "Welcome and set the intention for mindful presence.", startTimeSec: 0, endTimeSec: 30 },
    { id: "s2", title: "Centering Breath", body: "Two slow, calming breaths to ground yourself.", startTimeSec: 30, endTimeSec: 60 },
    { id: "s3", title: "Focus on Water", body: "Notice the temperature and flow of the water.", startTimeSec: 60, endTimeSec: 120 },
    { id: "s4", title: "Mindful Washing", body: "Engage all senses in washing, gently returning thoughts.", startTimeSec: 120, endTimeSec: 240 },
    { id: "s5", title: "Conclusion", body: "Final breath and carrying awareness forward.", startTimeSec: 240, endTimeSec: 300 },
  ],
};

const tangerine: MeditationScript = {
  id: "gen-tangerine",
  title: "The Tangerine Meditation",
  subtitle: "Mindful eating and sensory awareness",
  category: "meditation",
  durationSec: 240,
  description: "Engage all your senses to fully experience the simple act of eating, deepening your connection to the present moment.",
  evidenceSource: "Thich Nhat Hanh, The Miracle of Mindfulness",
  tags: ["mindfulness", "eating", "sensory"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Welcome to the Tangerine Meditation.
For this practice, you'll need one tangerine. If you don't have one, you can simply imagine it vividly as we go along. This is an invitation to slow down, to engage all your senses, and to truly be present with the simple act of eating.

Let's begin by holding the tangerine in your hands. Feel its weight, its roundness, the texture of its skin. Notice its colour. Is it a vibrant orange, or a softer hue? Take a moment to just look at it, as if seeing a tangerine for the very first time.

Now, bring the tangerine close to your nose. Inhale deeply. What scents do you notice? Perhaps a sweet, citrusy aroma, or the subtle earthiness of its skin. Just breathe it in.

Slowly, begin to peel the tangerine. Notice the sound the peel makes as it separates from the fruit. The slight resistance, the way the essential oils mist into the air, creating a stronger scent. Feel the texture of the peel as you remove it.

Once it's peeled, break off a single segment. Notice its shape, its plumpness.
Bring this segment to your nose again. Is the scent different now? Perhaps brighter, more intense.

Now, place the segment gently into your mouth, but don't chew yet.
Let it rest on your tongue. Feel its texture. The smoothness, the softness.

When you're ready, slowly, mindfully, bite into the segment. Notice the burst of flavour. The juicy sweetness, perhaps a hint of tang. Allow the juice to spread across your tongue. Chew slowly, mindfully, sensing the pulp, the fibres.

Swallow deliberately, feeling the sensations in your throat. Take a moment after you've swallowed. What aftertastes linger?

This is what it means to eat mindfully. To bring our full attention to every aspect of the experience.
As we conclude this practice, take a final gentle breath. Carry this sense of presence, this richness of sensory experience, with you.`,
  steps: [
    { id: "s1", title: "Hold & See", body: "Feel weight, shape, observe colour.", startTimeSec: 0, endTimeSec: 45 },
    { id: "s2", title: "Smell", body: "Inhale deeply, noticing natural aroma.", startTimeSec: 45, endTimeSec: 65 },
    { id: "s3", title: "Peel", body: "Mindfully peel, noticing sounds and textures.", startTimeSec: 65, endTimeSec: 105 },
    { id: "s4", title: "Taste", body: "Place on tongue, chew slowly, savour.", startTimeSec: 105, endTimeSec: 210 },
    { id: "s5", title: "Conclusion", body: "Reflect and carry awareness forward.", startTimeSec: 210, endTimeSec: 240 },
  ],
};

const coexistingTruths: MeditationScript = {
  id: "gen-coexisting-truths",
  title: "Coexisting Truths",
  subtitle: "Embracing your internal contradictions",
  category: "meditation",
  durationSec: 480,
  description: "A gentle exploration of the seemingly contradictory aspects within yourself, fostering acceptance and integration.",
  evidenceSource: "Brianna Wiest, The Human Element",
  tags: ["self-compassion", "acceptance", "inner-work", "brianna-wiest"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Welcome to Coexisting Truths.
Find a comfortable position, whether seated or lying down, where your body feels supported and at ease.
Gently close your eyes, or soften your gaze downwards.

Take a few deep, grounding breaths. Inhale slowly through your nose, feeling your belly and chest expand. And exhale completely through your mouth, letting go of any tension.
Allow your breath to settle into its natural rhythm. A gentle ebb and flow, creating a space of inner quiet.

Today, we're going to explore the beautiful complexity of being human — the way seemingly opposite truths can reside within us, simultaneously. There's no need to reconcile them, only to acknowledge them with compassion.

Bring to mind a situation or an aspect of yourself where you feel two conflicting things at once.
Perhaps you are both strong and vulnerable.
Perhaps you are both ambitious and in need of rest.
Perhaps you love someone deeply, and sometimes feel frustrated by them.
Or perhaps you desire growth, yet sometimes resist change.
Just allow one such pairing to surface, without judgment.

Now, let's hold this first truth. Acknowledge it gently within yourself.
If it's "I am strong," really feel into that strength. Where do you sense it in your body? What does it feel like?

And now, gently, without dismissing the first, acknowledge the coexisting truth.
"I am also vulnerable." Where do you sense your vulnerability? Perhaps a softening, a tender spot.

Notice how these two feelings, these two aspects, are both part of your experience. They don't negate each other.
The strength doesn't erase the vulnerability, and the vulnerability doesn't diminish the strength.
They simply exist. Like two sides of the same coin, two colours in a vibrant tapestry.

Perhaps you can even feel a sense of expansion as you hold both. You are bigger than any single label.
Offer yourself kindness for holding these complexities. It takes courage to acknowledge the full spectrum of who you are.

There is no need to make a choice between them. Both are real. Both are true for you.
Breathing into both, just as they are. This is not about fixing or changing, but about radically accepting.
This acceptance creates a wider container for your experience, allowing more of you to be seen and held.

As we bring this practice to a close, take a final deep breath, breathing in this sense of compassionate acceptance.
And as you exhale, release any lingering need to be one way or another.
When you're ready, gently bring your awareness back to the room, carrying this sense of inner spaciousness with you.`,
  steps: [
    { id: "s1", title: "Ground", body: "Settle and breathe into inner quiet.", startTimeSec: 0, endTimeSec: 60 },
    { id: "s2", title: "Identify Pair", body: "Find two conflicting aspects within yourself.", startTimeSec: 60, endTimeSec: 180 },
    { id: "s3", title: "Feel Both", body: "Hold both truths simultaneously without judgment.", startTimeSec: 180, endTimeSec: 330 },
    { id: "s4", title: "Accept", body: "Breathe into radical acceptance of your complexity.", startTimeSec: 330, endTimeSec: 450 },
    { id: "s5", title: "Close", body: "Final breath and carry spaciousness forward.", startTimeSec: 450, endTimeSec: 480 },
  ],
};

const innerLight: MeditationScript = {
  id: "gen-inner-light",
  title: "The Inner Light",
  subtitle: "Connecting with your unchanging essence",
  category: "meditation",
  durationSec: 600,
  description: "Journey inward to discover the radiant, unchanging essence of your being — a source of peace beyond physical circumstances.",
  evidenceSource: "Brianna Wiest, The Human Element",
  tags: ["self-compassion", "essence", "inner-strength", "brianna-wiest"],
  phase: "all",
  backgroundMusic: "binaural",
  ttsScript: `Welcome to The Inner Light.
Find a deeply comfortable position. Allow your body to settle, your muscles to soften.
Gently close your eyes, inviting a sense of introspection.

Begin by taking three long, slow, deep breaths.
Inhale, filling your lungs completely, feeling the rise in your chest and belly.
Exhale, slowly, fully, releasing any tension, any worries, any thoughts that are not serving you right now.
Allow your breath to become soft, natural, and rhythmic.

Turn your attention inward now.
Notice the sensations in your body. The gentle hum of your heart, the slight pressure where you meet the surface beneath you.
Without judgment, simply observe.

Now, imagine for a moment, that your physical body is like a beautiful vessel. It carries you through life, experiences the world, changes and grows. But beneath and beyond this vessel, there is something more.
There is an essence, a core of who you are, that remains unchanged.

Picture this essence as a soft, warm, luminous light within the very centre of your being.
Perhaps it's in your heart space, or behind your eyes, or radiating from your core.
It's not a light that flickers or diminishes. It's constant. It's always there.

This light represents your deepest self.
It holds your truth, your wisdom, your inherent goodness.
It is the part of you that has always been whole, always been complete, always been resilient.
It's the part of you that has witnessed every joy and every challenge, yet remains untainted.

Allow this inner light to glow. Feel its warmth. Notice its gentle radiance.
It doesn't need to be earned or created; it simply exists within you.

As you breathe, imagine this light expanding gently with each inhale.
And with each exhale, it settles more deeply into your core, strengthening its quiet presence.

Thoughts may arise. Feelings may come and go. Physical sensations may shift.
But imagine that this inner light is like the sun, radiant and constant, while thoughts and feelings are like passing clouds. They may obscure the sun for a moment, but the sun itself remains, unchanging, behind them.

Rest in this awareness of your inner light. This place of peace, this source of calm.
It is your unchanging essence, your home.
You can always return to this inner sanctuary, this gentle glow, whenever you need to feel grounded.

As we prepare to close this practice, take one more deep, expansive breath.
Inhaling the knowing of this inner light, and exhaling gratitude for its constant presence.
Gently bring your awareness back to your body, back to the room.
When you're ready, slowly open your eyes, carrying the quiet glow of your inner light with you.`,
  steps: [
    { id: "s1", title: "Settle", body: "Deep breaths to transition inward.", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "Body Awareness", body: "Notice sensations without judgment.", startTimeSec: 90, endTimeSec: 135 },
    { id: "s3", title: "Find the Light", body: "Imagine a luminous, unchanging essence within.", startTimeSec: 135, endTimeSec: 270 },
    { id: "s4", title: "Expand", body: "Let the light grow with each breath.", startTimeSec: 270, endTimeSec: 435 },
    { id: "s5", title: "Rest & Return", body: "Bask in inner sanctuary, then return.", startTimeSec: 435, endTimeSec: 600 },
  ],
};

const relaxationResponse: MeditationScript = {
  id: "gen-relaxation-response",
  title: "The Relaxation Response",
  subtitle: "Deep rest through focused attention",
  category: "meditation",
  durationSec: 720,
  description: "A structured practice using a focus word, passive attitude, and gentle muscle relaxation to elicit the body's natural relaxation response.",
  evidenceSource: "Herbert Benson, The Relaxation Response",
  tags: ["relaxation", "stress-relief", "focus", "herbert-benson"],
  phase: "all",
  backgroundMusic: "binaural",
  ttsScript: `Welcome to The Relaxation Response.
This practice is designed to help you access your body's innate ability to rest and heal.
Find a quiet place where you won't be disturbed. Sit or lie down in a comfortable position. Allow your body to feel entirely supported.

Gently close your eyes.

Let's begin by taking a few deep, intentional breaths.
Inhale slowly and deeply through your nose, feeling your abdomen rise.
Exhale gently through your mouth, allowing your body to soften and release any tension.
Do this two more times. Inhale… and exhale… One more time, a deep inhale… and a complete exhale.
Now, allow your breathing to return to its natural, effortless rhythm.

Our focus for this practice involves three elements: a gentle focus word, a passive attitude, and progressive muscle relaxation.

First, choose a simple, neutral word or sound. Something that feels calming to you.
Perhaps it's "peace," or "one," or "love," or simply the sound "Om."
Quietly, to yourself, repeat this chosen word or sound. Let it be a soft, gentle anchor for your mind.

Now, let's turn our attention to progressive muscle relaxation.
Starting with your feet, gently tighten the muscles. Hold for five… four… three… two… one… and then completely relax.

Move your awareness up to your lower legs. Gently tense your calf muscles. Hold… five… four… three… two… one… and release.

Now your thighs. Tighten these muscles… five… four… three… two… one… and release.

Your abdomen. Gently tighten… five… four… three… two… one… and relax.

Your hands. Clench your fists. Squeeze… five… four… three… two… one… and release.

Your shoulders. Shrug them up towards your ears. Hold… five… four… three… two… one… and drop them completely.

Your face. Squint your eyes, clench your jaw… five… four… three… two… one… and release. Let your jaw hang loose, your forehead smooth.

Now, allow your entire body to rest in this state of deep relaxation.
Return your focus to your chosen word or sound. Repeat it gently, silently, each time you exhale.

The key element is a passive attitude. Thoughts will arise. That's natural. When you notice your mind has wandered, simply say to yourself, "Oh well," and gently return to your focus word.
You are not trying to stop thinking, but creating gentle space for thoughts to pass through.

Allow yourself to drift into a state of deep rest, a quiet awareness.
Embrace the stillness. Embrace the quiet repetition of your word.
You are safe. You are held. You are allowing your body to do what it naturally knows how to do: rest and rejuvenate.

As we near the end, begin to bring gentle awareness back to your surroundings.
Wiggle your fingers and toes. Take a slow, deep breath.
When you feel ready, slowly open your eyes. Carry this sense of calm with you.`,
  steps: [
    { id: "s1", title: "Settle", body: "Deep breaths and find comfort.", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "Focus Word", body: "Choose a calming word as your anchor.", startTimeSec: 90, endTimeSec: 140 },
    { id: "s3", title: "Muscle Relaxation", body: "Progressive tense-and-release from feet to face.", startTimeSec: 140, endTimeSec: 420 },
    { id: "s4", title: "Deep Rest", body: "Repeat focus word with passive attitude.", startTimeSec: 420, endTimeSec: 660 },
    { id: "s5", title: "Return", body: "Gently reawaken and carry calm.", startTimeSec: 660, endTimeSec: 720 },
  ],
};

const arrivingPresent: MeditationScript = {
  id: "gen-arriving-present",
  title: "Arriving in the Present",
  subtitle: "Releasing past and future",
  category: "meditation",
  durationSec: 300,
  description: "A profound practice to release the grip of past and future, anchoring awareness in the timeless power of the present moment.",
  evidenceSource: "Eckhart Tolle, The Power of Now",
  tags: ["presence", "now", "awareness", "eckhart-tolle"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Welcome to Arriving in the Present.
Find a comfortable position, where your body feels at ease and supported.
Gently close your eyes, or soften your gaze downwards.

Take a slow, deep breath, allowing your shoulders to drop, your jaw to soften.
Exhale completely, feeling your body settle a little more.
Allow your breath to find its own natural rhythm now.

Bring your awareness to the sensations in your body right here, right now.
Feel the points where your body makes contact with the chair or the floor.
Notice the feeling of your clothes against your skin.
The subtle hum of air moving in and out of your lungs.

Allow any thoughts of the past to gently dissolve. Whatever has happened, has happened. There is nothing to do with it right now.
Allow any thoughts of the future to soften. Whatever will be, will be. There is nothing to plan or worry about in this very moment.
The past is a memory, the future is an imagination. Only this moment is real.

This present moment is your point of power, your anchor.
There is no problem in this exact second, unless you are thinking a thought about one.
Can you feel the stillness within you, beyond the movement of your thoughts?

Listen to the sounds around you. Not trying to label them or judge them, just hearing them as they are.
Feel the air on your skin. The temperature, the gentle breeze.
Notice the space around you. The space within you. This vast, expansive awareness.

Allow yourself to simply be. Not becoming, not striving, not judging. Just being.
There is a deep peace here, in the unadulterated present. It's always available. Always waiting for your attention.

When thoughts arise, simply notice them. And then, gently, bring your awareness back to the sensations of your breath, the sounds, the feeling of your body.
Back to this glorious, infinite Now.

As we prepare to complete this practice, take one more deep, conscious breath.
Feel the freshness of this moment.
When you're ready, slowly and gently open your eyes, carrying this simple, profound presence with you.`,
  steps: [
    { id: "s1", title: "Settle", body: "Breath and soften into position.", startTimeSec: 0, endTimeSec: 50 },
    { id: "s2", title: "Body Sensations", body: "Notice contact points and subtle body feelings.", startTimeSec: 50, endTimeSec: 90 },
    { id: "s3", title: "Release", body: "Let thoughts of past and future dissolve.", startTimeSec: 90, endTimeSec: 190 },
    { id: "s4", title: "Just Being", body: "Find peace in the present moment.", startTimeSec: 190, endTimeSec: 270 },
    { id: "s5", title: "Return", body: "Carry presence into your day.", startTimeSec: 270, endTimeSec: 300 },
  ],
};

// ═══════════════════════════════════════════════════════════
// SLEEP — Guided sleep practices
// ═══════════════════════════════════════════════════════════

const sleepBodyMelt: MeditationScript = {
  id: "gen-sleep-body-melt",
  title: "Sleep Body Melt",
  subtitle: "Progressive relaxation for deep sleep",
  category: "sleep",
  durationSec: 900,
  description: "A guided progressive muscle relaxation to release tension from head to toe, preparing your body for a peaceful night's sleep.",
  evidenceSource: "Progressive muscle relaxation (Jacobson)",
  tags: ["sleep", "relaxation", "body-scan", "tension-release"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Welcome to the Sleep Body Melt.
Lie down in your bed, or wherever you feel most comfortable and supported.
Arrange your pillows and blankets so you feel cosy and warm.
Let your arms rest by your sides, palms facing up or down, whatever feels most natural.

Now, gently close your eyes, signalling to your body that it's time to rest.
Take a deep, cleansing breath. Inhale slowly through your nose, feeling your belly rise.
And exhale completely through your mouth, letting out a soft sigh, releasing the day.
Do this two more times, each exhale carrying away a little more tension.
Now, allow your breath to settle into its own quiet rhythm.

We're going to move our awareness through your body, gently tensing and then completely releasing each muscle group.

Begin with your feet. Curl your toes tightly, clench the muscles in your feet. Hold for five… four… three… two… one… and then completely relax. Feel the warmth as your feet soften and sink into the mattress.

Move up to your lower legs. Gently tighten your calf muscles. Hold… five… four… three… two… one… and exhale, releasing all effort.

Moving to your thighs. Gently tense these large muscles. Squeeze… five… four… three… two… one… and release. Feel the relaxation spread through your hips and legs.

Now your hands. Make soft fists. Squeeze gently… five… four… three… two… one… and release. Let your hands be soft and open.

Your belly. Gently tense your abdominal muscles. Hold… five… four… three… two… one… and release. Allow your belly to be soft.

Your shoulders. Gently shrug them up towards your ears. Hold… five… four… three… two… one… and drop them completely. Feel the weight of the day releasing.

Finally, your face. Gently squint your eyes, wrinkle your nose, press your lips together. Hold… five… four… three… two… one… and release. Allow your jaw to hang loose, your forehead smooth.

Now, allow your entire body to melt into the bed. From the top of your head, down to the tips of your toes, feel a wave of profound relaxation wash over you.
Each exhale is an invitation for deeper rest. Each inhale is gentle, effortless.

If your mind begins to wander, simply guide your attention back to the sensation of your breath, or to the peaceful stillness within your body.

Rest here, allowing yourself to drift naturally into a peaceful, restorative sleep.
You are safe. You are warm. You are utterly at ease.
Let yourself go.
Good night.`,
  steps: [
    { id: "s1", title: "Settle", body: "Get comfortable in bed, close eyes.", startTimeSec: 0, endTimeSec: 80 },
    { id: "s2", title: "Lower Body", body: "Tense and release feet, legs, thighs.", startTimeSec: 80, endTimeSec: 280 },
    { id: "s3", title: "Upper Body", body: "Tense and release hands, belly, shoulders, face.", startTimeSec: 280, endTimeSec: 530 },
    { id: "s4", title: "Full Melt", body: "Wave of relaxation over entire body.", startTimeSec: 530, endTimeSec: 870 },
    { id: "s5", title: "Sleep", body: "Drift into peaceful sleep.", startTimeSec: 870, endTimeSec: 900 },
  ],
};

const nightRiver: MeditationScript = {
  id: "gen-night-river",
  title: "The Night River",
  subtitle: "Gentle guided imagery for peaceful sleep",
  category: "sleep",
  durationSec: 1200,
  description: "Immerse yourself in the tranquil imagery of floating on a peaceful river under the night sky, guiding you into deep sleep.",
  evidenceSource: "Guided imagery and mindfulness practices for sleep",
  tags: ["sleep", "guided-imagery", "peaceful", "calm"],
  phase: "all",
  backgroundMusic: "nature",
  ttsScript: `Welcome to the Night River.
Settle into your bed now. Find a position that feels exquisitely comfortable and safe.
Let your body soften into the mattress, feeling the support beneath you.
Gently close your eyes, letting go of any visual distractions.

Take a slow, deep breath in through your nose, filling your lungs completely.
And exhale, slowly and fully, through your mouth, letting your breath carry away any lingering thoughts.
Take two more like this. Inhale… and exhale… and again, inhale… and exhale, deeper now.
Allow your breath to return to its natural, gentle rhythm.

Now, imagine yourself standing on the bank of a beautiful, wide river.
It's late evening, and the sky is a deep, velvety indigo, fading into soft purples and oranges on the horizon.
The air is still and peaceful, carrying the subtle scents of damp earth and night-blooming jasmine.

You step onto a small, perfectly smooth, wooden boat. It's just large enough for you.
The wood feels warm beneath your touch.
As you settle into the boat, you lie down comfortably within it, feeling perfectly cradled.
The boat is stable, perfectly balanced. You are safe.

The river is calm, its surface like polished glass, reflecting the faint starlight and the sliver of a crescent moon.
You feel a gentle push, and your boat slips away from the bank, effortlessly gliding onto the dark, placid water.

There's no current pulling you, no need to row. You are simply floating, gently, peacefully.
You can feel the subtle, rhythmic sway of the boat as it moves, a gentle lulling motion.
Let this motion ease any tension from your body.

Look up at the night sky. The stars are beginning to emerge, twinkling like tiny diamonds scattered across the vast, dark canvas.
Watch the moon as it slowly rises, casting a soft, silvery glow on the water.

Listen to the sounds of the night river. The gentle lapping of water against the boat.
The distant hoot of an owl, the soft chirping of crickets on the banks.
No harsh noises, just the soothing symphony of the natural world at rest.

With each gentle sway, each soft breath, feel yourself becoming softer, heavier, more deeply relaxed.
Imagine any worries drifting away from you, like tiny leaves floating downstream, out of sight.

Your eyelids feel heavy now. Your muscles are completely relaxed.
Your breath is slow and deep.
You are completely safe, completely held by the river, by the night.

Continue to float, carried by the gentle current of sleep.
The boat knows where it's going. You don't need to do anything but relax and trust.
Let the darkness and the quiet embrace you.
Drift now, into peaceful dreams.
Good night.`,
  steps: [
    { id: "s1", title: "Settle", body: "Get comfortable, close eyes, breathe.", startTimeSec: 0, endTimeSec: 90 },
    { id: "s2", title: "River Scene", body: "Imagine a beautiful river at dusk.", startTimeSec: 90, endTimeSec: 210 },
    { id: "s3", title: "Float", body: "Glide onto calm water in a wooden boat.", startTimeSec: 210, endTimeSec: 470 },
    { id: "s4", title: "Release", body: "Worries drift away, body melts.", startTimeSec: 470, endTimeSec: 670 },
    { id: "s5", title: "Sleep", body: "Drift into peaceful dreams.", startTimeSec: 670, endTimeSec: 1200 },
  ],
};

const breathIntoSleep: MeditationScript = {
  id: "gen-breath-into-sleep",
  title: "Breath into Sleep",
  subtitle: "Extended exhale breathing for sleep",
  category: "sleep",
  durationSec: 600,
  description: "A calming breathwork practice designed to lengthen your exhale, slowing your heart rate and easing you into restful sleep.",
  evidenceSource: "Parasympathetic activation via extended exhale breathing",
  tags: ["sleep", "breathwork", "relaxation", "parasympathetic"],
  phase: "all",
  backgroundMusic: "binaural",
  ttsScript: `Welcome to Breath into Sleep.
Lie down now in your most comfortable sleeping position.
Allow your body to feel heavy and supported by the bed.
Gently close your eyes, bringing your awareness inward.

Take a moment to simply notice your natural breath.
Feel the gentle rise and fall of your abdomen.
Notice the cool air entering your nostrils, and the warm air leaving.
No need to change anything yet, just observe.

Now, let's begin to gently deepen and extend our breaths.
We'll focus on lengthening the exhale, as this activates your parasympathetic nervous system, signalling to your body that it's safe to rest.

Breathe in slowly through your nose for a count of four.
Now, exhale slowly through your mouth, as if sighing, for a count of six. Let all the air go.

Let's continue this pattern together.
Inhale for four…
Exhale for six…

Keep going at your own natural pace, but always aiming for your exhale to be a little longer than your inhale.
Inhale, filling with calm.
Exhale, releasing all tension.

Imagine with each exhale, a wave of relaxation spreading through your body.
From the top of your head, down through your face, your neck, your shoulders.
Each exhale carrying away another layer of the day.

Inhale peace.
Exhale effort.

Feel your muscles softening. Your jaw relax. Your eyelids heavy.
Your heart rate is slowly slowing down.
Your body is preparing for deep, restorative sleep.

Now, gently release the counting.
Just allow your breath to be soft and natural once more.
Notice how much slower, how much calmer, it feels now.
Your body is deeply relaxed. Your mind is quiet.

There's nothing left to do.
Just allow yourself to drift into the gentle current of sleep.
Sleep now.
Good night.`,
  steps: [
    { id: "s1", title: "Settle", body: "Find comfortable sleeping position.", startTimeSec: 0, endTimeSec: 60 },
    { id: "s2", title: "Observe Breath", body: "Notice natural breathing rhythm.", startTimeSec: 60, endTimeSec: 100 },
    { id: "s3", title: "Extended Exhale", body: "Inhale 4, exhale 6 pattern.", startTimeSec: 100, endTimeSec: 350 },
    { id: "s4", title: "Release", body: "Let go of counting, natural calm.", startTimeSec: 350, endTimeSec: 540 },
    { id: "s5", title: "Sleep", body: "Drift into sleep.", startTimeSec: 540, endTimeSec: 600 },
  ],
};

// ═══════════════════════════════════════════════════════════
// INNER WORK — Addiction recovery & self-inquiry
// ═══════════════════════════════════════════════════════════

const understandingPatterns: MeditationScript = {
  id: "gen-understanding-patterns",
  title: "Understanding Your Patterns",
  subtitle: "Identify triggers and drivers of habits",
  category: "inner-work",
  durationSec: 720,
  description: "A guided reflection to compassionately explore the triggers, thoughts, and consequences of habitual or compulsive behaviours.",
  evidenceSource: "CRAFT approach (Foote, Wilkens, Kosanke) — Beyond Addiction",
  tags: ["addiction-recovery", "self-awareness", "patterns", "triggers", "inner-work"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Welcome to Understanding Your Patterns.
Find a quiet space where you can sit comfortably and be undisturbed.
Allow yourself to settle into your seat, feeling grounded and supported.
Gently close your eyes.

Take a few deep, intentional breaths. Inhale slowly through your nose. Exhale completely through your mouth.
Allow your breath to find a natural, gentle rhythm.

Today, we're going to gently explore some of the patterns in your life, particularly those that might feel challenging or compulsive. This isn't about judgment or blame, but about compassionate curiosity. We're shining a light, not to criticise, but to understand.

Bring to mind a specific behaviour or habit that you're interested in understanding better.
Perhaps it's a way you react to stress, or a substance you turn to, or an action you find yourself repeating even when you don't fully intend to.

Now, let's explore this pattern.
First, think about the Triggers.
What situations or feelings often precede this behaviour? Is it stress, loneliness, boredom, anger, exhaustion, a specific time of day, a particular place, or certain people?
Just observe, without judgment. What lights the fuse?

Next, consider the Thoughts and Feelings that arise just before the behaviour.
What thoughts run through your mind? "I deserve this." "I can't cope." "Just this once."
What emotions do you feel? A craving, a restlessness, anxiety, emptiness?
Allow yourself to simply notice these internal signals. They are messengers, not commands.

Then comes the Behaviour itself.
What exactly do you do? How does it feel in the moment?
Is there a sense of relief, pleasure, escape, or perhaps a temporary numbing?

And finally, consider the Consequences.
What happens immediately after? And later?
Do you feel regret, shame, disappointment? What are the longer-term impacts?

Repeat this journey: Trigger… Thoughts… Behaviour… Consequences.
Do it slowly, with kindness.
This insight isn't about shaming yourself, but about empowering yourself.

Perhaps you notice something new this time. A subtle thought, a hidden feeling, a trigger you hadn't fully recognised.
This understanding is like holding a map. It shows you the territory.

Offer yourself compassion for whatever arises. These patterns often serve a purpose. They are often born from a desire to cope, to feel better, or to escape discomfort.

As we bring this reflection to a close, take a deep breath.
Remember, awareness is the first step toward change. You've taken a powerful step today.
When you're ready, gently open your eyes.`,
  steps: [
    { id: "s1", title: "Settle", body: "Ground with breath and intention.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "Choose Pattern", body: "Select a behaviour to explore.", startTimeSec: 120, endTimeSec: 180 },
    { id: "s3", title: "Explore Chain", body: "Trigger → Thoughts → Behaviour → Consequences.", startTimeSec: 180, endTimeSec: 540 },
    { id: "s4", title: "Compassion", body: "Acknowledge purpose behind the pattern.", startTimeSec: 540, endTimeSec: 660 },
    { id: "s5", title: "Close", body: "Integrate insights and carry awareness.", startTimeSec: 660, endTimeSec: 720 },
  ],
};

const rootBeneathRoot: MeditationScript = {
  id: "gen-root-beneath-root",
  title: "The Root Beneath the Root",
  subtitle: "Deep inquiry into addiction's emotional drivers",
  category: "inner-work",
  durationSec: 900,
  description: "A profound guided inquiry to gently explore the underlying emotional needs that a compulsive behaviour attempts to soothe.",
  evidenceSource: "Internal Family Systems (IFS) & Beyond Addiction (Foote et al.)",
  tags: ["addiction-recovery", "inner-work", "emotional-needs", "self-compassion"],
  phase: "all",
  backgroundMusic: "binaural",
  ttsScript: `Welcome to The Root Beneath the Root.
Find a quiet, private space where you can sit or lie down comfortably.
Allow yourself to fully relax, feeling the support beneath you.
Gently close your eyes, turning your attention inward.

Take three slow, deep, grounding breaths.
Inhale fully. Exhale completely, letting out any tension, any rush, any need to be anywhere but here.
Allow your breath to settle into a soft, steady rhythm.

Today, we're going to embark on a compassionate journey inward. A journey to gently explore what lies beneath our habitual responses.
This isn't about judgment, but about deep, loving understanding.

Bring to mind a specific pattern or behaviour you want to understand more deeply. Hold it gently in your awareness.

Now, sense the impulse or the craving for this behaviour. Where do you feel it in your body? Is it a tightness, a hollow feeling, a restless energy?
And what feeling typically precedes this impulse? Is it stress, loneliness, anxiety, boredom, emptiness, anger, fear, or a sense of not being enough?
Just allow that primary feeling to surface.

As you hold this feeling, ask yourself, with gentle curiosity:
"What is this feeling trying to tell me?"
"What is it that I truly need in this moment, that this behaviour is attempting to provide?"

Perhaps the behaviour offers a temporary escape from discomfort.
If so, what discomfort? Is it pain, sadness, overwhelm?
What is the real need behind the desire to escape? Is it a need for safety, for peace, for connection, for rest?

Perhaps the behaviour offers a sense of comfort or reward.
What kind of comfort? What is the real need? Is it a need for love, for acceptance, for joy?

Perhaps the behaviour offers a sense of control.
Where do you feel powerless? What is the real need? Is it a need for agency, for stability?

Go deeper. If the behaviour is trying to fill a void, what is the nature of that void?
Is it a longing for connection? A yearning for meaning? A desire for self-worth?

Imagine peeling back layers, one by one.
The behaviour…
Beneath it, the surface feeling…
And beneath that, the deeper, often unacknowledged, emotional need.
The root beneath the root.

When you identify this deeper need, give it space.
Do you need to feel loved? Safe? Seen? Do you need rest? Joy? Quiet?
Acknowledge it fully.

Now, offer this genuine need compassion.
Imagine placing a warm, gentle hand over your heart.
Silently, say to yourself:
"It is okay to have this need."
"I am here for this part of myself."
"I will listen."

You might not find all the answers today, and that's perfectly okay. The awareness itself is the most powerful step.

As we bring this practice to a close, take a final deep breath.
Inhaling self-compassion, and exhaling the intention to continue listening to your deepest needs.
When you're ready, gently open your eyes.`,
  steps: [
    { id: "s1", title: "Ground", body: "Deep breaths and settle inward.", startTimeSec: 0, endTimeSec: 120 },
    { id: "s2", title: "Sense Impulse", body: "Feel where the craving lives in your body.", startTimeSec: 120, endTimeSec: 250 },
    { id: "s3", title: "Inquiry", body: "Ask what need the behaviour serves.", startTimeSec: 250, endTimeSec: 600 },
    { id: "s4", title: "The Root", body: "Peel back to the deepest emotional need.", startTimeSec: 600, endTimeSec: 810 },
    { id: "s5", title: "Compassion", body: "Offer self-compassion and close.", startTimeSec: 810, endTimeSec: 900 },
  ],
};

const releasingWithoutReplacing: MeditationScript = {
  id: "gen-releasing-without-replacing",
  title: "Releasing Without Replacing",
  subtitle: "Sitting with discomfort without habitual reactions",
  category: "inner-work",
  durationSec: 600,
  description: "Learn to observe uncomfortable sensations and urges without immediately reacting or seeking to replace them with a habitual response.",
  evidenceSource: "ACT & Mindfulness-Based Relapse Prevention (MBRP)",
  tags: ["addiction-recovery", "discomfort-tolerance", "urges", "self-compassion"],
  phase: "all",
  backgroundMusic: "gentle",
  ttsScript: `Welcome to Releasing Without Replacing.
Find a comfortable position, whether seated or lying down, where you can remain still and undisturbed.
Gently close your eyes.

Take a slow, deep breath in through your nose, and exhale fully through your mouth, letting out a soft sigh.
Do this two more times, letting each exhale help you settle deeper.
Allow your breath to return to its natural rhythm.

Today, we're going to practice a crucial skill: learning to sit with discomfort without immediately reacting or reaching for a familiar habit to soothe ourselves. This is about creating space, observing, and allowing emotions and urges to simply be.

Bring to mind a mild, manageable discomfort or an urge you sometimes experience.
Perhaps it's restlessness, a subtle craving, mild anxiety, boredom, or a physical itch.
Choose something that feels accessible to observe right now, not an overwhelming crisis.

As you bring this sensation into your awareness, notice where you feel it in your body.
Is it a tightness in your chest? A fluttering in your stomach? An agitation in your hands?

Now, instead of immediately responding, simply lean into observing it.
Imagine it as a cloud passing in the sky. You don't need to grab it, or follow it, or make it go away.
Can you notice its shape? Its intensity? Does it have a temperature? Is it constant, or does it ebb and flow?

Bring a gentle, curious awareness to it.
What is it really like to simply feel this discomfort, without the layer of resistance or the usual scramble to escape it?
Notice any thoughts that arise: "I don't like this," "I need to do something." Acknowledge these thoughts too, as simply more clouds passing.

With each breath, imagine creating more space around this sensation.
You are not the discomfort. You are the awareness that is observing the discomfort.
This space, this awareness, is unconditioned, unchanging, safe.

This practice is not about enduring pain, but about recognising that urges and uncomfortable feelings are temporary. They rise, they peak, and they fall.
By not acting on the urge, you allow it the space to run its course.
You are strengthening your capacity to respond rather than react.

It takes courage to do this. Offer yourself deep compassion for being willing to sit in this space.
There is immense strength in simply allowing something to be.

Rest in this open, accepting awareness for a few more moments.
Just breathing, just observing, just allowing.

As we draw this practice to a close, take a final deep, centring breath.
Acknowledge the courageous work you have done today.
When you're ready, gently open your eyes, carrying this expanded capacity for non-reactivity with you.`,
  steps: [
    { id: "s1", title: "Settle", body: "Breath and ground into stillness.", startTimeSec: 0, endTimeSec: 105 },
    { id: "s2", title: "Choose Discomfort", body: "Identify a mild urge or discomfort.", startTimeSec: 105, endTimeSec: 215 },
    { id: "s3", title: "Observe", body: "Watch it like a passing cloud.", startTimeSec: 215, endTimeSec: 375 },
    { id: "s4", title: "Create Space", body: "You are the awareness, not the sensation.", startTimeSec: 375, endTimeSec: 525 },
    { id: "s5", title: "Compassion & Close", body: "Offer yourself deep compassion.", startTimeSec: 525, endTimeSec: 600 },
  ],
};

import {
  childhoodBlueprint,
  shameInventory,
  emotionalLandscape,
  letterNeverSent,
  reclaimingPower,
} from "./addiction-inner-work-scripts";

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export const GEN_MEDITATION_SCRIPTS: MeditationScript[] = [
  washingDishes,
  tangerine,
  coexistingTruths,
  innerLight,
  relaxationResponse,
  arrivingPresent,
];

export const GEN_SLEEP_SCRIPTS: MeditationScript[] = [
  sleepBodyMelt,
  nightRiver,
  breathIntoSleep,
];

export const GEN_INNER_WORK_SCRIPTS: MeditationScript[] = [
  understandingPatterns,
  rootBeneathRoot,
  releasingWithoutReplacing,
  childhoodBlueprint,
  shameInventory,
  emotionalLandscape,
  letterNeverSent,
  reclaimingPower,
];

export const ALL_GENERATED_SCRIPTS: MeditationScript[] = [
  ...GEN_MEDITATION_SCRIPTS,
  ...GEN_SLEEP_SCRIPTS,
  ...GEN_INNER_WORK_SCRIPTS,
];
