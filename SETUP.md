# Signal — Resend + Stripe Email Setup Checklist

> Work through this top to bottom. Each section has a status checkbox.

---

## ANSWERS TO YOUR QUESTIONS

### Do you need Price IDs in Lovable/Supabase secrets?
**No.** Price IDs live in the frontend code only (`src/pages/Membership.tsx`). The stripe webhook uses **Product IDs** (already hardcoded in the edge function). Supabase secrets only need:
- `STRIPE_SECRET_KEY` ✅ already set
- `STRIPE_WEBHOOK_SECRET` ✅ already set
- `RESEND_API_KEY` ✅ you've added this

### Do you need separate webhooks per product?
**No.** One webhook endpoint handles everything. Stripe sends all events to a single URL — your handler code filters by product ID. You just need to make sure all the event *types* you care about are ticked on that one webhook.

### How does the email system work — does it need a CRON?
**No CRONs needed for emails.** Every email is triggered by a Stripe event hitting your webhook. There is no polling or scheduled sending. The only optional CRON (described at the bottom) is a safety-net daily credit reset — not required for launch.

### What SQL checks that emails are connected?
The email templates live in Edge Function code, not the database — so there's nothing in SQL to "connect." The SQL queries below are for **verifying the system is working** end-to-end (webhook firing, credits updating, profiles returning names).

---

## SECTION 1 — Stripe Webhook

### 1.1 Confirm these events are ticked on your webhook endpoint
Go to: **Stripe Dashboard → Developers → Webhooks → [your endpoint] → Edit**

