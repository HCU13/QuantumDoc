# 🚀 Supabase Edge Functions

Bu klasörde QuantumDoc'un Supabase Edge Functions'ları bulunur.

## 📋 Mevcut Functions

### 1. **chat-with-claude**
Claude AI ile sohbet eder.
- **Model:** Claude 3.5 Sonnet
- **Token Maliyeti:** 2 token/mesaj
- **Features:** Konuşma geçmişi, context-aware

### 2. **solve-math-problem**
Matematik problemlerini çözer.
- **Model:** GPT-4o (resim) / GPT-4o-mini (metin)
- **Token Maliyeti:** 4 token (resim) / 2 token (metin)
- **Features:** Adım adım çözüm, resim analizi

## 🛠️ Kurulum

### 1. Supabase CLI Kur
```bash
npm install -g supabase
```

### 2. Supabase'e Login
```bash
supabase login
```

### 3. Projeye Bağlan
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Environment Variables Ayarla
```bash
# Claude AI Key
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# OpenAI Key
supabase secrets set OPENAI_API_KEY=sk-xxxxx
```

### 5. Functions'ları Deploy Et
```bash
# Tüm functions
supabase functions deploy

# Tek tek
supabase functions deploy chat-with-claude
supabase functions deploy solve-math-problem
```

## 🧪 Test Et

### Chat Function Test:
```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/chat-with-claude' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "Merhaba!",
    "chatId": "uuid-here",
    "userId": "uuid-here"
  }'
```

### Math Function Test:
```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/solve-math-problem' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "problemText": "2x + 5 = 15",
    "userId": "uuid-here"
  }'
```

## 📊 Log'ları İzle
```bash
supabase functions logs chat-with-claude
supabase functions logs solve-math-problem
```

## 🔑 API Keys Nereden Alınır?

### Claude (Anthropic):
1. https://console.anthropic.com
2. API Keys bölümü
3. Create Key
4. Credits yükle ($5 başlangıç yeterli)

### OpenAI:
1. https://platform.openai.com
2. API Keys bölümü
3. Create new secret key
4. Credits yükle ($10 başlangıç yeterli)

## 💰 Maliyet Tahmini

**Chat (Claude):**
- ~$0.003 / mesaj
- 1000 mesaj = ~$3

**Math Solver (OpenAI):**
- Metin: ~$0.001 / problem
- Resim: ~$0.01 / problem
- 1000 problem = ~$1-10

## 🐛 Sorun Giderme

**"Function not found" hatası:**
```bash
supabase functions deploy --no-verify-jwt
```

**"API key not configured" hatası:**
```bash
supabase secrets list
supabase secrets set YOUR_KEY=value
```

**CORS hatası:**
Functions'larda CORS headers zaten var, app.json'da scheme kontrol et.

## 📝 Notlar

- Functions Deno runtime kullanır
- TypeScript destekler
- Edge'de çalışır (hızlı)
- Otomatik scale olur
- 50,000 ücretsiz request/ay

---

✅ Functions hazır! Deploy edip test edebilirsin.

