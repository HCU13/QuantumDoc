-- 📊 ANALYTICS & ERROR TRACKING TABLES
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- 📊 ANALYTICS_EVENTS TABLE - Kullanıcı davranış analizi
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'user_login', 'ai_chat_message', 'token_spend', vb.
  properties JSONB, -- Event özellikleri (device info, metadata, vb.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🐛 ERROR_LOGS TABLE - Hata takibi
CREATE TABLE error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  context JSONB, -- Device info, screen name, vb.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📈 İndeksler (performans için)
CREATE INDEX analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX analytics_events_created_at_idx ON analytics_events(created_at DESC);
CREATE INDEX error_logs_user_id_idx ON error_logs(user_id);
CREATE INDEX error_logs_severity_idx ON error_logs(severity);
CREATE INDEX error_logs_created_at_idx ON error_logs(created_at DESC);

-- 🔒 RLS (Row Level Security) Politikaları

-- Analytics Events - Kullanıcılar sadece kendi event'lerini görebilir
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Error Logs - Kullanıcılar sadece kendi hatalarını görebilir
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own errors" ON error_logs FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can insert errors" ON error_logs FOR INSERT WITH CHECK (true);

-- 🧹 Otomatik temizleme (90 gün sonra eski kayıtları sil)
-- Not: Supabase'de cron job veya Edge Function ile çalıştırılabilir
CREATE OR REPLACE FUNCTION cleanup_old_analytics() RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ✅ Tamamlandı!
-- Artık analytics ve error tracking sistemi kullanıma hazır

