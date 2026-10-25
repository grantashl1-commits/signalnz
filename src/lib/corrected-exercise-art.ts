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

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Exact variants only: equipment and support position must not collapse to a generic pose.
const correctedArt: Record<string, string> = {
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