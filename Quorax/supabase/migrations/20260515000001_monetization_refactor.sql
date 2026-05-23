-- ============================================================================
-- QUORAX MONETIZATION REFACTOR (2026-05-15)
-- Strategy: Anonymous auth + 2 LIFETIME free math solves + Apple 3-day trial
-- ============================================================================

-- 1. check_daily_usage_limit -> TOTAL/LIFETIME count for free users.
--    The CURRENT_DATE filter is removed for free users so that the limit acts
--    as a hard lifetime ceiling, not a daily reset.
--    NAMING NOTE: the function name and the subscription_plans.daily_*_limit
--    columns keep the historical "daily" prefix to avoid a breaking rename
--    across 3 clients + 3 edge functions. They are LIFETIME totals, not daily.
--    Do not reintroduce a CURRENT_DATE filter expecting a daily reset.
CREATE OR REPLACE FUNCTION public.check_daily_usage_limit(p_user_id uuid, p_module_id text)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  v_subscription_type TEXT;
  v_plan_limit        INTEGER;
  v_usage_count       INTEGER;
  v_is_premium        BOOLEAN;
BEGIN
  SELECT subscription_type INTO v_subscription_type
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
    AND subscription_status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW());

  IF v_subscription_type IS NULL THEN
    v_subscription_type := 'free';
  END IF;

  v_is_premium := (v_subscription_type <> 'free');

  IF v_is_premium THEN
    RETURN jsonb_build_object(
      'allowed', TRUE, 'limit', 999999, 'used', 0,
      'remaining', 999999, 'subscription_type', v_subscription_type
    );
  END IF;

  IF p_module_id = 'chat' THEN
    SELECT daily_chat_limit INTO v_plan_limit
    FROM public.subscription_plans WHERE plan_id = 'free' AND is_active = TRUE;
  ELSIF p_module_id = 'math' THEN
    SELECT daily_math_limit INTO v_plan_limit
    FROM public.subscription_plans WHERE plan_id = 'free' AND is_active = TRUE;
  ELSIF p_module_id = 'exam_lab' THEN
    SELECT daily_exam_limit INTO v_plan_limit
    FROM public.subscription_plans WHERE plan_id = 'free' AND is_active = TRUE;
  ELSE
    RETURN jsonb_build_object('allowed', TRUE, 'limit', 999999, 'used', 0,
      'remaining', 999999, 'subscription_type', v_subscription_type);
  END IF;

  SELECT COUNT(*) INTO v_usage_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id AND module_id = p_module_id;

  RETURN jsonb_build_object(
    'allowed',           v_usage_count < v_plan_limit,
    'limit',             v_plan_limit,
    'used',              v_usage_count,
    'remaining',         GREATEST(0, v_plan_limit - v_usage_count),
    'subscription_type', v_subscription_type
  );
END;
$function$;

-- 2. Free-plan limits: 2 math, 1 exam, 3 chat (lifetime totals)
UPDATE public.subscription_plans
SET daily_math_limit = 2,
    daily_exam_limit = 1,
    daily_chat_limit = 3,
    updated_at = NOW()
WHERE plan_id = 'free';

-- 3. handle_new_user -> anon-safe (NEW.email may be NULL for anonymous users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_full_name TEXT;
  v_email TEXT;
  v_is_anon BOOLEAN;
BEGIN
  v_is_anon := COALESCE(NEW.is_anonymous, FALSE);
  v_email := NEW.email;

  IF v_is_anon OR v_email IS NULL THEN
    v_full_name := 'Guest';
  ELSE
    v_full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(v_email, '@', 1)
    );
  END IF;

  INSERT INTO public.profiles (id, full_name, email, email_verified)
  VALUES (NEW.id, v_full_name, v_email,
          COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_subscriptions (user_id, subscription_type, subscription_status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 4. Drop dead columns
ALTER TABLE public.profiles       DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE public.profiles       DROP COLUMN IF EXISTS phone;
ALTER TABLE public.math_solutions DROP COLUMN IF EXISTS problem_type;
ALTER TABLE public.math_solutions DROP COLUMN IF EXISTS difficulty_level;
ALTER TABLE public.messages       DROP COLUMN IF EXISTS metadata;
ALTER TABLE public.chats          DROP COLUMN IF EXISTS is_archived;

-- 5. Drop dead RPCs
DROP FUNCTION IF EXISTS public.update_user_tokens(uuid, integer, text, text, uuid, text);
DROP FUNCTION IF EXISTS public.get_news_localized(text, text);
DROP FUNCTION IF EXISTS public.get_faq_localized(text);
DROP FUNCTION IF EXISTS public.reset_daily_stats();
DROP FUNCTION IF EXISTS public.cleanup_old_analytics();
DROP FUNCTION IF EXISTS public.cleanup_orphaned_activities();

-- 6. Remove broken cron job (writes to non-existent user_daily_stats)
DO $$
DECLARE j_id integer;
BEGIN
  FOR j_id IN SELECT jobid FROM cron.job WHERE jobname = 'reset-daily-stats-turkey'
  LOOP PERFORM cron.unschedule(j_id); END LOOP;
END $$;
DROP FUNCTION IF EXISTS public.reset_daily_stats_turkey();

-- 7. Subscription expiry sweep: defined and scheduled in
--    20260424_subscription_expiry_sweep.sql (that version also resets
--    subscription_type to 'free' and sets search_path). Not redefined here so
--    this refactor doesn't regress it.
