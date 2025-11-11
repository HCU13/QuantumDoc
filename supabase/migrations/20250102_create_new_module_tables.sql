-- 📝 TEXT_EDITOR_RESULTS TABLE
-- Text Editor modülü sonuçlarını saklar

CREATE TABLE IF NOT EXISTS public.text_editor_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Input ve sonuç
  input_text TEXT NOT NULL,
  result_text TEXT NOT NULL,
  
  -- Mod ve ek bilgiler
  mode TEXT NOT NULL, -- 'fix', 'summarize', 'email', 'tone', 'length'
  email_to TEXT, -- Email modu için alıcı
  email_subject TEXT, -- Email modu için konu
  email_tone TEXT, -- Email modu için stil ('professional', 'casual', 'formal', 'friendly')
  
  -- Teknik bilgiler
  tokens_used INTEGER DEFAULT 0,
  ai_model TEXT,
  processing_time INTEGER, -- Milisaniye
  is_bookmarked BOOLEAN DEFAULT FALSE,
  
  -- Metadata (ekstra bilgiler için)
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS text_editor_results_user_id_idx ON public.text_editor_results(user_id);
CREATE INDEX IF NOT EXISTS text_editor_results_mode_idx ON public.text_editor_results(mode);
CREATE INDEX IF NOT EXISTS text_editor_results_created_at_idx ON public.text_editor_results(created_at DESC);
CREATE INDEX IF NOT EXISTS text_editor_results_user_created_idx ON public.text_editor_results(user_id, created_at DESC);

-- 🔒 RLS (Row Level Security) Policies
ALTER TABLE public.text_editor_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own text editor results"
  ON public.text_editor_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own text editor results"
  ON public.text_editor_results
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own text editor results"
  ON public.text_editor_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.text_editor_results IS 'Text Editor modülü işlem sonuçlarını saklar';

-- 🖼️ IMAGE_ANALYSES TABLE
-- Image Analyzer modülü analiz sonuçlarını saklar

CREATE TABLE IF NOT EXISTS public.image_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Görsel ve sonuç
  image_url TEXT NOT NULL, -- Supabase Storage'dan URL veya base64
  analysis_result TEXT NOT NULL,
  
  -- Input yöntemi
  input_method TEXT NOT NULL DEFAULT 'gallery', -- 'gallery' veya 'camera'
  
  -- Teknik bilgiler
  tokens_used INTEGER DEFAULT 0,
  ai_model TEXT,
  processing_time INTEGER, -- Milisaniye
  is_bookmarked BOOLEAN DEFAULT FALSE,
  
  -- Metadata (ekstra bilgiler için)
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS image_analyses_user_id_idx ON public.image_analyses(user_id);
CREATE INDEX IF NOT EXISTS image_analyses_input_method_idx ON public.image_analyses(input_method);
CREATE INDEX IF NOT EXISTS image_analyses_created_at_idx ON public.image_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS image_analyses_user_created_idx ON public.image_analyses(user_id, created_at DESC);

-- 🔒 RLS (Row Level Security) Policies
ALTER TABLE public.image_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own image analyses"
  ON public.image_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own image analyses"
  ON public.image_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own image analyses"
  ON public.image_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.image_analyses IS 'Image Analyzer modülü görsel analiz sonuçlarını saklar';

-- 📋 GENERATED_NOTES TABLE
-- Note Generator modülü oluşturulan notları saklar

CREATE TABLE IF NOT EXISTS public.generated_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Input ve sonuç
  input_text TEXT NOT NULL,
  generated_note TEXT NOT NULL,
  
  -- Mod
  mode TEXT NOT NULL, -- 'quick', 'meeting', 'summary', 'todo'
  
  -- Teknik bilgiler
  tokens_used INTEGER DEFAULT 0,
  ai_model TEXT,
  processing_time INTEGER, -- Milisaniye
  is_bookmarked BOOLEAN DEFAULT FALSE,
  
  -- Metadata (ekstra bilgiler için)
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS generated_notes_user_id_idx ON public.generated_notes(user_id);
CREATE INDEX IF NOT EXISTS generated_notes_mode_idx ON public.generated_notes(mode);
CREATE INDEX IF NOT EXISTS generated_notes_created_at_idx ON public.generated_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS generated_notes_user_created_idx ON public.generated_notes(user_id, created_at DESC);

-- 🔒 RLS (Row Level Security) Policies
ALTER TABLE public.generated_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated notes"
  ON public.generated_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated notes"
  ON public.generated_notes
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated notes"
  ON public.generated_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.generated_notes IS 'Note Generator modülü oluşturulan notları saklar';

