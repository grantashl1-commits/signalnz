import type { TrainingPath } from "./types";

// ═══════════════════════════════════════════════════════════
// 9. THE ANCHOR – 8-WEEK GLUTE POWER (rewritten in new shape)
// ═══════════════════════════════════════════════════════════
export const glutePower: TrainingPath = {
  id: "glute-power",
  name: "The Anchor",
  subtitle: "Coming home to your strongest centre",
  focus: "glute-power",
  description:
    "Eight weeks of patient, intentional work for the muscles that carry you through every day — the ones that have been quietly waiting to be noticed. We start small, with feeling. We build slowly, with weight. The work is not loud. The change is.",
  whoItIsFor:
    "The woman who wants strong, capable hips and glutes. New to focused glute work, or returning after years of generic gym programmes that never quite woke this part of her up.",
  weeks: [
    { week: 1, theme: "Activation — Learning the Patterns", phaseGoal: "Establish mind-muscle connection. Light weights, slow tempo, deep feeling.", rpeMin: 5, rpeMax: 6.5,
      progression: "Tempo 3-1-2 on most lifts. Light dumbbells (3-5 kg). Form before load.",
      sessions: [
        { day: 1, name: "Drive — Hip extension led", durationMin: 40, equipment: "Dumbbells (3-5 kg), mat", feel: "Curious", coachingNote: "If the bridge feels in your lower back instead of your glutes, slow down. The muscle you want is the one underneath.",
          warmup: ["Cat-cow x 8", "Glute bridges x 12", "Hip circles x 10/side", "Deep squat hold 30 sec"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Glute Bridge", sets: 3, reps: 15, tempo: "2-2-2", notes: "squeeze at the top" },
              { name: "Goblet Squat", sets: 3, reps: 12, tempo: "3-1-2" },
            ] },
            { rounds: 3, exercises: [
              { name: "Reverse Lunge", sets: 3, reps: "10 per side" },
              { name: "Single-Leg Glute Bridge", sets: 3, reps: "10 per side" },
              { name: "Clam (slow)", sets: 2, reps: "15 per side" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Supine twist 1 min/side", "Child's pose 1 min"] },
        { day: 2, name: "Walk & Breathe", durationMin: 30, equipment: "None", feel: "Easy and spacious", structure: ["20 min walk at a nose-breathing pace", "10 min gentle stretching — hamstrings, hips, chest"] },
        { day: 3, name: "Hinge — Posterior chain", durationMin: 40, equipment: "Dumbbells (3-5 kg), mat", feel: "Grounded", coachingNote: "The hinge is a movement you'll use every day. Feel the stretch in your hamstrings, not your lower back.",
          warmup: ["Leg swings 10/side", "Hip circles", "Body-weight squats x 10"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Romanian Deadlift", sets: 3, reps: 12, tempo: "3-1-2" },
              { name: "Glute Bridge March", sets: 3, reps: "10 per side" },
              { name: "Sumo Squat", sets: 3, reps: 12, tempo: "4-1-2" },
            ] },
            { rounds: 2, exercises: [
              { name: "Side-Lying Leg Lift", sets: 2, reps: "15 per side" },
              { name: "Bird Dog", sets: 3, reps: "6 per side" },
            ] },
          ],
          coolDown: ["Hamstring stretch 1 min/side", "Supine twist 1 min/side"] },
        { day: 4, name: "Rest", durationMin: 0, structure: ["Rest"], coachingNote: "Your muscles grow while you are lying still." },
        { day: 5, name: "Shape — Round and lift", durationMin: 40, equipment: "Dumbbells, resistance band, mat", feel: "Connected",
          warmup: ["Monster walks (band) 10 each direction", "Inchworms x 6", "Deep squat rotations x 8"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Hip Thrust", sets: 3, reps: 12, tempo: "1 sec pause at top" },
              { name: "Curtsy Lunge", sets: 3, reps: "10 per side" },
            ] },
            { rounds: 3, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "12 per side" },
              { name: "Donkey Kick", sets: 3, reps: "12 per side" },
              { name: "Plank", sets: 2, reps: "30 sec" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Lying figure-four 1 min/side"],
          coachingNote: "These small movements look easy. They are not. The smaller the muscle, the more attention it needs." },
        { day: 6, name: "Walk", durationMin: 25, structure: ["25 min walk", "Notice 5 things you see, 4 you hear, 3 you feel"], feel: "Peaceful" },
        { day: 7, name: "Rest", structure: ["Rest"], coachingNote: "One week down. Notice anything new in your body?" }
      ] },
    { week: 2, theme: "Deeper Connection — Same load, more feeling", phaseGoal: "Build mind-muscle connection. Add 1 rep to working sets if form felt solid.", rpeMin: 5.5, rpeMax: 6.5,
      progression: "Same weights (3-5 kg), +1 rep on each working set. Goal: deeper connection, not heavier weight.",
      sessions: [
        { day: 1, name: "Drive — Hip extension led", durationMin: 40, equipment: "Dumbbells (3-5 kg), mat", feel: "Curious", coachingNote: "Same weight as Week 1 — one more rep, a deeper squeeze. Notice how much more you can feel.",
          warmup: ["Cat-cow x 8", "Glute bridges x 12", "Hip circles x 10/side", "Deep squat hold 30 sec"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Glute Bridge", sets: 3, reps: 16, tempo: "2-2-2", weight: "3-5 kg", notes: "+1 rep from Week 1, squeeze at the top" },
              { name: "Goblet Squat", sets: 3, reps: 13, tempo: "3-1-2", weight: "3-5 kg", notes: "+1 rep" },
            ] },
            { rounds: 3, exercises: [
              { name: "Reverse Lunge", sets: 3, reps: "11 per side", weight: "3-5 kg" },
              { name: "Single-Leg Glute Bridge", sets: 3, reps: "11 per side", weight: "Bodyweight" },
              { name: "Clam (slow)", sets: 2, reps: "16 per side", weight: "Band" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Supine twist 1 min/side", "Child's pose 1 min"] },
        { day: 2, name: "Walk & Breathe", durationMin: 30, equipment: "None", feel: "Easy and spacious", structure: ["20 min walk at a nose-breathing pace", "10 min gentle stretching — hamstrings, hips, chest"] },
        { day: 3, name: "Hinge — Posterior chain", durationMin: 40, equipment: "Dumbbells (3-5 kg), mat", feel: "Grounded", coachingNote: "One more rep on each lift. Feel the hamstrings, not the lower back.",
          warmup: ["Leg swings 10/side", "Hip circles", "Body-weight squats x 10"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Romanian Deadlift", sets: 3, reps: 13, tempo: "3-1-2", weight: "3-5 kg", notes: "+1 rep" },
              { name: "Glute Bridge March", sets: 3, reps: "11 per side", weight: "Bodyweight" },
              { name: "Sumo Squat", sets: 3, reps: 13, tempo: "4-1-2", weight: "3-5 kg", notes: "+1 rep" },
            ] },
            { rounds: 2, exercises: [
              { name: "Side-Lying Leg Lift", sets: 2, reps: "16 per side", weight: "Bodyweight" },
              { name: "Bird Dog", sets: 3, reps: "7 per side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Hamstring stretch 1 min/side", "Supine twist 1 min/side"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape — Round and lift", durationMin: 40, equipment: "Dumbbells, resistance band, mat", feel: "Connected", coachingNote: "The small muscles are waking up. Give them one more rep of attention.",
          warmup: ["Monster walks (band) 10 each direction", "Inchworms x 6", "Deep squat rotations x 8"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Hip Thrust", sets: 3, reps: 13, tempo: "1 sec pause at top", weight: "3-5 kg", notes: "+1 rep" },
              { name: "Curtsy Lunge", sets: 3, reps: "11 per side", weight: "3-5 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "13 per side", weight: "Bodyweight" },
              { name: "Donkey Kick", sets: 3, reps: "13 per side", weight: "Bodyweight" },
              { name: "Plank", sets: 2, reps: "35 sec", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Lying figure-four 1 min/side"] },
        { day: 6, name: "Walk", durationMin: 25, feel: "Peaceful", structure: ["25 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 3, theme: "First Load Increase", phaseGoal: "Add 1-2 kg to compound lifts if Week 2 form was solid.", rpeMin: 6, rpeMax: 7,
      progression: "Add 1-2 kg to RDL, Goblet Squat, Sumo Squat, Hip Thrust (now 4-6 kg). Same reps as Week 2.",
      sessions: [
        { day: 1, name: "Drive — Heavier", durationMin: 42, equipment: "Dumbbells (4-6 kg), mat", feel: "Capable", coachingNote: "First load jump. If a lift feels rushed, keep last week's weight — form leads.",
          warmup: ["Cat-cow x 8", "Glute bridges x 12", "Hip circles x 10/side", "Deep squat hold 30 sec"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Glute Bridge", sets: 3, reps: 16, tempo: "2-2-2", weight: "4-6 kg", notes: "+1-2 kg from Week 2" },
              { name: "Goblet Squat", sets: 3, reps: 13, tempo: "3-1-2", weight: "4-6 kg", notes: "+1-2 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Reverse Lunge", sets: 3, reps: "11 per side", weight: "3-5 kg" },
              { name: "Single-Leg Glute Bridge", sets: 3, reps: "11 per side", weight: "Bodyweight" },
              { name: "Clam (slow)", sets: 2, reps: "16 per side", weight: "Band" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Supine twist 1 min/side", "Child's pose 1 min"] },
        { day: 2, name: "Walk", durationMin: 30, structure: ["Walk + stretch"] },
        { day: 3, name: "Hinge — Heavier", durationMin: 42, equipment: "Dumbbells (4-6 kg), mat", feel: "Grounded", coachingNote: "The hinge is a movement you'll use every day. Add the kilo, keep the shape.",
          warmup: ["Leg swings 10/side", "Hip circles", "Body-weight squats x 10"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Romanian Deadlift", sets: 3, reps: 13, tempo: "3-1-2", weight: "4-6 kg", notes: "+1-2 kg" },
              { name: "Glute Bridge March", sets: 3, reps: "11 per side", weight: "Bodyweight" },
              { name: "Sumo Squat", sets: 3, reps: 13, tempo: "4-1-2", weight: "4-6 kg", notes: "+1-2 kg" },
            ] },
            { rounds: 2, exercises: [
              { name: "Side-Lying Leg Lift", sets: 2, reps: "16 per side", weight: "Bodyweight" },
              { name: "Bird Dog", sets: 3, reps: "7 per side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Hamstring stretch 1 min/side", "Supine twist 1 min/side"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape — Heavier", durationMin: 42, equipment: "Dumbbells, resistance band, mat", feel: "Connected",
          warmup: ["Monster walks (band) 10 each direction", "Inchworms x 6", "Deep squat rotations x 8"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Hip Thrust", sets: 3, reps: 13, tempo: "1 sec pause at top", weight: "4-6 kg", notes: "+1-2 kg" },
              { name: "Curtsy Lunge", sets: 3, reps: "11 per side", weight: "3-5 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "13 per side", weight: "Bodyweight" },
              { name: "Donkey Kick", sets: 3, reps: "13 per side", weight: "Bodyweight" },
              { name: "Plank", sets: 2, reps: "35 sec", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Lying figure-four 1 min/side"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 4, theme: "Activation Phase Close", phaseGoal: "Hold Week 3 load. Notice what's changed from Week 1.", rpeMin: 6, rpeMax: 7,
      progression: "Same load as Week 3 (4-6 kg on compounds). Final week of the activation phase — own it.",
      sessions: [
        { day: 1, name: "Drive — Own the load", durationMin: 42, equipment: "Dumbbells (4-6 kg), mat", feel: "Steady", coachingNote: "No new weight this week. Make Week 3's load feel easy.",
          warmup: ["Cat-cow x 8", "Glute bridges x 12", "Hip circles x 10/side", "Deep squat hold 30 sec"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Glute Bridge", sets: 3, reps: 16, tempo: "2-2-2", weight: "4-6 kg" },
              { name: "Goblet Squat", sets: 3, reps: 13, tempo: "3-1-2", weight: "4-6 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Reverse Lunge", sets: 3, reps: "11 per side", weight: "3-5 kg" },
              { name: "Single-Leg Glute Bridge", sets: 3, reps: "11 per side", weight: "Bodyweight" },
              { name: "Clam (slow)", sets: 2, reps: "16 per side", weight: "Band" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Supine twist 1 min/side", "Child's pose 1 min"] },
        { day: 2, name: "Walk", durationMin: 30, structure: ["Walk + stretch"] },
        { day: 3, name: "Hinge — Own the load", durationMin: 42, equipment: "Dumbbells (4-6 kg), mat", feel: "Grounded",
          warmup: ["Leg swings 10/side", "Hip circles", "Body-weight squats x 10"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Romanian Deadlift", sets: 3, reps: 13, tempo: "3-1-2", weight: "4-6 kg" },
              { name: "Glute Bridge March", sets: 3, reps: "11 per side", weight: "Bodyweight" },
              { name: "Sumo Squat", sets: 3, reps: 13, tempo: "4-1-2", weight: "4-6 kg" },
            ] },
            { rounds: 2, exercises: [
              { name: "Side-Lying Leg Lift", sets: 2, reps: "16 per side", weight: "Bodyweight" },
              { name: "Bird Dog", sets: 3, reps: "7 per side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Hamstring stretch 1 min/side", "Supine twist 1 min/side"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape — Own the load", durationMin: 42, equipment: "Dumbbells, resistance band, mat", feel: "Connected",
          warmup: ["Monster walks (band) 10 each direction", "Inchworms x 6", "Deep squat rotations x 8"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Hip Thrust", sets: 3, reps: 13, tempo: "1 sec pause at top", weight: "4-6 kg" },
              { name: "Curtsy Lunge", sets: 3, reps: "11 per side", weight: "3-5 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "13 per side", weight: "Bodyweight" },
              { name: "Donkey Kick", sets: 3, reps: "13 per side", weight: "Bodyweight" },
              { name: "Plank", sets: 2, reps: "35 sec", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Lying figure-four 1 min/side"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest. Look back at Week 1. Notice the shift."] }
      ] },
    { week: 5, theme: "Load Phase — The body is ready", phaseGoal: "Increase weight, add a fourth set to primary lifts.", rpeMin: 6.5, rpeMax: 7.5,
      progression: "Add a fourth set to the first two compound lifts each session. Reps drop to 8-10 on heavier lifts. Tempo controlled.",
      sessions: [
        { day: 1, name: "Drive — Heavier", durationMin: 45, equipment: "Dumbbells (5-8 kg) or barbell", feel: "Capable",
          warmup: ["Glute bridges x 12", "Monster walks 10 each direction"],
          supersets: [
            { rounds: 4, exercises: [
              { name: "Glute Bridge or Hip Thrust", sets: 4, reps: 10, weight: "heavier" },
              { name: "Goblet or Barbell Squat", sets: 4, reps: 8, tempo: "3-1-1" },
            ] },
            { rounds: 3, exercises: [
              { name: "Reverse Lunge", sets: 3, reps: "10 per side", weight: "heavier" },
              { name: "Single-Leg Glute Bridge", sets: 3, reps: "10 per side" },
              { name: "Plank", sets: 3, reps: "40 sec" },
            ] },
          ],
          coolDown: ["Pigeon", "Hamstring stretch"],
          coachingNote: "The fourth set is a quiet promise to your future self." },
        { day: 2, name: "Walk & Restore", durationMin: 30, structure: ["Walk + stretch"], coachingNote: "Recovery is where the training becomes you." },
        { day: 3, name: "Hinge — Heavier", durationMin: 45, equipment: "Dumbbells (5-8 kg) or barbell", feel: "Strong",
          supersets: [
            { rounds: 4, exercises: [
              { name: "Romanian Deadlift", sets: 4, reps: 8, tempo: "3-1-2", weight: "heavier" },
              { name: "Sumo Squat", sets: 4, reps: 10 },
            ] },
            { rounds: 3, exercises: [
              { name: "Glute Bridge March", sets: 3, reps: "10 per side" },
              { name: "Side-Lying Leg Lift", sets: 3, reps: "15 per side" },
              { name: "Bird Dog", sets: 3, reps: "8 per side" },
            ] },
          ],
          coolDown: ["Hamstring stretch", "Supine twist"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape — Volume", durationMin: 45, equipment: "Dumbbells, band, mat", feel: "Burning in the right places",
          supersets: [
            { rounds: 4, exercises: [
              { name: "Hip Thrust", sets: 4, reps: 12, tempo: "1 sec pause at top" },
              { name: "Curtsy Lunge", sets: 3, reps: "12 per side" },
            ] },
            { rounds: 3, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "15 per side" },
              { name: "Donkey Kick", sets: 3, reps: "15 per side" },
              { name: "Side Plank", sets: 2, reps: "25 sec per side" },
            ] },
          ],
          coachingNote: "The burn is real. It is the muscle saying I am awake." },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk, slightly faster pace"] },
        { day: 7, name: "Rest", structure: ["Rest"], coachingNote: "Notice your body climbing the stairs." }
      ] },
    { week: 6, theme: "Settling into the heavier rhythm", phaseGoal: "Same lifts as Week 5, +1-2 kg if last week's RPE was below 8.", rpeMin: 7, rpeMax: 8,
      progression: "Week 5's session shape with +1-2 kg on the compounds (now 6-8 kg); Shape day adds 2 reps. Sleep is part of the programme this week.",
      sessions: [
        { day: 1, name: "Drive — Heavier still", durationMin: 45, equipment: "Dumbbells (6-8 kg) or barbell", feel: "Capable", coachingNote: "Week 5 + a little more. If last week never crossed RPE 8, add the kilo.",
          warmup: ["Glute bridges x 12", "Monster walks 10 each direction", "Hip circles x 10/side"],
          supersets: [
            { rounds: 4, exercises: [
              { name: "Glute Bridge or Hip Thrust", sets: 4, reps: 10, weight: "6-8 kg", notes: "+1-2 kg from Week 5" },
              { name: "Goblet or Barbell Squat", sets: 4, reps: 8, tempo: "3-1-1", weight: "6-8 kg", notes: "+1-2 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Reverse Lunge", sets: 3, reps: "10 per side", weight: "6-8 kg" },
              { name: "Single-Leg Glute Bridge", sets: 3, reps: "10 per side", weight: "Bodyweight" },
              { name: "Plank", sets: 3, reps: "45 sec", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Hamstring stretch 1 min/side"] },
        { day: 2, name: "Walk & Restore", durationMin: 30, structure: ["Walk + stretch"] },
        { day: 3, name: "Hinge — Heavier still", durationMin: 45, equipment: "Dumbbells (6-8 kg) or barbell", feel: "Strong",
          warmup: ["Leg swings 10/side", "Hip circles", "Body-weight squats x 10"],
          supersets: [
            { rounds: 4, exercises: [
              { name: "Romanian Deadlift", sets: 4, reps: 8, tempo: "3-1-2", weight: "6-8 kg", notes: "+1-2 kg from Week 5" },
              { name: "Sumo Squat", sets: 4, reps: 10, weight: "6-8 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Glute Bridge March", sets: 3, reps: "10 per side", weight: "Bodyweight" },
              { name: "Side-Lying Leg Lift", sets: 3, reps: "15 per side", weight: "Bodyweight" },
              { name: "Bird Dog", sets: 3, reps: "8 per side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Hamstring stretch 1 min/side", "Supine twist 1 min/side"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape — Volume +2 reps", durationMin: 45, equipment: "Dumbbells, band, mat", feel: "Burning in the right places", coachingNote: "Sleep is where this week's work becomes muscle. Guard it.",
          warmup: ["Monster walks (band) 10 each direction", "Inchworms x 6", "Deep squat rotations x 8"],
          supersets: [
            { rounds: 4, exercises: [
              { name: "Hip Thrust", sets: 4, reps: 14, tempo: "1 sec pause at top", weight: "6-8 kg", notes: "+2 reps from Week 5" },
              { name: "Curtsy Lunge", sets: 3, reps: "14 per side", weight: "5-8 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "17 per side", weight: "Bodyweight" },
              { name: "Donkey Kick", sets: 3, reps: "17 per side", weight: "Bodyweight" },
              { name: "Side Plank", sets: 2, reps: "30 sec per side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Lying figure-four 1 min/side"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 7, theme: "Intensification — Top sets", phaseGoal: "Push to heavier loads on primary lifts.", rpeMin: 7.5, rpeMax: 8.5,
      progression: "Top set on each compound: 1 set of 5-6 reps at heaviest sustainable load (~8-12 kg), then back-off sets at Week 6 weight (6-8 kg).",
      sessions: [
        { day: 1, name: "Drive — Top set", durationMin: 50, equipment: "Dumbbells (up to 12 kg) or barbell", feel: "Focused", coachingNote: "Watch form like a hawk. The top set is heavy, not sloppy.",
          warmup: ["Glute bridges x 12", "Monster walks 10 each direction", "Goblet squat (light) x 10", "Deep squat hold 30 sec"],
          supersets: [
            { rounds: 1, exercises: [
              { name: "Hip Thrust — top set", sets: 1, reps: 5, weight: "8-12 kg", notes: "Heaviest sustainable load, every rep controlled" },
              { name: "Goblet or Barbell Squat — top set", sets: 1, reps: 6, tempo: "3-1-1", weight: "8-12 kg", notes: "Heaviest sustainable load" },
            ] },
            { rounds: 3, exercises: [
              { name: "Hip Thrust — back-off", sets: 3, reps: 10, weight: "6-8 kg", notes: "Week 6 weight" },
              { name: "Squat — back-off", sets: 3, reps: 8, tempo: "3-1-1", weight: "6-8 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Reverse Lunge", sets: 3, reps: "10 per side", weight: "6-8 kg" },
              { name: "Single-Leg Glute Bridge", sets: 3, reps: "10 per side", weight: "Bodyweight" },
              { name: "Plank", sets: 3, reps: "45 sec", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Hamstring stretch 1 min/side"] },
        { day: 2, name: "Walk & Restore", durationMin: 30, structure: ["Walk + mobility"] },
        { day: 3, name: "Hinge — Top set", durationMin: 50, equipment: "Dumbbells (up to 12 kg) or barbell", feel: "Strong",
          warmup: ["Leg swings 10/side", "Hip circles", "Body-weight squats x 10", "Glute bridges x 12"],
          supersets: [
            { rounds: 1, exercises: [
              { name: "Romanian Deadlift — top set", sets: 1, reps: 6, tempo: "3-1-2", weight: "8-12 kg", notes: "Heaviest sustainable load, flat back" },
            ] },
            { rounds: 3, exercises: [
              { name: "Romanian Deadlift — back-off", sets: 3, reps: 8, tempo: "3-1-2", weight: "6-8 kg", notes: "Week 6 weight" },
            ] },
            { rounds: 4, exercises: [
              { name: "Sumo Squat", sets: 4, reps: 10, weight: "6-8 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Glute Bridge March", sets: 3, reps: "10 per side", weight: "Bodyweight" },
              { name: "Side-Lying Leg Lift", sets: 3, reps: "15 per side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Hamstring stretch 1 min/side", "Supine twist 1 min/side"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape — Volume + finisher", durationMin: 50, equipment: "Dumbbells, band, mat", feel: "Lit up", coachingNote: "Last big week. Leave it all here.",
          warmup: ["Monster walks (band) 10 each direction", "Inchworms x 6", "Deep squat rotations x 8"],
          supersets: [
            { rounds: 4, exercises: [
              { name: "Hip Thrust", sets: 4, reps: 10, weight: "6-8 kg" },
              { name: "Curtsy Lunge", sets: 3, reps: "12 per side", weight: "5-8 kg" },
            ] },
            { rounds: 3, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "12 per side", weight: "Bodyweight" },
              { name: "Donkey Kick", sets: 3, reps: "12 per side", weight: "Bodyweight" },
              { name: "Plank to Side Plank flow", sets: 3, reps: "30 sec each side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Lying figure-four 1 min/side"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk, optional 4×30 sec light pickups"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 8, theme: "Test, Deload, Reflect", phaseGoal: "Notice everything that has changed.", rpeMin: 6, rpeMax: 8,
      progression: "Optional test day on Day 1 — one heavy set on Hip Thrust or Squat. Then a soft, celebratory week at lighter loads.",
      sessions: [
        { day: 1, name: "Test or Celebrate", durationMin: 40, equipment: "Dumbbells or barbell", feel: "Proud", coachingNote: "Celebrate the woman you are now. The test is optional — flow if you'd rather.",
          warmup: ["Cat-cow x 8", "Glute bridges x 12", "Monster walks 10 each direction", "Goblet squat (light) x 10", "Deep squat hold 30 sec"],
          supersets: [
            { rounds: 1, exercises: [
              { name: "Hip Thrust or Squat — test set (optional)", sets: 1, reps: 5, weight: "Heavy — RPE 8", notes: "One heavy set only. Skip and just flow if you prefer." },
            ] },
            { rounds: 3, exercises: [
              { name: "Hip Thrust", sets: 3, reps: 10, weight: "4-6 kg", notes: "Lighter — feel every rep" },
              { name: "Goblet Squat", sets: 3, reps: 10, tempo: "3-1-2", weight: "4-6 kg" },
            ] },
          ],
          coolDown: ["Long pigeon 2 min/side", "Supine twist 1 min/side", "A quiet seated minute"] },
        { day: 2, name: "Walk", durationMin: 30, structure: ["30 min walk, no agenda"] },
        { day: 3, name: "Light Hinge", durationMin: 35, equipment: "Dumbbells (3-5 kg), mat", feel: "Easy",
          warmup: ["Leg swings 10/side", "Hip circles", "Body-weight squats x 10"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Romanian Deadlift", sets: 3, reps: 8, tempo: "3-1-2", weight: "3-5 kg", notes: "Light — grooving the pattern" },
              { name: "Sumo Squat", sets: 3, reps: 10, weight: "3-5 kg" },
            ] },
            { rounds: 2, exercises: [
              { name: "Glute Bridge March", sets: 3, reps: "10 per side", weight: "Bodyweight" },
              { name: "Side-Lying Leg Lift", sets: 3, reps: "12 per side", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Hamstring stretch 1 min/side", "Supine twist 1 min/side"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Light Shape", durationMin: 35, equipment: "Dumbbells, band, mat", feel: "Grateful",
          warmup: ["Monster walks (band) 10 each direction", "Inchworms x 6"],
          supersets: [
            { rounds: 3, exercises: [
              { name: "Hip Thrust", sets: 3, reps: 12, tempo: "1 sec pause at top", weight: "4-6 kg", notes: "All lighter today" },
              { name: "Curtsy Lunge", sets: 3, reps: "10 per side", weight: "3-5 kg" },
            ] },
            { rounds: 2, exercises: [
              { name: "Fire Hydrant", sets: 3, reps: "12 per side", weight: "Bodyweight" },
              { name: "Donkey Kick", sets: 3, reps: "12 per side", weight: "Bodyweight" },
              { name: "Plank", sets: 2, reps: "30 sec", weight: "Bodyweight" },
            ] },
          ],
          coolDown: ["Pigeon 1 min/side", "Lying figure-four 1 min/side"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk"] },
        { day: 7, name: "Rest and reflect", durationMin: 0, structure: ["Rest. Write one sentence about what your body can do now that it could not in Week 1."], coachingNote: "You came back, again and again. That is the real work." }
      ] }
  ]
};
