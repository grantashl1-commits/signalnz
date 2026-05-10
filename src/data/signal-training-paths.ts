// Imports for the Glute Power 8-week plan (uses richer types from
// the archived workout-plans.ts).
import {
  WorkoutPlan,
  SessionDay,
  PlanWeek,
  WarmUpExercise,
  MainBlock,
  BlockExercise,
  CoolDownExercise,
} from "@/data/workout-plans";

export interface Exercise {
  name: string;
  sets: number;
  reps: number | string;
  tempo?: string;
  weight?: string;
  notes?: string;
}

export interface Superset {
  exercises: Exercise[];
  rounds: number;
  restAfterSuperset?: number; // seconds
}

export interface Session {
  day: number;
  name: string;
  focus?: string;
  durationMin?: number;
  equipment?: string;
  feel?: string;
  warmup?: string[];
  supersets?: Superset[];
  coolDown?: string[];
  /** Lowercase alias of coolDown — both are accepted by the renderer. */
  cooldown?: string[];
  /** Marks pure rest / walk-and-restore days so the renderer can skip the table layout. */
  isRestDay?: boolean;
  /** Legacy flat-string structure used by some paths (Pilates, Rest & Restore, Glute Power weeks). */
  structure?: string[];
  coachingNote?: string;
  /** Optional session-level enrichment (filled at runtime from CSVs). */
  warmupNotes?: string;
  cooldownNotes?: string;
  sessionNotes?: string;
}

export interface Week {
  week: number;
  theme: string;
  progression: string;
  sessions: Session[];
  /** Optional phase-level enrichment from Supabase program_phases CSV. */
  phaseGoal?: string;
  rpeMin?: number;
  rpeMax?: number;
}

