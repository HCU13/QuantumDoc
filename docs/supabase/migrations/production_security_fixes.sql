-- =====================================================
-- PRODUCTION SECURITY FIXES
-- =====================================================
-- Bu migration production'a atmadan önce ÇALIŞTIRILMkiste gerekir!
--
-- Düzeltilen sorunlar:
-- 1. messages tablosunda RLS eksikliği
-- 2. Function search_path güvenlik açığı
-- =====================================================

-- 1. messages tablosunda RLS'i etkinleştir
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Function search_path düzeltmeleri (SQL injection koruması)

-- delete_chat_related_activities
ALTER FUNCTION IF EXISTS public.delete_chat_related_activities() 
SET search_path = public, pg_temp;

-- cleanup_chat_related_activities
ALTER FUNCTION IF EXISTS public.cleanup_chat_related_activities() 
SET search_path = public, pg_temp;

-- cleanup_orphaned_activities
ALTER FUNCTION IF EXISTS public.cleanup_orphaned_activities() 
SET search_path = public, pg_temp;

-- get_news_localized
ALTER FUNCTION IF EXISTS public.get_news_localized(user_lang text) 
SET search_path = public, pg_temp;

-- handle_new_user
ALTER FUNCTION IF EXISTS public.handle_new_user() 
SET search_path = public, pg_temp;

-- get_faq_localized
ALTER FUNCTION IF EXISTS public.get_faq_localized(user_lang text) 
SET search_path = public, pg_temp;

-- handle_updated_at
ALTER FUNCTION IF EXISTS public.handle_updated_at() 
SET search_path = public, pg_temp;

-- cleanup_old_analytics
ALTER FUNCTION IF EXISTS public.cleanup_old_analytics() 
SET search_path = public, pg_temp;

-- update_user_tokens
ALTER FUNCTION IF EXISTS public.update_user_tokens(user_uuid uuid, token_change integer) 
SET search_path = public, pg_temp;

-- =====================================================
-- DOĞRULAMA
-- =====================================================

-- messages tablosu RLS kontrolü
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'messages' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'ERROR: messages tablosunda RLS etkinleştirilemedi!';
    ELSE
        RAISE NOTICE '✅ messages tablosu RLS aktif';
    END IF;
END $$;

RAISE NOTICE '✅ Production security fixes uygulandı!';
RAISE NOTICE 'ℹ️  Supabase Dashboard''dan manuel olarak yapılması gerekenler:';
RAISE NOTICE '   1. Authentication > Email Settings > OTP Expiry: 1 saate düşür';
RAISE NOTICE '   2. Authentication > Password Settings > Leaked Password Protection: Aktif et';
RAISE NOTICE '   3. Project Settings > Database > Postgres sürümünü güncelle';

