import axios from "axios";

// Claude API configuration
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY =
  process.env.CLAUDE_API_KEY ||
  "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";
const CLAUDE_MODEL = "claude-3-haiku-20240307";

// Create HTTP client
const claudeClient = axios.create({
  baseURL: CLAUDE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": CLAUDE_API_KEY,
    "anthropic-version": "2023-06-01",
  },
});

/**
 * AI Service - Handles all AI-related operations using Claude
 */
export const aiService = {
  /**
   * Analyze text using Claude
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Analysis results
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

        Please organize your response in JSON format with these keys: summary, keyPoints (as an array), details, and recommendations (as an array).
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

      // Parse the response
      const responseText = response.data.content[0].text;

      try {
        // Try to parse as JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
      }

      // Fallback: Extract sections manually
      return {
        summary: extractSection(responseText, "Summary"),
        keyPoints: extractBulletPoints(
          extractSection(responseText, "Key Points")
        ),
        details: extractSection(responseText, "Details"),
        recommendations: extractBulletPoints(
          extractSection(responseText, "Recommendations")
        ),
      };
    } catch (error) {
      console.error("Error calling Claude API for text analysis:", error);
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
  },

  /**
   * Extract text from an image using OCR
   * @param {string} imageUrl - URL of the image
   * @returns {Promise<string>} Extracted text
   */
  extractTextFromImage: async (imageUrl) => {
    try {
      const prompt = `
        This is an image. Please extract all visible text from it as accurately as possible.
        The text should be formatted exactly as it appears in the image, preserving paragraphs,
        bullet points, and other formatting.
        
        Image URL: ${imageUrl}
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
      console.error("Error extracting text from image:", error);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  },

  /**
   * Extract text from a PDF document
   * @param {string} pdfUrl - URL of the PDF
   * @returns {Promise<string>} Extracted text
   */
  extractTextFromPdf: async (pdfUrl) => {
    try {
      const prompt = `
        This is a PDF document. Please extract all visible text from it as accurately as possible.
        The text should be formatted exactly as it appears in the document, preserving paragraphs,
        bullet points, and other formatting.
        
        PDF URL: ${pdfUrl}
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
      console.error("Error extracting text from PDF:", error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  },

  /**
   * Ask a question about a document
   * @param {string} question - Question to ask
   * @param {Object} document - Document object with analysis
   * @returns {Promise<string>} Answer
   */
  askQuestion: async (question, document) => {
    try {
      // Combine document content from analysis
      const documentContext = `
        Document Title: ${document.name}
        
        Summary: ${document.analysis.summary}
        
        Key Points: 
        ${document.analysis.keyPoints?.join("\n") || ""}
        
        Details: 
        ${document.analysis.details || ""}
        
        Recommendations:
        ${document.analysis.recommendations?.join("\n") || ""}
      `;

      const prompt = `
        You are an assistant that helps answer questions about documents.
        
        Context from the document:
        ${documentContext}
        
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

// Helper functions
function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}:(.+?)(?=\\n\\w+:|$)`, "s");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function extractBulletPoints(text) {
  if (!text) return [];

  // Match lines that start with a bullet point (-, *, •, numbers)
  const bulletPointRegex = /^[ \t]*(?:[-*•]|\d+\.)\s+(.+)$/gm;
  const matches = [];
  let match;

  while ((match = bulletPointRegex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }

  // If no bullet points were found, split by lines
  if (matches.length === 0) {
    return text.split("\n").filter((line) => line.trim() !== "");
  }

  return matches;
}
