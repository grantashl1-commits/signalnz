import type { TrainingPath } from "./types";

// SIGNAL Pilates – 8‑Week Core Strength Plan
// Based on Brooke Siler's "The Pilates Body" with SIGNAL voice: precise, centred, deeply respectful.

export const pilatesPlan = {
  id: "mat-pilates",
  name: "The Still Centre",
  subtitle: "Core as home, not as punishment",
  focus: "pilates",
  description:
    "Pilates is about finding the centre of yourself – the deep, steady place from which all movement originates. This 8‑week path is slow, deliberate, and deeply respectful of the body you are in right now.",
  whoItIsFor:
    "The woman who craves movement that feels like a return to herself – gentle, precise, and quietly transformative.",
  weeks: [
    // ═══════════════════════════════════════════════════════════
    // WEEK 1–2: MODIFIED BEGINNER MATWORK (from CSV)
    // ═══════════════════════════════════════════════════════════
    {
      week: 1,
      theme: "Foundations of Centre",
      progression:
        "Learn breath, pelvic floor engagement, and basic spinal articulation. 3 Pilates days + 1 walk + 3 rest.",
      sessions: [
        {
          day: 1,
          name: "Centre & Breath",
          focus: "Breath, pelvic floor, deep core",
          durationMin: 20,
          equipment: "Mat",
          feel: "Quietly awake",
          structure: [
            "5 min: diaphragmatic breathing, pelvic tilts",
            "The Hundred (Modified) – 1 set of 100 counts",
            "The Roll-Up (Beginning Scoop) – 3 reps",
            "Single Leg Circles (Modified) – 3–5 each direction, each leg",
            "Rolling Like a Ball (Modified) – 5–6 reps",
            "Single Leg Stretch (Modified) – 5–10 sets",
            "Double Leg Stretch (Modified) – 5–10 reps",
            "Spine Stretch Forward (Modified) – 3 reps",
            "5 min: supine twist, savasana",
          ],
          coachingNote:
            "Every movement begins with the breath. The exhale is the moment of deepest connection. Sink your belly into the mat – that's your signal home.",
        },
        {
          day: 2,
          name: "Walk",
          focus: "Active recovery",
          durationMin: 25,
          equipment: "None",
          feel: "Easy",
          structure: ["25 min walk"],
          coachingNote: "",
        },
        {
          day: 3,
          name: "Spine & Stability",
          focus: "Spinal articulation, hip strength",
          durationMin: 20,
          equipment: "Mat",
          feel: "Supple and supported",
          structure: [
            "5 min: cat‑cow flow, thread the needle",
            "The Roll-Up (Beginning Scoop) – 3 reps",
            "Single Leg Circles (Modified) – 3–5 each direction",
            "Rolling Like a Ball (Modified) – 5–6 reps",
            "Single Leg Stretch (Modified) – 5–10 sets",
            "Spine Stretch Forward (Modified) – 3 reps",
            "5 min: seated spinal rotation, legs up the wall",
          ],
          coachingNote:
            "Your spine is a river, not a column. Each vertebra moves in sequence. Imagine a beach ball between your thighs – it keeps the C‑curve alive.",
        },
        {
          day: 4,
          name: "Rest",
          structure: ["Rest"],
        },
        {
          day: 5,
          name: "Full Body Flow",
          focus: "Integration",
          durationMin: 20,
          equipment: "Mat",
          feel: "Whole",
          structure: [
            "5 min: standing roll‑down, shoulder circles",
            "The Hundred (Modified) – 100 counts",
            "The Roll-Up (Beginning Scoop) – 3 reps",
            "Single Leg Stretch (Modified) – 5–10 sets",
            "Double Leg Stretch (Modified) – 5–10 reps",
            "Rolling Like a Ball (Modified) – 5–6 reps",
            "Spine Stretch Forward (Modified) – 3 reps",
            "5 min: child’s pose, savasana",
          ],
          coachingNote:
            "Let the breath connect every movement. No rush. The signal is felt, not forced.",
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] },
      ],
    },
    {
      week: 2,
      theme: "Building Depth",
      progression:
        "Increase holds by 1‑2 breaths. Same exercises, deeper awareness.",
      sessions: [
        {
          day: 1,
          name: "Centre & Breath (Build)",
          durationMin: 22,
          equipment: "Mat",
          feel: "Deeper",
          structure: [
            "Same as Week 1 Day 1, but hold each exercise 1 breath longer at the end of each repetition.",
          ],
          coachingNote:
            "Deeper doesn't mean harder – it means more present. Listen to the signal of your pelvic floor on every exhale.",
        },
        {
          day: 2,
          name: "Walk",
          durationMin: 25,
          equipment: "None",
          feel: "Easy",
          structure: ["Walk"],
        },
        {
          day: 3,
          name: "Spine & Stability (Build)",
          durationMin: 22,
          equipment: "Mat",
          feel: "Stronger",
          structure: [
            "Same as Week 1 Day 3, add 1 extra set of each exercise (2 sets total).",
          ],
          coachingNote: "",
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body Flow (Build)",
          durationMin: 22,
          equipment: "Mat",
          feel: "Flowing",
          structure: [
            "Same as Week 1 Day 5, repeat the full sequence twice with 30 sec rest between rounds.",
          ],
          coachingNote: "",
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] },
      ],
    },
    // ═══════════════════════════════════════════════════════════
    // WEEK 3–6: FULL MAT – BEGINNER (from CSV)
    // ═══════════════════════════════════════════════════════════
    {
      week: 3,
      theme: "Extending the Flow",
      progression:
        "Link movements together with continuous breath. Introduce full beginner exercises.",
      sessions: [
        {
          day: 1,
          name: "Centre & Breath (Flow)",
          durationMin: 30,
          equipment: "Mat",
          feel: "Seamless",
          structure: [
            "3 min: diaphragmatic breath",
            "Flow A (repeat 3× without pause): The Hundred (100 counts) → The Roll-Up (3–5 reps) → Single Leg Circles (3–5 each direction)",
            "Flow B (repeat 3×): Single Leg Stretch (5–10 sets) → Double Leg Stretch (5–10 reps) → Rolling Like a Ball (5–6 reps)",
            "Spine Stretch Forward – 3 slow reps",
            "5 min: savasana",
          ],
          coachingNote:
            "The breath becomes the bridge between exercises. No pause – just a continuous wave of centre.",
        },
        {
          day: 2,
          name: "Walk",
          durationMin: 25,
          equipment: "None",
          structure: ["Walk"],
        },
        {
          day: 3,
          name: "Spine & Stability (Flow)",
          durationMin: 30,
          equipment: "Mat",
          feel: "Supple",
          structure: [
            "3 min cat‑cow, pelvic clocks",
            "Flow: Single Leg Circles → Rolling Like a Ball → Single Leg Stretch (repeat 3×)",
            "Side Kicks Up/Down – 5 each side",
            "Small Circles – 5 each direction, each side",
            "The Seal – 6 reps",
            "5 min: supine twist, hamstring stretch",
          ],
          coachingNote:
            "Keep your torso still during leg circles – the signal of stability comes from a motionless centre.",
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body Flow (Extended)",
          durationMin: 30,
          equipment: "Mat",
          feel: "Whole",
          structure: [
            "5 min standing roll‑down, shoulder rolls",
            "Complete beginner sequence (repeat 2×): Hundred → Roll‑Up → Single Leg Circles → Rolling Like a Ball → Single Leg Stretch → Double Leg Stretch → Spine Stretch Forward → Side Kicks → Small Circles → The Seal",
            "5 min savasana",
          ],
          coachingNote: "",
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] },
      ],
    },
    {
      week: 4,
      theme: "Consolidation",
      progression:
        "Repeat Week 3. Aim for smooth, effortless transitions. Add 2 reps to each exercise.",
      sessions: [
        {
          day: 1,
          name: "Centre & Breath (Consolidation)",
          durationMin: 30,
          equipment: "Mat",
          feel: "Familiar",
          structure: [
            "Same as Week 3 Day 1, but increase each exercise by 2 reps (e.g., Roll‑Up 5 reps, Circles 5–7 each direction).",
          ],
          coachingNote:
            "This week is about mastery, not intensity. The signal becomes automatic.",
        },
        {
          day: 2,
          name: "Walk",
          durationMin: 25,
          structure: ["Walk"],
        },
        {
          day: 3,
          name: "Spine & Stability (Consolidation)",
          durationMin: 30,
          equipment: "Mat",
          structure: ["Same as Week 3 Day 3 with added reps."],
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body Flow (Consolidation)",
          durationMin: 30,
          equipment: "Mat",
          structure: ["Same as Week 3 Day 5 with added reps and smoother linking."],
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] },
      ],
    },
    {
      week: 5,
      theme: "New Challenge",
      progression:
        "Introduce intermediate exercises: Single Straight Leg Stretch, Crisscross, Open‑Leg Rocker.",
      sessions: [
        {
          day: 1,
          name: "Centre & Side Body",
          durationMin: 35,
          equipment: "Mat",
          feel: "Learning",
          structure: [
            "5 min breath and pelvic floor",
            "The Hundred – 100 counts",
            "The Roll‑Up – 5 reps",
            "Single Leg Circles – 5 each direction",
            "Single Straight Leg Stretch – 5–10 sets",
            "Crisscross – 5–10 sets",
            "Side Kicks Up/Down – 5 each side",
            "Small Circles – 5 each direction",
            "5 min: savasana",
          ],
          coachingNote:
            "New exercises ask for new attention. Keep your chin toward your chest – that small signal protects your neck and deepens ab work.",
        },
        {
          day: 2,
          name: "Walk",
          durationMin: 25,
          structure: ["Walk"],
        },
        {
          day: 3,
          name: "Spine & Full Integration",
          durationMin: 35,
          equipment: "Mat",
          feel: "Expanded",
          structure: [
            "Spine Stretch Forward – 5 reps",
            "Open‑Leg Rocker – 6 reps (balance on tailbone)",
            "Single Leg Stretch – 10 sets",
            "Double Leg Stretch – 10 reps",
            "Rolling Like a Ball – 6 reps",
            "The Seal – 6 reps",
            "5 min: spinal twist, lying",
          ],
          coachingNote:
            "Open‑Leg Rocker asks for total surrender of the upper body. Initiate the roll from your navel sinking into spine – that's your engine.",
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body Challenge",
          durationMin: 35,
          equipment: "Mat",
          feel: "Engaged",
          structure: [
            "Flow: Hundred → Roll‑Up → Single Leg Circles → Single Straight Leg Stretch → Crisscross → Side Kicks → Open‑Leg Rocker → The Seal (rest 30 sec between 2 rounds)",
            "5 min child's pose, savasana",
          ],
          coachingNote: "",
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] },
      ],
    },
    {
      week: 6,
      theme: "Deepen the Challenge",
      progression:
        "Add holds and increase reps by 2. Introduce Teaser I and Side Bicycle.",
      sessions: [
        {
          day: 1,
          name: "Centre & Side Body (Deepen)",
          durationMin: 35,
          equipment: "Mat",
          feel: "Stronger",
          structure: [
            "5 min breath",
            "The Hundred – legs lower (more challenge)",
            "The Roll‑Up – 5 reps with 2 sec hold at top",
            "Single Leg Circles – 6 each direction, larger circles",
            "Teaser I – 3 reps (float up to V position)",
            "Side Bicycle – 3–5 each direction each side",
            "Inner‑Thigh Lifts – 5–10 lifts + 10 pulses each side",
            "5 min savasana",
          ],
          coachingNote:
            "Teaser is the signal of full integration – arms, legs, and spine moving as one. Keep your legs absolutely still; imagine springs attached to your ankles.",
        },
        {
          day: 2,
          name: "Walk",
          durationMin: 30,
          structure: ["Longer walk"],
        },
        {
          day: 3,
          name: "Spine & Full Integration (Deepen)",
          durationMin: 35,
          equipment: "Mat",
          structure: [
            "Spine Stretch Forward – 5 reps",
            "Open‑Leg Rocker – 8 reps",
            "Single Straight Leg Stretch – 10 sets",
            "Crisscross – 10 sets",
            "Side Kicks Front/Back – 6 each side",
            "The Corkscrew (beginner version: small circles) – 3 sets",
            "5 min: hamstring stretch, supine",
          ],
          coachingNote:
            "The Corkscrew asks for stillness in the torso while legs circle. Squeeze your buttocks and inner thighs – that locks the signal of stability.",
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body Challenge (Deepen)",
          durationMin: 35,
          equipment: "Mat",
          structure: [
            "All previous exercises combined: 3 rounds with 1 min rest. Focus on breath rhythm (5 inhale / 5 exhale) throughout.",
          ],
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] },
      ],
    },
  // ═══════════════════════════════════════════════════════════
