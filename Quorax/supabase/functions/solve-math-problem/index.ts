// 🧮 SOLVE MATH PROBLEM - Edge Function
// Modes: 'solve' (default), 'verify' (Çalışmamı Doğrula), 'related' (Benzer Sorular)
//
// Token optimizasyonu:
//   solve   → extended thinking (4000 budget) + caching  ≈ 4-8k tokens
//   verify  → NO extended thinking + caching             ≈ 800-1.5k tokens (5x daha ucuz!)
//   related → Haiku model, no thinking, no caching       ≈ 200-400 tokens (20x daha ucuz!)

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Topic category normalization — matches multi-language topic names to stable canonical English categories.
// Categories are stored in English (language-neutral); UI translates them via i18n using the category key.
// AI is instructed to output topic as "CATEGORY - subtopic" where CATEGORY is one of the canonical keys below.
const TOPIC_CATEGORIES: [RegExp, string][] = [
  // Calculus
  [/calculus|kalkülüs|cálculo|حساب التفاضل|कैलकुलस|derivative|türev|integral|limit|differential|diferansiyel|derivada|integr/i, "calculus"],
  // Algebra
  [/algebra|cebir|álgebra|جبر|बीजगणित|equation|denklem|ecuación|eşitsizlik|inequality|polynomial|polinom/i, "algebra"],
  // Geometry
  [/geometry|geometri|geometría|هندسة|ज्यामिति|triangle|üçgen|triángulo|circle|çember|area|alan|volume|hacim/i, "geometry"],
  // Trigonometry
  [/trigonometr|trigonometri|trigonometría|مثلثات|त्रिकोणमिति|sin|cos|tan/i, "trigonometry"],
  // Statistics & Probability
  [/statistic|istatistik|estadística|probabilit|olasılık|probabilidad|احتمال|सांख्यिकी|combinatorial|kombinasyon|permutation|permütasyon/i, "statistics"],
  // Linear Algebra
  [/linear algebra|matrix|matris|matriz|vector|vektör|vectores|determinant|lineer/i, "linear_algebra"],
  // Number Theory
  [/number theory|sayı teorisi|teoría de números|نظرية الأعداد|prime|asal|divisib|bölünebilme|gcd|lcm|ebob|ekok/i, "number_theory"],
  // Basic Math
  [/basic math|arithmetic|temel matematik|básica|ابتدائية|प्राथमिक|fraction|kesir|decimal|ondalık/i, "basic_math"],
];

function normalizeTopicCategory(topic: string): string {
  for (const [pattern, category] of TOPIC_CATEGORIES) {
    if (pattern.test(topic)) return category;
  }
  return "other";
}

// Sub-topic normalization: take the part after "Category - Subtopic" separator, trimmed.
// Kept intentionally simple — AI now outputs topics in user's language, so locale-specific
// morphology normalization (e.g. Turkish suffix stripping) can't be applied globally.
// Display layer should show sub_topic as-is.
function normalizeSubTopic(topic: string): string {
  let s = topic.trim();
  const dashIdx = s.search(/\s[-–]\s/);
  if (dashIdx !== -1) s = s.slice(dashIdx + 3).trim();
  return s;
}

