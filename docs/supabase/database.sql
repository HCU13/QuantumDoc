-- 🗄️ QuantumDoc Database Schema
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- 👤 PROFILES TABLE - User profilleri
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  tokens INTEGER DEFAULT 50,
  subscription_type TEXT DEFAULT 'free', -- 'free', 'premium'
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  language_preference TEXT DEFAULT 'tr',
  theme_preference TEXT DEFAULT 'auto', -- 'light', 'dark', 'auto'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 CHATS TABLE - Sohbet odaları
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Yeni Sohbet',
  description TEXT,
  icon TEXT DEFAULT 'chatbubble-ellipses',
  color TEXT DEFAULT '#6C63FF',
  is_archived BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📨 MESSAGES TABLE - Sohbet mesajları
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'math', 'system'
  sender_type TEXT DEFAULT 'user', -- 'user', 'assistant'
  metadata JSONB, -- Ek bilgiler (AI model, tokens used, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📰 NEWS TABLE - Haberler ve duyurular
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  icon TEXT DEFAULT 'newspaper',
  category TEXT DEFAULT 'general', -- 'update', 'campaign', 'feature', 'general'
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  action_url TEXT,
  action_text TEXT,
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎫 SUPPORT_TICKETS TABLE - Destek talepleri
CREATE TABLE support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'open', -- 'open', 'pending', 'resolved', 'closed'
  category TEXT DEFAULT 'general', -- 'general', 'technical', 'billing', 'feature'
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ❓ FAQ TABLE - Sık sorulan sorular
CREATE TABLE faq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'tokens', 'subscription', 'features', 'account'
  is_popular BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🪙 TOKEN_TRANSACTIONS TABLE - Token işlemleri
CREATE TABLE token_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Pozitif: kazanım, Negatif: harcama
  transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'reward', 'refund'
  description TEXT,
  reference_id UUID, -- Chat ID, Math solution ID, etc.
  reference_type TEXT, -- 'chat', 'math', 'translate', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🧮 MATH_SOLUTIONS TABLE - Matematik çözümleri
CREATE TABLE math_solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_text TEXT,
  problem_image_url TEXT,
  solution_text TEXT NOT NULL,
  solution_steps JSONB, -- Adım adım çözüm
  problem_type TEXT, -- 'algebra', 'geometry', 'calculus', etc.
  difficulty_level TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  tokens_used INTEGER DEFAULT 0,
  ai_model TEXT, -- Hangi AI model kullanıldı
  processing_time INTEGER, -- Milisaniye
  is_bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 USER_ACTIVITIES TABLE - Kullanıcı aktiviteleri
CREATE TABLE user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'chat', 'math', 'news_read', 'login', etc.
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔄 ROW LEVEL SECURITY (RLS) Policies

-- Profiles - Kullanıcılar sadece kendi profillerini görebilir/düzenleyebilir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Chats - Kullanıcılar sadece kendi sohbetlerini görebilir
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chats" ON chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON chats FOR DELETE USING (auth.uid() = user_id);

-- Messages - Kullanıcılar sadece kendi sohbet mesajlarını görebilir
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM chats WHERE chats.id = chat_id AND chats.user_id = auth.uid())
);

-- News - Herkes aktif haberleri görebilir
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active news" ON news FOR SELECT USING (is_active = true);

-- Support Tickets - Kullanıcılar sadece kendi taleplerini görebilir
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- FAQ - Herkes görebilir
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view FAQ" ON faq FOR SELECT USING (true);

-- Token Transactions - Kullanıcılar sadece kendi işlemlerini görebilir
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON token_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON token_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Math Solutions - Kullanıcılar sadece kendi çözümlerini görebilir
ALTER TABLE math_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own solutions" ON math_solutions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own solutions" ON math_solutions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own solutions" ON math_solutions FOR UPDATE USING (auth.uid() = user_id);

-- User Activities - Kullanıcılar sadece kendi aktivitelerini görebilir
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 🚀 FUNCTIONS & TRIGGERS

