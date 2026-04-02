// get-math-topic-stats — Kullanıcının matematik konu istatistiklerini döner
// Token harcamaz, saf DB sorgusu

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// solve-math-problem ile aynı normalizasyon — sub-topic varyasyonlarını birleştirir
function normalizeSubTopic(topic: string | null): string {
  if (!topic) return "Diğer";
  let s = topic.trim();
  const dashIdx = s.search(/\s[-–]\s/);
  if (dashIdx !== -1) s = s.slice(dashIdx + 3).trim();
  s = s.toLowerCase();
  s = s.replace(/\b(\w+?)(?:n[ıiuü]n|[ıiuü]n|[ıiuü])\b/g, (match) => {
    const mathTerms = ['fonksiyon', 'denklem', 'integral', 'türev', 'limit', 'matris', 'vektör', 'dizi', 'seri'];
    for (const term of mathTerms) {
      if (match.startsWith(term)) return term;
    }
    return match;
  });
  s = s.replace(/\b(denklem|integral|türev|limit|fonksiyon|matris|vektör)ler\b/g, '$1');
  s = s.replace(/\b\w/g, c => c.toLocaleUpperCase('tr-TR'));
  return s;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error("Missing userId");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Kategori bazında toplam çözüm sayısı + kavrama durumu
    const { data: categoryStats, error: catErr } = await supabase
      .from("math_solutions")
      .select("topic_category, topic, created_at, comprehension_feedback")
      .eq("user_id", userId)
      .not("topic_category", "is", null)
      .order("created_at", { ascending: false });

    if (catErr) throw catErr;

    // Gruplama: category → { count, topics, lastSolvedAt, lastFeedback per sub-topic }
    // Comprehension: sub-topic başına SON verilen feedback geçerlidir (tüm zamanın toplamı değil)
    const categoryMap: Record<string, {
      category: string;
      count: number;
      lastSolvedAt: string;
      topics: Record<string, number>;
      // sub-topic → { lastFeedback, lastAt }
      topicFeedback: Record<string, { feedback: string | null; lastAt: string }>;
    }> = {};

    for (const row of categoryStats ?? []) {
      const cat = row.topic_category as string;
      const rawTopic = row.topic as string | null;
      const topic = normalizeSubTopic(rawTopic); // normalize et — varyasyonları birleştir

      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, count: 0, lastSolvedAt: row.created_at, topics: {}, topicFeedback: {} };
      }
      categoryMap[cat].count++;
      categoryMap[cat].topics[topic] = (categoryMap[cat].topics[topic] ?? 0) + 1;
      if (row.created_at > categoryMap[cat].lastSolvedAt) {
        categoryMap[cat].lastSolvedAt = row.created_at;
      }

      // Sub-topic başına SON feedback'i tut (kayıtlar created_at DESC sıralı, ilk gelen en yeni)
      if (row.comprehension_feedback && !categoryMap[cat].topicFeedback[topic]) {
        categoryMap[cat].topicFeedback[topic] = { feedback: row.comprehension_feedback, lastAt: row.created_at };
      }
    }

    // Listeye çevir, en çok çalışılan öne
    const categories = Object.values(categoryMap)
      .sort((a, b) => b.count - a.count)
      .map((c) => {
        // Her sub-topic için SON feedback'e göre say
        let understoodCount = 0;
        let notUnderstoodCount = 0;
        for (const { feedback } of Object.values(c.topicFeedback)) {
          if (feedback === "understood") understoodCount++;
          else if (feedback === "not_understood") notUnderstoodCount++;
        }
        return {
          category: c.category,
          count: c.count,
          lastSolvedAt: c.lastSolvedAt,
          // Topics: en çok çalışılan 3 alt konu (normalize edilmiş)
          topTopics: Object.entries(c.topics)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({ name, count })),
          understoodCount,
          notUnderstoodCount,
        };
      });

    const totalSolved = categoryStats?.length ?? 0;

    return new Response(
      JSON.stringify({ categories, totalSolved }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