export interface TrainingPath {
  id: string;
  name: string;
  subtitle: string;
  /** Free-form so paths can be cardio-hybrids, glute-power, run, pilates, etc. */
  focus: string;
  description: string;
  whoItIsFor: string;
  weeks: Week[];
}

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
    // WEEK 1 – Grounding (full details already provided, repeated here for completeness)
    {
      week: 1,
      theme: 'Grounding – Learning the Patterns',
      progression: 'RPE 6‑7. Light dumbbells (3‑5 kg). Tempo 3‑1‑2. Form first.',
      sessions: [
        // ... (insert the full Week 1 sessions from your existing file)
      ]
    },
    // WEEK 2 – Stability
    {
      week: 2,
      theme: 'Stability – Slowing Down to Own the Movement',
      progression: 'RPE 6‑7. Same weight. Tempo 4‑1‑2 on squats and RDLs. Add 2‑sec holds.',
      sessions: [
        // ... (insert the full Week 2 sessions from your existing file)
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
      progression: 'RPE 7. Increase dumbbells to 5‑8 kg. Tempo returns to 3‑1‑2. 3 rounds per superset.',
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
      progression: 'RPE 7. Same weight as Week 4. Reduce rest to 45 sec. Tempo 3‑1‑2.',
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
      progression: 'RPE 7‑8. Same weight as Week 5. Increase reps to 14‑15. Tempo 2‑1‑2 (explosive).',
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
      progression: 'RPE 7‑8. Same load as Week 6. Change exercises to avoid plateau.',
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
      progression: 'RPE 6‑7. Full body circuits. Choose exercises from previous weeks. Move with flow.',
      sessions: [
        {
          day: 1,
          name: 'Full Body Circuit – Flow',
          focus: 'Total body integration',
          durationMin: 40,
          equipment: 'Dumbbells (5‑8 kg), mat, bench',
          feel: 'Flowing and integrated',
          warmup: ['Cat‑cow', 'Deep squat hold', 'Leg swings', 'Arm circles', 'Cat‑cow'],
          supersets: [],
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
          supersets: [],
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
          supersets: [],
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
          supersets: [],
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
          supersets: [],
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
{
  id: "signal-circuit-progressive",
  name: "The 8‑Move Circuit Path",
  subtitle: "Two rounds. Eight moves. Sixteen weeks of quiet power.",
  focus: "cardio + muscular endurance",
  description:
    "This is not random work. It is a conversation between you and your body – a steady climb from beginner‑friendly reps and simple jumps to explosive intervals and long cardio bursts. Each workout lists 8 exercises. You complete the list once, rest 90 seconds, then do it again. The themes change every day so you never burn out the same muscles twice.",
  whoItIsFor:
    "The woman who wants clear structure, visible progress, and a workout that fits inside 30 minutes. She is ready to sweat, but she also wants to feel her heart grow stronger week by week.",
  weeks: [
    // ────────────────────────────────────────────────────────────
    // WEEKS 1‑2: FOUNDATION – easy reps, bodyweight, basic moves
    // ────────────────────────────────────────────────────────────
    {
      week: 1,
      theme: "Easy Rhythm",
      progression: "All exercises bodyweight. Low reps. No plyometrics.",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Easy)",
          durationMin: 25,
          equipment: "None (optional: skipping rope)",
          feel: "Conversational",
          structure: [
            "**Circuit – 2 rounds (rest 90 sec between rounds):**",
            "1. Bodyweight Squats – 12 reps",
            "2. Stationary Lunges – 8 reps per leg",
            "3. Step Ups (low bench) – 8 reps per leg",
            "4. Knee Ups (marching in place) – 16 reps total",
            "5. Glute Bridges – 12 reps",
            "6. Toe Taps (light) – 12 reps",
            "7. Walking Lunges – 8 reps per leg",
            "8. Slow Mountain Climbers – 15 reps total"
          ],
          coachingNote: "Move slowly. Feel each rep. If you are not sweating, that is fine – this week is about learning the pattern."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Easy)",
          durationMin: 25,
          equipment: "Optional: light dumbbells (1‑3 kg)",
          feel: "Steady",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Incline Push Ups (hands on bench) – 10 reps",
            "2. Tricep Dips (feet on floor) – 10 reps",
            "3. Arm Circles (small) – 20 reps forward + 20 back",
            "4. Plank – 20 seconds",
            "5. Bent‑over Rows (no weight or water bottles) – 12 reps",
            "6. Shoulder Press (light) – 10 reps",
            "7. Bird Dog – 8 reps per side",
            "8. Jumping Jacks – 30 reps"
          ],
          coachingNote: "Keep your shoulders relaxed. Do not rush the plank – it is okay to drop to your knees."
        },
        {
          day: 3,
          name: "Core & Cardio (Easy)",
          durationMin: 25,
          equipment: "None",
          feel: "Light burn",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Standing Toe Taps – 12 reps per leg",
            "2. Dead Bug – 8 reps per side",
            "3. Straight Leg Raises – 10 reps total",
            "4. Seated Knee Tucks (on mat) – 12 reps",
            "5. Heel Taps (lying down) – 12 reps per side",
            "6. Marching in Place (high knees, slow) – 30 sec",
            "7. Side Plank (knee down) – 15 sec per side",
            "8. Bicycle Crunches (slow) – 10 reps per side"
          ],
          coachingNote: "This is not about speed. Keep your lower back pressed into the floor for all lying moves."
        },
        {
          day: 4,
          name: "Rest or Easy Walk",
          structure: ["Rest, gentle stretching, or 20‑30 min walk"],
          coachingNote: ""
        },
        {
          day: 5,
          name: "Full Body (Easy Cardio Mix)",
          durationMin: 28,
          equipment: "Optional: skipping rope",
          feel: "Energised",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Squat to Stand (slow) – 10 reps",
            "2. Push Ups (knees or incline) – 8 reps",
            "3. Reverse Lunges – 8 reps per leg",
            "4. Lying Tricep Extensions (no weight) – 10 reps",
            "5. Plank Shoulder Taps – 8 reps per side",
            "6. Butt Kicks (slow) – 20 reps total",
            "7. Supine Leg Lowering – 8 reps per leg",
            "8. Skipping (or imaginary skipping) – 40 reps"
          ],
          coachingNote: "You should finish feeling like you could do another round – but save that for next week."
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    {
      week: 2,
      theme: "Increase Reps Slightly",
      progression: "Add 3‑5 reps per move. Introduce a light skipping rope.",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Week 2)",
          durationMin: 28,
          equipment: "Skipping rope (optional)",
          feel: "Building rhythm",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Squats – 15 reps",
            "2. Walking Lunges – 10 reps per leg",
            "3. Step Ups – 10 reps per leg",
            "4. Sumo Squats – 12 reps",
            "5. Donkey Kicks – 12 reps per leg",
            "6. Knee Ups (controlled) – 16 reps total",
            "7. Glute Bridge with 3 sec hold – 12 reps",
            "8. Skipping (easy pace) – 50 reps"
          ],
          coachingNote: "The skipping can be broken into 25 + 25. Land softly on the balls of your feet."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Week 2)",
          durationMin: 28,
          equipment: "Light dumbbells (2‑4 kg) or water bottles",
          feel: "Steady effort",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Knee Push Ups – 12 reps",
            "2. Tricep Dips (feet on floor) – 12 reps",
            "3. Lateral Raises (light) – 10 reps",
            "4. Plank – 30 seconds",
            "5. Dumbbell Rows – 12 reps per side",
            "6. Overhead Press – 10 reps",
            "7. Arm Scissors (lying) – 20 reps total",
            "8. High Knees (slow to moderate) – 20 reps per leg"
          ],
          coachingNote: "Focus on lowering the weights slowly – that is where the strength builds."
        },
        {
          day: 3,
          name: "Core & Cardio (Week 2)",
          durationMin: 28,
          equipment: "None or mat",
          feel: "Controlled",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Plank – 30 sec",
            "2. Toe Taps (lying, legs up) – 14 reps",
            "3. Reverse Crunches – 12 reps",
            "4. Side Plank (knee allowed) – 20 sec per side",
            "5. Mountain Climbers (slow cadence) – 20 reps total",
            "6. Windshield Wipers (small range) – 12 reps total",
            "7. Leg Lowers (straight) – 10 reps",
            "8. Russian Twists (feet on floor) – 16 reps total (8/side)"
          ],
          coachingNote: "If your lower back hurts, reduce range of motion. Keep your core braced."
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body (Week 2)",
          durationMin: 30,
          equipment: "Skipping rope, light weights",
          feel: "Balanced",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Goblet Squats (hold one weight) – 12 reps",
            "2. Push Ups (knees or full) – 10 reps",
            "3. Reverse Lunges with Knee Drive – 8 reps per leg",
            "4. Tricep Kickbacks – 12 reps per arm",
            "5. Lying Leg Raises – 12 reps",
            "6. Plank Jacks – 15 reps total",
            "7. Box Step Overs (low bench) – 10 reps per leg",
            "8. Burpees (no push up, no jump) – 6 reps"
          ],
          coachingNote: "The burpees are slow – stand up, squat back, kick feet out, step back in, stand. No rush."
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ────────────────────────────────────────────────────────────
    // WEEKS 3‑4: MODERATE – introduce tempo and light plyometrics
    // ────────────────────────────────────────────────────────────
    {
      week: 3,
      theme: "Introduce Tempo",
      progression: "Faster pace on cardio moves. First small jumps (split squats, small hops).",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Tempo)",
          durationMin: 30,
          equipment: "Skipping rope, low bench",
          feel: "Moderate effort",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Jumping Jacks – 40 reps",
            "2. Split Squats (stationary) – 10 reps per leg",
            "3. Alternating Reverse Lunges – 14 reps total",
            "4. Step Ups with Knee Lift – 10 reps per leg",
            "5. Skater Hops (small) – 12 reps per side",
            "6. Skipping – 80 reps",
            "7. Sumo Squats with Pulse – 12 reps + 8 pulses",
            "8. Calf Raises – 20 reps"
          ],
          coachingNote: "Skater hops = jump side to side like a speed skater. Keep the jump low. Land softly."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Tempo)",
          durationMin: 30,
          equipment: "Light dumbbells (3‑5 kg), bench",
          feel: "Building",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Push Ups (full or knees) – 12 reps",
            "2. Tricep Dips (feet on floor) – 14 reps",
            "3. Bent Over Rows – 12 reps",
            "4. Plank with Arm Reach – 8 reps per side",
            "5. Dumbbell Punch (alternating) – 20 reps total",
            "6. Incline Push Ups (feet on bench) – 10 reps",
            "7. Bear Crawl (forward & back) – 4 crawls each way",
            "8. Fast Feet (in place) – 30 seconds"
          ],
          coachingNote: "Fast feet = tiny, quick steps. Do not lift your knees high – just move your feet fast."
        },
        {
          day: 3,
          name: "Core & Cardio (Tempo)",
          durationMin: 30,
          equipment: "Mat, skipping rope",
          feel: "Core fatigue",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Plank – 40 seconds",
            "2. Bicycle Crunches – 16 reps per side",
            "3. Scissor Kicks – 20 reps total",
            "4. Hollow Body Hold – 20 seconds",
            "5. Mountain Climbers (moderate pace) – 30 reps total",
            "6. V‑Ups (bent knees) – 12 reps",
            "7. Side Plank Dips – 8 reps per side",
            "8. Skipping (fast feet style) – 100 reps"
          ],
          coachingNote: "Hollow body hold = lie on back, lift shoulders and legs a few inches off ground. Keep lower back pressed down."
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body (Tempo)",
          durationMin: 32,
          equipment: "Dumbbells (3‑5 kg), skipping rope",
          feel: "Sweaty",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Burpees (regular, no push up) – 8 reps",
            "2. Walking Lunges with Twist – 12 reps total (6/leg)",
            "3. Push Up to Downward Dog – 8 reps",
            "4. Squat to Overhead Press – 12 reps",
            "5. Plank Walk (hand to elbow) – 12 reps total",
            "6. Butt Kicks (fast) – 30 seconds",
            "7. Box Jumps (low bench, step down) – 8 reps",
            "8. Skipping – 120 reps"
          ],
          coachingNote: "Box jumps step down, do not jump down – your knees will thank you."
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    {
      week: 4,
      theme: "Consolidation with Small Jumps",
      progression: "Repeat Week 3 but reduce rest between rounds to 75 sec. Slightly increase reps on plyo moves.",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Week 4)",
          durationMin: 30,
          equipment: "Skipping rope",
          feel: "Stronger",
          structure: [
            "**Circuit – 2 rounds (rest 75 sec):**",
            "1. Jump Squats (low jump) – 10 reps",
            "2. Alternating Jump Lunges (small) – 8 reps per leg",
            "3. Speed Skaters – 15 reps per side",
            "4. Step Ups with Hop (low bench) – 8 reps per leg",
            "5. Skipping – 120 reps",
            "6. Single Leg Glute Bridge – 10 reps per leg",
            "7. Lateral Lunges – 10 reps per side",
            "8. High Knees (in place) – 40 reps total"
          ],
          coachingNote: "The jump is small – think 'springy', not 'explosive'. Protect your knees."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Week 4)",
          durationMin: 30,
          equipment: "Dumbbells (4‑6 kg), bench",
          feel: "Controlled power",
          structure: [
            "**Circuit – 2 rounds (rest 75 sec):**",
            "1. Decline Push Ups (feet on bench) – 10 reps",
            "2. Tricep Dips (feet elevated) – 12 reps",
            "3. Renegade Rows (knees down) – 6 reps per arm",
            "4. Plank Up‑Downs – 10 reps total",
            "5. Dumbbell Floor Press – 12 reps",
            "6. Lateral Raises – 12 reps",
            "7. Arm Circles with small weight – 15 forward/back",
            "8. Jumping Jacks – 50 reps"
          ],
          coachingNote: "Renegade rows = in plank, row one dumbbell at a time. Keep hips still – wobbling means go lighter."
        },
        {
          day: 3,
          name: "Core & Cardio (Week 4)",
          durationMin: 30,
          equipment: "Mat, skipping rope",
          feel: "Deep core work",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Plank with Knee Taps – 16 reps total",
            "2. Leg Lowers (straight, slow) – 12 reps",
            "3. Toe Taps (lying, legs vertical) – 20 reps",
            "4. Side Plank (full or knee) – 25 sec per side",
            "5. Cross Body Mountain Climbers – 20 reps total",
            "6. Russian Twists (feet up) – 20 reps total (10/side)",
            "7. Flutter Kicks – 30 seconds",
            "8. Skipping (alternating feet) – 150 reps"
          ],
          coachingNote: "Flutter kicks = small, fast up‑down leg movements. Keep your lower back glued to the floor."
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body (Week 4)",
          durationMin: 32,
          equipment: "Dumbbells, skipping rope, bench",
          feel: "Complete",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Burpee with Push Up – 8 reps",
            "2. Dumbbell Squat to Press – 12 reps",
            "3. Reverse Lunge with Bicep Curl – 10 reps per leg",
            "4. Tricep Dips (feet on floor) – 15 reps",
            "5. Plank Shoulder Taps – 16 reps total",
            "6. Box Step Over with Knee Drive – 10 reps per leg",
            "7. Tuck Jumps (low) – 8 reps",
            "8. Skipping – 150 reps"
          ],
          coachingNote: "Tuck jumps = jump and pull knees toward chest. Land like a cat – soft and quiet."
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ────────────────────────────────────────────────────────────
    // WEEKS 5‑6: CHALLENGE – plyometrics, longer cardio bursts
    // ────────────────────────────────────────────────────────────
    {
      week: 5,
      theme: "Plyometric Introduction",
      progression: "Add tuck jumps, broad jumps, power moves. Increase skipping to 200 reps.",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Plyo Start)",
          durationMin: 32,
          equipment: "Skipping rope, low bench/box",
          feel: "Powerful",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Broad Jumps (standing long jump) – 6 reps",
            "2. Tuck Jumps – 8 reps",
            "3. Alternating Jump Lunges – 12 reps total (6/leg)",
            "4. Box Jumps (step down) – 10 reps",
            "5. Skipping – 200 reps",
            "6. Single Leg Squat to Bench (touch and stand) – 8 reps per leg",
            "7. Lateral Hops over line – 15 reps per side",
            "8. Ice Skaters (large lateral jumps) – 10 reps per side"
          ],
          coachingNote: "Broad jumps – squat, throw arms forward, jump as far as you comfortably can. Do not land with locked knees."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Plyo Upper)",
          durationMin: 32,
          equipment: "Dumbbells, bench, medicine ball (optional)",
          feel: "Explosive push",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Plyo Push Ups (clap or just explosive) – 6 reps",
            "2. Medicine Ball Slams (or squat jump toss) – 12 reps",
            "3. Tricep Dips with Leg Lift – 12 reps",
            "4. Commando Plank (fast) – 16 reps total",
            "5. Dumbbell Snatch (single arm) – 6 reps per arm",
            "6. Bear Crawl (fast) – 10 steps forward/back",
            "7. Mountain Climbers (fast) – 40 reps total",
            "8. Skipping (double unders or fast singles) – 150 reps"
          ],
          coachingNote: "Plyo push ups: lower slowly, then press up with enough force to lift hands off floor for a split second."
        },
        {
          day: 3,
          name: "Core & Cardio (Plyo Core)",
          durationMin: 32,
          equipment: "Mat, skipping rope",
          feel: "Core endurance",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Plank Jacks – 20 reps",
            "2. V‑Up Tucks – 12 reps",
            "3. Leg Throw Downs – 10 reps per leg",
            "4. Side Plank with Knee Drive – 10 reps per side",
            "5. Mountain Climber Cross – 30 reps total",
            "6. Hollow Body Rocks – 15 rocks",
            "7. Russian Twist with Pulse – 20 reps per side",
            "8. Fast Feet + Sprint in Place – 20 sec fast feet, 10 sec sprint, repeat 2x"
          ],
          coachingNote: "Leg throw downs: lie on back, legs straight up, lower legs as slow as you can, then throw back up using abs."
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body (Plyo Mix)",
          durationMin: 35,
          equipment: "Skipping rope, box/bench, light dumbbells",
          feel: "Full throttle",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Burpee to Tuck Jump – 8 reps",
            "2. Dumbbell Thrusters (squat to press) – 12 reps",
            "3. Broad Jump Burpee (no push up) – 6 reps",
            "4. Decline Push Up to Side Plank – 6 reps per side",
            "5. Box Jump to Step Down – 10 reps",
            "6. Skater Hops with Touch – 16 reps total",
            "7. Plank to Pike – 10 reps",
            "8. Skipping – 250 reps (or 1 minute fast)"
          ],
          coachingNote: "Burpee to tuck jump: do a regular burpee, but instead of just standing up, jump and tuck your knees."
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    {
      week: 6,
      theme: "Increase Volume",
      progression: "Add one extra round (3 rounds) instead of 2? No – keep 2 rounds but increase reps by 20%.",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Week 6)",
          durationMin: 35,
          equipment: "Skipping rope, box",
          feel: "Hard endurance",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Box Jumps (jump up, step down) – 12 reps",
            "2. Split Jumps (switch lunge jump) – 16 reps total (8/leg)",
            "3. Broad Jumps – 10 reps",
            "4. Single Leg Box Step Ups with Hop – 10 reps per leg",
            "5. Skipping (alternating fast/slow) – 300 reps total (broken as needed)",
            "6. Cossack Squats – 12 reps per side",
            "7. Lateral Hops over bench – 20 reps total",
            "8. Sprint in Place (high knees) – 45 seconds"
          ],
          coachingNote: "Split jumps = from lunge position, jump and switch legs in the air. Go for height, not distance."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Week 6)",
          durationMin: 35,
          equipment: "Dumbbells (5‑8 kg), bench, medicine ball",
          feel: "Pushing limits",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Explosive Push Ups (hands off) – 8 reps",
            "2. Medicine Ball Chest Pass (against wall) – 15 reps",
            "3. Tricep Dips (feet elevated on second bench) – 15 reps",
            "4. Renegade Rows (plank, no knees) – 8 reps per arm",
            "5. Dumbbell Cleans – 10 reps",
            "6. Plank with Row – 10 reps per arm",
            "7. Burpee to Pull Up (if no bar, burpee to jump) – 6 reps",
            "8. Skipping (double unders attempts) – 100 reps"
          ],
          coachingNote: "Cleans: deadlift dumbbells, then shrug and catch them at your shoulders. Use light weight – it is a power move."
        },
        {
          day: 3,
          name: "Core & Cardio (Week 6)",
          durationMin: 35,
          equipment: "Mat, medicine ball (2‑4 kg), skipping rope",
          feel: "Burning",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Plank with Medicine Ball Rollout – 10 reps",
            "2. V‑Up with Twist – 12 reps per side",
            "3. Leg Lift to Hip Lift – 12 reps",
            "4. Side Plank with Leg Abduction – 10 reps per side",
            "5. Mountain Climbers (fast, cross body) – 50 reps total",
            "6. Russian Twist with Weight – 30 reps total (15/side)",
            "7. Hollow Body Hold – 45 seconds",
            "8. Skipping (one foot then the other) – 200 reps"
          ],
          coachingNote: "Plank rollout: start in plank with hands on ball, roll ball forward, pull back with abs. Keep back flat."
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body (Week 6 – Peak)",
          durationMin: 35,
          equipment: "Full set: skipping rope, dumbbells, bench, medicine ball",
          feel: "Exhausting but liberating",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Burpee to Box Jump – 10 reps",
            "2. Thruster + Push Press – 15 reps",
            "3. Depth Jump to Broad Jump – 6 reps (soft landing)",
            "4. Dumbbell Snatch (alternating) – 8 reps per arm",
            "5. Plank to Tuck Jump – 12 reps",
            "6. Lunge Jump Switch + Hop – 12 reps total",
            "7. Med Ball Slam to Squat Jump – 10 reps",
            "8. Skipping – 300 reps (or 2 minutes non‑stop)"
          ],
          coachingNote: "Depth jump: stand on low bench, step off (do not jump off), land softly, then immediately jump up. Advanced – do once per week only."
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    // ────────────────────────────────────────────────────────────
    // WEEKS 7‑8: PEAK & DELOAD – maximum intensity then easy finish
    // ────────────────────────────────────────────────────────────
    {
      week: 7,
      theme: "Peak Week – Maximum Effort",
      progression: "Shortest rest (60 sec between rounds). Highest reps and hardest plyos.",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Peak)",
          durationMin: 35,
          equipment: "Skipping rope, plyo box",
          feel: "Intense",
          structure: [
            "**Circuit – 2 rounds (rest 60 sec):**",
            "1. Depth Jumps (from 20‑30 cm) – 8 reps",
            "2. Tuck Jumps – 20 reps",
            "3. Broad Jump to Sprint (in place) – 6 reps",
            "4. Single Leg Box Jumps (low box) – 6 reps per leg",
            "5. Skipping – 300 reps (as fast as possible)",
            "6. Bulgarian Split Squats (jump optional) – 12 reps per leg",
            "7. Lateral Hops over bench – 30 reps total",
            "8. High Knees Sprint – 60 seconds"
          ],
          coachingNote: "Peak week is hard by design. If you need an extra 15 sec rest, take it – but keep moving."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Peak)",
          durationMin: 35,
          equipment: "Dumbbells, medicine ball, bench",
          feel: "Explosive",
          structure: [
            "**Circuit – 2 rounds (rest 60 sec):**",
            "1. Plyo Push Ups (clap or high) – 10 reps",
            "2. Medicine Ball Burpees (slam at bottom) – 12 reps",
            "3. Tricep Dips with Knee Raise – 20 reps",
            "4. Commando Plank (fast) – 30 reps total",
            "5. Dumbbell Clean to Press – 10 reps",
            "6. Plank with Single Arm Row – 12 reps per arm",
            "7. Mountain Climber Burpee (no jump) – 10 reps",
            "8. Skipping (double unders) – 100 reps or 2 min singles"
          ],
          coachingNote: "Medicine ball burpees: hold the ball, drop chest to floor with hands on ball, push up, then stand and slam ball."
        },
        {
          day: 3,
          name: "Core & Cardio (Peak)",
          durationMin: 35,
          equipment: "Weighted ball (3‑5 kg), skipping rope",
          feel: "Deep fatigue",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Weighted Sit Ups (ball overhead) – 20 reps",
            "2. Hanging Knee Raises (or lying leg lifts) – 15 reps",
            "3. Plank with Feet on Bench – 1 minute",
            "4. Side Plank with Weighted Reach – 12 reps per side",
            "5. V‑Up to Jackknife – 15 reps",
            "6. Russian Twist (heavy) – 30 reps per side",
            "7. Toe Touches (lying, legs up) – 30 reps",
            "8. Sprint Intervals: 20 sec on / 10 sec off, 8 rounds (integrated into circuit)"
          ],
          coachingNote: "Do the sprint intervals as the last move of the circuit – 8 rounds of 20/10 will take about 4 minutes. Go all out."
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body (Peak – Finale)",
          durationMin: 38,
          equipment: "All available: box, dumbbells, med ball, rope",
          feel: "Victorious",
          structure: [
            "**Circuit – 2 rounds (rest 75 sec – you earned it):**",
            "1. Burpee Box Jump Over – 10 reps",
            "2. Dumbbell Snatch to Thruster – 8 reps per arm",
            "3. Broad Jump Burpee with Push Up – 8 reps",
            "4. Plyo Push Up to Side Plank – 8 reps per side",
            "5. Tuck Jump to Squat – 15 reps",
            "6. Lunge Jump to Knee Drive – 12 reps per leg",
            "7. Med Ball Slams (fast) – 20 reps",
            "8. Skipping (250 reps) + 50 Mountain Climbers (finisher)"
          ],
          coachingNote: "This is the hardest workout of the 8 weeks. Do not skip the warm‑up. You have built up to this – trust your fitness."
        },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    },
    {
      week: 8,
      theme: "Deload & Celebrate",
      progression: "Reduce volume by 30‑40%. No plyometrics. Focus on enjoyment.",
      sessions: [
        {
          day: 1,
          name: "Lower Body & Cardio (Deload)",
          durationMin: 25,
          equipment: "Skipping rope (optional)",
          feel: "Easy flow",
          structure: [
            "**Circuit – 2 rounds (rest as needed):**",
            "1. Bodyweight Squats – 12 reps",
            "2. Walking Lunges – 8 reps per leg",
            "3. Step Ups – 8 reps per leg (low bench)",
            "4. Glute Bridges – 15 reps",
            "5. Knee Ups (slow) – 20 reps total",
            "6. Skipping – 80 reps (easy pace)",
            "7. Calf Raises – 20 reps",
            "8. Slow Mountain Climbers – 20 reps total"
          ],
          coachingNote: "No jumps. No rush. Feel how easy these moves have become compared to Week 1."
        },
        {
          day: 2,
          name: "Upper Body & Cardio (Deload)",
          durationMin: 25,
          equipment: "Light weights (2‑4 kg) or none",
          feel: "Relaxed",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Incline Push Ups – 12 reps",
            "2. Tricep Dips (feet on floor) – 12 reps",
            "3. Bent Over Rows (light) – 12 reps",
            "4. Plank – 30 seconds",
            "5. Arm Circles – 20 each direction",
            "6. Standing Shoulder Press – 10 reps",
            "7. Jumping Jacks – 40 reps",
            "8. Slow Bear Crawl – 8 steps"
          ],
          coachingNote: "This week is about gratitude for what your body can do. Do not push."
        },
        {
          day: 3,
          name: "Core & Cardio (Deload)",
          durationMin: 25,
          equipment: "Mat",
          feel: "Gentle",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Plank – 30 sec",
            "2. Dead Bug – 10 reps per side",
            "3. Straight Leg Raises – 12 reps",
            "4. Bird Dog – 10 reps per side",
            "5. Seated Knee Tucks – 15 reps",
            "6. Heel Taps – 15 reps per side",
            "7. Bicycle Crunches (slow) – 12 reps per side",
            "8. Marching in Place – 1 minute"
          ],
          coachingNote: "Breathe deeply. Enjoy the movement."
        },
        { day: 4, name: "Rest", structure: ["Rest"] },
        {
          day: 5,
          name: "Full Body (Deload – Fun Day)",
          durationMin: 25,
          equipment: "Skipping rope (optional)",
          feel: "Playful",
          structure: [
            "**Circuit – 2 rounds:**",
            "1. Squat to Stand – 10 reps",
            "2. Knee Push Ups – 10 reps",
            "3. Reverse Lunges – 8 reps per leg",
            "4. Tricep Extensions (no weight) – 12 reps",
            "5. Plank Shoulder Taps – 10 reps total",
            "6. Butt Kicks – 30 seconds",
            "7. Toe Taps (standing) – 20 reps per leg",
            "8. Skipping or Dancing – 2 minutes"
          ],
          coachingNote: "Pick your favourite music for the last set. You made it through 8 weeks. That is a win."
        },
        {
          day: 6,
          name: "Reflect & Stretch",
          structure: ["Write down three things your body can do now that it could not do in Week 1. Then 15 minutes of full‑body stretching."],
          coachingNote: ""
        },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ]
    }
  ]
}
  ]
};

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

