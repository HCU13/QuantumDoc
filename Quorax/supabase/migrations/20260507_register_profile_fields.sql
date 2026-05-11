-- Register flow için profil alanları
-- 2026-05-07: Multi-step register akışında toplanacak yeni alanlar.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS grade_level TEXT,
  ADD COLUMN IF NOT EXISTS exam_target TEXT,
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Beklenen değer kümeleri (zorunlu değil, doğrulama uygulama tarafında):
--   grade_level    : 'middle' | 'high_9' | 'high_10' | 'high_11' | 'high_12' | 'university' | 'other'
--   exam_target    : 'lgs' | 'yks' | 'kpss' | 'none' | 'other'
--   referral_source: 'app_store' | 'social' | 'friend' | 'search' | 'ad' | 'other'

CREATE INDEX IF NOT EXISTS idx_profiles_grade_level   ON profiles(grade_level);
CREATE INDEX IF NOT EXISTS idx_profiles_exam_target   ON profiles(exam_target);
