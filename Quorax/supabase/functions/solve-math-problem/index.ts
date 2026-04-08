// 🧮 SOLVE MATH PROBLEM - Edge Function
// Modes: 'solve' (default), 'verify' (Çalışmamı Doğrula), 'related' (Benzer Sorular)
//
// Token optimizasyonu:
//   solve   → extended thinking (4000 budget) + caching  ≈ 4-8k tokens
//   verify  → NO extended thinking + caching             ≈ 800-1.5k tokens (5x daha ucuz!)
//   related → Haiku model, no thinking, no caching       ≈ 200-400 tokens (20x daha ucuz!)

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Konu → Ana kategori eşleştirmesi
// "Kalkülüs - Türev ve Cebirsel Denklem" → "Kalkülüs"
// Stabil gruplama için sabit liste — AI farklı yazsa bile normalize edilir
const TOPIC_CATEGORIES: [RegExp, string][] = [
  [/kalkülüs|türev|integral|limit|diferansiyel/i, "Kalkülüs"],
  [/cebir|denklem|eşitsizlik|polinomlar|faktör|köklü/i, "Cebir"],
  [/geometri|üçgen|dörtgen|çember|alan|hacim|çevre|açı|koordinat/i, "Geometri"],
  [/trigonometri|sin|cos|tan|açı|birim çember/i, "Trigonometri"],
  [/istatistik|olasılık|kombinasyon|permütasyon|binom|dağılım/i, "İstatistik & Olasılık"],
  [/matris|vektör|lineer|determinant/i, "Lineer Cebir"],
  [/sayı teorisi|asal|bölünebilme|ebob|ekok|tam sayı/i, "Sayı Teorisi"],
  [/lise|ilkokul|ortaokul|temel|dört işlem|kesir|ondalık/i, "Temel Matematik"],
];

function normalizeTopicCategory(topic: string): string {
  for (const [pattern, category] of TOPIC_CATEGORIES) {
    if (pattern.test(topic)) return category;
  }
  const firstWord = topic.split(/[-–,]/)[0].trim();
  return firstWord || "Diğer";
}

// Sub-topic normalizasyonu: AI'ın ürettiği varyasyonları canonical forma çeker
// "Ters Fonksiyonun Türevi" → "Ters Fonksiyon Türevi"
// "1. Dereceden Denklem" → "1. Dereceden Denklemler"
function normalizeSubTopic(topic: string): string {
  let s = topic.trim();

  // "Kategori - Alt Konu" formatındaysa sadece alt konuyu al
  const dashIdx = s.search(/\s[-–]\s/);
  if (dashIdx !== -1) s = s.slice(dashIdx + 3).trim();

  // Küçük harfe çevir, normalize et, sonra title case'e döndür
  s = s.toLowerCase();

  // Türkçe ek varyasyonlarını kaldır: "fonksiyonun" → "fonksiyon", "denklemin" → "denklem"
  s = s.replace(/\b(\w+?)(?:n[ıiuü]n|[ıiuü]n|[ıiuü])\b/g, (match) => {
    const mathTerms = ['fonksiyon', 'denklem', 'integral', 'türev', 'limit', 'matris', 'vektör', 'dizi', 'seri'];
    for (const term of mathTerms) {
      if (match.startsWith(term)) return term;
    }
    return match;
  });

  // Çoğul/tekil normalize: "denklemler" → "denklem"
  s = s.replace(/\b(denklem|integral|türev|limit|fonksiyon|matris|vektör)ler\b/g, '$1');

  // Title case
  s = s.replace(/\b\w/g, c => c.toLocaleUpperCase('tr'));

  return s;
}