/**
 * 8-Week Glute Power & Lower Body Focus Plan
 *
 * Based on the "Lose Weight + Build Muscle" 4-week foundation, extended to 8 weeks
 * with exclusive glute and lower body emphasis. Progressive overload, at least 4 sessions per week,
 * and at least 6 exercises per session. Exercises drawn from the original plan,
 * Stacy Sims' protocols (Heavy Lifting, Plyometrics, Core Stability), and the Anchor glute programme.
 *
 * This plan builds glute strength, hip stability, and posterior chain power for women in peri/menopause.
 */

// ── Helper warm-ups ───────────────────────────────────────────
const gluteActivationWarmUp: WarmUpExercise[] = [
  { name: "Banded clamshells", duration: "15 reps per side" },
  { name: "Banded glute bridge", duration: "15 reps" },
  { name: "Monster walks (band)", duration: "10 steps each direction" },
  { name: "Leg swings (forward + lateral)", duration: "1 min" },
  { name: "Hip circles", duration: "1 min" },
  { name: "Bodyweight squat (slow tempo)", duration: "10 reps" },
];

const lowerBodyWarmUp: WarmUpExercise[] = [
  { name: "Cat-cow", duration: "10 reps" },
  { name: "Deep squat hold", duration: "30 sec" },
  { name: "Walking lunges (bodyweight)", duration: "10 reps" },
  { name: "Leg swings", duration: "1 min" },
  { name: "Hip flexor stretch (kneeling)", duration: "30 sec per side" },
];

const hiitWarmUp: WarmUpExercise[] = [
  { name: "Light jog or skip", duration: "5 min" },
  { name: "High knees + butt kicks", duration: "2 min" },
  { name: "Dynamic leg swings", duration: "1 min" },
];

// ── Cool-down stretches ───────────────────────────────────────
const lowerBodyCoolDown: CoolDownExercise[] = [
  { name: "Pigeon pose", duration: "90 sec per side" },
  { name: "Figure-4 glute stretch", duration: "60 sec per side" },
  { name: "Couch stretch (hip flexor)", duration: "60 sec per side" },
  { name: "Seated hamstring stretch", duration: "45 sec per side" },
  { name: "Supine spinal twist", duration: "60 sec per side" },
  { name: "Child's pose with side reach", duration: "60 sec" },
];

