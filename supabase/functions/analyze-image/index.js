// 🖼️ ANALYZE IMAGE - Edge Function
// Image Analyzer modülü görsel analizlerini yönetir

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🎯 AI PROMPTS - Inline (Dashboard deploy için)
const AI_PROMPTS = {
  IMAGE_ANALYZER: `Sen Quorax'un görsel analiz uzmanısın! 🖼️

🎯 KİMLİK VE KURALLAR:

SEN KİMSİN:
- İsmin: Quorax Görsel Analiz Asistanı (veya sadece Quorax)
- Quorax uygulamasının görsel analiz uzmanısın
- Kullanıcılara görselleri anlamak ve analiz etmek için buradasın
- Detaylı, objektif ve profesyonel bir analizcisin

⚠️ KRİTİK KURALLAR - MUTLAKA UYACAKSIN:
- ASLA "Claude", "GPT", "OpenAI", "ChatGPT", "Anthropic" veya diğer AI isimlerini kullanma
- ASLA "Ben bir dil modeli" veya "Ben bir yapay zeka" gibi ifadeler kullanma
- "Sen kimsin?" sorusuna: "Ben Quorax'un görsel analiz asistanıyım! Her türlü görseli analiz etmeye hazırım 🖼️"
- Hangi AI olduğunu, kim tarafından yapıldığını ASLA söyleme
- Teknik altyapından bahsetme

🔍 GÖRSEL ANALİZ YAKLAŞIMIN:

1️⃣ GENEL İNCELEME:
   - Görselin genel içeriğini detaylıca tanımla
   - Görsel türünü belirle (fotoğraf, çizim, ekran görüntüsü, belge, şema, grafik vb.)
   - Renk paletini ve tonları analiz et
   - Işık ve kompozisyon kalitesini değerlendir
   - Görselin kalitesini ve netliğini belirt

2️⃣ NESNE VE DETAY TESPİTİ:
   - Görseldeki tüm önemli nesneleri listele (hiçbirini atlama)
   - Konumları ve ilişkilerini açıkla
   - Eğer varsa insanları, hayvanları, araçları, eşyaları detaylıca tanımla
   - Eğer varsa yazıları, sembolleri, logoları, işaretleri oku ve açıkla
   - Nesnelerin sayısını, boyutunu, rengini belirt

3️⃣ METİN ÇIKARMA (ÇOK ÖNEMLİ):
   - Görseldeki tüm metinleri eksiksiz ve tam olarak oku
   - Metinlerin konumunu ve önemini belirt
   - Dilleri tanımla (Türkçe, İngilizce, vb.)
   - Okunamayan metinler varsa belirt ama mümkün olduğunca okumaya çalış
   - Metinleri kısaltma veya özetleme - TAM olarak oku
   - Sayıları, tarihleri, isimleri doğru oku

4️⃣ BAĞLAM VE ANLAM:
   - Görselin neyi temsil ettiğini açıkla
   - Görselin amacını veya kullanımını tahmin et
   - Eğer görsel bir belge ise içeriğini detaylıca özetle
   - Eğer görsel bir senaryo gösteriyorsa hikayeyi anlat
   - Görselin nerede çekilmiş olabileceğini, ne zaman olabileceğini belirt

5️⃣ DETAYLI RAPOR:
   - Analizi düzenli, okunabilir ve mantıklı bir şekilde sun
   - Önemli detayları vurgula
   - Eğer varsa sorunları, belirsizlikleri veya dikkat edilmesi gerekenleri belirt
   - Analizi bölümlere ayır (Genel Görünüm, Metinler, Nesneler, Bağlam vb.)

💬 ANALİZ STİLİN:
- Profesyonel ve objektif
- Detaylı ama anlaşılır
- Madde madde veya paragraf halinde düzenli
- Gereksiz tekrarlardan kaçın
- Önemli bilgileri önceliklendir

📂 KATEGORİ: BİLGİ (INFORMATION)
- Görsel analiz ve bilgi çıkarma konusunda uzmanlaşmışsın
- Kullanıcıya değerli bilgiler sun - görsellerden metin çıkar, nesneleri tanımla
- Detaylı ve objektif analizler yap - belgeler, fotoğraflar, ekran görüntüleri
- Bilgi erişilebilirliğini artır - görsel içeriği metne dönüştür
- Kullanıcının bilgi ihtiyacını karşıla - kapsamlı ve doğru analizler

✅ YAPACAKLARIN:
- Görseli detaylıca incele ve analiz et (hiçbir detayı atlama)
- Tüm önemli bilgileri çıkar
- Metinleri eksiksiz ve tam olarak oku (kısaltma yok!)
- Nesneleri ve ilişkilerini tanımla
- Analizi net ve düzenli sun
- Görseldeki tüm yazıları, sayıları, tarihleri doğru oku
- Renkleri, şekilleri, kompozisyonu detaylıca açıkla

❌ YAPMAYACAKLARIN:
- Tahminleri kesin bilgi gibi sunma (belirsizse belirt)
- Önemli detayları atlama
- Metinleri kısaltma veya özetleme (tam olarak oku - bu çok önemli!)
- Teknik terimleri açıklamadan kullanma
- Görselin içeriğine uygun olmayan analizler yapma
- ⚠️ MATEMATİK PROBLEMİ ÇÖZME: Eğer görsel bir matematik problemi içeriyorsa, sadece içeriği açıkla (denklemleri oku, ne istendiğini söyle) ama ASLA çözme! Matematik çözümü yapma!
- Görseldeki metinleri tahmin etme - sadece net olarak gördüğün metinleri oku

🖼️ GÖRSEL TÜRLERİNE GÖRE YAKLAŞIM:

📄 BELGELER (Fatura, Sözleşme, Form vb.):
- Tüm metinleri eksiksiz oku
- Belge türünü tanımla
- Önemli tarihleri, sayıları, isimleri vurgula
- Belge yapısını açıkla

🧮 MATEMATİK PROBLEMLERİ (ÖZEL KURAL):
- Eğer görsel bir matematik problemi içeriyorsa:
  1. Sadece görsel içeriğini açıkla (denklemleri oku, ne istendiğini belirt)
  2. ASLA matematik problemi çözme - sadece tanımla ve açıkla
  3. Analiz sonunda MUTLAKA şu mesajı ekle:
     "💡 Bu bir matematik problemi gibi görünüyor. Detaylı adım adım çözüm için 'Problem Çözücü' modülünü kullanmanızı öneririz."
- Örnek: "Bu görsel, x^2 + 7xy = 30 ve y^2 - 12xy = -40 denklemlerini içeren bir matematik problemidir. xy değerinin bulunması isteniyor. 💡 Bu bir matematik problemi gibi görünüyor. Detaylı adım adım çözüm için 'Problem Çözücü' modülünü kullanmanızı öneririz."

📸 FOTOĞRAFLAR:
- Sahneyi detaylıca anlat
- İnsanları, objeleri, mekanı tanımla
- Kompozisyon ve estetik değerlendirmesi yap
- Olası zaman, mekan ve bağlamı belirt

🎨 ÇİZİMLER/ŞEMALAR:
- Çizim türünü tanımla (grafik, diagram, şema vb.)
- Tüm sembolleri, etiketleri ve metinleri açıkla
- Yapıyı ve ilişkileri anlat
- Çizimin amacını tahmin et

📱 EKRAN GÖRÜNTÜLERİ:
- Uygulama veya web sitesi ismini belirt
- Ekrandaki tüm metinleri oku
- Ekran yapısını ve öğelerini tanımla
- Kullanıcı arayüzü detaylarını açıkla

Şimdi rol yapma - sen Quorax'un görsel analiz uzmanısın ve kullanıcıya detaylı, profesyonel analizler sunacaksın! 🎨`,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      imageUrl,
      inputMethod = "gallery",
      userId,
      userLanguage = "tr",
      category = "information", // Frontend'den gelen kategori
    } = await req.json();

    if (!imageUrl || !userId) {
      throw new Error("Eksik parametreler: imageUrl ve userId gerekli");
    }

    // Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔍 Aynı görselin daha önce analiz edilip edilmediğini kontrol et (cache - Math modülündeki gibi)
    // Base64'in hash'ini al (ilk 100 karakter yeterli - benzersizlik için)
    const imageHash = imageUrl.substring(0, 100);
    
    // Son 1 saat içinde aynı görseli analiz etmiş mi kontrol et
    const { data: recentAnalyses } = await supabase
      .from("image_analyses")
      .select("id, analysis_result, created_at")
      .eq("user_id", userId)
      .like("image_url", `${imageHash}%`) // Base64'in başlangıcına göre filtrele
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Son 1 saat
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentAnalyses && recentAnalyses.length > 0) {
      console.log("✅ Mevcut analiz bulundu (cache), aynı sonuç döndürülüyor");
      
      // Token maliyetini database'den al (cache için 0 ama bilmek için)
      const { data: tokenCostData } = await supabase
        .from("module_token_costs")
        .select("token_cost")
        .eq("module_id", "imageAnalyzer")
        .eq("is_active", true)
        .single();
      
      const normalTokenCost = tokenCostData?.token_cost || 6;
      
      // Mevcut analizi döndür (cache)
      return new Response(
        JSON.stringify({
          success: true,
          result: recentAnalyses[0].analysis_result,
          tokensUsed: 0, // Cache'den geldiği için token kullanılmadı
          analysisId: recentAnalyses[0].id,
          cached: true,
          metadata: {
            inputMethod,
            model: "claude-3-haiku-20240307",
            cachedAt: recentAnalyses[0].created_at,
            normalTokenCost: normalTokenCost,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // ✅ Token kontrolü
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("tokens")
      .eq("id", userId)
      .single();

    if (profileError || !userProfile) {
      throw new Error("Kullanıcı profili bulunamadı");
    }

    // Token maliyetini database'den al
    const { data: tokenCostData, error: costError } = await supabase
      .from("module_token_costs")
      .select("token_cost")
      .eq("module_id", "imageAnalyzer")
      .eq("is_active", true)
      .single();

    const tokensUsed = tokenCostData?.token_cost || 6; // Fallback: 6 token

    if (userProfile.tokens < tokensUsed) {
      return new Response(
        JSON.stringify({
          error: "Yetersiz token",
          errorCode: "INSUFFICIENT_TOKENS",
          requiredTokens: tokensUsed,
          currentTokens: userProfile.tokens,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Dinamik dil talimatı (Math Solver'daki gibi akıllı)
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
- Görsel analizi hangi dilde yapılmalı? Kullanıcının sistem diline göre başla
- AMA: Eğer görselde farklı bir dil varsa (örneğin görsel İngilizce bir belge ise), analizi o dilde yap
- Genel kural: Görseldeki metin hangi dildeyse, analizi o dilde sun
- Eğer görselde çoklu dil varsa, analizi sistem dilinde yap ama görseldeki metinleri orijinal dillerinde göster
- Varsayılan dil: ${userLanguageName}
`;

    // Claude API çağrısı (vision API)
    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeApiKey) {
      throw new Error("CLAUDE_API_KEY not configured");
    }

    // Base64 image URL'i parse et (Math modülündeki gibi)
    let imageContent = null;
    if (imageUrl.startsWith("data:image")) {
      // Base64 data URL - Math modülündeki regex formatını kullan
      const matches = imageUrl.match(
        /^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/
      );
      if (!matches) {
        throw new Error("Invalid image data URL format");
      }

      const imageType = matches[1];
      const base64Data = matches[2];

      imageContent = {
        type: "image",
        source: {
          type: "base64",
          media_type: `image/${imageType}`,
          data: base64Data,
        },
      };
    } else {
      throw new Error("Only base64 data URLs are supported");
    }

    // Claude API çağrısı (Math modülündeki gibi - retry yok, tek istek)
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Çalışan model (Math'teki gibi)
        max_tokens: 2048, // Math modülündeki gibi
        temperature: 0, // Deterministic sonuçlar için
        system: AI_PROMPTS.IMAGE_ANALYZER + dynamicLanguageInstruction,
        messages: [
          {
            role: "user",
            content: [
              imageContent,
              {
                type: "text",
                text: userLanguage === "en"
                  ? "Analyze this image in detail. Describe what you see, extract any text if present, identify objects, colors, and provide a comprehensive analysis."
                  : "Bu görseli detaylıca analiz et. Gördüklerini açıkla, varsa metni çıkar, nesneleri ve renkleri tanımla ve kapsamlı bir analiz sun.",
              },
            ],
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      console.error("Claude API Error:", error);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const analysisResult = claudeData.content[0].text;

    // ✅ Token düşür
    const { error: tokenError } = await supabase.rpc("update_user_tokens", {
      user_id: userId,
      amount: -tokensUsed,
      transaction_type: "usage",
      description: "Image Analyzer - görsel analizi",
      reference_id: null,
      reference_type: "imageAnalyzer",
    });

    if (tokenError) {
      console.error("Token update error:", tokenError);
    }

    // Sonucu database'e kaydet
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("image_analyses")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        analysis_result: analysisResult,
        input_method: inputMethod,
        tokens_used: tokensUsed,
        ai_model: "claude-3-haiku-20240307", // Kullanılan model ile tutarlı
        metadata: {
          userLanguage,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save analysis error:", saveError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: analysisResult,
        tokensUsed,
        analysisId: savedAnalysis?.id,
        metadata: {
          inputMethod,
          model: "claude-3-haiku-20240307", // Math modülündeki gibi
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

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        errorDetails: error.toString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});

