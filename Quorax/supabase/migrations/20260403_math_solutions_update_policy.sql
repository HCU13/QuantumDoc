-- math_solutions tablosuna UPDATE RLS policy ekle
-- Kullanıcının kendi çözümlerine comprehension_feedback yazabilmesi için gerekli

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'math_solutions'
      AND policyname = 'Users can update own math solutions'
  ) THEN
    CREATE POLICY "Users can update own math solutions"
      ON math_solutions
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
