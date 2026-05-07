-- Promo codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 7,
  max_uses INTEGER, -- NULL = unlimited
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User promo redemptions table
CREATE TABLE IF NOT EXISTS public.user_promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  premium_until TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, promo_code_id) -- one redemption per user per code
);

-- RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promo_redemptions ENABLE ROW LEVEL SECURITY;

-- promo_codes: only service role can insert/update, authenticated can read active codes (needed for validation)
CREATE POLICY "Service role full access on promo_codes"
  ON public.promo_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- user_promo_redemptions: users can read their own redemptions
CREATE POLICY "Users can read own redemptions"
  ON public.user_promo_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on redemptions"
  ON public.user_promo_redemptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert the PRODUCTHUNT promo code
INSERT INTO public.promo_codes (code, description, duration_days, max_uses, expires_at)
VALUES (
  'PRODUCTHUNT',
  'Product Hunt launch — 3 days free premium',
  3,
  500,
  '2026-05-11 23:59:59+00'
);
