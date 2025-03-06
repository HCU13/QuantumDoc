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

// Claude API configuration
// In a production app, you should store this in environment variables or secure storage
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY =
  "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";

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
    modelName = CLAUDE_MODELS.CLAUDE_3_HAIKU // Use Haiku for faster, more cost-effective processing
  ) => {
    try {
      console.log("Processing document with Claude API", {
        documentId: documentData.id,
        fileUrl: documentData.fileUrl ? "provided" : "not provided",
      });

      // Default prompt for document analysis
      const defaultPrompt = `
        Please analyze this document and provide:
        1. A detailed summary (3-4 paragraphs)
        2. 5-7 key points or main themes
        3. Any important details or data points
        4. Action items or recommendations if applicable
        
        Organize the response in clearly labeled sections.
      `;

      const prompt = promptTemplate || defaultPrompt;

      // Prepare the request to Claude API
      const requestData = {
        model: modelName,
        max_tokens: 2500,
        temperature: 0.3, // Lower temperature for more factual responses
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      };

      // If document is a file URL, add it as an attachment
      if (documentData.fileUrl) {
        console.log("Adding file URL attachment to request");

        // Determine if it's an image or document based on mime type
        const isImage =
          documentData.mimeType &&
          (documentData.mimeType.startsWith("image/") ||
            documentData.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i));

        // Claude 3 API artık farklı bir format kullanıyor - sadece metin gönderelim
        // Dosyanın URL'sini prompt içine ekleyelim
        const promptWithUrl = `${prompt}\n\nDocument URL: ${documentData.fileUrl}\n\nPlease analyze this document based on the instructions above.`;

        requestData.messages[0].content = promptWithUrl;
      }

      console.log("Sending request to Claude API");

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      };

      // Make request to Claude API
      const response = await axios.post(CLAUDE_API_URL, requestData, {
        headers,
        timeout: 60000, // 1 minute timeout
      });

      console.log("Received response from Claude API", {
        status: response.status,
        hasContent: !!response.data?.content,
      });
      console.log(JSON.stringify(response.data), null, 2); // console.log(response)

      // Save the result to Firestore
      try {
        const resultId = await claudeService.saveAnalysisResult({
          documentId: documentData.id,
          userId: documentData.userId,
          analysisData: response.data,
          model: modelName,
          prompt: prompt,
        });

        console.log("Saved analysis result to Firestore", { resultId });
      } catch (saveError) {
        console.error("Error saving analysis result:", saveError);
        // Continue anyway - we have the analysis data to return
      }

      return response.data;
    } catch (error) {
      console.error("Error processing document with Claude API:", error);

      // Provide more detailed error information
      let errorMessage = "Failed to process document";

      if (error.response) {
        // The request was made and the server responded with an error status
        console.error("Claude API error response:", {
          status: error.response.status,
          data: error.response.data,
        });
        errorMessage = `Claude API error: ${
          error.response.status
        } - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received from Claude API");
        errorMessage = "No response received from Claude API";
      } else {
        // Something happened in setting up the request
        console.error("Error setting up Claude API request:", error.message);
        errorMessage = `Request setup error: ${error.message}`;
      }

      throw new Error(errorMessage);
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
    documentContext = null,
    modelName = CLAUDE_MODELS.CLAUDE_3_HAIKU
  ) => {
    try {
      console.log("Asking document question", { documentId, question });

      // If no context provided, try to get the most recent analysis
      let context = documentContext;
      if (!context) {
        try {
          const analysis = await this.getDocumentAnalysis(documentId);
          if (
            analysis &&
            analysis.analysisData &&
            analysis.analysisData.content
          ) {
            context = analysis.analysisData.content[0].text;
            console.log("Using analysis as context for question");
          }
        } catch (contextError) {
          console.error("Error getting analysis context:", contextError);
          // Continue with empty context
          context =
            "No context available. Please answer based on general knowledge about the document type.";
        }
      }

      const promptTemplate = `
        Answer the following question about this document:

        Question: ${question}

        Document content: ${context || "No document content available"}

        Provide a detailed, accurate answer based only on the information in the document.
        If you cannot answer the question using the available information, say so clearly.
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

      console.log("Sending question to Claude API");

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      };

      const response = await axios.post(CLAUDE_API_URL, requestData, {
        headers,
        timeout: 30000, // 30 second timeout
      });

      console.log("Received answer from Claude API");

      let answer = "";
      if (
        response.data &&
        response.data.content &&
        response.data.content.length > 0
      ) {
        answer = response.data.content[0].text;
      } else {
        answer = "I'm sorry, I couldn't generate an answer for your question.";
      }

      // Save the Q&A interaction to Firestore
      try {
        const conversationId = await claudeService.saveConversationEntry({
          documentId,
          question,
          answer,
          model: modelName,
        });
        console.log("Saved conversation to Firestore", { conversationId });
      } catch (saveError) {
        console.error("Error saving conversation:", saveError);
        // Continue anyway
      }

      return { answer, documentId, question };
    } catch (error) {
      console.error("Error asking document question:", error);
      throw new Error(`Failed to get answer: ${error.message}`);
    }
  },

  /**
   * Save document analysis result to Firestore
   * @param {Object} resultData - Analysis result data
   * @returns {Promise<string>} - Result document ID
   */
  saveAnalysisResult: async (resultData) => {
    try {
      console.log("Saving analysis result to Firestore");
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
      console.log("Saving conversation entry to Firestore");
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
      console.log("Getting document conversations", { documentId });
      const q = query(
        collection(FIRESTORE_DB, "document_conversations"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`Retrieved ${conversations.length} conversations`);
      return conversations;
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
      console.log("Getting document analysis", { documentId });
      const q = query(
        collection(FIRESTORE_DB, "analysis_results"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length === 0) {
        console.log("No analysis found for document");
        return null;
      }

      console.log("Retrieved document analysis");
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
