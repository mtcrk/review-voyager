-- ACİL: Apify cron'larını tamamen kaldır. Smart skip doğrulandıktan sonra tekrar oluşturulacak.
SELECT cron.unschedule('auto-fetch-reviews-morning-all');
SELECT cron.unschedule('auto-fetch-reviews-evening-no-ta');