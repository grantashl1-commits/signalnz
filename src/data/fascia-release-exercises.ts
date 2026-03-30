// ── Morning Fascia Release — Exercise Data ──────────────────

export interface FasciaExercise {
  id: number;
  name: string;
  instruction: string;
  ttsScript: string;
  durationSec: number;
}

export const FASCIA_EXERCISES: FasciaExercise[] = [
  {
    id: 1,
    name: "Lymphatic Hopping",
    instruction:
      "Gently bounce on the balls of your feet to stimulate lymphatic flow and wake up the body.",
    ttsScript:
      "Exercise one. Lymphatic hopping. Gently bounce on the balls of your feet to stimulate lymphatic flow and wake up the body.",
    durationSec: 60,
  },
  {
    id: 2,
    name: "Arm Swings",
    instruction:
      "Let your arms swing freely side to side, allowing a natural rotation through your torso.",
    ttsScript:
      "Exercise two. Arm swings. Let your arms swing freely side to side, allowing a natural rotation through your torso.",
    durationSec: 60,
  },
  {
    id: 3,
    name: "Trunk Twists",
    instruction:
      "Twist from your waist left and right, keeping your hips relaxed and facing forward.",
    ttsScript:
      "Exercise three. Trunk twists. Twist from your waist left and right, keeping your hips relaxed and facing forward.",
    durationSec: 60,
  },
  {
    id: 4,
    name: "Body Wave",
    instruction:
      "Create a fluid ripple from your knees through your hips, spine, and up through your shoulders.",
    ttsScript:
      "Exercise four. Body wave. Create a fluid ripple from your knees through your hips, spine, and up through your shoulders.",
    durationSec: 60,
  },
  {
    id: 5,
    name: "Spinal Twist",
    instruction:
      "Gently rotate your upper spine left and right, letting your arms follow the movement naturally.",
    ttsScript:
      "Exercise five. Spinal twist. Gently rotate your upper spine left and right, letting your arms follow the movement naturally.",
    durationSec: 60,
  },
  {
    id: 6,
    name: "Armpit Tapping",
    instruction:
      "Using your opposite hand, gently tap the armpit area to stimulate the lymph nodes there.",
    ttsScript:
      "Exercise six. Armpit tapping. Using your opposite hand, gently tap the armpit area to stimulate the lymph nodes there.",
    durationSec: 60,
  },
  {
    id: 7,
    name: "Marches",
    instruction:
      "Lift your knees alternately in a slow, grounded march, swinging the opposite arm with each step.",
    ttsScript:
      "Exercise seven. Marches. Lift your knees alternately in a slow, grounded march, swinging the opposite arm with each step.",
    durationSec: 60,
  },
];

export const FASCIA_TOTAL_DURATION_SEC = FASCIA_EXERCISES.reduce(
  (sum, e) => sum + e.durationSec,
  0
);
