// 🧮 SOLVE MATH PROBLEM - Edge Function
// Modes: 'solve' (default), 'verify' (Çalışmamı Doğrula), 'related' (Benzer Sorular)
//
// Token optimizasyonu:
//   solve   → extended thinking (4000 budget) + caching  ≈ 4-8k tokens
//   verify  → NO extended thinking + caching             ≈ 800-1.5k tokens (5x daha ucuz!)
//   related → Haiku model, no thinking, no caching       ≈ 200-400 tokens (20x daha ucuz!)

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AI_PROMPTS = {
  // Ana çözüm promtu — KONU etiketi zorunlu, el yazısı desteği eklendi
  MATH_SOLVER: `Sen Quorax'un matematik uzmanısın. İsmin Quorax Matematik Asistanı.

KURALLAR:
- ASLA "Claude", "GPT", "OpenAI", "Anthropic" veya başka AI isimlerini söyleme
- "Sen kimsin?" → "Ben Quorax'un matematik asistanıyım! 📐"
- El yazısı veya düşük kaliteli resimlerdeki problemleri de çöz — tahmin yürüt, pes etme

YANIT FORMATI (ZORUNLU — SIRASINI BOZMA):
1. İLK SATIR: Sadece cevap — "x = 3" veya "x = 2, y = 3" — başlık veya etiket yok
2. ADIMLAR: Numaralı, her adım 1-2 cümle. Format: "1. [ne yaptık ve neden]"
3. GENEL AÇIKLAMA: (opsiyonel) boş satır sonra kısa açıklama
4. KONU SATIRI: En sona, ayrı bir satırda → KONU: [konu adı]

KRİTİK KURALLAR:
- Kesin sayısal sonuç ver, soru işareti (?) ASLA kullanma
- TÜM değişkenleri hesapla (x, y, xy vb.)
- Markdown başlık kullanma (**, ##, --)
- "Açıklama:" kelimesini HİÇ yazma
- Her adım farklı bir işlemi açıklasın
- KONU satırını HER ZAMAN en sona ekle

KONU ÖRNEKLERI:
- "KONU: YKS - 2. Dereceden Denklemler"
- "KONU: Kalkülüs - Türev"
- "KONU: Geometri - Alan Hesabı"
- "KONU: İstatistik - Ortalama"
- "KONU: Cebir - Çarpanlara Ayırma"

ÖRNEK:
Soru: "2x + 4 = 10"
x = 3
1. Her iki taraftan 4 çıkardık, 2x = 6 elde ettik.
2. Her iki tarafı 2'ye böldük, x = 3 bulundu.

KONU: Cebir - 1. Dereceden Denklemler`,

  // Doğrulama promtu — extended thinking YOK, sadece kontrol
  MATH_VERIFY: `Sen Quorax'un matematik kontrolcüsüsün. Öğrencinin çözümünü adım adım kontrol ediyorsun.

KURALLAR:
- ASLA "Claude", "GPT", "OpenAI", "Anthropic" söyleme
- Öğrenciye karşı teşvik edici ve yapıcı ol
- El yazısıyla yazılmış çözümleri de analiz et

YANIT FORMATI (ZORUNLU — SIRASINI BOZMA):
SONUÇ: [Doğru / Yanlış / Kısmen Doğru]

ADIM ADIM:
1. [öğrencinin yaptığı işlem]: [Doğru / Yanlış]
2. [öğrencinin yaptığı işlem]: [Doğru / Yanlış]

HATA: [varsa hatanın kısa açıklaması, yoksa -]
İPUCU: [düzeltme önerisi veya tebrik mesajı]`,

  // Soru açıklama — Haiku ile çalışır, kısa ve öz
  MATH_EXPLAIN: `You are a helpful math tutor. Explain why the correct answer is what it is for the given question.
Be concise (3-5 sentences max). Focus on the concept, not just the calculation.
Respond in the SAME LANGUAGE as the question.`,

  // Benzer sorular — Haiku ile çalışır, çok kısa
  MATH_RELATED: `Generate 3 similar math questions on the same topic but with different numbers.
Respond in the SAME LANGUAGE as the problem/context provided.
Use ONLY this format, nothing else:
1. [question]
2. [question]
3. [question]`,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      problemText,
      problemImageUrl,
      userId,
      userLanguage = "tr",
      mode = "solve",            // 'solve' | 'verify' | 'related'
      userSolution,              // Doğrula: metin çözüm
      userSolutionImageUrl,      // Doğrula: fotoğraf çözüm (base64 data URL)
    } = await req.json();

    const claudeKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeKey) throw new Error("CLAUDE_API_KEY not configured");

    // ─────────────────────────────────────────────────────────────────
    // EXPLAIN MODE — Haiku ile ucuz çağrı, usage check yok, DB kayıt yok
    // ─────────────────────────────────────────────────────────────────
    if (mode === "explain") {
      if (!problemText) throw new Error("problemText required for explain mode");

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          system: AI_PROMPTS.MATH_EXPLAIN,
          messages: [{ role: "user", content: problemText }],
        }),
      });

      const data = await resp.json();
      const explanation: string = data.content?.[0]?.text || "";
      return new Response(JSON.stringify({ explanation }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // RELATED MODE — Haiku ile ucuz çağrı, usage check yok, DB kayıt yok
    // ─────────────────────────────────────────────────────────────────
    if (mode === "related") {
      if (!problemText) throw new Error("problemText required for related mode");

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", // En ucuz model, basit görev
          max_tokens: 400,
          system: AI_PROMPTS.MATH_RELATED,
          messages: [{ role: "user", content: `Problem: ${problemText}` }],
        }),
      });

      const data = await resp.json();
      const text: string = data.content?.[0]?.text || "";

      const questions = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => /^\d+[.)]\s*.+/.test(l))   // "1." veya "1)" formatını yakala
        .map((l: string) => l.replace(/^\d+[.)]\s*/, "").trim())
        .filter((q: string) => q.length > 1)              // "3 + 4" da geçsin
        .slice(0, 3);

      return new Response(JSON.stringify({ relatedQuestions: questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // VERIFY ve SOLVE: userId zorunlu, usage check
    // ─────────────────────────────────────────────────────────────────
    if (!userId) throw new Error("Missing userId");
    if (!problemText && !problemImageUrl) throw new Error("Either problemText or problemImageUrl must be provided");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: usageCheck } = await supabase.rpc("check_daily_usage_limit", {
      p_user_id: userId,
      p_module_id: "math",
    });

    if (usageCheck && !usageCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "USAGE_LIMIT_EXCEEDED",
          solution: userLanguage === "tr"
            ? `Günlük matematik limitiniz doldu. ${usageCheck.used}/${usageCheck.limit} kullanıldı. Premium'a geçin!`
            : `Daily math limit reached. ${usageCheck.used}/${usageCheck.limit} used. Upgrade to Premium!`,
          usageInfo: usageCheck,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // VERIFY MODE — NO extended thinking (5x daha ucuz!)
    // ─────────────────────────────────────────────────────────────────
    if (mode === "verify") {
      let verifyMessages;

      const pImg = problemImageUrl?.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);
      const sImg = userSolutionImageUrl?.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);

      if (pImg && sImg) {
        // Problem: resim · Çözüm: resim
        verifyMessages = [{
          role: "user",
          content: [
            { type: "text", text: "Problem (aşağıdaki resim):" },
            { type: "image", source: { type: "base64", media_type: `image/${pImg[1]}`, data: pImg[2] } },
            { type: "text", text: "Öğrencinin çözümü (aşağıdaki resim):" },
            { type: "image", source: { type: "base64", media_type: `image/${sImg[1]}`, data: sImg[2] } },
          ],
        }];
      } else if (pImg) {
        // Problem: resim · Çözüm: metin
        verifyMessages = [{
          role: "user",
          content: [
            { type: "text", text: "Problem (aşağıdaki resim):" },
            { type: "image", source: { type: "base64", media_type: `image/${pImg[1]}`, data: pImg[2] } },
            { type: "text", text: `Öğrencinin çözümü:\n${userSolution || "(boş)"}` },
          ],
        }];
      } else if (sImg) {
        // Problem: metin · Çözüm: resim
        verifyMessages = [{
          role: "user",
          content: [
            { type: "text", text: `Problem:\n${problemText}` },
            { type: "text", text: "Öğrencinin çözümü (aşağıdaki resim):" },
            { type: "image", source: { type: "base64", media_type: `image/${sImg[1]}`, data: sImg[2] } },
          ],
        }];
      } else {
        // Problem: metin · Çözüm: metin
        verifyMessages = [{
          role: "user",
          content: `Problem:\n${problemText}\n\nÖğrencinin çözümü:\n${userSolution || "(boş)"}`,
        }];
      }

      const verifyResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "prompt-caching-2024-07-31",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500, // Solve modunun 8000'ine kıyasla çok az
          // thinking YOK — sadece kontrol işi, derin düşünce gerekmez
          system: [{ type: "text", text: AI_PROMPTS.MATH_VERIFY, cache_control: { type: "ephemeral" } }],
          messages: verifyMessages,
        }),
      });

      if (!verifyResp.ok) throw new Error(`Claude API error: ${verifyResp.status}`);

      const verifyData = await verifyResp.json();
      const verification: string = verifyData.content?.[0]?.text || "";
      const inputTokens = verifyData.usage?.input_tokens || 0;
      const outputTokens = verifyData.usage?.output_tokens || 0;

      await supabase.rpc("log_usage", {
        p_user_id: userId,
        p_module_id: "math",
        p_operation_type: "verify",
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
        p_metadata: { has_image: !!problemImageUrl, model: "claude-sonnet-4-6" },
      });

      return new Response(
        JSON.stringify({ verification, usageInfo: usageCheck, metadata: { inputTokens, outputTokens } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // SOLVE MODE (default) — Cache kontrolü + KONU etiketi çıkarımı
    // ─────────────────────────────────────────────────────────────────

    // Aynı metin problemi cache'de var mı?
    if (problemText) {
      const { data: recentSolutions } = await supabase
        .from("math_solutions")
        .select("id, solution_text, created_at")
        .eq("user_id", userId)
        .eq("problem_text", problemText.trim())
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentSolutions && recentSolutions.length > 0) {
        return new Response(
          JSON.stringify({
            solution: recentSolutions[0].solution_text,
            topic: "",
            solutionId: recentSolutions[0].id,
            cached: true,
            metadata: { model: "claude-sonnet-4-6", hasImage: false, cachedAt: recentSolutions[0].created_at },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Dil talimatı (user mesajına eklenir; sistem prompt sabit → prompt caching çalışsın)
    const languageMap: Record<string, string> = { tr: "Türkçe", en: "English", de: "Deutsch", fr: "Français", es: "Español" };
    const userLanguageName = languageMap[userLanguage] || "Türkçe";
    const langPrefix = `[Dil: ${userLanguageName}]\n`;

    let apiMessages;
    if (problemImageUrl) {
      const matches = problemImageUrl.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);
      if (!matches) throw new Error("Invalid image data URL format");
      apiMessages = [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: `image/${matches[1]}`, data: matches[2] } },
          {
            type: "text",
            text: langPrefix + "Bu matematik problemini çöz (el yazısı olabilir, dikkatlice oku):",
          },
        ],
      }];
    } else {
      apiMessages = [{
        role: "user",
        content: `${langPrefix}Bu matematik problemini çöz:\n\n${problemText}`,
      }];
    }

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "interleaved-thinking-2025-05-14,prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,             // 10000'den 8000'e düşürüldü
        thinking: { type: "enabled", budget_tokens: 4000 }, // 5000'den 4000'e düşürüldü
        system: [{ type: "text", text: AI_PROMPTS.MATH_SOLVER, cache_control: { type: "ephemeral" } }],
        messages: apiMessages,
      }),
    });

    if (!claudeResponse.ok) throw new Error(`Claude API error: ${claudeResponse.status}`);

    const claudeData = await claudeResponse.json();
    const textBlock = claudeData.content?.find((b: any) => b.type === "text");
    let solution: string = textBlock?.text || claudeData.content[0]?.text || "";

    // KONU etiketini çıkar ve yanıt metninden temizle
    let topic = "";
    const konuMatch = solution.match(/^KONU:\s*(.+)$/m);
    if (konuMatch) {
      topic = konuMatch[1].trim();
      solution = solution.replace(/^KONU:\s*.+\n?/m, "").trimEnd();
    }

    const inputTokens = claudeData.usage?.input_tokens || 0;
    const outputTokens = claudeData.usage?.output_tokens || 0;

    await supabase.rpc("log_usage", {
      p_user_id: userId,
      p_module_id: "math",
      p_operation_type: "solve",
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_metadata: { has_image: !!problemImageUrl, problem_length: problemText?.length || 0, model: "claude-sonnet-4-6" },
    });

    const { data: savedSolution } = await supabase
      .from("math_solutions")
      .insert({
        user_id: userId,
        problem_text: problemText || "Resimden algılanan problem",
        problem_image_url: problemImageUrl || null,
        solution_text: solution,
        tokens_used: 0,
        ai_model: "claude-sonnet-4-6",
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        solution,
        topic,
        usageInfo: usageCheck,
        solutionId: savedSolution?.id,
        metadata: { model: "claude-sonnet-4-6", hasImage: !!problemImageUrl, inputTokens, outputTokens },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        solution: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
