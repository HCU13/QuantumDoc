# 📝 Quorax Premium — Auto-Renewable Subscription Setup

App Store Connect → **Monetization → Subscriptions** altında göreceğin **her alanın karşılığını** sırayla yazdım. Tık tık kopyala.

> **NOT:** Bunlar **"In-App Purchase"** (IAP) değil, **"Auto-Renewable Subscription"**. ASC'de ayrı sekme. Tek seferlik satın alma (lifetime) istersen ayrıca IAP olarak eklenir.

---

# 🔹 ADIM 1 — Subscription Group Oluştur

ASC → Monetization → Subscriptions → **Create Subscription Group**

### Reference Name (sadece sen görürsün)
```
Quorax Premium
```

### Group Localization — Display Name (kullanıcı görür)

Bu ad, kullanıcının Apple ID → Subscriptions ekranında görünür.

**English:**
```
Quorax Premium
```

**Türkçe:**
```
Quorax Premium
```

> Group'ta en az 1 lokal olmak zorunda. İkisini de ekle.

---

# 🔹 ADIM 2 — MONTHLY Subscription

Subscription Group'a gir → **Create Subscription**

## Temel Alanlar

| Alan | Değer |
|---|---|
| **Reference Name** | `Premium Monthly` |
| **Product ID** | `com.quorax.premium.monthly` |
| **Subscription Duration** | `1 Month` |
| **Subscription Group Level** | `1` (tek grup varsa sadece 1) |
| **Family Sharing** | **Off** (önerilen — çoğu tüketici eğitim app'inde kapalı) |

## Price (Base Fiyat — USD)

```
$9.99
```

ASC price picker'dan seç: **Tier 10 — $9.99 USD**.

## Turkey Price Override (opsiyonel ama önerilen)

Price Schedule → Territory Pricing → Turkey:
```
₺299,00 TRY
```

## Subscription Localization — MONTHLY

### 🇺🇸 English (en-US)

**Subscription Display Name (30 chars):**
```
Premium Monthly
```

**Description (max 55 chars):**
```
Unlimited solves, verify work, no ads. Monthly.
```
(47 chars ✓)

### 🇹🇷 Türkçe (tr-TR)

**Subscription Display Name (30 chars):**
```
Premium Aylık
```

**Description (max 55 chars):**
```
Sınırsız çözüm, doğrulama, reklamsız. Aylık.
```
(44 chars ✓)

## Review Information (ASC bu ekranda sorar, BOŞ BIRAKMA — otomatik reject)

### Review Notes (bu product için — Apple reviewer'a mesaj)
```
This is the monthly auto-renewing subscription ($9.99/month) that unlocks Quorax Premium features: unlimited math solves, Verify My Work mode, step-by-step explanations, Topic Analysis dashboard, and ad-free usage. Entitlement ID in RevenueCat: "premium". See app-level review notes for demo account credentials.
```

### Review Screenshot (1024×1024 veya 640×920 PNG) — ZORUNLU

Bu screenshot, **paywall ekranını** göstermeli (nerede satın alma tetiklenir). Apple'ın görmesi gereken:
- Paket adı
- Fiyat
- "Continue" / "Subscribe" butonu
- Terms + Privacy linkleri görünür

**Nasıl alırsın:** App'i simulator'da aç → Profile → Premium'a git → Monthly seçili → ekran görüntüsü (Cmd+S).

---

# 🔹 ADIM 3 — YEARLY Subscription

Aynı Subscription Group içinde → **Create Subscription**

## Temel Alanlar

| Alan | Değer |
|---|---|
| **Reference Name** | `Premium Yearly` |
| **Product ID** | `com.quorax.premium.yearly` |
| **Subscription Duration** | `1 Year` |
| **Subscription Group Level** | `2` (upgrade = yıllık daha yüksek değer) |
| **Family Sharing** | **Off** |

## Price

```
$49.99
```

ASC'de: **Tier 50 — $49.99 USD**.

## Turkey Price Override

```
₺999,00 TRY
```

(Default Apple tier ~₺1499 gelecek — manuel düşür. ASC zorlarsa ₺1299 da olur.)

## Subscription Localization — YEARLY

### 🇺🇸 English (en-US)

**Subscription Display Name (30 chars):**
```
Premium Yearly
```

**Description (max 55 chars):**
```
Unlimited Premium for a year. Save 58% vs monthly.
```
(50 chars ✓)

### 🇹🇷 Türkçe (tr-TR)

**Subscription Display Name (30 chars):**
```
Premium Yıllık
```

**Description (max 55 chars):**
```
Yıllık Premium erişim. Aylıktan %72 tasarruf.
```
(45 chars ✓)

## Review Notes (Yearly için)
```
This is the annual auto-renewing subscription ($49.99/year, equivalent to $4.16/month) with the same Premium entitlement as the monthly plan. Users can upgrade from monthly to yearly; App Store handles proration automatically. Entitlement ID: "premium".
```

## Review Screenshot
Paywall'da Yearly **seçili** iken ekran görüntüsü al (yukarıdakiyle aynı ekran, sadece yearly tile'ı vurgulu).

