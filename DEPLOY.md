# Deploying Signal

## Build & upload to Metaname

```bash
npm run build
```
Then FTP/upload the entire `dist/` folder contents to your Metaname `public_html`.
The `.htaccess` file in `dist/` handles HTTPS redirect, SPA routing, and security headers automatically.

## Supabase edge functions

```bash
supabase functions deploy send-email
supabase functions deploy drip-emails
supabase functions deploy daily-signal-push
supabase functions deploy resend-webhook
supabase functions deploy community-moderate
supabase functions deploy signal-ai
supabase functions deploy journal-insights
supabase functions deploy tts-generate
```

## Required secrets (set once via Supabase dashboard or CLI)

```bash
# Generate a random secret for cron jobs — any long random string works
supabase secrets set CRON_SECRET=<generate a random 32-char string>

# Resend webhook signing secret (from resend.com → Settings → Webhooks)
supabase secrets set RESEND_WEBHOOK_SECRET=whsec_xxxxx
```

After setting CRON_SECRET, update the pg_cron setting in Supabase SQL editor:
```sql
ALTER DATABASE postgres SET "app.settings.cron_secret" = '<your CRON_SECRET value>';
```

## Environment variables (.env — never commit this file)

```
VITE_SUPABASE_URL=https://hwcgbcfqxzzhvivcdroh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=hwcgbcfqxzzhvivcdroh
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
VITE_SENTRY_DSN=https://...@sentry.io/...
```
