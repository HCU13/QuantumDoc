-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Türkiye saati 03:00'da günlük istatistikleri sıfırla
-- Türkiye saati UTC+3 olduğu için UTC 00:00'da çalışır
-- Ama daha iyi bir çözüm: timezone-aware reset function

-- Önce reset fonksiyonunu güncelle (Türkiye saatine göre)
-- Basitleştirilmiş versiyon: Yeni gün 03:00'da başlar
CREATE OR REPLACE FUNCTION public.reset_daily_stats_turkey()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  turkey_time_now TIMESTAMP WITH TIME ZONE;
  turkey_date DATE;
BEGIN
  -- Türkiye saatini al (Europe/Istanbul timezone)
  turkey_time_now := NOW() AT TIME ZONE 'Europe/Istanbul';
  turkey_date := turkey_time_now::DATE;
  
  -- Yeni gün 03:00'da başlar - eğer saat 03:00'dan önceyse, dünün tarihini kullan
  IF EXTRACT(HOUR FROM turkey_time_now) < 3 THEN
    turkey_date := turkey_date - INTERVAL '1 day';
  END IF;
  
  -- Eski günlerin kayıtlarını sıfırla ve stats_date'i bugüne güncelle
  -- Bu sayede her kullanıcı için bugünün kaydı oluşturulur veya güncellenir
  UPDATE public.user_daily_stats
  SET 
    ads_watched = 0,
    daily_login_claimed = FALSE,
    stats_date = turkey_date,
    last_reset_at = NOW(),
    updated_at = NOW()
  WHERE stats_date < turkey_date;
END;
$$;

-- Cron job: Her gün Türkiye saati 03:00'da çalışsın
-- Cron formatı: "dakika saat gün ay haftanın-günü"
-- Format: '0 0 * * *' = Her gün UTC 00:00'da (Türkiye saati 03:00)
-- 
-- Açıklama:
--   - İlk 0: Dakika (00. dakika)
--   - İkinci 0: Saat (00. saat = gece yarısı UTC)
--   - *: Her gün
--   - *: Her ay
--   - *: Haftanın her günü
SELECT cron.schedule(
  'reset-daily-stats-turkey',
  '0 0 * * *',  -- Her gün UTC 00:00'da (Türkiye saati 03:00)
  $$SELECT public.reset_daily_stats_turkey();$$
);

COMMENT ON FUNCTION public.reset_daily_stats_turkey() IS 'Türkiye saati 03:00da günlük istatistikleri sıfırlar. Her gün otomatik olarak çalışır.';

