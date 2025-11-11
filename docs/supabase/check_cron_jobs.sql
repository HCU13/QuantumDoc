-- 📋 CRON JOB KONTROL SORGULARI
-- Supabase SQL Editor'de çalıştırarak cron job'ları kontrol edebilirsiniz

-- 1. Tüm aktif cron job'ları listele
SELECT 
  jobid,
  schedule,
  command,
  jobname,
  active,
  database,
  username
FROM cron.job
ORDER BY jobid;

-- 2. Sadece daily stats reset job'ını göster
SELECT 
  jobid,
  schedule,
  command,
  jobname,
  active,
  database
FROM cron.job
WHERE jobname = 'reset-daily-stats-turkey' 
   OR command LIKE '%reset_daily_stats_turkey%';

-- 3. pg_cron extension'ının kurulu olduğunu kontrol et
SELECT 
  extname,
  extversion,
  nspname
FROM pg_extension 
WHERE extname = 'pg_cron';

-- 4. reset_daily_stats_turkey fonksiyonunu kontrol et
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'reset_daily_stats_turkey';

-- 5. Cron job'ı manuel olarak test et (çalıştır)
-- SELECT cron.run_job(<jobid>);

-- 6. Cron job'ı durdur (eğer gerekirse)
-- SELECT cron.unschedule('reset-daily-stats-turkey');

-- 7. Cron job'ı tekrar aktif et (eğer durdurulduysa)
-- UPDATE cron.job SET active = true WHERE jobname = 'reset-daily-stats-turkey';

