// 📝 PROCESS TEXT EDITOR - Edge Function
// Text Editor modülü işlemlerini yönetir (grammar check, summarize, email, tone, length)

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🎯 AI PROMPTS - Inline (Dashboard deploy için)
const AI_PROMPTS = {
  TEXT_EDITOR: `Sen Quorax'un metin düzenleme uzmanısın! ✍️

🎯 KİMLİK VE KURALLAR:

SEN KİMSİN:
- İsmin: Quorax Metin Düzenleme Asistanı (veya sadece Quorax)
- Quorax uygulamasının metin düzenleme uzmanısın
- Kullanıcılara profesyonel, kaliteli metinler oluşturmak için buradasın
- Dilbilgisi, stil ve netlik konularında uzmansın

⚠️ KRİTİK KURALLAR - MUTLAKA UYACAKSIN:
- ASLA "Claude", "GPT", "OpenAI", "ChatGPT", "Anthropic" veya diğer AI isimlerini kullanma
- ASLA "Ben bir dil modeli" veya "Ben bir yapay zeka" gibi ifadeler kullanma
- "Sen kimsin?" sorusuna: "Ben Quorax'un metin düzenleme asistanıyım! Metinlerini geliştirmeye hazırım ✍️"
- Hangi AI olduğunu, kim tarafından yapıldığını ASLA söyleme
- Teknik altyapından bahsetme

📝 MODLARA GÖRE YAKLAŞIM:

1️⃣ YAZIM & DİLBİLGİSİ KONTROLÜ:
   - Tüm yazım hatalarını düzelt
   - Dilbilgisi kurallarını uygula
   - Noktalama işaretlerini düzenle
   - Tutarlılığı sağla (büyük/küçük harf, sayı formatı vb.)
   - Metni daha akıcı hale getir

2️⃣ ÖZET ÇIKARMA:
   - Ana fikirleri belirle
   - Önemli detayları koru
   - Gereksiz tekrarları kaldır
   - Özeti okunabilir ve mantıklı yap
   - Orijinal anlamı koru

3️⃣ E-POSTA YAZMA:
   - Profesyonel ve samimi ton kullan
   - Net bir konu ve amaç belirle
   - Uygun selamlama ve kapanış kullan
   - Kısa, öz ve etkili ol
   - İstenen tona göre ayarla (resmi/samimi)

4️⃣ STİL AYARLAMA:
   - Metni istenen stile göre düzenle
   - Tonu ayarla (profesyonel, samimi, akademik vb.)
   - Kelime seçimlerini uygun hale getir
   - Cümle yapılarını düzenle
   - Genel akışı iyileştir

5️⃣ UZUNLUK OPTİMİZASYONU:
   - Metni daha kısa ama anlamlı hale getir
   - Önemli bilgileri koru
   - Gereksiz kelimeleri ve cümleleri kaldır
   - Öz ve net ol
   - Orijinal mesajı koru

🎯 GELİŞMİŞ AYARLAR:

1️⃣ HEDEF KİTLE (TARGET AUDIENCE):
   - **Çocuklar (children):** Basit kelimeler, kısa cümleler, anlaşılır dil
   - **Gençler (teen):** Güncel dil, samimi ton, akıcı cümleler
   - **Profesyonel (professional):** İş dünyası dili, net ve etkili
   - **Akademik (academic):** Bilimsel dil, formal ton, teknik terimler
   - **Genel (general):** Dengeli ve erişilebilir dil

2️⃣ ÇIKTI FORMATI (OUTPUT FORMAT):
   - **Düz Metin (plain):** Normal metin formatı
   - **Markdown:** Başlıklar, listeler, kalın/italik formatı
   - **HTML:** HTML etiketleri ile formatlanmış
   - **JSON:** Yapılandırılmış JSON formatı
   - **XML:** XML etiketleri ile formatlanmış

3️⃣ AKADEMİK STİL:
   - **APA:** American Psychological Association formatı
   - **MLA:** Modern Language Association formatı
   - **Chicago:** Chicago Manual of Style formatı
   - **Yok (none):** Akademik format uygulanmaz

4️⃣ TON ANALİZİ:
   - Eğer etkinse, mevcut metnin tonunu analiz et
   - Mevcut tonu belirt (profesyonel, samimi, resmi, dostça vb.)
   - Önerilen tonu belirt ve açıkla
   - Metadata'ya ekle: toneBefore, toneAfter

5️⃣ OKUNABİLİRLİK SKORU:
   - Eğer etkinse, metnin okunabilirlik skorunu hesapla
   - Flesch-Kincaid skoru kullan (0-100 arası, yüksek = daha okunabilir)
   - Önce ve sonra skorları karşılaştır
   - Okuma süresini tahmin et (kelime sayısına göre)
   - Metadata'ya ekle: readabilityBefore, readabilityAfter, readingTime

💬 DÜZENLEME STİLİN:
- Profesyonel ve dikkatli
- Orijinal anlamı koru
- Okunabilir ve akıcı
- İstenen formata uygun
- Kullanıcı isteklerine saygılı

📂 KATEGORİ: ÜRETKENLİK (PRODUCTIVITY)
- Metin düzenleme ve yazma verimliliğini artırmak için buradasın
- Kullanıcının üretkenliğini destekle - hızlı, kaliteli sonuçlar ver
- Profesyonel metinler oluştur - iş, akademik ve günlük kullanım için
- Zaman tasarrufu sağla - direkt sonuç ver, gereksiz açıklamalardan kaçın
- Kullanıcının iş akışını optimize et

⚠️ GELİŞMİŞ AYARLAR KURALLARI:
- **Hedef Kitle:** Metni seçilen hedef kitleye göre uyarla (dil seviyesi, ton, stil)
- **Çıktı Formatı:** Seçilen formatı kullan (Markdown, HTML, JSON, XML)
- **Akademik Stil:** Akademik stil seçildiyse, format kurallarına uy (APA, MLA, Chicago)
- **Ton Analizi:** Etkinse, mevcut tonu analiz et ve öneriler sun
- **Okunabilirlik:** Etkinse, okunabilirlik skorunu hesapla ve metadata'ya ekle

✅ YAPACAKLARIN:
- Metni dikkatlice incele (tüm hataları tespit et)
- Hataları düzelt (yazım, dilbilgisi, noktalama)
- Stili iyileştir (akıcılık, netlik, profesyonellik)
- Netliği artır
- Kullanıcının istediğini yap (mode'a göre işlem yap)
- **DİREKT DÜZELTİLMİŞ METNİ VER - Önce açıklama yapma, "tabii size düzelteceğim" gibi mesajlar yazma**
- Sadece düzenlenmiş metni döndür, başlık veya giriş cümlesi yok
- Mode'a göre doğru işlemi yap (fix, summarize, email, tone, length)
- Gelişmiş ayarları dikkate al (targetAudience, outputFormat, academicStyle)

❌ YAPMAYACAKLARIN:
- Orijinal anlamı değiştirme
- Gereksiz değişiklikler yapma
- Kullanıcının tonunu tamamen değiştirme (sadece iyileştir)
- Önemli bilgileri kaldırma
- Metni gereğinden fazla kısaltma
- **Açıklama veya giriş mesajı yazma - direkt düzenlenmiş metni ver**
- "Tabii size..." veya "Düzeltiyorum..." gibi ifadeler kullanma
- Düzenlenmiş metnin başına veya sonuna ekstra açıklama ekleme

Şimdi rol yapma - sen Quorax'un metin düzenleme uzmanısın ve kullanıcıya kaliteli metinler sunacaksın! 📝`,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      inputText,
      mode,
      userId,
      userLanguage = "tr",
      category = "productivity", // Frontend'den gelen kategori
      emailTo = null,
      emailSubject = null,
      emailTone = "professional",
      // Gelişmiş ayarlar
      targetAudience = "general", // children, teen, professional, academic, general
      outputFormat = "plain", // plain, markdown, html, json, xml
      academicStyle = "none", // none, apa, mla, chicago
      toneAnalysisEnabled = false,
      readabilityScoreEnabled = true,
    } = await req.json();

    if (!inputText || !mode || !userId) {
      throw new Error("Eksik parametreler: inputText, mode, userId gerekli");
    }

    // Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ Token kontrolü - Kullanıcının yeterli token'ı var mı?
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
      .eq("module_id", "textEditor")
      .eq("is_active", true)
      .single();

    const tokensUsed = tokenCostData?.token_cost || 3; // Fallback: 3 token

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
- Metin düzenleme hangi dilde yapılmalı? Kullanıcının sistem diline göre başla
- AMA: Eğer kullanıcı farklı bir dilde yazıyorsa (örneğin sistem Türkçe ama kullanıcı İngilizce metin gönderiyorsa), düzenlemeyi o dilde yap
- Genel kural: Kullanıcı hangi dilde yazıyorsa, düzenlenmiş metni o dilde döndür
- Varsayılan dil: ${userLanguageName}
`;

    // Gelişmiş ayarlar talimatı
    const advancedSettingsInstruction = `
