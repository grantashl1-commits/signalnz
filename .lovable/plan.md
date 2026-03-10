

# Plan: Replace Lovable AI with Your Own Gemini API Key

## Overview

Swap all 5 edge functions from the Lovable AI gateway to Google's Gemini API directly using your own API key. This means every AI call your users make will bill to your Google account — not your Lovable credits.

## Step 1: Add Your Gemini API Key as a Secret

I'll securely store your Google Gemini API key as `GEMINI_API_KEY` in your backend secrets. You'll need to grab it from [Google AI Studio](https://aistudio.google.com/apikey).

## Step 2: Update All 5 Edge Functions

Each function currently calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY`. I'll update them to call Google's Gemini API directly.

**What changes per function:**

| Function | Current Model (Lovable format) | New Gemini Model |
|----------|-------------------------------|------------------|
| `signal-ai` | `google/gemini-3-flash-preview` | `gemini-2.0-flash` |
| `cycle-ai` | `google/gemini-3-flash-preview` | `gemini-2.0-flash` |
| `journal-ai` | `google/gemini-2.5-flash` | `gemini-2.0-flash` |
| `community-moderate` | `google/gemini-2.5-flash` | `gemini-2.0-flash` |
| `dream-image-generate` | `google/gemini-3.1-flash-image-preview` | `gemini-2.0-flash` (image gen via Imagen API) |

**Key code change in each function:**
- Replace `LOVABLE_API_KEY` → `GEMINI_API_KEY`
- Replace URL: `https://ai.gateway.lovable.dev/v1/chat/completions` → `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` (Google's OpenAI-compatible endpoint)
- Update model names to Google's native format
- For `dream-image-generate`: use Google's image generation endpoint or the Gemini multimodal API directly
- Keep all existing error handling (429, 402) and CORS headers

**Example change pattern:**
```typescript
// Before
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
  body: JSON.stringify({ model: "google/gemini-3-flash-preview", ... })
});

// After
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
  headers: { Authorization: `Bearer ${GEMINI_API_KEY}` },
  body: JSON.stringify({ model: "gemini-2.0-flash", ... })
});
```

## What This Means for Scaling

- **No more Lovable credit consumption** for AI calls
- You control your own billing, rate limits, and quotas via Google Cloud
- Google Gemini API has generous free tiers and pay-as-you-go pricing
- You can upgrade to higher quotas directly through Google Cloud Console

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/signal-ai/index.ts` | Swap to Gemini API |
| `supabase/functions/cycle-ai/index.ts` | Swap to Gemini API |
| `supabase/functions/journal-ai/index.ts` | Swap to Gemini API |
| `supabase/functions/community-moderate/index.ts` | Swap to Gemini API |
| `supabase/functions/dream-image-generate/index.ts` | Swap to Gemini API (image gen) |

No frontend changes needed — all edge function signatures stay the same.

