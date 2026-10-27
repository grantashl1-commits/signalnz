# Supabase secrets & manual membership

Two things live here: which secrets the app actually reads (audited against
`supabase/functions/**`), and how to give a member a paid tier before Stripe is set up.

Audited 2026-10-27 against commit on `main`. Every claim below is a `Deno.env.get()`
call site or the absence of one — re-grep before trusting this list:

```powershell
Select-String -Path supabase/functions/**/*.ts -Pattern 'Deno\.env\.get\("([A-Z_]+)"'
```

## Secret audit

### Dead — do not set

| Secret | Why |
| --- | --- |
| `RAPIDAPI_KEY` | No code reads it. `muscle-visualize` already carries the RapidAPI key in `MUSCLE_API_KEY` and sends it as `x-rapidapi-key`. |
| `HCAPTCHA_SECRET` | No captcha anywhere in the codebase. Nothing reads it. |
| `HCAPTCHA_SITE_KEY` | Same — no widget, no reader. |
| `GEMINI_API_KEY` | No edge function reads it. Only local art-generation scripts (`scripts/generate-reformer-art.mjs`, `generate-muscle-illustrations.js`, `handoff/*.mjs`). Belongs in local `.env.local`, **never** in Supabase secrets. |

### Auto-injected — do not set

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are provided to every
edge function by the Supabase runtime. Setting them by hand only risks pointing the
backend at the wrong project.

### Critical — the one that is *not* simply removable

`LOVABLE_API_KEY` is **not** obsolete. Seventeen edge functions call
`https://ai.gateway.lovable.dev` with it: `signal-ai`, `journal-ai`, `journal-insights`,
`cycle-ai`, `stoic-journal-ai`, `coach-ai`, `connect-reflect`, `give-signal-ai`,
`fridge-recipe`, `recipe-from-url`, `meal-plan-ai`, `community-moderate`,
`dream-image-generate`, `chore-illustration`, `generate-exercise-illustration`,
`rewrite-feed-posts`, `batch-illustrations`, `batch-animate`.

It is a Lovable-managed credential, so off Lovable it is the first thing that stops
working — and when it does, every AI feature falls over at once. It needs **replacing**
with a direct provider key, not deleting. `GEMINI_API_KEY` is the natural replacement;
`connect-ai` and `connect-reflect` already prefer `AI_GATEWAY_API_KEY` / `AI_GATEWAY_URL`
if those are set. The browser-side Lovable dependency (`@lovable.dev/cloud-auth-js`) is
already gone — OAuth now goes through Supabase natively in `src/integrations/lovable/index.ts`.

### Needed — billing (optional until Stripe exists)

| Secret | Used by | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `check-subscription`, `create-checkout`, `customer-portal`, `stripe-webhook`, `admin-stats` | **Optional.** Every one of these now degrades gracefully when it is absent. |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook` | Only once the webhook endpoint exists. |

### Needed — features that are live today

| Secret | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `send-email`, `drip-emails` | Welcome email fires from `AuthContext` on first signup. |
| `ELEVENLABS_API_KEY` | `tts-generate`, `tts-generate-inline`, `batch-tts`, `sleep-music` | All guided audio and sleep music. |
| `GOOGLE_MAPS_API_KEY` | `places-autocomplete` | Server-side suburb lookup. The **client** also needs `VITE_GOOGLE_MAPS_API_KEY` in Vercel (`NearbyView.tsx`) — that is a Vite var, not a Supabase secret. |
| `MUSCLE_API_KEY` | `muscle-visualize` | This *is* the RapidAPI key. |
| `CRON_SECRET` | `drip-emails`, `daily-signal-push` | Must match the Supabase **Vault** entry `cron_secret` — see the cron warning below. |

### Optional — only if the feature is switched on

| Secret | Used by |
| --- | --- |
| `RESEND_WEBHOOK_SECRET` | `resend-webhook` (delivery/bounce tracking) |
| `FCM_SERVICE_ACCOUNT` | `send-push` (Capacitor mobile push only) |

### Setting them

```powershell
supabase secrets set RESEND_API_KEY=re_xxx ELEVENLABS_API_KEY=xxx
supabase secrets set --env-file supabase/.env.secrets   # or bulk from a file
supabase secrets list
```

Client-side values go to **Vercel**, not Supabase: `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_SENTRY_DSN`,
`VITE_PUBLIC_POSTHOG_PROJECT_TOKEN`.

> **Fixed by `20261027000002_fix_cron_project_ref.sql`:** `20260412061029_...sql` and
> `20260504080001_schedule_drip_emails.sql` scheduled cron jobs against
> `hwcgbcfqxzzhvivcdroh.supabase.co`, but this project is
> `uinooijckvltyuggecuh.supabase.co` (see `.env` and `supabase/.temp/linked-project.json`).
> Those jobs were calling a project that is not ours, so drip emails never sent. The fix
> unschedules both and reschedules drip emails against the correct ref; `rewrite-feed-posts`
> is intentionally left unscheduled (it needs an admin bearer token the cron never sent).

## Manual membership tiers

Tier gating reads `subscription.tier` from `AuthContext`, which asks the
`check-subscription` edge function. That function resolves a tier in this order:

1. **`public.membership_grants`** — a manual/complimentary grant. Wins outright and
   needs no Stripe account, key, product or price.
2. **Stripe** — only if `STRIPE_SECRET_KEY` is set and an active subscription exists.
3. **`free`** — the fallback, returned instead of an error.

### Granting a tier

From the Supabase SQL editor:

```sql
-- Full access, no expiry
select public.grant_membership('someone@example.com', 'thriving');

-- With a note and an expiry (useful for trials)
select public.grant_membership(
  'someone@example.com', 'nourished',
  'Beta tester — 3 months', now() + interval '3 months'
);

-- Remove it, back to free
select public.revoke_membership('someone@example.com');
```

Tiers are `rooted`, `nourished`, `thriving`. Grants are keyed by lowercased email, so
they can be created **before** that person signs up — the
`on_signup_apply_membership_grant` trigger applies it the moment they register.

Equivalently, from the dashboard you can insert straight into `membership_grants`
(`email`, `tier`, and optionally `note` / `expires_at`), but the function is preferred
because it also syncs AI credits:

| Tier | AI credits on grant |
| --- | --- |
| `rooted` | 30 |
| `nourished` | 150 |
| `thriving` | 500 |
| revoked | 5 (free) |

### Why members cannot promote themselves

`membership_grants` has RLS enabled with exactly one policy — a member may
`SELECT` their own row (matched against the signed `auth.jwt() ->> 'email'` claim).
There is deliberately **no** `INSERT`/`UPDATE`/`DELETE` policy for `authenticated`,
and `grant_membership` / `revoke_membership` / `active_membership_grant` are
`REVOKE`d from `PUBLIC`, `anon` and `authenticated`. Writes happen only through the
SQL editor or the service role.

`profiles` was **not** used for this on purpose: its RLS lets members update their own
row, so a `tier` column there would be self-grantable.

### When a grant expires

`check-subscription` filters on `expires_at > now()`, so an expired grant simply stops
matching and the member falls back to free. Nothing cleans up the row; delete it with
`revoke_membership` when you are done.
