/**
 * Shared Gemini image-generation client.
 *
 * The image-generation functions moved off the Lovable gateway onto the owner's
 * own GEMINI_API_KEY. Gemini returns the image as inline base64 in
 * candidates[].content.parts[].inlineData; this helper extracts it and returns a
 * `data:<mime>;base64,<data>` URL so callers keep working with the same value the
 * gateway used to hand back.
 */

export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function geminiImageKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

async function imageUrlToPart(url: string): Promise<Record<string, unknown>> {
  if (url.startsWith("data:")) {
    const m = url.match(/^data:([^;]+);base64,(.*)$/);
    if (m) return { inlineData: { mimeType: m[1], data: m[2] } };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch input image: ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return {
    inlineData: {
      mimeType: res.headers.get("content-type") || "image/png",
      data: btoa(bin),
    },
  };
}

async function generate(prompt: string, inputImageUrl?: string): Promise<string> {
  const parts: unknown[] = [{ text: prompt }];
  if (inputImageUrl) parts.push(await imageUrlToPart(inputImageUrl));

  const res = await fetch(`${GEMINI_BASE_URL}/models/${GEMINI_IMAGE_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": geminiImageKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini image error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const outParts: Array<{ inlineData?: { mimeType?: string; data?: string } }> =
    data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of outParts) {
    if (p?.inlineData?.data) {
      return `data:${p.inlineData.mimeType || "image/png"};base64,${p.inlineData.data}`;
    }
  }
  throw new Error("No image returned from Gemini");
}

/** Text → image. Returns a `data:<mime>;base64,<data>` URL. */
export function geminiImage(prompt: string): Promise<string> {
  return generate(prompt);
}

/** Text + input image → edited image (image-to-image). */
export function geminiImageEdit(prompt: string, inputImageUrl: string): Promise<string> {
  return generate(prompt, inputImageUrl);
}