Tick all of these (some may already be on):
- [ ] `checkout.session.completed`
- [ ] `invoice.payment_succeeded`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`

Your webhook URL should be:
```
https://hwcgbcfqxzzhvivcdroh.supabase.co/functions/v1/stripe-webhook
```

### 1.2 Add your Annual plan Product IDs to the webhook handler
The webhook currently maps only the monthly Signal plans. Your annual plans are separate Stripe products with different product IDs.

**Get the annual product IDs from Stripe:**
1. Stripe Dashboard → Product Catalog
2. Click **Signal — Rooted (Annual)** → copy the Product ID (starts `prod_`)
3. Repeat for Nourished (Annual) and Thriving (Annual)

**Then update `supabase/functions/stripe-webhook/index.ts`:**
Find `PRODUCT_TIER_MAP` and add the annual products alongside the monthly ones:
```typescript
const PRODUCT_TIER_MAP: Record<string, { tier: string; credits: number }> = {
  // Monthly plans (existing)
  "prod_UDBbsFCvpYtvUN": { tier: "rooted",    credits: 30  },
  "prod_U9Pqh2vkb2wrNR": { tier: "nourished", credits: 150 },
  "prod_U9Pr8k3iP6Bler": { tier: "thriving",  credits: 500 },
  // Annual plans — paste your actual product IDs here:
  "prod_REPLACE_ROOTED_ANNUAL":    { tier: "rooted",    credits: 30  },
  "prod_REPLACE_NOURISHED_ANNUAL": { tier: "nourished", credits: 150 },
  "prod_REPLACE_THRIVING_ANNUAL":  { tier: "thriving",  credits: 500 },
};
```

### 1.3 Update the annual Price IDs in the frontend
`src/pages/Membership.tsx` — line ~18 — replace the placeholder annual price IDs with real ones:
```typescript
const STRIPE_TIERS = {
  rooted: {
    priceId: "price_1TElEOEAvaJHDMD4nbJ489js",   // monthly ✅
    productId: "prod_UDBbsFCvpYtvUN",
    annualPriceId: "price_REPLACE_WITH_REAL_ANNUAL_ROOTED",  // ← fix this
  },
  nourished: {
    priceId: "price_1TB71HEAvaJHDMD49yoKtzpf",  // monthly ✅
    productId: "prod_U9Pqh2vkb2wrNR",
    annualPriceId: "price_REPLACE_WITH_REAL_ANNUAL_NOURISHED", // ← fix this
  },
  thriving: {
    priceId: "price_1TB71pEAvaJHDMD4gkBPg6Vt",  // monthly ✅
    productId: "prod_U9Pr8k3iP6Bler",
    annualPriceId: "price_REPLACE_WITH_REAL_ANNUAL_THRIVING",  // ← fix this
  },
  ...
};
```
To get Price IDs: Stripe Dashboard → Product → click the price row → copy the `price_xxx` ID.

---

## SECTION 2 — Resend

### 2.1 Verify DNS is live
- [ ] Log into resend.com → Domains → `mindcast.co.nz` → status should be **Verified**
- [ ] SPF, DKIM, and DMARC records all show green ticks

### 2.2 Confirm sender address
Emails send from: `Signal <support@mindcast.co.nz>`
This is hardcoded in `supabase/functions/send-email/index.ts` — no change needed.

### 2.3 Verify RESEND_API_KEY is set
- [ ] Supabase Dashboard → Project Settings → Edge Functions → Environment Variables
- [ ] `RESEND_API_KEY` should be listed ✅ (you confirmed this)

---

## SECTION 3 — Deploy Edge Functions

Run these in your terminal from the project root:

```bash
supabase functions deploy send-email
supabase functions deploy stripe-webhook
```

Or deploy all at once:
```bash
supabase functions deploy
```

- [ ] `send-email` deployed
- [ ] `stripe-webhook` deployed (updated version with 4 event types)

---

## SECTION 4 — Beta Tester Coupon Distribution

You've created 5 coupons per tier (Rooted/Nourished/Thriving), numbered (1)–(5). Each coupon is 100% off forever, max 1 redemption.

**How beta testers use them:**
1. Send the beta tester their unique coupon code (e.g. `Beta — Thriving 100% Off (1)`)
2. They go to `signal.mindcast.co.nz/membership`
3. They click Subscribe on their tier
4. In the Stripe checkout, they'll see a **"Add promotion code"** field → they enter their code
5. Checkout completes at $0 (no card required for 100% off)
6. Webhook fires → their tier is set in the database → **subscription confirmed email is sent automatically**

**Track which codes have been used:**
Stripe Dashboard → Product Catalog → Coupons → the Redemptions column shows 0 or 1

**One code per person** — each numbered coupon can only be redeemed once.

**Suggested distribution table:**

| Beta Tester | Tier | Code to Send |
|-------------|------|-------------|
| Tester 1 | Rooted | Beta — Rooted 100% Off (1) |
| Tester 2 | Rooted | Beta — Rooted 100% Off (2) |
| Tester 3 | Nourished | Beta — Nourished 100% Off (1) |
| Tester 4 | Thriving | Beta — Thriving 100% Off (1) |
| etc. | | |

---

## SECTION 5 — SQL Verification Queries

Run these in **Supabase Dashboard → SQL Editor** to verify the system is working.

### 5.1 Check ai_credits table is receiving webhook data
```sql
SELECT
  user_identifier,
  tier,
  credits_remaining,
  updated_at
FROM ai_credits
ORDER BY updated_at DESC
LIMIT 20;
```
After a test checkout, you should see a new row appear here within seconds.

### 5.2 Check profiles are storing display names (used in email greetings)
```sql
SELECT
  p.user_id,
  p.display_name,
  u.email,
  u.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 20;
```
If `display_name` is null for users, email greetings will skip the name gracefully.

### 5.3 Manually trigger a test welcome email
Run this in the SQL Editor — replace the email with yours:
```sql
SELECT
  net.http_post(
    url := 'https://hwcgbcfqxzzhvivcdroh.supabase.co/functions/v1/send-email',
    headers := '{"Content-Type": "application/json", "apikey": "' ||
      current_setting('app.settings.anon_key', true) || '"}'::jsonb,
    body := '{"type": "welcome", "to": "your@email.com", "name": "Test"}'::jsonb
  );
