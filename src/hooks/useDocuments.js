// hooks/useDocuments.js
import { useState, useEffect, useCallback } from "react";
import { documentManager } from "../services/DocumentManager";
import { useAuth } from "./useAuth";
import { useLoading } from "../context/LoadingContext";
import { showToast } from "../utils/toast";

export const useDocuments = () => {
  const { user } = useAuth();
  const { showLoading } = useLoading();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");

  // Load user documents
  useEffect(() => {
    if (user?.uid) {
      loadDocuments();
    }
  }, [user]);

  // Load documents
  const loadDocuments = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      const docs = await documentManager.getUserDocuments(user.uid);
      setDocuments(docs);
    } catch (err) {
      console.error("Error loading documents:", err);
      setError("Failed to load documents");
      showToast.error("Error", "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Pick and process document
  const pickAndProcessDocument = useCallback(async () => {
    if (!user?.uid) {
      showToast.error("Error", "You must be logged in");
      return null;
    }

    try {
      // Reset processing states
      setProcessingProgress(0);
      setProcessingStatus("");

      // Pick document
      const file = await documentManager.pickDocument();
      if (!file) return null; // User canceled

      // Process document with progress tracking
      setProcessingStatus("processing");
      const processedDoc = await documentManager.processDocument(
        file,
        user.uid,
        (progress, status) => {
          setProcessingProgress(progress);
          setProcessingStatus(status);
        }
      );

      // Refresh documents list
      await loadDocuments();

      showToast.success("Success", "Document processed successfully");

      return processedDoc;
    } catch (err) {
      console.error("Error processing document:", err);
      setError("Failed to process document");
      showToast.error("Error", "Failed to process document");
      return null;
    } finally {
      setProcessingStatus("");
    }
  }, [user, loadDocuments]);

  // Scan and process document
  const scanAndProcessDocument = useCallback(async () => {
    if (!user?.uid) {
      showToast.error("Error", "You must be logged in");
      return null;
    }

    try {
      // Reset processing states
      setProcessingProgress(0);
      setProcessingStatus("");

      // Scan document
      const scannedDoc = await documentManager.scanDocument();
      if (!scannedDoc) return null; // User canceled

      // Process document with progress tracking
      setProcessingStatus("processing");
      const processedDoc = await documentManager.processDocument(
        scannedDoc,
        user.uid,
        (progress, status) => {
          setProcessingProgress(progress);
          setProcessingStatus(status);
        }
      );

      // Refresh documents list
      await loadDocuments();

      showToast.success(
        "Success",
        "Document scanned and processed successfully"
      );

      return processedDoc;
    } catch (err) {
      console.error("Error scanning document:", err);
      setError("Failed to scan document");
      showToast.error("Error", "Failed to scan document");
      return null;
    } finally {
      setProcessingStatus("");
    }
  }, [user, loadDocuments]);

  // Get document by ID
  const getDocumentById = useCallback(async (documentId) => {
    try {
      return await documentManager.getDocumentById(documentId);
    } catch (err) {
      console.error("Error getting document:", err);
      setError("Failed to get document");
      showToast.error("Error", "Failed to get document");
      return null;
    }
  }, []);

  // Ask a question about a document
  const askDocumentQuestion = useCallback(
    async (documentId, question) => {
      if (!documentId || !question) {
        showToast.error("Error", "Invalid document or question");
        return null;
      }

      try {
        return await showLoading(() =>
          documentManager.askDocumentQuestion(documentId, question)
        );
      } catch (err) {
        console.error("Error asking question:", err);
        setError("Failed to get answer");
        showToast.error("Error", "Failed to get answer");
        return null;
      }
    },
    [showLoading]
  );

  // Get document conversations
  const getDocumentConversations = useCallback(async (documentId) => {
    if (!documentId) return [];

    try {
      return await documentManager.getDocumentConversations(documentId);
    } catch (err) {
      console.error("Error getting conversations:", err);
      setError("Failed to get conversations");
      showToast.error("Error", "Failed to get conversation history");
      return [];
    }
  }, []);

  // Delete document
  const deleteDocument = useCallback(
    async (documentId) => {
      if (!documentId) {
        showToast.error("Error", "Invalid document");
        return false;
      }

      try {
        await showLoading(() => documentManager.deleteDocument(documentId));

        // Update documents list
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc.id !== documentId)
        );

        showToast.success("Success", "Document deleted successfully");
        return true;
      } catch (err) {
        console.error("Error deleting document:", err);
        setError("Failed to delete document");
        showToast.error("Error", "Failed to delete document");
        return false;
      }
    },
    [showLoading]
  );

  return {
    documents,
    loading,
    error,
    processingProgress,
    processingStatus,
    loadDocuments,
    pickAndProcessDocument,
    scanAndProcessDocument,
    getDocumentById,
    askDocumentQuestion,
    getDocumentConversations,
    deleteDocument,
  };
};
