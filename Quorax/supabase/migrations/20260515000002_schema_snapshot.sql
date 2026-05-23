-- ============================================================================
-- QUORAX SCHEMA SNAPSHOT (2026-05-15)
-- Single source of truth for tables, triggers, functions.
-- Note: This is a SNAPSHOT for documentation. RLS policies and
--       indexes are tracked in separate migrations.
-- ============================================================================

-- TABLES

CREATE TABLE IF NOT EXISTS public.chats (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL, last_message text, last_message_at timestamp with time zone, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), color text NOT NULL DEFAULT '#8B5CF6'::text);

CREATE TABLE IF NOT EXISTS public.exam_results (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, topic text, total_questions integer DEFAULT 0, correct_count integer DEFAULT 0, report jsonb DEFAULT '[]'::jsonb, created_at timestamp with time zone DEFAULT now());

CREATE TABLE IF NOT EXISTS public.math_solutions (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, problem_text text, problem_image_url text, solution_text text, ai_model text, created_at timestamp with time zone DEFAULT now(), topic text, topic_category text, comprehension_feedback text, step_explanations jsonb NOT NULL DEFAULT '{}'::jsonb, related_questions text[] NOT NULL DEFAULT '{}'::text[]);

CREATE TABLE IF NOT EXISTS public.math_topic_stats (user_id uuid, topic_category text, topic text, solve_count bigint, last_solved_at timestamp with time zone);

CREATE TABLE IF NOT EXISTS public.messages (id uuid NOT NULL DEFAULT gen_random_uuid(), chat_id uuid NOT NULL, user_id uuid NOT NULL, content text NOT NULL, sender_type text NOT NULL DEFAULT 'user'::text, message_type text NOT NULL DEFAULT 'text'::text, created_at timestamp with time zone DEFAULT now());

CREATE TABLE IF NOT EXISTS public.password_reset_otps (email text NOT NULL, otp text NOT NULL, expires_at timestamp with time zone NOT NULL, used boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.profiles (id uuid NOT NULL, full_name text, display_name text, email text, email_verified boolean DEFAULT false, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), push_token text, push_token_updated_at timestamp with time zone, rating_prompt_shown boolean DEFAULT false, rating_prompt_shown_at timestamp with time zone, rating_choice text, rating_choice_at timestamp with time zone, app_session_count integer DEFAULT 0);

