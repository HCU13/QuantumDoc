// services/ClaudeService.js
import axios from "axios";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";

// Claude API configuration - Replace with your actual API endpoint and key management strategy
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY =
  "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"; // Store this securely - consider using environment variables or secure storage

// Claude API models
const CLAUDE_MODELS = {
  CLAUDE_3_HAIKU: "claude-3-haiku-20240307",
  CLAUDE_3_SONNET: "claude-3-5-sonnet-20240229",
  CLAUDE_3_OPUS: "claude-3-opus-20240229",
  CLAUDE_3_7_SONNET: "claude-3-7-sonnet-20250219", // Latest model
};

export const claudeService = {
  /**
   * Process a document with Claude API
   * @param {Object} documentData - Document data object with text content or file URL
   * @param {string} promptTemplate - Custom prompt template
   * @param {string} modelName - Claude model to use (default to latest)
   * @returns {Promise<Object>} - Claude API response
   */
  processDocument: async (
    documentData,
    promptTemplate = null,
    modelName = CLAUDE_MODELS.CLAUDE_3_SONNET
  ) => {
    try {
      // Default prompt for document analysis
      const defaultPrompt = `
        Analyze the following document and provide:
        1. A comprehensive summary of the content
        2. Key points and main themes
        3. Important details that stand out
        4. Any action items or recommendations
        
        Document content: ${
          documentData.text || "Document is provided as a file attachment."
        }
      `;

      const prompt = promptTemplate || defaultPrompt;

      // Prepare the request to Claude API
      const requestData = {
        model: modelName,
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      };

      // If document is a file URL, add it as an attachment
      if (documentData.fileUrl) {
        requestData.messages[0].attachments = [
          {
            type: "file_url",
            file_url: {
              url: documentData.fileUrl,
              mime_type: documentData.mimeType || "application/pdf",
            },
          },
        ];
      }

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      };

      // Make request to Claude API
      const response = await axios.post(CLAUDE_API_URL, requestData, {
        headers,
      });

      // Save the result to Firestore
      await this.saveAnalysisResult({
        documentId: documentData.id,
        userId: documentData.userId,
        analysisData: response.data,
        model: modelName,
        prompt: prompt,
      });

      return response.data;
    } catch (error) {
      console.error("Error processing document with Claude API:", error);
      throw error;
    }
  },

  /**
   * Ask a question about a document
   * @param {string} documentId - The document ID
   * @param {string} question - User's question about the document
   * @param {string} documentContext - Document content or context
   * @param {string} modelName - Claude model to use
   * @returns {Promise<Object>} - Claude API response
   */
  askDocumentQuestion: async (
    documentId,
    question,
    documentContext,
    modelName = CLAUDE_MODELS.CLAUDE_3_HAIKU
  ) => {
    try {
      const promptTemplate = `
        Answer the following question about this document:

        Question: ${question}

        Document content: ${documentContext}

        Provide a detailed, accurate answer based only on the information contained in the document.
      `;

      const requestData = {
        model: modelName,
        max_tokens: 2000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: promptTemplate,
          },
        ],
      };

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      };

      const response = await axios.post(CLAUDE_API_URL, requestData, {
        headers,
      });

      // Save the Q&A interaction to Firestore
      await this.saveConversationEntry({
        documentId,
        question,
        answer: response.data.content[0].text,
        model: modelName,
      });

      return response.data;
    } catch (error) {
      console.error("Error asking document question:", error);
      throw error;
    }
  },

  /**
   * Save document analysis result to Firestore
   * @param {Object} resultData - Analysis result data
   * @returns {Promise<string>} - Result document ID
   */
  saveAnalysisResult: async (resultData) => {
    try {
      const docRef = await addDoc(
        collection(FIRESTORE_DB, "analysis_results"),
        {
          ...resultData,
          createdAt: serverTimestamp(),
        }
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving analysis result:", error);
      throw error;
    }
  },

  /**
   * Save Q&A conversation entry
   * @param {Object} conversationData - Conversation data
   * @returns {Promise<string>} - Conversation entry ID
   */
  saveConversationEntry: async (conversationData) => {
    try {
      const docRef = await addDoc(
        collection(FIRESTORE_DB, "document_conversations"),
        {
          ...conversationData,
          createdAt: serverTimestamp(),
        }
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving conversation entry:", error);
      throw error;
    }
  },

  /**
   * Get conversation history for a document
   * @param {string} documentId - Document ID
   * @param {number} limit - Number of conversations to retrieve
   * @returns {Promise<Array>} - Conversation history
   */
  getDocumentConversations: async (documentId, limitCount = 10) => {
    try {
      const q = query(
        collection(FIRESTORE_DB, "document_conversations"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting document conversations:", error);
      throw error;
    }
  },

  /**
   * Get analysis results for a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Analysis results
   */
  getDocumentAnalysis: async (documentId) => {
    try {
      const q = query(
        collection(FIRESTORE_DB, "analysis_results"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length === 0) {
        return null;
      }

      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };
    } catch (error) {
      console.error("Error getting document analysis:", error);
      throw error;
    }
  },
};

// Export Claude models for reference elsewhere in the app
export { CLAUDE_MODELS };
