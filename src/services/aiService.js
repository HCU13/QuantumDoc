import axios from "axios";

// Claude API configuration
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY =
  process.env.CLAUDE_API_KEY ||
  "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"; // Replace with your actual API key
const CLAUDE_MODEL = "claude-3-opus-20240229"; // Using the Opus model for best analysis

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
const aiService = {
  /**
   * Analyze document content using Claude
   * @param {string} text - Document text content
   * @returns {Promise<Object>} Analysis results with summary, keyPoints, details, recommendations
   */
  analyzeDocument: async (text) => {
    try {
      // Truncate text if too long (Claude has token limits)
      const truncatedText =
        text.length > 100000 ? text.substring(0, 100000) + "..." : text;

      const prompt = `
You are an AI assistant that specializes in analyzing documents. You've been given the following document to analyze thoroughly.

Please structure your analysis as follows:
1. Summary: 2-3 paragraphs that capture the main content, purpose, and conclusions of the document.
2. Key Points: 5-7 bullet points highlighting the most important information in the document.
3. Details: Notable facts, figures, dates, or specific information that might be valuable to reference.
4. Recommendations: 3-5 bullet points suggesting actions or next steps based on the document content (if applicable).

Format your response in a clean JSON structure with these keys: "summary", "keyPoints" (array), "details", "recommendations" (array).

Here's the document content:
"""
${truncatedText}
"""

Now, provide your comprehensive analysis in valid JSON format:`;

      console.log("Sending document to Claude for analysis...");

      const response = await claudeClient.post("", {
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract the text from the response
      const responseText = response.data.content[0].text;

      // Try to parse JSON from the response
      try {
        // Find JSON in the response (sometimes Claude might add extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        // If no match, try parsing the whole response
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing Claude response:", parseError);

        // Fall back to manual extraction if JSON parsing fails
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
      }
    } catch (error) {
      console.error("Error calling Claude API for document analysis:", error);
      throw new Error(`Failed to analyze document: ${error.message}`);
    }
  },

  /**
   * Extract text from an image using Claude's vision capabilities
   * @param {string} base64Image - Base64-encoded image data
   * @returns {Promise<string>} Extracted text
   */
  extractTextFromImage: async (base64Image) => {
    try {
      const prompt =
        "Extract all text from this image. Preserve the formatting as much as possible.";

      const response = await claudeClient.post("", {
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg", // Adjust based on the image type
                  data: base64Image,
                },
              },
            ],
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
   * Ask a question about a document
   * @param {string} question - Question to ask
   * @param {Object} documentContext - Document information and analysis
   * @returns {Promise<string>} Answer from Claude
   */
  askDocumentQuestion: async (question, documentContext) => {
    try {
      // Format the document context for Claude
      const formattedContext = `
Document: ${documentContext.name || "Unnamed Document"}

Summary: ${documentContext.analysis?.summary || "No summary available"}

Key Points:
${
  documentContext.analysis?.keyPoints?.join("\n- ") || "No key points available"
}

Details:
${documentContext.analysis?.details || "No details available"}

Recommendations:
${
  documentContext.analysis?.recommendations?.join("\n- ") ||
  "No recommendations available"
}
`;

      const prompt = `
You are a helpful AI assistant that specializes in answering questions about documents. You have been provided with information about a document, and I will ask you a question about it.

Document Context:
${formattedContext}

Please answer the following question about this document. If the information to answer the question is not in the document context, please state that clearly rather than making up information.

Question: ${question}
`;

      console.log("Sending question to Claude...");

      const response = await claudeClient.post("", {
        model: CLAUDE_MODEL,
        max_tokens: 2000,
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

// Helper functions for extracting information when JSON parsing fails
function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}:(.+?)(?=\\n\\w+:|$)`, "s");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function extractBulletPoints(text) {
  if (!text) return [];

  // Match lines that start with a bullet point (-, *, •, numbers)
  const bulletPointRegex = /^\s*(?:[-*•]|\d+\.)\s+(.+)$/gm;
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

export default aiService;
