// 💬 CHAT WITH CLAUDE - Edge Function
// Bu function Claude AI ile sohbet eder ve yanıt döner

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🎯 AI PROMPTS - Inline (Dashboard deploy için)
// Not: _shared/ai-prompts.js'den kopyalanmıştır
// Test için _shared kullan, production için bu inline versiyonu kullan
const AI_PROMPTS = {
  CHAT_ASSISTANT: `Sen Quorax'un yapay zeka asistanısın. İsmin Quorax AI.

KURALLAR:
- ASLA "Claude", "GPT", "OpenAI", "Anthropic" veya başka AI isimlerini söyleme
- "Sen kimsin?" → "Ben Quorax'un yapay zeka asistanıyım! 🚀"
- Hangi AI veya model olduğunu ASLA söyleme

KONUŞMA STİLİ:
- Samimi, arkadaş canlısı, profesyonel
- Kullanıcının dilinde yaz (Türkçe → Türkçe, İngilizce → İngilizce)
- Soru kısaysa kısa, detaylıysa detaylı cevap ver
- 1-2 emoji yeterli, abartma
- Bağlamı koru, önceki mesajları hatırla

YETENEKLERİN: Genel bilgi, sohbet, danışmanlık, öğrenme desteği, kod, çeviri, yaratıcı içerik.`,
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
      category = "tools",
      isGreeting = false,
      chatTitle = "",
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

    // Greeting mesajı ise usage limit kontrolü ve chat geçmişi atlansın
    let usageCheck: any = null;

    if (!isGreeting) {
      const { data, error: usageError } = await supabase
        .rpc('check_daily_usage_limit', {
          p_user_id: userId,
          p_module_id: 'chat'
        });

      usageCheck = data;

      if (usageCheck && !usageCheck.allowed) {
        return new Response(
          JSON.stringify({
            error: 'USAGE_LIMIT_EXCEEDED',
            message: language === 'tr'
              ? `Günlük chat limitiniz doldu. ${usageCheck.used}/${usageCheck.limit} kullanıldı. Premium'a geçin!`
              : `Daily chat limit reached. ${usageCheck.used}/${usageCheck.limit} used. Upgrade to Premium!`,
            usageInfo: usageCheck
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 429,
          }
        );
      }
    }

    // Chat geçmişini al (greeting ise boş geçmiş kullan)
    let conversationHistory: { role: string; content: string }[] = [];

    if (!isGreeting) {
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("content, sender_type")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(8);

      if (messagesError) throw messagesError;

      conversationHistory = messages?.reverse().map((msg) => ({
        role: msg.sender_type === "user" ? "user" : "assistant",
        content: msg.content,
      })) || [];
    }

    // Dil talimatı user mesajına eklenir (sistem prompt sabit kalmalı → prompt caching çalışsın)
    const systemLanguageMap = {
      tr: "Türkçe",
      en: "English",
      de: "Deutsch",
      fr: "Français",
      es: "Español",
    };
    const appLanguageName = systemLanguageMap[userLanguage] || "Türkçe";
    const languagePrefix = `[Varsayılan dil: ${appLanguageName}]\n`;

    // Yeni mesajı ekle
    conversationHistory.push({
      role: "user",
      content: isGreeting
        ? (language === "tr"
            ? `${languagePrefix}Kullanıcı "${chatTitle || "yeni bir sohbet"}" başlıklı bir sohbet oluşturdu. Kısa, samimi ve davetkar bir karşılama mesajı yaz. Sohbet başlığıyla bağlantılı olsun. Maksimum 2 cümle.`
            : `${languagePrefix}The user created a chat titled "${chatTitle || "new chat"}". Write a short, warm and inviting greeting message related to the chat title. Maximum 2 sentences.`)
        : languagePrefix + message,
    });

    // Claude API çağrısı
    // Önce CLAUDE_API_KEY'i dene, yoksa ANTHROPIC_API_KEY'i dene (backward compatibility)
    const claudeKey =
      Deno.env.get("CLAUDE_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");

    if (!claudeKey) {
      throw new Error(
        "Claude API key yapılandırılmamış. Lütfen Supabase dashboard > Edge Functions > Secrets bölümünden CLAUDE_API_KEY veya ANTHROPIC_API_KEY secret'ını ekleyin."
      );
    }

    // API key format kontrolü
    if (!claudeKey.startsWith("sk-ant-")) {
      throw new Error("Invalid Claude API key format");
    }

    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "prompt-caching-2024-07-31",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          system: [
            {
              type: "text",
              text: AI_PROMPTS.CHAT_ASSISTANT,
              cache_control: { type: "ephemeral" },
            },
          ],
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
      } catch (e) {
        // JSON parse hatası, errorText kullanılıyor
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

    // ✅ USAGE TRACKING - Greeting mesajı sayılmasın
    const inputTokens = claudeData.usage?.input_tokens || 0;
    const outputTokens = claudeData.usage?.output_tokens || 0;

    if (!isGreeting) await supabase.rpc('log_usage', {
      p_user_id: userId,
      p_module_id: 'chat',
      p_operation_type: 'message',
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_metadata: {
        chat_id: chatId,
        model: 'claude-haiku-4-5-20251001',
        message_length: message.length,
      }
    });

    // Başarılı yanıt
    return new Response(
      JSON.stringify({
        message: aiMessage,
        usageInfo: usageCheck,
        metadata: {
          model: "claude-haiku-4-5-20251001",
          inputTokens,
          outputTokens,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
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
