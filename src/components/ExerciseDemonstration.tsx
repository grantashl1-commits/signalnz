import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const gifCache = new Map<string, string | null>();

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

async function lookupGif(exerciseName: string): Promise<string | null> {
  if (gifCache.has(exerciseName)) return gifCache.get(exerciseName) ?? null;

  const variants = getSearchVariants(exerciseName);

  for (const query of variants) {
    const { data } = await supabase
      .from("exercises")
      .select("gif_url")
      .ilike("name", `%${query}%`)
      .limit(1)
      .single();

    if (data?.gif_url) {
      gifCache.set(exerciseName, data.gif_url);
      return data.gif_url;
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
    lookupGif(exerciseName).then((url) => {
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
        className={`rounded-xl bg-accent animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (!gifUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl bg-muted gap-1 ${className}`}
        style={{ width: size, height: size }}
      >
        <Dumbbell className="h-5 w-5 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/40 leading-none">Demo unavailable</span>
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