// IMPORTANT: Format markers (TOPIC:, RESULT:, STEPS:, ERROR:, HINT:, Correct/Wrong/Partial)
// MUST remain in English across all languages — the client parser depends on stable tokens.
// Only natural-language content (explanations, step text, hints) is written in the user's locale.
const AI_PROMPTS = {
  // Main solve prompt — trimmed from ~2900 to ~700 tokens for cost control.
  // What was dropped: verbose curriculum bullets per language (AI already knows), extensive
  // locale tables (condensed to one line), two redundant examples. The critical formatting
  // rules, TOPIC marker contract, and LaTeX threshold logic are preserved.
  MATH_SOLVER: `Global math solver, elementary → university. Solve all domains (algebra, geometry, trigonometry, calculus, statistics, linear algebra, number theory, differential equations). Read handwritten or printed images. NEVER mention "Claude/GPT/OpenAI/Anthropic".

OUTPUT — exact order, no deviation:
[LINE 1] Only the final result. Examples: "x = 3" | "42 cm²" | "x = 2, y = -1" | "sin(x) + C" | "True"
[LINES 2..N] Numbered steps: "1. explanation"
[LAST LINE] TOPIC: <category> - <subtopic>

CRITICAL CONTRACTS:
- "TOPIC:" marker is literal English regardless of response language.
- <category> MUST be one of: algebra, geometry, trigonometry, calculus, statistics, linear_algebra, number_theory, basic_math.
- <subtopic> is in user's response language.

FORBIDDEN: markdown (**, ##), "Answer:"/"Result:"/"Explanation:" labels, emoji, question marks in output.
REQUIRED: Solve all variables. Always emit the TOPIC: line.

NOTATION (plain-text by default, LaTeX only when needed):
- Simple: plain text with ^ for exponents, f'(x) for derivatives, a/b for fractions, · for multiplication. Client renders x^2 → x² via Unicode.
- Complex (multi-term fractions, integrals with bounds, sums, square roots of expressions, limits, matrices, mixed Greek+scripts): emit on its own line wrapped in $$...$$ using standard LaTeX: \\frac{a}{b}, \\int_{a}^{b}, \\sum, \\sqrt, \\lim, \\begin{pmatrix}.
- Inside LaTeX blocks use "." as decimal even if prose uses ",".

LOCALE (prose only; doesn't affect LaTeX):
- Decimal: "." for en/hi/zh/ja/ko; "," for tr/es/de/fr/ar/pt/ru/it.
- Units: metric by default unless the problem uses imperial.
- Do not add English acronyms in parens after translated terms (write "İşlem Önceliği" not "İşlem Önceliği (BODMAS)").

CURRICULUM: Recognize terminology from Common Core (US), GCSE/A-Level/IB (UK/international), CBSE/ICSE (India), LGS/YKS (Turkey), Bachillerato (Spain/LatAm). Preserve the notation the student used.

EXAMPLE:
x = 3
1. 2x + 4 = 10 → 2x = 6.
2. x = 3.
TOPIC: algebra - Linear Equations`,

  // Verify prompt — solution checker
  MATH_VERIFY: `You are a math solution checker. Check student solutions at every level and every domain (algebra, geometry, derivatives, integrals, statistics, etc.). NEVER mention "Claude/GPT/OpenAI/Anthropic". Be encouraging and constructive.

OUTPUT FORMAT — never break the order, never write anything else:
RESULT: <Correct | Wrong | Partial>
STEPS:
1. <description of the student's step>: <Correct | Wrong>
2. <description of the student's step>: <Correct | Wrong>
ERROR: <short error description if any, otherwise ->
HINT: <correction suggestion or congratulatory message>

CRITICAL: The markers "RESULT:", "STEPS:", "ERROR:", "HINT:" and the correctness values "Correct", "Wrong", "Partial" MUST be the literal English words regardless of response language. Only the descriptive content (step descriptions, error text, hint text) is written in the user's language specified by the [LANG: xx] tag.`,

  // Explain — Haiku, short and focused
  MATH_EXPLAIN: `You are a helpful math tutor. Explain why the correct answer is what it is for the given question.
Be concise (3-5 sentences max). Focus on the concept, not just the calculation.
Respond in the language specified by the caller's [LANG: xx] tag. If not specified, use the same language as the question.`,

  // Wrong answer explain — why wrong + correct logic
  WRONG_ANSWER_EXPLAIN: `You are a supportive tutor helping a student understand why they got a question wrong.
You will receive: the question with all options, the student's wrong answer, and the correct answer.

Respond in the language specified by the caller's [LANG: xx] tag (fall back to the question's language). Be concise (max 5 sentences). Structure your response as:
1. One sentence explaining WHY the student's choice was wrong (what misconception it reflects).
2. One sentence explaining WHY the correct answer is right (the key concept).
3. One sentence with a tip or memory trick to remember this in the future.

Do NOT use bullet points, markdown, or headers. Write in plain paragraphs. Be encouraging, not critical.`,

  // Related questions — Haiku, very short
  MATH_RELATED: `Generate 3 similar math questions on the same topic but with different numbers.
Respond in the language specified by the caller's [LANG: xx] tag. If not specified, use the same language as the problem.
Use ONLY this format, nothing else:
1. <question>
2. <question>
3. <question>`,
};

// Map BCP-47 / short codes to English language names for the [LANG: ...] directive.
// Add new entries here when introducing a new locale.
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  es: "Spanish",
  ar: "Arabic",
  hi: "Hindi",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  id: "Indonesian",
  ru: "Russian",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  it: "Italian",
};

function resolveLanguageName(code: string | undefined): string {
  if (!code) return "English";
  const base = code.toLowerCase().split(/[-_]/)[0];
  return LANGUAGE_NAMES[base] || "English";
}

