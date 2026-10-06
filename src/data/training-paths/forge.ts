import type { TrainingPath } from "./types";

// ─────────────────────────────────────────────────────────────────
// THE FORGE – 8‑Week Muscle Building (Hypertrophy)
// ─────────────────────────────────────────────────────────────────

export const theForge: TrainingPath = {
  id: 'the-forge',
  name: 'The Forge',
  subtitle: '8 weeks of intentional growth',
  focus: 'muscle',
  description:
    'This is not about shrinking. It is about becoming more of yourself – denser, stronger, more capable. We lift heavy (for you), eat enough, rest deeply, and watch your body respond over eight weeks. No exercise repeats within a week unless intentional.',
  whoItIsFor:
    'The woman ready to build. Who understands that muscle is metabolic currency and that the process is as beautiful as the result.',
  weeks: [
    // WEEK 1 – Foundation
    {
      week: 1,
      theme: 'Foundation – Learning the Lifts',
      progression: 'RPE 7‑8. Tempo 3‑1‑2. Perfect form.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A',
          focus: 'Quads, glutes, hamstrings',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells, bench',
          feel: 'Grounded and curious',
          warmup: ['Cat‑cow – 8 reps', 'Leg swings – 10 each', 'Goblet squat (light) – 10 reps', 'Glute bridge – 10 reps'],
          supersets: [
            { exercises: [{ name: 'Back Squat', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavy (RPE 7‑8)', notes: 'Feet shoulder‑width, chest up, descend to parallel, drive through heels' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Romanian Deadlift', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Hinge at hips, slight knee bend, bar close to shins, feel hamstring stretch' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Walking Lunge', sets: 3, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Moderate', notes: 'Step forward, lower back knee toward floor, push through front heel' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Leg Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Moderate', notes: 'Feet shoulder‑width on plate, press through heels, don’t lock knees' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Standing Calf Raise', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Moderate', notes: 'Raise heels as high as possible, pause 1 sec at top' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Hamstring stretch – 30 sec/side', 'Quad stretch – 30 sec/side', 'Child’s pose – 60 sec'],
          coachingNote: 'Feel the weight in your heels. Your feet are your roots.'
        },
        {
          day: 2,
          name: 'Upper Body A',
          focus: 'Chest, back, shoulders',
          durationMin: 45,
          equipment: 'Barbell / heavy dumbbells, cables',
          feel: 'Open and expansive',
          warmup: ['Arm circles – 10 each', 'Band pull‑aparts – 15', 'Cat‑cow – 8', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Bench Press', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavy (RPE 7‑8)', notes: 'Feet planted, bar to mid‑chest, elbows 45°, press explosively' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Bent‑Over Row', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Hinge at hips, back flat, pull bar to lower ribs, squeeze shoulder blades' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Overhead Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Barbell or dumbbells, press straight overhead, keep ribs down' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Lat Pulldown', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Moderate', notes: 'Wide grip, pull to upper chest, avoid swinging' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Lateral Raise', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Lead with elbows, raise to shoulder height, lower slowly' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Doorway chest stretch – 30 sec/side', 'Lat stretch – 30 sec/side', 'Triceps stretch – 30 sec/side'],
          coachingNote: 'Your upper body carries your heart. Train it with respect.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Recovery is not a day off – it is a day that builds.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B',
          focus: 'Posterior chain, glutes',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells',
          feel: 'Powerful',
          warmup: ['Leg swings – 10 each', 'Hip circles – 8 each', 'Bodyweight squats – 10', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Deadlift', sets: 4, reps: 6, tempo: '3‑1‑1', weight: 'Heavy (RPE 7‑8)', notes: 'Hinge to grip bar, flat back, drive feet through floor, lock hips and knees' }], rounds: 4, restAfterSuperset: 120 },
            { exercises: [{ name: 'Bulgarian Split Squat', sets: 3, reps: '8 per leg', tempo: '3‑1‑2', weight: 'Moderate', notes: 'Rear foot on bench, lower until back knee nearly touches floor, drive through front heel' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Hip Thrust', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavy', notes: 'Shoulders on bench, barbell across hips, drive hips up, hold 2 sec at top' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Nordic Hamstring Curl', sets: 3, reps: 6, tempo: '3‑1‑1', weight: 'Bodyweight', notes: 'Kneel with ankles secured, lower torso slowly toward floor, catch with hands' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Leg Calf Raise', sets: 3, reps: '12 per leg', tempo: '2‑1‑2', weight: 'Light', notes: 'Hold a dumbbell or just bodyweight, raise heel, pause at top' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose – 30 sec/side', 'Supine hamstring stretch – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'The deadlift is primal. Pick something up with intention.'
        },
        {
          day: 5,
          name: 'Upper Body B',
          focus: 'Shoulders, arms, back width',
          durationMin: 45,
          equipment: 'Dumbbells, cables, bands',
          feel: 'Pumped',
          warmup: ['Inchworms – 5', 'Thoracic rotations – 8/side', 'Scapular push‑ups – 10', 'Arm circles'],
          supersets: [
            { exercises: [{ name: 'Incline Dumbbell Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Bench at 30‑45°, dumbbells at chest, press up and slightly together' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Arm Dumbbell Row', sets: 4, reps: '10 per side', tempo: '3‑1‑2', weight: 'Moderate', notes: 'One hand on bench, pull dumbbell toward hip, squeeze back' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Arnold Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Start palms facing you, press and rotate palms forward at top' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Face Pull', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Cable or band at eye level, pull toward forehead, externally rotate shoulders' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 12, tempo: '2‑1‑3', weight: 'Light‑Moderate', notes: 'Elbows at sides, control the negative' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Tricep Overhead Extension', sets: 3, reps: 12, tempo: '3‑1‑2', weight: 'Light‑Moderate', notes: 'Hold one dumbbell overhead, lower behind head, extend fully' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose – 30 sec', 'Supine twist – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Different angle, different stimulus. Your body adapts; surprise it.'
        },
        {
          day: 6,
          name: 'Full Body Accessory',
          focus: 'Volume, metabolic stress',
          durationMin: 40,
          equipment: 'Dumbbells, mat',
          feel: 'Engaged',
          warmup: ['Jumping jacks – 30 sec', 'Hip circles – 10 each', 'Arm swings – 10 each'],
          supersets: [
            { exercises: [{ name: 'Circuit: Goblet Squat', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Part of 3‑round circuit (45 sec work / 20 sec rest)' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Push‑Up', sets: 3, reps: 10, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Move directly from previous exercise' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Kettlebell Swing', sets: 3, reps: 15, tempo: 'explosive', weight: 'Light‑Moderate', notes: 'Hip drive, not arms' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Mountain Climbers', sets: 3, reps: '20 total', tempo: 'fast', weight: 'Bodyweight', notes: 'High plank, drive knees alternately' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Plank', sets: 3, reps: '30 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Body straight, engage everything' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Finisher: Skipping', sets: 2, reps: '40 sec', tempo: 'fast', weight: 'Bodyweight', notes: 'Light rope, fast feet' }], rounds: 2, restAfterSuperset: 20 },
            { exercises: [{ name: 'Finisher: Bear Hold', sets: 2, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'All fours, knees hovering, back flat' }], rounds: 2, restAfterSuperset: 0 }
          ],
          cooldown: ['Easy walk – 5 min', 'Child’s pose – 60 sec'],
          coachingNote: 'Volume is the builder. More time under tension = more growth signal.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You did the work. Now let it sink in.',
          isRestDay: true
        }
      ]
    },
    // WEEK 2 – Load+ (increase weight, maintain reps)
    {
      week: 2,
      theme: 'Load+ – Adding Weight, Keeping Form',
      progression: 'RPE 8. Increase load by 5‑10% from Week 1. Same reps, tempo 3‑1‑2.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Load+',
          focus: 'Quads, glutes, hamstrings',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells, bench',
          feel: 'Grounded and curious',
          warmup: ['Cat‑cow – 8', 'Leg swings – 10', 'Goblet squat (light) – 10', 'Glute bridge – 10'],
          supersets: [
            { exercises: [{ name: 'Back Squat', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavier (+5‑10%)', notes: 'Maintain depth, drive through heels' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Romanian Deadlift', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Keep bar close, hinge fully' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Walking Lunge', sets: 3, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Heavier', notes: 'Don’t let front knee drift past toes' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Leg Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavier', notes: 'Control the descent, don’t lock knees' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Standing Calf Raise', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Heavier', notes: 'Full range, pause at top' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Hamstring stretch – 30 sec/side', 'Quad stretch – 30 sec/side', 'Child’s pose – 60 sec'],
          coachingNote: 'Heavy is relative to you. Add weight only when form is perfect.'
        },
        {
          day: 2,
          name: 'Upper Body A – Load+',
          focus: 'Chest, back, shoulders',
          durationMin: 45,
          equipment: 'Barbell / heavy dumbbells, cables',
          feel: 'Open and expansive',
          warmup: ['Arm circles – 10', 'Band pull‑aparts – 15', 'Cat‑cow – 8', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Bench Press', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Keep shoulders retracted, lower to sternum' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Bent‑Over Row', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Pull with back, not arms' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Overhead Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Don’t arch lower back' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Lat Pulldown', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavier', notes: 'Lead with elbows, avoid swing' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Lateral Raise', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Light (same as Week 1)', notes: 'Keep light; focus on control' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Doorway chest stretch – 30 sec/side', 'Lat stretch – 30 sec/side', 'Triceps stretch – 30 sec/side'],
          coachingNote: 'The weight is a tool, not a trophy. Respect the lift.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Active recovery builds work capacity. Walk, stretch, breathe.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B – Load+',
          focus: 'Posterior chain, glutes',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells',
          feel: 'Powerful',
          warmup: ['Leg swings – 10', 'Hip circles – 8', 'Bodyweight squats – 10', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Deadlift', sets: 4, reps: 6, tempo: '3‑1‑1', weight: 'Heavier', notes: 'Pull slack out of bar, drive through floor' }], rounds: 4, restAfterSuperset: 120 },
            { exercises: [{ name: 'Bulgarian Split Squat', sets: 3, reps: '8 per leg', tempo: '3‑1‑2', weight: 'Heavier', notes: 'Keep torso upright, front knee stable' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Hip Thrust', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavier', notes: 'Squeeze glutes hard at top' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Nordic Hamstring Curl', sets: 3, reps: 6, tempo: '3‑1‑1', weight: 'Bodyweight', notes: 'Lower slower than last week' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Leg Calf Raise', sets: 3, reps: '12 per leg', tempo: '2‑1‑2', weight: 'Light', notes: 'Use a dumbbell for added load if ready' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose – 30 sec/side', 'Supine hamstring stretch – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Your posterior chain is your power belt. Strengthen it with love.'
        },
        {
          day: 5,
          name: 'Upper Body B – Load+',
          focus: 'Shoulders, arms, back width',
          durationMin: 45,
          equipment: 'Dumbbells, cables, bands',
          feel: 'Pumped',
          warmup: ['Inchworms – 5', 'Thoracic rotations – 8/side', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Incline Dumbbell Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Press in a slight arc, not straight up' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Arm Dumbbell Row', sets: 4, reps: '10 per side', tempo: '3‑1‑2', weight: 'Heavier', notes: 'Keep hips square, don’t rotate' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Arnold Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Rotate fully, control each phase' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Face Pull', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Squeeze rear delts, don’t use momentum' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 12, tempo: '2‑1‑3', weight: 'Heavier', notes: 'Control the negative – 3 seconds down' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Tricep Overhead Extension', sets: 3, reps: 12, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Keep elbows pointed to ceiling' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose – 30 sec', 'Supine twist – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Heavier weight demands stricter form. Own the movement.'
        },
        {
          day: 6,
          name: 'Full Body Accessory – Density',
          focus: 'Volume, metabolic stress',
          durationMin: 40,
          equipment: 'Dumbbells, mat',
          feel: 'Engaged',
          warmup: ['Jumping jacks – 30 sec', 'Hip circles – 10', 'Arm swings – 10'],
          supersets: [
            { exercises: [{ name: 'Circuit: Goblet Squat', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: '45 sec work / 20 sec rest' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Push‑Up', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Increase reps from Week 1' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Kettlebell Swing', sets: 3, reps: 20, tempo: 'explosive', weight: 'Light‑Moderate', notes: 'Hip snap, not squat' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Mountain Climbers', sets: 3, reps: '30 total', tempo: 'fast', weight: 'Bodyweight', notes: 'Keep hips low' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Plank', sets: 3, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Increase hold time' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Finisher: Skipping', sets: 2, reps: '50 sec', tempo: 'fast', weight: 'Bodyweight', notes: 'Add 10 seconds' }], rounds: 2, restAfterSuperset: 20 },
            { exercises: [{ name: 'Finisher: Bear Hold', sets: 2, reps: '45 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Add 5 seconds' }], rounds: 2, restAfterSuperset: 0 }
          ],
          cooldown: ['Easy walk – 5 min', 'Child’s pose – 60 sec'],
          coachingNote: 'You’re getting stronger. The weight is just catching up.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Muscle grows when you rest, not when you lift.',
          isRestDay: true
        }
      ]
    },
    // WEEK 3 – Volume+ (increase sets or reps)
    {
      week: 3,
      theme: 'Volume+ – Accumulating Quality Reps',
      progression: 'RPE 8. Same weight as Week 2. Increase sets or reps (e.g., back squat 4×8 → 4×10, deadlift 4×6 → 4×8, add 1 set to accessories).',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Volume+',
          focus: 'Quads, glutes, hamstrings',
          durationMin: 55,
          equipment: 'Barbell / heavy dumbbells, bench',
          feel: 'Grounded and curious',
          warmup: ['Cat‑cow – 8', 'Leg swings – 10', 'Goblet squat (light) – 10', 'Glute bridge – 10'],
          supersets: [
            { exercises: [{ name: 'Back Squat', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 2 reps per set – maintain depth' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Romanian Deadlift', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set (3→4)' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Walking Lunge', sets: 4, reps: '12 per leg', tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set, 2 reps per leg' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Leg Press', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Standing Calf Raise', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Hamstring stretch – 30 sec/side', 'Quad stretch – 30 sec/side', 'Child’s pose – 60 sec'],
          coachingNote: 'Volume is the secret sauce. More quality reps = more growth.'
        },
        {
          day: 2,
          name: 'Upper Body A – Volume+',
          focus: 'Chest, back, shoulders',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells, cables',
          feel: 'Open and expansive',
          warmup: ['Arm circles – 10', 'Band pull‑aparts – 15', 'Cat‑cow – 8', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Bench Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 2 reps per set' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Bent‑Over Row', sets: 4, reps: 12, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 2 reps' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Overhead Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set (3→4)' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Lat Pulldown', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Lateral Raise', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Add 1 set, keep light' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Doorway chest stretch – 30 sec/side', 'Lat stretch – 30 sec/side', 'Triceps stretch – 30 sec/side'],
          coachingNote: 'Each extra rep is a brick in your cathedral.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Your body is rebuilding. Give it fuel and sleep.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B – Volume+',
          focus: 'Posterior chain, glutes',
          durationMin: 55,
          equipment: 'Barbell / heavy dumbbells',
          feel: 'Powerful',
          warmup: ['Leg swings – 10', 'Hip circles – 8', 'Bodyweight squats – 10', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Deadlift', sets: 4, reps: 8, tempo: '3‑1‑1', weight: 'Week 2 load', notes: 'Add 2 reps per set' }], rounds: 4, restAfterSuperset: 120 },
            { exercises: [{ name: 'Bulgarian Split Squat', sets: 4, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set, 2 reps per leg' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Hip Thrust', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Nordic Hamstring Curl', sets: 4, reps: 6, tempo: '3‑1‑1', weight: 'Bodyweight', notes: 'Add 1 set (3→4)' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Leg Calf Raise', sets: 4, reps: '12 per leg', tempo: '2‑1‑2', weight: 'Light', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose – 30 sec/side', 'Supine hamstring stretch – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Volume without control is just noise. Stay precise.'
        },
        {
          day: 5,
          name: 'Upper Body B – Volume+',
          focus: 'Shoulders, arms, back width',
          durationMin: 50,
          equipment: 'Dumbbells, cables, bands',
          feel: 'Pumped',
          warmup: ['Inchworms – 5', 'Thoracic rotations – 8/side', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Incline Dumbbell Press', sets: 4, reps: 12, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 2 reps' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Arm Dumbbell Row', sets: 4, reps: '12 per side', tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 2 reps per side' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Arnold Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Face Pull', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 4, reps: 12, tempo: '2‑1‑3', weight: 'Week 2 load', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Tricep Overhead Extension', sets: 4, reps: 12, tempo: '3‑1‑2', weight: 'Week 2 load', notes: 'Add 1 set' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose – 30 sec', 'Supine twist – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'More volume means more time under tension. Your muscles will respond.'
        },
        {
          day: 6,
          name: 'Full Body Accessory – Endurance',
          focus: 'Volume, metabolic stress',
          durationMin: 40,
          equipment: 'Dumbbells, mat',
          feel: 'Engaged',
          warmup: ['Jumping jacks – 30 sec', 'Hip circles – 10', 'Arm swings – 10'],
          supersets: [
            { exercises: [{ name: 'Circuit: Goblet Squat', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Add 1 round (3→4)' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Push‑Up', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Add 1 round' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Kettlebell Swing', sets: 4, reps: 20, tempo: 'explosive', weight: 'Light‑Moderate', notes: 'Add 1 round' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Mountain Climbers', sets: 4, reps: '30 total', tempo: 'fast', weight: 'Bodyweight', notes: 'Add 1 round' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Plank', sets: 4, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Add 1 round' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Finisher: Skipping', sets: 2, reps: '60 sec', tempo: 'fast', weight: 'Bodyweight', notes: 'Add 10 seconds' }], rounds: 2, restAfterSuperset: 20 },
            { exercises: [{ name: 'Finisher: Bear Hold', sets: 2, reps: '50 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Add 5 seconds' }], rounds: 2, restAfterSuperset: 0 }
          ],
          cooldown: ['Easy walk – 5 min', 'Child’s pose – 60 sec'],
          coachingNote: 'Endurance is a form of strength. You’re building both.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Your body is adapting. Trust the process.',
          isRestDay: true
        }
      ]
    },
    // WEEK 4 – Deload (reduce intensity, focus on restoration)
    {
      week: 4,
      theme: 'Deload – Recharge, Then Return Stronger',
      progression: 'RPE 5‑6. Reduce weight by 40‑50%. Keep same reps and sets as Week 3, but lower intensity. Focus on perfect form.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Deload',
          focus: 'Recovery & form',
          durationMin: 45,
          equipment: 'Barbell / light dumbbells, bench',
          feel: 'Easy and spacious',
          warmup: ['Cat‑cow – 8', 'Leg swings – 10', 'Goblet squat (light) – 10', 'Glute bridge – 10'],
          supersets: [
            { exercises: [{ name: 'Back Squat', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Light (40‑50% of Week 3)', notes: 'Focus on depth and control, not weight' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Romanian Deadlift', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Light', notes: 'Feel the stretch, don’t strain' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Walking Lunge', sets: 4, reps: '12 per leg', tempo: '3‑1‑2', weight: 'Bodyweight or very light', notes: 'Focus on balance and control' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Leg Press', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Smooth and steady' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Standing Calf Raise', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Full range, no rush' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Hamstring stretch – 30 sec/side', 'Quad stretch – 30 sec/side', 'Child’s pose – 60 sec'],
          coachingNote: 'Deload is not a waste – it’s when your body supercompensates. Embrace the lightness.'
        },
        {
          day: 2,
          name: 'Upper Body A – Deload',
          focus: 'Recovery & form',
          durationMin: 40,
          equipment: 'Light dumbbells, cables',
          feel: 'Easy and spacious',
          warmup: ['Arm circles – 10', 'Band pull‑aparts – 15', 'Cat‑cow – 8', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Bench Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Light', notes: 'Feel the bar path, control each rep' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bent‑Over Row', sets: 4, reps: 12, tempo: '3‑1‑2', weight: 'Light', notes: 'Squeeze shoulder blades gently' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Overhead Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Light', notes: 'Keep ribs down, don’t arch' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Lat Pulldown', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Lead with elbows' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Lateral Raise', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Very light', notes: 'Focus on form, not fatigue' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Doorway chest stretch – 30 sec/side', 'Lat stretch – 30 sec/side', 'Triceps stretch – 30 sec/side'],
          coachingNote: 'Light days build longevity. Respect them.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Walk, stretch, foam roll. Let your body heal.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B – Deload',
          focus: 'Recovery & form',
          durationMin: 45,
          equipment: 'Light barbell, light dumbbells',
          feel: 'Easy and spacious',
          warmup: ['Leg swings – 10', 'Hip circles – 8', 'Bodyweight squats – 10', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Deadlift', sets: 4, reps: 8, tempo: '3‑1‑1', weight: 'Light', notes: 'Focus on the hip hinge, not the weight' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bulgarian Split Squat', sets: 4, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Bodyweight', notes: 'Use just bodyweight or hold light DBs' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Hip Thrust', sets: 4, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Squeeze glutes, but don’t max out' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Nordic Hamstring Curl', sets: 4, reps: 6, tempo: '3‑1‑1', weight: 'Bodyweight', notes: 'Lower only as far as comfortable' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Single‑Leg Calf Raise', sets: 4, reps: '12 per leg', tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'No added weight' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose – 30 sec/side', 'Supine hamstring stretch – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Deload week is a gift to your future self. Accept it.'
        },
        {
          day: 5,
          name: 'Upper Body B – Deload',
          focus: 'Recovery & form',
          durationMin: 40,
          equipment: 'Light dumbbells, bands',
          feel: 'Easy and spacious',
          warmup: ['Inchworms – 5', 'Thoracic rotations – 8/side', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Incline Dumbbell Press', sets: 4, reps: 12, tempo: '3‑1‑2', weight: 'Light', notes: 'Control the descent, feel the stretch' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Single‑Arm Dumbbell Row', sets: 4, reps: '12 per side', tempo: '3‑1‑2', weight: 'Light', notes: 'Move with intention, not weight' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Arnold Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Light', notes: 'Focus on the rotation' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Face Pull', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Very light', notes: 'Use only band tension' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 4, reps: 12, tempo: '2‑1‑3', weight: 'Light', notes: 'Control the negative' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Tricep Extension', sets: 4, reps: 12, tempo: '3‑1‑2', weight: 'Light', notes: 'Keep elbows in' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose – 30 sec', 'Supine twist – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Deload is not regression – it’s preparation for the next leap.'
        },
        {
          day: 6,
          name: 'Full Body Accessory – Active Recovery',
          focus: 'Mobility & blood flow',
          durationMin: 30,
          equipment: 'Mat',
          feel: 'Restorative',
          warmup: ['Cat‑cow – 10', 'Deep squat hold – 30 sec', 'Thoracic rotations – 8/side'],
          supersets: [
            { exercises: [{ name: 'Light Circuit: Bodyweight Squat', sets: 2, reps: 15, tempo: '3‑1‑2', weight: 'Bodyweight', notes: 'Slow and controlled' }], rounds: 2, restAfterSuperset: 30 },
            { exercises: [{ name: 'Light Circuit: Incline Push‑Up', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Hands on bench' }], rounds: 2, restAfterSuperset: 30 },
            { exercises: [{ name: 'Light Circuit: Glute Bridge', sets: 2, reps: 20, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Squeeze gently' }], rounds: 2, restAfterSuperset: 30 },
            { exercises: [{ name: 'Light Circuit: Bird Dog', sets: 2, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: 'Slow and balanced' }], rounds: 2, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose – 2 min', 'Supine twist – 30 sec/side', 'Legs up the wall – 2 min'],
          coachingNote: 'Move to feel good, not to tire out. Restoration is active.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You’ve completed the first block. Next week, you return stronger.',
          isRestDay: true
        }
      ]
    },
    // WEEK 5 – Variation (change exercise selection)
    {
      week: 5,
      theme: 'Variation – New Stimulus, Same Growth',
      progression: 'RPE 8. Same load as Week 3. Change 2‑3 exercises per session to target muscles from different angles.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Variation',
          focus: 'Quads, glutes, hamstrings',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells, bench',
          feel: 'Curious and grounded',
          warmup: ['Cat‑cow – 8', 'Leg swings – 10', 'Goblet squat (light) – 10', 'Glute bridge – 10'],
          supersets: [
            { exercises: [{ name: 'Front Squat (Barbell or DB)', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavy (RPE 8)', notes: 'Replace back squat with front squat – more quad and core demand' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Leg RDL (DB)', sets: 3, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Moderate', notes: 'Replace bilateral RDL – challenges balance and glute medius' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Reverse Lunge', sets: 3, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Moderate', notes: 'Replace walking lunge – different stability demand' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Hack Squat (or DB Leg Press alternative)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Moderate', notes: 'Leg press alternative if available' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Seated Calf Raise', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Moderate', notes: 'Replace standing – targets soleus more' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Hamstring stretch – 30 sec/side', 'Quad stretch – 30 sec/side', 'Child’s pose – 60 sec'],
          coachingNote: 'New exercises wake up dormant muscle fibres. Embrace the unfamiliar.'
        },
        {
          day: 2,
          name: 'Upper Body A – Variation',
          focus: 'Chest, back, shoulders',
          durationMin: 45,
          equipment: 'Dumbbells, cables, bands',
          feel: 'Open and expansive',
          warmup: ['Arm circles – 10', 'Band pull‑aparts – 15', 'Cat‑cow – 8', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Incline Barbell Press', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavy', notes: 'Replace flat bench – targets upper chest' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Chest‑Supported Row (or DB Row on bench)', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Replace bent‑over row – reduces lower back strain' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Push Press', sets: 3, reps: 10, tempo: 'explosive', weight: 'Moderate', notes: 'Replace strict OHP – adds leg drive' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Straight‑Arm Pulldown', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Replace lat pulldown – different lat activation' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Reverse Fly', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Replace lateral raise – targets rear delts' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Doorway chest stretch – 30 sec/side', 'Lat stretch – 30 sec/side', 'Triceps stretch – 30 sec/side'],
          coachingNote: 'Variation prevents adaptation plateaus. Keep your muscles guessing.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Rest is part of the program, not a break from it.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B – Variation',
          focus: 'Posterior chain, glutes',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells, bands',
          feel: 'Powerful',
          warmup: ['Leg swings – 10', 'Hip circles – 8', 'Bodyweight squats – 10', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Sumo Deadlift', sets: 4, reps: 6, tempo: '3‑1‑1', weight: 'Heavy', notes: 'Replace conventional deadlift – emphasises adductors and inner glutes' }], rounds: 4, restAfterSuperset: 120 },
            { exercises: [{ name: 'Bulgarian Split Squat (same as Week 4, but heavier)', sets: 3, reps: '8 per leg', tempo: '3‑1‑2', weight: 'Moderate', notes: 'Keep the same, but increase load' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Banded Hip Thrust', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavy + band', notes: 'Add band around knees for extra abduction demand' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Glute‑Ham Raise (or banded leg curl)', sets: 3, reps: 8, tempo: '3‑1‑1', weight: 'Bodyweight + band', notes: 'Replace Nordic curl – different hamstring bias' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Donkey Calf Raise', sets: 3, reps: '15 per leg', tempo: '2‑1‑2', weight: 'Light', notes: 'Replace single‑leg standing – bent knee bias' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose – 30 sec/side', 'Supine hamstring stretch – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Sumo deadlift might feel strange at first. That’s the point – new motor patterns build resilience.'
        },
        {
          day: 5,
          name: 'Upper Body B – Variation',
          focus: 'Shoulders, arms, back width',
          durationMin: 45,
          equipment: 'Dumbbells, cables, bands',
          feel: 'Pumped',
          warmup: ['Inchworms – 5', 'Thoracic rotations – 8/side', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Decline Dumbbell Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Replace incline – targets lower chest' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'T‑Bar Row (or chest‑supported row)', sets: 4, reps: '10 per side', tempo: '3‑1‑2', weight: 'Moderate', notes: 'Replace single‑arm row – different back angle' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Seated DB Shoulder Press (neutral grip)', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Moderate', notes: 'Replace Arnold press – more stability demand' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Band Pull‑Apart', sets: 3, reps: 20, tempo: '2‑1‑2', weight: 'Band', notes: 'Replace face pull – same rear delt focus, different resistance curve' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Hammer Curl', sets: 3, reps: 12, tempo: '2‑1‑3', weight: 'Moderate', notes: 'Replace bicep curl – targets brachialis' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Tricep Dip (assisted or bench)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Replace overhead extension – different triceps emphasis' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose – 30 sec', 'Supine twist – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'New movements feel clumsy at first. That’s learning – stay patient.'
        },
        {
          day: 6,
          name: 'Full Body Accessory – Power Focus',
          focus: 'Explosiveness & work capacity',
          durationMin: 40,
          equipment: 'Dumbbells, mat, box',
          feel: 'Energised',
          warmup: ['Jumping jacks – 30 sec', 'Leg swings – 10', 'Arm swings – 10', 'Box step‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Circuit: Box Jump (or low box step‑up)', sets: 3, reps: 8, tempo: 'explosive', weight: 'Bodyweight', notes: '45 sec work / 20 sec rest' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Clapping Push‑Up (or plyo push‑up)', sets: 3, reps: '5‑8', tempo: 'explosive', weight: 'Bodyweight', notes: 'Modify with incline if needed' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Kettlebell Swing (heavy)', sets: 3, reps: 15, tempo: 'explosive', weight: 'Heavy', notes: 'Use more weight than Week 3' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Burpee (no push‑up)', sets: 3, reps: 10, tempo: 'fast', weight: 'Bodyweight', notes: 'Stay light on feet' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Plank with Shoulder Tap', sets: 3, reps: '20 total', tempo: 'moderate', weight: 'Bodyweight', notes: 'Keep hips stable' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Finisher: Hill Sprints (or bike sprints)', sets: 4, reps: '20 sec', tempo: 'all‑out', weight: 'Bodyweight', notes: '20 sec max, 40 sec rest' }], rounds: 4, restAfterSuperset: 40 }
          ],
          cooldown: ['Easy walk – 5 min', 'Child’s pose – 60 sec', 'Supine twist – 30 sec/side'],
          coachingNote: 'Power is strength expressed at speed. You’ve built the foundation – now light it up.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You’re halfway. Notice how far you’ve come.',
          isRestDay: true
        }
      ]
    },
    // WEEK 6 – Load+ (second heavy block)
    {
      week: 6,
      theme: 'Load+ – Second Heavy Block',
      progression: 'RPE 8‑9. Increase load by 5‑10% from Week 5 (or back to Week 3 loads). Same sets and reps as Week 5, but push intensity.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Load+',
          focus: 'Quads, glutes, hamstrings',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells, bench',
          feel: 'Grounded and curious',
          warmup: ['Cat‑cow – 8', 'Leg swings – 10', 'Goblet squat (light) – 10', 'Glute bridge – 10'],
          supersets: [
            { exercises: [{ name: 'Front Squat', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavier (+5‑10%)', notes: 'Push intensity, but keep chest up' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Single‑Leg RDL', sets: 3, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Heavier', notes: 'Hold heavier dumbbell, maintain balance' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Reverse Lunge', sets: 3, reps: '10 per leg', tempo: '3‑1‑2', weight: 'Heavier', notes: 'Don’t let front knee collapse inward' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Leg Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavier', notes: 'Full range, no bouncing at bottom' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Seated Calf Raise', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Heavier', notes: 'Pause at bottom and top' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Hamstring stretch – 30 sec/side', 'Quad stretch – 30 sec/side', 'Child’s pose – 60 sec'],
          coachingNote: 'This is where you test the strength you’ve built. Trust your form.'
        },
        {
          day: 2,
          name: 'Upper Body A – Load+',
          focus: 'Chest, back, shoulders',
          durationMin: 45,
          equipment: 'Barbell / heavy dumbbells, cables',
          feel: 'Open and expansive',
          warmup: ['Arm circles – 10', 'Band pull‑aparts – 15', 'Cat‑cow – 8', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Incline Barbell Press', sets: 4, reps: 8, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Control the descent, explode up' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Chest‑Supported Row', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Squeeze shoulder blades hard' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Push Press', sets: 3, reps: 10, tempo: 'explosive', weight: 'Heavier', notes: 'Use leg drive to move more weight' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Straight‑Arm Pulldown', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavier', notes: 'Keep arms straight, use lats' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Reverse Fly', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Light (same)', notes: 'Don’t increase weight – focus on squeeze' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Doorway chest stretch – 30 sec/side', 'Lat stretch – 30 sec/side', 'Triceps stretch – 30 sec/side'],
          coachingNote: 'Heavy but not sloppy. Every rep deserves your full attention.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Your central nervous system needs this. Rest well.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B – Load+',
          focus: 'Posterior chain, glutes',
          durationMin: 50,
          equipment: 'Barbell / heavy dumbbells, bands',
          feel: 'Powerful',
          warmup: ['Leg swings – 10', 'Hip circles – 8', 'Bodyweight squats – 10', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Sumo Deadlift', sets: 4, reps: 6, tempo: '3‑1‑1', weight: 'Heavier', notes: 'Push through floor, keep chest tall' }], rounds: 4, restAfterSuperset: 120 },
            { exercises: [{ name: 'Bulgarian Split Squat', sets: 3, reps: '8 per leg', tempo: '3‑1‑2', weight: 'Heavier', notes: 'Don’t rush the descent' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Banded Hip Thrust', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Heavier + band', notes: 'Add extra band tension' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Glute‑Ham Raise (or banded leg curl)', sets: 3, reps: 8, tempo: '3‑1‑1', weight: 'Bodyweight + band', notes: 'Control the lowering' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Donkey Calf Raise', sets: 3, reps: '15 per leg', tempo: '2‑1‑2', weight: 'Heavier', notes: 'Hold a dumbbell or use machine' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose – 30 sec/side', 'Supine hamstring stretch – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Heavy deadlifts are demanding. Take your rest – it’s earned.'
        },
        {
          day: 5,
          name: 'Upper Body B – Load+',
          focus: 'Shoulders, arms, back width',
          durationMin: 45,
          equipment: 'Dumbbells, cables, bands',
          feel: 'Pumped',
          warmup: ['Inchworms – 5', 'Thoracic rotations – 8/side', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Decline Dumbbell Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Control the dumbbells, don’t let them drift' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'T‑Bar Row', sets: 4, reps: '10 per side', tempo: '3‑1‑2', weight: 'Heavier', notes: 'Squeeze at the top' }], rounds: 4, restAfterSuperset: 90 },
            { exercises: [{ name: 'Seated DB Shoulder Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Heavier', notes: 'Keep back against bench' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Band Pull‑Apart', sets: 3, reps: 20, tempo: '2‑1‑2', weight: 'Heavier band', notes: 'Use thicker band' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Hammer Curl', sets: 3, reps: 12, tempo: '2‑1‑3', weight: 'Heavier', notes: 'Don’t use momentum' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Tricep Dip', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Weighted if possible', notes: 'Add weight vest or belt' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose – 30 sec', 'Supine twist – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'You’re lifting more than you did six weeks ago. Celebrate that.'
        },
        {
          day: 6,
          name: 'Full Body Accessory – Power + Volume',
          focus: 'Explosiveness & work capacity',
          durationMin: 40,
          equipment: 'Dumbbells, mat, box',
          feel: 'Energised',
          warmup: ['Jumping jacks – 30 sec', 'Leg swings – 10', 'Arm swings – 10', 'Box step‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Circuit: Box Jump (medium box)', sets: 4, reps: 6, tempo: 'explosive', weight: 'Bodyweight', notes: '45 sec work / 20 sec rest – add 1 round' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Explosive Push‑Up (with clap or from knees)', sets: 4, reps: '8', tempo: 'explosive', weight: 'Bodyweight', notes: 'Add 1 round' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Kettlebell Swing (heavy)', sets: 4, reps: 15, tempo: 'explosive', weight: 'Heavy', notes: 'Add 1 round' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Burpee (full)', sets: 4, reps: 10, tempo: 'fast', weight: 'Bodyweight', notes: 'Add push‑up' }], rounds: 4, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Side Plank (30 sec per side)', sets: 4, reps: '30 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Add 1 round' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Finisher: Bike Sprints (30 sec on, 30 sec off)', sets: 6, reps: '30 sec', tempo: 'all‑out', weight: 'Bodyweight', notes: 'Add 2 sprints' }], rounds: 6, restAfterSuperset: 30 }
          ],
          cooldown: ['Easy walk – 5 min', 'Child’s pose – 60 sec', 'Supine twist – 30 sec/side'],
          coachingNote: 'Power day is the exclamation point on your week. Leave it all on the floor.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'One more week to go. You’re almost there.',
          isRestDay: true
        }
      ]
    },
    // WEEK 7 – Peak (low volume, high intensity)
    {
      week: 7,
      theme: 'Peak – Express Your Strength',
      progression: 'RPE 9. Reduce sets but keep weight high (or increase slightly). Test your 3‑5 rep max on main lifts.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Peak',
          focus: 'Max strength expression',
          durationMin: 45,
          equipment: 'Barbell / heavy dumbbells, bench',
          feel: 'Focused and powerful',
          warmup: ['Cat‑cow – 8', 'Leg swings – 10', 'Goblet squat (light) – 10', 'Glute bridge – 10'],
          supersets: [
            { exercises: [{ name: 'Back Squat (3‑5 rep max attempt)', sets: 3, reps: '3‑5', tempo: 'controlled', weight: 'Very heavy (RPE 9)', notes: 'Work up to a heavy triple or set of 5. Rest fully between attempts.' }], rounds: 3, restAfterSuperset: 180 },
            { exercises: [{ name: 'Romanian Deadlift (heavy triples)', sets: 3, reps: 5, tempo: '2‑1‑2', weight: 'Heavy', notes: 'Keep form strict – no rounding' }], rounds: 3, restAfterSuperset: 120 },
            { exercises: [{ name: 'Walking Lunge (heavy)', sets: 3, reps: '6 per leg', tempo: '2‑1‑2', weight: 'Heavy', notes: 'Lower sets, higher intensity' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Leg Press (heavy set of 10)', sets: 2, reps: 10, tempo: '2‑1‑2', weight: 'Heavy', notes: '2 working sets only' }], rounds: 2, restAfterSuperset: 60 },
            { exercises: [{ name: 'Calf Raise (heavy)', sets: 2, reps: 12, tempo: '2‑1‑2', weight: 'Heavy', notes: '2 sets' }], rounds: 2, restAfterSuperset: 60 }
          ],
          cooldown: ['Hamstring stretch – 30 sec/side', 'Quad stretch – 30 sec/side', 'Child’s pose – 60 sec'],
          coachingNote: 'Today you find out what you’re capable of. Trust your training.'
        },
        {
          day: 2,
          name: 'Upper Body A – Peak',
          focus: 'Max strength expression',
          durationMin: 45,
          equipment: 'Barbell / heavy dumbbells, cables',
          feel: 'Focused and powerful',
          warmup: ['Arm circles – 10 each way', 'Band pull‑aparts – 15', 'Push‑up (light) – 8', 'Thoracic rotations – 8/side'],
          supersets: [
            { exercises: [{ name: 'Bench Press (3‑5 rep max attempt)', sets: 3, reps: '3‑5', tempo: 'controlled', weight: 'Very heavy (RPE 9)', notes: 'Work up to a heavy triple or set of 5. Use spotter if possible.' }], rounds: 3, restAfterSuperset: 180 },
            { exercises: [{ name: 'Pull‑up (weighted if possible)', sets: 3, reps: '3‑5', tempo: '2‑1‑2', weight: 'Heavy', notes: 'Add weight if bodyweight is easy. Full range of motion.' }], rounds: 3, restAfterSuperset: 120 },
            { exercises: [{ name: 'Overhead Press (heavy triple)', sets: 3, reps: 5, tempo: '2‑1‑2', weight: 'Heavy', notes: 'Strict form – no leg drive' }], rounds: 3, restAfterSuperset: 120 },
            { exercises: [{ name: 'Barbell Row (heavy set of 8)', sets: 2, reps: 8, tempo: '2‑1‑2', weight: 'Heavy', notes: '2 working sets only – maintain tension' }], rounds: 2, restAfterSuperset: 60 },
            { exercises: [{ name: 'Dips (heavy)', sets: 2, reps: '6‑8', tempo: '2‑1‑2', weight: 'Add weight if needed', notes: '2 sets to near failure' }], rounds: 2, restAfterSuperset: 60 }
          ],
          cooldown: ['Chest stretch – 30 sec/side', 'Lat stretch (bar hang) – 30 sec', 'Triceps stretch – 30 sec/side'],
          coachingNote: 'Lock in. Each rep is a statement of your strength.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Your nervous system is firing hot today. Gentle walking, deep breathing, and gratitude.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B – Peak',
          focus: 'Deadlift emphasis & power',
          durationMin: 45,
          equipment: 'Barbell, rack, blocks (optional)',
          feel: 'Explosive and controlled',
          warmup: ['Hip circles – 10/side', 'Leg swings – 10/side', 'Kettlebell swing (light) – 10', 'Box jump (low) – 5'],
          supersets: [
            { exercises: [{ name: 'Deadlift (3‑5 rep max attempt)', sets: 3, reps: '3‑5', tempo: 'controlled', weight: 'Very heavy (RPE 9)', notes: 'Reset each rep. Focus on brace.' }], rounds: 3, restAfterSuperset: 180 },
            { exercises: [{ name: 'Front Squat (heavy triple)', sets: 3, reps: 5, tempo: '2‑1‑2', weight: 'Heavy', notes: 'Keep elbows high. Depth is priority.' }], rounds: 3, restAfterSuperset: 120 },
            { exercises: [{ name: 'Nordic Hamstring Curl', sets: 3, reps: '5‑8', tempo: '3‑1‑2', weight: 'Bodyweight', notes: 'Lower as slow as possible' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Bulgarian Split Squat', sets: 2, reps: '6 per leg', tempo: '2‑1‑2', weight: 'Heavy dumbbells', notes: '2 sets each leg – no extra' }], rounds: 2, restAfterSuperset: 60 },
            { exercises: [{ name: 'Standing Calf Raise (heavy)', sets: 2, reps: 10, tempo: '2‑2‑2', weight: 'Heavy', notes: 'Full stretch at bottom' }], rounds: 2, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose – 45 sec/side', 'Seated forward fold – 60 sec', 'Lying glute stretch – 30 sec/side'],
          coachingNote: 'The deadlift tells no lies. Stay patient on the pull.'
        },
        {
          day: 5,
          name: 'Upper Body B – Peak',
          focus: 'Vertical plane & lockout strength',
          durationMin: 45,
          equipment: 'Barbell, dumbbells, pull‑up bar',
          feel: 'Sharp and locked in',
          warmup: ['Shoulder rotations – 10 each way', 'Scapular pull‑ups – 10', 'Inchworms – 6', 'Band dislocates – 10'],
          supersets: [
            { exercises: [{ name: 'Close‑Grip Bench Press (heavy triple)', sets: 3, reps: 5, tempo: '2‑1‑2', weight: 'Heavy', notes: 'Elbows tucked. Triceps focus.' }], rounds: 3, restAfterSuperset: 120 },
            { exercises: [{ name: 'Weighted Chin‑up (3‑5 rep max)', sets: 3, reps: '3‑5', tempo: 'controlled', weight: 'Heavy', notes: 'Supinated grip. No kipping.' }], rounds: 3, restAfterSuperset: 120 },
            { exercises: [{ name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: 6, tempo: '2‑1‑2', weight: 'Heavy', notes: 'Back supported. Full ROM.' }], rounds: 3, restAfterSuperset: 90 },
            { exercises: [{ name: 'Face Pull (heavy)', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Heavy', notes: 'External rotation focus' }], rounds: 2, restAfterSuperset: 60 },
            { exercises: [{ name: 'EZ Bar Skull Crusher', sets: 2, reps: 8, tempo: '3‑1‑2', weight: 'Moderate‑heavy', notes: 'Control the negative' }], rounds: 2, restAfterSuperset: 60 }
          ],
          cooldown: ['Cross‑body shoulder stretch – 30 sec/side', 'Triceps lacrosse ball roll – 30 sec/arm', 'Child’s pose – 60 sec'],
          coachingNote: 'This is your victory lap for the week. Leave nothing in the tank.'
        },
        {
          day: 6,
          name: 'Full Body Accessory – Power Maintenance',
          focus: 'Light plyos & skill reinforcement',
          durationMin: 35,
          equipment: 'Box, light bands',
          feel: 'Playful and fast',
          warmup: ['Jumping jacks – 30 sec', 'Leg swings – 10', 'Arm swings – 10', 'Box step‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Circuit: Box Jump (low box, focus on soft landing)', sets: 3, reps: 6, tempo: 'explosive', weight: 'Bodyweight', notes: '45 sec work / 20 sec rest' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Banded Push‑Press (light band)', sets: 3, reps: 10, tempo: 'explosive', weight: 'Band', notes: 'Use light tension' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Kettlebell Swing (light, fast)', sets: 3, reps: 15, tempo: 'explosive', weight: 'Light', notes: 'Focus on speed, not weight' }], rounds: 3, restAfterSuperset: 0 },
            { exercises: [{ name: 'Circuit: Lateral Hops (over a line)', sets: 3, reps: '12 each way', tempo: 'fast', weight: 'Bodyweight', notes: 'Stay light on feet' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Finisher: Sprint Intervals (20 sec on, 40 sec off)', sets: 4, reps: '20 sec', tempo: 'all‑out', weight: 'Bodyweight', notes: 'No extra volume – just quality' }], rounds: 4, restAfterSuperset: 40 }
          ],
          cooldown: ['Easy walk – 5 min', 'Child’s pose – 60 sec', 'Supine twist – 30 sec/side'],
          coachingNote: 'Power day is shorter this week. Preserve your CNS for the peak.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You’ve expressed your strength. Now let it settle.',
          isRestDay: true
        }
      ]
    },
    // WEEK 8 – Deload & Transition
    {
      week: 8,
      theme: 'Deload – Reap & Rebuild',
      progression: 'RPE 5‑6. Reduce volume by 40‑50%, keep intensity moderate. Prepare for next cycle or planned rest.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Deload',
          focus: 'Movement quality & joint health',
          durationMin: 35,
          equipment: 'Light weights, bands, foam roller',
          feel: 'Fresh and mobile',
          warmup: ['Cat‑cow – 8', 'World’s greatest stretch – 5/side', 'Air squat – 12', 'Banded glute activation – 10/side'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat (light)', sets: 3, reps: 10, tempo: '2‑1‑2', weight: 'Light (RPE 5)', notes: 'Focus on depth and posture' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Romanian Deadlift (light)', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Light', notes: 'Perfect hinge pattern' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Leg Press', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Light‑moderate', notes: 'Pump, not grind' }], rounds: 2, restAfterSuperset: 45 },
            { exercises: [{ name: 'Calf Raise', sets: 2, reps: 20, tempo: '1‑1‑2', weight: 'Light', notes: 'High reps, full stretch' }], rounds: 2, restAfterSuperset: 45 }
          ],
          cooldown: ['Lizard pose – 30 sec/side', 'Hamstring smash with roller – 60 sec/side', 'Happy baby – 60 sec'],
          coachingNote: 'You earned this. Move to feel good, not to break records.'
        },
        {
          day: 2,
          name: 'Upper Body A – Deload',
          focus: 'Shoulder health & scapular control',
          durationMin: 35,
          equipment: 'Light bands, dumbbells, foam roller',
          feel: 'Relaxed and recharged',
          warmup: ['Band pull‑aparts – 20', 'Thoracic extensions on roller – 10', 'Push‑up plus (scapular) – 12', 'YTW raises (no weight) – 8 each'],
          supersets: [
            { exercises: [{ name: 'Incline Dumbbell Press (light)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Squeeze at top' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Lat Pulldown (light)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Light', notes: 'Stretch at top' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Seated Cable Row (light)', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Retract shoulder blades' }], rounds: 2, restAfterSuperset: 45 },
            { exercises: [{ name: 'Lateral Raise (light)', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'No momentum' }], rounds: 2, restAfterSuperset: 45 }
          ],
          cooldown: ['Doorway pec stretch – 45 sec/side', 'Hang from bar – 30 sec', 'Neck nods and rotations – 30 sec each'],
          coachingNote: 'Let inflammation settle. Your next cycle starts here.'
        },
        {
          day: 3,
          name: 'Active Recovery',
          focus: 'Deep restoration',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Walk, stretch, foam roll. Be kind to your body.',
          isRestDay: true
        },
        {
          day: 4,
          name: 'Lower Body B – Deload',
          focus: 'Posterior chain refresh',
          durationMin: 35,
          equipment: 'Light barbell, light dumbbells, mat',
          feel: 'Easy and spacious',
          warmup: ['Leg swings – 10', 'Hip circles – 8', 'Bodyweight squats – 10', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Deadlift (light, technical)', sets: 3, reps: 8, tempo: '3‑1‑1', weight: 'Light (40‑50%)', notes: 'Focus on hip hinge and brace' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bulgarian Split Squat (bodyweight or very light)', sets: 3, reps: '8 per leg', tempo: '3‑1‑2', weight: 'Bodyweight', notes: 'No added weight' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Hip Thrust (light)', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Squeeze gently' }], rounds: 2, restAfterSuperset: 60 },
            { exercises: [{ name: 'Seated Calf Raise (light)', sets: 2, reps: 20, tempo: '1‑1‑2', weight: 'Light', notes: 'Full range, no rush' }], rounds: 2, restAfterSuperset: 45 }
          ],
          cooldown: ['Pigeon pose – 30 sec/side', 'Supine hamstring stretch – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Deload is not regression. It’s the soil where your next gains grow.'
        },
        {
          day: 5,
          name: 'Upper Body B – Deload',
          focus: 'Mobility & blood flow',
          durationMin: 35,
          equipment: 'Light bands, light dumbbells',
          feel: 'Relaxed and spacious',
          warmup: ['Inchworms – 5', 'Thoracic rotations – 8/side', 'Scapular push‑ups – 10'],
          supersets: [
            { exercises: [{ name: 'Push‑Up (incline or knees)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Control the descent' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Band Row (light)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Light band', notes: 'Squeeze shoulder blades' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Band Pull‑Apart', sets: 2, reps: 20, tempo: '2‑1‑2', weight: 'Light band', notes: 'Hold 1 sec at peak' }], rounds: 2, restAfterSuperset: 45 },
            { exercises: [{ name: 'Bicep Curl (light)', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'No fatigue, just pump' }], rounds: 2, restAfterSuperset: 45 },
            { exercises: [{ name: 'Tricep Kickback (light)', sets: 2, reps: 15, tempo: '2‑1‑2', weight: 'Light', notes: 'Elbows high' }], rounds: 2, restAfterSuperset: 45 }
          ],
          cooldown: ['Child’s pose – 30 sec', 'Supine twist – 30 sec/side', 'Figure‑four stretch – 30 sec/side'],
          coachingNote: 'Light and intentional. This is a celebration of your range of motion.'
        },
        {
          day: 6,
          name: 'Full Body Accessory – Active Recovery Flow',
          focus: 'Yoga / mobility / light cardio',
          durationMin: 30,
          equipment: 'Mat, foam roller',
          feel: 'Joyful',
          warmup: ['Cat‑cow – 10', 'Deep squat hold – 45 sec', 'Thoracic rotations – 8/side'],
          supersets: [
            { exercises: [{ name: 'Flow: Sun Salutations A', sets: 3, reps: '5 breaths each', tempo: 'slow', weight: 'Bodyweight', notes: 'Connect breath to movement' }], rounds: 3, restAfterSuperset: 30 },
            { exercises: [{ name: 'Flow: Standing Forward Fold to Half Lift', sets: 3, reps: '8 cycles', tempo: 'slow', weight: 'Bodyweight', notes: 'Hamstring focus' }], rounds: 3, restAfterSuperset: 30 },
            { exercises: [{ name: 'Flow: Low Lunge to Hamstring Stretch', sets: 3, reps: '5 breaths per side', tempo: 'hold', weight: 'Bodyweight', notes: 'Move gently' }], rounds: 3, restAfterSuperset: 30 },
            { exercises: [{ name: 'Finisher: Breathing (box breathing)', sets: 1, reps: '10 cycles', tempo: '4‑4‑4‑4', weight: 'N/A', notes: 'Inhale 4, hold 4, exhale 4, hold 4' }], rounds: 1, restAfterSuperset: 0 }
          ],
          cooldown: ['Legs up the wall – 3 min', 'Supine twist – 30 sec/side', 'Savasana – 2 min'],
          coachingNote: 'This is your victory lap. Breathe, smile, and feel how strong you’ve become.'
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Complete rest & reflection',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You completed The Forge. The muscle you built is yours forever – as is the discipline. Now go live strong.',
          isRestDay: true
        }
      ]
    }
  ]
};
