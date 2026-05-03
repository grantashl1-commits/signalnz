-- Schedule drip-emails edge function to run daily at 8am NZST (20:00 UTC)
-- x-cron-secret is pulled from Supabase Vault (vault.create_secret was run manually)
SELECT cron.schedule(
  'daily-drip-emails',
  '0 20 * * *',
  $$SELECT net.http_post(
    url := 'https://hwcgbcfqxzzhvivcdroh.supabase.co/functions/v1/drip-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1)
    ),
    body := '{}'::jsonb
  );$$
);
