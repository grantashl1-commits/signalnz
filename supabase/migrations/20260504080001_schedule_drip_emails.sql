-- Schedule drip-emails edge function to run daily at 8am NZST (20:00 UTC)
SELECT cron.schedule(
  'daily-drip-emails',
  '0 20 * * *',
  $$SELECT net.http_post(
    url := 'https://hwcgbcfqxzzhvivcdroh.supabase.co/functions/v1/drip-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );$$
);
