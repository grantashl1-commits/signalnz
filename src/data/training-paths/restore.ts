import type { TrainingPath } from "./types";

// ═══════════════════════════════════════════════════════════
// 6. REST & RESTORE – 8‑WEEK SOMATIC PATH (Full CSV Integration)
// ═══════════════════════════════════════════════════════════

export const restAndRestore: TrainingPath = {
  id: "rest-and-restore-somatic-full",
  name: "The Deep Unfolding",
  subtitle: "Six movements, five days, two rests – one nervous system at peace",
  focus: "restore",
  description:
    "This path is a complete somatic library in motion. Each week you move through six carefully chosen exercises, five days a week, with two full days of rest. No rush, no performance – only the body’s natural rhythm of repair. By week 8 you will have touched every practice in Oriana Bell’s collection, yet the path remains as gentle as the first day.",
  whoItIsFor:
    "The woman who needs structure without pressure. The woman who wants to explore a full somatic toolkit without overwhelm. The woman who trusts that rest is the highest form of training.",
  weeks: [
    // ===== WEEK 1: BREATH & AWARENESS =====
    {
      week: 1,
      theme: "Breath as Anchor",
      progression: "Establishing foundational breath patterns and simple spinal awareness.",
      sessions: [
        { day: 1, name: "Breath & Presence", focus: "Diaphragmatic reset", durationMin: 30, equipment: "None", feel: "Centered",
          structure: ["Diaphragmatic Breathing (5‑10 cycles)","Box Breathing (4‑8 rounds)","Alternate Nostril Breathing (5‑10 rounds)","Resonant Breathing (5 min)","Sighing Practice (6‑10 sighs)","Body Scan (5 min)"],
          coachingNote: "Let the breath lead. You are not doing these – you are receiving them." },
        { day: 2, name: "Spinal Whisper", focus: "Gentle spine mobility", durationMin: 30, equipment: "Mat", feel: "Fluid",
          structure: ["Look Over Your Shoulder (5‑8/side)","Seated Side Bends (5‑8/side)","Cross Side Bends (5‑8/side)","Knee Circles in Supine (8‑10 each direction)","The Gentle Supine Twist (5‑8/side)","Cat-Cow Stretch Variation (8‑12 reps)"],
          coachingNote: "Your spine holds your story. Move slowly – let it tell you what it needs." },
        { day: 3, name: "Shoulder Softening", focus: "Release upper tension", durationMin: 30, equipment: "Mat", feel: "Light",
          structure: ["Shoulders Relaxation Technique (8‑10)","Release for Tight Shoulders (8‑10)","Follow the Rainbow (5‑8/side)","Lateral Neck Stretch (5‑8/side)","Shoulder Rolls (8‑10 each direction)","The Freedom Flow (5‑8 reps)"],
          coachingNote: "Shoulders are the emotional antennae. Let them drop." },
        { day: 4, name: "Lower Body Unwinding", focus: "Hips & legs", durationMin: 30, equipment: "Mat", feel: "Grounded",
          structure: ["Dynamic Hip Rotations (8‑10 circles)","The Frog (8‑10 reps)","Hip Awakening (8‑10/side)","Side Crunches for Hip Pain Relief (8‑10/side)","Sciatica Pain Relief (5‑8/side)","Heel Raises and Toe Tapping (10‑15 reps)"],
          coachingNote: "The hips are the junk drawer of the psyche. Gently open it." },
        { day: 5, name: "Full Body Somatic Sampler", focus: "Integration", durationMin: 35, equipment: "Mat", feel: "Whole",
          structure: ["Energizing Arm Swings (10‑15 reps)","Hip Circles (8‑10 each direction)","Low Lunge (5‑8/side)","Thread the Needle (8‑10/side)","Gentle Backbends (8‑10 reps)","Standing Forward Bend (hold & sway 1‑3 min)"],
          coachingNote: "No goal but the feeling of aliveness." },
        { day: 6, name: "Rest", structure: ["Complete rest. No movement."] },
        { day: 7, name: "Rest", structure: ["Complete rest. No movement."] }
      ]
    },
    // ===== WEEK 2: BALANCE & STABILITY =====
    {
      week: 2,
      theme: "Finding Stillness in Motion",
      progression: "Introduce balance work while keeping rest days sacred.",
      sessions: [
        { day: 1, name: "Steady Feet", focus: "Lower body balance", durationMin: 30, equipment: "Wall or chair (optional)", feel: "Rooted",
          structure: ["Leg Swings (5‑10 each direction)","Skater Lunges (8‑10/side)","Warrior Flow (5‑10/side)","Single-Leg Mini-Squats (10‑15/side)","Diving Bird (10‑12/side)","Stability Challenge (10‑15 rotations each direction)"],
          coachingNote: "Balance is not about holding still – it's about returning softly, again and again." },
        { day: 2, name: "Core Restoration", focus: "Gentle centre", durationMin: 30, equipment: "Mat", feel: "Supported",
          structure: ["Rock and Relax (5‑8 reps)","Toes and Knees Tapping (30 sec each sequence)","Kick Tap (8‑10/side)","Supine Leg-to-Chest Stretch (8‑10/side)","Flutter Kicks (20‑30 sec)","The Hip Drop (8‑10/side)"],
          coachingNote: "Your core is not about hardness – it is about responsiveness." },
        { day: 3, name: "Lower Back Sanctuary", focus: "Lumbar relief", durationMin: 30, equipment: "Mat, strap", feel: "Released",
          structure: ["Supine Figure Four (hold 1‑3 min/side)","Baby Cobra (8‑10 reps)","Rocking on Your Back (8‑10 reps)","Seated Forward Bend (5‑10 reps)","Deep Side Stretch (5‑8/side)","Deep Hamstrings Stretch (hold 3‑5 breaths/side)"],
          coachingNote: "The lower back carries what we refuse to let go. Breathe into that." },
        { day: 4, name: "Emotional Release Beginnings", focus: "Hips & voice", durationMin: 30, equipment: "Mat, cushion", feel: "Cathartic",
          structure: ["Bowing and Torso Rotations (5‑8 each direction)","Pigeon Pose Flow (5‑10 reps/side)","Shake It Out! (as long as feels good)","Open Your Heart (2‑3 min)","Vocalizations (5‑10 min)","Somatic Dancing (5‑10 min)"],
          coachingNote: "Emotion is energy in motion. Let it move." },
        { day: 5, name: "Mindfulness Integration", focus: "Grounding", durationMin: 30, equipment: "None", feel: "Present",
          structure: ["Rooting Visualization (5‑10 min)","5‑4‑3‑2‑1 Technique (1 full round)","Mindful Seeing (5‑10 min)","Grateful Appreciation (5‑10 min)","Positive Affirmations (5‑10 min)","Progressive Muscle Relaxation (full body sequence)"],
          coachingNote: "Gratitude is not toxic positivity – it is a nervous system medicine." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ===== WEEK 3: DEEPENING THE SOMATIC VOCABULARY =====
    {
      week: 3,
      theme: "Layering & Lengthening",
      progression: "Increase hold times slightly. Repeat favourite exercises from week 1 & 2 with deeper awareness.",
      sessions: [
        { day: 1, name: "Breath & Spine Fusion", focus: "Coordination", durationMin: 35, equipment: "Mat", feel: "Rhythmic",
          structure: ["Diaphragmatic Breathing + Cat-Cow (combine breath with movement)","Box Breathing while seated side bending","Alternate Nostril + Seated Twist","Resonant Breathing in supine twist","Sighing Practice with shoulder rolls","Body Scan lying in reclined bound angle"],
          coachingNote: "Now the breath and body begin to speak the same language." },
        { day: 2, name: "Shoulder & Hip Dialogue", focus: "Cross‑body connections", durationMin: 35, equipment: "Mat", feel: "Integrated",
          structure: ["Swinging Bridge (8‑10/side)","Reclined Bound Angle Pose (5 min)","Thread the Needle with hip circles","Low Lunge with lateral neck stretch","The Freedom Flow into dynamic hip rotations","Energizing Arm Swings + heel raises"],
          coachingNote: "The body is not separate parts – it is a continuous river." },
        { day: 3, name: "Balance & Core Duet", focus: "Proprioception", durationMin: 35, equipment: "Wall", feel: "Playful",
          structure: ["Leg Swings with flutter kicks (alternating)","Skater Lunges + kick tap","Warrior flow into single‑leg mini squat","Diving bird + hip drop","Stability challenge with rock and relax","Toes and knees tapping in side plank variation"],
          coachingNote: "Challenge without fear – you are allowed to hold the wall." },
        { day: 4, name: "Emotional & Lumbar Release", focus: "Deep letting go", durationMin: 35, equipment: "Mat, strap, cushion", feel: "Raw & tender",
          structure: ["Pigeon pose flow with vocalizations","Supine figure four + sighing","Baby cobra into rocking on back","Deep hamstrings stretch with affirmations","Shake it out then somatic dancing","Progressive muscle relaxation (shortened to 10 min)"],
          coachingNote: "Tears are welcome here. They are not a sign of weakness – they are a sign of life." },
        { day: 5, name: "Mindful Somatic Review", focus: "Integration", durationMin: 35, equipment: "Mat", feel: "Complete",
          structure: ["Rooting visualization + heel raises","5‑4‑3‑2‑1 technique while seated forward bend","Mindful seeing in standing forward fold","Grateful appreciation in supine twist","Positive affirmations during body scan","Full PMR (15 min)"],
          coachingNote: "You are not the same woman who started week 1. Feel that." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ===== WEEK 4: CONSOLIDATION & CHOICE =====
    {
      week: 4,
      theme: "Repetition as Ritual",
      progression: "Repeat week 3's structure but allow substitution: each day you may replace one exercise with any from weeks 1‑3 that you loved.",
      sessions: [
        { day: 1, name: "Your Breath + Spine", focus: "Owner's choice", durationMin: 35, equipment: "As needed", feel: "Empowered",
          structure: ["Same as week 3 day 1, but you may swap one exercise for a favourite from week 1 or 2."],
          coachingNote: "Choice is a form of self‑trust. Exercise it gently." },
        { day: 2, name: "Your Shoulder + Hip", focus: "Owner's choice", durationMin: 35, structure: ["Same as week 3 day 2 with one substitution"] },
        { day: 3, name: "Your Balance + Core", focus: "Owner's choice", durationMin: 35, structure: ["Same as week 3 day 3 with one substitution"] },
        { day: 4, name: "Your Emotional + Lumbar", focus: "Owner's choice", durationMin: 35, structure: ["Same as week 3 day 4 with one substitution"] },
        { day: 5, name: "Your Mindful Review", focus: "Owner's choice", durationMin: 35, structure: ["Same as week 3 day 5 with one substitution"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ===== WEEK 5: ADDING FLUIDITY – ALL EXERCISES ROTATED IN =====
    {
      week: 5,
      theme: "Full Library Immersion",
      progression: "Introduce any remaining exercises not yet used (e.g., Cross Side Bends variations, deeper flows). By end of week, every CSV exercise has appeared at least once.",
      sessions: [
        { day: 1, name: "Morning Awakening Flow", focus: "Full body gentle", durationMin: 40, equipment: "Mat", feel: "Juicy",
          structure: ["Cat‑Cow with lateral sway","Cross Side Bends (standing)","Knee circles in supine into hip awakening","Shoulder rolls with follow the rainbow","Seated side bends with box breathing","Standing forward bend with rooting visualization"],
          coachingNote: "Morning somatic practice tells your nervous system: 'Today, I choose ease.'" },
        { day: 2, name: "Afternoon Unwinder", focus: "Release work", durationMin: 40, equipment: "Mat, strap", feel: "Deep",
          structure: ["Supine figure four (3 min each side)","Reclined bound angle (5 min)","Thread the needle into baby cobra","Rocking on back into deep hamstrings stretch","Sciatica pain relief (piriformis)","Vocalizations (humming while in supine twist)"],
          coachingNote: "The afternoon slump is not laziness – it's a signal to slow down." },
        { day: 3, name: "Evening Nervous System Reset", focus: "Parasympathetic activation", durationMin: 40, equipment: "Mat, blanket", feel: "Soothing",
          structure: ["Resonant breathing (10 min)","Alternate nostril breathing (5 min)","Body scan (10 min)","Progressive muscle relaxation (10 min)","Positive affirmations (5 min)","Grateful appreciation (5 min)"],
          coachingNote: "Evening practice is a bridge to restorative sleep. Let it be short and sweet." },
        { day: 4, name: "Full Spectrum Somatic Flow", focus: "All categories", durationMin: 40, equipment: "Mat, wall", feel: "Empowered",
          structure: ["Leg swings into warrior flow","Skater lunges into diving bird","Single‑leg mini squats with stability challenge","Hip circles into the frog","Shake it out into somatic dancing","Open your heart (closing)"],
          coachingNote: "You have now moved through every major somatic family. Honour your body's memory." },
        { day: 5, name: "Restorative Depth", focus: "Longer holds", durationMin: 45, equipment: "Mat, pillows, strap", feel: "Held",
          structure: ["Pigeon pose flow (10 min)","Reclined bound angle (10 min)","Supine twist with figure four (5 min each side)","Deep hamstrings stretch (5 min each side)","Body scan (10 min)","PMR (5 min)"],
          coachingNote: "Long holds are not boring – they are the soil where healing grows." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ===== WEEK 6: EXTENDED PRESENCE (LONGER DURATIONS) =====
    {
      week: 6,
      theme: "Lengthening the Pause",
      progression: "Each exercise hold time increases by 30‑60 seconds. Total session ~45‑50 min.",
      sessions: [
        { day: 1, name: "Extended Breath & Spine", focus: "Patience", durationMin: 45, equipment: "Mat", feel: "Spacious",
          structure: ["Same exercises as week 5 day 1, but each movement is held 50% longer (e.g., 12 breath cycles instead of 8)."],
          coachingNote: "Time is not your enemy. Breathe into the extra seconds." },
        { day: 2, name: "Extended Release", focus: "Surrender", durationMin: 45, equipment: "Mat, strap", feel: "Melting",
          structure: ["Week 5 day 2 sequence with longer holds – supine figure four 5 min each side, reclined bound angle 15 min, etc."] },
        { day: 3, name: "Extended Reset", focus: "Deep calm", durationMin: 50, equipment: "Mat", feel: "Weightless",
          structure: ["Resonant breathing (15 min)","Alternate nostril (10 min)","Body scan (15 min)","PMR (10 min)"] },
        { day: 4, name: "Extended Flow", focus: "Full body integration", durationMin: 45, equipment: "Mat, wall", feel: "Graceful",
          structure: ["Week 5 day 4 sequence with each balance pose held for 5‑8 breaths instead of 3‑5."] },
        { day: 5, name: "Extended Restorative", focus: "Complete let‑go", durationMin: 50, equipment: "Mat, pillows", feel: "Floating",
          structure: ["Pigeon (15 min)","Reclined bound angle (15 min)","Supine twist (10 min total)","Body scan (10 min)"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ===== WEEK 7: FULL EXPRESSION (ALL EXERCISES REMAIN, NO REDUCTION) =====
    {
      week: 7,
      theme: "Somatic Mastery",
      progression: "Every session contains 6 distinct exercises drawn from all previous weeks – no exercise is dropped. You will revisit every major category each day.",
      sessions: [
        { day: 1, name: "Morning Integration", focus: "Full spectrum", durationMin: 45, equipment: "Mat, strap", feel: "Complete",
          structure: [
            "Diaphragmatic breathing (seated)",
            "Cat‑cow with lateral sway (8 reps)",
            "Thread the needle (8/side)",
            "Supine figure four (2 min/side)",
            "Shake it out (2 min)",
            "Progressive muscle relaxation (10 min)"
          ],
          coachingNote: "Seven weeks in, this is no longer a routine – it is a conversation with yourself." },
        { day: 2, name: "Afternoon Ground", focus: "Balance & core", durationMin: 45, equipment: "Wall", feel: "Rooted",
          structure: [
            "Leg swings (5‑10 each direction)",
            "Single‑leg mini squats (10/side)",
            "Diving bird (10/side)",
            "Rock and relax (8 reps)",
            "Hip drop (10/side)",
            "Rooting visualization (5 min)"
          ] },
        { day: 3, name: "Evening Release", focus: "Hips & lower back", durationMin: 45, equipment: "Mat, cushion", feel: "Tender",
          structure: [
            "Pigeon pose flow (8‑10 waves/side)",
            "The frog (10 reps)",
            "Sciatica pain relief (5‑8/side)",
            "Baby cobra (10 reps)",
            "Rocking on back (10 reps)",
            "Vocalizations (5 min)"
          ] },
        { day: 4, name: "Mindful Movement", focus: "Awareness", durationMin: 45, equipment: "None", feel: "Quiet",
          structure: [
            "Box breathing (8 rounds)",
            "5‑4‑3‑2‑1 technique (1 full round)",
            "Mindful seeing (5 min)",
            "Grateful appreciation (5 min)",
            "Positive affirmations (5 min)",
            "Body scan (10 min)"
          ] },
        { day: 5, name: "Full Somatic Celebration", focus: "Joyful integration", durationMin: 50, equipment: "Mat, music (optional)", feel: "Liberated",
          structure: [
            "Energizing arm swings (15 reps)",
            "Swinging bridge (10/side)",
            "Somatic dancing (10 min)",
            "Open your heart (3 min)",
            "Standing forward bend with sway (3 min)",
            "Reclined bound angle (10 min)"
          ],
          coachingNote: "You have earned this celebration. Move like no one is watching – because no one should be." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ===== WEEK 8: COMING HOME – YOUR UNIQUE SOMATIC PATH =====
    {
      week: 8,
      theme: "Weaving Your Own Thread",
      progression: "Each day you choose 6 exercises from any previous week, creating your personal somatic flow. All exercises remain available – you are the curator.",
      sessions: [
        { day: 1, name: "Your Chosen Morning Flow", focus: "Self‑directed", durationMin: 40, equipment: "As needed", feel: "Authentic (30–50 min, your choice)",
          structure: ["Pick any 6 exercises from weeks 1‑7 that call to you today. Order them intuitively."],
          coachingNote: "You now know what your nervous system needs. Trust that knowing." },
        { day: 2, name: "Your Midweek Reset", focus: "Self‑directed", durationMin: 40, feel: "30–50 min, your choice", structure: ["Choose 6 exercises that help you feel safe and present."] },
        { day: 3, name: "Your Gentle Afternoon", focus: "Self‑directed", durationMin: 40, feel: "30–50 min, your choice", structure: ["Choose 6 exercises that require minimal effort – rest as the priority."] },
        { day: 4, name: "Your Evening Unwinding", focus: "Self‑directed", durationMin: 40, feel: "30–50 min, your choice", structure: ["Choose 6 breath or mindfulness practices for deep calm."] },
        { day: 5, name: "Your Full Somatic Celebration", focus: "Self‑directed", durationMin: 40, feel: "30–50 min, your choice", structure: ["Choose 6 exercises that make you feel alive, joyful, or free."] },
        { day: 6, name: "Rest", structure: ["Complete rest. Reflect on the 8 weeks."] },
        { day: 7, name: "Rest & Journal", structure: ["Write: What has this path taught you about rest? Which 3 exercises will you keep as lifelong tools?"] }
      ]
    }
  ]
};
