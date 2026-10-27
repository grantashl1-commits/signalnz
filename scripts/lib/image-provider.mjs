/**
 * Shared image-generation providers for the exercise artwork scripts.
 *
 * Used by:
 *   scripts/generate-reformer-art.mjs   (117 anatomical reformer illustrations)
 *   scripts/generate-exercise-art.mjs   (61 watercolour strength/core illustrations)
 *
 * Providers
 *   gemini — gemini-2.5-flash-image   (GEMINI_API_KEY / GOOGLE_API_KEY)
 *   openai — gpt-image-1             (OPENAI_API_KEY)
 *
 * Keys are read from the process environment first, then from .env.local, then
 * .env. .env.local is gitignored and is the right place for them. Keys are
 * deliberately not VITE_-prefixed so Vite never inlines them into client code.
 *
 * Images are generated at Gemini's native 1024x1024, which matches the size of
 * the existing artwork in this repo.
 */
import { readFileSync, existsSync } from "node:fs";

export function readEnv(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, "");
    }
  }
  return undefined;
}

async function gemini(prompt, opts = {}) {
  const key = readEnv("GEMINI_API_KEY") ?? readEnv("GOOGLE_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY (or GOOGLE_API_KEY) is not set");
  const model = opts.model ?? "gemini-2.5-flash-image";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${body?.error?.message ?? JSON.stringify(body)}`);
  const part = body?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData ?? p.inline_data);
  const data = part?.inlineData ?? part?.inline_data;
  if (!data?.data) throw new Error("Gemini returned no image data");
  return Buffer.from(data.data, "base64");
}

async function openai(prompt, opts = {}) {
  const key = readEnv("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: opts.size ?? "1024x1024",
      quality: opts.quality ?? "high",
      output_format: "png",
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${body?.error?.message ?? JSON.stringify(body)}`);
  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");
  return Buffer.from(b64, "base64");
}

export const PROVIDERS = { gemini, openai };

/** Resolve a provider by name, exiting helpfully if unknown. */
export function resolveProvider(name) {
  const fn = PROVIDERS[name];
  if (!fn) {
    throw new Error(`Unknown provider "${name}". Use one of: ${Object.keys(PROVIDERS).join(", ")}`);
  }
  return fn;
}

const MAX_ATTEMPTS = 4;

/** Errors that retrying cannot fix — bail immediately. */
const FATAL = /401|403|quota|billing|not set|no image data/i;

/**
 * Generate with bounded retries and jittered backoff.
 * Returns { buffer } on success or { error } on failure — never throws.
 */
export async function generateWithRetry(providerFn, prompt, opts = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return { buffer: await providerFn(prompt, opts) };
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message ?? err);
      if (FATAL.test(msg)) break;
      if (attempt < MAX_ATTEMPTS) {
        const wait = 1500 * attempt * (opts.slot ?? 1);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  return { error: String(lastErr?.message ?? lastErr) };
}

/** Minimal argv parsing: --flag, --key=value. */
export function parseArgs(argv = process.argv.slice(2)) {
  const args = new Map();
  for (const raw of argv) {
    const [k, v] = raw.replace(/^--/, "").split("=");
    args.set(k, v ?? "true");
  }
  return args;
}
