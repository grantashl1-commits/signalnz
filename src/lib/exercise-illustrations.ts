import { supabase } from "@/integrations/supabase/client";

const BUCKET = "exercise-assets";
const FOLDER = "illustrations";
const LS_GENERATED = "yocm_generated_illustrations_v1";
const PUBLIC_BASE = `https://hwcgbcfqxzzhvivcdroh.supabase.co/storage/v1/object/public/${BUCKET}/${FOLDER}`;

/** Aggressive normaliser: strip non-alphanum, lowercase. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

let indexPromise: Promise<Map<string, string>> | null = null;

/** Build a one-time index of normalized name → exact filename in storage. */
function getIndex(): Promise<Map<string, string>> {
  if (indexPromise) return indexPromise;
  indexPromise = (async () => {
    const map = new Map<string, string>();
    let offset = 0;
    const limit = 1000;
    while (true) {
      const { data, error } = await supabase
        .storage
        .from(BUCKET)
        .list(FOLDER, { limit, offset, sortBy: { column: "name", order: "asc" } });
      if (error || !data?.length) break;
      for (const f of data) {
        if (!f.name?.toLowerCase().endsWith(".png")) continue;
        const base = f.name.replace(/\.png$/i, "");
        map.set(norm(base), f.name);
      }
      if (data.length < limit) break;
      offset += limit;
    }
    // Merge in any locally-generated names we've cached this session.
    try {
      const cached = JSON.parse(localStorage.getItem(LS_GENERATED) || "{}");
      for (const [k, v] of Object.entries(cached)) {
        if (typeof v === "string") map.set(k, v);
      }
    } catch {}
    return map;
  })();
  return indexPromise;
}

/** Try to find an existing illustration URL for an exercise. */
export async function findIllustrationUrl(name: string): Promise<string | null> {
  const idx = await getIndex();
  const key = norm(name);
  // Direct hit
  let fname = idx.get(key);
  if (!fname) {
    // Try a few light variants — drop trailing parentheticals, "the", etc.
    const stripped = name.replace(/\(.*?\)/g, "").trim();
    fname = idx.get(norm(stripped));
  }
  if (!fname) return null;
  return `${PUBLIC_BASE}/${encodeURIComponent(fname)}`;
}

const inflight = new Map<string, Promise<string | null>>();

/** Ask the edge function to generate an illustration for this exercise (cached). */
export function requestIllustrationGeneration(name: string): Promise<string | null> {
  const key = norm(name);
  if (inflight.has(key)) return inflight.get(key)!;
  const p = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise-illustration", {
        body: { exerciseName: name },
      });
      if (error || !data?.url || !data?.filename) return null;
      // Cache the new filename so future lookups in this session hit immediately.
      try {
        const cached = JSON.parse(localStorage.getItem(LS_GENERATED) || "{}");
        cached[key] = data.filename;
        localStorage.setItem(LS_GENERATED, JSON.stringify(cached));
      } catch {}
      const idx = await getIndex();
      idx.set(key, data.filename);
      return data.url as string;
    } catch {
      return null;
    }
  })();
  inflight.set(key, p);
  return p;
}
