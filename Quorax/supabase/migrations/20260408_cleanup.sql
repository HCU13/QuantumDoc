-- Temizlik: tokens_used kolonu math_solutions'tan kaldır
-- Gerçek token verisi log_usage RPC ile ayrı tabloya gidiyor, bu kolon hep 0'dı.
ALTER TABLE math_solutions DROP COLUMN IF EXISTS tokens_used;

-- purchases tablosuna eksik kolonları ekle (eğer yoksa)
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS subscription_period TEXT,
  ADD COLUMN IF NOT EXISTS period_type TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;

-- purchases tablosuna RLS ekle (henüz yoksa)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'purchases' AND policyname = 'Users can view own purchases'
  ) THEN
    CREATE POLICY "Users can view own purchases"
      ON purchases FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- İndeks: kullanıcı bazında satın alım geçmişi sorguları
CREATE INDEX IF NOT EXISTS idx_purchases_user_purchased_at
  ON purchases(user_id, purchased_at DESC);
