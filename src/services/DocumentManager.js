// services/DocumentManager.js
import { FIREBASE_APP, FIRESTORE_DB } from "../../FirebaseConfig";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { showToast } from "../utils/toast";

// Initialize Firebase Storage
const storage = getStorage(FIREBASE_APP);

// Anthropic API configuration
const CLAUDE_API_KEY =
  "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";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-3-haiku-20240307"; // Using Haiku for cost-effective, faster responses

export const documentManager = {
  /**
   * Pick a document from device storage
   * @returns {Promise<Object>} - Selected document info
   */
  pickDocument: async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("Document picker canceled");
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error("Error picking document:", error);
      throw error;
    }
  },

  /**
   * Process a document (upload, analyze with Claude)
   * @param {Object} file - File object with uri, name, type
   * @param {Function} onProgress - Progress callback (0-100, status)
   * @returns {Promise<Object>} - Processed document with analysis
   */
  processDocument: async (file, onProgress = () => {}) => {
    try {
      // Update progress
      onProgress(0, "preparing");
      console.log("Starting document processing", { fileName: file.name });

      // Get current user
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }
      const userId = auth.currentUser.uid;

      // Generate a unique file name
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const safeFileName = `doc_${timestamp}.${fileExtension}`;

      // Upload to Firebase Storage
      onProgress(10, "uploading");
      console.log("Uploading to Firebase Storage");

      const { downloadUrl, storagePath, size } = await uploadFile(
        file.uri,
        safeFileName,
        userId,
        file.type,
        (progress) => onProgress(10 + progress * 0.3, "uploading")
      );

      // Save document metadata to Firestore
      onProgress(40, "saving");
      console.log("Saving document metadata");

      const documentData = {
        name: file.name || "Unnamed Document",
        type: file.type || "application/octet-stream",
        size: file.size || size || 0,
        userId,
        storagePath,
        downloadUrl,
        status: "uploaded",
        fileExtension,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(FIRESTORE_DB, "documents"),
        documentData
      );
      const documentId = docRef.id;
      console.log("Document saved with ID:", documentId);

      // Process with Claude API
      onProgress(50, "analyzing");
      console.log("Analyzing with Claude API");

      try {
        // Read the file content
        let fileContent = "";

        // For text files, read content directly
        if (file.type === "text/plain") {
          const content = await FileSystem.readAsStringAsync(file.uri);
          fileContent = content;
        } else {
          // For other files, we'll provide the download URL to Claude
          fileContent = `File URL: ${downloadUrl}\nFile Type: ${file.type}\nFile Name: ${file.name}`;
        }

        // Prepare the prompt for Claude
        const prompt = `
          Please analyze this document and provide:
          1. A detailed summary (2-3 paragraphs)
          2. 5-7 key points or main themes
          3. Any important details or data points
          4. Action items or recommendations if applicable
          
          File information: 
          ${fileContent}
          
          Organize your response in clearly labeled sections.
        `;

        // Call Claude API
        const analysisResult = await callClaudeAPI(prompt);
        onProgress(80, "finalizing");

        // Extract the analysis text
        const analysisText = analysisResult.content[0].text;

        // Parse the analysis into structured format
        const parsedAnalysis = parseAnalysisContent(analysisText);

        // Update document with analysis result
        await updateDoc(doc(FIRESTORE_DB, "documents", documentId), {
          status: "analyzed",
          analysis: {
            fullText: analysisText,
            summary: parsedAnalysis.summary,
            keyPoints: parsedAnalysis.keyPoints,
            details: parsedAnalysis.details,
            recommendations: parsedAnalysis.recommendations,
            analyzed_at: serverTimestamp(),
          },
        });

        // Complete
        onProgress(100, "complete");

        // Return the document with analysis
        return {
          id: documentId,
          ...documentData,
          analysis: {
            fullText: analysisText,
            ...parsedAnalysis,
          },
        };
      } catch (analysisError) {
        console.error("Error analyzing document:", analysisError);

        // Update document status to indicate analysis failure
        await updateDoc(doc(FIRESTORE_DB, "documents", documentId), {
          status: "analysis_failed",
          error: analysisError.message,
        });

        // Still return the document, just without analysis
        onProgress(100, "upload_only");
        return {
          id: documentId,
          ...documentData,
          status: "upload_only",
          error: "Analysis failed: " + analysisError.message,
        };
      }
    } catch (error) {
      console.error("Error processing document:", error);
      throw error;
    }
  },

  /**
   * Get user's documents
   * @param {number} limit - Max number of documents to retrieve
   * @returns {Promise<Array>} - Array of user documents
   */
  getUserDocuments: async (limitCount = 20) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }
      const userId = auth.currentUser.uid;

      console.log("Getting user documents");
      const q = query(
        collection(FIRESTORE_DB, "documents"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`Retrieved ${documents.length} documents`);
      return documents;
    } catch (error) {
      console.error("Error getting user documents:", error);
      throw error;
    }
  },

  /**
   * Get a document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Document data
   */
  getDocumentById: async (documentId) => {
    try {
      console.log("Getting document by ID", { documentId });
      const docRef = doc(FIRESTORE_DB, "documents", documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log("Document not found");
        return null;
      }

      console.log("Document found");
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } catch (error) {
      console.error("Error getting document by ID:", error);
      throw error;
    }
  },

  /**
   * Ask a question about a document
   * @param {string} documentId - Document ID
   * @param {string} question - User's question
   * @returns {Promise<Object>} - Answer to the question
   */
  askDocumentQuestion: async (documentId, question) => {
    try {
      console.log("Asking question:", question);

      // Get document
      const document = await documentManager.getDocumentById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Get document analysis if available
      let context = "";
      if (document.analysis && document.analysis.fullText) {
        context = document.analysis.fullText;
      } else {
        context = `Document: ${document.name} (No full analysis available)`;
      }

      // Prepare the prompt for Claude
      const prompt = `
        Answer the following question about this document:
        
        Question: ${question}
        
        Document content: ${context}
        
        Provide a detailed answer based only on the document content. If you cannot answer based on the information available, please say so clearly.
      `;

      // Call Claude API
      const result = await callClaudeAPI(prompt);

      // Extract the answer
      const answer = result.content[0].text;

      // Save the question and answer to Firestore
      await addDoc(collection(FIRESTORE_DB, "document_conversations"), {
        documentId,
        question,
        answer,
        createdAt: serverTimestamp(),
        userId: getAuth().currentUser?.uid,
      });

      return { answer, question, documentId };
    } catch (error) {
      console.error("Error asking document question:", error);
      throw error;
    }
  },

  /**
   * Get conversations for a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Array>} - Array of conversations
   */
  getDocumentConversations: async (documentId) => {
    try {
      const q = query(
        collection(FIRESTORE_DB, "document_conversations"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  },
};

/**
 * Call Claude API
 * @param {string} prompt - The prompt to send to Claude
 * @returns {Promise<Object>} - Claude's response
 */
async function callClaudeAPI(prompt) {
  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        timeout: 60000, // 1 minute timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error("Claude API error:", error.response?.data || error.message);
    throw new Error(
      "Failed to analyze with Claude: " +
        (error.response?.data?.error?.message || error.message)
    );
  }
}

/**
 * Upload a file to Firebase Storage
 * @param {string} uri - File URI
 * @param {string} fileName - File name
 * @param {string} userId - User ID
 * @param {string} mimeType - File MIME type
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Upload result
 */
async function uploadFile(uri, fileName, userId, mimeType, onProgress) {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error("File not found");
    }

    // Create blob from file
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storagePath = `documents/${userId}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    // Upload task
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(1)}%`);
          onProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadUrl,
              storagePath,
              size: fileInfo.size,
            });
          } catch (urlError) {
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

/**
 * Parse analysis content into structured format
 * @param {string} text - Raw analysis text
 * @returns {Object} - Structured analysis
 */
function parseAnalysisContent(text) {
  const result = {
    summary: "",
    keyPoints: [],
    details: "",
    recommendations: [],
  };

  // Extract summary (usually first part or after "Summary:" heading)
  const summaryMatch = text.match(
    /(?:Summary|SUMMARY):(.*?)(?:\n\n|\n#|\n(?:Key Points|KEY POINTS))/s
  );
  if (summaryMatch && summaryMatch[1]) {
    result.summary = summaryMatch[1].trim();
  } else {
    // Fallback: take first paragraph
    const firstPara = text.split(/\n\n/)[0];
    result.summary = firstPara;
  }

  // Extract key points
  const keyPointsMatch = text.match(
    /(?:Key Points|KEY POINTS|Main Themes|MAIN THEMES):(.*?)(?:\n\n|\n#|\n(?:Details|DETAILS|Important|IMPORTANT|Action|ACTION))/s
  );
  if (keyPointsMatch && keyPointsMatch[1]) {
    const keyPointsText = keyPointsMatch[1].trim();
    result.keyPoints = keyPointsText
      .split(/\n(?:-|\*|\d+\.)\s*/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
  }

  // Extract details
  const detailsMatch = text.match(
    /(?:Details|DETAILS|Important Details|IMPORTANT DETAILS):(.*?)(?:\n\n|\n#|\n(?:Action|ACTION|Recommendations|RECOMMENDATIONS))/s
  );
  if (detailsMatch && detailsMatch[1]) {
    result.details = detailsMatch[1].trim();
  }

  // Extract recommendations
  const recommendationsMatch = text.match(
    /(?:Action Items|ACTION ITEMS|Recommendations|RECOMMENDATIONS):(.*?)(?:\n\n|\n#|\n(?:Conclusion|CONCLUSION|$))/s
  );
  if (recommendationsMatch && recommendationsMatch[1]) {
    const recommendationsText = recommendationsMatch[1].trim();
    result.recommendations = recommendationsText
      .split(/\n(?:-|\*|\d+\.)\s*/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
  }

  return result;
}