CREATE TABLE IF NOT EXISTS public.promo_codes (id uuid NOT NULL DEFAULT gen_random_uuid(), code text NOT NULL, description text, duration_days integer NOT NULL DEFAULT 7, max_uses integer, uses_count integer NOT NULL DEFAULT 0, expires_at timestamp with time zone, is_active boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.purchases (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, product_id text, product_name text, product_type text, transaction_id text NOT NULL, amount numeric, currency text DEFAULT 'USD'::text, payment_method text, payment_provider text, store text, purchased_at timestamp with time zone, completed_at timestamp with time zone, status text DEFAULT 'completed'::text, is_sandbox boolean DEFAULT false, metadata jsonb DEFAULT '{}'::jsonb, created_at timestamp with time zone DEFAULT now(), subscription_period text, period_type text, expires_at timestamp with time zone, is_renewal boolean DEFAULT false);

CREATE TABLE IF NOT EXISTS public.subscription_plans (id uuid NOT NULL DEFAULT gen_random_uuid(), plan_id text NOT NULL, name text NOT NULL, description text, price numeric DEFAULT 0, currency text DEFAULT 'USD'::text, billing_period text DEFAULT 'monthly'::text, daily_chat_limit integer DEFAULT 5, daily_math_limit integer DEFAULT 5, daily_exam_limit integer DEFAULT 3, features jsonb DEFAULT '[]'::jsonb, is_active boolean DEFAULT true, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

CREATE TABLE IF NOT EXISTS public.support_tickets (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, subject text NOT NULL, message text NOT NULL, category text, priority text DEFAULT 'normal'::text, status text DEFAULT 'open'::text, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

CREATE TABLE IF NOT EXISTS public.topic_mastery (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, exam_type_id text NOT NULL, subject_id text, subject_label text, topic text NOT NULL, total_attempts integer NOT NULL DEFAULT 0, correct_count integer NOT NULL DEFAULT 0, last_attempted timestamp with time zone, mastery_level text NOT NULL DEFAULT 'learning'::text, created_at timestamp with time zone NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.usage_tracking (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, module_id text NOT NULL, operation_type text NOT NULL, input_tokens integer DEFAULT 0, output_tokens integer DEFAULT 0, total_tokens integer DEFAULT 0, metadata jsonb DEFAULT '{}'::jsonb, created_at timestamp with time zone DEFAULT now());

CREATE TABLE IF NOT EXISTS public.user_activities (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, activity_type text NOT NULL, title text, description text, metadata jsonb DEFAULT '{}'::jsonb, created_at timestamp with time zone DEFAULT now());

CREATE TABLE IF NOT EXISTS public.user_promo_redemptions (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, promo_code_id uuid NOT NULL, redeemed_at timestamp with time zone NOT NULL DEFAULT now(), premium_until timestamp with time zone NOT NULL);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, subscription_type text NOT NULL DEFAULT 'free'::text, subscription_status text NOT NULL DEFAULT 'active'::text, started_at timestamp with time zone DEFAULT now(), expires_at timestamp with time zone, cancelled_at timestamp with time zone, trial_ends_at timestamp with time zone, entitlement_id text, product_id text, metadata jsonb DEFAULT '{}'::jsonb, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

CREATE TABLE IF NOT EXISTS public.wrong_questions (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, exam_type_id text NOT NULL, subject_id text, subject_label text, topic text NOT NULL, question_text text NOT NULL, options jsonb NOT NULL, correct_answer text NOT NULL, user_answer text, explanation text, is_mastered boolean NOT NULL DEFAULT false, attempt_count integer NOT NULL DEFAULT 1, last_wrong_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now());

-- FUNCTIONS

-- NOTE: check_daily_usage_limit is intentionally NOT defined here. Its
-- canonical definition (LIFETIME counting for free users) lives in
-- 20260515000001_monetization_refactor.sql, which runs BEFORE this file
-- by version order. Redefining it here would overwrite the refactor with the
-- old daily-reset behaviour. Keep it out of this snapshot.

CREATE OR REPLACE FUNCTION public.cleanup_chat_related_activities()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Chat ile ilgili user_activities kayıtlarını sil
  DELETE FROM user_activities 
  WHERE metadata->>'chat_id' = OLD.id::text;
  
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_chat_related_activities()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Chat ile ilgili user_activities kayıtlarını sil
  DELETE FROM user_activities 
  WHERE metadata->>'chat_id' = OLD.id::text;
  
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  calling_user_id uuid;
BEGIN
  -- Get the currently authenticated user
  calling_user_id := auth.uid();

  IF calling_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user data from profiles table (cascade will handle related tables)
  DELETE FROM profiles WHERE id = calling_user_id;

  -- Delete the auth user (this will sign them out everywhere)
  DELETE FROM auth.users WHERE id = calling_user_id;
END;
$function$;

-- NOTE: handle_new_user is intentionally NOT defined here. Its canonical
-- definition lives in 20260515000001_monetization_refactor.sql (identical
-- body). Kept in one place to avoid a redundant overwrite.

CREATE OR REPLACE FUNCTION public.log_usage(p_user_id uuid, p_module_id text, p_operation_type text, p_input_tokens integer DEFAULT 0, p_output_tokens integer DEFAULT 0, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_usage_id UUID;
BEGIN
  INSERT INTO public.usage_tracking (
    user_id, module_id, operation_type,
    input_tokens, output_tokens, total_tokens, metadata
  )
  VALUES (
    p_user_id, p_module_id, p_operation_type,
    p_input_tokens, p_output_tokens,
    p_input_tokens + p_output_tokens,
    p_metadata
  )
  RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$function$;

-- NOTE: sweep_expired_subscriptions is intentionally NOT defined here. Its
-- canonical definition lives in 20260424_subscription_expiry_sweep.sql (it also
-- resets subscription_type to 'free' and sets search_path). Redefining the
-- older variant here would silently overwrite it.

CREATE OR REPLACE FUNCTION public.update_module_token_costs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_daily_stats_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.upsert_exam_results(p_user_id uuid, p_exam_type_id text, p_subject_id text, p_subject_label text, p_topic text, p_questions jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  q         JSONB;
  total     INT := 0;
  correct   INT := 0;
  pct       NUMERIC;
  m_level   TEXT;
BEGIN
  -- Her soruyu işle
  FOR q IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    total := total + 1;

    IF (q->>'correct')::BOOLEAN THEN
      correct := correct + 1;
    ELSE
      -- Yanlış soru: hata defterine ekle veya attempt_count artır
      INSERT INTO wrong_questions(
        user_id, exam_type_id, subject_id, subject_label,
        topic, question_text, options, correct_answer, user_answer,
        attempt_count, last_wrong_at
      )
      VALUES (
        p_user_id, p_exam_type_id, p_subject_id, p_subject_label,
        p_topic,
        q->>'question',
        q->'options',
        q->>'correctAnswer',
        q->>'userAnswer',
        1,
        now()
      )
      ON CONFLICT (user_id, exam_type_id, question_text)
      DO UPDATE SET
        attempt_count  = wrong_questions.attempt_count + 1,
        last_wrong_at  = now(),
        is_mastered    = FALSE,  -- tekrar yanlışsa mastered sıfırla
        user_answer    = EXCLUDED.user_answer;
    END IF;
  END LOOP;

  -- Hakimiyet seviyesini hesapla
  pct := CASE WHEN total > 0 THEN (correct::NUMERIC / total) * 100 ELSE 0 END;
  m_level := CASE
    WHEN total < 5 OR pct < 40  THEN 'learning'
    WHEN pct < 60               THEN 'developing'
    WHEN pct < 80               THEN 'proficient'
    ELSE                             'mastered'
  END;

  -- topic_mastery upsert
  INSERT INTO topic_mastery(
    user_id, exam_type_id, subject_id, subject_label,
    topic, total_attempts, correct_count, last_attempted, mastery_level
  )
  VALUES (
    p_user_id, p_exam_type_id, p_subject_id, p_subject_label,
    p_topic, total, correct, now(), m_level
  )
  ON CONFLICT (user_id, exam_type_id, topic)
  DO UPDATE SET
    total_attempts = topic_mastery.total_attempts + total,
    correct_count  = topic_mastery.correct_count  + correct,
    last_attempted = now(),
    mastery_level  = CASE
      WHEN (topic_mastery.total_attempts + total) < 5
        OR ((topic_mastery.correct_count + correct)::NUMERIC / (topic_mastery.total_attempts + total)) * 100 < 40
        THEN 'learning'
      WHEN ((topic_mastery.correct_count + correct)::NUMERIC / (topic_mastery.total_attempts + total)) * 100 < 60
        THEN 'developing'
      WHEN ((topic_mastery.correct_count + correct)::NUMERIC / (topic_mastery.total_attempts + total)) * 100 < 80
        THEN 'proficient'
      ELSE 'mastered'
    END;
END;
$function$;

