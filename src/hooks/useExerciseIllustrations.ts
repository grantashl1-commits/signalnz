import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Module-level cache so multiple components share one fetch. */
let cache: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/&/g, " and ")
    .replace(/\bdb\b/g, "dumbbell")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getCandidateNames(name: string): string[] {
  const raw = name.trim();
  const base = normalize(raw);
  const stripped = normalize(raw.replace(/\(.*?\)/g, " "));
  const candidates = new Set<string>([base, stripped]);

  const aliasEntries: Array<[boolean, string]> = [
    [/\bpush ?up\b/.test(base), "push up"],
    [/\bdecline push up\b/.test(base), "push up"],
    [/\bpush up to downward dog\b/.test(base), "push up"],
    [/\bsingle arm dumbbell row\b/.test(base), "single arm dumbbell row"],
    [/\bsingle arm row\b/.test(base), "single arm dumbbell row"],
    [/\bdumbbell row\b/.test(base), "single arm dumbbell row"],
    [/\bdb row\b/.test(raw.toLowerCase()), "single arm dumbbell row"],
    [/\bpendlay row\b/.test(base), "pendlay row"],
    [/\brenegade row\b/.test(base), "renegade row"],
    [/\bplank with shoulder tap\b/.test(base), "plank shoulder taps"],
    [/\bplank with shoulder taps\b/.test(base), "plank shoulder taps"],
    [/\bplank shoulder tap\b/.test(base), "plank shoulder taps"],
    [/\bplank\b/.test(base) && /\bshoulder\b/.test(base) && /\btap/.test(base), "plank shoulder taps"],
    [/\bplank with knee dip\b/.test(base), "plank to knee tap"],
    [/\bplank with knee dips\b/.test(base), "plank to knee tap"],
    [/\bplank\b/.test(base) && /\bknee\b/.test(base) && /\b(dip|dips|tap|taps)\b/.test(base), "plank to knee tap"],
    [/\bside plank\b/.test(base), "side plank"],
    [/\bforearm plank\b/.test(base), "forearm plank"],
    [/\bplank with row\b/.test(base), "renegade row"],
    [/\bplank\b/.test(base) && /\brow\b/.test(base), "renegade row"],
    [/\bplank\b/.test(base), "plank"],
  ];

  for (const [matches, alias] of aliasEntries) {
    if (matches) candidates.add(alias);
  }

  return Array.from(candidates).filter(Boolean);
}

function resolveFromMap(map: Record<string, string>, name: string): string | undefined {
  const candidates = getCandidateNames(name);

  for (const candidate of candidates) {
    if (map[candidate]) return map[candidate];
  }

  const entries = Object.entries(map);
  for (const candidate of candidates) {
    const matched = entries.find(([key]) => key.startsWith(`${candidate} `) || candidate.startsWith(`${key} `));
    if (matched) return matched[1];
  }

  return undefined;
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
    return resolveFromMap(map, name);
  };
}