// Prose-only modes (explain, related, wrong_answer_explain) — do NOT mention format markers
// because Claude obediently emits them even when irrelevant, polluting the output.
function buildLangDirective(code: string | undefined): string {
  const name = resolveLanguageName(code);
  return `[LANG: ${name}] Respond in ${name}. Output plain prose only — no structured markers, no "TOPIC:"/"RESULT:"/"STEPS:" labels, no headings. Do not include English acronyms in parentheses after translated terms (e.g. write "İşlem Önceliği" not "İşlem Önceliği (BODMAS)").`;
}

// Structured modes (solve, verify) — client parses output by marker, so the rule stays in.
function buildLangDirectiveWithMarkers(code: string | undefined): string {
  const name = resolveLanguageName(code);
  return `[LANG: ${name}] Respond in ${name}. Keep the format markers (TOPIC:, RESULT:, STEPS:, ERROR:, HINT:, Correct/Wrong/Partial) exactly as specified — do not translate them. Do not include English acronyms in parentheses after translated terms (e.g. write "İşlem Önceliği" not "İşlem Önceliği (BODMAS)").`;
}

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
      userLanguage = "en",
      mode = "solve",            // 'solve' | 'verify' | 'related' | 'explain' | 'wrong_answer_explain'
      userSolution,              // Doğrula: metin çözüm
      userSolutionImageUrl,      // Doğrula: fotoğraf çözüm (base64 data URL)
      solutionId,                // Cache key for explain + related modes (math_solutions.id).
      stepIndex,                 // Explain mode: which step the user tapped "why?" on (number, 0-based).
    } = await req.json();

    const claudeKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeKey) throw new Error("CLAUDE_API_KEY not configured");

    const langDirective = buildLangDirective(userLanguage);
    const langDirectiveStruct = buildLangDirectiveWithMarkers(userLanguage);

    // Shared Supabase client — used by cache-capable modes (explain, related) in addition to
    // solve/verify. Created once so handlers below don't each repeat the init boilerplate.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = (supabaseUrl && supabaseServiceKey)
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

    // ─────────────────────────────────────────────────────────────────
    // EXPLAIN MODE — Haiku; persistent per-step cache on math_solutions.step_explanations.
    // If the client passes solutionId + stepIndex and the same step was explained before, we
    // return the cached value (free, zero tokens). Otherwise we call Haiku, save, and return.
    // ─────────────────────────────────────────────────────────────────
    if (mode === "explain") {
      if (!problemText) throw new Error("problemText required for explain mode");

      // Cache read — only when caller provided both keys and Supabase is available.
      const hasCacheKey = supabase && solutionId && typeof stepIndex === "number";
      if (hasCacheKey) {
        const { data: cachedRow } = await supabase
          .from("math_solutions")
          .select("step_explanations")
          .eq("id", solutionId)
          .maybeSingle();
        const cached = cachedRow?.step_explanations?.[String(stepIndex)];
        if (cached && typeof cached === "string" && cached.length > 0) {
          return new Response(JSON.stringify({ explanation: cached, cached: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          system: AI_PROMPTS.MATH_EXPLAIN,
          messages: [{ role: "user", content: `${langDirective}\n\n${problemText}` }],
        }),
      });

      if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
      const data = await resp.json();
      const explanation: string = data.content?.[0]?.text || "";

      // Cache write — JSON merge so we only update this step's entry, preserving prior explanations.
      if (hasCacheKey && explanation) {
        // Read-then-write merge (Supabase JSONB || operator requires SQL). Small race window is
        // acceptable: two concurrent taps on the same step would both compute then last-write-wins,
        // and both are identical content anyway.
        const { data: existing } = await supabase
          .from("math_solutions")
          .select("step_explanations")
          .eq("id", solutionId)
          .maybeSingle();
        const merged = { ...(existing?.step_explanations || {}), [String(stepIndex)]: explanation };
        await supabase
          .from("math_solutions")
          .update({ step_explanations: merged })
          .eq("id", solutionId);
      }

      return new Response(JSON.stringify({ explanation, cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // WRONG ANSWER EXPLAIN MODE — Haiku, usage check yok, DB kayıt yok
    // ─────────────────────────────────────────────────────────────────
    if (mode === "wrong_answer_explain") {
      if (!problemText) throw new Error("problemText required for wrong_answer_explain mode");

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system: AI_PROMPTS.WRONG_ANSWER_EXPLAIN,
          messages: [{ role: "user", content: `${langDirective}\n\n${problemText}` }],
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
    // RELATED MODE — Haiku; persistent cache on math_solutions.related_questions.
    // First tap generates and stores 3 similar questions. Subsequent taps reuse them.
    // Difficulty switches (easier/same/harder) bypass cache since the output differs by tier.
    // ─────────────────────────────────────────────────────────────────
    if (mode === "related") {
      if (!problemText) throw new Error("problemText required for related mode");

      // Cache read — only the "same" (default) difficulty is cached; easier/harder variants
      // would produce different outputs so we don't over-cache. The difficulty hint is appended
      // to problemText by the client, so we detect it here:
      const isDefaultDifficulty =
        !problemText.includes("EASIER") && !problemText.includes("HARDER");
      const hasCacheKey = supabase && solutionId && isDefaultDifficulty;

      if (hasCacheKey) {
        const { data: cachedRow } = await supabase
          .from("math_solutions")
          .select("related_questions")
          .eq("id", solutionId)
          .maybeSingle();
        const cached = cachedRow?.related_questions;
        if (Array.isArray(cached) && cached.length > 0) {
          return new Response(JSON.stringify({ relatedQuestions: cached, cached: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", // cheapest model, simple task
          max_tokens: 400,
          system: AI_PROMPTS.MATH_RELATED,
          messages: [{ role: "user", content: `${langDirective}\n\nProblem: ${problemText}` }],
        }),
      });

      if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
      const data = await resp.json();
      const text: string = data.content?.[0]?.text || "";

      const questions = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => /^\d+[.)]\s*.+/.test(l))
        .map((l: string) => l.replace(/^\d+[.)]\s*/, "").trim())
        .filter((q: string) => q.length > 1)
        .slice(0, 3);

      // Cache write — only for default difficulty, only if we got a valid 3-item array.
      if (hasCacheKey && questions.length > 0) {
        await supabase
          .from("math_solutions")
          .update({ related_questions: questions })
          .eq("id", solutionId);
      }

      return new Response(JSON.stringify({ relatedQuestions: questions, cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // VERIFY ve SOLVE: userId zorunlu, usage check
    // ─────────────────────────────────────────────────────────────────
    if (!userId) throw new Error("Missing userId");
    if (!problemText && !problemImageUrl) throw new Error("Either problemText or problemImageUrl must be provided");

    // Supabase client was already created above; require it now (fatal if env missing).
    if (!supabase) throw new Error("Supabase client not initialized (check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");

    const { data: usageCheck } = await supabase.rpc("check_daily_usage_limit", {
      p_user_id: userId,
      p_module_id: "math",
    });

    if (usageCheck && !usageCheck.allowed) {
      // Return error code only — client handles localized message via i18n (math.errors.usageLimitExceeded)
      return new Response(
        JSON.stringify({
          error: "USAGE_LIMIT_EXCEEDED",
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

      // Labels sent to the model are in English — model still responds in user's language per directive.
      // Use the marker-preserving directive because the client parses RESULT:/STEPS:/etc.
      const emptySolution = "(empty)";
      if (pImg && sImg) {
        verifyMessages = [{
          role: "user",
          content: [
            { type: "text", text: `${langDirectiveStruct}\n\nProblem (see image below):` },
            { type: "image", source: { type: "base64", media_type: `image/${pImg[1]}`, data: pImg[2] } },
            { type: "text", text: "Student's solution (see image below):" },
            { type: "image", source: { type: "base64", media_type: `image/${sImg[1]}`, data: sImg[2] } },
          ],
        }];
      } else if (pImg) {
        verifyMessages = [{
          role: "user",
          content: [
            { type: "text", text: `${langDirectiveStruct}\n\nProblem (see image below):` },
            { type: "image", source: { type: "base64", media_type: `image/${pImg[1]}`, data: pImg[2] } },
            { type: "text", text: `Student's solution:\n${userSolution || emptySolution}` },
          ],
        }];
      } else if (sImg) {
        verifyMessages = [{
          role: "user",
          content: [
            { type: "text", text: `${langDirectiveStruct}\n\nProblem:\n${problemText}` },
            { type: "text", text: "Student's solution (see image below):" },
            { type: "image", source: { type: "base64", media_type: `image/${sImg[1]}`, data: sImg[2] } },
          ],
        }];
      } else {
        verifyMessages = [{
          role: "user",
          content: `${langDirectiveStruct}\n\nProblem:\n${problemText}\n\nStudent's solution:\n${userSolution || emptySolution}`,
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
          // Görsel varsa Sonnet (Haiku görsel okuyamaz), sadece metin ise Haiku yeterli
          model: (pImg || sImg) ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
          max_tokens: 600, // Verify kısa yanıt döner — 1500 gereksizdi
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

    // Language directive is added to the user message (system prompt stays static so prompt caching works).
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
            text: `${langDirectiveStruct}\n\nSolve this math problem (it may be handwritten — read carefully):`,
          },
        ],
      }];
    } else {
      apiMessages = [{
        role: "user",
        content: `${langDirectiveStruct}\n\nSolve this math problem:\n\n${problemText}`,
      }];
    }

    // Complexity detection — drives both model selection and thinking budget.
    // Keyword list covers multiple languages so detection works regardless of user locale.
    const COMPLEX_KEYWORDS = /integral|türev|derivative|derivada|limit|matrix|matris|matriz|differential|diferansiyel|trigonometr|logarithm|logaritma|logaritmo|combinator|kombinasyon|permutation|permütasyon|statistic|istatistik|estadística|probabilit|olasılık|probabilidad|vector|vektör/i;
    // Ultra-complex: problems that genuinely need deeper reasoning (multi-integral, proofs, matrices).
    // These alone get the 4000-token thinking budget.
    const ULTRA_KEYWORDS = /\\int|\\sum|\\lim|matrix|matris|pmatrix|bmatrix|eigenvalue|özdeğer|determinant|diferansiyel denklem|differential equation/i;

    const hasComplexKeyword = COMPLEX_KEYWORDS.test(problemText || "");
    const hasUltraKeyword = ULTRA_KEYWORDS.test(problemText || "");
    const textLen = problemText?.length || 0;

    const isComplex = !!problemImageUrl || textLen > 80 || hasComplexKeyword;
    const isUltraComplex = hasUltraKeyword || textLen > 300;

    // Model selection — biggest cost lever:
    // - Sonnet 4.6 for anything with an image (vision) or complex keyword.
    // - Haiku 4.5 for short plain-text problems (≤80 chars, no complex keywords). ~4x cheaper,
    //   handles basic algebra/arithmetic/simple geometry well. Haiku doesn't support extended
    //   thinking in the same way — we skip thinking when using Haiku.
    const useHaiku = !problemImageUrl && textLen <= 80 && !hasComplexKeyword;
    const model = useHaiku ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";

    // Thinking budget tiers — only apply to Sonnet (Haiku doesn't need it for simple problems):
    // - Ultra-complex: 4000 tokens (full reasoning budget).
    // - Standard complex: 2000 tokens (50% cheaper, still ample for most calculus/algebra).
    // - Simple: no thinking.
    const thinkingBudget = useHaiku ? 0 : isUltraComplex ? 4000 : isComplex ? 2000 : 0;
    const thinkingEnabled = thinkingBudget > 0;

    // max_tokens scales with thinking budget + reserved output. 1000 for simple is plenty
    // (answer + ~10 short steps). Thinking tokens count toward output so budget accordingly.
    const maxTokens = thinkingEnabled ? thinkingBudget + 2000 : (isComplex ? 4000 : 1000);

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
        ...(thinkingEnabled
          ? { "anthropic-beta": "interleaved-thinking-2025-05-14,prompt-caching-2024-07-31" }
          : { "anthropic-beta": "prompt-caching-2024-07-31" }),
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(thinkingEnabled ? { thinking: { type: "enabled", budget_tokens: thinkingBudget } } : {}),
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
    // Accept TOPIC: (new, language-neutral marker) and KONU: (legacy TR marker) for backward compat
    // with cached solutions and any edge cases where the model falls back to the old label.
    const topicMatch = solution.match(/^(?:TOPIC|KONU):\s*(.+)$/m);
    if (topicMatch) {
      topic = topicMatch[1].trim();
      solution = solution.replace(/^(?:TOPIC|KONU):\s*.+\n?/m, "").trimEnd();
    }

    const inputTokens = claudeData.usage?.input_tokens || 0;
    const outputTokens = claudeData.usage?.output_tokens || 0;

    await supabase.rpc("log_usage", {
      p_user_id: userId,
      p_module_id: "math",
      p_operation_type: "solve",
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_metadata: { has_image: !!problemImageUrl, problem_length: problemText?.length || 0, model, thinking_budget: thinkingBudget },
    });

    const { data: savedSolution } = await supabase
      .from("math_solutions")
      .insert({
        user_id: userId,
        problem_text: problemText || "[image]",
        problem_image_url: problemImageUrl || null,
        solution_text: solution,
        ai_model: model,
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
        metadata: { model, hasImage: !!problemImageUrl, inputTokens, outputTokens },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    // Client displays a localized error using i18n; we only return the raw error message for logging.
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