-- Profile oluşturma fonksiyonu - User register olduğunda otomatik profile oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: User oluşturulduğunda profile oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Updated_at güncellemesi için genel fonksiyon
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger'ları
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Token güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.update_user_tokens(user_id UUID, amount INTEGER, transaction_type TEXT, description TEXT DEFAULT NULL, reference_id UUID DEFAULT NULL, reference_type TEXT DEFAULT NULL)
RETURNS TABLE(new_balance INTEGER) AS $$
DECLARE
  current_tokens INTEGER;
  new_tokens INTEGER;
BEGIN
  -- Mevcut token sayısını al
  SELECT tokens INTO current_tokens FROM profiles WHERE id = user_id;
  
  -- Yeni token sayısını hesapla
  new_tokens := current_tokens + amount;
  
  -- Negatif token kontrolü
  IF new_tokens < 0 THEN
    RAISE EXCEPTION 'Insufficient tokens. Current: %, Required: %', current_tokens, ABS(amount);
  END IF;
  
  -- Profildeki token sayısını güncelle
  UPDATE profiles SET tokens = new_tokens WHERE id = user_id;
  
  -- Token transaction kaydı oluştur
  INSERT INTO token_transactions (user_id, amount, transaction_type, description, reference_id, reference_type)
  VALUES (user_id, amount, transaction_type, description, reference_id, reference_type);
  
  RETURN QUERY SELECT new_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 📊 ÖRNEK VERİLER (Development için)

-- FAQ verileri
INSERT INTO faq (question, answer, category, is_popular, order_index) VALUES
('Token'larımı nasıl kullanabilirim?', 'Token'larınızı chat, matematik çözücü, çeviri ve diğer AI özelliklerinde kullanabilirsiniz. Her işlem belirli miktarda token gerektirir.', 'tokens', true, 1),
('Premium üyeliğe nasıl geçebilirim?', 'Profil sayfanızdan "Abonelik" bölümüne giderek Premium planını seçebilirsiniz. Ödeme işlemi güvenli bir şekilde gerçekleştirilir.', 'subscription', true, 2),
('Matematik çözücü nasıl çalışır?', 'Matematik çözücü, yazdığınız veya fotoğrafını çektiğiniz matematik problemlerini AI teknolojisi ile çözer. Desteklenen konular: cebir, geometri, kalkülüs.', 'features', true, 3),
('Çeviri özelliği hangi dilleri destekler?', 'Çeviri özelliği 10 farklı dili destekler: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Portekizce, Rusça, Japonca ve Korece.', 'features', false, 4),
('Hesabımı nasıl silebilirim?', 'Hesabınızı silmek için Profil > Hesap Bilgileri > Hesabı Sil bölümüne gidin. Bu işlem geri alınamaz.', 'account', false, 5);

-- Sample news
INSERT INTO news (title, description, content, image_url, icon, category, is_featured, priority, action_url, action_text) VALUES
('Yeni AI Modeli', 'Daha hızlı ve akıllı yanıtlar için güncellenmiş AI modeli kullanıma sunuldu', 'QuantumDoc''un yeni AI modeli ile artık daha hızlı ve doğru yanıtlar alabilirsiniz. Bu güncelleme ile birlikte çeviri kalitesi %40 artırıldı ve matematik çözümleri %60 daha hızlı hale geldi.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop', 'sparkles', 'update', true, 1, null, null),
('Premium Kampanya', 'Sınırlı süre için %50 indirim! Premium özellikleri keşfedin', 'Premium üyeliğe geçerek sınırsız token kullanımı, öncelikli destek ve özel özelliklere erişim sağlayın. Bu kampanya sadece bu hafta geçerli!', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop', 'star', 'campaign', true, 2, '/subscription', 'Premium''a Geç'),
('Çoklu Dil Desteği', 'Artık 10 farklı dilde çeviri yapabilirsiniz', 'Yeni eklenen dil desteği ile artık 10 farklı dilde çeviri yapabilirsiniz. Desteklenen diller: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Portekizce, Rusça, Japonca ve Korece.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=200&fit=crop', 'language', 'feature', false, 3, null, null);

-- 📝 NOTLAR:
-- 1. Bu schema'yı Supabase Dashboard > SQL Editor'de çalıştırın
-- 2. RLS (Row Level Security) politikaları otomatik olarak uygulanacak
-- 3. Auth kullanıcıları için otomatik profile oluşturma aktif
-- 4. Token sistemi fonksiyonu kullanıma hazır
-- 5. Örnek veriler development için yüklenecek
