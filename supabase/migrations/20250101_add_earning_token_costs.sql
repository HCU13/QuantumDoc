-- Add earning reward token costs to module_token_costs table
-- These are earning rewards, not module costs, but stored in the same table for consistency

INSERT INTO public.module_token_costs (module_id, token_cost, display_label, is_active)
VALUES
  ('daily_login', 1, '1 token/günlük giriş', true),
  ('ad_reward', 2, '2 token/reklam', true),
  ('streak_7', 15, '15 token/7 günlük seri', true),
  ('feedback', 5, '5 token/geri bildirim', true)
ON CONFLICT (module_id) DO UPDATE
SET 
  token_cost = EXCLUDED.token_cost,
  display_label = EXCLUDED.display_label,
  updated_at = NOW();

