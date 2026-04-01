// 🃏 CREATE FLASHCARDS - Edge Function
// Konu veya fotoğraftan flashcard seti üretir

import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FLASHCARD_PROMPT = `You are a flashcard generator. Create flashcards from the given topic or content.
Each flashcard has a "front" (question/term) and "back" (answer/definition).
Rules:
- Keep fronts concise (1 short question or term)
- Keep backs clear (1-3 sentences max)
- Make cards self-contained (no "see above" references)
- Vary question types: definition, "what is", "how does", "calculate", "true/false"
- Respond in the SAME LANGUAGE as the topic/content provided
Output ONLY valid JSON. No markdown, no code blocks, no extra text. Start directly with {

Format: {"flashcards":[{"front":"...","back":"..."}]}`;

function extractFlashcards(raw: string): { front: string; back: string }[] {
  // Strip markdown code blocks if present
  let text = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Find the outermost { ... }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  text = text.slice(start, end + 1);

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.flashcards)) throw new Error("flashcards array missing");
  return parsed.flashcards.filter((c: any) => c.front && c.back);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      topic,
      topicImageUrl,
      userId,
      userLanguage = "tr",
      cardCount = 8,
    } = await req.json();

    if (!userId) throw new Error("Missing userId");
    if (!topic && !topicImageUrl) throw new Error("topic or topicImageUrl required");

    const claudeKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeKey) throw new Error("CLAUDE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Usage check
    const { data: usageCheck } = await supabase.rpc("check_daily_usage_limit", {
      p_user_id: userId,
      p_module_id: "exam_lab",
    });

    if (usageCheck && !usageCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "USAGE_LIMIT_EXCEEDED", usageInfo: usageCheck }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Mesaj oluştur
    let messages: any[];
    const userMsg = `Generate exactly ${cardCount} flashcards about: ${topic || "the content in the image"}. Language: ${userLanguage === "tr" ? "Turkish" : "English"}`;

    if (topicImageUrl) {
      const imgMatch = topicImageUrl.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);
      if (!imgMatch) throw new Error("Invalid image format");
      messages = [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: `image/${imgMatch[1]}`, data: imgMatch[2] } },
          { type: "text", text: userMsg },
        ],
      }];
    } else {
      messages = [{ role: "user", content: userMsg }];
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        system: FLASHCARD_PROMPT,
        messages,
      }),
    });

    if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);

    const claudeData = await resp.json();
    const rawText: string = claudeData.content?.[0]?.text || "";

    let flashcards: { front: string; back: string }[] = [];
    try {
      flashcards = extractFlashcards(rawText);
    } catch {
      throw new Error("Failed to parse flashcards response");
    }

    // Usage log
    await supabase.rpc("log_usage", {
      p_user_id: userId,
      p_module_id: "exam_lab",
      p_operation_type: "flashcard",
      p_input_tokens: claudeData.usage?.input_tokens || 0,
      p_output_tokens: claudeData.usage?.output_tokens || 0,
      p_metadata: { card_count: flashcards.length, has_image: !!topicImageUrl },
    });

    return new Response(
      JSON.stringify({ flashcards, usageInfo: usageCheck }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
