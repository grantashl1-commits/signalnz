// /src/data/audio-scripts.ts
// 50 scripts – Meditations, Somatic, Breathwork, Sleep, Hypnosis, Couples, Parenting
// All scripts use YOCH tone: warm, earthy, gentle, metaphor‑rich.

import { REGINA_VOICE_ID, THEO_VOICE_ID, VOICE_CACHE_VERSION } from "@/lib/script-audio";

export interface AudioScript {
  id: string;
  title: string;
  category: 'meditation' | 'somatic' | 'breathwork' | 'sleep' | 'hypnosis' | 'couples' | 'parenting';
  durationMinutes: number;
  targetWordCount: number;
  script: string;
  /** Path to the recorded MP3 (served from public/). Optional — undefined while audio is still being generated. */
  audioUrl?: string;
}

/**
 * IDs of scripts whose audio has been generated and placed in public/audio/<id>.mp3.
 * Add to this set as new MP3s land — the helper below will populate `audioUrl` automatically.
 */
const SCRIPTS_WITH_AUDIO = new Set<string>([
  "cpl-001",
  "cpl-002",
  "cpl-003",
  "cpl-004",
]);

/**
 * Voice routing by category.
 * Hypnosis uses Theo (male). Everything else uses Regina (female, default).
 */
export function getCategoryVoiceId(category: AudioScript["category"]): string {
  return category === "hypnosis" ? THEO_VOICE_ID : REGINA_VOICE_ID;
}

/**
 * Storage path inside the practice-audio bucket where ElevenLabs-generated
 * MP3s live. Versioned + voice-namespaced so re-runs under different voices
 * don't clobber each other.
 */
export function getStorageAudioPath(script: AudioScript): string {
  const voiceId = getCategoryVoiceId(script.category);
  return `audio-scripts/${VOICE_CACHE_VERSION}/${voiceId.slice(0, 12)}/${script.id}.mp3`;
}

/**
 * Resolve the audio URL for a script. Returns the static MP3 in /public/audio/
 * if it has been hand-recorded, else undefined (caller should fall back to
 * Supabase Storage at the path returned by `getStorageAudioPath`).
 */
export function getAudioUrl(script: AudioScript): string | undefined {
  if (script.audioUrl) return script.audioUrl;
  if (SCRIPTS_WITH_AUDIO.has(script.id)) return `/audio/${script.id}.mp3`;
  return undefined;
}

/**
 * Resolve the playable audio URL for a script with full priority chain:
 *   1. Hand-recorded static `/audio/<id>.mp3`
 *   2. ElevenLabs-generated MP3 in the practice-audio Supabase Storage bucket
 *      at the versioned + voice-namespaced path
 *   3. undefined (no audio yet — caller should hide the play button or
 *      trigger generation via the batch-tts edge function)
 *
 * Pass the Supabase URL (typically `import.meta.env.VITE_SUPABASE_URL`) so
 * this helper stays free of import.meta side-effects.
 */