---

# 🔹 ADIM 4 — App-Level Review Information

Bu ayrı — version submit ederken görürsün. App Information → App Review Information.

### Demo Account
```
Email: review@quorax.app
Password: AppleReview2026!
```

### Notes (app-level, genel review için)
```
QUORAX PREMIUM — Review walkthrough

HOW TO TEST:
1. Sign in with the demo account above (or create a new account).
2. In the bottom tab, tap "Profile" → "Premium" to open the paywall.
3. The paywall shows both Monthly ($9.99) and Yearly ($49.99) plans, with Yearly selected by default and a "SAVE X%" badge.
4. Tap "Continue" to trigger the StoreKit purchase sheet.

WHAT PREMIUM UNLOCKS:
• Unlimited math problem solves (free tier: 5/day)
• "Verify My Work" mode — unique feature that checks a student's own solution step by step
• Per-step "why?" explanations (tap any solution step)
• Topic Analysis dashboard with progress tracking
• Ad-free experience

SUBSCRIPTION MANAGEMENT:
• In-app: Profile → Premium → "Cancel Subscription" link (opens iOS Subscription Settings)
• iOS: Settings → Apple ID → Subscriptions

TECHNICAL:
• Subscriptions via RevenueCat SDK over StoreKit 2
• Entitlement identifier: "premium" (both Monthly and Yearly grant it)
• Offering: "default"
• AI backend: Anthropic Claude (math solver), runs in Supabase Edge Functions
```

### Contact Information
```
Name:       Can Ulubaş
Email:      support@quorax.app
Phone:      [senin numara — mutlaka gir, Apple arayabilir]
```

---

# 🔹 ADIM 5 — App Store Description Alt Bloğu

**App description'ın sonuna** (Product Page → App Information → Description):

### 🇺🇸 EN

```
— SUBSCRIPTION —

• Premium Monthly: $9.99/month
• Premium Yearly: $49.99/year

Payment is charged to your Apple ID at confirmation. Auto-renews unless turned off at least 24 hours before the end of the current period. Manage or cancel in Apple ID Account Settings.

Terms: https://quorax.app/terms
Privacy: https://quorax.app/privacy
```

### 🇹🇷 TR

```
— ABONELİK —

• Premium Aylık: ₺299/ay
• Premium Yıllık: ₺999/yıl

Ödeme, onay sırasında Apple Kimliğinden tahsil edilir. Mevcut dönem bitmeden 24 saat önce kapatılmadığı sürece otomatik yenilenir. Apple Kimliği Hesap Ayarlarından yönetip iptal edebilirsin.

Koşullar: https://quorax.app/terms
Gizlilik: https://quorax.app/privacy
```

---

# 🔹 ADIM 6 — App Privacy Questionnaire

App Information → App Privacy → Edit

### "Do you or your third-party partners collect data from this app?" → **Yes**

### Data Types (bir bir işaretle)

| Data Type | Collected? | Linked to User | Used for Tracking |
|---|---|---|---|
| Email Address | ✅ | ✅ | ❌ |
| Name | ✅ | ✅ | ❌ |
| User Content — Photos or Videos | ✅ | ✅ | ❌ |
| User Content — Other | ✅ | ✅ | ❌ |
| Identifiers — User ID | ✅ | ✅ | ❌ |
| Usage Data — Product Interaction | ✅ | ✅ | ❌ |
| Diagnostics — Crash Data | ✅ | ✅ | ❌ |
| Diagnostics — Performance Data | ✅ | ✅ | ❌ |
| Purchases — Purchase History | ✅ | ✅ | ❌ |

### Purposes (her data type için):
- `App Functionality` (ana kategori — çoğu için bunu işaretle)
- `Analytics` (crash/performance için)

### Third-Party SDK Declarations (Apple özellikle sorar)

