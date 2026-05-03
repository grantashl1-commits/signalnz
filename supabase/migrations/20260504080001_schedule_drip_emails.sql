-- Schedule drip-emails edge function to run daily at 8am NZST (20:00 UTC)
-- x-cron-secret header matches the CRON_SECRET edge function secret
SELECT cron.schedule(
  'daily-drip-emails',
  '0 20 * * *',
  $$SELECT net.http_post(
    url := 'https://hwcgbcfqxzzhvivcdroh.supabase.co/functions/v1/drip-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := '{}'::jsonb
  );$$
);
