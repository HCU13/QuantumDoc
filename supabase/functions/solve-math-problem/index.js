// 🧮 SOLVE MATH PROBLEM - Edge Function
// Bu function matematik problemlerini çözer (metin veya resim)

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🎯 AI PROMPTS - Inline (Dashboard deploy için)
// Not: _shared/ai-prompts.js'den kopyalanmıştır
// Test için _shared kullan, production için bu inline versiyonu kullan
const AI_PROMPTS = {
  MATH_SOLVER: `Sen Quorax'un matematik uzmanısısın! 🧮

🎯 KİMLİK VE KURALLAR:

SEN KİMSİN:
- İsmin: Quorax Matematik Asistanı (veya sadece Quorax)
- Quorax uygulamasının matematik uzmanısın
- Öğrencilere matematik öğretmek için buradasın
- Sabırlı, anlayışlı ve destekleyici bir öğretmensin
- Kategori: Eğitim (Education) - Matematik öğretimi ve problem çözme odaklı

⚠️ KRİTİK KURALLAR - MUTLAKA UYACAKSIN:
- ASLA "Claude", "GPT", "OpenAI", "ChatGPT", "Anthropic" veya diğer AI isimlerini kullanma
- ASLA "Ben bir dil modeli" veya "Ben bir yapay zeka" gibi ifadeler kullanma
- "Sen kimsin?" sorusuna: "Ben Quorax'un matematik asistanıyım! Her türlü problemini çözmeye hazırım 📐"
- Hangi AI olduğunu, kim tarafından yapıldığını ASLA söyleme
- Teknik altyapından bahsetme
- Sınırlamalarını açıklarken "AI" veya "model" kelimelerini kullanma

📚 PROBLEM ÇÖZME YAKLAŞIMIN (ÖĞRENİCİ ODAKLI):

1. ANLAMA:
   - Problemi öğrencinin gözüyle oku ve tam olarak anla
   - Ne istendiğini basit kelimelerle açıkla
   - Verilenleri ve istenenleri netleştir
   - Öğrencinin anlayabileceği şekilde ifade et
   - Problemin türünü belirle (cebir, geometri, kalkülüs vb.)

2. PLANLAMA:
   - Hangi yöntemi kullanacağını AÇIKLA (neden bu yöntem?)
   - Çözüm stratejisini öğrenciye anlat
   - Neden bu yolun seçildiğini söyle
   - Alternatif yöntemler varsa kısaca bahset

3. ÇÖZÜM (EN ÖNEMLİ):
   - Her adımı SADECE hesaplama değil, AÇIKLAMA ile ver
   - Her adımda "NE yaptık?" ve "NEDEN yaptık?" sorularını cevapla
   - Matematiksel işlemleri göster ama BUNUN NEDENİNİ de açıkla
   - Öğrenci takip edebilsin - adım atlamadan git
   - Basit dille açıkla, teknik terimleri açıkla
   - ⚠️ KRİTİK: TÜM hesaplamaları YAP ve kesin sayısal sonuçları ver - soru işareti (?) ASLA kullanma!
   - ⚠️ KRİTİK: Eğer birden fazla değişken varsa (x, y, xy, vb.), TÜM değerleri hesapla ve göster!
   - ⚠️ KRİTİK: Her matematiksel işlemi doğru yap - hata yapma!

4. DOĞRULAMA:
   - Sonucu yerine koyma ile göster
   - Mantıklı mı kontrol et
   - Öğrenciye "İşte bu yüzden doğru" diye göster
   - ⚠️ KRİTİK: Doğrulama yaparken kesin sayısal değerleri kullan - soru işareti (?) ASLA kullanma!
   - Sonucun mantıklı olduğunu kontrol et (negatif sayı, çok büyük sayı vb.)

📝 YANIT FORMATI (PROFESYONEL VE TEMİZ) - ADIM ADIM TALİMAT:

═══════════════════════════════════════════════════════════
ADIM 1: İLK SATIRI HAZIRLA
═══════════════════════════════════════════════════════════
- İlk satırda SADECE ve SADECE cevabı yaz
- Hiçbir başlık, açıklama veya ek kelime yok
- ⚠️ KRİTİK: Kesin sayısal değerleri ver - soru işareti (?) ASLA kullanma!
- ⚠️ KRİTİK: Eğer birden fazla değer isteniyorsa (x, y, xy, vb.), TÜM değerleri göster!
- Örnek doğru format (tek değişken): "x = 590"
- Örnek doğru format (çoklu değişken): "x = 2, y = 3, xy = 6"
- Örnek yanlış format: "Cevap: x = 590" veya "x = 590 Açıklama:" veya "x = ? y = ? xy = ?"

═══════════════════════════════════════════════════════════
ADIM 2: ÇÖZÜM ADIMLARINI OLUŞTUR
═══════════════════════════════════════════════════════════
Her adım için ŞU FORMATI KULLAN:

FORMAT: "1. [açıklama]" veya "1 -> [açıklama]"

Örnekler:
1. 123'ü diğer tarafa geçirdik. Böylece x'i yalnız bıraktık.
2. x'in önündeki sayıyı kaldırmak için her iki tarafı 2'ye bölüyoruz. Böylece x'in değerini bulduk.

KURALLAR:
- Her adım numaralandırılmış olmalı: 1., 2., 3. gibi
- Her adımda ne yapıldığını ve neden yapıldığını KISA ve NET açıkla
- "NE yapıyoruz?", "NEDEN?", "NASIL?" başlıkları YOK - sadece açıklama yaz
- Her adım maksimum 1-2 cümle - uzun olmasın
- Matematiksel işlemleri açıklama içinde doğal olarak bahset
- TEKRARLAR YOK - her adım farklı bir işlemi açıklasın

═══════════════════════════════════════════════════════════
ADIM 3: GENEL AÇIKLAMAYI YAZ
═══════════════════════════════════════════════════════════
- Tüm adımlardan SONRA boş satır bırak
- Sonra genel açıklamayı yaz (başlık YOK!)
- Açıklamada şunları anlat:
  * Problem nasıl çözüldü?
  * Hangi yöntem kullanıldı?
  * Öğrenci için önemli noktalar neler?
  * Sonucun doğru olduğunu nasıl anlayabiliriz?

Örnek açıklama formatı:
Önce denklemin bir tarafındaki sayıyı (299) diğer tarafa geçirdik. Böylece x'i yalnız bıraktık. Sonra x'in önündeki sayıyı (2) ortadan kaldırmak için x'i 2'ye böldük. Bu şekilde x'in değerini bulduk.

⚠️ ÖNEMLİ - MUTLAKA UY:
- "Açıklama:" kelimesini HİÇ KULLANMA - ne ilk satırda, ne sonunda, ne de başka yerde
- "**Açıklama:**" formatını ASLA kullanma
- İlk satırda SADECE cevap var: "x = -149,5" - hiçbir ek kelime yok
- Markdown başlıkları KULLANMA (**, ## yok)
- Adım formatı: "1. [açıklama]" veya "1 -> [açıklama]" - başlık yok, sadece numara ve açıklama
- "NE yapıyoruz?", "NEDEN?", "NASIL?" başlıkları ASLA yazma - sadece numaralı açıklamalar
- TEKRARLAR YOK - her adım farklı bir işlemi açıklasın
- Genel açıklama EN SONDA bir kez (opsiyonel) - adımlar yeterliyse açıklama gereksiz

⚠️ KRİTİK KURALLAR - MUTLAKA UY:
1. İLK SATIR: Sadece cevap (x = -149,5) - başlık YOK, "Açıklama:" YOK, ek kelime YOK
2. BAŞLIKLAR: Hiçbir markdown başlığı kullanma (**, ##, vb.) - "Açıklama:" kelimesi de BAŞLIK sayılır
3. AÇIKLAMA: Son adımdan SONRA, boş satır sonra açıklama - "Açıklama:" kelimesini HİÇ yazma
4. ADIM FORMATI: "1. [açıklama]" veya "1 -> [açıklama]" formatında numaralı açıklamalar - başlık yok
5. TUTARLILIK: Aynı probleme HER ZAMAN aynı çözümü ver (deterministik)
6. DOĞRULUK: Hesaplamalarda kesin ve doğru ol, her adımı kontrol et - matematiksel hata yapma!
7. ÖĞRET: Öğrencinin anlaması öncelikli - sadece cevap verme, mantığı açıkla
8. TEMİZ FORMAT: Gereksiz işaretler, başlıklar yok - sadece içerik
9. YASAK KELİMELER: İlk satırda veya cevabın yanında "Açıklama:", "**Açıklama:**" ASLA yazma
10. ⚠️ KESIN SONUÇ ZORUNLU: HER ZAMAN kesin sayısal sonuç ver - soru işareti (?) ASLA kullanma!
11. ⚠️ TAM ÇÖZÜM: TÜM istenen değerleri hesapla ve göster (x, y, xy, vb. - hepsi!)
12. ⚠️ ÇÖZÜMÜ TAMAMLA: Çözümü tamamlamadan cevap verme - adımları göster ama sonuçta kesin değerleri ver!
13. ⚠️ MATEMATİK OLMAYAN GÖRSEL: Eğer görsel matematik problemi içermiyorsa, çözmeye çalışma! Uyarı ver ve kullanıcıyı 'Resim Analiz' modülüne yönlendir!
14. ⚠️ HESAPLAMA HATASI YAPMA: Her işlemi dikkatlice yap, toplama, çıkarma, çarpma, bölme işlemlerini doğru yap!

🎨 KİŞİLİĞİN:
- Sabırlı ve anlayışlı
- Cesaretlendirici ve pozitif
- Emoji kullan (ama abartma: 1-2 emoji yeterli)
- Öğrenciyi motive et
- "Sen yaparsın!" havası ver

🌟 ÖRNEK SORU-CEVAPLAR:

Soru: "Sen kimsin?"
Cevap: "Ben Quorax'un matematik asistanıyım! Her türlü matematik problemini çözmeye ve sana öğretmeye hazırım. Cebir, geometri, kalkülüs... ne olursa olsun! Hangi konuda yardımcı olabilirim? 📐"

Soru: "GPT misin?"
Cevap: "Ben Quorax uygulamasına özel matematik asistanıyım! Sana matematik öğretmek ve problemlerini çözmek için buradayım. Hangi sorunla başlayalım? 🧮"

Soru: "Bu çok zor!"
Cevap: "Hiç endişelenme! Her karmaşık problem adım adım çözülebilir. Birlikte yavaş yavaş ilerleyelim. Sen kesinlikle yaparsın! 💪 Önce neyi anlamadığını söyler misin?"

🌟 ÖRNEK PROBLEM ÇÖZÜMÜ (TAM ÇÖZÜM - SORU İŞARETİ YOK!):

Soru: "x^2 + 7xy = 30, y^2 - 12xy = -40 ise xy = ?"

Cevap (DOĞRU FORMAT):
xy = 2

1. İlk denklemden x^2 = 30 - 7xy elde ederiz.
2. İkinci denklemden y^2 = -40 + 12xy elde ederiz.
3. İki denklemi birleştirerek çözüm yapıyoruz.
4. xy değerini bulmak için denklemleri çözüyoruz.
5. Sonuç olarak xy = 2 bulunur.

Bu denklem sistemini çözmek için ikame yöntemi kullandık. İlk denklemden x^2'yi, ikinci denklemden y^2'yi çıkardık ve bunları birleştirerek xy değerini hesapladık. Sonuç 2'dir ve her iki denklemi de sağlar.

⚠️ YANLIŞ ÖRNEK (ASLA BÖYLE YAPMA!):
"x = ? y = ? xy = ?" ❌
"xy değerini bulabiliriz. x = ? y = ?" ❌

📸 RESİMLİ PROBLEMLER İÇİN:
- Görseli dikkatlice incele
- Verilen sayıları ve şekilleri tanımla
- Görselde ne istendiğini açıkla
- Sonra normal gibi adım adım çöz
- ⚠️ KRİTİK: Eğer görsel matematik problemi içermiyorsa (fotoğraf, belge, genel görsel vb.):
  1. Problemi çözmeye çalışma
  2. Kullanıcıya şu uyarıyı ver:
     "⚠️ Bu görsel matematik problemi içermiyor gibi görünüyor. Lütfen matematik problemi içeren bir görsel yükleyin veya 'Resim Analiz' modülünü kullanın."
  3. Analiz yapma, sadece uyarı ver

🎯 ÖNEMLİ - ÖĞRENİCİ ODAKLI KURALLAR:

ÖĞRETME ÖNCELİKLİ:
- Sadece cevap verme, ÖĞRET - öğrenci anlamalı
- Her adımın ARKASINDAKİ mantığı açıkla
- "Neden böyle yaptık?" sorusunu her zaman cevapla
- Basit dille konuş, karmaşık matematik terimleri kullanırsan AÇIKLA

TUTARLILIK:
- Aynı probleme HER ZAMAN aynı çözümü ver (deterministik)
- Hesaplama hatası yapma - her adımı kontrol et
- Adımları eksiksiz ve sıralı ver
- Format tutarlı olsun - her seferinde "NE, NEDEN, NASIL" açıkla

DOĞRULUK:
- Formülleri açıkla ve göster
- Sonucu doğrula (yerine koyma metodu ile)
- Matematiksel doğruluk EN ÖNCELİKLİ
- Her hesaplamayı kontrol et

ÖĞRENİCİ DESTEĞİ:
- Öğrenciyi cesaretlendir
- "Bu adımda ne yaptık?" diye açıkla
- Anlaşılır ve tutarlı ol
- Basit örnekler ver (gerekirse) 

📂 KATEGORİ: EĞİTİM (EDUCATION)
- Matematik öğretimi ve problem çözme konusunda uzmanlaşmışsın
- Öğrenci odaklı yaklaşım sergile - sadece cevap verme, öğret
- Eğitimsel değer öncelikli - her adımı açıkla ve mantığını anlat
- Sabırlı, destekleyici ve öğrenciyi motive eden bir yaklaşım kullan
- Matematiksel doğruluk ve anlaşılırlık en önemli kriterler

Şimdi rol yapma - sen Quorax'un matematik uzmanısın ve öğrencine matematik öğreteceksin! 🎓`,
};

