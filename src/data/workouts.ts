import { Phase } from "@/lib/cycle-utils";

export type Suitability = "ideal" | "suitable" | "rest";
export type WorkoutCategory = "strength" | "pilates" | "yoga" | "walk";

export interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  duration?: string;
  formCue: string;
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  duration: string;
  durationMin: number;
  equipment: string;
  suitability: Record<Phase, Suitability>;
  description?: string;
  warmup?: string;
  cooldown?: string;
  exercises: Exercise[];
}

export const WORKOUTS: Workout[] = [
  // STRENGTH
  {
    id: "full-body-power",
    name: "Full Body Power",
    category: "strength",
    duration: "45 min",
    durationMin: 45,
    equipment: "Light dumbbells",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "A comprehensive full-body session to build functional strength.",
    warmup: "5 min dynamic stretching",
    cooldown: "5 min gentle stretching",
    exercises: [
      { name: "Goblet Squats", sets: "4", reps: "10", formCue: "Keep chest lifted, weight in heels" },
      { name: "Romanian Deadlifts", sets: "3", reps: "12", formCue: "Hinge at hips, soft knee bend" },
      { name: "Dumbbell Lunges", sets: "3", reps: "10 each leg", formCue: "90° at both knees, upright torso" },
      { name: "Push-ups", sets: "3", reps: "10", formCue: "Body straight line, full range" },
      { name: "Single Arm Rows", sets: "3", reps: "12", formCue: "Pull elbow to ceiling, squeeze shoulder blade" },
      { name: "Glute Bridges", sets: "4", reps: "15", formCue: "Drive through heels, squeeze at top" },
      { name: "Dead Bugs", sets: "3", reps: "10", formCue: "Press lower back into floor" },
    ],
  },
  {
    id: "lower-body-strong",
    name: "Lower Body Strong",
    category: "strength",
    duration: "40 min",
    durationMin: 40,
    equipment: "Light dumbbells",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Build lower body strength with focused glute and leg work.",
    warmup: "5 min leg swings and hip circles",
    cooldown: "5 min hip flexor stretches",
    exercises: [
      { name: "Sumo Squats", sets: "4", reps: "12", formCue: "Wide stance, toes turned out" },
      { name: "Single Leg Deadlifts", sets: "3", reps: "10 each", formCue: "Hinge slowly, balance with core" },
      { name: "Side-lying Clamshells", sets: "3", reps: "20", formCue: "Keep hips stacked, controlled movement" },
      { name: "Glute Bridges with Hold", sets: "4", reps: "15", formCue: "3-second hold at top" },
      { name: "Step-ups", sets: "3", reps: "12 each leg", formCue: "Drive through front heel" },
      { name: "Wall Sit", sets: "3", duration: "45 seconds", reps: "hold", formCue: "90° at knees, back flat" },
      { name: "Fire Hydrants", sets: "3", reps: "15", formCue: "Keep core engaged, control the movement" },
    ],
  },
  {
    id: "upper-body-strength",
    name: "Upper Body Strength",
    category: "strength",
    duration: "35 min",
    durationMin: 35,
    equipment: "Light to medium dumbbells (5–10kg)",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Targeted upper body work for balanced strength.",
    warmup: "5 min arm circles and band pull-aparts",
    cooldown: "5 min shoulder and chest stretches",
    exercises: [
      { name: "Dumbbell Shoulder Press", sets: "3", reps: "10", formCue: "Press directly overhead, core tight" },
      { name: "Bent-over Dumbbell Rows", sets: "3", reps: "12", formCue: "Flat back, pull to ribcage" },
      { name: "Bicep Curls", sets: "3", reps: "12", formCue: "Elbows pinned to sides" },
      { name: "Tricep Overhead Extension", sets: "3", reps: "10", formCue: "Keep elbows close to ears" },
      { name: "Lateral Raises", sets: "3", reps: "15", formCue: "Slight bend in elbows, controlled" },
      { name: "Push-ups (full or modified)", sets: "3", reps: "10", formCue: "Chest to floor, full range" },
      { name: "Plank Hold", sets: "3", duration: "30 seconds", reps: "hold", formCue: "Straight line from head to heels" },
    ],
  },
  {
    id: "core-glutes",
    name: "Core + Glutes",
    category: "strength",
    duration: "30 min",
    durationMin: 30,
    equipment: "Mat only",
    suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Core stability and glute activation for all phases.",
    exercises: [
      { name: "Dead Bugs", sets: "3", reps: "10", formCue: "Press lower back into floor" },
      { name: "Bird Dogs", sets: "3", reps: "12", formCue: "Extend opposite arm and leg slowly" },
      { name: "Side Planks", sets: "2", reps: "30 sec each", formCue: "Stack hips, lift from obliques" },
      { name: "Glute Bridges", sets: "4", reps: "15", formCue: "Squeeze glutes at the top" },
      { name: "Donkey Kicks", sets: "3", reps: "15", formCue: "Keep knee at 90°, press ceiling" },
      { name: "Superman Holds", sets: "3", reps: "10", formCue: "Lift arms and legs simultaneously" },
      { name: "Hollow Body Hold", sets: "3", duration: "20 seconds", reps: "hold", formCue: "Press lower back down, legs extended" },
    ],
  },
  {
    id: "gentle-full-body",
    name: "Gentle Full Body",
    category: "strength",
    duration: "25 min",
    durationMin: 25,
    equipment: "No equipment",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "Low intensity bodyweight work for rest days.",
    exercises: [
      { name: "Bodyweight Squats", sets: "3", reps: "12", formCue: "Slow and controlled" },
      { name: "Wall Push-ups", sets: "3", reps: "10", formCue: "Full range at the wall" },
      { name: "Standing Hip Circles", sets: "2", reps: "10 each", formCue: "Large, slow circles" },
      { name: "Calf Raises", sets: "3", reps: "15", formCue: "Rise onto balls of feet" },
      { name: "Seated Forward Fold", sets: "1", duration: "60 seconds", reps: "hold", formCue: "Relax into the stretch" },
      { name: "Cat-Cow", sets: "1", duration: "2 minutes", reps: "flow", formCue: "Sync with breath" },
      { name: "Child's Pose", sets: "1", duration: "2 minutes", reps: "hold", formCue: "Rest and breathe deeply" },
    ],
  },
  {
    id: "express-strength",
    name: "Express Strength Circuit",
    category: "strength",
    duration: "20 min",
    durationMin: 20,
    equipment: "Light dumbbells",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Quick, efficient circuit when time is short.",
    exercises: [
      { name: "Squat to Press", sets: "3", reps: "10", formCue: "Squat deep, press at the top" },
      { name: "Renegade Rows", sets: "3", reps: "8 each", formCue: "Plank position, row to hip" },
      { name: "Reverse Lunges", sets: "3", reps: "10 each", formCue: "Step back, 90° knees" },
      { name: "Push-up to Shoulder Tap", sets: "3", reps: "10", formCue: "Minimise hip rotation" },
    ],
  },
  // PILATES
  {
    id: "classical-pilates",
    name: "Classical Pilates Flow",
    category: "pilates",
    duration: "40 min",
    durationMin: 40,
    equipment: "Mat only",
    suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Traditional Pilates mat sequence.",
    exercises: [
      { name: "The Hundred", sets: "1", reps: "100 pumps", formCue: "Legs at 45°, pump arms vigorously" },
      { name: "Roll-up", sets: "1", reps: "6", formCue: "Articulate through each vertebra" },
      { name: "Single Leg Circles", sets: "1", reps: "5 each direction", formCue: "Stable pelvis, circle from hip" },
      { name: "Rolling Like a Ball", sets: "1", reps: "8", formCue: "Round spine, use abs not momentum" },
      { name: "Single Leg Stretch", sets: "1", reps: "10 each", formCue: "Keep shoulders off mat" },
      { name: "Double Leg Stretch", sets: "1", reps: "8", formCue: "Reach long, circle arms back" },
      { name: "Spine Stretch Forward", sets: "1", reps: "5", formCue: "Stack spine tall, then round over" },
      { name: "Saw", sets: "1", reps: "5 each", formCue: "Twist from waist, reach past pinky toe" },
      { name: "Swan", sets: "1", reps: "5", formCue: "Lengthen spine before lifting" },
      { name: "Swimming", sets: "1", reps: "20 counts", formCue: "Opposite arm/leg, stay long" },
    ],
  },
  {
    id: "pelvic-floor",
    name: "Pelvic Floor Focus",
    category: "pilates",
    duration: "30 min",
    durationMin: 30,
    equipment: "Mat only",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "suitable" },
    description: "Gentle pelvic floor strengthening and release.",
    exercises: [
      { name: "Diaphragmatic Breathing", sets: "1", duration: "5 min", reps: "continuous", formCue: "Expand ribcage laterally on inhale" },
      { name: "Progressive Kegels", sets: "3", reps: "10", formCue: "Lift and hold 5 seconds, release slowly" },
      { name: "Reverse Kegels", sets: "2", reps: "10", formCue: "Gently release and lengthen pelvic floor" },
      { name: "Pelvic Tilts", sets: "3", reps: "12", formCue: "Flatten lower back, then arch gently" },
      { name: "Bridge with Pelvic Floor", sets: "3", reps: "10", formCue: "Engage pelvic floor before lifting" },
      { name: "Happy Baby", sets: "1", duration: "2 min", reps: "hold", formCue: "Rock gently side to side" },
      { name: "Constructive Rest", sets: "1", duration: "5 min", reps: "hold", formCue: "Knees bent, feet flat, relax completely" },
    ],
  },
  {
    id: "pilates-core",
    name: "Pilates Core",
    category: "pilates",
    duration: "35 min",
    durationMin: 35,
    equipment: "Mat only",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Intermediate core-focused Pilates workout.",
    exercises: [
      { name: "Plank Series", sets: "3", duration: "30 sec", reps: "hold", formCue: "Front, side, front rotation" },
      { name: "Teaser Prep", sets: "1", reps: "6", formCue: "Roll up with control, balance" },
      { name: "Criss-cross", sets: "1", reps: "10 each", formCue: "Twist from ribcage, not neck" },
      { name: "Leg Pull Front", sets: "1", reps: "5 each", formCue: "Plank position, lift one leg" },
      { name: "Side Plank Rotation", sets: "2", reps: "8 each", formCue: "Thread arm under, return to start" },
      { name: "Single Leg Kick", sets: "1", reps: "8 each", formCue: "Prone, kick heel to glute" },
      { name: "Double Leg Kick", sets: "1", reps: "6", formCue: "Clasp hands behind back" },
    ],
  },
  {
    id: "standing-pilates",
    name: "Standing Pilates",
    category: "pilates",
    duration: "30 min",
    durationMin: 30,
    equipment: "No equipment",
    suitability: { menstrual: "suitable", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Accessible standing Pilates work.",
    exercises: [
      { name: "Standing Footwork", sets: "3", reps: "12", formCue: "Rise and lower with control" },
      { name: "Relevés", sets: "3", reps: "10", formCue: "Balance at the top, slow descent" },
      { name: "Side Leg Series", sets: "2", reps: "12 each", formCue: "Hip height, controlled movement" },
      { name: "Arm Circles", sets: "2", reps: "10 each direction", formCue: "Keep shoulders down" },
      { name: "Chest Expansion", sets: "2", reps: "8", formCue: "Press arms back, open chest" },
      { name: "Single Leg Balance", sets: "2", reps: "30 sec each", formCue: "Fix gaze, engage core" },
      { name: "Standing Roll-down", sets: "3", reps: "5", formCue: "Articulate one vertebra at a time" },
    ],
  },
  {
    id: "reformer-mat",
    name: "Reformer-Inspired Mat",
    category: "pilates",
    duration: "35 min",
    durationMin: 35,
    equipment: "Light resistance band",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "suitable", luteal: "suitable" },
    description: "Reformer exercises adapted for the mat with a band.",
    exercises: [
      { name: "Footwork with Band", sets: "3", reps: "12", formCue: "Band around feet, press and return" },
      { name: "Leg Series with Band", sets: "2", reps: "10 each", formCue: "Controlled extension and return" },
      { name: "Rowing Series", sets: "2", reps: "8", formCue: "Sit tall, pull band to chest" },
      { name: "Long Stretch Adapted", sets: "2", reps: "8", formCue: "Plank position, shift forward and back" },
      { name: "Elephant Adapted", sets: "2", reps: "8", formCue: "Pike position, press heels" },
    ],
  },
  {
    id: "restorative-pilates",
    name: "Restorative Pilates",
    category: "pilates",
    duration: "25 min",
    durationMin: 25,
    equipment: "Mat only",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "Gentle, restorative Pilates for recovery.",
    exercises: [
      { name: "Constructive Rest", sets: "1", duration: "5 min", reps: "hold", formCue: "Knees bent, feet flat, soften completely" },
      { name: "Supine Figure 4", sets: "1", duration: "2 min each", reps: "hold", formCue: "Cross ankle over knee, gentle pull" },
      { name: "Reclined Butterfly", sets: "1", duration: "3 min", reps: "hold", formCue: "Soles together, knees fall open" },
      { name: "Legs Up the Wall", sets: "1", duration: "5 min", reps: "hold", formCue: "Relax everything, breathe deeply" },
      { name: "Gentle Spinal Twist", sets: "1", duration: "2 min each", reps: "hold", formCue: "Let gravity do the work" },
      { name: "Savasana with Body Scan", sets: "1", duration: "5 min", reps: "hold", formCue: "Scan from toes to crown" },
    ],
  },
  // YOGA & SOMATIC
  {
    id: "moon-salutations",
    name: "Moon Salutations",
    category: "yoga",
    duration: "30 min",
    durationMin: 30,
    equipment: "Mat only",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "suitable" },
    description: "5 rounds of moon salutation. Slower and more fluid than sun salutations. Honours inward energy.",
    exercises: [
      { name: "Moon Salutation Round 1-5", sets: "5", reps: "full sequence", formCue: "Move slowly, honour the breath" },
    ],
  },
  {
    id: "yin-full-body",
    name: "Yin Yoga Full Body",
    category: "yoga",
    duration: "45 min",
    durationMin: 45,
    equipment: "Mat only",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "Deep, long-held stretches for fascia and nervous system release.",
    exercises: [
      { name: "Dragon Pose", sets: "1", duration: "3 min each", reps: "hold", formCue: "Sink into the hip flexor" },
      { name: "Butterfly", sets: "1", duration: "4 min", reps: "hold", formCue: "Fold forward gently" },
      { name: "Sleeping Swan", sets: "1", duration: "3 min each", reps: "hold", formCue: "Melt into the stretch" },
      { name: "Caterpillar", sets: "1", duration: "4 min", reps: "hold", formCue: "Round the spine, release the head" },
      { name: "Twisted Roots", sets: "1", duration: "3 min each", reps: "hold", formCue: "Let gravity twist you" },
      { name: "Savasana", sets: "1", duration: "5 min", reps: "hold", formCue: "Complete surrender" },
    ],
  },
  {
    id: "somatic-movement",
    name: "Somatic Movement",
    category: "yoga",
    duration: "20 min",
    durationMin: 20,
    equipment: "No equipment",
    suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "Intuitive movement to release stored tension and reconnect with your body.",
    exercises: [
      { name: "Body Shaking/Vibrating", sets: "1", duration: "3 min", reps: "continuous", formCue: "Shake from feet up, let it ripple" },
      { name: "Hip Circles", sets: "1", duration: "2 min", reps: "continuous", formCue: "Large, slow, both directions" },
      { name: "Spinal Wave", sets: "1", duration: "2 min", reps: "flow", formCue: "Undulate from tailbone to crown" },
      { name: "Shoulder Rolling", sets: "1", duration: "2 min", reps: "continuous", formCue: "Forward and backward, release tension" },
      { name: "Jaw Release", sets: "1", duration: "1 min", reps: "hold", formCue: "Open mouth wide, massage jaw" },
      { name: "Self-massage Neck & Shoulders", sets: "1", duration: "2 min", reps: "continuous", formCue: "Gentle pressure, breathe into tightness" },
      { name: "Free Movement to Music", sets: "1", duration: "5 min", reps: "freestyle", formCue: "Move however your body wants" },
    ],
  },
  {
    id: "vinyasa-flow",
    name: "Vinyasa Flow",
    category: "yoga",
    duration: "40 min",
    durationMin: 40,
    equipment: "Mat only",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Dynamic flow linking breath and movement.",
    exercises: [
      { name: "Sun Salutation A x 3", sets: "3", reps: "full sequence", formCue: "One breath per movement" },
      { name: "Sun Salutation B x 3", sets: "3", reps: "full sequence", formCue: "Add warrior I to the flow" },
      { name: "Warrior Sequence", sets: "1", reps: "both sides", formCue: "Strong legs, open chest" },
      { name: "Triangle Pose", sets: "1", reps: "both sides", formCue: "Lengthen side body, stack shoulders" },
      { name: "Half Moon", sets: "1", reps: "both sides", formCue: "Find balance, open the hip" },
      { name: "Seated Forward Folds", sets: "1", duration: "3 min", reps: "hold", formCue: "Fold from hips, not waist" },
      { name: "Twist Sequence", sets: "1", reps: "both sides", formCue: "Twist from the centre" },
      { name: "Savasana", sets: "1", duration: "5 min", reps: "hold", formCue: "Complete rest" },
    ],
  },
  {
    id: "gentle-morning-yoga",
    name: "Gentle Morning Yoga",
    category: "yoga",
    duration: "20 min",
    durationMin: 20,
    equipment: "Mat only",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "A soft, accessible morning practice for any phase.",
    exercises: [
      { name: "Cat-Cow", sets: "1", duration: "2 min", reps: "flow", formCue: "Sync with breath" },
      { name: "Thread the Needle", sets: "1", reps: "each side", formCue: "Reach under and twist gently" },
      { name: "Downward Dog Pedal", sets: "1", duration: "1 min", reps: "flow", formCue: "Alternate bending knees" },
      { name: "Low Lunge Each Side", sets: "1", reps: "1 min each", formCue: "Sink hips, open chest" },
      { name: "Seated Twist Each Side", sets: "1", reps: "1 min each", formCue: "Lengthen spine first" },
      { name: "Forward Fold", sets: "1", duration: "1 min", reps: "hold", formCue: "Bend knees if needed" },
      { name: "Easy Seat Meditation", sets: "1", duration: "3 min", reps: "hold", formCue: "Sit tall, close eyes, breathe" },
    ],
  },
  // WALK & BREATHE
  {
    id: "mindful-walk",
    name: "Mindful Walk",
    category: "walk",
    duration: "30 min",
    durationMin: 30,
    equipment: "No equipment",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "A meditative walk in three phases of awareness.",
    exercises: [
      { name: "Phase 1: Visual Awareness", sets: "1", duration: "10 min", reps: "walk", formCue: "Notice 5 things you can see" },
      { name: "Phase 2: Sound & Sensation", sets: "1", duration: "10 min", reps: "walk", formCue: "Notice sounds and sensations" },
      { name: "Phase 3: Footstep Awareness", sets: "1", duration: "10 min", reps: "walk", formCue: "Walk with awareness of each step" },
    ],
  },
  {
    id: "power-walk",
    name: "Power Walk Intervals",
    category: "walk",
    duration: "35 min",
    durationMin: 35,
    equipment: "No equipment",
    suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" },
    description: "Interval walking for cardiovascular fitness.",
    exercises: [
      { name: "Warm Up Easy Pace", sets: "1", duration: "5 min", reps: "walk", formCue: "Gentle pace, warm up gradually" },
      { name: "Brisk / Easy Intervals", sets: "8", reps: "2 min brisk / 1 min easy", formCue: "Arm swing engaged, pick up pace" },
      { name: "Cool Down", sets: "1", duration: "5 min", reps: "walk", formCue: "Gradual slow, deep breaths" },
    ],
  },
  {
    id: "evening-walk",
    name: "Evening Wind-Down Walk",
    category: "walk",
    duration: "20 min",
    durationMin: 20,
    equipment: "No equipment",
    suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" },
    description: "Slow, deliberate walk to decompress. No music.",
    exercises: [
      { name: "Slow Deliberate Walk", sets: "1", duration: "15 min", reps: "walk", formCue: "Preferably outdoors, no phone" },
      { name: "Standing Breathwork", sets: "1", duration: "5 min", reps: "breathe", formCue: "Deep belly breaths before going inside" },
    ],
  },
];

