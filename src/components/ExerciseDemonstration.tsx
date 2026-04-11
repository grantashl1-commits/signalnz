import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ExerciseResult {
  illustration_url: string | null;
  gif_url: string | null;
  target: string | null;
  name: string;
}

const exerciseCache = new Map<string, ExerciseResult | null>();

const STRIP_WORDS = ["tempo", "slow", "fast", "heavy", "paused", "weighted", "reverse", "modified", "with", "4-sec", "hold", "pulse", "sumo", "goblet"];

function getSearchVariants(name: string): string[] {
  let current = name.toLowerCase().trim();
  const variants: string[] = [current];

  for (const word of STRIP_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(current)) {
      current = current.replace(regex, "").replace(/\s+/g, " ").trim();
      if (current) variants.push(current);
    }
  }

  const words = variants[variants.length - 1].split(" ");
  for (let i = 1; i < words.length; i++) {
    variants.push(words.slice(i).join(" "));
  }

  return [...new Set(variants.filter(Boolean))];
}

async function lookupExercise(exerciseName: string): Promise<ExerciseResult | null> {
  if (exerciseCache.has(exerciseName)) return exerciseCache.get(exerciseName) ?? null;

  const variants = getSearchVariants(exerciseName);

  for (const query of variants) {
    const { data } = await supabase
      .from("exercises")
      .select("illustration_url, gif_url, target, name")
      .ilike("name", `%${query}%`)
      .limit(1)
      .maybeSingle();

    if (data) {
      const result = data as unknown as ExerciseResult;
      exerciseCache.set(exerciseName, result);
      return result;
    }
  }

  exerciseCache.set(exerciseName, null);
  return null;
}

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export default function ExerciseDemonstration({ exerciseName, size = 96, className = "", showLabel = false }: Props) {
  const [exercise, setExercise] = useState<ExerciseResult | null>(exerciseCache.get(exerciseName) ?? null);
  const [loading, setLoading] = useState(!exerciseCache.has(exerciseName));
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (exerciseCache.has(exerciseName)) {
      setExercise(exerciseCache.get(exerciseName) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    lookupExercise(exerciseName).then((result) => {
      if (!cancelled) {
        setExercise(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [exerciseName]);

  if (loading) {
    return (
      <div
        className={`rounded-xl bg-accent animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Prefer illustration_url (anatomy style), fall back to gif_url
  const imageUrl = (!imgError && exercise?.illustration_url) || exercise?.gif_url;

  if (!imageUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl gap-1 ${className}`}
        style={{ width: size, height: size, backgroundColor: "hsl(var(--accent))" }}
      >
        <Dumbbell className="text-primary/50" style={{ width: size * 0.28, height: size * 0.28 }} />
        {size >= 64 && (
          <span className="text-[9px] text-primary/60 italic leading-tight text-center px-1 line-clamp-2">{exerciseName}</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={imageUrl}
        alt={exerciseName}
        loading="lazy"
        className={`w-full h-full object-cover rounded-xl ${className}`}
        style={{ width: size, height: size }}
        onError={() => {
          if (!imgError && exercise?.illustration_url) {
            setImgError(true);
          }
        }}
      />
      {showLabel && size >= 64 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl px-1 py-0.5">
          <span className="text-[8px] text-white font-medium leading-tight line-clamp-1">{exerciseName}</span>
        </div>
      )}
    </div>
  );
}