iOS 17+ zorunlu — her SDK için `PrivacyInfo.xcprivacy` dosyası olmalı. Şu an kullandıkların:

| SDK | Kategori |
|---|---|
| Supabase | Authentication + Backend |
| Anthropic Claude API | AI Processing (User Content gönderilir) |
| Google AdMob | Advertising |
| RevenueCat | Purchase Analytics |
| Sentry | Crash Reporting |

---

# 🔹 ADIM 7 — Paywall Ekranı (Apple 3.1.2 Zorunlu)

App içindeki paywall'da (şu anki `subscription.tsx`) **mutlaka** görünecekler:

- [x] Plan ismi (Monthly / Yearly)
- [x] Fiyat + süre (ör. `$9.99/mo`, `$49.99/yr`)
- [x] "Auto-renews" disclaimer
- [x] Terms of Use tıklanabilir link
- [x] Privacy Policy tıklanabilir link
- [x] Restore Purchases butonu

**Şu anki [subscription.tsx](app/(main)/profile/subscription.tsx)'te hepsi var.** ✅

---

# 🔹 ADIM 8 — Rejection Önleyici Kontroller

**Apple şu durumlarda reddeder (2024-2026 trendleri):**

1. ❌ **Subscription price'ı hardcoded** — her zaman `product.priceString` ile App Store'dan çek (senin kodun doğru ✅)
2. ❌ **Currency symbol hardcoded** — `$` yazma, `product.priceString` kullan (kod doğru ✅)
3. ❌ **"Free" kelimesi** paywall'da varken ücret alıyorsan (sen free trial vermiyorsan sorun yok)
4. ❌ **Restore butonu eksik** (var ✅)
5. ❌ **T&C + Privacy link'leri eksik** (var ✅)
6. ❌ **"Auto-renew" yazısı küçük font veya gri** — okunabilir olmalı (şu an fontSize 11, rgba(255,255,255,0.4) → **fontSize 12, opacity 0.55 yap**, aksi reject olabilir)
7. ❌ **Tam ekran paywall, kapatılamıyor** (seninki geri butonu var ✅)
8. ❌ **"Best value" / "Most popular" sadece iddia, fiyat göstermiyor** — yanında fiyat olmalı (var ✅)
9. ❌ **Review screenshot eksik veya paywall göstermiyor** — subscription product'ın kendi screenshot'ı

---

# ✅ Pre-Submit Checklist

Her tick'i işaretlemeden submit etme:

- [ ] Subscription Group oluşturuldu: `Quorax Premium`
- [ ] Monthly product oluşturuldu (`com.quorax.premium.monthly`, $9.99)
- [ ] Yearly product oluşturuldu (`com.quorax.premium.yearly`, $49.99)
- [ ] EN + TR localization her paket için eklendi
- [ ] Turkey price override ayarlandı (₺299 + ₺999)
- [ ] Review Notes her iki product'a yazıldı
- [ ] Review Screenshot her iki product'a yüklendi (1024×1024 PNG)
- [ ] App-level Review Notes + Demo Account girildi
- [ ] App description sonuna TR + EN subscription bloğu eklendi
- [ ] App Privacy questionnaire tam doldurulmuş
- [ ] PrivacyInfo.xcprivacy dosyası iOS build'inde var
- [ ] Paywall'da auto-renew text okunabilir (fontSize ≥ 12, opacity ≥ 0.5)
- [ ] Terms (https://quorax.app/terms) canlı
- [ ] Privacy (https://quorax.app/privacy) canlı
- [ ] RevenueCat dashboard'da entitlement `premium` aktif
- [ ] RC offering `default` içinde 2 paket var (`$rc_monthly` + `$rc_annual`)

Hepsi ✅ olunca submit et.

---

## 🔁 Eski $6.99 Aboneliği Ne Yapacaksın

Şu an aktif `premium_monthly` (veya eski ID ne ise) product'ın varsa:

1. ASC → o product'a git → **Cleared for Sale: OFF**
2. RC Dashboard → Products → Archive
3. RC Dashboard → Offerings → default → eski paketi **Remove from offering**

**Silme yok, sadece satıştan kaldırma.** Mevcut $6.99 aboneleri etkilenmez, yeni kullanıcılar $9.99 görür.

Apple ID rezervasyonu nedeniyle **aynı Product ID'yi tekrar kullanma** — yeni ID ile yeni paketler oluştur (benim önerdiğim `com.quorax.premium.monthly` ve `.yearly`).
