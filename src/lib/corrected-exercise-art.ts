import ballKneeTuck from "@/assets/movement/core/ball-knee-tuck.png";
import sidePlank from "@/assets/movement/core/side-plank-hip-lift.png";
import weightedDeadBug from "@/assets/movement/core/weighted-dead-bug.png";
import suitcaseCarry from "@/assets/movement/core/suitcase-carry.png";
import stirPot from "@/assets/movement/core/stir-the-pot.png";
import ballPike from "@/assets/movement/core/ball-pike.png";
import copenhagen from "@/assets/movement/core/copenhagen-plank.png";
import reverseCrunch from "@/assets/movement/core/reverse-crunch.png";
import deadBug from "@/assets/movement/core/dead-bug.png";
import ballDeadBug from "@/assets/movement/core/ball-dead-bug.png";
import sidePlankKnee from "@/assets/movement/core/side-plank-knee.png";
import birdDog from "@/assets/movement/core/bird-dog.png";
import bearHold from "@/assets/movement/core/bear-hold.png";
import forearmPlank from "@/assets/movement/core/forearm-plank.png";
import hollowTuck from "@/assets/movement/core/hollow-tuck.png";
import shoulderTap from "@/assets/movement/core/shoulder-tap.png";
import renegadeRow from "@/assets/movement/core/renegade-row.png";
import reformerPallof from "@/assets/movement/core/reformer-pallof.png";
import dbBench from "@/assets/movement/strength/db-bench-press.png";
import barbellRow from "@/assets/movement/strength/barbell-row.png";
import seatedPress from "@/assets/movement/strength/seated-db-press.png";
import barbellBench from "@/assets/movement/strength/barbell-bench-press.png";
import lateralRaise from "@/assets/movement/strength/lateral-raise.png";
import pushPress from "@/assets/movement/strength/db-push-press.png";
import backSquat from "@/assets/movement/strength/barbell-back-squat.png";
import dbRdl from "@/assets/movement/strength/db-rdl.png";
import barbellRdl from "@/assets/movement/strength/barbell-rdl.png";
import hipThrust from "@/assets/movement/strength/barbell-hip-thrust.png";
import bulgarian from "@/assets/movement/strength/bulgarian-split-squat.png";
import reverseLunge from "@/assets/movement/strength/reverse-lunge.png";
import goblet from "@/assets/movement/strength/goblet-squat.png";
import stepUp from "@/assets/movement/strength/step-up.png";
import swing from "@/assets/movement/strength/db-swing.png";
import jump from "@/assets/movement/strength/squat-jump.png";
import arnold from "@/assets/movement/strength/arnold-press.png";
import incline from "@/assets/movement/strength/incline-db-press.png";
import reformerRow from "@/assets/movement/reformer/seated-row.png";
import reformerPress from "@/assets/movement/reformer/seated-chest-press.png";
import reformerCurl from "@/assets/movement/reformer/biceps-curl.png";
import reformerFootwork from "@/assets/movement/reformer/single-leg-footwork.png";
import reformerBridge from "@/assets/movement/reformer/bridge.png";
import reformerCalf from "@/assets/movement/reformer/calf-raise.png";

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Exact variants only: equipment and support position must not collapse to a generic pose.
const correctedArt: Record<string, string> = {
  "dumbbell bench press": dbBench,
  "barbell bent over row": barbellRow,
  "seated dumbbell shoulder press": seatedPress,
  "barbell bench press": barbellBench,
  "lateral raise": lateralRaise,
  "dumbbell push press": pushPress,
  "barbell squat": backSquat,
  "dumbbell romanian deadlift": dbRdl,
  "barbell romanian deadlift": barbellRdl,
  "barbell hip thrust": hipThrust,
  "dumbbell bulgarian split squat": bulgarian,
  "reverse lunge": reverseLunge,
  "goblet squat": goblet,
  "dumbbell step up": stepUp,
  "dumbbell swing": swing,
  "squat jump": jump,
  "arnold press": arnold,
  "incline dumbbell bench press": incline,
  "reformer seated row": reformerRow,
  "reformer seated chest press": reformerPress,
  "reformer biceps curl": reformerCurl,
  "reformer single leg press": reformerFootwork,
  "reformer bridge": reformerBridge,
  "reformer calf raise": reformerCalf,
  "stability ball knee tuck": ballKneeTuck,
  "ball knee tuck": ballKneeTuck,
  "side plank": sidePlank,
  "side plank hip lift": sidePlank,
  "dead bug dumbbell": weightedDeadBug,
  "weighted dead bug": weightedDeadBug,
  "suitcase carry": suitcaseCarry,
  "stir the pot yoga ball": stirPot,
  "stir the pot": stirPot,
  "stability ball pike": ballPike,
  "ball pike": ballPike,
  "copenhagen side plank": copenhagen,
  "reverse crunch": reverseCrunch,
  "dead bug": deadBug,
  "dead bug yoga ball": ballDeadBug,
  "ball dead bug": ballDeadBug,
  "side plank bent knee": sidePlankKnee,
  "bird dog": birdDog,
  "bear hold": bearHold,
  "forearm plank": forearmPlank,
  "hollow body hold tuck": hollowTuck,
  "plank shoulder tap": shoulderTap,
  "plank shoulder taps": shoulderTap,
  "renegade row": renegadeRow,
  "pallof press reformer strap": reformerPallof,
};

export function getCorrectedExerciseArt(name: string | null | undefined): string | undefined {
  return name ? correctedArt[normalize(name)] : undefined;
}