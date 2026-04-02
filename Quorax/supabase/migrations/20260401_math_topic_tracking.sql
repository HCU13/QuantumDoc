-- Math topic tracking: math_solutions tablosuna konu kolonları ekle

ALTER TABLE math_solutions
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS topic_category TEXT;

-- İndeks: kullanıcı bazında konu sorguları için
CREATE INDEX IF NOT EXISTS idx_math_solutions_user_topic
  ON math_solutions(user_id, topic_category)
  WHERE topic_category IS NOT NULL;

-- View: kullanıcı konu istatistikleri (edge function'da kullanılacak)
CREATE OR REPLACE VIEW math_topic_stats AS
SELECT
  user_id,
  topic_category,
  topic,
  COUNT(*) AS solve_count,
  MAX(created_at) AS last_solved_at
FROM math_solutions
WHERE topic_category IS NOT NULL
GROUP BY user_id, topic_category, topic
ORDER BY solve_count DESC;
