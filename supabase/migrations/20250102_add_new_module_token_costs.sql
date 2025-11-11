-- Add token costs for new modules (textEditor, imageAnalyzer, noteGenerator, calculator)
-- All modules now have fixed token costs (no ranges)

INSERT INTO public.module_token_costs (module_id, token_cost, display_label, is_active)
VALUES
  -- Calculator - Ücretsiz
  ('calculator', 0, 'Ücretsiz', true),
  
  -- Text Editor - Sabit 3 token
  ('textEditor', 3, '3 token/işlem', true),
  
  -- Image Analyzer - Sabit 6 token
  ('imageAnalyzer', 6, '6 token/analiz', true),
  
  -- Note Generator - Sabit 4 token
  ('noteGenerator', 4, '4 token/not', true)
ON CONFLICT (module_id) DO UPDATE
SET 
  token_cost = EXCLUDED.token_cost,
  display_label = EXCLUDED.display_label,
  updated_at = NOW();

