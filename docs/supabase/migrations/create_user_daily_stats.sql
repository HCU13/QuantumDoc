-- 📊 USER_DAILY_STATS TABLE
-- Günlük ve haftalık ödül limitlerini takip eder
-- Her gün gece yarısında otomatik sıfırlanır

CREATE TABLE IF NOT EXISTS public.user_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Günlük istatistikler
  ads_watched INTEGER DEFAULT 0, -- Bugün izlenen reklam sayısı (max 5)
  daily_login_claimed BOOLEAN DEFAULT FALSE, -- Günlük giriş ödülü alındı mı
  
  -- Haftalık istatistikler
  login_streak INTEGER DEFAULT 0, -- Günlük seri (üst üste giriş)
  last_login_date DATE, -- Son giriş tarihi
  
  -- Takip
  stats_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Bu istatistiklerin ait olduğu tarih
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Son sıfırlama zamanı
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Her kullanıcı için her gün sadece bir kayıt
  UNIQUE(user_id, stats_date)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS user_daily_stats_user_id_idx ON public.user_daily_stats(user_id);
CREATE INDEX IF NOT EXISTS user_daily_stats_stats_date_idx ON public.user_daily_stats(stats_date);
CREATE INDEX IF NOT EXISTS user_daily_stats_user_date_idx ON public.user_daily_stats(user_id, stats_date DESC);

-- Updated_at trigger
CREATE TRIGGER handle_user_daily_stats_updated_at
  BEFORE UPDATE ON public.user_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 🔒 RLS (Row Level Security) Policies
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi istatistiklerini görebilir
CREATE POLICY "Users can view own daily stats"
  ON public.user_daily_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi istatistiklerini güncelleyebilir
CREATE POLICY "Users can update own daily stats"
  ON public.user_daily_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi istatistiklerini ekleyebilir
CREATE POLICY "Users can insert own daily stats"
  ON public.user_daily_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ⏰ Otomatik sıfırlama fonksiyonu
-- Her gün gece yarısında çalışacak (cron job ile)
CREATE OR REPLACE FUNCTION public.reset_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Bugünün tarihinden farklı olan kayıtları sil (eski kayıtlar)
  -- veya stats_date'i bugüne güncelle ve sıfırla
  UPDATE public.user_daily_stats
  SET 
    ads_watched = 0,
    daily_login_claimed = FALSE,
    stats_date = CURRENT_DATE,
    last_reset_at = NOW(),
    updated_at = NOW()
  WHERE stats_date < CURRENT_DATE;
  
  -- Bugün için kayıt yoksa oluştur (opsiyonel - app tarafında da yapılabilir)
  -- Bu fonksiyon sadece eski kayıtları sıfırlar
END;
$$;

-- 📝 Açıklama
COMMENT ON TABLE public.user_daily_stats IS 'Kullanıcıların günlük ve haftalık ödül istatistiklerini takip eder. Her gün gece yarısında otomatik sıfırlanır.';
COMMENT ON COLUMN public.user_daily_stats.ads_watched IS 'Bugün izlenen reklam sayısı (maksimum 5)';
COMMENT ON COLUMN public.user_daily_stats.daily_login_claimed IS 'Bugün günlük giriş ödülü alındı mı';
COMMENT ON COLUMN public.user_daily_stats.login_streak IS 'Üst üste giriş yapılan gün sayısı';
COMMENT ON COLUMN public.user_daily_stats.stats_date IS 'Bu istatistiklerin ait olduğu tarih (CURRENT_DATE)';

