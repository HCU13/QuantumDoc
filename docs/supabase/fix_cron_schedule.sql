-- 🔧 CRON SCHEDULE DÜZELTME SORGUSU
-- Eğer schedule yanlış görünüyorsa bu sorguyu çalıştır

-- Önce mevcut job'ı kontrol et
SELECT 
  jobid,
  schedule,
  command,
  jobname,
  active
FROM cron.job
WHERE jobname = 'reset-daily-stats-turkey';

-- Eğer schedule yanlışsa, job'ı sil ve yeniden oluştur
-- (İLK ÖNCE YUKARIDAKI SORGUDAN jobid'yi al)

-- Job'ı sil (jobid'yi yukarıdaki sorgudan alın)
-- SELECT cron.unschedule('reset-daily-stats-turkey');

-- Doğru format ile yeniden oluştur
-- Cron formatı: "dakika saat gün ay haftanın-günü"
-- '0 0 * * *' = Her gün UTC 00:00'da (Türkiye saati 03:00)
/*
SELECT cron.schedule(
  'reset-daily-stats-turkey',
  '0 0 * * *',  -- ⚠️ BOŞLUKLAR ÖNEMLİ! Format: "0 0 * * *"
  $$SELECT public.reset_daily_stats_turkey();$$
);
*/

-- Alternatif: Mevcut job'ı güncelle (eğer destekleniyorsa)
-- UPDATE cron.job 
-- SET schedule = '0 0 * * *'
-- WHERE jobname = 'reset-daily-stats-turkey';

