// 📝 CREATE EXAM - Edge Function
// Bu function sınav oluşturur (konu veya fotoğraftan)

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonrepair } from "https://esm.sh/jsonrepair@3.10.0";

// System prompt: boş şık yok, soru çeşitliliği zorunlu, zorluk dikkate alınacak
const EXAM_SYSTEM_PROMPT = `Sınav sorusu üret. Yanıtında SADECE tek bir JSON nesnesi yaz; öncesinde veya sonrasında hiçbir açıklama, cümle veya markdown ekleme. Doğrudan { ile başla ve } ile bitir.
Kurallar:
- Her soru için tam 4 şık (A,B,C,D). Her şıkkın "text" alanı mutlaka dolu ve anlamlı olacak; asla boş bırakma.
- correctAnswer mutlaka SADECE tek bir harf olacak: A, B, C veya D. Başka hiçbir şey yazma (nokta, parantez, açıklama yok).
- ÇOK ÖNEMLİ – Soru çeşitliliği: Her soru FARKLI bir alt konu, kavram veya soru tipinde olsun. Aynı veya neredeyse aynı soru metnini ASLA tekrarlama. Her biri farklı açıdan olsun: örn. biri tanım, biri hesaplama, biri uygulama, biri senaryo, biri karşılaştırma, biri "hangisi değildir", biri "doğru ifade" vb. İstenen soru sayısı kadar BİRBİRİNDEN FARKLI soru üret.
- Zorluk seviyesi kullanıcı mesajında verilir (KOLAY / ORTA / ZOR). Buna sıkı uy: KOLAY gerçekten kolay, ZOR gerçekten zor olsun (çeldiriciler doğruya yakın, soru karmaşık).
Format: {"questions":[{"question":"...","options":[{"label":"A","text":"..."},{"label":"B","text":"..."},{"label":"C","text":"..."},{"label":"D","text":"..."}],"correctAnswer":"A","explanation":"..."}]}. İstenen soru sayısına tam uy.`;

