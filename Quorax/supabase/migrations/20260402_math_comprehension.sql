-- Kullanıcının çözümü anlayıp anlamadığını takip et
ALTER TABLE math_solutions
  ADD COLUMN IF NOT EXISTS comprehension_feedback TEXT; -- 'understood' | 'not_understood' | null
