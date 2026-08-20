select cron.schedule(
  'auto-fetch-yandex-tripcom-daily-04',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pnpuhewfoxssmbpryart.supabase.co/functions/v1/auto-fetch-reviews?platforms=yandex,tripcom',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucHVoZXdmb3hzc21icHJ5YXJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MTE0NywiZXhwIjoyMDc5ODI3MTQ3fQ.YxIkXjLxpZ-9p1CyzLfmFZW7XwHvPb6dfqfdMs4CCWE'
    ),
    body := jsonb_build_object('triggered_at', now())
  ) AS request_id;
  $$
);