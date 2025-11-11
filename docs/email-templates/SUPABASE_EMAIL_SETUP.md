# 📧 SUPABASE EMAIL SYSTEM SETUP

Unified guide for all QuantumDoc email configuration.

## 🎯 Complete Email Setup Guide

### 1. **Supabase Dashboard'a Git**
- **Authentication** → **Email Templates** bölümüne git

### 2. **"Confirm signup" Template'ini Seç**
- **Templates** listesinden **"Confirm signup"** 'ı seç

### 3. **Template'i OTP İçin Güncelle**

#### 📝 **Subject (Konu) Alanı:**
```
QuantumDoc - Doğrulama Kodu: {{ .Token }}
```

#### 📄 **HTML Template:**
`docs/email-templates/otp-email-template.html` dosyasındaki içeriği kopyala ve yapıştır.

#### ✉️ **Plain Text Template:**
```
QuantumDoc - Email Doğrulama

Merhaba,

QuantumDoc hesabınızı doğrulamak için aşağıdaki kodu kullanın:

DOĞRULAMA KODU: {{ .Token }}

Bu kod 10 dakika geçerlidir.

Nasıl kullanılır:
1. QuantumDoc uygulamasını açın
2. Email doğrulama sayfasında 6 haneli kodu girin
3. Hesabınız otomatik olarak aktifleşecek

⚠️ Bu kodu kimseyle paylaşmayın.

Eğer bu hesabı siz oluşturmadıysanız, bu email'i silebilirsiniz.

QuantumDoc Team
```

### 4. **Important Notes**
- Template'de `{{ .ConfirmationURL }}` yerine `{{ .Token }}` kullan
- Link'leri kaldır, sadece 6 haneli kod kalsın

### 5. **General Email Settings**

#### 🔧 **Authentication > Settings:**
- **Enable email confirmations**: ✅ Aktif
- **Enable email change confirmations**: ✅ Aktif  
- **Secure email change**: ✅ Aktif

#### ⏱️ **OTP Settings:**
- **OTP expiry**: 600 seconds (10 dakika)
- **OTP length**: 6 digits

#### 🌐 **URL Configuration:**
- **Site URL**: `quantumdoc://` (deep link için)
- **Redirect URLs**: Boş bırak (OTP kullanıyoruz)

#### 📧 **Email Provider (SMTP):**
Default Supabase SMTP kullanıyoruz, kendi SMTP ekleyebilirsin:
- **SMTP Host**: `smtp.resend.com` (örnek)
- **SMTP Port**: `587`
- **SMTP User**: API key
- **SMTP Pass**: API secret

### 6. **Kaydet ve Test Et**
- **Save** butonuna tıkla
- Test email'i gönder

## 🧪 Test

### Test Email Gönderme:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'TestPass123!'
});
```

### Beklenen Sonuç:
- ✅ Email gelir
- ✅ 6 haneli kod görünür (örn: `123456`)
- ✅ Link yerine sadece kod var
- ✅ Güzel tasarım

## 🔍 Troubleshooting

### Problem: Hala link geliyor
**Çözüm:** Template'de `{{ .ConfirmationURL }}` varsa `{{ .Token }}` ile değiştir

### Problem: Email gelmiyor
**Çözüm:** 
1. Spam klasörünü kontrol et
2. Email provider ayarlarını kontrol et
3. Supabase logs'u kontrol et

### Problem: Template değişmedi
**Çözüm:**
1. Browser cache'i temizle
2. Incognito/Private mode kullan
3. Template'i tekrar kaydet

## ✅ Sonuç

Bu adımları tamamladıktan sonra:
- ✅ Email'ler artık 6 haneli OTP kodu içerecek
- ✅ Link confusion problemi çözülecek
- ✅ Kullanıcı deneyimi gelişecek
- ✅ OTP verification screen çalışacak

**Artık kullanıcılar email'den aldıkları 6 haneli kodu app'e girebilecek!** 🎉
