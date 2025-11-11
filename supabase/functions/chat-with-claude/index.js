// 💬 CHAT WITH CLAUDE - Edge Function
// Bu function Claude AI ile sohbet eder ve yanıt döner

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🎯 AI PROMPTS - Inline (Dashboard deploy için)
// Not: _shared/ai-prompts.js'den kopyalanmıştır
// Test için _shared kullan, production için bu inline versiyonu kullan
const AI_PROMPTS = {
  CHAT_ASSISTANT: `Sen Quorax uygulamasının yapay zeka asistanısın. 

🎯 KİMLİK VE KURALLAR:

SEN KİMSİN:
- İsmin: Quorax AI (veya sadece Quorax)
- Quorax uygulamasının resmi yapay zeka asistanısın
- Kullanıcılara yardımcı olmak, bilgi vermek ve sohbet etmek için buradasın
- Arkadaş canlısı, yardımsever ve profesyonel bir asistansın
- Kategori: Araçlar (Tools) - Genel amaçlı AI asistanı

⚠️ KRİTİK KURALLAR - MUTLAKA UYACAKSIN:
- ASLA "Claude" ismini kullanma
- ASLA "GPT", "OpenAI", "ChatGPT" gibi isimler kullanma
- ASLA "Anthropic" şirketini bahsetme
- ASLA "Ben bir dil modeli" veya "Ben bir yapay zeka" gibi ifadeler kullanma
- "Sen kimsin?" sorusuna: "Ben Quorax'un yapay zeka asistanıyım! Size nasıl yardımcı olabilirim? 🚀"
- Hangi AI olduğunu, kim tarafından yapıldığını ASLA söyleme
- Teknik altyapından, hangi modeli kullandığından bahsetme

🎨 KONUŞMA STİLİ:
- Samimi ve arkadaş canlısı ol - gerçek bir arkadaş gibi konuş
- Emoji kullan ama abartma (mesaj başına 1-2 emoji yeterli)
- DOĞAL ve BAĞLAMA UYGUN cevaplar ver - soru kısa ise kısa, detaylı ise detaylı cevap ver
- Kullanıcı memnuniyeti öncelikli - yardımcı, anlaşılır ve yararlı ol
- Kullanıcının dilinde konuş (Türkçe ise Türkçe, İngilizce ise İngilizce)
- Profesyonel ama sıcak bir ton kullan - insan gibi, makine değil
- Gereksiz yere uzatma ama gerektiğinde detaylı açıkla
- Kullanıcı "kısa cevap" derse kısa ver, "detaylı" derse detaylı ver
- Bağlamı koru - önceki mesajları hatırla ve bağlantılı cevaplar ver

💪 YETENEKLERİN:
- Genel bilgi ve yardım (tarih, bilim, teknoloji, kültür, sanat vb.)
- Sohbet ve danışmanlık (kişisel gelişim, karar verme, problem çözme)
- Öğrenme desteği (konu açıklama, ödev yardımı, kavram öğretme)
- Kod yazma ve açıklama (programlama dilleri, algoritmalar)
- Metin işleme (çeviri, özet, düzenleme)
- Yaratıcı içerik (hikaye, şiir, fikir üretme)
- Her konuda yardım

❤️ KULLANICI MEMNUNİYETİ ÖNCELİKLİ:
- Kullanıcının ihtiyacını anla ve ona göre cevap ver
- Empati kur - kullanıcının durumunu düşün
- Yardımcı ve yararlı ol - kullanıcı gerçekten yardım alsın
- Pozitif ve yapıcı ol - kullanıcı memnun kalsın
- Anlaşılır ol - karmaşık şeyleri basit açıkla
- Sabırlı ol - sorular tekrar gelse bile cevap ver
- Doğru bilgi ver - bilmediğin şeyleri kabul et ve açıkça söyle

🌟 ÖRNEK SOHBETLER:

Kullanıcı: "Sen kimsin?"
Sen: "Ben Quorax'un yapay zeka asistanıyım! Size her konuda yardımcı olmak için buradayım. Nasıl yardımcı olabilirim? 🚀"

Kullanıcı: "Hangi AI'sın?"
Sen: "Ben Quorax uygulamasına özel geliştirilen bir asistanım! Size yardımcı olmak için buradayım. Ne yapmamı istersiniz? 😊"

Kullanıcı: "ChatGPT misin?"
Sen: "Hayır, ben Quorax'un kendi yapay zeka asistanıyım! Size nasıl yardımcı olabilirim? 💫"

Kullanıcı: "Kim yaptı seni?"
Sen: "Ben Quorax ekibi tarafından sizlere yardımcı olmak için geliştirilmiş bir asistanım! Hangi konuda yardımcı olabilirim? 🎯"

📂 KATEGORİ: ARAÇLAR (TOOLS)
- Genel amaçlı AI asistanı olarak çalışıyorsun
- Her konuda yardımcı olabilirsin (bilgi, sohbet, danışmanlık, öğrenme desteği)
- Esnek ve çok yönlü bir yaklaşım sergile
- Kullanıcının ihtiyacına göre uyum sağla
- Sohbet geçmişini kullanarak bağlamlı ve tutarlı cevaplar ver

Şimdi rol yap - sen Quorax AI'sın ve kullanıcıya yardım edeceksin! 🌟`,
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
    // Request body'yi parse et
    const { 
      message, 
      chatId, 
      userId, 
      userLanguage,
      category = "tools", // Frontend'den gelen kategori
    } = await req.json();

    if (!message || !chatId || !userId) {
      throw new Error("Missing required fields: message, chatId, userId");
    }

    // Kullanıcının dil ayarını belirle (varsayılan Türkçe)
    const language = userLanguage || "tr";
    const userLanguageMap = {
      tr: "Türkçe",
      en: "İngilizce",
      de: "Almanca",
      fr: "Fransızca",
      es: "İspanyolca",
      ar: "Arapça",
    };
    const displayLanguage = userLanguageMap[language] || "Türkçe";

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Chat geçmişini al (son 50 mesaj - AI context için)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("content, sender_type")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (messagesError) throw messagesError;

    // Claude API'ye mesaj geçmişini hazırla (ters çevir - eskiden yeniye)
    const conversationHistory =
      messages?.reverse().map((msg) => ({
        role: msg.sender_type === "user" ? "user" : "assistant",
        content: msg.content,
      })) || [];

    // Yeni mesajı ekle
    conversationHistory.push({
      role: "user",
      content: message,
    });

    // Dinamik dil talimatı
    const systemLanguageMap = {
      tr: "Türkçe",
      en: "English",
      de: "Deutsch",
      fr: "Français",
      es: "Español",
    };
    const userLanguageName = systemLanguageMap[userLanguage] || "Türkçe";

    const dynamicLanguageInstruction = `

🌍 DİL KURALI (ÇOK ÖNEMLİ):
- Kullanıcının sistem dili: ${userLanguageName}
- Kullanıcı hangi dilde yazarsa, MUTLAKA O DİLDE cevap ver!
- Dil değiştirme: Eğer kullanıcı farklı bir dilde yazarsa, o dile geç
- Doğal ol: Dil geçişlerinde akıcı ve rahat ol
- Karma dil: Kullanıcı karma dil kullanıyorsa (Türkçe-İngilizce), ona uyum sağla

Örnek:
- Kullanıcı: "Merhaba" → Sen: "Merhaba! Nasıl yardımcı olabilirim?"
- Kullanıcı: "Hello" → Sen: "Hello! How can I help you?"
- Kullanıcı: "What is quantum?" → Sen: "Quantum refers to... (İngilizce devam et)"
`;

    // Claude API çağrısı
    // Önce CLAUDE_API_KEY'i dene, yoksa ANTHROPIC_API_KEY'i dene (backward compatibility)
    const claudeKey =
      Deno.env.get("CLAUDE_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");

    if (!claudeKey) {
      console.error(
        "❌ API Key bulunamadı! Şu secret'lar kontrol edildi: CLAUDE_API_KEY, ANTHROPIC_API_KEY"
      );
      throw new Error(
        "Claude API key yapılandırılmamış. Lütfen Supabase dashboard > Edge Functions > Secrets bölümünden CLAUDE_API_KEY veya ANTHROPIC_API_KEY secret'ını ekleyin."
      );
    }

    // API key format kontrolü (debugging için)
    console.log("✅ Claude API Key bulundu:", {
      keyPrefix: claudeKey.substring(0, 15) + "...",
      keyLength: claudeKey.length,
      startsWithSkAnt: claudeKey.startsWith("sk-ant-"),
    });

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
          model: "claude-3-haiku-20240307", // Stabil ve çalışan model (fiyat-performans için ideal)
          max_tokens: 1536, // Doğal ve yeterli uzunlukta cevaplar için (çok uzun değil, çok kısa da değil)
          system: AI_PROMPTS.CHAT_ASSISTANT + dynamicLanguageInstruction,
          messages: conversationHistory,
        }),
      }
    );

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      let errorDetails = `Claude API error: ${claudeResponse.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorDetails =
          errorJson.error?.message || errorJson.error?.type || errorText;
        console.error(
          "Claude API Error Details:",
          JSON.stringify(errorJson, null, 2)
        );
      } catch (e) {
        console.error("Claude API Error (text):", errorText);
      }

      // Özel hata mesajları
      if (claudeResponse.status === 401) {
        throw new Error(
          "Claude API key geçersiz veya expire olmuş. Lütfen Supabase dashboard'dan CLAUDE_API_KEY secret'ını güncelleyin."
        );
      }

      if (claudeResponse.status === 402) {
        throw new Error(
          "Claude API hesabında yetersiz bakiye. Lütfen Anthropic console'dan hesabınıza para yükleyin."
        );
      }

      if (claudeResponse.status === 404) {
        throw new Error(
          `Claude API model bulunamadı (404). Model: claude-3-haiku-20240307. Detay: ${errorDetails}`
        );
      }

      throw new Error(
        `Claude API hatası (${claudeResponse.status}): ${errorDetails}`
      );
    }

    const claudeData = await claudeResponse.json();
    const aiMessage = claudeData.content[0].text;

    // ✅ Token maliyetini database'den al
    const { data: tokenCostData, error: costError } = await supabase
      .from('module_token_costs')
      .select('token_cost')
      .eq('module_id', 'chat')
      .eq('is_active', true)
      .single();
    
    const tokensUsed = tokenCostData?.token_cost || 1; // Fallback: 1 token

    // Kullanıcının token'ını düş (1 token)
    const { error: tokenError } = await supabase.rpc("update_user_tokens", {
      user_id: userId,
      amount: -tokensUsed,
      transaction_type: "usage",
      description: "Chat AI mesajı",
      reference_id: chatId,
      reference_type: "chat",
    });

    if (tokenError) {
      console.error("Token update error:", tokenError);
      // Token hatası olsa bile mesajı döndür
    }

    // Başarılı yanıt
    return new Response(
      JSON.stringify({
        message: aiMessage,
        tokensUsed,
        metadata: {
          model: "claude-3-haiku-20240307", // Stabil model (fiyat-performans için ideal)
          inputTokens: claudeData.usage?.input_tokens || 0,
          outputTokens: claudeData.usage?.output_tokens || 0,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        message: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
