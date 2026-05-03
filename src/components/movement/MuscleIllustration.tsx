/**
 * Maps target muscle keywords to anatomy illustration images.
 * Falls back gracefully when no matching illustration exists.
 */

const MUSCLE_IMAGE_MAP: Record<string, string> = {
  "hip flexor": "/images/stretches/hip-flexors.png",
  "hip flexors": "/images/stretches/hip-flexors.png",
  "psoas": "/images/stretches/hip-flexors.png",
  "iliacus": "/images/stretches/hip-flexors.png",
  "glute": "/images/stretches/glutes.png",
  "glutes": "/images/stretches/glutes.png",
  "gluteus": "/images/stretches/glutes.png",
  "piriformis": "/images/stretches/glutes.png",
  "hamstring": "/images/stretches/hamstrings.png",
  "hamstrings": "/images/stretches/hamstrings.png",
  "calf": "/images/stretches/calves.png",
  "calves": "/images/stretches/calves.png",
  "gastrocnemius": "/images/stretches/calves.png",
  "soleus": "/images/stretches/calves.png",
  "lower back": "/images/stretches/lower-back.png",
  "spine": "/images/stretches/lower-back.png",
  "erector": "/images/stretches/lower-back.png",
  "thoracic": "/images/stretches/thoracic-spine.png",
  "lumbar": "/images/stretches/lower-back.png",
  "bicep": "/images/stretches/arms.png",
  "tricep": "/images/stretches/arms.png",
  "forearm": "/images/stretches/arms.png",
  "arm": "/images/stretches/arms.png",
  "core": "/images/stretches/core.png",
  "abdominal": "/images/stretches/core.png",
  "abs": "/images/stretches/core.png",
  "oblique": "/images/stretches/core.png",
  // Plantar fascia / foot sole
  "plantar fascia": "/images/stretches/plantar-fascia.png",
  "plantar": "/images/stretches/plantar-fascia.png",
  "foot sole": "/images/stretches/plantar-fascia.png",
  "arch of foot": "/images/stretches/plantar-fascia.png",
  // IT band
  "it band": "/images/stretches/it-band.png",
  "iliotibial": "/images/stretches/it-band.png",
  "lateral thigh": "/images/stretches/it-band.png",
  "outer thigh": "/images/stretches/it-band.png",
  "tfl": "/images/stretches/it-band.png",
  // Adductors
  "adductor": "/images/stretches/adductors.png",
  "adductors": "/images/stretches/adductors.png",
  "inner thigh": "/images/stretches/adductors.png",
  "groin": "/images/stretches/adductors.png",
  // Pelvic floor
  "pelvic floor": "/images/stretches/pelvic-floor.png",
  "kegel": "/images/stretches/pelvic-floor.png",
  "deep core": "/images/stretches/pelvic-floor.png",
  "transverse abdominis": "/images/stretches/pelvic-floor.png",
  // Thoracic spine / lats
  "thoracic spine": "/images/stretches/thoracic-spine.png",
  // (thoracic mapped above to thoracic-spine.png)
  "upper back": "/images/stretches/thoracic-spine.png",
  "lats": "/images/stretches/thoracic-spine.png",
  "latissimus": "/images/stretches/thoracic-spine.png",
  "rhomboid": "/images/stretches/thoracic-spine.png",
  // Posterior chain
  "posterior chain": "/images/stretches/posterior-chain.png",
  "hip hinge": "/images/stretches/posterior-chain.png",
  "back of body": "/images/stretches/posterior-chain.png",
  "back chain": "/images/stretches/posterior-chain.png",
  // Cardiovascular / full body
  "cardiovascular": "/images/stretches/cardiovascular.png",
  "cardio": "/images/stretches/cardiovascular.png",
  "heart rate": "/images/stretches/cardiovascular.png",
  "full body": "/images/stretches/cardiovascular.png",
  "aerobic": "/images/stretches/cardiovascular.png",
  "endurance": "/images/stretches/cardiovascular.png",
};

function findMuscleImage(targetMuscle: string): string | null {
  const lower = targetMuscle.toLowerCase();
  for (const [keyword, path] of Object.entries(MUSCLE_IMAGE_MAP)) {
    if (lower.includes(keyword)) return path;
  }
  return null;
}

interface Props {
  targetMuscle: string;
  size?: number;
  className?: string;
}

export default function MuscleIllustration({ targetMuscle, size = 36, className = "" }: Props) {
  const imagePath = findMuscleImage(targetMuscle);
  if (!imagePath) return null;

  return (
    <img
      src={imagePath}
      alt={`${targetMuscle} anatomy`}
      loading="lazy"
      width={size}
      height={size}
      className={`object-contain opacity-70 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