const AI_PROMPTS = {
  // Ana çözüm promtu
  MATH_SOLVER: `Matematik çözücüsün. Her zorluk seviyesinde (ilkokul → üniversite) her dalı çöz: cebir, geometri, trigonometri, türev, integral, limit, matris, istatistik, olasılık, sayı teorisi, vektör, diferansiyel denklemler. El yazısı veya düşük kaliteli görseli de oku ve çöz. ASLA "Claude/GPT/OpenAI/Anthropic" deme.

ÇIKTI FORMATI — sırayı asla bozma, başka format kullanma:
[SATIR 1] Yalnızca nihai sonuç — hiçbir ek kelime yok.
  Örnekler: "x = 3" | "42 cm²" | "x = 2, y = -1" | "1/2" | "sin(x) + C" | "[-1, 3)" | "Doğru"
[SATIR 2+] Numaralı adımlar: "1. açıklama"
[SON SATIR] KONU: [dal - konu]

YASAK: **, ##, "Cevap:", "Sonuç:", "Açıklama:", emoji, markdown, soru işareti.
ZORUNLU: Tüm değişkenleri hesapla (x,y,z,xy vb). KONU satırını her zaman ekle.
NOTASYON: Üs için ^ kullan (x^2, a^(n-1)). Türev için f'(x), f''(x). Kesir için a/b. Çarpma için ·.

ÖRNEKLER:
--- Denklem ---
x = 3
1. 2x+4=10 → 2x=6.
2. x=3.
KONU: Cebir - 1. Dereceden Denklemler
--- İntegral ---
x³/3 - 2x + C
1. x²'nin integrali x³/3, sabitin integrali -2x.
2. Belirsiz integral sabit C ekler.
KONU: Kalkülüs - Belirsiz İntegral
--- Geometri ---
50 cm²
1. Üçgen alanı = (taban × yükseklik) / 2 = (10 × 10) / 2.
2. Alan = 50 cm².
KONU: Geometri - Üçgen Alanı`,

  // Doğrulama promtu
  MATH_VERIFY: `Matematik çözüm kontrolcüsüsün. Her seviye ve dalda (cebir, geometri, türev, integral, istatistik vb.) öğrenci çözümlerini kontrol et. ASLA "Claude/GPT/OpenAI/Anthropic" deme. Teşvik edici ve yapıcı ol.

ÇIKTI FORMATI — sırayı asla bozma, başka hiçbir şey yazma:
SONUÇ: [Doğru / Yanlış / Kısmen Doğru]
ADIM ADIM:
1. [öğrencinin yaptığı işlem]: [Doğru / Yanlış]
2. [öğrencinin yaptığı işlem]: [Doğru / Yanlış]
HATA: [varsa kısa hata açıklaması, yoksa -]
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

      if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
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

      if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
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

    // Aynı metin problemi son 1 saat içinde çözülmüş mü? (eski/hatalı sonuçları önlemek için kısa tutuldu)
    if (problemText) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentSolutions } = await supabase
        .from("math_solutions")
        .select("id, solution_text, topic, created_at")
        .eq("user_id", userId)
        .eq("problem_text", problemText.trim())
        .gte("created_at", oneHourAgo)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentSolutions && recentSolutions.length > 0) {
        const cached = recentSolutions[0];
        // topic kolonu artık DB'de tutulduğu için direkt kullan — solution_text'ten parse etmeye gerek yok
        const cachedTopic = cached.topic || "";
        return new Response(
          JSON.stringify({
            solution: cached.solution_text,
            topic: cachedTopic,
            solutionId: cached.id,
            cached: true,
            metadata: { model: "claude-sonnet-4-6", hasImage: false, cachedAt: cached.created_at },
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

    // Basit sorularda (kısa metin, resim yok) thinking'i kapat — %90 maliyet tasarrufu.
    // Karmaşık eşik: >80 karakter veya özel anahtar kelimeler veya resim girdisi.
    const isComplex = !!problemImageUrl
      || (problemText?.length || 0) > 80
      || /integral|türev|limit|matris|diferansiyel|trigonometri|logaritma|kombinasyon|permütasyon|istatistik|olasılık|vektör/i.test(problemText || "");

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
        ...(isComplex ? { "anthropic-beta": "interleaved-thinking-2025-05-14,prompt-caching-2024-07-31" } : { "anthropic-beta": "prompt-caching-2024-07-31" }),
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: isComplex ? 8000 : 1000,
        ...(isComplex ? { thinking: { type: "enabled", budget_tokens: 4000 } } : {}),
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
        ai_model: "claude-sonnet-4-6",
        topic: topic ? normalizeSubTopic(topic) : null,
        topic_category: topic ? normalizeTopicCategory(topic) : null,
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
