-- 📊 USER_STATISTICS TABLE
-- Kullanıcıların toplam istatistiklerini tutar (günlük giriş, haftalık seri, video izleme)

CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Toplam istatistikler
  total_daily_logins INTEGER DEFAULT 0, -- Toplam günlük giriş ödülü sayısı
  total_streak_7_completed INTEGER DEFAULT 0, -- Toplam 7 günlük seri tamamlanma sayısı
  total_videos_watched INTEGER DEFAULT 0, -- Toplam izlenen video/reklam sayısı
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS user_statistics_user_id_idx ON public.user_statistics(user_id);

-- Updated_at trigger
CREATE TRIGGER handle_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 🔒 RLS (Row Level Security) Policies
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi istatistiklerini görebilir
CREATE POLICY "Users can view own statistics"
  ON public.user_statistics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi istatistiklerini güncelleyebilir
CREATE POLICY "Users can update own statistics"
  ON public.user_statistics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi istatistiklerini ekleyebilir
CREATE POLICY "Users can insert own statistics"
  ON public.user_statistics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Mevcut kullanıcılar için istatistik kayıtları oluştur
INSERT INTO public.user_statistics (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 📝 Açıklama
COMMENT ON TABLE public.user_statistics IS 'Kullanıcıların toplam istatistiklerini tutar (günlük giriş, haftalık seri, video izleme)';
COMMENT ON COLUMN public.user_statistics.total_daily_logins IS 'Toplam günlük giriş ödülü alınma sayısı';
COMMENT ON COLUMN public.user_statistics.total_streak_7_completed IS 'Toplam 7 günlük seri tamamlanma sayısı';
COMMENT ON COLUMN public.user_statistics.total_videos_watched IS 'Toplam izlenen video/reklam sayısı';