// WEEK 7–8: INTERMEDIATE MATWORK (first taste) – FULLY ELABORATED
// ═══════════════════════════════════════════════════════════
{
  week: 7,
  theme: "Peak Flow",
  progression:
    "Move through full intermediate sequences without pause. Introduce The Saw, Single Leg Kicks, and Neck Pull. RPE 8‑9.",
  sessions: [
    {
      day: 1,
      name: "Peak Centre Flow",
      durationMin: 45,
      equipment: "Mat",
      feel: "Flowing",
      structure: [
        "5 min: diaphragmatic breathing, pelvic floor activation, standing roll‑down",
        "Flow A (3 rounds, minimal rest):",
        "  • The Hundred – 100 counts (legs at 45°, arms pump, 5‑count breath)",
        "  • The Roll‑Up – 5 reps (full version, articulate each vertebra)",
        "  • Single Leg Circles – 6 each direction, each leg (slight turnout, still torso)",
        "  • Single Straight Leg Stretch – 10 sets (scissor legs, chin to chest)",
        "  • Crisscross – 10 sets (twist from ribs, opposite shoulder lifted)",
        "  • Teaser I – 3 reps (float to V balance, legs still)",
        "  • Rolling Like a Ball – 6 reps (archival: head between knees)",
        "  • The Seal – 6 reps (3 claps at each end)",
        "5 min savasana with lateral breathing",
      ],
      coachingNote:
        "This is the signal at full volume – but still quiet inside. Each exhale wrings out old air; each inhale brings fresh centre. In Crisscross, rotate from your ribs, not your elbows – that's where the oblique signal lives.",
    },
    {
      day: 2,
      name: "Walk",
      durationMin: 30,
      structure: ["Brisk walk – 30 min, maintain neutral pelvis and easy rhythm"],
    },
    {
      day: 3,
      name: "Peak Spine & Posterior Chain",
      durationMin: 45,
      equipment: "Mat",
      feel: "Powerful",
      structure: [
        "5 min: cat‑cow, thread the needle, pelvic clocks",
        "Flow B (3 rounds, 30 sec rest between rounds):",
        "  • Spine Stretch Forward – 5 reps (legs wider than hips, C‑curve)",
        "  • Open‑Leg Rocker – 6 reps (balance on tailbone, straight legs held at ankles)",
        "  • The Corkscrew – 3–5 sets (legs circle overhead, hips stable)",
        "  • The Saw – 4 sets (twist from waist, reach pinkie past baby toe)",
        "  • Single Leg Kicks – 5 sets (prone, double kick heel to buttock)",
        "  • Double Leg Kicks – 3 sets (face side, kick heels 3×, then bow up)",
        "  • Neck Pull – 5 reps (hands behind head, roll up, bow, roll down)",
        "  • Swimming – 30 sec (opposite arm/leg, 5‑count breath)",
        "5 min: supine hamstring stretch with strap, savasana",
      ],
      coachingNote:
        "The Saw asks you to wring the air from your lungs as you twist – imagine pressing a wet towel dry. That exhalation is the signal that deepens your rotation without forcing.",
    },
    {
      day: 4,
      name: "Rest",
      structure: ["Rest – gentle stretching optional"],
    },
    {
      day: 5,
      name: "Peak Full Body – Complete Intermediate",
      durationMin: 45,
      equipment: "Mat",
      feel: "Complete",
      structure: [
        "5 min: standing roll‑down, shoulder circles, breath awareness",
        "Full intermediate sequence (3 rounds, 30 sec rest between rounds):",
        "  • The Hundred – 100 counts",
        "  • The Roll‑Up – 5 reps",
        "  • Single Leg Circles – 6 each direction",
        "  • Single Straight Leg Stretch – 10 sets",
        "  • Crisscross – 10 sets",
        "  • Open‑Leg Rocker – 6 reps",
        "  • The Corkscrew – 3 sets",
        "  • The Saw – 4 sets",
        "  • Single Leg Kicks – 5 sets",
        "  • Neck Pull – 5 reps",
        "  • Side Kicks Front/Back – 6 each side",
        "  • Side Bicycle – 3–5 each direction each side",
        "  • Inner‑Thigh Lifts – 5–10 lifts + 10 pulses each side",
        "  • Teaser I – 3 reps",
        "  • The Seal – 6 reps",
        "10 min extended savasana – legs up the wall, lateral breathing",
      ],
      coachingNote:
        "You've built a signal so clear that movement happens without thought. Trust it. If any exercise feels too intense, return to the modified version – mastery is knowing when to soften.",
    },
    { day: 6, name: "Rest", structure: ["Rest"] },
    { day: 7, name: "Rest", structure: ["Rest"] },
  ],
},
{
  week: 8,
  theme: "Deload & Gratitude",
  progression:
    "Return to modified beginner sessions, but now with the depth of 7 weeks behind you. All exercises written out in full – no references. Move with ease, breath, and appreciation.",
  sessions: [
    {
      day: 1,
      name: "Centre & Breath (Gratitude)",
      durationMin: 20,
      equipment: "Mat",
      feel: "Grateful",
      structure: [
        "5 min: supine diaphragmatic breathing (hand on belly, hand on heart), pelvic tilts",
        "The Hundred (Modified) – 1 set of 100 counts (knees bent or legs long, head lifted, arms pump)",
        "The Roll-Up (Beginning Scoop) – 3 reps (knees bent, round over imaginary beach ball)",
        "Single Leg Circles (Modified) – 3–5 each direction, each leg (circle from hip, torso still)",
        "Rolling Like a Ball (Modified) – 5–6 reps (chin tucked, stop at shoulder blades)",
        "Single Leg Stretch (Modified) – 5–10 sets (inside hand on knee, outside on ankle)",
        "Double Leg Stretch (Modified) – 5–10 reps (knees to chest, stretch long, circle back)",
        "Spine Stretch Forward (Modified) – 3 reps (legs open wider than hips, C‑curve)",
        "5 min: supine twist (knees to each side), savasana with gratitude breath",
      ],
      coachingNote:
        "Your body has changed. You are stronger, more centred, more at home. This is the signal you can return to anytime. Notice how light the modified exercises feel now – that's the gift of your practice.",
    },
    {
      day: 2,
      name: "Walk",
      durationMin: 30,
      structure: ["Long walk in nature – no agenda, just presence"],
    },
    {
      day: 3,
      name: "Spine & Stability (Gratitude)",
      durationMin: 20,
      equipment: "Mat",
      feel: "Supple and grateful",
      structure: [
        "5 min: cat‑cow flow, thread the needle (3 each side), deep squat hold with breath",
        "Spine Stretch Forward (Modified) – 3 reps (legs wide, round forward, head last to lift)",
        "Single Leg Circles (Modified) – 3–5 each direction, each leg (press palms into mat for stability)",
        "Rolling Like a Ball (Modified) – 5–6 reps (initiate from navel, not neck)",
        "Single Leg Stretch (Modified) – 5–10 sets (scoop belly, stay lifted from upper abs)",
        "Double Leg Stretch (Modified) – 5–10 reps (activate glutes when extending legs)",
        "Side Kicks Up/Down – 5 each side (lift top leg toward ceiling, resist on the way down)",
        "Small Circles – 5 each direction, each side (vigorous circles from hip, knee locked)",
        "5 min: seated spinal rotation (sukhasana), legs up the wall",
      ],
      coachingNote:
        "Your spine has learned to articulate like a river. Feel each vertebra soften and release as you move. The signal of gratitude is the absence of effort.",
    },
    {
      day: 4,
      name: "Rest",
      structure: ["Rest – maybe a warm bath or gentle self-massage"],
    },
    {
      day: 5,
      name: "Full Body Flow (Gratitude)",
      durationMin: 20,
      equipment: "Mat",
      feel: "Whole and complete",
      structure: [
        "5 min: standing roll‑down (peel spine down, one vertebra at a time), shoulder circles, gentle squat hold",
        "The Hundred (Modified) – 100 counts",
        "The Roll-Up (Beginning Scoop) – 3 reps",
        "Single Leg Circles (Modified) – 3–5 each direction, each leg",
        "Rolling Like a Ball (Modified) – 5–6 reps",
        "Single Leg Stretch (Modified) – 5–10 sets",
        "Double Leg Stretch (Modified) – 5–10 reps",
        "Spine Stretch Forward (Modified) – 3 reps",
        "The Seal – 6 reps (knees open, hands around ankles, clap feet)",
        "5 min: child's pose with lateral breathing, supine savasana",
      ],
      coachingNote:
        "You started here eight weeks ago. Now you return as a different person – more centred, more aware, more alive. Move like water, with gratitude for every inhale.",
    },
    {
      day: 6,
      name: "Rest",
      structure: ["Rest"],
    },
    {
      day: 7,
      name: "Reflect",
      durationMin: 0,
      equipment: "None",
      feel: "Complete",
      structure: [
        "Write one sentence: What has Pilates taught you about your body?",
        "Optional: repeat your favourite 10‑min sequence from any week as a celebration.",
      ],
      coachingNote:
        "This is your centre. You can always return here. The signal never fades – it only deepens. Thank yourself for showing up.",
    },
  ],
},
  ]
};
