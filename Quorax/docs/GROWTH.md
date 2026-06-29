# Quorax — Organik Büyüme Yol Haritası (Sıfır Bütçe)

> Hedef: Reklamsız, sosyal medya kurmadan organik indirme + yorum.
> Durum (2026-06-13): ~20 indirme, 0 organik yorum, 746 gösterim. Problem reklam değil — **keşfedilmiyorsun**. Çözüm sırası: ASO → yorum → niş içerik.

---

## ✅ Yapıldı (kod + metin hazır)

- [x] **ASO metni yeniden yazıldı** → [docs/ASO.md](./ASO.md). Title/subtitle keyword'lerle dolduruldu, keyword alanı baştan yazıldı, niş SAT/ACT + JEE/NEET'e çevrildi.
- [x] **Uygulama içi rating popup'ı kodlandı** → [services/reviewPrompt.ts](../services/reviewPrompt.ts). Başarılı solve ([math.tsx](../app/(main)/math.tsx)) ve yüksek skorlu sınav ([exam-lab.tsx](../app/(main)/exam-lab.tsx)) sonrası, 3 başarıdan sonra, 45 günde 1, ömür boyu max 3 kez tetiklenir.

---

## 🔴 HAFTA 1 — Sen yapacaksın (App Store Connect, ~2 saat)

Hiçbiri kod gerektirmez, hepsi panelden:

1. [ ] [docs/ASO.md](./ASO.md)'deki **Title, Subtitle, Keywords, Promotional Text, Description**'ı App Store Connect → App Information / Localization (English) alanlarına yapıştır.
2. [ ] Screenshot'ları güncelle. İlk 2 görsel dönüşümün %50'si. Üstlerine büyük yazıyla:
   - Görsel 1: "Snap any problem. Solved in seconds."
   - Görsel 2: "Practice exams built for your test."
   - (Şu an `screenshots-mock` branch'indesin — bunun için zaten çalışıyorsun.)
3. [ ] Yeni build'i (rating popup'lı) yükle → TestFlight'ta kendin test et → App Store'a gönder.
4. [ ] Diğer dil store-listing'lerini (TR/AR/HI/ES App Store metadata) sil → sadece English bırak. **DİKKAT: uygulama içi dilleri (i18n) SİLME** — onlar yabancı kullanıcılardan 5 yıldız getiriyor.

---

## 🟡 HAFTA 2–3 — İlk gerçek kullanıcılar (sosyal medya YOK)

Hesap kurmana, içerik üretmene gerek yok. Sadece **soruya cevap olarak** linkini bırak:

5. [ ] Reddit'te şu sub'lara gir, **birinin matematik sorusuna cevap verirken** uygulamayı öner (spam değil, gerçek yardım):
   - r/SAT, r/ACT, r/APStudents (ABD — ödeme gücü yüksek)
   - r/JEE, r/NEET, r/Indian_Academia (Hindistan — devasa hacim)
   - r/learnmath, r/HomeworkHelp (genel)
   - Şablon: aşağıdaki "Reddit mesaj şablonu" bölümü.
6. [ ] Discord ödev/sınav sunucularında aynısı (r/SAT'ın Discord'u, JEE Discord'ları).
7. [ ] Hedef: 2 haftada **10 gerçek kullanıcı** + bu kullanıcılardan **5 yorum** (rating popup otomatik isteyecek).

---

## 🟢 AY 2+ — Tekrarlanabilir organik kanal (hâlâ bütçesiz)

8. [ ] **YouTube/TikTok'ta KENDİN değil** — bir öğrenciye/mikro-influencer'a uygulamayı bedava Premium karşılığı kullandır. Tek bir "I solved my SAT homework with this app" videosu yıllarca indirme getirir.
9. [ ] **App Store In-App Events** kullan (panelde, bedava): "SAT Practice Week" gibi bir etkinlik = aramada ekstra görünürlük.
10. [ ] Her ay ASO keyword'lerini gözden geçir: App Store Connect → hangi kelimeden indirme geldiğine bak, zayıf keyword'leri değiştir.

---

## Reddit mesaj şablonu (kopyala, spam görünme)

> Asla "indirin" deme. Önce soruyu çöz, sonra araç olarak bahset.

```
Here's how I'd approach this: [gerçekten soruyu adım adım çöz].

If it helps, I've been using an app called Quorax for exactly this kind of
problem — you snap a photo and it shows the steps, and it can also build a
short practice quiz on the same topic. Free for daily use. Not affiliated
beyond being a happy user.
```

---

## Neden bu sıra?

- **ASO önce**: 746 gösterimle kimse seni bulamıyor. Keyword düzeltmesi bedava ve en yüksek kaldıraç.
- **Yorum ikinci**: 0 yorumlu app hem sıralamada düşük hem tıklanmaz. Rating popup artık otomatik.
- **Niş üçüncü**: Photomath/Gauth ile "genel math" savaşını kaybedersin. SAT/JEE nişinde kazanırsın.
- **Sosyal medya hiç**: Reddit + tek video, hesap yönetmeden organik kanal kurar.
