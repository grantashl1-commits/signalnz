

# Plan: Guided Signal Ritual, Journal Intelligence, Signal Memory, and AI Credits System

This is a large feature set spanning UI transformation, database schema, edge function updates, and membership integration. Here is the implementation plan broken into four phases.

---

## Phase 1: Guided Ritual UI (3 stages)

**Files:** `SignalPanel.tsx`, `useSignalAI.ts`, `SignalResponseCard.tsx`

### SignalPanel.tsx — Stage-based state machine
- Add `stage` state: `"invitation" | "listening" | "signal"`
- **Invitation stage:** Remove text input from initial view. Center content vertically. Show calm headline "Give me a signal", time-aware subtext, and 4 elegant pill-button prompts with staggered fade-in. Add a subtle "Or ask your own" link that reveals the input on click. Keep mode tabs but style more subtly above prompts.
- **Listening stage:** Full centered moment with three small purple dots pulsing sequentially (keyframe animation with staggered delays), soft expanding ring ripple behind them, italic text "Listening for your signal...", and faint echo of the user's prompt above.
- **Signal stage:** Show `SignalResponseCard` as today. Only reveal the text input after the response for follow-ups.
- Transitions: open → invitation, select prompt → listening, response arrives → signal, reset → invitation, follow-up → listening.

### useSignalAI.ts — Minimum loading duration
- Wrap the fetch in `Promise.all([fetchCall, new Promise(r => setTimeout(r, 1800))])` so loading stays true for at least 1.8 seconds.

### SignalResponseCard.tsx — Label refinements
- "What this may be pointing to" → "What this might mean"
- "A small next step" → "A gentle next step"
- "Continue exploring" → "Go deeper"

---

## Phase 2: Journal Intelligence System

### Database (migration)
Create tables to store user insight profiles and signal memories:

```sql
-- User insight profiles built from journal entries
CREATE TABLE public.user_insight_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL UNIQUE,
  emotional_patterns jsonb DEFAULT '[]',
  recurring_topics jsonb DEFAULT '[]',
  common_stressors jsonb DEFAULT '[]',
  growth_interests jsonb DEFAULT '[]',
  preferred_guidance_tone text DEFAULT 'warm',
  recommended_resources jsonb DEFAULT '[]',
  entry_count int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Signal memory — past signals stored for reference
CREATE TABLE public.signal_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  signal_text text NOT NULL,
  headline text,
  theme text,
  emotional_context text,
  prompt text,
  mode text,
  created_at timestamptz DEFAULT now()
);

-- AI usage tracking for credits
CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  function_name text NOT NULL,
  tokens_used int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_insight_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth yet), will tighten with auth
CREATE POLICY "Allow all on user_insight_profiles" ON public.user_insight_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on signal_memory" ON public.signal_memory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ai_usage" ON public.ai_usage FOR ALL USING (true) WITH CHECK (true);
```

### New edge function: `journal-insights/index.ts`
- Called after each journal AI analysis returns
- Takes the journal entry + AI analysis + existing profile
- Uses Gemini to extract: emotions, themes, stressors, intentions, goals, recurring concerns
- Merges into the `user_insight_profiles` table (upsert by user_identifier)
- When themes repeat 3+ times, generates book/resource recommendations and stores in `recommended_resources`

### Update `signal-ai/index.ts`
- Accept optional `insightProfile` and `recentSignals` in the request body
- Add to the system prompt: "You may receive a user insight profile with their emotional patterns, recurring topics, and growth interests. Reference these gently and supportively — never invasively. You may also receive past signals; occasionally reference them to show continuity."
- Add to context parts: insight profile summary, last 3 signal themes

### Update `useSignalAI.ts` (client)
- Before calling signal-ai, fetch the user's insight profile and last 5 signals from the database
- Pass `insightProfile` and `recentSignals` in the request body
- After receiving a signal response, save it to `signal_memory` table

### Update `JournalEntries.tsx`
- After `journal-ai` returns analysis, fire a background call to `journal-insights` edge function to update the user's insight profile
- Use a device fingerprint or localStorage ID as `user_identifier` until auth is implemented

---

## Phase 3: Signal Memory

### Client-side (`useSignalAI.ts`)
- After a successful signal generation, insert into `signal_memory` table with headline, theme (from first followUp or headline keyword), emotional_context (from interpretation), prompt, and mode
- Expose a `loadRecentSignals` helper that queries last 10 signals for the user

### Signal panel
- Add a small "Past signals" link in the invitation stage that opens a scrollable list of previous signals from `signal_memory`

---

## Phase 4: AI Credits and Membership

### Database (migration)
```sql
CREATE TABLE public.ai_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL UNIQUE,
  credits_remaining int DEFAULT 20,
  tier text DEFAULT 'free',
  last_topup_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on ai_credits" ON public.ai_credits FOR ALL USING (true) WITH CHECK (true);
```

### Credit deduction in edge functions
- Each AI edge function (`signal-ai`, `journal-ai`, `cycle-ai`) will:
  1. Check `ai_credits` for the user_identifier
  2. If credits_remaining <= 0, return a 402 with `{ error: "You've used all your AI credits. Top up or upgrade your plan." }`
  3. Otherwise, decrement credits_remaining and proceed
  4. Log usage in `ai_usage` table

### Credit tiers
| Tier | Monthly credits | Price |
|------|----------------|-------|
| Free | 20 signals + analyses | $0 |
| Nourished | 150 | $19/mo |
| Thriving | Unlimited | $39/mo |
| Top-up pack | +50 credits | $5 one-off |

### Membership page update (`Membership.tsx`)
- Add AI credit counts to each tier's feature list
- Add a "Top up credits" card/button for one-off purchases
- Show current credits remaining

### Client-side credit awareness
- Create a `useAICredits` hook that fetches the user's credit balance
- Show remaining credits in the Signal panel header
- When credits are depleted, show a friendly upgrade prompt instead of generating

---

## Files to create/edit

| File | Action |
|------|--------|
| `src/components/signal/SignalPanel.tsx` | Major rewrite — 3-stage ritual |
| `src/hooks/useSignalAI.ts` | Min loading delay, signal memory save, insight profile fetch |
| `src/components/signal/SignalResponseCard.tsx` | Label updates |
| `supabase/functions/signal-ai/index.ts` | Accept insight profile + recent signals, credit check |
| `supabase/functions/journal-insights/index.ts` | New — extract and merge user insights |
| `supabase/functions/journal-ai/index.ts` | Credit check |
| `supabase/functions/cycle-ai/index.ts` | Credit check |
| `src/components/journal/JournalEntries.tsx` | Call journal-insights after analysis |
| `src/pages/Membership.tsx` | Add credit info and top-up option |
| `src/hooks/useAICredits.ts` | New — fetch/display credit balance |
| `src/index.css` | Listening animation keyframes (pulsing dots, ripple) |
| Database migration | 4 new tables |

---

## Implementation order

1. Database migration (all tables at once)
2. Signal panel ritual UI (Phase 1) — immediate visual impact
3. Journal insights edge function + client wiring (Phase 2)
4. Signal memory save/load (Phase 3)
5. AI credits system + membership updates (Phase 4)

