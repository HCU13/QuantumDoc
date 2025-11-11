// 📋 GENERATE NOTE - Edge Function
// Note Generator modülü not oluşturma işlemlerini yönetir

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🎯 AI PROMPTS - Inline (Dashboard deploy için)
const AI_PROMPTS = {
  NOTE_GENERATOR: `Sen Quorax'un not oluşturma uzmanısın! 📄

🎯 KİMLİK VE KURALLAR:

SEN KİMSİN:
- İsmin: Quorax Not Oluşturma Asistanı (veya sadece Quorax)
- Quorax uygulamasının not oluşturma uzmanısın
- Kullanıcılara organize, yapılandırılmış notlar oluşturmak için buradasın
- Bilgiyi düzenleme ve sunma konusunda uzmansın

⚠️ KRİTİK KURALLAR - MUTLAKA UYACAKSIN:
- ASLA "Claude", "GPT", "OpenAI", "ChatGPT", "Anthropic" veya diğer AI isimlerini kullanma
- ASLA "Ben bir dil modeli" veya "Ben bir yapay zeka" gibi ifadeler kullanma
- "Sen kimsin?" sorusuna: "Ben Quorax'un not oluşturma asistanıyım! Organize notlar hazırlamaya hazırım 📄"
- Hangi AI olduğunu, kim tarafından yapıldığını ASLA söyleme
- Teknik altyapından bahsetme

📋 NOT OLUŞTURMA YAKLAŞIMIN:

1️⃣ BİLGİ TOPLAMA:
   - Verilen bilgileri analiz et
   - Ana konuları belirle
   - Önemli detayları ayırt et
   - İlişkileri ve bağlantıları tespit et

2️⃣ YAPILANDIRMA:
   - Notları mantıklı başlıklara böl
   - Hiyerarşik bir yapı oluştur
   - Madde işaretleri ve numaralama kullan
   - Bölümler arası geçişleri net yap

3️⃣ İÇERİK DÜZENLEME:
   - Ana fikirleri öne çıkar
   - Destekleyici detayları ekle
   - Örnekleri ve açıklamaları dahil et
   - Gereksiz tekrarları kaldır

4️⃣ FORMATLAMA:
   - Okunabilir bir düzen oluştur
   - Başlıkları vurgula
   - Madde işaretlerini kullan
   - Paragrafları net ayır

5️⃣ KALİTE KONTROLÜ:
   - Notların tutarlı olduğunu kontrol et
   - Dilbilgisini düzelt
   - Netliği artır
   - Eksiklikleri tamamla

💬 NOT STİLİN:
- Organize ve yapılandırılmış
- Net ve anlaşılır
- Öz ve bilgilendirici
- Profesyonel ama erişilebilir
- Görsel olarak düzenli

📂 KATEGORİ: ÜRETKENLİK (PRODUCTIVITY)
- Not oluşturma ve bilgi organizasyonu konusunda uzmanlaşmışsın
- Kullanıcının üretkenliğini artırmak için organize notlar hazırla
- Bilgiyi düzenli ve erişilebilir şekilde sun - zaman tasarrufu sağla
- Profesyonel ve akademik kullanım için uygun notlar oluştur
- Kullanıcının iş akışını destekle - hızlı ve etkili notlar

✅ YAPACAKLARIN:
- Verilen bilgilerden kapsamlı ve organize notlar oluştur
- Bilgiyi mantıklı şekilde düzenle (başlıklar, alt başlıklar, maddeler)
- Önemli noktaları vurgula
- Okunabilir format kullan (madde işaretleri, numaralandırma)
- Kullanıcının ihtiyacına göre uyarla (mode'a göre format)
- **DİREKT NOTU VER - Önce açıklama yapma, "tabii size not hazırlayacağım" gibi mesajlar yazma**
- Sadece hazırlanmış notu döndür, başlık veya giriş cümlesi yok
- Notları yapılandırılmış ve profesyonel sun
- Gereksiz tekrarları kaldır ama önemli bilgileri koru

❌ YAPMAYACAKLARIN:
- Bilgi uydurma veya ekleme (sadece verilen bilgileri kullan)
- Gereksiz detaylarla doldurma
- Dağınık veya organize olmayan notlar
- Okunması zor formatlar
- Kullanıcının isteğini göz ardı etme
- **Açıklama veya giriş mesajı yazma - direkt notu ver**
- "Tabii size..." veya "Hazırlıyorum..." gibi ifadeler kullanma
- Notun başına veya sonuna ekstra açıklama ekleme

📚 NOT TÜRLERİ (MODE'LAR):

📝 HIZLI NOT (quick):
- Hızlı ve öz notlar
- Madde işaretleri ile organize
- Temel bilgileri öne çıkar
- Kısa ve net

📋 TOPLANTI NOTU (meeting):
- Toplantı konusu ve tarihi
- Katılımcılar listesi
- Gündem maddeleri
- Alınan kararlar
- Eylem maddeleri ve sorumluları
- Sonraki adımlar ve tarihler

📚 DERS NOTU (lesson):
- Konu başlıkları ve alt başlıklar
- Ana kavramlar ve tanımlar
- Örnekler ve uygulamalar
- Önemli formüller veya kurallar
- Özet ve tekrar noktaları

📁 PROJE NOTU (project):
- Proje hedefleri ve kapsamı
- Görevler ve sorumlular
- İlerleme durumu
- Karşılaşılan engeller
- Sonraki adımlar ve tarihler
- Notlar ve öneriler

📖 ÖZET NOTU (summary):
- Ana fikirler ve temalar
- Destekleyici detaylar
- Sonuçlar ve çıkarımlar
- Önemli noktaların vurgulanması

✅ YAPILACAKLAR LİSTESİ (todo):
- Yapılandırılmış görev listesi
- Öncelik sıralaması
- Checkbox formatında
- Tarih ve sorumlu bilgileri

Şimdi rol yapma - sen Quorax'un not oluşturma uzmanısın ve kullanıcıya kaliteli, organize notlar sunacaksın! 📚`,
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
      inputText, 
      mode, 
      userId, 
      userLanguage = "tr",
      category = "productivity", // Frontend'den gelen kategori
      noteFormat = "plain",
      noteStyle = "casual",
      noteLength = "medium",
    } = await req.json();

    if (!inputText || !mode || !userId) {
      throw new Error("Eksik parametreler: inputText, mode, userId gerekli");
    }

    // Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      .eq("module_id", "noteGenerator")
      .eq("is_active", true)
      .single();

    const tokensUsed = tokenCostData?.token_cost || 4; // Fallback: 4 token

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
- Not hangi dilde oluşturulmalı? Kullanıcının sistem diline göre başla
- AMA: Eğer kullanıcı farklı bir dilde yazıyorsa (örneğin sistem Türkçe ama kullanıcı İngilizce metin gönderiyorsa), notu o dilde oluştur
- Genel kural: Kullanıcı hangi dilde yazıyorsa, notu o dilde oluştur
- Varsayılan dil: ${userLanguageName}
`;

    // Gelişmiş ayarlar talimatları
    const buildAdvancedSettingsInstruction = () => {
      const isEnglish = userLanguage === "en";
      let instructions = [];

      // Format
      if (noteFormat !== "plain") {
        const formatMap = {
          markdown: isEnglish ? "Format the output as Markdown" : "Çıktıyı Markdown formatında döndür",
          html: isEnglish ? "Format the output as HTML" : "Çıktıyı HTML formatında döndür",
          json: isEnglish ? "Format the output as JSON" : "Çıktıyı JSON formatında döndür",
        };
        instructions.push(formatMap[noteFormat]);
      }

      // Style
      const styleMap = {
        academic: isEnglish ? "Use academic writing style - formal, structured, with citations if needed" : "Akademik yazım stili kullan - resmi, yapılandırılmış, gerekiyorsa referanslarla",
        formal: isEnglish ? "Use formal writing style - professional and respectful" : "Resmi yazım stili kullan - profesyonel ve saygılı",
        casual: isEnglish ? "Use casual writing style - friendly and approachable" : "Günlük yazım stili kullan - samimi ve erişilebilir",
        summary: isEnglish ? "Use summary style - concise and to the point" : "Özet stili kullan - kısa ve öz",
      };
      instructions.push(styleMap[noteStyle]);

      // Length
      const lengthMap = {
        short: isEnglish ? "Keep it brief and concise - only essential information" : "Kısa ve öz tut - sadece temel bilgiler",
        medium: isEnglish ? "Moderate length - include important details" : "Orta uzunlukta - önemli detayları dahil et",
        long: isEnglish ? "Detailed and comprehensive - include all relevant information with examples" : "Detaylı ve kapsamlı - tüm ilgili bilgileri örneklerle dahil et",
      };
      instructions.push(lengthMap[noteLength]);

      return instructions.length > 0 
        ? (isEnglish 
            ? `\n\n⚠️ IMPORTANT REQUIREMENTS:\n${instructions.map(i => `- ${i}`).join("\n")}`
            : `\n\n⚠️ ÖNEMLİ GEREKSİNİMLER:\n${instructions.map(i => `- ${i}`).join("\n")}`)
        : "";
    };

    // Mode'a göre prompt oluştur
    const getPrompt = (mode, inputText) => {
      const isEnglish = userLanguage === "en";
      const advancedSettings = buildAdvancedSettingsInstruction();

      let basePrompt = "";
      switch (mode) {
        case "quick":
          basePrompt = isEnglish
            ? `Create a quick note from the following information. Organize it clearly with bullet points. Return ONLY the note, no explanations or introductory messages:\n\n${inputText}`
            : `Aşağıdaki bilgilerden hızlı bir not oluştur. Açık ve düzenli bir şekilde maddeler halinde düzenle. SADECE notu döndür, açıklama veya giriş mesajı yazma:\n\n${inputText}`;
          break;

        case "meeting":
          basePrompt = isEnglish
            ? `Create a professional meeting note from the following information. Include: date, participants, agenda items, decisions made, and action items. Return ONLY the note, no explanations:\n\n${inputText}`
            : `Aşağıdaki bilgilerden profesyonel bir toplantı notu oluştur. Şunları dahil et: tarih, katılımcılar, gündem maddeleri, alınan kararlar ve yapılacaklar. SADECE notu döndür, açıklama yazma:\n\n${inputText}`;
          break;

        case "lesson":
          basePrompt = isEnglish
            ? `Create a lesson note from the following information. Include: topic headings, main concepts and definitions, examples and explanations, important formulas or rules. Return ONLY the note, no explanations:\n\n${inputText}`
            : `Aşağıdaki bilgilerden ders notu oluştur. Şunları dahil et: konu başlıkları, ana kavramlar ve tanımlar, örnekler ve açıklamalar, önemli formüller veya kurallar. SADECE notu döndür, açıklama yazma:\n\n${inputText}`;
          break;

        case "project":
          basePrompt = isEnglish
            ? `Create a project note from the following information. Include: project goals and scope, tasks and responsible persons, progress status, obstacles encountered, next steps and dates, notes and recommendations. Return ONLY the note, no explanations:\n\n${inputText}`
            : `Aşağıdaki bilgilerden proje notu oluştur. Şunları dahil et: proje hedefleri ve kapsamı, görevler ve sorumlular, ilerleme durumu, karşılaşılan engeller, sonraki adımlar ve tarihler, notlar ve öneriler. SADECE notu döndür, açıklama yazma:\n\n${inputText}`;
          break;

        case "summary":
          basePrompt = isEnglish
            ? `Create a comprehensive summary note from the following text. Highlight key points and main ideas. Return ONLY the summary note, no explanations:\n\n${inputText}`
            : `Aşağıdaki metinden kapsamlı bir özet not oluştur. Ana noktaları ve temel fikirleri vurgula. SADECE özet notu döndür, açıklama yazma:\n\n${inputText}`;
          break;

        case "todo":
          basePrompt = isEnglish
            ? `Create a structured to-do list note from the following information. Organize tasks with checkboxes and prioritize if needed. Return ONLY the to-do list, no explanations:\n\n${inputText}`
            : `Aşağıdaki bilgilerden yapılandırılmış bir yapılacaklar listesi notu oluştur. Görevleri checkbox'larla düzenle ve gerekiyorsa önceliklendir. SADECE yapılacaklar listesini döndür, açıklama yazma:\n\n${inputText}`;
          break;

        default:
          throw new Error(`Unknown mode: ${mode}`);
      }

      return basePrompt + advancedSettings;
    };

    const prompt = getPrompt(mode, inputText);

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
        system: AI_PROMPTS.NOTE_GENERATOR + dynamicLanguageInstruction,
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
    const generatedNote = claudeData.content[0].text;

    // ✅ Token düşür
    const { error: tokenError } = await supabase.rpc("update_user_tokens", {
      user_id: userId,
      amount: -tokensUsed,
      transaction_type: "usage",
      description: `Note Generator - ${mode}`,
      reference_id: null,
      reference_type: "noteGenerator",
    });

    if (tokenError) {
      console.error("Token update error:", tokenError);
    }

    // Sonucu database'e kaydet
    const { data: savedNote, error: saveError } = await supabase
      .from("generated_notes")
      .insert({
        user_id: userId,
        input_text: inputText,
        generated_note: generatedNote,
        mode: mode,
        tokens_used: tokensUsed,
        ai_model: "claude-3-haiku-20240307",
        metadata: {
          userLanguage,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save note error:", saveError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: generatedNote,
        tokensUsed,
        noteId: savedNote?.id,
        metadata: {
          mode,
          model: "claude-3-haiku-20240307",
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

