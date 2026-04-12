SELECT cron.schedule(
  'rewrite-feed-posts-v2',
  '*/2 * * * *',
  $$SELECT net.http_post(
    url := 'https://hwcgbcfqxzzhvivcdroh.supabase.co/functions/v1/rewrite-feed-posts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{"batch_size": 10, "mode": "quality_fix"}'::jsonb
  );$$
);