// One-off: pre-generate ElevenLabs MP3s for every mindfulness script
// in src/data/meditation-scripts.ts + generated-mindfulness-scripts.ts,
// and store them in the practice-audio bucket under the path the client
// looks up (practices/regina-theo-v2/<voice-prefix>/<id>.mp3).
//
// Calls the deployed `batch-tts` edge function (which holds the
// service-role + ElevenLabs key). The function accepts any bearer token,
// so we pass the project's publishable key.
//
// Usage:
//   node scripts/generate-mindfulness-audio.mjs        # generate missing
//   node scripts/generate-mindfulness-audio.mjs --dry  # list only

import { readFileSync } from "node:fs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const DRY = process.argv.includes("--dry");

if (!SUPABASE_URL || !ANON) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const REGINA = "M7wzTk2Y1hGQyRzr9sbS";
const THEO = "UmQN7jS1Ee8B1czsUtQh";
const VERSION = "regina-theo-v2";

const MALE_AUTHOR = [
  /matthew\s*fray/i, /richard\s*miller/i, /kabat[-\s]*zinn/i,
  /thich\s*nhat\s*hanh/i, /(porges|polyvagal)/i, /(weil|andrew\s*weil)/i,
  /marcus\s*aurelius|epictetus|seneca|stoic/i, /jordan\s*peterson/i,
];

function voiceFor(evidenceSource, explicit) {
  if (explicit === "THEO_VOICE_ID") return THEO;
  if (explicit === "REGINA_VOICE_ID") return REGINA;
  if (MALE_AUTHOR.some((p) => p.test(evidenceSource || ""))) return THEO;
  return REGINA;
}

// Extract { id, category, evidenceSource, voiceId, ttsScript } from each file.
function extract(file) {
  const src = readFileSync(file, "utf8");
  const out = [];
  // Match each top-level object literal that has id + category + ttsScript.
  const rx = /id:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)",[\s\S]*?(?:evidenceSource:\s*"([^"]*)",[\s\S]*?)?(?:voiceId:\s*(\w+),[\s\S]*?)?ttsScript:\s*`([\s\S]*?)`/g;
  let m;
  while ((m = rx.exec(src)) !== null) {
    const [, id, category, evidenceSource, voiceIdRef, ttsScript] = m;
    out.push({
      id,
      category,
      evidenceSource: evidenceSource || "",
      voiceId: voiceFor(evidenceSource, voiceIdRef),
      isSleep: category === "sleep",
      text: ttsScript.trim(),
    });
  }
  return out;
}

const all = [
  ...extract("src/data/meditation-scripts.ts"),
  ...extract("src/data/generated-mindfulness-scripts.ts"),
];

// Dedup by id (later files win)
const byId = new Map();
for (const s of all) byId.set(s.id, s);
const scripts = [...byId.values()];

console.log(`Parsed ${scripts.length} scripts.`);
if (scripts.length === 0) process.exit(1);

// Group into 4 buckets: (Regina|Theo) × (sleep|narration)
const buckets = {
  [`${REGINA}|narr`]: [], [`${REGINA}|sleep`]: [],
  [`${THEO}|narr`]:   [], [`${THEO}|sleep`]:   [],
};
for (const s of scripts) {
  const k = `${s.voiceId}|${s.isSleep ? "sleep" : "narr"}`;
  buckets[k].push(s);
}

for (const [k, items] of Object.entries(buckets)) {
  console.log(`  ${k}: ${items.length}`);
}

if (DRY) {
  console.log("--dry. Sample:");
  for (const s of scripts.slice(0, 5)) {
    console.log(`  ${s.id} cat=${s.category} voice=${s.voiceId.slice(0,8)} chars=${s.text.length}`);
  }
  process.exit(0);
}

async function dispatch(voiceId, isSleep, items) {
  if (items.length === 0) return;
  const prefix = `practices/${VERSION}/${voiceId.slice(0, 12)}`;
  const label = `${voiceId === THEO ? "Theo" : "Regina"} ${isSleep ? "sleep" : "narration"}`;

  // batch-tts processes serially with 1s sleep + ElevenLabs latency (~5–30s each).
  // Default edge function timeout is ~150s — chunk into batches of ~5 items.
  const CHUNK = 5;
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    console.log(`\n→ ${label}: chunk ${i / CHUNK + 1} / ${Math.ceil(items.length / CHUNK)} (${chunk.length} items)`);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/batch-tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
      },
      body: JSON.stringify({
        items: chunk.map((s) => ({ id: s.id, text: s.text })),
        bucket_prefix: prefix,
        voice_id: voiceId,
        is_sleep: isSleep,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`   ✗ ${res.status}: ${body.slice(0, 300)}`);
      continue;
    }
    const out = await res.json();
    console.log(`   summary:`, out.summary);
    const errs = (out.results || []).filter((r) => String(r.status).startsWith("error") || String(r.status).startsWith("upload"));
    if (errs.length) {
      for (const e of errs) console.log(`     ! ${e.id}: ${e.status}`);
    }
  }
}

console.log("\nDispatching to batch-tts...");
await dispatch(REGINA, false, buckets[`${REGINA}|narr`]);
await dispatch(REGINA, true,  buckets[`${REGINA}|sleep`]);
await dispatch(THEO,   false, buckets[`${THEO}|narr`]);
await dispatch(THEO,   true,  buckets[`${THEO}|sleep`]);
console.log("\nDone.");
