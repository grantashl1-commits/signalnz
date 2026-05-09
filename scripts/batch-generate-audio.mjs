/**
 * Admin script: pre-generate ElevenLabs audio for every AudioScript that
 * doesn't already have a hand-recorded MP3 in /public/audio/.
 *
 * Splits scripts by voice (Regina for everything except hypnosis → Theo)
 * and fires two batched calls into the existing `batch-tts` edge function.
 * That function uploads each generated MP3 into the `practice-audio`
 * Supabase Storage bucket at the namespaced path that `getStorageAudioPath`
 * in `src/data/audio-scripts.ts` constructs, so the app can fetch it
 * directly afterwards.
 *
 * Usage (you must be authenticated to the Supabase project — set the
 * service role key for the edge function call):
 *
 *   node scripts/batch-generate-audio.mjs --dry        # show what would run
 *   node scripts/batch-generate-audio.mjs              # actually generate
 *
 * Required env (in .env or shell):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (service role — has permission to call batch-tts)
 *
 * The batch-tts edge function itself reads ELEVENLABS_API_KEY from its
 * own environment in Supabase (set via `supabase secrets`).
 */
import { readFileSync, existsSync } from "node:fs";

try { process.loadEnvFile(".env"); } catch { /* ok */ }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes("--dry");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}

// Voice IDs — must match src/lib/script-audio.ts
const REGINA = "M7wzTk2Y1hGQyRzr9sbS";
const THEO = "UmQN7jS1Ee8B1czsUtQh";
const VOICE_CACHE_VERSION = "regina-theo-v2";

function voiceForCategory(cat) {
  return cat === "hypnosis" ? THEO : REGINA;
}

function bucketPrefix(voiceId) {
  return `audio-scripts/${VOICE_CACHE_VERSION}/${voiceId.slice(0, 12)}`;
}

// Light-weight extraction of script entries from audio-scripts.ts so we
// don't have to set up a TS loader. Each entry is parsed via regex over
// the {id, title, category, durationMinutes, targetWordCount, script} shape.
function extractScripts() {
  const src = readFileSync("src/data/audio-scripts.ts", "utf8");
  const scripts = [];
  const objectRegex = /\{\s*id:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)",[\s\S]*?script:\s*`([\s\S]*?)`\s*\}/g;
  let m;
  while ((m = objectRegex.exec(src)) !== null) {
    scripts.push({ id: m[1], category: m[2], text: m[3] });
  }
  return scripts;
}

function hasStaticMp3(id) {
  return existsSync(`public/audio/${id}.mp3`);
}

async function callBatchTts(items, voiceId, prefix) {
  const url = `${SUPABASE_URL}/functions/v1/batch-tts`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items.map(({ id, text }) => ({ id, text })),
      bucket_prefix: prefix,
      voice_id: voiceId,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`batch-tts ${res.status}: ${body.slice(0, 400)}`);
  }
  return res.json();
}

async function main() {
  const all = extractScripts();
  console.log(`Parsed ${all.length} scripts from audio-scripts.ts`);
  if (all.length === 0) {
    console.error("No scripts parsed — check the regex still matches the file shape.");
    process.exit(1);
  }

  const skipped = all.filter(s => hasStaticMp3(s.id));
  const needGen = all.filter(s => !hasStaticMp3(s.id));

  const byVoice = { [REGINA]: [], [THEO]: [] };
  for (const s of needGen) byVoice[voiceForCategory(s.category)].push(s);

  console.log(`Skipping ${skipped.length} scripts with static MP3s: ${skipped.map(s => s.id).join(", ") || "(none)"}`);
  console.log(`Regina batch: ${byVoice[REGINA].length} scripts`);
  console.log(`Theo   batch: ${byVoice[THEO].length} scripts`);

  if (DRY_RUN) {
    console.log("\n--dry — no API calls. Re-run without --dry to actually generate.");
    return;
  }

  for (const [voiceId, items] of Object.entries(byVoice)) {
    if (items.length === 0) continue;
    const prefix = bucketPrefix(voiceId);
    const label = voiceId === THEO ? "Theo" : "Regina";
    console.log(`\nDispatching ${label} batch (${items.length} items) → ${prefix}/...`);
    try {
      const out = await callBatchTts(items, voiceId, prefix);
      console.log(`${label} summary:`, out.summary);
      const errs = (out.results || []).filter(r => String(r.status).startsWith("error"));
      if (errs.length) console.log(`${label} errors:`, errs.map(e => `${e.id}: ${e.status}`).join("\n"));
    } catch (err) {
      console.error(`${label} batch failed:`, err.message);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
