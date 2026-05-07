-- Rating prompt tracking — profiles tablosuna ekle
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS rating_prompt_shown     BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rating_prompt_shown_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rating_choice           TEXT      CHECK (rating_choice IN ('yes', 'no', 'skip')),
  ADD COLUMN IF NOT EXISTS rating_choice_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS app_session_count       INTEGER   DEFAULT 0;

COMMENT ON COLUMN profiles.rating_prompt_shown    IS 'Kullanıcıya rating prompt gösterildi mi (bir kez gösterildikten sonra true)';
COMMENT ON COLUMN profiles.rating_prompt_shown_at IS 'Rating prompt ilk gösterilme zamanı';
COMMENT ON COLUMN profiles.rating_choice          IS 'yes=App Store''a yönlendirildim, no=feedback gönderdi, skip=şimdi değil';
COMMENT ON COLUMN profiles.rating_choice_at       IS 'Kullanıcının seçim yaptığı zaman';
COMMENT ON COLUMN profiles.app_session_count      IS 'Toplam uygulama açılış sayısı';
