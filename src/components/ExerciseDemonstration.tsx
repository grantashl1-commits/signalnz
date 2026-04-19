import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  exerciseName: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
  /** Override: if provided, skip the DB lookup */
  imageUrl?: string | null;
}

// ── Global illustration cache (loaded once) ─────────────────────────
let illustrationMap: Map<string, string> | null = null;
let loadingPromise: Promise<void> | null = null;

function ensureIllustrationMap(): Promise<void> {
  if (illustrationMap) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const map = new Map<string, string>();
    // Fetch in batches (1000-row default limit)
    let from = 0;
    const batchSize = 1000;
    while (true) {
      const { data } = await supabase
        .from("exercises")
        .select("name, illustration_url")
        .not("illustration_url", "is", null)
        .range(from, from + batchSize - 1);

      if (!data || data.length === 0) break;
      for (const row of data) {
        if (row.illustration_url) {
          map.set(row.name.toLowerCase(), row.illustration_url);
        }
      }
      if (data.length < batchSize) break;
      from += batchSize;
    }
    illustrationMap = map;
  })();

  return loadingPromise;
}

export default function ExerciseDemonstration({
  exerciseName,
  size = 96,
  className = "",
  showLabel = false,
  imageUrl: imageUrlProp,
}: Props) {
  const [ready, setReady] = useState(!!illustrationMap);

  useEffect(() => {
    if (!illustrationMap) {
      ensureIllustrationMap().then(() => setReady(true));
    }
  }, []);

  // Resolve the URL: explicit prop > cached map
  const resolvedUrl = useMemo(() => {
    if (imageUrlProp) return imageUrlProp;
    if (!illustrationMap) return null;
    return illustrationMap.get(exerciseName.toLowerCase()) ?? null;
  }, [imageUrlProp, exerciseName, ready]);

  const label = showLabel && size >= 64 ? (
    <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-foreground/80 to-transparent px-1 py-0.5">
      <span className="line-clamp-1 text-[8px] font-medium leading-tight text-background">{exerciseName}</span>
    </div>
  ) : null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className={`overflow-hidden rounded-xl bg-accent/30 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt={`${exerciseName} illustration`}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10">
            <span className="font-display text-xs font-bold text-primary uppercase">
              {exerciseName.slice(0, 2)}
            </span>
          </div>
        )}
      </div>
      {label}
    </div>
  );
}
