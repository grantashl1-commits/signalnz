-- Fix scheduled jobs that point at the wrong Supabase project.
--
-- 20260412061029_*.sql and 20260504080001_schedule_drip_emails.sql both created
-- cron jobs targeting hwcgbcfqxzzhvivcdroh.supabase.co. This project is
-- uinooijckvltyuggecuh (see .env and supabase/.temp/linked-project.json), so those
-- jobs have been posting to a host that isn't ours. Nothing they were meant to
-- trigger has ever actually run.

-- Drop the stale jobs first. Selecting by jobid makes this a no-op when a job is
-- already gone, whereas cron.unschedule(jobname) raises on an unknown name.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname IN ('rewrite-feed-posts-v2', 'daily-drip-emails');

-- Drip emails — daily at 20:00 UTC (08:00 NZST), now against the real project.
-- The bearer secret must match the edge-function secret CRON_SECRET; both sides
-- read the Supabase Vault entry named 'cron_secret'.
SELECT cron.schedule(
  'daily-drip-emails',
  '0 20 * * *',
  $$SELECT net.http_post(
    url := 'https://uinooijckvltyuggecuh.supabase.co/functions/v1/drip-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1)
    ),
    body := '{}'::jsonb
  );$$
);

-- rewrite-feed-posts is deliberately NOT rescheduled.
--
-- It was a one-off content rewrite that fired every 2 minutes, it calls
-- requireAdmin() which the original job never satisfied (it passed
-- current_setting('app.settings.service_role_key'), which is unset, so the header
-- was literally "Bearer "), and it depends on LOVABLE_API_KEY. Re-scheduling it
-- as-is would just resume a failing loop on a paid AI gateway.
--
-- To run it by hand, with a valid admin bearer token:
--   POST /functions/v1/rewrite-feed-posts
--   {"batch_size": 10, "mode": "quality_fix"}
