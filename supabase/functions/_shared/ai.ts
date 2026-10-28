/**
 * Shared DeepSeek AI client.
 *
 * The app moved off the Lovable AI gateway onto the owner's own DeepSeek key.
 * DeepSeek's API is OpenAI-compatible, and the "vision" variant accepts image
 * URLs in the standard `image_url` content part, so the existing message shapes
 * carry over unchanged (including the fridge-photo vision call).
 *
 * NOTE: DeepSeek is a text + vision-input model. It does NOT generate images,
 * so the image-generation functions (dream-image-generate, chore-illustration,
 * batch-illustrations, batch-animate, generate-exercise-illustration) must stay
 * on an image model and do not use this client.
 */

export const DEEPSEEK_MODEL = "deepseek-v4-flash-vision-exp";
export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export function deepseekKey(): string {
  const key = Deno.env.get("DEEPSEEK_API_KEY");
  if (!key) throw new Error("DEEPSEEK_API_KEY is not configured");
  return key;
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json_object";
}

/**
 * One-shot chat completion. Returns the assistant text, or throws on failure.
 */
export async function deepseekChat(
  messages: unknown[],
  opts: ChatOptions = {},
): Promise<string> {
  const body: Record<string, unknown> = { model: DEEPSEEK_MODEL, messages };
  if (opts.maxTokens != null) body.max_tokens = opts.maxTokens;
  if (opts.temperature != null) body.temperature = opts.temperature;
  if (opts.responseFormat) body.response_format = { type: opts.responseFormat };

  const res = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deepseekKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`DeepSeek error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Streaming chat completion. Returns the raw upstream Response so the caller can
 * check `.ok` and relay the SSE `body` straight to the client (OpenAI-compatible
 * stream, same shape the Lovable gateway returned).
 */
export function deepseekChatStream(
  messages: unknown[],
  opts: ChatOptions = {},
): Promise<Response> {
  const body: Record<string, unknown> = { model: DEEPSEEK_MODEL, messages, stream: true };
  if (opts.maxTokens != null) body.max_tokens = opts.maxTokens;
  if (opts.temperature != null) body.temperature = opts.temperature;

  return fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deepseekKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
