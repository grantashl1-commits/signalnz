/**
 * One-off builder: takes the hand-written exercise prompt bodies below,
 * normalizes them so every prompt starts with the same hand-drawn watercolour
 * intro and the same canonical "cream-coloured face, closed eyes, small nose,
 * neutral expression" descriptor, then writes src/exercise-prompts.json.
 *
 * Usage:
 *   node scripts/build-exercise-prompts.mjs
 *
 * The body of each prompt is preserved verbatim — edit BODIES below to tweak
 * a single illustration without touching the boilerplate.
 */
import { writeFileSync } from "node:fs";

const HEAD = "A hand-drawn, minimalist watercolour illustration.";
const FACE = "A woman with a cream-coloured face, closed eyes, small nose, neutral expression";
const TAIL = "Warm earthy colours: terracotta, sage green, dusty rose. Gentle imperfect lines. White background. No text.";

// ─── 66 exercise bodies ────────────────────────────────────────────────
// Each body should slot grammatically after FACE, e.g. "stands holding..."
// The builder will produce: `${HEAD} ${FACE} ${body} ${TAIL}`.
const BODIES = {
  "Goblet Squat": "stands holding a single dumbbell vertically against her chest, both hands cupping the top weight. She squats down, heels flat, thighs parallel to floor. Quadriceps and glutes softly washed in sage green.",
  "Push-Up": "is in a high plank, hands under shoulders, palms flat. Body straight from heels to head, lowering chest toward ground, elbows at 45°. Chest, shoulders and triceps washed in dusty rose.",
  "Single-Arm Dumbbell Row": "kneels with one knee and one hand on a bench, opposite foot on floor. Working hand holds a single dumbbell, pulling it toward hip, squeezing shoulder blade. Latissimus and rhomboids washed in sage green.",
  "Glute Bridge": "lies on her back, knees bent, feet flat, hips lifted toward ceiling forming a straight line from shoulders to knees. Arms rest on the floor. Glutes and hamstrings washed in dusty rose.",
  "Dead Bug": "lies face up, arms reaching toward ceiling, legs lifted with knees bent 90°. Left arm and right leg slowly extend toward floor while lower back stays pressed into the mat. Deep core washed in sage green.",
  "Plank": "holds a straight-arm plank, hands under shoulders, body a straight line from heels to head. Core, shoulders and glutes washed in terracotta.",
  "Romanian Deadlift": "stands with a barbell resting against her thighs, knees slightly bent. She hinges forward at the hips, flat back, lowering the barbell down the front of her thighs toward shins. Hamstrings and glutes washed in dusty rose.",
  "Overhead Press": "stands feet hip-width, holding dumbbells at her shoulders, palms forward. She presses the dumbbells directly overhead, arms fully extended, core tight. Deltoids and triceps washed in terracotta.",
  "Reverse Lunge": "stands tall, then steps one leg back, lowering hips until front thigh is parallel to floor and back knee hovers just above. Quadriceps and glutes washed in sage green.",
  "Lateral Raise": "stands holding light dumbbells at her sides, palms facing body. She raises arms out to the sides to shoulder height, slight bend in elbows. Medial deltoids washed in dusty rose.",
  "Bird Dog": "is on hands and knees in tabletop. She extends one arm forward and the opposite leg back, keeping hips square and spine neutral. Core and glutes washed in sage green.",
  "Side Plank": "lies on her side, propped on a forearm with elbow under shoulder, body in a straight line, top hand on hip. Obliques and gluteus medius washed in terracotta.",
  "Sumo Squat": "stands wide, toes turned out, holding a single dumbbell between her legs. She squats down, chest up, knees tracking over toes. Inner thighs and glutes washed in sage green.",
  "Bent-Over Row": "is hinged forward at the hips, flat back, holding a dumbbell in each hand. She pulls the dumbbells toward her lower ribs, squeezing shoulder blades together. Upper back and lats washed in dusty rose.",
  "Glute Bridge March": "lies on her back in a glute bridge, hips lifted. She lifts one foot off the floor, knee toward chest, then lowers and alternates. Glutes and core washed in sage green.",
  "Bicep Curl": "stands holding dumbbells at her sides, palms forward. She curls both dumbbells up toward her shoulders, elbows fixed at her sides. Biceps washed in dusty rose.",
  "Tricep Overhead Extension": "stands holding a single dumbbell with both hands overhead, elbows bent. She extends her arms straight overhead, contracting the triceps. Triceps washed in terracotta.",
  "Hollow Body Hold": "lies on her back, arms extended overhead, legs straight, lifting shoulders and legs off the floor and pressing lower back into the mat. Deep core (rectus abdominis) washed in sage green.",
  "Deadlift": "stands over a barbell, feet hip-width. She bends at hips and knees, grasps the bar with straight arms, then stands up, pulling the bar along her shins and extending hips and knees. Hamstrings, glutes and erector spinae washed in dusty rose.",
  "Hip Thrust": "is seated on the floor with upper back against a bench, a barbell across her hips, knees bent. She thrusts hips upward until her body forms a straight line from shoulders to knees. Glutes washed in sage green.",
  "Bulgarian Split Squat": "stands with one foot behind her on a bench, front foot forward. She lowers hips until front thigh is parallel to floor and back knee hovers. Quadriceps and glutes washed in terracotta.",
  "Calf Raise": "stands holding light dumbbells, raising both heels off the floor and balancing on the balls of her feet, then lowering. Calves washed in dusty rose.",
  "Single-Leg Calf Raise": "balances on one leg, raising the heel off the floor onto the ball of the foot, then lowering. Calves washed in sage green.",
  "Step-Up": "stands in front of a bench, places one foot on the bench, then steps up, bringing the opposite knee toward chest. Quadriceps and glutes washed in terracotta.",
  "Nordic Hamstring Curl": "kneels with ankles secured, body straight, slowly lowering torso toward the floor and resisting with her hamstrings. Hamstrings washed in dusty rose.",
  "Upright Row": "stands holding a barbell with a narrow grip, pulling the bar up along her body to chin level, elbows high. Deltoids and traps washed in sage green.",
  "Tricep Kickback": "is bent over at hips, one hand on a bench, holding a dumbbell. She extends her arm straight back, contracting the triceps. Triceps washed in terracotta.",
  "Bench Press": "lies on a bench, holding a barbell above her chest, lowering the bar to mid-chest then pressing it back up. Chest, triceps and front delts washed in dusty rose.",
  "Incline Dumbbell Press": "lies on an incline bench, pressing dumbbells from chest level to full extension. Upper chest washed in sage green.",
  "Arnold Press": "stands holding dumbbells at her shoulders with palms facing her body, rotating palms forward as she presses overhead. Deltoids washed in terracotta.",
  "Renegade Row": "is in a high plank with hands on dumbbells, rowing one dumbbell to her hip while stabilising with the other arm. Core and back washed in dusty rose.",
  "Chest-Supported Row": "lies face down on an incline bench, holding dumbbells, rowing them toward her ribs. Upper back washed in sage green.",
  "Pallof Press": "stands sideways to a cable, holding the handle at her chest and pressing arms straight forward without rotating her torso. Obliques washed in terracotta.",
  "Bear Hold": "is on hands and knees with knees hovering just above the floor, back flat, core engaged. Core and shoulders washed in sage green.",
  "Lat Pulldown": "is seated at a cable machine, hands wide on the bar, pulling the bar down to her upper chest as she leans back slightly. Lats washed in dusty rose.",
  "Face Pull": "stands holding a rope attachment at face level, pulling it toward her forehead and externally rotating her shoulders. Rear delts and traps washed in terracotta.",
  "Hammer Curl": "stands holding dumbbells with neutral grip, palms facing each other, curling the weights toward her shoulders. Brachialis and brachioradialis washed in sage green.",
  "Leg Press": "is seated on a leg press machine, pushing the platform away with her feet, knees tracking over toes. Quadriceps and glutes washed in dusty rose.",
  "Walking Lunge": "steps forward into a lunge, then steps forward with the back leg, alternating across the floor. Quadriceps and glutes washed in terracotta.",
  "Curtsy Lunge": "steps one leg diagonally behind the other, lowering hips until front thigh is parallel to floor. Inner thighs and glutes washed in sage green.",
  "Split Squat": "stands in a staggered stance, lowering hips until back knee hovers and front knee tracks over ankle. Quadriceps washed in dusty rose.",
  "Single-Leg Deadlift": "balances on one leg, hinging forward with a flat back as the opposite leg lifts behind her and a dumbbell lowers toward the floor. Hamstrings and glutes washed in terracotta.",
  "Single-Leg Glute Bridge": "lies on her back, one foot on the floor, the other leg extended, lifting hips toward the ceiling. Glutes washed in sage green.",
  "Plank Shoulder Tap": "is in a high plank, alternately tapping each shoulder with the opposite hand, core braced to prevent rotation. Core and shoulders washed in dusty rose.",
  "Mountain Climbers": "is in a high plank, alternately driving her knees toward her chest at speed. Core and hip flexors washed in terracotta.",
  "Roll-Up": "lies on her back, arms overhead, slowly rolling up one vertebra at a time into a seated forward fold, then rolling back down. Core and spine washed in sage green.",
  "Single-Leg Circle": "lies on her back, one leg extended vertically, circling the leg outward and around while keeping hips stable. Hip flexors and core washed in dusty rose.",
  "Swimming": "lies face down, arms and legs extended, alternately lifting opposite arm and leg in a fluttering motion. Posterior chain washed in terracotta.",
  "Clam": "lies on her side, knees bent, feet together, opening the top knee like a clam. Gluteus medius washed in sage green.",
  "Fire Hydrant": "is on hands and knees, lifting a bent leg out to the side and keeping the 90° angle. Gluteus medius washed in dusty rose.",
  "Donkey Kick": "is on hands and knees, lifting a bent leg toward the ceiling while keeping hips level. Glutes washed in terracotta.",
  "Teaser Prep": "lies on her back, legs at 45°, reaching her arms forward as she lifts head and shoulder blades off the mat. Core washed in sage green.",
  "Spine Stretch Forward": "is seated tall, legs extended, arms reaching forward, rounding the spine and rolling forward then returning to seated. Spine and hamstrings washed in dusty rose.",
  "Bridge (Pilates)": "lies on her back, knees bent, lifting hips one vertebra at a time in a slow articulation. Spine and glutes washed in terracotta.",
  "Side-Lying Leg Lift": "lies on her side, legs stacked, lifting the top leg to hip height. Outer thigh and gluteus medius washed in sage green.",
  "Pilates Hundred": "lies on her back, legs at tabletop, upper body curled, pumping the arms up and down by her sides. Core washed in dusty rose.",
  "Cat-Cow": "is on hands and knees, alternately rounding the spine like a cat and arching it like a cow. Full spine washed in terracotta.",
  "Thread the Needle": "is on hands and knees, sliding one arm under her body and rotating the chest slightly. Thoracic spine and shoulders washed in sage green.",
  "Pigeon Pose": "is seated with one leg bent in front of her and the other extended straight back, hips square. Hip rotators and glutes washed in dusty rose.",
  "Swan (Yin)": "lies face down, propping on her forearms, gently arching the upper back while keeping the lower back relaxed. Spinal extensors washed in terracotta.",
  "Caterpillar": "is in a seated forward fold, rounding over her legs, neck and shoulders relaxed. Entire back body washed in sage green.",
  "Supine Twist": "lies on her back, knees bent and falling to one side, arms in a T position. Spine and obliques washed in dusty rose.",
  "Legs Up the Wall": "lies close to a wall with legs extended vertically up the wall, arms relaxed by her sides. A passive hamstring and calf stretch — no muscle wash.",
  "Supported Bridge": "lies on her back with a yoga block under her sacrum, legs extended. A gentle pelvic opening with the spine softly washed in terracotta.",
  "Child's Pose": "kneels and sits back on her heels, folding forward with arms extended ahead of her. Full body relaxation, spine washed in sage green.",
  "Savasana": "lies on her back, arms slightly away from her body, palms facing up, body completely relaxed. No muscle wash — just a peaceful figure.",
};

const out = Object.entries(BODIES).map(([name, body]) => ({
  name,
  prompt: `${HEAD} ${FACE} ${body.trim()} ${TAIL}`,
}));

if (out.length !== 66) {
  console.error(`Expected 66 prompts, got ${out.length}.`);
  process.exit(1);
}

writeFileSync("src/exercise-prompts.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${out.length} prompts → src/exercise-prompts.json`);
