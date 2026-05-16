import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Module-level cache so multiple components share one fetch. */
let cache: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function loadMap(): Promise<Record<string, string>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const map: Record<string, string> = {};
    // Paginate to bypass 1000-row default
    let from = 0;
    const pageSize = 1000;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await supabase
        .from("exercises")
        .select("name, illustration_url")
        .not("illustration_url", "is", null)
        .range(from, from + pageSize - 1);
      if (error || !data || data.length === 0) break;
      for (const row of data as Array<{ name: string; illustration_url: string | null }>) {
        if (row.illustration_url) map[normalize(row.name)] = row.illustration_url;
      }
      if (data.length < pageSize) break;
      from += pageSize;
    }
    cache = map;
    inflight = null;
    return map;
  })();
  return inflight;
}

/**
 * Returns a lookup fn: exerciseName -> illustration_url | undefined
 * Shares a single cached fetch across the app.
 */
export function useExerciseIllustrations() {
  const [map, setMap] = useState<Record<string, string>>(cache ?? {});
  useEffect(() => {
    if (cache) { setMap(cache); return; }
    let alive = true;
    loadMap().then((m) => { if (alive) setMap(m); });
    return () => { alive = false; };
  }, []);
  return (name: string | null | undefined): string | undefined => {
    if (!name) return undefined;
    return map[normalize(name)];
  };
}
