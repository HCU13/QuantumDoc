# Sınav Kampı — Geliştirme Fikirleri

## Mevcut Durum

| Özellik | Durum |
|---|---|
| Çoktan seçmeli sınav üretimi | ✅ Çalışıyor |
| Flashcard üretimi + flip animasyonu | ✅ Çalışıyor |
| Fotoğraftan sınav üretimi | ⚠️ Konu tespiti yok ("Sınav" yazıyor) |
| Yanlış cevap açıklaması | ✅ Çalışıyor |
| Sınav raporu (skor, yanlışlar) | ✅ Çalışıyor |
| Zorluk + soru sayısı seçimi | ✅ Çalışıyor |
| Yarım kalan sınav devam etme | ⚠️ App kapanınca kayboluyor |
| Flashcard DB'ye kaydedilme | ❌ Yok |

---

## Geliştirme Fikirleri

### 🔴 Tier 1 — Temel Fark Yaratan

- [ ] **1. Spaced Repetition Flashcard**
  - Brainscape/Anki tarzı güven skalası (1–5)
  - "Bu kartı ne kadar iyi biliyorsun?" → kart optimal zamanda tekrar gösterilir
  - Şu an flashcard'lar her seferinde aynı sırada, bilimsel temeli yok

- [ ] **2. Adaptif Zorluk Sınavı**
  - Her cevaptan sonra Claude sonraki soruyu ayarlıyor
  - Doğru → biraz zorlaştır / Yanlış → biraz kolaylaştır
  - GMAT/SAT'ın kullandığı yöntem — hiçbir rakip mobilde yapmıyor

- [ ] **3. Post-Exam AI Coaching Raporu**
  - Sınav bittikten sonra Claude analiz eder
  - Örnek: "Trigonometriye bak, 3/5 yanlış. Hız problemi yok. Öneri: 2 gün flashcard çalış."
  - Şu an sadece ham skor gösteriliyor

---

### 🟡 Tier 2 — Engagement & Bağımlılık

- [ ] **4. Streak + Streak Freeze Sistemi**
  - Duolingo'nun retention'ı %12 → %55 çıkaran özelliği
  - "Bu hafta 3 sınav yaptın 🔥" + coin ile streak dondurma
  - Günlük/haftalık geri gelme alışkanlığı oluşturur

- [ ] **5. Coin Economy**
  - Sınav yap → coin kazan
  - Coin ile: AI ipucu aç, ekstra soru al
  - Gimkit'te bu mekanik oturum süresini %40 artırıyor

- [ ] **6. Fotoğraftan Konu Tespiti**
  - Ders kitabı sayfası çek → konu otomatik algılanır → sınav üretilir
  - Şu an konu "Sınav" olarak sabit geçiyor
  - Photomath'ın en büyük silahı bu

---

### 🟢 Tier 3 — Topluluk & Büyüme

- [ ] **7. Sınav Vault (Paylaşım)**
  - Kullanıcılar yaptıkları sınavları paylaşıyor, başkaları kullanabiliyor
  - Knowunity Avrupa pazarını bu şekilde aldı
  - İçerik üretme yükünü topluluk taşır

- [ ] **8. Flashcard Kütüphanesi**
  - Flashcard setleri DB'ye kaydedilir
  - Geçmiş setler görüntülenebilir, tekrar çalışılabilir
  - Şu an flashcard tamamlanınca kayboluyor

- [ ] **9. Yanlış Soru Bankası**
  - Tüm yanlış cevaplanan sorular birikir
  - "Zayıf sorularım" ekranı → tekrar çalış
  - Brainscape'in bookmark sistemiyle aynı mantık

- [ ] **10. Sınav Devam Etmeyi DB'ye Kaydet**
  - App kapanınca progress kayboluyor
  - Cihaz değiştirince de kaybolur
  - Cross-device continuity için temel beklenti

---

## Rakip Karşılaştırması

| Uygulama | Güçlü Yön | Bizde Eksik Olan |
|---|---|---|
| Anki | Spaced repetition (bilimsel) | Kartlar tekrar sıralanmıyor |
| Quizlet | Learn modu, streak, leaderboard | Günlük geri gelme mekanizması |
| Duolingo | Streak freeze, XP, ligler | Motivasyon sistemi |
| Gimkit | Coin economy, strateji katmanı | Kazanç/harcama döngüsü |
| Khanmigo | Socratic AI tutor | Biz sadece cevap veriyoruz |
| Brainscape | Güven skalası (1–5) | Kaç kez görüldüğü takip edilmiyor |
| StudySmarter | Mock exam + analytics | Zayıf alan analizi |
