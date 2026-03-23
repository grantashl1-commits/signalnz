// Exercise GIF demos via ExerciseDB, proxied through edge function
// Uses MUSCLE_API_KEY (same RapidAPI key for both ExerciseDB & Muscle Visualizer)

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const gifCache = new Map<string, string | null>();

const STRIP_WORDS = /\b(tempo|slow|fast|heavy|light|weighted|loaded|paused|controlled|unilateral|bilateral|modified|advanced|reverse|lateral|with|\d+-?\s*sec)\b/gi;

function getSearchVariants(name: string): string[] {
  const lower = name.toLowerCase().trim();
  const variants: string[] = [lower];

  const stripped = lower.replace(STRIP_WORDS, "").replace(/\s+/g, " ").trim();
  if (stripped && stripped !== lower) variants.push(stripped);

  const words = stripped.split(" ");
  for (let i = 1; i < words.length; i++) {
    variants.push(words.slice(i).join(" "));
  }

  return [...new Set(variants.filter(Boolean))];
}

async function fetchGif(exerciseName: string): Promise<string | null> {
  if (gifCache.has(exerciseName)) return gifCache.get(exerciseName) ?? null;

  const variants = getSearchVariants(exerciseName);

  for (const query of variants) {
    try {
      const { data, error } = await supabase.functions.invoke("exercise-lookup", {
        body: { query },
      });

      if (error) continue;

      const results = typeof data === "string" ? JSON.parse(data) : data;
      if (Array.isArray(results) && results.length > 0 && results[0].gifUrl) {
        gifCache.set(exerciseName, results[0].gifUrl);
        return results[0].gifUrl;
      }
    } catch {
      // try next variant
    }
  }

  gifCache.set(exerciseName, null);
  return null;
}

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
}

export default function ExerciseDemonstration({ exerciseName, size = 96, className = "" }: Props) {
  const [gifUrl, setGifUrl] = useState<string | null>(gifCache.get(exerciseName) ?? null);
  const [loading, setLoading] = useState(!gifCache.has(exerciseName));

  useEffect(() => {
    if (gifCache.has(exerciseName)) {
      setGifUrl(gifCache.get(exerciseName) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchGif(exerciseName).then((url) => {
      if (!cancelled) {
        setGifUrl(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [exerciseName]);

  if (loading) {
    return (
      <div
        className="bg-accent animate-pulse rounded-xl"
        style={{ width: size, height: size }}
      />
    );
  }

  if (!gifUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-muted ${className}`}
        style={{ width: size, height: size }}
      >
        <User className="h-1/2 w-1/2 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <img
      src={gifUrl}
      alt={exerciseName}
      loading="lazy"
      className={`w-full h-full object-cover rounded-xl ${className}`}
      style={{ width: size, height: size }}
    />
  );
}