// ──────────────────────────────────────────────────────────────
// WEEK 1 – FOUNDATION: Glute activation & technique
// ──────────────────────────────────────────────────────────────
const week1: PlanWeek = {
  week: 1,
  theme: "Foundation",
  days: [
    {
      day: 1,
      name: "Power Drive — Glute & Quad Foundation",
      category: "strength",
      durationMin: 50,
      intensity: "moderate",
      warm_up: gluteActivationWarmUp,
      main_block: [
        {
          section_label: "Main Lifts",
          exercises: [
            {
              name: "Goblet Squat",
              sets: 3,
              reps_or_duration: "12",
              rest: "60 sec",
              form_cue: "Chest tall, knees track toes, descend with control",
            },
            {
              name: "Romanian Deadlift (DB)",
              sets: 3,
              reps_or_duration: "12",
              rest: "60 sec",
              form_cue: "Hinge at hips, soft knees, bar close to shins",
            },
            {
              name: "Hip Thrust (light barbell or DB)",
              sets: 3,
              reps_or_duration: "15",
              rest: "60 sec",
              form_cue: "Squeeze glutes at top, posterior pelvic tilt",
            },
            {
              name: "Bulgarian Split Squat",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "75 sec",
              form_cue: "Front shin vertical, rear knee taps floor",
            },
            {
              name: "Single-Leg Glute Bridge",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "45 sec",
              form_cue: "Keep hips square, drive through heel",
            },
            {
              name: "Lateral Lunge",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "60 sec",
              form_cue: "Sit into the hip, grounded heel, chest up",
            },
          ],
        },
        {
          section_label: "Glute Finisher",
          exercises: [
            {
              name: "Band Walks (lateral)",
              sets: 2,
              reps_or_duration: "10 steps each way",
              rest: "30 sec",
              form_cue: "Constant band tension, low squat position",
            },
            {
              name: "Bird Dog",
              sets: 2,
              reps_or_duration: "10 per side",
              rest: "30 sec",
              form_cue: "Slow and controlled, don't rotate hips",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "Week 1: Focus on feeling each muscle work. The glute bridge and single-leg work wake up dormant glutes. Do not add weight until form is perfect.",
    },
    {
      day: 2,
      name: "Active Recovery — Walk & Mobilise",
      category: "active-recovery",
      durationMin: 40,
      intensity: "low",
      warm_up: [{ name: "Easy walk", duration: "5 min" }],
      main_block: [
        {
          section_label: "Cardio & Mobility",
          exercises: [
            {
              name: "Brisk walk (Zone 2)",
              sets: 1,
              reps_or_duration: "25 min at conversational pace",
              rest: "–",
              form_cue: "Nose breathing, can talk but not sing",
            },
            {
              name: "Standing Hip CARs",
              sets: 1,
              reps_or_duration: "5 per side",
              rest: "–",
              form_cue: "Full pain-free range of motion",
            },
            {
              name: "Deep squat hold with rotation",
              sets: 1,
              reps_or_duration: "60 sec",
              rest: "–",
              form_cue: "Heels down, rotate torso side to side",
            },
            {
              name: "World's Greatest Stretch",
              sets: 1,
              reps_or_duration: "5 per side",
              rest: "–",
              form_cue: "Lunge, rotate, reach — full body opener",
            },
            {
              name: "Pigeon pose",
              sets: 1,
              reps_or_duration: "60 sec per side",
              rest: "–",
              form_cue: "Relax into the stretch, breathe deeply",
            },
            {
              name: "Supine twist",
              sets: 1,
              reps_or_duration: "60 sec per side",
              rest: "–",
              form_cue: "Let gravity do the work",
            },
          ],
        },
      ],
      cool_down: [],
      coaching_note:
        "Active recovery enhances blood flow and nutrient delivery to recovering muscles. This is not laziness — it's strategic recovery.",
    },
    {
      day: 3,
      name: "Posterior Chain — Hinge & Hamstring Focus",
      category: "strength",
      durationMin: 50,
      intensity: "moderate",
      warm_up: lowerBodyWarmUp,
      main_block: [
        {
          section_label: "Hinge Dominant",
          exercises: [
            {
              name: "Barbell Romanian Deadlift",
              sets: 3,
              reps_or_duration: "10",
              rest: "75 sec",
              form_cue: "Push hips back, keep bar close, neutral spine",
            },
            {
              name: "Sumo Deadlift (DB or barbell)",
              sets: 3,
              reps_or_duration: "10",
              rest: "75 sec",
              form_cue: "Wide stance, toes out, chest tall",
            },
            {
              name: "Reverse Lunge",
              sets: 3,
              reps_or_duration: "12 per side",
              rest: "60 sec",
              form_cue: "Step back, lower rear knee, drive through front heel",
            },
            {
              name: "Nordic Hamstring Curl (eccentric)",
              sets: 3,
              reps_or_duration: "6",
              rest: "60 sec",
              form_cue: "Lower as slowly as possible, catch with hands",
            },
            {
              name: "Kettlebell Swing",
              sets: 3,
              reps_or_duration: "15",
              rest: "45 sec",
              form_cue: "Hip snap, not a squat; glutes fire at top",
            },
            {
              name: "Side-Lying Leg Lift (glute medius)",
              sets: 3,
              reps_or_duration: "15 per side",
              rest: "30 sec",
              form_cue: "Keep hips stacked, lift from heel",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "The hinge pattern is essential for daily life and athletic power. If you feel your lower back, reduce range of motion until the glutes and hamstrings take over.",
    },
    {
      day: 4,
      name: "Rest",
      category: "rest",
      durationMin: 0,
      intensity: "low",
      warm_up: [],
      main_block: [],
      cool_down: [],
      coaching_note: "Rest allows supercompensation. Your glutes grow when you sleep.",
    },
    {
      day: 5,
      name: "Glute Hypertrophy & Stability",
      category: "strength",
      durationMin: 55,
      intensity: "high",
      warm_up: gluteActivationWarmUp,
      main_block: [
        {
          section_label: "Volume Work",
          exercises: [
            {
              name: "Barbell Hip Thrust",
              sets: 4,
              reps_or_duration: "12",
              rest: "75 sec",
              form_cue: "Load across hip crease, squeeze at top for 2 sec",
            },
            {
              name: "Front Squat (or Goblet)",
              sets: 3,
              reps_or_duration: "10",
              rest: "75 sec",
              form_cue: "Elbows high, chest up, squat deep",
            },
            {
              name: "Curtsy Lunge",
              sets: 3,
              reps_or_duration: "12 per side",
              rest: "60 sec",
              form_cue: "Cross behind, lower until back knee taps",
            },
            {
              name: "Step-Up (high box)",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "60 sec",
              form_cue: "Drive through heel, don't push off back foot",
            },
            {
              name: "Donkey Kick (banded)",
              sets: 3,
              reps_or_duration: "15 per side",
              rest: "30 sec",
              form_cue: "Keep core braced, don't arch lower back",
            },
            {
              name: "Fire Hydrant",
              sets: 3,
              reps_or_duration: "15 per side",
              rest: "30 sec",
              form_cue: "Lift knee out to side, hip external rotation",
            },
          ],
        },
        {
          section_label: "Core & Pelvic Floor",
          exercises: [
            {
              name: "Plank",
              sets: 3,
              reps_or_duration: "30 sec",
              rest: "30 sec",
              form_cue: "Body straight, glutes squeezed",
            },
            {
              name: "Dead Bug",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "30 sec",
              form_cue: "Lower back pressed to floor",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "The barbell hip thrust is the most powerful glute builder. Use a pad if needed. Control the eccentric and explode up.",
    },
    {
      day: 6,
      name: "Zone 2 Cardio + Glute Activation",
      category: "cardio",
      durationMin: 45,
      intensity: "low",
      warm_up: [{ name: "Light walk", duration: "5 min" }],
      main_block: [
        {
          section_label: "Steady State Cardio",
          exercises: [
            {
              name: "Incline walk or jog (60–70% max HR)",
              sets: 1,
              reps_or_duration: "30 min",
              rest: "–",
              form_cue: "Nose breathing, can speak short sentences",
            },
          ],
        },
        {
          section_label: "Glute Activation Circuit (post-cardio)",
          exercises: [
            {
              name: "Glute Bridge (double leg)",
              sets: 3,
              reps_or_duration: "15",
              rest: "30 sec",
              form_cue: "Slow tempo, hold at top",
            },
            {
              name: "Clamshell (band)",
              sets: 3,
              reps_or_duration: "15 per side",
              rest: "30 sec",
              form_cue: "Feet together, open knee like a clam",
            },
            {
              name: "Bird Dog",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "30 sec",
              form_cue: "Slow and controlled",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "Zone 2 builds aerobic capacity and improves fat oxidation. Adding glute activation after cardio reinforces the mind-muscle connection.",
    },
    {
      day: 7,
      name: "Complete Rest",
      category: "rest",
      durationMin: 0,
      intensity: "low",
      warm_up: [],
      main_block: [],
      cool_down: [],
      coaching_note: "One week down. Notice any changes in posture or how your glutes feel during daily activities.",
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// WEEK 2 – BUILD (add sets and slight load increase)
// ──────────────────────────────────────────────────────────────
const week2: PlanWeek = {
  week: 2,
  theme: "Build",
  days: [
    {
      day: 1,
      name: "Power Drive — Load Increase",
      category: "strength",
      durationMin: 55,
      intensity: "high",
      warm_up: gluteActivationWarmUp,
      main_block: [
        {
          section_label: "Main Lifts (4 sets now)",
          exercises: [
            {
              name: "Goblet Squat",
              sets: 4,
              reps_or_duration: "10–12",
              rest: "60 sec",
              form_cue: "Add 2–4 kg, maintain depth",
            },
            {
              name: "Romanian Deadlift (DB)",
              sets: 4,
              reps_or_duration: "10",
              rest: "60 sec",
              form_cue: "Heavier load, but form first",
            },
            {
              name: "Barbell Hip Thrust",
              sets: 4,
              reps_or_duration: "12",
              rest: "75 sec",
              form_cue: "Add 5–10 kg from week 1",
            },
            {
              name: "Bulgarian Split Squat",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "75 sec",
              form_cue: "Hold dumbbells, keep front shin vertical",
            },
            {
              name: "Single-Leg Glute Bridge",
              sets: 3,
              reps_or_duration: "12 per side",
              rest: "45 sec",
              form_cue: "Add weight across hips",
            },
            {
              name: "Lateral Lunge",
              sets: 3,
              reps_or_duration: "12 per side",
              rest: "60 sec",
              form_cue: "Hold dumbbell goblet style",
            },
          ],
        },
        {
          section_label: "Finisher",
          exercises: [
            {
              name: "Band Walks",
              sets: 3,
              reps_or_duration: "12 steps each way",
              rest: "30 sec",
              form_cue: "Heavier band",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "Progressive overload: we added a set to each main lift. Small, consistent increases compound dramatically over months.",
    },
    {
      day: 2,
      name: "Active Recovery / Yoga Flow",
      category: "active-recovery",
      durationMin: 40,
      intensity: "low",
      warm_up: [],
      main_block: [
        {
          section_label: "Yoga for Hips & Glutes",
          exercises: [
            {
              name: "Cat-Cow",
              sets: 1,
              reps_or_duration: "10 reps",
              rest: "–",
              form_cue: "Coordinate breath with movement",
            },
            {
              name: "Thread the Needle",
              sets: 1,
              reps_or_duration: "8 per side",
              rest: "–",
              form_cue: "Thoracic rotation",
            },
            {
              name: "Downward Dog to Cobra Flow",
              sets: 1,
              reps_or_duration: "5 reps",
              rest: "–",
              form_cue: "Smooth transitions",
            },
            {
              name: "Low Lunge to Lizard",
              sets: 1,
              reps_or_duration: "60 sec per side",
              rest: "–",
              form_cue: "Sink hips forward, breathe into stretch",
            },
            {
              name: "Pigeon Pose",
              sets: 1,
              reps_or_duration: "90 sec per side",
              rest: "–",
              form_cue: "Relax completely, support with blanket if needed",
            },
            {
              name: "Supine Twist",
              sets: 1,
              reps_or_duration: "60 sec per side",
              rest: "–",
              form_cue: "Let gravity do the work",
            },
            {
              name: "Savasana with breathwork",
              sets: 1,
              reps_or_duration: "5 min",
              rest: "–",
              form_cue: "Diaphragmatic breathing",
            },
          ],
        },
      ],
      cool_down: [],
      coaching_note:
        "Active recovery enhances flexibility and reduces muscle tension. This session is essential for joint health and relaxation.",
    },
    {
      day: 3,
      name: "Posterior Chain — Heavy Hinge",
      category: "strength",
      durationMin: 55,
      intensity: "high",
      warm_up: lowerBodyWarmUp,
      main_block: [
        {
          section_label: "Hinge Intensive",
          exercises: [
            {
              name: "Barbell Romanian Deadlift",
              sets: 4,
              reps_or_duration: "8",
              rest: "90 sec",
              form_cue: "Increase load, focus on hamstring stretch",
            },
            {
              name: "Sumo Deadlift",
              sets: 4,
              reps_or_duration: "8",
              rest: "90 sec",
              form_cue: "Add weight, drive through floor",
            },
            {
              name: "Reverse Lunge (weighted)",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "60 sec",
              form_cue: "Hold dumbbells, control each rep",
            },
            {
              name: "Nordic Hamstring Curl",
              sets: 3,
              reps_or_duration: "6–8",
              rest: "60 sec",
              form_cue: "Slow eccentric, use band for assistance",
            },
            {
              name: "Kettlebell Swing",
              sets: 4,
              reps_or_duration: "20",
              rest: "45 sec",
              form_cue: "Explosive hip drive, heavier bell",
            },
            {
              name: "Side-Lying Leg Lift",
              sets: 3,
              reps_or_duration: "15 per side",
              rest: "30 sec",
              form_cue: "Add ankle weight",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "Heavier deadlifts require perfect bracing. Take 90 sec rest between sets to maintain quality.",
    },
    {
      day: 4,
      name: "Rest",
      category: "rest",
      durationMin: 0,
      intensity: "low",
      warm_up: [],
      main_block: [],
      cool_down: [],
      coaching_note: "Your body builds strength during rest, not during training. Honour this day.",
    },
    {
      day: 5,
      name: "Glute Volume & Power",
      category: "strength",
      durationMin: 60,
      intensity: "high",
      warm_up: gluteActivationWarmUp,
      main_block: [
        {
          section_label: "Hypertrophy Block",
          exercises: [
            {
              name: "Barbell Hip Thrust",
              sets: 4,
              reps_or_duration: "12",
              rest: "75 sec",
              form_cue: "Increase load, pause at top",
            },
            {
              name: "Front Squat",
              sets: 4,
              reps_or_duration: "8–10",
              rest: "75 sec",
              form_cue: "Add weight, maintain upright torso",
            },
            {
              name: "Curtsy Lunge",
              sets: 3,
              reps_or_duration: "12 per side",
              rest: "60 sec",
              form_cue: "Add dumbbells",
            },
            {
              name: "Step-Up (explosive)",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "60 sec",
              form_cue: "Drive up fast, step down slow",
            },
            {
              name: "Banded Donkey Kick",
              sets: 3,
              reps_or_duration: "15 per side",
              rest: "30 sec",
              form_cue: "Heavier band, keep core engaged",
            },
            {
              name: "Fire Hydrant",
              sets: 3,
              reps_or_duration: "15 per side",
              rest: "30 sec",
              form_cue: "Add ankle weight",
            },
            {
              name: "Clamshell (band)",
              sets: 3,
              reps_or_duration: "20 per side",
              rest: "30 sec",
              form_cue: "Slow and controlled",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "Volume week: more sets and reps. The burn is real — but that's the glute medius and minimus waking up.",
    },
    {
      day: 6,
      name: "Cardio + Glute Finisher",
      category: "cardio",
      durationMin: 50,
      intensity: "moderate",
      warm_up: hiitWarmUp,
      main_block: [
        {
          section_label: "Interval Walk / Jog",
          exercises: [
            {
              name: "30 sec fast / 30 sec easy",
              sets: 1,
              reps_or_duration: "20 min alternation",
              rest: "–",
              form_cue: "Fast pace = 7/10 effort",
            },
          ],
        },
        {
          section_label: "Glute Finisher",
          exercises: [
            {
              name: "Hip Thrust (bodyweight)",
              sets: 3,
              reps_or_duration: "20",
              rest: "30 sec",
              form_cue: "Squeeze hard at top",
            },
            {
              name: "Squat Jump",
              sets: 3,
              reps_or_duration: "10",
              rest: "30 sec",
              form_cue: "Land softly, immediate next rep",
            },
            {
              name: "Reverse Lunge to Knee Drive",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "30 sec",
              form_cue: "Explosive knee drive",
            },
            {
              name: "Side Plank with Leg Lift",
              sets: 3,
              reps_or_duration: "10 per side",
              rest: "30 sec",
              form_cue: "Lift top leg, squeeze glute",
            },
          ],
        },
      ],
      cool_down: lowerBodyCoolDown,
      coaching_note:
        "Adding intervals increases EPOC (afterburn effect). Keep the glute finisher crisp — this is where power develops.",
    },
    {
      day: 7,
      name: "Rest or Easy Walk",
      category: "rest",
      durationMin: 0,
      intensity: "low",
      warm_up: [],
      main_block: [],
      cool_down: [],
      coaching_note: "You've completed two weeks. Notice how your glutes feel when you walk upstairs.",
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// WEEKS 3–8 follow similar progressive overload pattern.
// For brevity, we define a generator function or directly write remaining weeks.
// Here we'll manually outline weeks 3–8 with increasing intensity and volume.
// ──────────────────────────────────────────────────────────────

// Week 3: Peak volume (4 sets for most exercises, RPE 7–8)
const week3: PlanWeek = {
  week: 3,
  theme: "Peak Volume",
  days: week2.days.map((day, idx) => {
    // Clone and increase intensity for strength days (day 1,3,5)
    if ([0, 2, 4].includes(idx)) {
      const newDay = { ...day };
      newDay.intensity = "very-high";
      newDay.durationMin = (day.durationMin || 50) + 5;
      newDay.coaching_note = "Week 3: Peak volume week. Add one more set to each main exercise (4→5 sets). Keep rest times the same. Push RPE to 8.";
      // Modify main_block to increase sets (simplified representation)
      if (newDay.main_block && newDay.main_block[0]) {
        newDay.main_block[0].exercises = newDay.main_block[0].exercises.map((ex) => {
          if (ex.sets === 4) return { ...ex, sets: 5, reps_or_duration: ex.reps_or_duration };
          return ex;
        });
      }
      return newDay;
    }
    return day;
  }),
};

// Week 4: Deload (reduce volume by ~30%)
const week4: PlanWeek = {
  week: 4,
  theme: "Deload",
  days: week1.days.map((day) => {
    const newDay = { ...day };
    if (day.category === "strength") {
      newDay.intensity = "moderate";
      newDay.durationMin = Math.max(35, (day.durationMin || 50) - 15);
      newDay.coaching_note = "Deload week: reduce sets by 1, use 70% of max weight. Focus on perfect form and recovery.";
      if (newDay.main_block && newDay.main_block[0]) {
        newDay.main_block[0].exercises = newDay.main_block[0].exercises.map((ex) => {
          if (ex.sets && ex.sets > 2) return { ...ex, sets: ex.sets - 1 };
          return ex;
        });
      }
    }
    return newDay;
  }),
};

// Week 5: Reset and build (similar to week 2 but with heavier base)
const week5: PlanWeek = {
  week: 5,
  theme: "Reset & Build",
  days: week2.days.map((day) => {
    const newDay = { ...day };
    if (day.category === "strength") {
      newDay.coaching_note = "Week 5: Start with week 2 loads, but add 2–4 kg on all compound lifts. Your body is stronger now.";
    }
    return newDay;
  }),
};

// Week 6: Peak Intensity (RPE 8–9, top sets)
const week6: PlanWeek = {
  week: 6,
  theme: "Peak Intensity",
  days: week3.days.map((day, idx) => {
    if ([0, 2, 4].includes(idx)) {
      const newDay = { ...day };
      newDay.coaching_note = "Week 6: Top set on first exercise each day — 1 set of 5 reps at RPE 9, then back off sets. Push heavy but never break form.";
      if (newDay.main_block && newDay.main_block[0]) {
        const firstEx = newDay.main_block[0].exercises[0];
        if (firstEx) {
          firstEx.reps_or_duration = "5 (top set) then 3×8–10";
          firstEx.form_cue += " Top set: near maximal effort, perfect technique.";
        }
      }
      return newDay;
    }
    return day;
  }),
};

// Week 7: Consolidation (maintain loads, focus on tempo)
const week7: PlanWeek = {
  week: 7,
  theme: "Consolidation",
  days: week5.days.map((day) => {
    const newDay = { ...day };
    if (day.category === "strength") {
      newDay.coaching_note = "Week 7: Same loads as week 6, but add tempo (3-1-2 on all lifts). Time under tension drives hypertrophy.";
    }
    return newDay;
  }),
};

// Week 8: Deload & Test
const week8: PlanWeek = {
  week: 8,
  theme: "Deload & Celebrate",
  days: week4.days.map((day, idx) => {
    const newDay = { ...day };
    if (idx === 0) {
      // Day 1: optional test day
      newDay.name = "Test Day — Celebrate Your Strength";
      newDay.coaching_note = "Optional: test your 5-rep max on Hip Thrust or Squat. Then lighter back-off sets. Celebrate how far you've come.";
      if (newDay.main_block && newDay.main_block[0]) {
        newDay.main_block[0].exercises.unshift({
          name: "5-Rep Max Test (optional)",
          sets: 1,
          reps_or_duration: "5 @ 9/10 RPE",
          rest: "–",
          form_cue: "Pick a weight you can do for 5 with great form. This is your benchmark.",
        });
      }
    } else {
      newDay.coaching_note = "Final deload week. Light work only. Reflect on your progress and rest before the next cycle.";
    }
    return newDay;
  }),
};
// ─────────────────────────────────────────────────────────────────
// Aggregator + backwards-compat aliases
//
// Consumers (TrainingTab, training-path-utils, training-csv-enrichment,
// exercise-image-lookup) read from SIGNAL_TRAINING_PATHS and use the
// legacy DaySession / TrainingWeek / TrainingFocus type names. Each
// named TrainingPath above is appended below; any session that has
// supersets/warmup/coolDown but no structure[] gets a derived
// structure[] so the existing string-based renderer keeps working.
// ─────────────────────────────────────────────────────────────────

/** Legacy alias — equivalent to Session with optional structure[]. */
export type DaySession = Session;
export type TrainingWeek = Week;
export type TrainingFocus =
  | "strength"
  | "muscle"
  | "cardio"
  | "run"
  | "pilates"
  | "restore"
  | "hybrid"
  | "stress-relief"
  | "glute-power";

function flattenSupersetToLines(s: Superset): string[] {
  const lines: string[] = [];
  const round = s.rounds ? ` × ${s.rounds} rounds` : "";
  for (const ex of s.exercises) {
    const reps = typeof ex.reps === "number" ? `${ex.reps}` : ex.reps;
    const tempo = ex.tempo ? ` tempo ${ex.tempo}` : "";
    const weight = ex.weight ? ` @ ${ex.weight}` : "";
    const notes = ex.notes ? ` — ${ex.notes}` : "";
    lines.push(`${ex.name} – ${ex.sets}×${reps}${tempo}${weight}${notes}`);
  }
  if (round) lines[0] = `${lines[0]}${round}`;
  return lines;
}

/**
 * Materialise structure[] for any session that uses the new
 * supersets/warmup/coolDown shape, so the existing renderer + helpers
 * (image lookup, exercise library walker) keep working unchanged.
 */
function withStructure(session: Session): Session {
  if (session.structure && session.structure.length > 0) return session;
  const lines: string[] = [];
  if (session.warmup?.length) lines.push(...session.warmup.map(w => `Warm up: ${w}`));
  if (session.supersets?.length) {
    for (const ss of session.supersets) lines.push(...flattenSupersetToLines(ss));
  }
  if (session.coolDown?.length) lines.push(...session.coolDown.map(c => `Cool down: ${c}`));
  return { ...session, structure: lines.length > 0 ? lines : ["Rest"] };
}

function normalisePath(path: TrainingPath): TrainingPath {
  return {
    ...path,
    weeks: (path.weeks ?? []).map(w => ({
      ...w,
      sessions: Array.isArray((w as any).sessions)
        ? (w as any).sessions.map(withStructure)
        : [],
    })),
  };
}

// ═══════════════════════════════════════════════════════════
// 7. LEARN TO RUN – 8-WEEK C25K-STYLE PROGRESSION
// ═══════════════════════════════════════════════════════════
export const learnToRun: TrainingPath = {
  id: "learn-to-run",
  name: "The Path That Becomes a Run",
  subtitle: "For the woman who was told she wasn't a runner",
  focus: "run",
  description:
    "Running is rhythm – the steady beat of your feet, the rise and fall of your breath, the quiet that settles when you simply move. This path meets you exactly where you are. If you can walk, you can begin.",
  whoItIsFor:
    "Anyone who wants to run – gently, slowly, and for the joy of it. No pace targets. No judgment.",
  weeks: [
    { week: 1, theme: "Introduction", progression: "3 run-walk days, 1 strength day, 3 rest days.",
      sessions: [
        { day: 1, name: "Run-Walk 1", focus: "Interval introduction", durationMin: 25, equipment: "Good shoes", feel: "Curious, not pressured", structure: ["5 min brisk walk", "Repeat 5×: 1 min light jog / 2 min walk", "5 min walk cool-down"], coachingNote: "One minute is not a test. It is an invitation." },
        { day: 2, name: "Strength for Runners", focus: "Glutes, core, stability", durationMin: 30, equipment: "Mat, light dumbbells", feel: "Steady and supportive", structure: ["5 min warm-up: glute bridges, hip circles", "Circuit 3 rounds: Single-Leg Deadlift (BW) ×10/side, Step-Up ×10/side, Side Plank 25 sec/side, Dead Bug 10/side", "5 min stretch"], coachingNote: "Running is a single-leg sport. Build stability now." },
        { day: 3, name: "Rest", durationMin: 0, structure: ["Rest"] },
        { day: 4, name: "Run-Walk 2", focus: "Repeat intervals", durationMin: 25, equipment: "Good shoes", feel: "Beginning to trust", structure: ["5 min walk", "6×: 1 min jog / 90 sec walk", "5 min walk"] },
        { day: 5, name: "Rest", durationMin: 0, structure: ["Rest"] },
        { day: 6, name: "Run-Walk 3", focus: "Longer session", durationMin: 28, equipment: "Good shoes", feel: "Building", structure: ["5 min walk", "5×: 1 min jog / 2 min walk (consistency is the growth)", "5 min walk"] },
        { day: 7, name: "Rest", durationMin: 0, structure: ["Rest"] }
      ] },
    { week: 2, theme: "Extending the Run", progression: "Increase run interval to 90 sec.",
      sessions: [
        { day: 1, name: "Run-Walk 4", durationMin: 28, equipment: "Good shoes", feel: "A little braver", structure: ["5 min walk", "5×: 90 sec jog / 2 min walk", "5 min walk"], coachingNote: "Ninety seconds. Your body is learning that it can do this." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Steady", structure: ["Same as Week 1, add light dumbbells to Step-Up and Single-Leg Deadlift"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 5", durationMin: 28, equipment: "Good shoes", feel: "Flowing", structure: ["5 min walk", "6×: 90 sec jog / 90 sec walk", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 6", durationMin: 30, equipment: "Good shoes", feel: "Building", structure: ["5 min walk", "5×: 90 sec jog / 2 min walk, then finish with 3 min jog", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 3, theme: "Two Minutes and Beyond", progression: "Increase run interval to 2 min.",
      sessions: [
        { day: 1, name: "Run-Walk 7", durationMin: 30, equipment: "Good shoes", feel: "Finding rhythm", structure: ["5 min walk", "5×: 2 min jog / 2 min walk", "5 min walk"] },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Strong", structure: ["As Week 2, increase reps by 2 on each exercise"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 8", durationMin: 30, equipment: "Good shoes", feel: "Consistent", structure: ["5 min walk", "4×: 2 min jog / 90 sec walk, then 3 min jog", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 9", durationMin: 32, equipment: "Good shoes", feel: "Enduring", structure: ["5 min walk", "4×: 3 min jog / 2 min walk", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 4, theme: "Consolidation", progression: "Repeat Week 3; aim to feel smoother.",
      sessions: [
        { day: 1, name: "Run-Walk 10", durationMin: 30, equipment: "Good shoes", feel: "Familiar", structure: ["5 min walk", "5×: 2 min jog / 2 min walk", "5 min walk"] },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Solid", structure: ["Same as Week 3"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 11", durationMin: 30, equipment: "Good shoes", feel: "Smooth", structure: ["5 min walk", "4×: 2 min jog / 90 sec walk, then 3 min jog", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 12", durationMin: 32, equipment: "Good shoes", feel: "Confident", structure: ["5 min walk", "4×: 3 min jog / 2 min walk", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 5, theme: "Longer Intervals", progression: "Run intervals increase to 4-5 min.",
      sessions: [
        { day: 1, name: "Run-Walk 13", durationMin: 32, equipment: "Good shoes", feel: "Stronger", structure: ["5 min walk", "4×: 4 min jog / 2 min walk", "5 min walk"] },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Powerful", structure: ["Add Bulgarian Split Squat 3×8/side, Plank 3×45 sec to circuit"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 14", durationMin: 32, equipment: "Good shoes", feel: "Enduring", structure: ["5 min walk", "3×: 5 min jog / 2 min walk", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 15", durationMin: 35, equipment: "Good shoes", feel: "Alive", structure: ["5 min walk", "3×: 5 min jog / 90 sec walk", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 6, theme: "Almost There", progression: "Run intervals reach 8 min.",
      sessions: [
        { day: 1, name: "Run-Walk 16", durationMin: 35, equipment: "Good shoes", feel: "Determined", structure: ["5 min walk", "2×: 8 min jog / 3 min walk", "5 min walk"], coachingNote: "Eight minutes. You are a runner now." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Strong", structure: ["Same as Week 5"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 17", durationMin: 35, equipment: "Good shoes", feel: "Smooth", structure: ["5 min walk", "2×: 10 min jog / 3 min walk", "5 min walk"], coachingNote: "Ten minutes without stopping. Let that sink in." },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 18", durationMin: 38, equipment: "Good shoes", feel: "Resilient", structure: ["5 min walk", "1×: 15 min jog continuous", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 7, theme: "Continuous", progression: "Run 20-25 min continuous.",
      sessions: [
        { day: 1, name: "Run 1", durationMin: 35, equipment: "Good shoes", feel: "Free", structure: ["5 min walk", "Run 20 min continuous", "5 min walk"], coachingNote: "Twenty minutes. You have arrived." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Capable", structure: ["Same circuit, aim for 4 rounds"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run 2", durationMin: 35, equipment: "Good shoes", feel: "Smooth", structure: ["5 min walk", "Run 25 min continuous", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run 3", durationMin: 30, equipment: "Good shoes", feel: "Peaceful", structure: ["5 min walk", "Easy 20 min run – enjoy it", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 8, theme: "Celebration", progression: "Run 30 min continuously (or your longest yet).",
      sessions: [
        { day: 1, name: "Celebration Run", durationMin: 40, equipment: "Good shoes", feel: "Triumphant", structure: ["5 min walk", "Run 30 min (or as long as feels good)", "5 min walk"], coachingNote: "Eight weeks ago, one minute felt long. Look at you now. This is who you are." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Grateful", structure: ["Light session – your favourite exercises, 2 sets each"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Easy Run or Walk", durationMin: 30, equipment: "Good shoes", feel: "Peaceful", structure: ["Whatever your body wants – a gentle run or a long walk."] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Reflect", durationMin: 0, equipment: "None", feel: "Complete", structure: ["Write down how you feel. What has changed in your body, your mind, your sense of what is possible?"], coachingNote: "This path is yours forever. Run whenever you need to come home to yourself." }
      ] }
  ]
};

// ═══════════════════════════════════════════════════════════
// 8. THE 8-MOVE CIRCUIT PATH – 8-WEEK CARDIO + ENDURANCE
// ═══════════════════════════════════════════════════════════
export const cardioCircuit: TrainingPath = {
  id: "signal-circuit-progressive",
  name: "The 8-Move Circuit Path",
  subtitle: "Two rounds. Eight moves. Eight weeks of quiet power.",
  focus: "cardio",
  description:
    "This is not random work. It is a conversation between you and your body – a steady climb from beginner-friendly reps and simple jumps to explosive intervals and long cardio bursts. Each workout lists 8 exercises. You complete the list once, rest 90 seconds, then do it again. The themes change every day so you never burn out the same muscles twice.",
  whoItIsFor:
    "The woman who wants clear structure, visible progress, and a workout that fits inside 30 minutes. She is ready to sweat, but she also wants to feel her heart grow stronger week by week.",
  weeks: [
    { week: 1, theme: "Easy Rhythm", progression: "All exercises bodyweight. Low reps. No plyometrics.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Easy)", durationMin: 25, equipment: "None (optional: skipping rope)", feel: "Conversational",
          structure: ["Circuit – 2 rounds (rest 90 sec between rounds):", "1. Bodyweight Squats – 12 reps", "2. Stationary Lunges – 8 reps per leg", "3. Step Ups (low bench) – 8 reps per leg", "4. Knee Ups (marching in place) – 16 reps total", "5. Glute Bridges – 12 reps", "6. Toe Taps (light) – 12 reps", "7. Walking Lunges – 8 reps per leg", "8. Slow Mountain Climbers – 15 reps total"],
          coachingNote: "Move slowly. Feel each rep. If you are not sweating, that is fine – this week is about learning the pattern." },
        { day: 2, name: "Upper Body & Cardio (Easy)", durationMin: 25, equipment: "Optional: light dumbbells (1-3 kg)", feel: "Steady",
          structure: ["Circuit – 2 rounds:", "1. Incline Push Ups (hands on bench) – 10 reps", "2. Tricep Dips (feet on floor) – 10 reps", "3. Arm Circles (small) – 20 reps forward + 20 back", "4. Plank – 20 seconds", "5. Bent-over Rows (no weight or water bottles) – 12 reps", "6. Shoulder Press (light) – 10 reps", "7. Bird Dog – 8 reps per side", "8. Jumping Jacks – 30 reps"],
          coachingNote: "Keep your shoulders relaxed. Do not rush the plank – it is okay to drop to your knees." },
        { day: 3, name: "Core & Cardio (Easy)", durationMin: 25, equipment: "None", feel: "Light burn",
          structure: ["Circuit – 2 rounds:", "1. Standing Toe Taps – 12 reps per leg", "2. Dead Bug – 8 reps per side", "3. Straight Leg Raises – 10 reps total", "4. Seated Knee Tucks (on mat) – 12 reps", "5. Heel Taps (lying down) – 12 reps per side", "6. Marching in Place (high knees, slow) – 30 sec", "7. Side Plank (knee down) – 15 sec per side", "8. Bicycle Crunches (slow) – 10 reps per side"],
          coachingNote: "This is not about speed. Keep your lower back pressed into the floor for all lying moves." },
        { day: 4, name: "Rest or Easy Walk", structure: ["Rest, gentle stretching, or 20-30 min walk"] },
        { day: 5, name: "Full Body (Easy Cardio Mix)", durationMin: 28, equipment: "Optional: skipping rope", feel: "Energised",
          structure: ["Circuit – 2 rounds:", "1. Squat to Stand (slow) – 10 reps", "2. Push Ups (knees or incline) – 8 reps", "3. Reverse Lunges – 8 reps per leg", "4. Lying Tricep Extensions (no weight) – 10 reps", "5. Plank Shoulder Taps – 8 reps per side", "6. Butt Kicks (slow) – 20 reps total", "7. Supine Leg Lowering – 8 reps per leg", "8. Skipping (or imaginary skipping) – 40 reps"],
          coachingNote: "You should finish feeling like you could do another round – but save that for next week." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 2, theme: "Increase Reps Slightly", progression: "Add 3-5 reps per move. Introduce a light skipping rope.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Week 2)", durationMin: 28, equipment: "Skipping rope (optional)", feel: "Building rhythm",
          structure: ["Circuit – 2 rounds:", "1. Squats – 15 reps", "2. Walking Lunges – 10 reps per leg", "3. Step Ups – 10 reps per leg", "4. Sumo Squats – 12 reps", "5. Donkey Kicks – 12 reps per leg", "6. Knee Ups (controlled) – 16 reps total", "7. Glute Bridge with 3 sec hold – 12 reps", "8. Skipping (easy pace) – 50 reps"],
          coachingNote: "The skipping can be broken into 25 + 25. Land softly on the balls of your feet." },
        { day: 2, name: "Upper Body & Cardio (Week 2)", durationMin: 28, equipment: "Light dumbbells (2-4 kg) or water bottles", feel: "Steady effort",
          structure: ["Circuit – 2 rounds:", "1. Knee Push Ups – 12 reps", "2. Tricep Dips (feet on floor) – 12 reps", "3. Lateral Raises (light) – 10 reps", "4. Plank – 30 seconds", "5. Dumbbell Rows – 12 reps per side", "6. Overhead Press – 10 reps", "7. Arm Scissors (lying) – 20 reps total", "8. High Knees (slow to moderate) – 20 reps per leg"],
          coachingNote: "Focus on lowering the weights slowly – that is where the strength builds." },
        { day: 3, name: "Core & Cardio (Week 2)", durationMin: 28, equipment: "None or mat", feel: "Controlled",
          structure: ["Circuit – 2 rounds:", "1. Plank – 30 sec", "2. Toe Taps (lying, legs up) – 14 reps", "3. Reverse Crunches – 12 reps", "4. Side Plank (knee allowed) – 20 sec per side", "5. Mountain Climbers (slow cadence) – 20 reps total", "6. Windshield Wipers (small range) – 12 reps total", "7. Leg Lowers (straight) – 10 reps", "8. Russian Twists (feet on floor) – 16 reps total (8/side)"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Week 2)", durationMin: 30, equipment: "Skipping rope, light weights", feel: "Balanced",
          structure: ["Circuit – 2 rounds:", "1. Goblet Squats (hold one weight) – 12 reps", "2. Push Ups (knees or full) – 10 reps", "3. Reverse Lunges with Knee Drive – 8 reps per leg", "4. Tricep Kickbacks – 12 reps per arm", "5. Lying Leg Raises – 12 reps", "6. Plank Jacks – 15 reps total", "7. Box Step Overs (low bench) – 10 reps per leg", "8. Burpees (no push up, no jump) – 6 reps"],
          coachingNote: "The burpees are slow – stand up, squat back, kick feet out, step back in, stand. No rush." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 3, theme: "Introduce Tempo", progression: "Faster pace on cardio moves. First small jumps.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Tempo)", durationMin: 30, equipment: "Skipping rope, low bench", feel: "Moderate effort",
          structure: ["Circuit – 2 rounds:", "1. Jumping Jacks – 40 reps", "2. Split Squats (stationary) – 10 reps per leg", "3. Alternating Reverse Lunges – 14 reps total", "4. Step Ups with Knee Lift – 10 reps per leg", "5. Skater Hops (small) – 12 reps per side", "6. Skipping – 80 reps", "7. Sumo Squats with Pulse – 12 reps + 8 pulses", "8. Calf Raises – 20 reps"],
          coachingNote: "Skater hops = jump side to side like a speed skater. Keep the jump low. Land softly." },
        { day: 2, name: "Upper Body & Cardio (Tempo)", durationMin: 30, equipment: "Light dumbbells (3-5 kg), bench", feel: "Building",
          structure: ["Circuit – 2 rounds:", "1. Push Ups (full or knees) – 12 reps", "2. Tricep Dips (feet on floor) – 14 reps", "3. Bent Over Rows – 12 reps", "4. Plank with Arm Reach – 8 reps per side", "5. Dumbbell Punch (alternating) – 20 reps total", "6. Incline Push Ups (feet on bench) – 10 reps", "7. Bear Crawl (forward & back) – 4 crawls each way", "8. Fast Feet (in place) – 30 seconds"] },
        { day: 3, name: "Core & Cardio (Tempo)", durationMin: 30, equipment: "Mat, skipping rope", feel: "Core fatigue",
          structure: ["Circuit – 2 rounds:", "1. Plank – 40 seconds", "2. Bicycle Crunches – 16 reps per side", "3. Scissor Kicks – 20 reps total", "4. Hollow Body Hold – 20 seconds", "5. Mountain Climbers (moderate pace) – 30 reps total", "6. V-Ups (bent knees) – 12 reps", "7. Side Plank Dips – 8 reps per side", "8. Skipping (fast feet style) – 100 reps"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Tempo)", durationMin: 32, equipment: "Dumbbells (3-5 kg), skipping rope", feel: "Sweaty",
          structure: ["Circuit – 2 rounds:", "1. Burpees (regular, no push up) – 8 reps", "2. Walking Lunges with Twist – 12 reps total (6/leg)", "3. Push Up to Downward Dog – 8 reps", "4. Squat to Overhead Press – 12 reps", "5. Plank Walk (hand to elbow) – 12 reps total", "6. Butt Kicks (fast) – 30 seconds", "7. Box Jumps (low bench, step down) – 8 reps", "8. Skipping – 120 reps"],
          coachingNote: "Box jumps step down, do not jump down – your knees will thank you." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 4, theme: "Consolidation with Small Jumps", progression: "Repeat Week 3 but reduce rest between rounds to 75 sec.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Week 4)", durationMin: 30, equipment: "Skipping rope", feel: "Stronger",
          structure: ["Circuit – 2 rounds (rest 75 sec):", "1. Jump Squats (low jump) – 10 reps", "2. Alternating Jump Lunges (small) – 8 reps per leg", "3. Speed Skaters – 15 reps per side", "4. Step Ups with Hop (low bench) – 8 reps per leg", "5. Skipping – 120 reps", "6. Single Leg Glute Bridge – 10 reps per leg", "7. Lateral Lunges – 10 reps per side", "8. High Knees (in place) – 40 reps total"],
          coachingNote: "The jump is small – think 'springy', not 'explosive'. Protect your knees." },
        { day: 2, name: "Upper Body & Cardio (Week 4)", durationMin: 30, equipment: "Dumbbells (4-6 kg), bench", feel: "Controlled power",
          structure: ["Circuit – 2 rounds (rest 75 sec):", "1. Decline Push Ups (feet on bench) – 10 reps", "2. Tricep Dips (feet elevated) – 12 reps", "3. Renegade Rows (knees down) – 6 reps per arm", "4. Plank Up-Downs – 10 reps total", "5. Dumbbell Floor Press – 12 reps", "6. Lateral Raises – 12 reps", "7. Arm Circles with small weight – 15 forward/back", "8. Jumping Jacks – 50 reps"] },
        { day: 3, name: "Core & Cardio (Week 4)", durationMin: 30, equipment: "Mat, skipping rope", feel: "Deep core work",
          structure: ["Circuit – 2 rounds:", "1. Plank with Knee Taps – 16 reps total", "2. Leg Lowers (straight, slow) – 12 reps", "3. Toe Taps (lying, legs vertical) – 20 reps", "4. Side Plank (full or knee) – 25 sec per side", "5. Cross Body Mountain Climbers – 20 reps total", "6. Russian Twists (feet up) – 20 reps total (10/side)", "7. Flutter Kicks – 30 seconds", "8. Skipping (alternating feet) – 150 reps"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Week 4)", durationMin: 32, equipment: "Dumbbells, skipping rope, bench", feel: "Complete",
          structure: ["Circuit – 2 rounds:", "1. Burpee with Push Up – 8 reps", "2. Dumbbell Squat to Press – 12 reps", "3. Reverse Lunge with Bicep Curl – 10 reps per leg", "4. Tricep Dips (feet on floor) – 15 reps", "5. Plank Shoulder Taps – 16 reps total", "6. Box Step Over with Knee Drive – 10 reps per leg", "7. Tuck Jumps (low) – 8 reps", "8. Skipping – 150 reps"],
          coachingNote: "Tuck jumps = jump and pull knees toward chest. Land like a cat – soft and quiet." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 5, theme: "Plyometric Introduction", progression: "Add tuck jumps, broad jumps. Skipping to 200 reps.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Plyo Start)", durationMin: 32, equipment: "Skipping rope, low bench/box", feel: "Powerful",
          structure: ["Circuit – 2 rounds:", "1. Broad Jumps (standing long jump) – 6 reps", "2. Tuck Jumps – 8 reps", "3. Alternating Jump Lunges – 12 reps total (6/leg)", "4. Box Jumps (step down) – 10 reps", "5. Skipping – 200 reps", "6. Single Leg Squat to Bench (touch and stand) – 8 reps per leg", "7. Lateral Hops over line – 15 reps per side", "8. Ice Skaters (large lateral jumps) – 10 reps per side"] },
        { day: 2, name: "Upper Body & Cardio (Plyo Upper)", durationMin: 32, equipment: "Dumbbells, bench, medicine ball (optional)", feel: "Explosive push",
          structure: ["Circuit – 2 rounds:", "1. Plyo Push Ups (clap or just explosive) – 6 reps", "2. Medicine Ball Slams (or squat jump toss) – 12 reps", "3. Tricep Dips with Leg Lift – 12 reps", "4. Commando Plank (fast) – 16 reps total", "5. Dumbbell Snatch (single arm) – 6 reps per arm", "6. Bear Crawl (fast) – 10 steps forward/back", "7. Mountain Climbers (fast) – 40 reps total", "8. Skipping (double unders or fast singles) – 150 reps"] },
        { day: 3, name: "Core & Cardio (Plyo Core)", durationMin: 32, equipment: "Mat, skipping rope", feel: "Core endurance",
          structure: ["Circuit – 2 rounds:", "1. Plank Jacks – 20 reps", "2. V-Up Tucks – 12 reps", "3. Leg Throw Downs – 10 reps per leg", "4. Side Plank with Knee Drive – 10 reps per side", "5. Mountain Climber Cross – 30 reps total", "6. Hollow Body Rocks – 15 rocks", "7. Russian Twist with Pulse – 20 reps per side", "8. Fast Feet + Sprint in Place – 20 sec fast feet, 10 sec sprint, repeat 2x"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Plyo Mix)", durationMin: 35, equipment: "Skipping rope, box/bench, light dumbbells", feel: "Full throttle",
          structure: ["Circuit – 2 rounds:", "1. Burpee to Tuck Jump – 8 reps", "2. Dumbbell Thrusters (squat to press) – 12 reps", "3. Broad Jump Burpee (no push up) – 6 reps", "4. Decline Push Up to Side Plank – 6 reps per side", "5. Box Jump to Step Down – 10 reps", "6. Skater Hops with Touch – 16 reps total", "7. Plank to Pike – 10 reps", "8. Skipping – 250 reps (or 1 minute fast)"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 6, theme: "Increase Volume", progression: "Same structure, increase reps by 20%.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Week 6)", durationMin: 35, equipment: "Skipping rope, box", feel: "Hard endurance",
          structure: ["Circuit – 2 rounds:", "1. Box Jumps (jump up, step down) – 12 reps", "2. Split Jumps (switch lunge jump) – 16 reps total (8/leg)", "3. Broad Jumps – 10 reps", "4. Single Leg Box Step Ups with Hop – 10 reps per leg", "5. Skipping (alternating fast/slow) – 300 reps total", "6. Cossack Squats – 12 reps per side", "7. Lateral Hops over bench – 20 reps total", "8. Sprint in Place (high knees) – 45 seconds"] },
        { day: 2, name: "Upper Body & Cardio (Week 6)", durationMin: 35, equipment: "Dumbbells (5-8 kg), bench, medicine ball", feel: "Pushing limits",
          structure: ["Circuit – 2 rounds:", "1. Explosive Push Ups (hands off) – 8 reps", "2. Medicine Ball Chest Pass (against wall) – 15 reps", "3. Tricep Dips (feet elevated on second bench) – 15 reps", "4. Renegade Rows (plank, no knees) – 8 reps per arm", "5. Dumbbell Cleans – 10 reps", "6. Plank with Row – 10 reps per arm", "7. Burpee to Pull Up (if no bar, burpee to jump) – 6 reps", "8. Skipping (double unders attempts) – 100 reps"] },
        { day: 3, name: "Core & Cardio (Week 6)", durationMin: 35, equipment: "Mat, medicine ball (2-4 kg), skipping rope", feel: "Burning",
          structure: ["Circuit – 2 rounds:", "1. Plank with Medicine Ball Rollout – 10 reps", "2. V-Up with Twist – 12 reps per side", "3. Leg Lift to Hip Lift – 12 reps", "4. Side Plank with Leg Abduction – 10 reps per side", "5. Mountain Climbers (fast, cross body) – 50 reps total", "6. Russian Twist with Weight – 30 reps total (15/side)", "7. Hollow Body Hold – 45 seconds", "8. Skipping (one foot then the other) – 200 reps"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Week 6 – Peak)", durationMin: 35, equipment: "Full set: skipping rope, dumbbells, bench, medicine ball", feel: "Exhausting but liberating",
          structure: ["Circuit – 2 rounds:", "1. Burpee to Box Jump – 10 reps", "2. Thruster + Push Press – 15 reps", "3. Depth Jump to Broad Jump – 6 reps (soft landing)", "4. Dumbbell Snatch (alternating) – 8 reps per arm", "5. Plank to Tuck Jump – 12 reps", "6. Lunge Jump Switch + Hop – 12 reps total", "7. Med Ball Slam to Squat Jump – 10 reps", "8. Skipping – 300 reps (or 2 minutes non-stop)"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 7, theme: "Peak Week – Maximum Effort", progression: "Shortest rest (60 sec). Highest reps and hardest plyos.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Peak)", durationMin: 35, equipment: "Skipping rope, plyo box", feel: "Intense",
          structure: ["Circuit – 2 rounds (rest 60 sec):", "1. Depth Jumps (from 20-30 cm) – 8 reps", "2. Tuck Jumps – 20 reps", "3. Broad Jump to Sprint (in place) – 6 reps", "4. Single Leg Box Jumps (low box) – 6 reps per leg", "5. Skipping – 300 reps (as fast as possible)", "6. Bulgarian Split Squats (jump optional) – 12 reps per leg", "7. Lateral Hops over bench – 30 reps total", "8. High Knees Sprint – 60 seconds"],
          coachingNote: "Peak week is hard by design. If you need an extra 15 sec rest, take it – but keep moving." },
        { day: 2, name: "Upper Body & Cardio (Peak)", durationMin: 35, equipment: "Dumbbells, medicine ball, bench", feel: "Explosive",
          structure: ["Circuit – 2 rounds (rest 60 sec):", "1. Plyo Push Ups (clap or high) – 10 reps", "2. Medicine Ball Burpees (slam at bottom) – 12 reps", "3. Tricep Dips with Knee Raise – 20 reps", "4. Commando Plank (fast) – 30 reps total", "5. Dumbbell Clean to Press – 10 reps", "6. Plank with Single Arm Row – 12 reps per arm", "7. Mountain Climber Burpee (no jump) – 10 reps", "8. Skipping (double unders) – 100 reps or 2 min singles"] },
        { day: 3, name: "Core & Cardio (Peak)", durationMin: 35, equipment: "Weighted ball (3-5 kg), skipping rope", feel: "Deep fatigue",
          structure: ["Circuit – 2 rounds:", "1. Weighted Sit Ups (ball overhead) – 20 reps", "2. Hanging Knee Raises (or lying leg lifts) – 15 reps", "3. Plank with Feet on Bench – 1 minute", "4. Side Plank with Weighted Reach – 12 reps per side", "5. V-Up to Jackknife – 15 reps", "6. Russian Twist (heavy) – 30 reps per side", "7. Toe Touches (lying, legs up) – 30 reps", "8. Sprint Intervals: 20 sec on / 10 sec off, 8 rounds"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Peak – Finale)", durationMin: 38, equipment: "All available", feel: "Victorious",
          structure: ["Circuit – 2 rounds (rest 75 sec – you earned it):", "1. Burpee Box Jump Over – 10 reps", "2. Dumbbell Snatch to Thruster – 8 reps per arm", "3. Broad Jump Burpee with Push Up – 8 reps", "4. Plyo Push Up to Side Plank – 8 reps per side", "5. Tuck Jump to Squat – 15 reps", "6. Lunge Jump to Knee Drive – 12 reps per leg", "7. Med Ball Slams (fast) – 20 reps", "8. Skipping (250 reps) + 50 Mountain Climbers (finisher)"],
          coachingNote: "This is the hardest workout of the 8 weeks. Trust your fitness." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 8, theme: "Deload & Celebrate", progression: "Reduce volume by 30-40%. No plyometrics. Focus on enjoyment.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Deload)", durationMin: 25, equipment: "Skipping rope (optional)", feel: "Easy flow",
          structure: ["Circuit – 2 rounds (rest as needed):", "1. Bodyweight Squats – 12 reps", "2. Walking Lunges – 8 reps per leg", "3. Step Ups – 8 reps per leg (low bench)", "4. Glute Bridges – 15 reps", "5. Knee Ups (slow) – 20 reps total", "6. Skipping – 80 reps (easy pace)", "7. Calf Raises – 20 reps", "8. Slow Mountain Climbers – 20 reps total"],
          coachingNote: "No jumps. No rush. Feel how easy these moves have become compared to Week 1." },
        { day: 2, name: "Upper Body & Cardio (Deload)", durationMin: 25, equipment: "Light weights (2-4 kg) or none", feel: "Relaxed",
          structure: ["Circuit – 2 rounds:", "1. Incline Push Ups – 12 reps", "2. Tricep Dips (feet on floor) – 12 reps", "3. Bent Over Rows (light) – 12 reps", "4. Plank – 30 seconds", "5. Arm Circles – 20 each direction", "6. Standing Shoulder Press – 10 reps", "7. Jumping Jacks – 40 reps", "8. Slow Bear Crawl – 8 steps"] },
        { day: 3, name: "Core & Cardio (Deload)", durationMin: 25, equipment: "Mat", feel: "Gentle",
          structure: ["Circuit – 2 rounds:", "1. Plank – 30 sec", "2. Dead Bug – 10 reps per side", "3. Straight Leg Raises – 12 reps", "4. Bird Dog – 10 reps per side", "5. Seated Knee Tucks – 15 reps", "6. Heel Taps – 15 reps per side", "7. Bicycle Crunches (slow) – 12 reps per side", "8. Marching in Place – 1 minute"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Deload – Fun Day)", durationMin: 25, equipment: "Skipping rope (optional)", feel: "Playful",
          structure: ["Circuit – 2 rounds:", "1. Squat to Stand – 10 reps", "2. Knee Push Ups – 10 reps", "3. Reverse Lunges – 8 reps per leg", "4. Tricep Extensions (no weight) – 12 reps", "5. Plank Shoulder Taps – 10 reps total", "6. Butt Kicks – 30 seconds", "7. Toe Taps (standing) – 20 reps per leg", "8. Skipping or Dancing – 2 minutes"],
          coachingNote: "Pick your favourite music for the last set. You made it through 8 weeks. That is a win." },
        { day: 6, name: "Reflect & Stretch", structure: ["Write down three things your body can do now that it could not do in Week 1. Then 15 minutes of full-body stretching."] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] }
  ]
};

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
      progression: "Same weights, +1 rep on each working set. Goal: deeper connection, not heavier weight.",
      sessions: [
        { day: 1, name: "Drive (Week 2)", durationMin: 40, structure: ["Drive routine, +1 rep on each working set"], coachingNote: "Notice how much more you can feel this week." },
        { day: 2, name: "Walk & Breathe", durationMin: 30, structure: ["Walk + stretch"] },
        { day: 3, name: "Hinge (Week 2)", durationMin: 40, structure: ["Hinge routine, +1 rep on each working set"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape (Week 2)", durationMin: 40, structure: ["Shape routine, +1 rep on each working set"] },
        { day: 6, name: "Walk", durationMin: 25, structure: ["25 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 3, theme: "First Load Increase", phaseGoal: "Add 1-2 kg to compound lifts if Week 2 form was solid.", rpeMin: 6, rpeMax: 7,
      progression: "Add 1-2 kg to RDL, Goblet Squat, Sumo Squat, Hip Thrust. Same reps.",
      sessions: [
        { day: 1, name: "Drive (heavier)", durationMin: 42, structure: ["Drive routine, +1-2 kg on Glute Bridge & Goblet Squat"] },
        { day: 2, name: "Walk", durationMin: 30, structure: ["Walk + stretch"] },
        { day: 3, name: "Hinge (heavier)", durationMin: 42, structure: ["Hinge routine, +1-2 kg on RDL & Sumo Squat"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape (heavier)", durationMin: 42, structure: ["Shape routine, +1-2 kg on Hip Thrust"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 4, theme: "Activation Phase Close", phaseGoal: "Hold Week 3 load. Notice what's changed from Week 1.", rpeMin: 6, rpeMax: 7,
      progression: "Same load as Week 3. Final week of activation phase.",
      sessions: [
        { day: 1, name: "Drive (Week 4)", durationMin: 42, structure: ["Drive routine"] },
        { day: 2, name: "Walk", durationMin: 30, structure: ["Walk + stretch"] },
        { day: 3, name: "Hinge (Week 4)", durationMin: 42, structure: ["Hinge routine"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape (Week 4)", durationMin: 42, structure: ["Shape routine"] },
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
      progression: "Sleep is part of the programme this week.",
      sessions: [
        { day: 1, name: "Drive (Week 6)", durationMin: 45, structure: ["Drive routine, Week 5 + small load increase"] },
        { day: 2, name: "Walk & Restore", durationMin: 30, structure: ["Walk + stretch"] },
        { day: 3, name: "Hinge (Week 6)", durationMin: 45, structure: ["Hinge routine, Week 5 + small load increase"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape (Week 6)", durationMin: 45, structure: ["Shape routine, Week 5 + 2 reps"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 7, theme: "Intensification — Top sets", phaseGoal: "Push to heavier loads on primary lifts.", rpeMin: 7.5, rpeMax: 8.5,
      progression: "Top set on each compound: 1 set of 5-6 reps at heaviest sustainable load, then back-off sets at Week 6 weight.",
      sessions: [
        { day: 1, name: "Drive — Top set", durationMin: 50, structure: ["Hip Thrust top set 1×5 heavy, 3×10 back-off", "Squat top set 1×6 heavy, 3×8 back-off", "Reverse Lunge 3×10/side", "Single-Leg Glute Bridge 3×10/side", "Plank 3×45 sec"], coachingNote: "Watch form like a hawk." },
        { day: 2, name: "Walk & Restore", durationMin: 30, structure: ["Walk + mobility"] },
        { day: 3, name: "Hinge — Top set", durationMin: 50, structure: ["RDL top set 1×6 heavy, 3×8 back-off", "Sumo Squat 4×10", "Glute Bridge March 3×10/side", "Side-Lying Leg Lift 3×15/side"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Shape — Volume + finisher", durationMin: 50, structure: ["Hip Thrust 4×10", "Curtsy Lunge 3×12/side", "Fire Hydrant + Donkey Kick superset 3×12 each per side", "Plank to side plank flow 3×30 sec each side"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk, optional 4×30 sec light pickups"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 8, theme: "Test, Deload, Reflect", phaseGoal: "Notice everything that has changed.", rpeMin: 6, rpeMax: 8,
      progression: "Optional test day on Day 1 — one heavy set on Hip Thrust or Squat. Then a soft, celebratory week.",
      sessions: [
        { day: 1, name: "Test or Celebrate", durationMin: 40, structure: ["Long warm-up", "Optional: 1 heavy set on Hip Thrust or Squat (5 reps at 8/10 RPE)", "3 working sets on each — lighter, every rep felt", "Long stretch and a quiet sit"], coachingNote: "Celebrate the woman you are now." },
        { day: 2, name: "Walk", durationMin: 30, structure: ["30 min walk, no agenda"] },
        { day: 3, name: "Light Hinge", durationMin: 35, structure: ["RDL 3×8 light, accessories at Week 5 weight"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Light Shape", durationMin: 35, structure: ["Shape routine, all lighter"] },
        { day: 6, name: "Walk", durationMin: 30, structure: ["30 min walk"] },
        { day: 7, name: "Rest and reflect", durationMin: 0, structure: ["Rest. Write one sentence about what your body can do now that it could not in Week 1."], coachingNote: "You came back, again and again. That is the real work." }
      ] }
  ]
};

/**
 * Canonical list of every SIGNAL training path. Order shapes the cards
 * shown on the /movement Training tab.
 */
export const SIGNAL_TRAINING_PATHS: TrainingPath[] = [
  strengthFromTheGroundUp,
  theForge,
  learnToRun,
  pilatesPlan as unknown as TrainingPath,
  cardioCircuit,
  restAndRestore,
  glutePower,
].map(normalisePath);
