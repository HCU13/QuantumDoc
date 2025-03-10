import axios from "axios";

// Claude API konfigürasyonu
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY =
  "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"; // .env dosyasında saklayın
const CLAUDE_MODEL = "claude-3-haiku-20240307"; // Performans/maliyet dengesi

// HTTP istemcisi oluştur
const claudeClient = axios.create({
  baseURL: CLAUDE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": CLAUDE_API_KEY,
    "anthropic-version": "2023-06-01",
  },
});

/**
 * Claude AI API entegrasyonu
 */
export const claudeApi = {
  /**
   * Verilen metni analiz eder
   * @param {string} text - Analiz edilecek metin
   * @returns {Promise<string>} - Analiz sonucu
   */
  analyzeText: async (text) => {
    try {
      const prompt = `
        This document needs to be analyzed thoroughly. Please provide:

        1. Summary: 2-3 paragraphs summarizing the main content
        2. Key Points: 4-7 bullet points highlighting the most important information
        3. Details: Any specific facts, figures, or important details
        4. Recommendations: If applicable, suggest actions or next steps

        Here's the document:
        ${text}

        Please organize your response using these headings: Summary, Key Points, Details, and Recommendations.
      `;

      const response = await claudeClient.post("", {
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        temperature: 0.2, // Daha deterministik çıktı için düşük
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Claude yanıtını al
      return response.data.content[0].text;
    } catch (error) {
      console.error("Error calling Claude API for text analysis:", error);
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
  },

  /**
   * URL'deki belgeyi analiz eder
   * @param {string} documentUrl - Belge URL'si
   * @param {string} documentType - Belge türü
   * @returns {Promise<string>} - Analiz sonucu
   */
  analyzeDocument: async (documentUrl, documentType) => {
    try {
      const prompt = `
        This document needs to be analyzed thoroughly. Please provide:

        1. Summary: 2-3 paragraphs summarizing the main content
        2. Key Points: 4-7 bullet points highlighting the most important information
        3. Details: Any specific facts, figures, or important details
        4. Recommendations: If applicable, suggest actions or next steps

        Document URL: ${documentUrl}
        Document Type: ${documentType}

        Please organize your response using these headings: Summary, Key Points, Details, and Recommendations.
      `;

      const response = await claudeClient.post("", {
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.data.content[0].text;
    } catch (error) {
      console.error("Error calling Claude API for document analysis:", error);
      throw new Error(`Failed to analyze document: ${error.message}`);
    }
  },

  /**
   * Belge hakkında bir soruyu yanıtlar
   * @param {string} question - Soru metni
   * @param {string} context - Belge içeriği
   * @returns {Promise<string>} - Yanıt metni
   */
  askQuestion: async (question, context) => {
    try {
      const prompt = `
        You are an assistant that helps answer questions about documents.
        
        Context from the document:
        ${context}
        
        Please answer the following question based only on the information in the document:
        ${question}
        
        If the answer is not in the document or you're not sure, please state that clearly.
      `;

      const response = await claudeClient.post("", {
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.data.content[0].text;
    } catch (error) {
      console.error("Error calling Claude API for question answering:", error);
      throw new Error(`Failed to answer question: ${error.message}`);
    }
  },
};
