import type { TrainingPath } from "./types";

export const strengthFromTheGroundUp: TrainingPath = {
  id: 'strength-from-the-ground-up',
  name: 'Strength from the Ground Up',
  subtitle: 'The body you build by listening',
  focus: 'strength',
  description:
    'Strength is not punishment. It is discovering what your body can do when you move with intention. This 8‑week plan builds full‑body resilience through slow, controlled lifting, supersets that respect your energy, and two weekly recovery days. You will learn to hinge, squat, push, pull – and trust your body again.',
  whoItIsFor:
    'For the woman who has been told to "push harder" but craves permission to go slowly. Whether you have never touched a dumbbell or are returning after injury or burnout, this plan meets you exactly where you are.',
  weeks: [
    // WEEK 1 – Grounding
    {
      week: 1,
      theme: 'Grounding – Learning the Patterns',
      progression: 'RPE 6‑7. Light dumbbells (3‑5 kg). Tempo 3‑1‑2. Form first.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Grounding',
          focus: 'Glutes, hamstrings, quads, core',
          durationMin: 40,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Curious and patient',
          warmup: ['Cat‑cow – 8', 'Deep squat hold – 30 sec', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Romanian Deadlift (DB)', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge (bodyweight)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Dead Bug', sets: 3, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '25 sec', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Side Plank', sets: 3, reps: '20 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'You are learning the patterns. Tempo over weight, always.'
        },
        {
          day: 2,
          name: 'Upper Body A – Grounding',
          focus: 'Chest, back, shoulders, core',
          durationMin: 40,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Steady and open',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'Push‑Up', sets: 3, reps: 8, tempo: '2‑1‑2', weight: 'Bodyweight (incline if needed)', notes: '3 rounds' }, { name: 'Single‑Arm DB Row', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Overhead Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Lateral Raise', sets: 3, reps: 10, tempo: '2‑1‑2', weight: '2‑3 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bird Dog', sets: 3, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Plank with Shoulder Tap', sets: 3, reps: '8 taps per side', tempo: 'slow', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Doorway chest opener'],
          coachingNote: 'Start where you are. Push‑ups can be on knees or a bench – meet your body.'
        },
        {
          day: 3,
          name: 'Lower Body B – Grounding',
          focus: 'Quads, glutes, adductors, core',
          durationMin: 40,
          equipment: 'Dumbbells (3‑5 kg)',
          feel: 'Grounded and slow',
          warmup: ['Leg swings', 'Hip circles', 'Bodyweight squats', 'Clam shells'],
          supersets: [
            { exercises: [{ name: 'Sumo Squat', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Reverse Lunge', sets: 3, reps: '8 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge March', sets: 3, reps: '8 per side', tempo: '2‑1‑2', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Hollow Body Hold', sets: 3, reps: '20 sec', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Side Plank', sets: 3, reps: '20 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Marching Glute Bridge', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'Slow reps reveal the work. There is nothing to rush.'
        },
        {
          day: 4,
          name: 'Upper Body B – Grounding',
          focus: 'Back, chest, arms, core',
          durationMin: 40,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Flowing and integrated',
          warmup: ['Inchworms', 'Thoracic rotations', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Bent‑Over Row', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Floor Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 10, tempo: '2‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Tricep Extension', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '25 sec', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Bird Dog', sets: 3, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'You are introducing your body to a new language. Be kind to the beginner.'
        },
        {
          day: 5,
          name: 'Lower Body C – Grounding',
          focus: 'Hamstrings, glutes, quads, core',
          durationMin: 40,
          equipment: 'Dumbbells (3‑5 kg)',
          feel: 'Rooted',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'DB Romanian Deadlift', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Bodyweight Squat (paused)', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Step‑Up', sets: 3, reps: '8 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Seated Hip Abduction', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Band', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Dead Bug', sets: 3, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Plank with Knee Dip', sets: 3, reps: '8 per side', tempo: 'slow', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'Three days in, your nervous system is already learning.'
        },
        {
          day: 6,
          name: 'Walk & Restore',
          focus: 'Active recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Moving slowly is still moving forward.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Recovery',
          durationMin: 0,
          equipment: 'None',
          feel: 'Soft',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Rest is part of the work.',
          isRestDay: true
        }
      ]
    },
    // WEEK 2 – Stability
    {
      week: 2,
      theme: 'Stability – Slowing Down to Own the Movement',
      progression: 'RPE 6‑7. Same weight. Tempo 4‑1‑2 on squats and RDLs. Add 2‑sec holds.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Stability',
          focus: 'Glutes, hamstrings, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Slow and controlled',
          warmup: ['Cat‑cow – 8', 'Deep squat hold – 45 sec', 'Glute bridges – 12'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 10, tempo: '4‑1‑2', weight: '3‑5 kg', notes: '3 rounds, 2‑sec pause at bottom' }, { name: 'Romanian Deadlift (DB)', sets: 3, reps: 10, tempo: '4‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge (bodyweight)', sets: 3, reps: 12, tempo: '2‑2‑2', weight: 'Bodyweight', notes: '2‑sec hold at top' }, { name: 'Dead Bug', sets: 3, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '30 sec', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Side Plank', sets: 3, reps: '22 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'The pause is where the strength lives. Linger there.'
        },
        {
          day: 2,
          name: 'Upper Body A – Stability',
          focus: 'Chest, back, shoulders, core',
          durationMin: 45,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Patient and stable',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'Push‑Up', sets: 3, reps: 10, tempo: '3‑1‑2', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Single‑Arm DB Row', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds, 2‑sec hold at top' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Overhead Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Lateral Raise', sets: 3, reps: 10, tempo: '2‑1‑2', weight: '2‑3 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bird Dog', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '2‑sec hold at extension' }, { name: 'Plank with Shoulder Tap', sets: 3, reps: '10 taps per side', tempo: 'slow', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Doorway chest opener'],
          coachingNote: 'Stability is built one pause at a time.'
        },
        {
          day: 3,
          name: 'Lower Body B – Stability',
          focus: 'Quads, glutes, adductors, core',
          durationMin: 45,
          equipment: 'Dumbbells (3‑5 kg)',
          feel: 'Anchored',
          warmup: ['Leg swings', 'Hip circles', 'Bodyweight squats', 'Clam shells'],
          supersets: [
            { exercises: [{ name: 'Sumo Squat', sets: 3, reps: 10, tempo: '4‑1‑2', weight: '3‑5 kg', notes: '2‑sec pause at bottom' }, { name: 'Reverse Lunge', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge March', sets: 3, reps: '10 per side', tempo: '2‑2‑2', weight: 'Bodyweight', notes: '2‑sec hold each' }, { name: 'Hollow Body Hold', sets: 3, reps: '22 sec', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Side Plank', sets: 3, reps: '22 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Marching Glute Bridge', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'You are teaching the deep stabilisers to wake up. They will.'
        },
        {
          day: 4,
          name: 'Upper Body B – Stability',
          focus: 'Back, chest, arms, core',
          durationMin: 45,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Composed',
          warmup: ['Inchworms', 'Thoracic rotations', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Bent‑Over Row', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '2‑sec hold at top' }, { name: 'Floor Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 10, tempo: '2‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Tricep Extension', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '30 sec', tempo: 'hold', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Bird Dog', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'Owning the slow rep is how you earn the next layer.'
        },
        {
          day: 5,
          name: 'Lower Body C – Stability',
          focus: 'Hamstrings, glutes, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (3‑5 kg)',
          feel: 'Steady',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'DB Romanian Deadlift', sets: 3, reps: 10, tempo: '4‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Bodyweight Squat (paused)', sets: 3, reps: 10, tempo: '4‑1‑2', weight: 'Bodyweight', notes: '2‑sec pause at bottom' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Step‑Up', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '3 rounds' }, { name: 'Seated Hip Abduction', sets: 3, reps: 14, tempo: '2‑1‑2', weight: 'Band', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Dead Bug', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '3 rounds' }, { name: 'Plank with Knee Dip', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '3 rounds' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'Stability now means strength later. Trust the slow build.'
        },
        {
          day: 6,
          name: 'Walk & Restore',
          focus: 'Active recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Moving slowly is still moving forward.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Rest',
          focus: 'Recovery',
          durationMin: 0,
          equipment: 'None',
          feel: 'Soft',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Rest is part of the work.',
          isRestDay: true
        }
      ]
    },
    // WEEK 3 – Volume
    {
      week: 3,
      theme: 'Volume – Accumulating Quality Reps',
      progression: 'RPE 6‑7. Same weight as Week 2. 4 rounds per superset. Same tempos.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Volume',
          focus: 'Glutes, hamstrings, quads, core',
          durationMin: 50,
          equipment: 'Dumbbells (3‑5 kg), mat, bench',
          feel: 'Curious and grounded',
          warmup: ['Cat‑cow – 8', 'Deep squat hold – 30 sec', 'Standing shoulder circles', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 4, reps: 12, tempo: '4‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }, { name: 'Romanian Deadlift (DB)', sets: 4, reps: 12, tempo: '4‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge (bodyweight)', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Dead Bug', sets: 4, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 4, reps: '35 sec', tempo: 'hold', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Side Plank', sets: 4, reps: '25 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'More volume means more chances to practice the movement. Quality over speed.'
        },
        {
          day: 2,
          name: 'Upper Body A – Volume',
          focus: 'Chest, back, shoulders, core',
          durationMin: 50,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Steady and capable',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'Push‑Up', sets: 4, reps: 10, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Single‑Arm DB Row', sets: 4, reps: '12 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Overhead Press', sets: 4, reps: 10, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }, { name: 'Lateral Raise', sets: 4, reps: 12, tempo: '2‑1‑2', weight: '2‑3 kg', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bird Dog', sets: 4, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Plank with Shoulder Tap', sets: 4, reps: '10 taps per side', tempo: 'slow', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Each extra round is a brick in your foundation.'
        },
        {
          day: 3,
          name: 'Lower Body B – Volume',
          focus: 'Quads, glutes, adductors, core',
          durationMin: 50,
          equipment: 'Dumbbells (3‑5 kg), bench',
          feel: 'Grounded and rooted',
          warmup: ['Leg swings', 'Hip circles', 'Bodyweight squats', 'Clam shells'],
          supersets: [
            { exercises: [{ name: 'Sumo Squat', sets: 4, reps: 12, tempo: '4‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }, { name: 'Reverse Lunge', sets: 4, reps: '10 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge March', sets: 4, reps: '10 per side', tempo: '2‑1‑2', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Hollow Body Hold', sets: 4, reps: '25 sec', tempo: 'hold', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Side Plank', sets: 4, reps: '25 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Marching Glute Bridge', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'Volume builds endurance. Endurance builds trust in your body.'
        },
        {
          day: 4,
          name: 'Upper Body B – Volume',
          focus: 'Back, chest, arms, core',
          durationMin: 50,
          equipment: 'Dumbbells (3‑5 kg), mat',
          feel: 'Flowing and integrated',
          warmup: ['Inchworms', 'Thoracic rotations', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Bent‑Over Row', sets: 4, reps: 12, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }, { name: 'Floor Press', sets: 4, reps: 12, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 4, reps: 12, tempo: '2‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }, { name: 'Tricep Extension', sets: 4, reps: 12, tempo: '3‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 4, reps: '35 sec', tempo: 'hold', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Bird Dog', sets: 4, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'You’re not just doing more – you’re becoming more.'
        },
        {
          day: 5,
          name: 'Lower Body C – Volume',
          focus: 'Hamstrings, glutes, quads, core',
          durationMin: 50,
          equipment: 'Dumbbells (3‑5 kg), bench',
          feel: 'Rooted and powerful',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'DB Romanian Deadlift', sets: 4, reps: 12, tempo: '5‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }, { name: 'Bodyweight Squat (paused)', sets: 4, reps: 12, tempo: '3‑1‑2', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Step‑Up', sets: 4, reps: '10 per side', tempo: '3‑1‑2', weight: '3‑5 kg', notes: '4 rounds' }, { name: 'Seated Hip Abduction', sets: 4, reps: 15, tempo: '2‑1‑2', weight: 'Band', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 },
            { exercises: [{ name: 'Dead Bug', sets: 4, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '4 rounds' }, { name: 'Plank with Knee Dip', sets: 4, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '4 rounds' }], rounds: 4, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'Volume is the path to unconscious competence.'
        },
        {
          day: 6,
          name: 'Walk & Restore',
          focus: 'Active recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Moving slowly is still moving forward.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Full Rest',
          focus: 'Stillness',
          durationMin: 0,
          equipment: 'None',
          feel: 'Ready for Week 4',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Rest is where the adaptation happens.',
          isRestDay: true
        }
      ]
    },
    // WEEK 4 – Load
    {
      week: 4,
      theme: 'Load – Adding Intentional Weight',
      progression: 'RPE 7. Increase dumbbells to 5‑8 kg — a starting guide, not a ceiling. Tempo returns to 3‑1‑2. 3 rounds per superset. Progression rule: any session where you finish every rep with 2+ in reserve (below RPE 7), go up 1‑2 kg next time — including beyond 8 kg.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Load',
          focus: 'Glutes, hamstrings, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat, bench',
          feel: 'Curious and grounded',
          warmup: ['Cat‑cow – 8', 'Deep squat hold – 30 sec', 'Standing shoulder circles', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Heavier, but same control' }, { name: 'Romanian Deadlift', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Feel the load, don’t rush' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg on hips', notes: 'Add weight' }, { name: 'Dead Bug', sets: 3, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: 'Still bodyweight' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Increase time' }, { name: 'Side Plank', sets: 3, reps: '30 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: 'Increase time' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Heavier doesn’t mean harder – it means you’re ready.'
        },
        {
          day: 2,
          name: 'Upper Body A – Load',
          focus: 'Chest, back, shoulders, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Steady and capable',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'Push‑Up', sets: 3, reps: 10, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'If easy, add weight vest or elevate feet' }, { name: 'Single‑Arm DB Row', sets: 3, reps: '12 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Heavier' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Overhead Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Heavier' }, { name: 'Lateral Raise', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '3‑5 kg', notes: 'Keep light' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bird Dog', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: 'Add 2 lb ankle weight if desired' }, { name: 'Plank with Shoulder Tap', sets: 3, reps: '10 taps per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'The weight is a tool. You are the master.'
        },
        {
          day: 3,
          name: 'Lower Body B – Load',
          focus: 'Quads, glutes, adductors, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Grounded and rooted',
          warmup: ['Leg swings', 'Hip circles', 'Bodyweight squats', 'Clam shells'],
          supersets: [
            { exercises: [{ name: 'Sumo Squat', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Hold one DB' }, { name: 'Reverse Lunge', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Hold DBs' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge March (weighted)', sets: 3, reps: '10 per side', tempo: '2‑1‑2', weight: '5‑8 kg on hips', notes: '' }, { name: 'Hollow Body Hold', sets: 3, reps: '30 sec', tempo: 'hold', weight: 'Bodyweight', notes: 'Increase time' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Side Plank', sets: 3, reps: '30 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Marching Glute Bridge (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'Heavier weight demands more focus. Stay present.'
        },
        {
          day: 4,
          name: 'Upper Body B – Load',
          focus: 'Back, chest, arms, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Flowing and integrated',
          warmup: ['Inchworms', 'Thoracic rotations', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Bent‑Over Row', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Floor Press', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Tricep Extension', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Bird Dog', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'Strength is not about how much you lift. It’s about how you feel when you lift it.'
        },
        {
          day: 5,
          name: 'Lower Body C – Load',
          focus: 'Hamstrings, glutes, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Rooted and powerful',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'DB Romanian Deadlift', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Bodyweight Squat (paused)', sets: 3, reps: 12, tempo: '3‑1‑2', weight: 'Bodyweight', notes: 'Hold 2 sec' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Step‑Up', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Seated Hip Abduction', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Band', notes: 'Increase band tension' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Dead Bug', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }, { name: 'Plank with Knee Dip', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'The weight is just a messenger. The real message comes from within.'
        },
        {
          day: 6,
          name: 'Walk & Restore',
          focus: 'Active recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Listen to what your body asks for today.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Full Rest',
          focus: 'Stillness',
          durationMin: 0,
          equipment: 'None',
          feel: 'Ready for Week 5',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You’re not the same woman who started four weeks ago.',
          isRestDay: true
        }
      ]
    },
    // WEEK 5 – Density
    {
      week: 5,
      theme: 'Density – Doing More in Less Time',
      progression: 'RPE 7. Same weight as Week 4 — or heavier if 8 kg started to feel easy. Reduce rest to 45 sec. Tempo 3‑1‑2.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Density',
          focus: 'Glutes, hamstrings, quads, core',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), mat, bench',
          feel: 'Curious and grounded',
          warmup: ['Cat‑cow – 8', 'Deep squat hold – 30 sec', 'Standing shoulder circles', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Romanian Deadlift', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Glute Bridge (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Dead Bug', sets: 3, reps: '8 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Side Plank', sets: 3, reps: '30 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 45 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Less rest means more focus. Your endurance is growing.'
        },
        {
          day: 2,
          name: 'Upper Body A – Density',
          focus: 'Chest, back, shoulders, core',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Steady and capable',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'Push‑Up', sets: 3, reps: 10, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }, { name: 'Single‑Arm DB Row', sets: 3, reps: '12 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Overhead Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Lateral Raise', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '3‑5 kg', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Bird Dog', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }, { name: 'Plank with Shoulder Tap', sets: 3, reps: '10 taps per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 45 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Shorter rest challenges your work capacity. Breathe steady.'
        },
        {
          day: 3,
          name: 'Lower Body B – Density',
          focus: 'Quads, glutes, adductors, core',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Grounded and rooted',
          warmup: ['Leg swings', 'Hip circles', 'Bodyweight squats', 'Clam shells'],
          supersets: [
            { exercises: [{ name: 'Sumo Squat', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Reverse Lunge', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Glute Bridge March (weighted)', sets: 3, reps: '10 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Hollow Body Hold', sets: 3, reps: '30 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Side Plank', sets: 3, reps: '30 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Marching Glute Bridge (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 45 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'Density builds stamina. Stamina builds trust.'
        },
        {
          day: 4,
          name: 'Upper Body B – Density',
          focus: 'Back, chest, arms, core',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Flowing and integrated',
          warmup: ['Inchworms', 'Thoracic rotations', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Bent‑Over Row', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Floor Press', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Tricep Extension', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Bird Dog', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 45 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'Moving faster between sets keeps your heart kind.'
        },
        {
          day: 5,
          name: 'Lower Body C – Density',
          focus: 'Hamstrings, glutes, quads, core',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Rooted and powerful',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'DB Romanian Deadlift', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Bodyweight Squat (paused)', sets: 3, reps: 12, tempo: '3‑1‑2', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Step‑Up', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Seated Hip Abduction', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Band', notes: '' }], rounds: 3, restAfterSuperset: 45 },
            { exercises: [{ name: 'Dead Bug', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }, { name: 'Plank with Knee Dip', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 45 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'Density week – you’re becoming efficient.'
        },
        {
          day: 6,
          name: 'Walk & Restore',
          focus: 'Active recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Breath is the bridge between density and stillness.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Full Rest',
          focus: 'Stillness',
          durationMin: 0,
          equipment: 'None',
          feel: 'Ready for Week 6',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You’re building capacity, not chaos.',
          isRestDay: true
        }
      ]
    },
    // WEEK 6 – Power
    {
      week: 6,
      theme: 'Power – Expressing Strength',
      progression: 'RPE 7‑8. Same weight as Week 5, or size up on the compounds if last week stayed below RPE 7. Increase reps to 14‑15. Tempo 2‑1‑2 (explosive).',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Power',
          focus: 'Glutes, hamstrings, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat, bench',
          feel: 'Curious and grounded',
          warmup: ['Cat‑cow – 8', 'Deep squat hold – 30 sec', 'Standing shoulder circles', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Explode up, control down' }, { name: 'Romanian Deadlift', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Drive hips through' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Explosive up' }, { name: 'Dead Bug', sets: 3, reps: '10 per side', tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '45 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Side Plank', sets: 3, reps: '35 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Power is not about speed – it’s about intention.'
        },
        {
          day: 2,
          name: 'Upper Body A – Power',
          focus: 'Chest, back, shoulders, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Steady and capable',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'Push‑Up', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Explosive up' }, { name: 'Single‑Arm DB Row', sets: 3, reps: '15 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Explosive pull' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Overhead Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Lateral Raise', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '3‑5 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bird Dog', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }, { name: 'Plank with Shoulder Tap', sets: 3, reps: '12 taps per side', tempo: 'moderate', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Power week – feel the energy in every rep.'
        },
        {
          day: 3,
          name: 'Lower Body B – Power',
          focus: 'Quads, glutes, adductors, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Grounded and rooted',
          warmup: ['Leg swings', 'Hip circles', 'Bodyweight squats', 'Clam shells'],
          supersets: [
            { exercises: [{ name: 'Sumo Squat', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Reverse Lunge', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Glute Bridge March (weighted)', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Hollow Body Hold', sets: 3, reps: '35 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Side Plank', sets: 3, reps: '35 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Marching Glute Bridge (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'You’re not just lifting – you’re learning to express strength.'
        },
        {
          day: 4,
          name: 'Upper Body B – Power',
          focus: 'Back, chest, arms, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Flowing and integrated',
          warmup: ['Inchworms', 'Thoracic rotations', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Bent‑Over Row', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Floor Press', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Tricep Extension', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '45 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Bird Dog', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'Power is the marriage of control and speed.'
        },
        {
          day: 5,
          name: 'Lower Body C – Power',
          focus: 'Hamstrings, glutes, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Rooted and powerful',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'DB Romanian Deadlift', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Bodyweight Squat (paused)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Step‑Up', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Seated Hip Abduction', sets: 3, reps: 18, tempo: '2‑1‑2', weight: 'Band', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Dead Bug', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }, { name: 'Plank with Knee Dip', sets: 3, reps: '12 per side', tempo: 'moderate', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'More reps, same weight – you’re building muscular endurance and power.'
        },
        {
          day: 6,
          name: 'Walk & Restore',
          focus: 'Active recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Power also means knowing when to rest.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Full Rest',
          focus: 'Stillness',
          durationMin: 0,
          equipment: 'None',
          feel: 'Ready for Week 7',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'You’ve come so much further than you think.',
          isRestDay: true
        }
      ]
    },
    // WEEK 7 – Variation
    {
      week: 7,
      theme: 'Variation – New Stimulus, Same Growth',
      progression: 'RPE 7‑8. Same load as Week 6 — heavier on the lifts that feel ready. Change exercises to avoid plateau.',
      sessions: [
        {
          day: 1,
          name: 'Lower Body A – Variation',
          focus: 'Glutes, hamstrings, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat, bench',
          feel: 'Curious and grounded',
          warmup: ['Cat‑cow – 8', 'Deep squat hold – 30 sec', 'Standing shoulder circles', 'Glute bridges – 10'],
          supersets: [
            { exercises: [{ name: 'Front Squat (DB)', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'New variation' }, { name: 'Single‑Leg RDL', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Challenge balance' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Hip Thrust (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Replace glute bridge' }, { name: 'Windshield Wipers', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: 'Core rotation' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank', sets: 3, reps: '45 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }, { name: 'Side Plank with Reach', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: 'Add rotation' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Different exercise, same intention. Your body adapts – surprise it.'
        },
        {
          day: 2,
          name: 'Upper Body A – Variation',
          focus: 'Chest, back, shoulders, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Steady and capable',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'Incline Push‑Up', sets: 3, reps: 12, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Hands on bench' }, { name: 'Renegade Row', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Plank + row' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Arnold Press', sets: 3, reps: 10, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Rotate press' }, { name: 'Upright Row', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Close grip' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank with Leg Lift', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }, { name: 'Dead Bug with Press', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Light', notes: 'Hold light DB' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'New movements wake up dormant connections.'
        },
        {
          day: 3,
          name: 'Lower Body B – Variation',
          focus: 'Quads, glutes, adductors, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Grounded and rooted',
          warmup: ['Leg swings', 'Hip circles', 'Bodyweight squats', 'Clam shells'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat (heels elevated)', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Target quads' }, { name: 'Curtsy Lunge', sets: 3, reps: '10 per side', tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Single‑Leg Glute Bridge', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }, { name: 'Pallof Press', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Band/Cable', notes: 'Anti‑rotation' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Side Plank with Leg Abduction', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }, { name: 'Russian Twist', sets: 3, reps: '15 per side', tempo: 'moderate', weight: 'Light DB', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'Change is growth in disguise.'
        },
        {
          day: 4,
          name: 'Upper Body B – Variation',
          focus: 'Back, chest, arms, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Flowing and integrated',
          warmup: ['Inchworms', 'Thoracic rotations', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Pendlay Row (light)', sets: 3, reps: 10, tempo: 'explosive', weight: '5‑8 kg', notes: 'From floor each rep' }, { name: 'Decline Push‑Up', sets: 3, reps: 10, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Feet elevated' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Hammer Curl', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Palms facing' }, { name: 'Skull Crusher', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Supine triceps extension' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Plank with Row', sets: 3, reps: '8 per side', tempo: 'slow', weight: '5‑8 kg', notes: 'High plank, row one DB' }, { name: 'Bird Dog with Elbow to Knee', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'Novelty creates new pathways.'
        },
        {
          day: 5,
          name: 'Lower Body C – Variation',
          focus: 'Hamstrings, glutes, quads, core',
          durationMin: 45,
          equipment: 'Dumbbells (5‑8 kg), bench',
          feel: 'Rooted and powerful',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'Kettlebell Swing', sets: 3, reps: 15, tempo: 'explosive', weight: '8 kg', notes: 'Hip drive' }, { name: 'Box Squat (light)', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: 'Touch and go' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Nordic Hamstring Curl (negatives)', sets: 3, reps: '6', tempo: 'slow', weight: 'Bodyweight', notes: 'Lower as slow as possible' }, { name: 'Copenhagen Plank', sets: 3, reps: '15 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: 'Adductor focus' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Leg Raise', sets: 3, reps: 12, tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }, { name: 'Plank with Knee to Elbow', sets: 3, reps: '10 per side', tempo: 'slow', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'Variation prevents plateau – and boredom.'
        },
        {
          day: 6,
          name: 'Walk & Restore',
          focus: 'Active recovery',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Try a new walking route to keep your mind fresh.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Full Rest',
          focus: 'Stillness',
          durationMin: 0,
          equipment: 'None',
          feel: 'Ready for Week 8',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'One more week. You’ve done the work.',
          isRestDay: true
        }
      ]
    },
    // WEEK 8 – Integration
    {
      week: 8,
      theme: 'Integration – Becoming Unconscious Conscious',
      progression: 'RPE 6‑7. Full body circuits. Choose exercises from previous weeks. Move with flow. Next cycle: restart at Week 1’s structure, but with the heavier weights you’ve earned — that’s how the strength keeps building.',
      sessions: [
        {
          day: 1,
          name: 'Full Body Circuit – Flow',
          focus: 'Total body integration',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), mat, bench',
          feel: 'Flowing and integrated',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Arm circles'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '3‑round circuit — flow between moves, rest only at the end' }, { name: 'Push‑Up', sets: 3, reps: 10, tempo: '2‑1‑2', weight: 'Bodyweight', notes: 'Knees or incline as needed' }, { name: 'Bent‑Over Row', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: 'Squeeze the shoulder blades' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Reverse Lunge', sets: 3, reps: '10 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Overhead Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Plank', sets: 3, reps: '40 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'This week is about feeling how far you’ve come. Return to the self who started.'
        },
        {
          day: 2,
          name: 'Full Body Circuit – Rhythm',
          focus: 'Total body integration',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Steady and capable',
          warmup: ['Inchworms', 'Thoracic rotations', 'Arm circles'],
          supersets: [
            { exercises: [{ name: 'Romanian Deadlift (DB)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '3‑round circuit — keep a steady rhythm' }, { name: 'Single‑Arm DB Row', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Glute Bridge (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Sumo Squat', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Floor Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Bird Dog', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Thread the needle', 'Supine twist'],
          coachingNote: 'Integration means the movements become part of you – unconscious conscious.'
        },
        {
          day: 3,
          name: 'Full Body Circuit – Strength Flow',
          focus: 'Total body integration',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), bench, mat',
          feel: 'Grounded and rooted',
          warmup: ['Leg swings', 'Hip circles', 'Cat‑cow'],
          supersets: [
            { exercises: [{ name: 'DB Romanian Deadlift', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '3‑round circuit — the strongest movements you own' }, { name: 'Step‑Up', sets: 3, reps: '10 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Overhead Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 12, tempo: '3‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Bent‑Over Row', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Side Plank', sets: 3, reps: '30 sec per side', tempo: 'hold', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Couch stretch', 'Supine hamstring stretch'],
          coachingNote: 'You are not the same woman who started eight weeks ago. Feel the difference.'
        },
        {
          day: 4,
          name: 'Full Body Circuit – Play',
          focus: 'Total body integration',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), mat',
          feel: 'Flowing and integrated',
          warmup: ['Arm circles', 'Band pull‑aparts', 'Scapular push‑ups'],
          supersets: [
            { exercises: [{ name: 'Front Squat (DB)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '3‑round circuit — playful, light on your feet' }, { name: 'Push‑Up', sets: 3, reps: 10, tempo: '2‑1‑2', weight: 'Bodyweight', notes: '' }, { name: 'Reverse Lunge', sets: 3, reps: '10 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Bicep Curl', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Tricep Extension', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Dead Bug', sets: 3, reps: '10 per side', tempo: '3‑1‑3', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Child’s pose', 'Supine twist', 'Figure‑four stretch'],
          coachingNote: 'Every tiny step counts. You are further than you were.'
        },
        {
          day: 5,
          name: 'Full Body Circuit – Celebration',
          focus: 'Total body integration',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), bench, mat',
          feel: 'Rooted and powerful',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Glute bridges'],
          supersets: [
            { exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '3‑round circuit — everything you built, in one flow' }, { name: 'Romanian Deadlift (DB)', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Single‑Arm DB Row', sets: 3, reps: '12 per side', tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }], rounds: 3, restAfterSuperset: 60 },
            { exercises: [{ name: 'Hip Thrust (weighted)', sets: 3, reps: 15, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Overhead Press', sets: 3, reps: 12, tempo: '2‑1‑2', weight: '5‑8 kg', notes: '' }, { name: 'Plank', sets: 3, reps: '45 sec', tempo: 'hold', weight: 'Bodyweight', notes: '' }], rounds: 3, restAfterSuperset: 60 }
          ],
          cooldown: ['Pigeon pose', 'Supine hamstring stretch', 'Child’s pose'],
          coachingNote: 'This is not the end. It’s the beginning of a lifelong return to yourself. Be proud.'
        },
        {
          day: 6,
          name: 'Walk & Restore – Gratitude Walk',
          focus: 'Mindful movement',
          durationMin: 30,
          equipment: 'None',
          feel: 'Easy and spacious',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Think of three things you’re grateful for in your body. Thank it.',
          isRestDay: true
        },
        {
          day: 7,
          name: 'Rest & Reflect',
          focus: 'Ritual',
          durationMin: 0,
          equipment: 'None',
          feel: 'Gratitude',
          warmup: [],
          supersets: [],
          cooldown: [],
          coachingNote: 'Write a letter to yourself about what you’ve learned. Keep it somewhere you can read on hard days. You did this. One tiny step at a time. And you’re just getting started.',
          isRestDay: true
        }
      ]
    }
  ]
};
