// Add to your .env: VITE_RAPIDAPI_KEY=your_key_from_rapidapi.com
// Get a free key at: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
// Free tier: 500 requests/day — enough for any workout session

import { useState, useEffect } from "react";
import { User } from "lucide-react";

const gifCache = new Map<string, string | null>();
const HAS_API_KEY = !!import.meta.env.VITE_RAPIDAPI_KEY;

const STRIP_WORDS = /\b(tempo|slow|fast|heavy|light|weighted|loaded|paused|controlled|unilateral|bilateral|modified|advanced|reverse|lateral|with|\d+-?\s*sec)\b/gi;

function getSearchVariants(name: string): string[] {
  const lower = name.toLowerCase().trim();
  const variants: string[] = [lower];

  // Strip adjectives/modifiers
  const stripped = lower.replace(STRIP_WORDS, "").replace(/\s+/g, " ").trim();
  if (stripped && stripped !== lower) variants.push(stripped);

  // Progressive word removal from the front
  const words = stripped.split(" ");
  for (let i = 1; i < words.length; i++) {
    variants.push(words.slice(i).join(" "));
  }

  // Deduplicate
  return [...new Set(variants.filter(Boolean))];
}

async function fetchGif(exerciseName: string): Promise<string | null> {
  if (gifCache.has(exerciseName)) return gifCache.get(exerciseName) ?? null;

  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  if (!apiKey) {
    gifCache.set(exerciseName, null);
    return null;
  }

  const variants = getSearchVariants(exerciseName);

  for (const query of variants) {
    try {
      const res = await fetch(
        `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(query)}?limit=1&offset=0`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
          },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].gifUrl) {
        gifCache.set(exerciseName, data[0].gifUrl);
        return data[0].gifUrl;
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
  const [loading, setLoading] = useState(HAS_API_KEY && !gifCache.has(exerciseName));

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
        className={`bg-purple-100 dark:bg-purple-900/30 animate-pulse rounded-xl ${className}`}
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
