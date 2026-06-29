DO $$
DECLARE
  existing_command text;
  ota_command text;
  booking_command text;
BEGIN
  SELECT command INTO existing_command
  FROM cron.job
  WHERE jobname = 'auto-fetch-apify-only-daily-06'
  LIMIT 1;

  IF existing_command IS NULL THEN
    RAISE NOTICE 'auto-fetch-apify-only-daily-06 job not found; skipping Booking cron split';
    RETURN;
  END IF;

  ota_command := replace(
    existing_command,
    'platforms=booking,tripadvisor,hotelscom,expedia,trustpilot',
    'platforms=tripadvisor,hotelscom,expedia,trustpilot'
  );

  booking_command := replace(
    existing_command,
    'platforms=booking,tripadvisor,hotelscom,expedia,trustpilot',
    'platforms=booking'
  );

  PERFORM cron.unschedule('auto-fetch-apify-only-daily-06');
  PERFORM cron.schedule('auto-fetch-apify-only-daily-06', '0 6 * * *', ota_command);

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-fetch-booking-daily-03') THEN
    PERFORM cron.unschedule('auto-fetch-booking-daily-03');
  END IF;

  PERFORM cron.schedule('auto-fetch-booking-daily-03', '0 3 * * *', booking_command);
END $$;