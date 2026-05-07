# 📋 App Store Connect + RevenueCat — Kopyala/Yapıştır

---

## 🏷️ Product IDs (App Store Connect'te bunlarla oluştur)

```
com.quorax.premium.monthly
com.quorax.premium.yearly
```

## 🎯 RevenueCat Entitlement

```
premium
```

## 🎯 RevenueCat Offering Identifier

```
default
```

## 🎯 RevenueCat Package Types

- Monthly product → Package: `$rc_monthly`
- Yearly product → Package: `$rc_annual`

---

# 📦 MONTHLY

### Reference Name
```
Premium Monthly
```

### Product ID
```
com.quorax.premium.monthly
```

### Subscription Group
```
Quorax Premium
```

### Duration
```
1 Month
```

### Price
```
$9.99
```

### 🇺🇸 Display Name
```
Premium Monthly
```

### 🇺🇸 Description (max 55 chars)
```
Unlimited solves, verify work, no ads. Monthly.
```

### 🇹🇷 Display Name
```
Premium Aylık
```

### 🇹🇷 Description (max 55 chars)
```
Sınırsız çözüm, doğrulama, reklamsız. Aylık.
```

---

# 📦 YEARLY

### Reference Name
```
Premium Yearly
```

### Product ID
```
com.quorax.premium.yearly
```

### Subscription Group
```
Quorax Premium
```

### Duration
```
1 Year
```

### Price
```
$49.99
```

### 🇹🇷 Turkey Price Override
```
₺999
```

### 🇺🇸 Display Name
```
Premium Yearly
```

### 🇺🇸 Description (max 55 chars)
```
Unlimited Premium for a year. Save 58% vs monthly.
```

### 🇹🇷 Display Name
```
Premium Yıllık
```

### 🇹🇷 Description (max 55 chars)
```
Yıllık Premium erişim. Aylıktan %72 tasarruf.
```

---

# 📱 Paywall Alt Metni (app içinde gösterilen)

### 🇺🇸 EN
```
Auto-renews until canceled. Cancel anytime in iOS Settings. Payment charged to your Apple ID.
```

### 🇹🇷 TR
```
İptal edilmediği sürece otomatik yenilenir. iOS Ayarları üzerinden her zaman iptal edebilirsin. Ödeme Apple Kimliğinden tahsil edilir.
```

---

# 📝 App Store Description Alt Bloğu (zorunlu)

### 🇺🇸 EN (app description sonuna ekle)

```
— SUBSCRIPTION —

• Premium Monthly: $9.99/month
• Premium Yearly: $49.99/year

Payment is charged to your Apple ID at confirmation. Auto-renews unless turned off at least 24 hours before the end of the period. Manage or cancel in your Apple ID Account Settings.

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

# 👤 Review Demo Account

```
Email: review@quorax.app
Password: AppleReview2026!
```

## Review Notes

```
Quorax Premium unlocks unlimited math solves, "Verify My Work" mode, per-step explanations, Topic Analysis, and removes ads.

To test:
1. Sign in with the demo account above.
2. Tap Profile > Premium to see the paywall.
3. Both Monthly and Yearly packages are available via RevenueCat + StoreKit 2.

Entitlement ID: premium
Offering ID: default
```
