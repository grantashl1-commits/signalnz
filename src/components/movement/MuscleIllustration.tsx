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
  "thoracic": "/images/stretches/lower-back.png",
  "lumbar": "/images/stretches/lower-back.png",
  "bicep": "/images/stretches/arms.png",
  "tricep": "/images/stretches/arms.png",
  "forearm": "/images/stretches/arms.png",
  "arm": "/images/stretches/arms.png",
  "core": "/images/stretches/core.png",
  "abdominal": "/images/stretches/core.png",
  "abs": "/images/stretches/core.png",
  "oblique": "/images/stretches/core.png",
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