const PREFILL = '{"questions":[';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Claude API'yi çağır ve JSON parse et; hata olursa maxAttempts kadar tekrar dene
async function callClaudeWithRetry(
  claudeKey: string,
  body: object,
  maxAttempts: number = 2
): Promise<Record<string, unknown>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
        body: JSON.stringify(body),
      }
    );

    if (!claudeResponse.ok) {
      const status = claudeResponse.status;
      const errorText = await claudeResponse.text();
      // 429 (rate limit) ve 529 (overloaded) geçici hatalar — retry yap
      const isRetryable = status === 429 || status === 529 || status === 503 || status === 502;
      if (isRetryable && attempt < maxAttempts) {
        const delay = attempt * 3000; // 3s, 6s
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Kullanıcıya gösterilecek anlamlı hata mesajı
      if (status === 529 || status === 503) {
        throw new Error("AI servisi şu an yoğun, lütfen birkaç saniye bekleyip tekrar deneyin.");
      } else if (status === 429) {
        throw new Error("Çok fazla istek gönderildi, lütfen kısa bir süre bekleyin.");
      } else {
        throw new Error(`Claude API error: ${status}`);
      }
    }

    const claudeData = await claudeResponse.json();
    // Prefill + model yanıtını birleştir
    let responseText = PREFILL + claudeData.content[0].text;

    // Markdown code block kaldır (savunma amaçlı)
    responseText = responseText.trim();
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }
    responseText = responseText.trim();

    // İlk { ile son } arasını al (ön/son açıklama varsa temizle)
    const firstBrace = responseText.indexOf("{");
    const lastBrace = responseText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      responseText = responseText.slice(firstBrace, lastBrace + 1);
    }

    try {
      let parsedText = responseText;
      try {
        JSON.parse(parsedText);
      } catch (_) {
        // İlk parse başarısız — jsonrepair ile düzelt
        parsedText = jsonrepair(parsedText);
      }
      const parsed = JSON.parse(parsedText) as Record<string, unknown>;
      // Kullanım bilgisini taşı
      parsed.__usage = claudeData.usage;
      return parsed;
    } catch (e) {
      lastError = e as Error;
      // JSON parse başarısız, retry yapılacak
    }
  }

  throw new Error(
    `AI response is not valid JSON after ${maxAttempts} attempts: ${lastError?.message}`
  );
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      topic,
      topicImageUrl,
      userId,
      userLanguage = "tr",
      difficulty = "medium",
      questionCount = 5,
    } = await req.json();

    if (!userId) {
      throw new Error("Missing userId");
    }

    if (!topic && !topicImageUrl) {
      throw new Error("Either topic or topicImageUrl must be provided");
    }

    // Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ USAGE LIMIT KONTROLÜ
    const { data: usageCheck, error: usageError } = await supabase
      .rpc('check_daily_usage_limit', {
        p_user_id: userId,
        p_module_id: 'exam_lab'
      });

    if (usageError) {
      // usage check hatası - devam et
    }

    if (usageCheck && !usageCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'USAGE_LIMIT_EXCEEDED',
          message: userLanguage === 'tr'
            ? `Günlük sınav oluşturma limitiniz doldu. ${usageCheck.used}/${usageCheck.limit} kullanıldı. Premium'a geçin!`
            : `Daily exam limit reached. ${usageCheck.used}/${usageCheck.limit} used. Upgrade to Premium!`,
          usageInfo: usageCheck
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    // Claude API key
    const claudeKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeKey) {
      throw new Error("CLAUDE_API_KEY not configured");
    }

    // Dil ayarı
    const languageMap: Record<string, string> = {
      tr: "Türkçe",
      en: "English",
    };
    const userLanguageName = languageMap[userLanguage] || "Türkçe";

    // Zorluk seviyesi
    const difficultyInstructions: Record<string, string> = {
      easy: "KOLAY: Sadece temel bilgi ve tanım soruları. Cevap doğrudan konuda; çeldiriciler bariz yanlış olsun. Bir adımda düşünülebilecek sorular.",
      medium: "ORTA: Uygulama ve yorum gerektiren sorular. Çeldiriciler makul ama yanlış; doğru cevap için konuyu bilmek gerekir.",
      hard: "ZOR: Analiz, çok adımlı düşünme, ince ayrım. Çeldiriciler doğruya çok yakın ve inandırıcı olsun; sadece konuyu bilmek yetmez, derinlemesine anlama gerekir. Soru ifadeleri daha karmaşık, cevaplar daha zor seçilsin.",
    };
    const difficultyInstruction = difficultyInstructions[difficulty] || difficultyInstructions.medium;

    // Soru tipi listesi — her slota farklı bir tip ata (tekrar önlenir)
    const ALL_QUESTION_TYPES = [
      "tanım", "hesaplama", "uygulama", "senaryo", "karşılaştırma",
      "hangisi-değildir", "doğru-ifade", "sebep-sonuç", "örnek", "analiz",
      "tarihsel-bağlam", "avantaj-dezavantaj", "sıralama", "eşleştirme", "yorum",
      "hata-tespiti", "tahmin", "formül-uygulama", "genel-kural", "istisna"
    ];
    const questionTypeList = ALL_QUESTION_TYPES.slice(0, questionCount).join(", ");

    // Claude API için mesaj hazırla
    let apiMessages: object[];

    if (topicImageUrl) {
      // Fotoğraftan konu tespiti ve soru oluşturma
      const matches = topicImageUrl.match(
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
              text: `Bu görseldeki konuya göre tam ${questionCount} adet sınav sorusu oluştur. Her soru ZORUNLU olarak farklı tipte olacak: [${questionTypeList}]. Aynı veya çok benzer soruyu ASLA tekrarlama. Dil: ${userLanguageName}. Zorluk: ${difficultyInstruction}. Yanıtında sadece tek bir JSON nesnesi yaz (başka metin yok).`,
            },
          ],
        },
        {
          role: "assistant",
          content: PREFILL,
        },
      ];
    } else {
      // Konu metninden soru oluşturma
      apiMessages = [
        {
          role: "user",
          content: `"${topic}" konusunda tam ${questionCount} adet sınav sorusu oluştur. Her soru ZORUNLU olarak farklı tipte olacak: [${questionTypeList}]. Aynı soruyu veya çok benzer soruyu ASLA tekrarlama. Dil: ${userLanguageName}. Zorluk: ${difficultyInstruction}. Yanıtında sadece tek bir JSON nesnesi yaz (başka metin yok).`,
        },
        {
          role: "assistant",
          content: PREFILL,
        },
      ];
    }

    // Claude API - yanıt kesilmesin: soru başına yeterli token
    // ZOR sorular daha uzun açıklama içerir, +60 token/soru ek pay
    const tokensPerQuestion = difficulty === "hard" ? 400 : 320;
    // claude-haiku-4-5-20251001 — Türkçe JSON çıktısı için soru başına 320-400 token gerekli
    const maxTokens = Math.min(800 + questionCount * tokensPerQuestion, 8192);

    const apiBody = {
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      temperature: 0.7,
      system: [{ type: "text", text: EXAM_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: apiMessages,
    };

    // Retry mekanizmalı Claude çağrısı
    const examData = await callClaudeWithRetry(claudeKey, apiBody);
    const inputTokens = ((examData.__usage as Record<string, number>)?.input_tokens) || 0;
    const outputTokens = ((examData.__usage as Record<string, number>)?.output_tokens) || 0;
    delete examData.__usage;

    // Soruları validate et
    if (!examData.questions || !Array.isArray(examData.questions)) {
      throw new Error("Invalid exam format: questions array not found");
    }

    const LABELS = ["A", "B", "C", "D"];

    // Her soruyu normalize et: 4 şık (A-D), boş text doldur, correctAnswer geçerli olsun
    const formattedQuestions = (examData.questions as Record<string, unknown>[]).map((q, index) => {
      let options = Array.isArray(q.options) ? q.options as Record<string, string>[] : [];
      const optionMap: Record<string, string> = {};
      for (const o of options) {
        const label = String(o?.label || "").trim().toUpperCase().slice(0, 1);
        if (LABELS.includes(label)) {
          const text = String(o?.text ?? "").trim();
          optionMap[label] = text || `Seçenek ${label}`;
        }
      }
      // Eksik şıkları doldur
      for (const L of LABELS) {
        if (!optionMap[L]) optionMap[L] = `Seçenek ${L}`;
      }
      const normalizedOptions = LABELS.map((label) => ({
        label,
        text: optionMap[label],
      }));

      // correctAnswer: regex ile A/B/C/D harfini çıkar; "option B", "b)", "The answer is C" gibi
      // formatları doğru işle
      const rawAnswer = String(q.correctAnswer || "").trim();
      let correctAnswer = "A";
      const labelMatch = rawAnswer.match(/\b([ABCD])\b/i);
      if (labelMatch) {
        correctAnswer = labelMatch[1].toUpperCase();
      } else {
        const firstChar = rawAnswer.toUpperCase().slice(0, 1);
        if (LABELS.includes(firstChar)) {
          correctAnswer = firstChar;
        } else {
          // Tanımsız cevap - A'ya varsayılan
        }
      }

      return {
        id: index + 1,
        question: String(q.question || "").trim() || `Soru ${index + 1}`,
        options: normalizedOptions,
        correctAnswer,
        explanation: String(q.explanation || "").trim(),
      };
    });

    // Tekrarlayan soruları filtrele: aynı veya neredeyse aynı soru metni bir kez kalsın
    const normalizeQuestionKey = (text: string) =>
      text.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 200);
    const seenKeys = new Set<string>();
    const uniqueQuestions = formattedQuestions.filter((q) => {
      const key = normalizeQuestionKey(q.question);
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });
    // id'leri 1'den yeniden numarala
    const questionsToReturn = uniqueQuestions.map((q, i) => ({
      ...q,
      id: i + 1,
    }));

    // Dedup - tekrar eden sorular kaldırıldı

    // Kullanımı logla
    await supabase.rpc('log_usage', {
      p_user_id: userId,
      p_module_id: 'exam_lab',
      p_operation_type: 'create_exam',
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_metadata: {
        topic: topic || 'from_image',
        question_count: questionCount,
        difficulty: difficulty,
        has_image: !!topicImageUrl,
        model: 'claude-haiku-4-5-20251001',
      },
    });

    // Başarılı yanıt
    return new Response(
      JSON.stringify({
        questions: questionsToReturn,
        usageInfo: usageCheck,
        metadata: {
          topic: topic || "Fotoğraftan tespit edildi",
          questionCount: questionsToReturn.length,
          difficulty: difficulty,
          model: "claude-3-haiku-20240307",
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
        error: (error as Error).message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