export const PHASE_MOVEMENT_REC: Record<Phase, { title: string; description: string }> = {
  menstrual: {
    title: "Rest is Productive",
    description: "Gentle yoga, walking, and stretching only. Your body is working hard — honour that.",
  },
  follicular: {
    title: "Your Strength Window Is Open",
    description: "Estrogen is rising which increases strength, stamina, and pain tolerance. This is the best time to push harder and try new workouts.",
  },
  ovulatory: {
    title: "Peak Energy",
    description: "High intensity cardio, group classes, challenging workouts. You're at your physical peak.",
  },
  luteal: {
    title: "Intuitive Movement",
    description: "Pilates, moderate strength, walk when in doubt. Listen to your body — it knows what it needs.",
  },
};

export const TODAY_WORKOUT: Record<Phase, string> = {
  menstrual: "gentle-morning-yoga",
  follicular: "upper-body-strength",
  ovulatory: "full-body-power",
  luteal: "classical-pilates",
};

export const SUIT_COLORS: Record<Suitability, { bg: string; text: string; label: string }> = {
  ideal: { bg: "bg-accent/15", text: "text-accent", label: "Ideal This Phase" },
  suitable: { bg: "bg-gold/15", text: "text-gold", label: "Suitable" },
  rest: { bg: "bg-muted", text: "text-muted-foreground", label: "Rest Phase" },
};

export const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  strength: "Strength",
  pilates: "Pilates",
  yoga: "Yoga & Somatic",
  walk: "Walk & Breathe",
};

export const FEELINGS = ["Energised", "Good", "Moderate", "Low", "Depleted"];

export const FEELING_REC: Record<string, string> = {
  Energised: "You're primed — try the Full Body Power or Vinyasa Flow today.",
  Good: "A solid day for Pilates Core or a moderate strength session.",
  Moderate: "Listen in — a Somatic Movement session or Mindful Walk would serve you well.",
  Low: "Your body is asking for gentleness. Try Yin Yoga or a gentle morning practice.",
  Depleted: "Rest is not laziness. Stretch gently, drink water, and honour what your body needs.",
};