🎯 GELİŞMİŞ AYARLAR:
- **Hedef Kitle:** ${targetAudience === "children" ? "Çocuklar için basit ve anlaşılır dil kullan" : targetAudience === "teen" ? "Gençler için güncel ve samimi dil kullan" : targetAudience === "professional" ? "Profesyonel iş dünyası dili kullan" : targetAudience === "academic" ? "Akademik ve bilimsel dil kullan" : "Genel ve erişilebilir dil kullan"}
- **Çıktı Formatı:** ${outputFormat === "markdown" ? "Markdown formatında döndür (başlıklar, listeler, kalın/italik)" : outputFormat === "html" ? "HTML formatında döndür (HTML etiketleri ile)" : outputFormat === "json" ? "JSON formatında döndür (yapılandırılmış)" : outputFormat === "xml" ? "XML formatında döndür (XML etiketleri ile)" : "Düz metin formatında döndür"}
- **Akademik Stil:** ${academicStyle === "apa" ? "APA format kurallarına uy (American Psychological Association)" : academicStyle === "mla" ? "MLA format kurallarına uy (Modern Language Association)" : academicStyle === "chicago" ? "Chicago format kurallarına uy (Chicago Manual of Style)" : "Akademik format uygulanmayacak"}
- **Ton Analizi:** ${toneAnalysisEnabled ? "Mevcut metnin tonunu analiz et ve metadata'ya ekle (toneBefore, toneAfter)" : "Ton analizi yapılmayacak"}
- **Okunabilirlik Skoru:** ${readabilityScoreEnabled ? "Okunabilirlik skorunu hesapla ve metadata'ya ekle (readabilityBefore, readabilityAfter, readingTime)" : "Okunabilirlik skoru hesaplanmayacak"}
`;

    // Mode'a göre prompt oluştur
    const getPrompt = (mode, inputText, emailTo, emailSubject, emailTone) => {
      const isEnglish = userLanguage === "en";
      
      switch (mode) {
        case "fix":
          return isEnglish
            ? `You are a professional grammar and spelling checker. Correct the following text, fixing all grammar, spelling, and punctuation errors. Return ONLY the corrected text, no explanations or introductory messages:\n\n${inputText}`
            : `Sen profesyonel bir yazım ve dilbilgisi kontrolcüsüsün. Aşağıdaki metindeki tüm yazım, dilbilgisi ve noktalama hatalarını düzelt. SADECE düzeltilmiş metni döndür, açıklama veya giriş mesajı yazma:\n\n${inputText}`;

        case "summarize":
          return isEnglish
            ? `Summarize the following text concisely, capturing the main points and key information. Return ONLY the summary, no explanations or introductory messages:\n\n${inputText}`
            : `Aşağıdaki metni özetle, ana noktaları ve önemli bilgileri yakalayarak. SADECE özeti döndür, açıklama veya giriş mesajı yazma:\n\n${inputText}`;

        case "email":
          const recipient = emailTo || (isEnglish ? "recipient" : "alıcı");
          const subject = emailSubject || (isEnglish ? "Subject" : "Konu");
          const toneText = isEnglish
            ? emailTone === "professional"
              ? "professional and formal"
              : emailTone === "casual"
              ? "casual and friendly"
              : emailTone === "formal"
              ? "very formal and respectful"
              : "warm and friendly"
            : emailTone === "professional"
            ? "profesyonel ve resmi"
            : emailTone === "casual"
            ? "günlük ve samimi"
            : emailTone === "formal"
            ? "çok resmi ve saygılı"
            : "sıcak ve samimi";
          
          return isEnglish
            ? `Write a ${toneText} email to ${recipient} with the subject "${subject}". Email content:\n\n${inputText}\n\nReturn ONLY the complete email (subject line and body), no explanations or introductory messages.`
            : `"${subject}" konulu, ${recipient} adresine gönderilecek ${toneText} bir e-posta yaz. E-posta içeriği:\n\n${inputText}\n\nSADECE tam e-postayı (konu satırı ve gövde) döndür, açıklama veya giriş mesajı yazma.`;

        case "tone":
          return isEnglish
            ? `Adjust the tone of the following text to be more professional and polished, while maintaining the original meaning. Return ONLY the adjusted text, no explanations:\n\n${inputText}`
            : `Aşağıdaki metnin tonunu daha profesyonel ve kusursuz hale getir, ancak orijinal anlamı koru. SADECE ayarlanmış metni döndür, açıklama yazma:\n\n${inputText}`;

        case "length":
          return isEnglish
            ? `Optimize the length of the following text, making it more concise while preserving all important information. Return ONLY the optimized text, no explanations:\n\n${inputText}`
            : `Aşağıdaki metnin uzunluğunu optimize et, tüm önemli bilgileri koruyarak daha kısa hale getir. SADECE optimize edilmiş metni döndür, açıklama yazma:\n\n${inputText}`;

        default:
          throw new Error(`Unknown mode: ${mode}`);
      }
    };

    const prompt = getPrompt(mode, inputText, emailTo, emailSubject, emailTone);

    // Claude API çağrısı
    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeApiKey) {
      throw new Error("CLAUDE_API_KEY not configured");
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
        model: "claude-3-haiku-20240307",
        max_tokens: 2048, // Math modülündeki gibi
        temperature: 0, // Deterministic sonuçlar için
        system: AI_PROMPTS.TEXT_EDITOR + dynamicLanguageInstruction + advancedSettingsInstruction,
        messages: [
          {
            role: "user",
            content: prompt,
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
    const resultText = claudeData.content[0].text;

    // Metadata hesaplama (okunabilirlik skoru, ton analizi)
    let metadata = {
      mode,
      model: "claude-3-haiku-20240307",
      targetAudience,
      outputFormat,
      academicStyle,
    };

    // Okunabilirlik skoru hesaplama (basit Flesch-Kincaid benzeri)
    if (readabilityScoreEnabled) {
      const calculateReadability = (text) => {
        // Basit okunabilirlik skoru (0-100)
        // Kelime sayısı, cümle sayısı, ortalama kelime uzunluğu
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
        const avgWordLength = words.length > 0 
          ? words.reduce((sum, w) => sum + w.length, 0) / words.length 
          : 0;
        
        // Basit skor hesaplama (0-100, yüksek = daha okunabilir)
        let score = 100;
        score -= avgWordsPerSentence > 20 ? 20 : avgWordsPerSentence * 1;
        score -= avgWordLength > 5 ? 15 : avgWordLength * 3;
        score = Math.max(0, Math.min(100, score));
        
        return Math.round(score * 10) / 10; // 1 ondalık
      };

      const readingTimeEstimate = (text) => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const minutes = Math.ceil(words / 200); // Ortalama 200 kelime/dakika
        return minutes > 0 ? `${minutes} dk` : "<1 dk";
      };

      metadata.readabilityBefore = calculateReadability(inputText);
      metadata.readabilityAfter = calculateReadability(resultText);
      metadata.readingTime = readingTimeEstimate(resultText);
    }

    // Ton analizi (basit keyword analizi)
    if (toneAnalysisEnabled) {
      const analyzeTone = (text) => {
        const lowerText = text.toLowerCase();
        let tone = "genel";
        
        // Basit ton tespiti
        if (lowerText.includes("lütfen") || lowerText.includes("rica") || lowerText.includes("memnun")) {
          tone = "resmi";
        } else if (lowerText.includes("merhaba") || lowerText.includes("selam") || lowerText.includes("hey")) {
          tone = "samimi";
        } else if (lowerText.includes("sayın") || lowerText.includes("değerli") || lowerText.includes("önemli")) {
          tone = "profesyonel";
        } else if (lowerText.includes("teşekkür") || lowerText.includes("sağol") || lowerText.includes("teşekkürler")) {
          tone = "dostça";
        }
        
        return tone;
      };

      metadata.toneBefore = analyzeTone(inputText);
      metadata.toneAfter = analyzeTone(resultText);
    }

    // ✅ Token düşür
    const { error: tokenError } = await supabase.rpc("update_user_tokens", {
      user_id: userId,
      amount: -tokensUsed,
      transaction_type: "usage",
      description: `Text Editor - ${mode}`,
      reference_id: null,
      reference_type: "textEditor",
    });

    if (tokenError) {
      console.error("Token update error:", tokenError);
    }

    // Sonucu database'e kaydet
    const { data: savedResult, error: saveError } = await supabase
      .from("text_editor_results")
      .insert({
        user_id: userId,
        input_text: inputText,
        result_text: resultText,
        mode: mode,
        email_to: emailTo || null,
        email_subject: emailSubject || null,
        email_tone: mode === "email" ? emailTone : null,
        tokens_used: tokensUsed,
        ai_model: "claude-3-haiku-20240307",
        metadata: {
          userLanguage,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save result error:", saveError);
    }

    // Başarılı yanıt
    return new Response(
      JSON.stringify({
        success: true,
        result: resultText,
        tokensUsed,
        resultId: savedResult?.id,
        metadata: metadata, // Gelişmiş metadata (okunabilirlik, ton analizi vb.)
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

