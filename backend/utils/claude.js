import axios from "axios";
import fs from "fs";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"; // Claude v2 endpoint

/**
 * Claude'a metin ve opsiyonel görsel (base64) ile istek atar.
 * @param {string} prompt
 * @param {string} [imageBase64] - PNG/JPG base64 string (sadece data kısmı)
 */
export async function askClaude(prompt, imageBase64) {
  try {
    const content = [
      { type: "text", text: prompt }
    ];
    if (imageBase64) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/png",
          data: imageBase64
        }
      });
    }
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: "claude-3.5-sonnet-20240620",
        max_tokens: 1024,
        messages: [
          { role: "user", content }
        ]
      },
      {
        headers: {
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
      }
    );
    return response.data.content?.[0]?.text || "";
  } catch (error) {
    console.error("Claude API error:", error?.response?.data || error.message);
    throw new Error("Claude AI yanıtı alınamadı");
  }
}

/**
 * Bir dosyayı base64 string'e çevirir (sadece data kısmı)
 */
export function fileToBase64(path) {
  const file = fs.readFileSync(path);
  return file.toString("base64");
} 