```

**Or test via curl** (easier — run in terminal):
```bash
curl -X POST https://hwcgbcfqxzzhvivcdroh.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{"type": "welcome", "to": "your@email.com", "name": "Test"}'
```
Your anon key is in `src/integrations/supabase/client.ts`.

### 5.4 Check Edge Function logs (not SQL — use Supabase Dashboard)
Supabase Dashboard → Edge Functions → `send-email` → Logs
Look for: `[SEND-EMAIL] Sent welcome to your@email.com`

---

## SECTION 6 — Optional CRON (Safety Net Credit Reset)

> **You don't need this for emails to work.** All emails are triggered by Stripe webhooks in real time. This CRON is only a safety net in case a renewal webhook is missed.

If you want to add it, run this in the SQL Editor:

### Enable pg_cron (one-time setup)
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Daily credit reset safety net
This fires at 2 AM NZT (13:00 UTC) daily. It resets credits for any subscription-tier users whose credits have dropped below 0 (shouldn't normally happen, but a safety net):
```sql
SELECT cron.schedule(
  'daily-credit-safety-net',
  '0 13 * * *',
  $$
    UPDATE ai_credits
    SET credits_remaining = CASE
      WHEN tier = 'rooted'    THEN 30
      WHEN tier = 'nourished' THEN 150
      WHEN tier = 'thriving'  THEN 500
      ELSE credits_remaining
    END,
    updated_at = now()
    WHERE tier != 'free'
    AND credits_remaining < 0;
  $$
);
```

**To remove it later:**
```sql
SELECT cron.unschedule('daily-credit-safety-net');
```

**To list all scheduled jobs:**
```sql
SELECT * FROM cron.job;
```

---

## SECTION 7 — Email Types Reference

| Trigger | Email Subject | When It Fires |
|---------|--------------|---------------|
| New account signup | "Welcome to Signal — you're in ✨" | Within 3 min of account creation (AuthContext) |
| Subscription purchased | "Your Signal [Tier] plan is live 🎉" | checkout.session.completed (mode=subscription) |
| Credit top-up | "50 Signal credits added ⚡" | checkout.session.completed (mode=payment) |
| Monthly renewal | "Your Signal [Tier] plan has renewed" | invoice.payment_succeeded |
| Plan upgrade/downgrade | "You've upgraded to Signal [Tier] 🚀" | customer.subscription.updated |
| Subscription cancelled | "Your Signal subscription has been cancelled" | customer.subscription.deleted |

All emails send from `Signal <support@mindcast.co.nz>` via Resend.

---

## SECTION 8 — Final Checklist

- [ ] **Stripe webhook events** — all 4 event types ticked (Section 1.1)
- [ ] **Annual product IDs** — added to `PRODUCT_TIER_MAP` in stripe-webhook (Section 1.2)
- [ ] **Annual price IDs** — updated in `Membership.tsx` (Section 1.3)
- [ ] **Resend DNS** — `mindcast.co.nz` verified green in Resend dashboard (Section 2.1)
- [ ] **RESEND_API_KEY** — set in Supabase secrets ✅ (already done)
- [ ] **Edge functions deployed** — `send-email` and `stripe-webhook` (Section 3)
- [ ] **Test welcome email** — sent successfully via curl/SQL (Section 5.3)
- [ ] **Test checkout** — complete a $0 checkout with a beta coupon, verify confirmation email arrives
- [ ] **Check ai_credits** — row appears after test checkout (Section 5.1)
- [ ] **Beta coupons distributed** — one unique code per tester (Section 4)

---

## NOT NEEDED

- ❌ Price IDs in Supabase secrets — they live in `Membership.tsx` frontend code only
- ❌ Separate webhooks per product — one endpoint handles all Stripe products
- ❌ CRONs for email sending — all emails are real-time webhook triggered
- ❌ Email template database table — templates are in Edge Function code (`supabase/functions/send-email/templates.ts`)