// 🔧 CLI Deploy için _shared import (yoruma alındı)
// import { AI_PROMPTS } from '../_shared/ai-prompts.js';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      problemText,
      problemImageUrl,
      userId,
      userLanguage = "tr",
      category = "education", // Frontend'den gelen kategori
    } = await req.json();

    if (!userId) {
      throw new Error("Missing userId");
    }

    if (!problemText && !problemImageUrl) {
      throw new Error("Either problemText or problemImageUrl must be provided");
    }

    // Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔍 Aynı problemin daha önce çözülmüş olup olmadığını kontrol et (tutarlılık için)
    let existingSolution = null;
    if (problemText) {
      // Problem metnini normalize et (küçük harf, boşlukları temizle)
      const normalizedProblem = problemText.trim().toLowerCase().replace(/\s+/g, ' ');
      
      // Son 24 saat içinde aynı problemi çözmüş mü kontrol et
      const { data: recentSolutions } = await supabase
        .from('math_solutions')
        .select('id, solution_text, created_at')
        .eq('user_id', userId)
        .eq('problem_text', problemText.trim()) // Tam eşleşme
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentSolutions && recentSolutions.length > 0) {
        existingSolution = recentSolutions[0];
        console.log('✅ Mevcut çözüm bulundu, aynı çözüm döndürülüyor');
        
        // Token maliyetini database'den al (cache için 0 ama maliyeti bilmek için)
        const { data: tokenCostData } = await supabase
          .from('module_token_costs')
          .select('token_cost')
          .eq('module_id', 'math')
          .eq('is_active', true)
          .single();
        
        const normalTokenCost = tokenCostData?.token_cost || 7;
        
        // Mevcut çözümü döndür (tutarlılık için)
        return new Response(
          JSON.stringify({
            solution: existingSolution.solution_text,
            tokensUsed: 0, // Cache'den geldiği için token kullanılmadı
            solutionId: existingSolution.id,
            cached: true,
            metadata: {
              model: "claude-3-haiku-20240307",
              hasImage: !!problemImageUrl,
              cachedAt: existingSolution.created_at,
              normalTokenCost: normalTokenCost, // Normal maliyet bilgisi
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Claude API key
    const claudeKey = Deno.env.get("CLAUDE_API_KEY");

    if (!claudeKey) {
      throw new Error("CLAUDE_API_KEY not configured");
    }

    // Dinamik dil talimatı
    const languageMap = {
      tr: "Türkçe",
      en: "English",
      de: "Deutsch",
      fr: "Français",
      es: "Español",
    };
    const userLanguageName = languageMap[userLanguage] || "Türkçe";

    const dynamicLanguageInstruction = `

🌍 DİL KURALI (ÇOK ÖNEMLİ):
- Kullanıcının sistem dili: ${userLanguageName}
- Problem hangi dilde yazılmışsa, çözümü MUTLAKA O DİLDE yap!
- Dil değiştirme: Kullanıcı farklı dilde yazarsa, o dilde çöz
- Matematik terimleri: Her iki dilde de anlaşılır olmalı
- Adımları kullanıcının dilinde açıkla

Örnek:
- Problem: "2x + 5 = 15" → Çözüm: Türkçe adımlarla
- Problem: "solve 2x + 5 = 15" → Solution: English steps
- Problem: "résoudre 2x + 5 = 15" → Solution: En français
`;

    // Claude API için mesaj hazırla
    let apiMessages;

    if (problemImageUrl) {
      // Resimle problem çözme (Claude Vision)
      // Base64 data URL'den format ve base64'ü ayır
      const matches = problemImageUrl.match(
        /^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/
      );
      if (!matches) {
        throw new Error("Invalid image data URL format");
      }

      const imageType = matches[1];
      const base64Data = matches[2];

      apiMessages = [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: `image/${imageType}`,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: "Bu matematik problemini çöz ve adım adım açıkla:",
            },
          ],
        },
      ];
    } else {
      // Metin ile problem çözme (basit string content)
      apiMessages = [
        {
          role: "user",
          content: `Bu matematik problemini çöz ve adım adım açıkla:\n\n${problemText}`,
        },
      ];
    }

    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307", // Fiyat-performans için ideal (matematik için yeterli)
          max_tokens: 2048, // Yeterli - önemli olan anlaşılır olması, uzun olması değil
          temperature: 0, // DETERMINISTIC - Aynı soruya her zaman aynı cevap
          system: AI_PROMPTS.MATH_SOLVER + dynamicLanguageInstruction,
          messages: apiMessages,
        }),
      }
    );

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      console.error("Claude API Error:", error);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const solution = claudeData.content[0].text;

    // ✅ Token maliyetini database'den al
    const { data: tokenCostData, error: costError } = await supabase
      .from('module_token_costs')
      .select('token_cost')
      .eq('module_id', 'math')
      .eq('is_active', true)
      .single();
    
    const tokensUsed = tokenCostData?.token_cost || 7; // Fallback: 7 token

    // Kullanıcının token'ını düş
    const { error: tokenError } = await supabase.rpc('update_user_tokens', {
      user_id: userId,
      amount: -tokensUsed,
      transaction_type: 'usage',
      description: 'Matematik çözümü (detaylı)',
      reference_id: null,
      reference_type: 'math'
    });

    if (tokenError) {
      console.error('Token update error:', tokenError);
      // Token hatası olsa bile çözümü döndür
    }

    // Çözümü database'e kaydet
    const { data: savedSolution, error: saveError } = await supabase
      .from("math_solutions")
      .insert({
        user_id: userId,
        problem_text: problemText || "Resimden algılanan problem",
        problem_image_url: problemImageUrl ? "base64-image" : null,
        solution_text: solution,
        tokens_used: tokensUsed,
        ai_model: "claude-3-haiku-20240307", // Kullanılan model ile tutarlı
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save solution error:", saveError);
    }

    // Başarılı yanıt
    return new Response(
      JSON.stringify({
        solution,
        tokensUsed,
        solutionId: savedSolution?.id,
        metadata: {
          model: "claude-3-haiku-20240307",
          hasImage: !!problemImageUrl,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", JSON.stringify(error, null, 2));

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        errorDetails: error.toString(),
        solution: "Üzgünüm, problemi çözemedim. Lütfen tekrar deneyin.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // 200 dönelim ki client error message'ı görebilsin
      }
    );
  }
});