export function resolvePlayableAudioUrl(script: AudioScript, supabaseUrl?: string): string | undefined {
  const staticUrl = getAudioUrl(script);
  if (staticUrl) return staticUrl;
  if (!supabaseUrl) return undefined;
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/practice-audio/${getStorageAudioPath(script)}`;
}

export const AUDIO_SCRIPTS: AudioScript[] = [
  // ============================================================
  // MEDITATIONS (8) – expanded to ~5000 characters
  // ============================================================
  {
    id: "med-001",
    title: "Morning Grounding",
    category: "meditation",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Find a comfortable seat – on a cushion, a chair, or the edge of your bed. Allow your feet to rest flat on the floor, feeling the contact. If you are sitting on a cushion, feel the stable support beneath you. Close your eyes gently, or soften your gaze downwards.

Take a deep breath in through your nose, filling your lungs completely. And exhale slowly through your mouth, letting out any lingering sleep, any tension from the night. Do this two more times. Inhale deeply, drawing in the fresh energy of the new day. Exhale fully, releasing anything that you no longer need to carry. (Pause)

Now, bring your awareness to the feeling of gravity. Feel how the earth is holding you. It is not a heavy weight pressing down, but a gentle, constant support. Imagine that beneath your feet, or beneath the floor, there is soil, rock, and deep, ancient earth. It has been here for billions of years. It is steady, patient, and strong.

With each inhale, imagine drawing a subtle, warm energy up from that earth, through the soles of your feet, into your legs, and up into your belly. With each exhale, feel any restless or scattered energy flowing back down into the earth, grounding you. (Long pause – 30 seconds)

You can even imagine roots growing from the soles of your feet, or from the base of your spine, extending down into the earth. These roots are not rigid – they are flexible, alive, and connected. They anchor you, but they also allow you to move freely. Feel your roots reaching down. (Pause)

This is your grounding. No matter what the day brings – the tasks, the interactions, the surprises – you can always return to this felt sense of being held by the earth.

Now, place one hand gently on your belly. Feel the natural rise and fall of your breath. There is no need to control it. Just watch it, like a soft wave on a calm sea. Your breath is the most faithful reminder that you are alive, that you are here, right now. (Long pause – 45 seconds)

If thoughts arise – plans, worries, memories – simply notice them as if they are clouds drifting across a vast sky. You are not the clouds. You are the sky. Gently return your attention to the feeling of your hand on your belly, to your roots, to the breath. (Pause)

Now, silently set an intention for this day. It can be a single word: "patience", "kindness", "presence", "ease". Or a short phrase: "I will listen to my body", "I will respond rather than react". Repeat your intention to yourself three times, letting it sink into your heart. (Pause)

Take a final, full breath together. Inhale deeply, and as you exhale, release any last tension in your shoulders, your jaw, your hands. Wiggle your fingers and toes. When you feel ready, slowly open your eyes.

Carry this grounded, present feeling with you. You have everything you need to meet this day.`
  },
  {
    id: "med-002",
    title: "Body Scan",
    category: "meditation",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `Lie down on your back, or sit in a comfortable chair. Close your eyes. Let your breath find its own natural rhythm.

We will move our attention through the body like a soft beam of light, not to change anything, just to notice.

Bring your awareness to your feet. Your left foot first. Notice any sensations – warmth, coolness, tingling, or nothing at all. Just observe. (Pause) Now your right foot. (Pause)

Move slowly up to your ankles. Your calves. Your knees. (Pause) The backs of your thighs. The fronts of your thighs. Your hips and pelvis. Feel the weight of your pelvis sinking into the surface below you. (Pause)

Your belly. Watch it rise and fall with your breath. No need to control it. Just witness this gentle ocean inside you. (Pause)

Your chest, your ribs. Your lower back, middle back, upper back. Your entire spine, from tailbone to the base of your skull. (Pause)

Your left hand – fingers, palm, wrist, forearm, elbow, upper arm, shoulder. Your right hand – the same journey. (Pause)

Your neck and throat. Your jaw – if it's clenched, let it soften. Your cheeks, your eyes, your forehead. The crown of your head. (Long pause – 2 minutes)

Now expand your awareness to your whole body, as if you are floating in warm water. Every cell breathing. You are here, whole, and enough. (Pause)

When you're ready, slowly deepen your breath and bring movement back to your fingers and toes. Open your eyes when you feel complete.`
  },
  {
    id: "med-003",
    title: "Loving‑Kindness",
    category: "meditation",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Sit comfortably. Close your eyes. Place one hand on your heart. Feel its warmth.

Repeat these phrases silently, softly, without forcing any feeling. Just offering the words.

May I be safe. May I be happy. May I be healthy. May I live with ease. (Pause)

Now bring to mind someone you love – a child, a partner, a friend. See them in your heart. Repeat: May you be safe. May you be happy. May you be healthy. May you live with ease. (Pause)

Now bring to mind someone neutral – a neighbour, a stranger you saw yesterday. Repeat the same phrases: May you be safe. May you be happy. May you be healthy. May you live with ease. (Pause)

Now bring to mind someone with whom you have difficulty. This may be hard. Start with a small wish: May you be safe. That's enough. (Pause)

Finally, expand to all beings everywhere. May all beings be safe. May all beings be happy. May all beings be healthy. May all beings live with ease. (Long pause – 2 minutes)

Return to yourself. One hand on your heart. You have offered kindness. Now receive it.`
  },
  {
    id: "med-004",
    title: "Nature Visualisation",
    category: "meditation",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Imagine you are standing at the edge of an ancient forest. The air is cool and soft. You can smell damp earth and pine needles.

Take a step onto a path. The soil is springy beneath your feet. As you walk, you hear leaves rustling, birdsong, the distant murmur of a stream. (Pause)

You come to a clearing. In the centre is a large, smooth stone – warm from the sun. You sit down on it. Feel its warmth seeping into your body.

Above you, the sky is a pale, soft blue with clouds drifting slowly. You watch one cloud. It has no destination. It just drifts, changing shape, letting go. (Pause)

You realise you are like that cloud. You can let go of plans, worries, the need to be anywhere else. Just for now, you are here, held by the clearing, the stone, the sky.

A small stream trickles nearby. Its sound is like a lullaby. It says: This moment is enough. You are enough. (Long pause – 3 minutes)

When you're ready, slowly walk back along the path. Bring the peace of the forest with you. Open your eyes.`
  },
  {
    id: "med-005",
    title: "Anxiety Release",
    category: "meditation",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Find a comfortable seat. Close your eyes. Place both hands on your lower belly.

Anxiety is just energy in the body – tightness in the chest, fluttering in the stomach, a busy mind. None of it is dangerous. It is simply your nervous system trying to protect you.

Breathe into your hands. As you inhale, imagine you are breathing right into the centre of the anxiety. As you exhale, imagine it softening, loosening, like a clenched fist slowly opening. (Pause)

Now, name the feeling without judgment. Say silently: "This is anxiety." That small act of naming creates space between you and the sensation. You are not the anxiety. You are the one noticing it. (Pause)

Imagine the anxiety as a small, dark cloud inside your chest. With each exhale, see the cloud dissolving, becoming lighter, thinner, until it is just a faint wisp. (Pause)

Now bring your attention to something neutral – the feeling of your feet on the floor, the weight of your body on the chair. Anchor yourself there. The anxiety may still be present, but it is in the background. You are in the foreground. (Long pause – 2 minutes)

Take a breath. You are safe. Your body knows how to return to calm. Trust it.`
  },
  {
    id: "med-006",
    title: "Gratitude",
    category: "meditation",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Close your eyes. Bring your attention to your heart. Imagine a small, warm light glowing there.

Think of one thing you are grateful for today. It can be very small – a warm cup of tea, a kind word, the sun on your skin. Let the feeling of that gratitude expand the light in your heart. (Pause)

Now think of one person who has helped you, even in a tiny way. See their face. Silently say: Thank you. (Pause)

Now think of your own body. Thank your heart for beating, your lungs for breathing, your legs for carrying you. (Pause)

Gratitude is not about ignoring difficulty. It is about remembering that even on hard days, there are small treasures. Let the light in your heart grow until it fills your whole chest, your whole body. (Long pause – 2 minutes)

When you're ready, open your eyes. Carry this grateful heart with you.`
  },
  {
    id: "med-007",
    title: "Acceptance",
    category: "meditation",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Sit quietly. Close your eyes. Bring to mind something in your life that is difficult to accept – a loss, a limitation, a situation you cannot change.

Do not try to fix it or push it away. Simply let it be present, like a stone resting on the ground in front of you. (Pause)

Now, place one hand on your heart. Say silently: "This is hard. I am allowed to feel this." (Pause)

Acceptance is not giving up. It is the courage to say: "This is what is true right now." From that honest place, you can choose your next step.

Imagine the stone softening, transforming into a smooth, cool river stone. You can hold it without effort. It is not a burden – it is simply part of the landscape. (Long pause – 2 minutes)

Now breathe into the area of your body where you feel resistance – maybe your chest, your throat, your jaw. On the exhale, let that resistance loosen, just a little. Not forcing. Just allowing. (Pause)

You are not your difficulties. You are the sky that holds the clouds, the riverbed that holds the stones. Open your eyes when you feel ready.`
  },
  {
    id: "med-008",
    title: "Forgiveness",
    category: "meditation",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Find a comfortable position. Close your eyes. Take a few deep breaths.

Forgiveness is not about condoning what happened. It is about releasing the heavy weight you have been carrying. A weight that hurts only you.

Bring to mind someone you need to forgive. See their face. Say silently: "I am ready to let go of the anger, even if only a little." (Pause)

Now, bring to mind yourself. What do you need to forgive yourself for? A mistake, a harsh word, a missed opportunity. Place one hand on your heart. Say: "I forgive myself. I was doing the best I could." (Pause)

Imagine the weight as a large stone in your hands. Slowly, you set it down on the ground. You do not have to carry it anymore. (Long pause – 2 minutes)

The space where the stone was now feels lighter. You can breathe more freely. Forgiveness is not forgetting – it is choosing to travel lighter.

Take a breath. You have begun. That is enough. Open your eyes when you're ready.`
  },

  // ============================================================
  // SOMATIC PRACTICES (4)
  // ============================================================
  {
    id: "som-001",
    title: "Body Sensing",
    category: "somatic",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Wherever you are, pause. Notice the surface beneath you. Place your feet flat on the floor. Close your eyes.

Bring your attention to your left hand. Don't move it – just sense it from the inside. Can you feel the aliveness there? The subtle pulse? (Pause) Now your right hand. (Pause)

Move to your left foot. Sense the arch, the heel, the toes. No movement, just attention. (Pause) Your right foot. (Pause)

Now notice any area of tension or discomfort in your body. Do not try to change it. Just acknowledge it. Say silently: "I feel you there." (Pause)

Somatic practice is about befriending your body's messages. Every sensation is a communication. You don't have to fix it – just listen.

Take a breath and imagine breathing right into that area. On the exhale, imagine it softening, like a tight muscle slowly releasing. (Long pause – 2 minutes)

Now expand your awareness to your whole body. Feel the container of your skin. You are whole. You are here. When you're ready, open your eyes.`
  },
  {
    id: "som-002",
    title: "Somatic Tracking",
    category: "somatic",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Sit or lie down. Close your eyes. Bring your attention to a place in your body that feels uncomfortable – a knot, an ache, a tightness.

Instead of trying to get rid of it, become curious. What shape is it? Is it hard or soft? Does it have a colour? (Pause)

Now, notice what happens to the sensation when you breathe into it. Does it shift? Does it move? Just observe without judgment. (Pause)

Somatic tracking means staying with the sensation without the story. The story says: "This pain means I'm broken." The sensation is just sensation. Separate the two.

If the sensation changes – becomes smaller, larger, moves – just note it. You are not controlling it. You are a kind witness. (Long pause – 2 minutes)

Now, bring your attention to a neutral part of your body – your left hand, your right foot. Notice the difference between the sensation and the neutral area. Both are simply experiences. (Pause)

Open your eyes when you're ready. You have learned that you can be with discomfort without being overwhelmed.`
  },
  {
    id: "som-003",
    title: "Pendulation",
    category: "somatic",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Lie down comfortably. Close your eyes. Pendulation is the gentle movement between areas of ease and areas of tension.

First, find a place in your body that feels neutral or pleasant – maybe your left hand, your right foot, your belly when you breathe. Rest your attention there. Notice the quality of ease. (Pause)

Now, gently bring your attention to an area of tension or discomfort. Just for a moment. Notice what it feels like. Then, return to the area of ease. (Pause)

Move back and forth like a pendulum. Tension area… ease area. Tension… ease. Each time you return to ease, stay a little longer. (Pause for 1 minute)

Notice that the tension may start to release, not because you forced it, but because your nervous system learns that safety is available. (Long pause – 2 minutes)

Rest now in the area of ease. Let it spread. When you're ready, open your eyes.`
  },
  {
    id: "som-004",
    title: "Orienting",
    category: "somatic",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Sit upright. Keep your eyes open for this practice. Orienting is a natural survival response – looking around to notice safety.

Slowly, turn your head to the left. Notice what you see. The wall, a window, a plant. Just notice – no judgment. (Pause) Return to centre.

Slowly, turn your head to the right. Notice what you see. (Pause) Return to centre.

Look up. Notice the ceiling, the light. (Pause) Look down. Notice the floor, your feet. (Pause)

Now, listen. What sounds do you hear? A distant car, the hum of a fridge, your own breath. (Pause)

Orienting tells your nervous system: "I know where I am. I am safe here." (Pause)

Take a breath. Look around one more time, slowly. Notice one thing that brings you a small sense of peace – a colour, a shape, a shadow. Let that be your anchor.`
  },

  // ============================================================
  // BREATHWORK (6)
  // ============================================================
  {
    id: "bre-001",
    title: "Box Breath",
    category: "breathwork",
    durationMinutes: 5,
    targetWordCount: 650,
    script: `Find a comfortable seat. Close your eyes. We will breathe in a square: inhale, hold, exhale, hold – all for 4 counts each.

Inhale… 2… 3… 4. Hold… 2… 3… 4. Exhale… 2… 3… 4. Hold… 2… 3… 4.

Continue this rhythm. (Pause for 4 rounds, speaking counts softly)

Notice how your mind steadies. The box gives you a container. Nothing else matters right now.

One more round. Inhale… hold… exhale… hold… (Pause)

Let your breath return to normal. Notice the calm. Open your eyes when ready.`
  },
  {
    id: "bre-002",
    title: "4‑7‑8 Breath",
    category: "breathwork",
    durationMinutes: 8,
    targetWordCount: 1000,
    script: `Lie down or sit back. Close your eyes. This breath is a natural sedative. Inhale for 4 counts, hold for 7, exhale for 8.

Inhale… 2… 3… 4. Hold… 2… 3… 4… 5… 6… 7. Exhale… 2… 3… 4… 5… 6… 7… 8.

Continue for 8 rounds. The long exhale activates your rest‑and‑digest system. (Pause, counting softly through rounds)

You may feel your heart rate slowing, your body sinking. That is the breath working.

After the last round, rest in natural breath for a minute. (Pause)

When you're ready, open your eyes. You have just recalibrated your nervous system.`
  },
  {
    id: "bre-003",
    title: "Extended Exhale",
    category: "breathwork",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Sit comfortably. Close your eyes. Inhale for 4 counts, exhale for 6 counts.

Inhale… 2… 3… 4. Exhale… 2… 3… 4… 5… 6. (Pause)

The longer exhale signals safety. You are telling your body: "There is no danger. You can rest."

Continue for 10 minutes. (Long guided pause, with occasional reminders to keep the rhythm – soft counts every 30 seconds)

If you lose the count, just start again. There is no perfect breath, only your breath.

In the last minute, let the count go. Just breathe naturally. Notice the afterglow of calm. Open your eyes slowly.`
  },
  {
    id: "bre-004",
    title: "Alternate Nostril",
    category: "breathwork",
    durationMinutes: 8,
    targetWordCount: 1000,
    script: `Sit upright. Use your right thumb to close your right nostril. Inhale through left nostril for 4 counts. Close left nostril with ring finger, release right, exhale through right for 4 counts. Inhale right, switch, exhale left. Continue.

Left in… switch, right out… right in… switch, left out… (Pause, guide through several cycles)

This breath balances the left and right hemispheres of the brain. It brings clarity and calm.

Continue for the rest of the practice. (Soft guidance every 30 seconds)

When finished, rest both hands on your knees and breathe naturally. Notice the evenness, the quiet. Open your eyes.`
  },
  {
    id: "bre-005",
    title: "Coherent Breathing",
    category: "breathwork",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Lie down. Close your eyes. Coherent breathing is 5 breaths per minute – inhale 5 seconds, exhale 5 seconds.

We will count: Inhale… 2… 3… 4… 5. Exhale… 2… 3… 4… 5. (Pause, repeat)

This rhythm maximises heart rate variability – the sign of a resilient nervous system.

Let the breath be soft, not forced. (Continue for 10 minutes with occasional count reminders)

At the end, let your breath return to its own rhythm. Rest in silence for a minute. You have tuned your body like an instrument.`
  },
  {
    id: "bre-006",
    title: "Gentle Breath of Fire",
    category: "breathwork",
    durationMinutes: 5,
    targetWordCount: 650,
    script: `Sit upright. Close your eyes. Breath of fire is short, rhythmic exhales through the nose, with passive inhales. Start slow: sniff, sniff, sniff – like a gentle pant.

Let your belly pulse with each exhale. Not forceful – just lively. (Pause, guide for 2 minutes)

Now reduce to normal breathing. Notice the tingling, the alertness. This breath energises without adrenaline.

One more minute of gentle fire, then rest. (Pause)

Open your eyes. You are awake and calm.`
  },

  // ============================================================
  // SLEEP / YOGA NIDRA (6)
  // ============================================================
  {
    id: "slp-001",
    title: "10‑Minute Power Nap",
    category: "sleep",
    durationMinutes: 10,
    targetWordCount: 1200,
    script: `Lie down comfortably. Set an intention to rest for 10 minutes without falling deeply asleep. Close your eyes.

Bring your awareness to your breath. Just watch it. (Pause 1 minute)

Now, scan your body quickly: feet… calves… thighs… belly… chest… hands… arms… shoulders… neck… face. Release any tension you notice. (Pause 2 minutes)

Imagine you are lying on a soft cloud. The cloud holds you completely. You are safe. (Pause 3 minutes)

If thoughts come, let them float by like clouds. You are not your thoughts. (Pause 3 minutes)

Now, gently deepen your breath. Wiggle your fingers and toes. Open your eyes slowly. You are rested and refreshed.`
  },
  {
    id: "slp-002",
    title: "30‑Minute Yoga Nidra",
    category: "sleep",
    durationMinutes: 30,
    targetWordCount: 3800,
    script: `Lie down on your back, arms slightly away from your sides, palms up. Cover yourself with a blanket. Close your eyes.

Set an intention: a short, positive statement in present tense. "I am whole." "I am at peace." Repeat it silently three times. (Pause)

We will rotate awareness through the body. Right thumb, index, middle, ring, little finger. Right palm, back of hand, wrist, forearm, elbow, upper arm, shoulder. (Pause)

Left thumb, fingers, palm, wrist, forearm, elbow, upper arm, shoulder. (Pause)

Right big toe, second, third, fourth, little toe. Right foot – sole, arch, heel, ankle, calf, knee, thigh, hip. (Pause)

Left big toe through to left hip. (Pause)

Pelvis, lower back, belly, chest, collarbones. (Pause)

Throat, jaw, tongue, cheeks, nose, eyes, forehead, crown of head. (Pause)

Now, bring awareness to the breath. Not controlling it, just witnessing. (Pause 3 minutes)

Now, bring to mind your intention again. Repeat it silently. (Pause 2 minutes)

Now, opposite sensations: heavy/light, hot/cold, pain/pleasure. Just notice. (Pause 3 minutes)

Now, visualise a calm lake. The surface is still. You are the lake. (Pause 5 minutes)

Now, begin to return. Feel the weight of your body. The blanket. The floor. (Pause)

Wiggle your fingers and toes. Roll to your side. When you are ready, slowly sit up. You have rested deeply.`
  },
  {
    id: "slp-003",
    title: "Sleep Induction",
    category: "sleep",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `In bed, lying on your back or side. Close your eyes. Let your breath soften.

Imagine you are walking down a staircase. Ten steps. With each breath, you go down one step. Breathe in… step ten. Breathe out… step nine. Continue down to one. (Pause, slow counting)

At the bottom of the stairs is a cosy room. There is a fireplace glowing softly. A comfortable bed. You lie down on it.

The warmth spreads through your body. Your legs are heavy… your arms are heavy… your eyelids are heavy. (Pause)

Now imagine a gentle wave of sleep starting at your head and washing slowly down to your feet. Let it take you. (Long pause – 5 minutes)

If you are still awake, that's fine. Resting is healing. Keep breathing softly. Let go of the need to fall asleep. That very letting go often invites sleep in. (Pause)

Goodnight. Sleep deeply.`
  },
  {
    id: "slp-004",
    title: "Waking Up Rested",
    category: "sleep",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `This practice is for the morning or after a nap. Lie down or sit up. Close your eyes.

Take three deep breaths. With each exhale, feel your body wake up a little more.

Bring awareness to your feet. Wiggle your toes. Feel the energy flowing. (Pause)

Move up to your legs. Stretch them gently. Your calves, your thighs. (Pause)

Your belly. Let it be soft. (Pause)

Your chest. Expand it with a breath. (Pause)

Your arms. Stretch them over your head. Your fingers. (Pause)

Your neck and face. Yawn if you need to. (Pause)

Now, sit up slowly. Open your eyes. You are awake, refreshed, ready.`
  },
  {
    id: "slp-005",
    title: "Insomnia Release",
    category: "sleep",
    durationMinutes: 20,
    targetWordCount: 2500,
    script: `In bed, on your back. Close your eyes. Do not try to fall asleep. Instead, give yourself permission to simply rest.

Insomnia often comes from trying too hard. Tonight, you release the effort.

Bring to mind the phrase: "I am resting. Sleep may come or not. Both are fine." (Pause)

Now, scan your body for any restlessness. Instead of fighting it, invite it to be there. Let it dance. You are the spacious sky; the restlessness is just weather. (Pause 3 minutes)

Now, imagine your breath is a gentle tide. Inhale, the tide comes in. Exhale, the tide goes out. There is no goal, just rhythm. (Pause 5 minutes)

If your mind spins, let it spin. Do not engage. Just watch the thoughts as if they were leaves on a stream. (Pause 5 minutes)

Now, return to the tide breath. Let it carry you. (Long pause – 5 minutes)

You are resting deeply. That is enough.`
  },
  {
    id: "slp-006",
    title: "Dream Incubation",
    category: "sleep",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Before sleep, lie down. Close your eyes. Set an intention to remember your dreams.

Ask yourself a question silently: "What do I need to know?" Or "Show me a symbol of healing." Repeat it three times. (Pause)

Now, visualise a door. Behind it is your dream world. As you drift off, you will walk through that door. Your dreams will speak to you. (Pause)

Keep a journal by your bed. When you wake, write down anything you remember – even a colour, a feeling, a word.

Now let go. Sleep gently. The dreams will come.`
  },

  // ============================================================
  // HYPNOSIS (10) – expanded to ~5000 characters
  // ============================================================
  {
    id: "hyp-001",
    title: "Weight Release",
    category: "hypnosis",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `Close your eyes. Take a deep breath, filling your lungs completely. And as you exhale, let your body begin to soften. Allow your shoulders to drop, your jaw to relax, your hands to feel heavy. With each breath, you are sinking deeper into a state of calm, focused awareness. (Pause)

Imagine that you are sitting in the driver's seat of a beautiful, brand‑new car. This car is your body. It is sleek, powerful, perfectly designed for the journey of your life. Look at the fuel gauge. Right now, it points to "overfull" – fuel spilling out, weighing the car down, making every turn feel heavy. This extra fuel is the weight you carry – the food eaten beyond hunger, the habits that no longer serve you. (Pause)

But you are the driver. You are in control. You decide when to fill the tank. You decide what kind of fuel to use. And you decide to stop when the tank is full – not a drop more. (Pause)

Now, see yourself driving this car. You pull up to a beautiful, clean filling station. You insert the nozzle only when the tank truly needs fuel – when your body sends a genuine signal of hunger. You fill it slowly, mindfully, with premium fuel – nourishing, whole foods that burn cleanly and give you energy. And when the pump clicks off, you stop. You do not top up. You do not spill. (Pause)

Watch the fuel gauge. It begins to drop – not because you are depriving yourself, but because you are using fuel efficiently, moving through your day with purpose. The car becomes lighter. The steering feels easier. You can feel the breeze through the windows. (Long pause – 30 seconds)

Your subconscious mind is now learning a new pattern: food is fuel, not comfort. Full is enough. Cravings are just signals, not commands. Every time you feel the urge to eat when you are not hungry, you will see that overfull gauge, and you will pause. You will drink a glass of water, take a walk, or simply breathe. The urge will pass like a cloud, and you will feel a quiet pride in your choice. (Pause)

Over the coming days and weeks, you will notice yourself eating more slowly, stopping earlier, and feeling satisfied with less. The weight will begin to release – not through struggle, but through a natural, effortless recalibration. Your body knows its ideal weight. It is simply waiting for you to stop overfilling the tank. (Pause)

Now, take a final deep breath. Feel the lightness of the car, the freedom of the open road. You are in control. You are enough. On the count of three, you will return to full waking awareness, feeling refreshed and confident. One… drifting up. Two… feeling energy returning to your fingers and toes. Three… eyes open, alert, and at peace.`
  },
  {
    id: "hyp-002",
    title: "Anxiety Release",
    category: "hypnosis",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Take a slow, deep breath. With each exhale, allow a wave of relaxation to flow from the top of your head down to the tips of your toes. Your body knows how to rest. You are simply giving it permission. (Pause)

Now, imagine a high mountain lake. The water is perfectly still, reflecting the deep blue sky and the white clouds like a mirror. This is your mind when you are at peace – vast, clear, and undisturbed. (Pause)

A small pebble drops into the centre of the lake. Ripples spread outward – circles of energy, of emotion. This is anxiety. The water becomes choppy, turbulent, and you can no longer see your reflection clearly. (Pause)

But here is the secret: the pebble is just a pebble. It is small. The ripples are just movement on the surface. Deep down, in the darkness of the depths, the water has always been still. (Long pause – 30 seconds)

You are the lake. The anxiety is only the surface. The real you – your core, your essence – remains calm and untouched. (Pause)

Every time you feel anxiety rising, you will see that pebble, and you will remember: "This is just a ripple. I am the lake." You will take a breath, and you will watch the ripples without becoming them. The more you practice this, the faster the water will settle. (Pause)

Your subconscious mind is now learning to separate sensation from story. The tightness in your chest, the racing thoughts – these are just ripples. They cannot harm you. They will pass. And you will remain. (Long pause – 1 minute)

Now, see the lake becoming calm again. The last ripples fade. The surface is glass. You see the reflection of a starry night sky – peaceful, infinite, safe. (Pause)

You will carry this image with you. When anxiety whispers, you will smile inwardly and say: "Thank you for trying to protect me. But I am safe. I am the lake." (Pause)

On the count of three, you will return to full awareness, feeling calm and centred. One… breathing in peace. Two… breathing out any last tension. Three… eyes open, peaceful and present.`
  },
  {
    id: "hyp-003",
    title: "Confidence",
    category: "hypnosis",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Take a deep breath, and as you exhale, let your body sink into a state of deep comfort. Your mind can drift where it wishes, knowing that you are safe and in control. (Pause)

Imagine a young tree, still thin, growing in the shadow of larger trees. The sunlight is blocked. The seedling struggles, reaching upward but finding only shade. This tree is your confidence – it has always been there, but it has been overshadowed by old doubts, criticism, or fear. (Pause)

Now, see the larger trees gently move aside. A beam of warm, golden sunlight breaks through. It touches the young tree's leaves. The tree shivers with new energy. It begins to grow – rapidly, joyfully. Its trunk thickens. Branches stretch outward. Leaves become lush and green. (Pause)

You are that tree. You have always had the potential for confidence. The only thing missing was light. Now you see it: your skills, your worth, your voice. They were never absent – just waiting for the right conditions. (Pause)

From this moment on, you will stand taller. Your spine lengthens, your shoulders relax back, your chin lifts gently. When you speak, your voice will feel steady. When you walk into a room, you will know that you belong there. (Pause)

When doubt arises – and it will – you will remember the tree. You will take a breath, and you will imagine that golden sunlight pouring over you, warming your chest, filling you with quiet certainty. The doubt will soften, like a cloud passing before the sun. (Long pause – 1 minute)

Your subconscious mind is now installing a new belief: "I am capable. I am worthy. I have something to offer." Every night as you sleep, this belief will grow deeper roots. Every morning, you will wake a little more confident. (Pause)

On the count of three, you will return to full awareness, feeling rooted and strong. One… feeling your feet on the ground. Two… a gentle energy rising up your spine. Three… eyes open, confident and calm.`
  },
  {
    id: "hyp-004",
    title: "Procrastination",
    category: "hypnosis",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Take a slow, deep breath. With each exhale, let your mind drift into a comfortable, focused state. You are safe, and you are in control. (Pause)

Imagine you are standing at the bottom of a gentle hill. At the top of the hill is a task you have been avoiding – a project, a conversation, a chore. The hill looks steep, almost impossible. But here is the truth: the steepness is an illusion created by your mind. (Pause)

Now, see a small cart beside you. In the cart is the task – not the whole overwhelming thing, just the very first small step. Opening the document. Making the phone call. Writing the first sentence. (Pause)

You place your hands on the cart. You take a breath. And you give it a gentle push. The wheels turn easily – much more easily than you expected. With each small push, the cart gets lighter. The hill seems less steep. (Pause)

Your subconscious mind now knows: action dissolves resistance. The fear of starting is far worse than the doing. Once you begin, momentum carries you. (Pause)

From now on, whenever you feel the urge to delay, you will count down from five. Five… four… three… two… one. On one, you will take one tiny, manageable step. That step – no matter how small – will unlock the rest. (Long pause – 1 minute)

You will also notice that your perfectionism softens. You give yourself permission to do something badly, just to get it done. Done is better than perfect. And each small win builds your confidence to take the next step. (Pause)

On the count of three, you will return to full awareness, feeling motivated and capable. One… energy returning to your hands. Two… a sense of readiness. Three… eyes open, ready to begin.`
  },
  {
    id: "hyp-005",
    title: "Public Speaking",
    category: "hypnosis",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `Close your eyes. Take a deep, slow breath. Feel your body becoming heavy and relaxed, as if you are sinking into a warm, comfortable cloud. (Pause)

Now imagine you are standing on a stage. The lights are warm, not harsh – a soft, golden glow. The audience is friendly, curious. They want you to succeed. They are not judges; they are fellow humans who have also felt nervous. (Pause)

See a golden cord extending from your heart to each person in the audience. This cord carries your intention, your truth, your warmth. You are not speaking to strangers – you are speaking to friends. (Pause)

Your voice is steady. Your breath is calm. You know your material deeply. But even if you forget a word or stumble, it does not matter. Mistakes are human moments – they make you relatable, real. The audience respects you more for your authenticity. (Pause)

Your subconscious mind now knows: the physical sensations of nervousness – the racing heart, the dry mouth – are not signs of danger. They are simply your body preparing to do something important. You can reinterpret them as excitement, as energy. (Long pause – 1 minute)

From now on, before any presentation, you will take three slow breaths. You will place one hand on your heart and feel the golden cord. You will smile – even a small smile – and you will begin. The first few words may feel shaky, but after ten seconds, you will find your rhythm. (Pause)

You will also remember that the audience is on your side. They want you to succeed because your success helps them. You are giving a gift. (Pause)

On the count of three, you will return to full awareness, feeling calm and capable. One… feeling the ground beneath you. Two… a sense of quiet confidence. Three… eyes open, ready to speak.`
  },
  {
    id: "hyp-006",
    title: "Deep Sleep",
    category: "hypnosis",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `Lie down in your bed, close your eyes, and take a deep breath. As you exhale, feel the day releasing from your shoulders, your jaw, your hands. You are safe. You are allowed to rest. (Pause)

Now imagine a heavy, warm blanket being placed over your body. It starts at your feet – a gentle weight that says "relax". It moves up to your calves, your thighs, your belly, your chest, your shoulders. So heavy. So warm. So comforting. (Pause)

You are now standing at the top of a staircase. This staircase leads down to deep, restorative sleep. There are ten steps. With each step you take, you will drift deeper into relaxation. (Pause)

Step ten… breathing in comfort, breathing out the day. (Pause) Step nine… feeling your eyelids becoming heavier. (Pause) Step eight… the sounds of the room fading away. (Pause) Step seven… your muscles softening, as if melting. (Pause) Step six… any remaining thoughts dissolving like clouds. (Pause) Step five… halfway now, deeply relaxed. (Pause) Step four… your breath is slow, rhythmic, peaceful. (Pause) Step three… you let go of the need to stay awake. (Pause) Step two… almost at the bottom, almost asleep. (Pause) Step one… you step off the staircase into a quiet, dimly lit room. There is a soft bed waiting for you. (Long pause – 30 seconds)

You lie down on this bed. A gentle, rhythmic sound – like ocean waves or a soft heartbeat – fills the room. Your subconscious mind now knows: when your head touches your pillow, sleep will come easily. You do not need to try. Trying only wakes you up. Instead, you simply allow. (Pause)

You may not even remember falling asleep. That is a sign of deep, natural sleep. And when you wake tomorrow, you will feel refreshed, clear-headed, and energised. (Long pause – 2 minutes)

For now, sleep. Deeply. Peacefully. The night is long, and you are safe.`
  },
  {
    id: "hyp-007",
    title: "Pain Management",
    category: "hypnosis",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Take a deep breath, and as you exhale, let your body sink into a comfortable position. Allow your mind to become quiet, like a still pond after a breeze has passed. (Pause)

Now, bring your awareness to the area of discomfort. Do not resist it. Simply acknowledge it. And then imagine a dimmer switch – the kind you might have on a light. Slowly, gently, turn the volume of the pain down. Not off – just lower. From an eight to a six. From a six to a four. (Pause)

Now, imagine a cool, blue light – the colour of a clear mountain stream – flowing into that area. It soothes, numbs, calms. The sensation may still be there, but its quality changes. It becomes less sharp, more diffuse. (Pause)

Your subconscious mind can separate sensation from suffering. The sensation may remain, but the suffering – the fear, the resistance, the "I can't stand this" – that can dissolve. (Pause)

Every time you feel pain, you will breathe into it, and on the exhale, you will imagine the dimmer switch turning down one notch. You are in control. The pain does not control you. (Long pause – 1 minute)

You may also visualise sending the pain to a specific place – a box in the corner of the room, a river carrying it away, a sky where it dissolves like a cloud. Or you can imagine that the painful area is surrounded by a soft, protective gauze, filtering the intensity. (Pause)

You are not denying the pain. You are befriending it, learning its language, and teaching it to speak more softly. (Long pause – 1 minute)

On the count of three, you will return to full awareness, carrying this sense of control and calm. One… feeling the ground beneath you. Two… a wave of comfort washing through you. Three… eyes open, at ease.`
  },
  {
    id: "hyp-008",
    title: "Habit Change",
    category: "hypnosis",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `Close your eyes. Take a deep breath, and feel your body relaxing with each exhale. You are in a safe, quiet place, and you have complete control over your mind. (Pause)

Imagine you are holding an object in your hands. It is the habit you wish to change – a cigarette, a vape, a sweet, a bottle. Now, see that object transform into a heavy, grey rock. It is not a rock of shame; it is simply rock of no longer needed weight. (Pause)

Feel its heaviness. Your arms tire from holding it. Your shoulders ache. This rock has been with you for a long time, but it does not serve you anymore. (Pause)

Now, slowly, you place the rock on the ground in front of you. You straighten your back. You take a step away. Then another. The further you walk, the lighter you feel. (Long pause – 30 seconds)

Your lungs expand more easily. Your skin feels clearer. Your energy rises. You did not lose something valuable; you released a burden. (Pause)

Your subconscious mind now associates the habit with the rock – heavy, grey, limiting. And associates freedom with lightness, breath, life. (Pause)

When a craving arises – and it will – you will see the rock in your mind's eye. You will say, "I do not pick up that rock anymore." You will take three slow breaths, and the craving will begin to fade. After three minutes, it will dissolve completely. You are stronger than any craving. (Long pause – 1 minute)

You may also notice that you replace the habit with something healthier – a glass of cold water, a stretch, a few minutes of deep breathing. Your subconscious mind is creative. It will find new, satisfying ways to meet your underlying needs. (Pause)

On the count of three, you will return to full awareness, feeling free and empowered. One… feeling the lightness in your chest. Two… a sense of accomplishment. Three… eyes open, free.`
  },
  {
    id: "hyp-009",
    title: "Inner Child",
    category: "hypnosis",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `Close your eyes. Take a deep, nurturing breath. With each exhale, let your body relax more deeply. You are safe. You are here, now, as an adult with resources and strength. (Pause)

Now, imagine you are walking through a beautiful, peaceful meadow. The grass is soft under your feet. The sky is a gentle blue. You hear birdsong and the whisper of a breeze. (Pause)

In the distance, you see a child playing alone. The child looks up, and you recognise them. It is you, at a young age. The child's eyes hold a mix of curiosity and longing – perhaps a little sadness, a little loneliness. (Pause)

You walk toward the child. You kneel down so you are at eye level. You smile gently. The child is hesitant, but you radiate warmth and safety. (Pause)

You say, "I see you. I have always seen you, even when no one else did. I am here now. You are safe." The child's shoulders relax. They step closer. (Pause)

You open your arms. The child steps into your embrace. You hold them – not as a burden, but as a precious, beloved part of yourself. You say, "I will never abandon you again. I will protect you. I will listen to you." (Long pause – 1 minute)

You feel the child's tension melting. They rest their head on your shoulder. You stroke their hair. This is the love they always needed – and you are the one who can give it. (Pause)

From now on, when you feel fear, shame, or loneliness, you will remember this inner child. You will place a hand on your heart and silently say, "I am here. You are safe." You will become the loving adult you always needed. (Long pause – 1 minute)

Now, you walk back across the meadow, holding the child's hand. They look up at you with trust. You carry them – not as a weight, but as a precious companion. (Pause)

On the count of three, you will return to full awareness, feeling whole and self-compassionate. One… feeling the warmth in your chest. Two… a sense of deep healing. Three… eyes open, at peace.`
  },
  {
    id: "hyp-010",
    title: "Abundance",
    category: "hypnosis",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Take a deep, expansive breath. Imagine that you are breathing in possibility, breathing out limitation. With each exhale, your body becomes more relaxed, your mind more open. (Pause)

Now, imagine a river. At first, the river is narrow, blocked by rocks of scarcity thinking – "I don't deserve", "There's not enough", "Money is hard to get". The water struggles to flow. (Pause)

You walk to the river. You see the rocks. One by one, you lift them out. Each rock you remove is a belief you are ready to release. (Pause)

The river widens. Water flows freely, joyfully. It sparkles in the sunlight. This river is abundance – money, love, opportunities, creativity. It is already flowing. Your only job is to remove the blocks. (Long pause – 1 minute)

Your subconscious mind now knows: there is enough. You are worthy of receiving. Opportunities will appear – sometimes in unexpected ways. You will say yes more often. You will trust that the river knows the way. (Pause)

Every morning, you will say to yourself: "I am open to abundance." You will see the river flowing, and you will take one small action toward your goals – sending an email, making a call, opening a savings account. That action is like removing another rock. (Pause)

Abundance is not about hoarding; it is about allowing. The river flows through you, not to you. You are a channel. What you receive, you can also give. (Long pause – 1 minute)

On the count of three, you will return to full awareness, feeling expansive and open. One… feeling the flow of energy around you. Two… a sense of trust. Three… eyes open, abundant.`
  },

  // ============================================================
  // COUPLES (8)
  // ============================================================
  {
    id: "cpl-001",
    title: "Active Listening",
    category: "couples",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Sit facing your partner, or side by side. Close your eyes. Place one hand on your heart. Feel your own breath.

Now, imagine your partner's words as soft ribbons floating toward you. Your job is not to respond, not to fix – just to receive. (Pause)

Whenever you listen, you will take a breath before speaking. That breath creates space. You will repeat back what you heard: "What I hear you saying is…" (Pause)

Listening is the greatest gift. Today, practice listening without planning your reply. Just be present. (Pause)

When you're ready, open your eyes and try it with a low‑stakes topic.`
  },
  {
    id: "cpl-002",
    title: "Gentle Apology",
    category: "couples",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Sit quietly. Bring to mind a recent moment when you hurt your partner – even in a small way. Notice any tightness in your body.

An apology has three parts: "I did X. I see it hurt you. I am sorry." And then: "Next time I will do Y." (Pause)

Practice now, silently. Say to your partner in your mind: "I am sorry for…" (Pause) "I will…" (Pause)

If you feel resistance, it is okay. Apology is vulnerable. But it is also the fastest path to repair. (Pause)

When you're ready, share this apology aloud with your partner. Not in the middle of a fight – at a calm moment.`
  },
  {
    id: "cpl-003",
    title: "Forgiveness",
    category: "couples",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Bring to mind a hurt you are holding against your partner. See it as a heavy stone in your hands.

Forgiveness is not saying what happened was okay. It is saying: "I will not carry this stone anymore." (Pause)

Slowly, place the stone on the ground. Feel the relief in your hands, your shoulders, your chest. (Pause)

Now, see your partner's face. Say silently: "I release the resentment. I am ready to move forward." (Pause)

You may need to repeat this practice many times. Each time, the stone gets lighter. That is the work of love.`
  },
  {
    id: "cpl-004",
    title: "Rekindling Desire",
    category: "couples",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Sit together. Close your eyes. Bring to mind a memory of when you first felt attracted to your partner. The feeling, not the story. (Pause)

Desire is not something you can force. But you can create conditions for it: safety, playfulness, touch without agenda. (Pause)

Imagine a small flame between you. Every kind word, every gentle touch, every moment of laughter adds fuel. The flame grows. (Pause)

Today, do one small thing to add fuel: a hand on the shoulder, a note, a compliment. No pressure. Just connection.`
  },
  {
    id: "cpl-005",
    title: "Conflict Resolution",
    category: "couples",
    durationMinutes: 15,
    targetWordCount: 1900,
    script: `When a conflict arises, take a pause. Step away for 20 minutes if needed. Then sit facing each other. This practice will help.

One person speaks for two minutes – only "I" statements. "I felt… when… I need…" The other listens without interrupting. (Pause)

Then, the listener repeats back: "What I heard you say is… Did I get it?" (Pause)

Then switch roles. No problem is solved in one conversation. But understanding grows. (Pause)

Use this practice for your next disagreement. It will change everything.`
  },
  {
    id: "cpl-006",
    title: "Shared Dreams",
    category: "couples",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Close your eyes together. Imagine a horizon. On that horizon is a dream you both share – a trip, a home, a way of being. See it clearly. (Pause)

Now, take turns sharing one small step toward that dream. "This week I can…" (Pause)

Shared dreams create a "we" that is bigger than the day‑to‑day struggles. They give you direction. (Pause)

When you open your eyes, schedule a dream date – 30 minutes to talk about your shared future.`
  },
  {
    id: "cpl-007",
    title: "Daily Check‑In",
    category: "couples",
    durationMinutes: 8,
    targetWordCount: 1000,
    script: `Every day, take five minutes for a check‑in. Sit facing each other. Take turns answering: "How are you really? What was hard? What was good? What do you need from me?" (Pause)

No fixing. Just listening. This small ritual builds a wall of safety in your relationship. (Pause)

Commit to it for one week. Notice how the trust grows. (Pause)

You can begin today.`
  },
  {
    id: "cpl-008",
    title: "Gratitude",
    category: "couples",
    durationMinutes: 8,
    targetWordCount: 1000,
    script: `Close your eyes. Think of one specific thing your partner did recently that you appreciated. Be concrete: "When you made tea without being asked, I felt cared for." (Pause)

Now, open your eyes and share it. Your partner will feel seen. (Pause)

Gratitude is the antidote to taking each other for granted. Practice it daily. (Pause)

You have just strengthened your bond.`
  },

  // ============================================================
  // PARENTING (8)
  // ============================================================
  {
    id: "prt-001",
    title: "Parent Guilt Release",
    category: "parenting",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Sit or lie down. Close your eyes. Place a hand on your heart. You have been carrying guilt – for yelling, for missing an event, for not being perfect.

Guilt is not useful. It drains your energy. Your children do not need a perfect parent. They need a present parent. (Pause)

Imagine the guilt as a heavy coat. Slowly, take it off. Hang it on a hook. You can put it back later if you must, but for now, you are free. (Pause)

Breathe into the space where the guilt was. Feel the lightness. (Pause)

Say to yourself: "I did my best today. Tomorrow I will try again. That is enough." (Long pause)

Open your eyes. You are a good parent. Really.`
  },
  {
    id: "prt-002",
    title: "Bedtime Story (Child)",
    category: "parenting",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `(Read this to your child in a soft, slow voice.)

Once upon a time, there was a little star. It lived in the sky with all the other stars, but it felt lonely. One night, the star looked down at a house and saw a little child in bed, also feeling a bit lonely. The star whispered: "I will watch over you tonight." And the child felt warm and safe.

The star shone extra bright, and the child's room filled with soft, golden light. The child smiled, closed their eyes, and drifted into dreamland, knowing the star was there.

And every night after that, the child looked for that star – their special star. And the star was always there. Because love, once given, never goes away.

Goodnight, little one. The star is watching.`
  },
  {
    id: "prt-003",
    title: "Morning Routine (Child)",
    category: "parenting",
    durationMinutes: 8,
    targetWordCount: 1000,
    script: `Good morning, sleepyhead. Let's start the day with a gentle game.

First, let's take three big balloon breaths. Breathe in… blow up the balloon. Breathe out… let the air go. One, two, three. (Pause)

Now, stretch like a cat. Reach your arms up high. Touch the sky. (Pause)

Now, give your body a wiggle – from your toes to your nose. (Pause)

You are ready for the day. Remember, you are brave, you are kind, and you are loved.`
  },
  {
    id: "prt-004",
    title: "Co‑parenting Harmony",
    category: "parenting",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Sit quietly. Close your eyes. Bring to mind your co‑parent – partner, ex, or other caregiver. Notice any tension.

Now, imagine a shared goal: the well‑being of your child. See your child's face. That is the centre. From that centre, disagreements seem smaller. (Pause)

Say silently: "We may not agree on everything, but we both love this child. That is our common ground." (Pause)

Next time you disagree, pause. Ask: "What would be best for our child?" Let that question guide you. (Pause)

Open your eyes. You are on the same team.`
  },
  {
    id: "prt-005",
    title: "Tantrum Calm",
    category: "parenting",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `When your child is having a tantrum, you may feel your own nervous system rising. This practice is for you, in that moment.

First, take two slow breaths. Your calm is contagious. (Pause)

Then, say to yourself: "This is not an emergency. This is a child who needs help calming down." (Pause)

Imagine you are a lighthouse. The waves of your child's emotions crash around you, but you remain steady, shining your light. (Pause)

Get down to their eye level. Use a soft voice. Offer a hug or just your presence. The storm will pass. It always does.`
  },
  {
    id: "prt-006",
    title: "Self‑Compassion for Parents",
    category: "parenting",
    durationMinutes: 12,
    targetWordCount: 1500,
    script: `Close your eyes. Place both hands on your heart. Parenting is the hardest job you will ever love.

Repeat after me: "I am doing the best I can. I am learning. I am good enough." (Pause)

When you make a mistake, say: "I am human. I will repair." (Pause)

Imagine all the parents in the world, each carrying their own struggles. You are not alone. (Long pause – 2 minutes)

Now, give yourself permission to rest. You deserve it.`
  },
  {
    id: "prt-007",
    title: "Family Connection",
    category: "parenting",
    durationMinutes: 8,
    targetWordCount: 1000,
    script: `Sit with your family. Hold hands. Close your eyes. Take three breaths together. (Pause)

Now, each person silently thinks of one thing they appreciate about another family member. (Pause)

When you open your eyes, share those appreciations aloud. (Pause)

This small ritual builds a family culture of gratitude and connection. Do it once a week.`
  },
  {
    id: "prt-008",
    title: "Letting Go of Perfection",
    category: "parenting",
    durationMinutes: 10,
    targetWordCount: 1250,
    script: `Close your eyes. Imagine a scoreboard in your mind – a list of all the ways you think you are failing as a parent. Now, watch as the scoreboard fades away. (Pause)

There is no scoreboard. There is only love, imperfect and real. (Pause)

Say to yourself: "I release the need to be perfect. I choose to be present instead." (Pause)

Your children will not remember the perfect meals or the spotless house. They will remember the times you played, listened, and said sorry. (Pause)

Breathe. You are enough.`
  },
];