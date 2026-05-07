-- ═══════════════════════════════════════════════════════════════════
-- Exam Lab: Hata Defteri + Konu Hakimiyeti
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. WRONG QUESTIONS (Hata Defteri) ──────────────────────────────
-- Kullanıcının yanlış yaptığı sorular otomatik kaydedilir.
-- Tekrar çalışma modunda bu sorular flashcard olarak gösterilir.
CREATE TABLE IF NOT EXISTS wrong_questions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type_id  TEXT        NOT NULL,   -- "yks-tyt", "sat", "general" vb.
  subject_id    TEXT,                   -- "turkce", "temel-mat" — boş olabilir
  subject_label TEXT,                   -- "Türkçe", "Temel Matematik" — display için
  topic         TEXT        NOT NULL,   -- Kullanıcının girdiği konu / exam label
  question_text TEXT        NOT NULL,
  options       JSONB       NOT NULL,   -- [{label:"A", text:"..."}, ...]
  correct_answer TEXT       NOT NULL,
  user_answer   TEXT,                   -- İlk seferdeki yanlış cevap
  explanation   TEXT,                   -- AI açıklaması (sonradan eklenebilir)
  is_mastered   BOOLEAN     NOT NULL DEFAULT FALSE,  -- Kullanıcı "Öğrendim" işaretledi mi
  attempt_count INT         NOT NULL DEFAULT 1,       -- Kaç kez yanlış yapıldı
  last_wrong_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aynı soru tekrar yanlış yapılırsa attempt_count artır, tekrar ekleme
CREATE UNIQUE INDEX IF NOT EXISTS idx_wrong_questions_unique
  ON wrong_questions(user_id, exam_type_id, question_text);

-- Hızlı sorgular için
CREATE INDEX IF NOT EXISTS idx_wrong_questions_user_exam
  ON wrong_questions(user_id, exam_type_id, is_mastered, last_wrong_at DESC);

CREATE INDEX IF NOT EXISTS idx_wrong_questions_user_subject
  ON wrong_questions(user_id, subject_id) WHERE subject_id IS NOT NULL;

-- RLS
ALTER TABLE wrong_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wrong questions"
  ON wrong_questions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. TOPIC MASTERY (Konu Hakimiyeti) ─────────────────────────────
-- Her (kullanıcı, sınav, konu) kombinasyonu için istatistik tutulur.
-- Hakimiyet seviyesi otomatik hesaplanır.
CREATE TABLE IF NOT EXISTS topic_mastery (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type_id    TEXT        NOT NULL,
  subject_id      TEXT,                  -- boş olabilir (serbest konu girişi)
  subject_label   TEXT,
  topic           TEXT        NOT NULL,  -- Konu adı / exam label
  total_attempts  INT         NOT NULL DEFAULT 0,
  correct_count   INT         NOT NULL DEFAULT 0,
  last_attempted  TIMESTAMPTZ,
  -- mastery_level: 'learning' | 'developing' | 'proficient' | 'mastered'
  -- learning:    < 40%  veya < 5 soru
  -- developing:  40-59%
  -- proficient:  60-79%
  -- mastered:    >= 80% ve >= 10 soru
  mastery_level   TEXT        NOT NULL DEFAULT 'learning',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exam_type_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_exam
  ON topic_mastery(user_id, exam_type_id, mastery_level);

ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own topic mastery"
  ON topic_mastery FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. UPSERT FUNCTION: Sınav bitince toplu kayıt ─────────────────
-- exam-lab'dan tek RPC çağrısıyla hem hata defteri hem hakimiyet güncellenir.
CREATE OR REPLACE FUNCTION upsert_exam_results(
  p_user_id       UUID,
  p_exam_type_id  TEXT,
  p_subject_id    TEXT,
  p_subject_label TEXT,
  p_topic         TEXT,
  p_questions     JSONB  -- [{question, options, correctAnswer, userAnswer, correct}]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
