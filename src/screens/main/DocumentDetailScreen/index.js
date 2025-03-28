import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useTokens } from "../../../context/TokenContext";
import { useAuth } from "../../../context/AuthContext";
import { useApp } from "../../../context/AppContext";
import { Text, EmptyState, Loading } from "../../../components";
import Header from "./Header";
import SummaryView from "./SummaryView";
import QuestionsView from "./QuestionsView";
import DocumentService from "../../../services/documentService";

const DocumentDetailScreen = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { hasEnoughTokens, useToken, TOKEN_COSTS } = useTokens();
  const { isConnected } = useApp();

  // Get document ID from route params
  const { documentId, newDocument } = route.params || {};

  // State
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [analyzing, setAnalyzing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [freeQuestionsCount, setFreeQuestionsCount] = useState(3);

  // Load document data
  useEffect(() => {
    loadDocument();
  }, [documentId]);

  // Load document and conversations
  const loadDocument = async () => {
    try {
      setLoading(true);

      // Check if network is connected
      if (!isConnected) {
        Alert.alert("Offline Mode", "You are currently offline. Some features may not be available.");
      }

      // Get document details
      const doc = await DocumentService.getDocumentById(documentId);
      setDocument(doc);

      // Get conversations
      const convs = await DocumentService.getDocumentConversations(documentId);
      setConversations(convs);

      // Calculate free questions left
      setFreeQuestionsCount(Math.max(0, 3 - convs.length));

      setLoading(false);

      // If new document, show success notification
      if (newDocument) {
        Alert.alert(
          "Document Ready",
          "Your document has been successfully processed.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error loading document:", error);
      setLoading(false);

      // Show error and navigate back
      Alert.alert("Error", "Failed to load document. Please try again later.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  // Refresh document
  const refreshDocument = async () => {
    setRefreshing(true);
    await loadDocument();
    setRefreshing(false);
  };

  // Share document
  const shareDocument = async () => {
    if (!document || !isConnected) return;
    
    try {
      await DocumentService.shareDocument(document);
    } catch (error) {
      console.error("Error sharing document:", error);
      Alert.alert("Error", "Failed to share document.");
    }
  };

  // Delete document
  const deleteDocument = () => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await DocumentService.deleteDocument(documentId);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting document:", error);
              setLoading(false);
              Alert.alert(
                "Error",
                "Failed to delete document. Please try again later."
              );
            }
          },
        },
      ]
    );
  };

  // Ask a question about the document
  const askQuestion = async () => {
    if (!question.trim() || sending || !isConnected) return;

    try {
      setSending(true);

      // Create temporary conversation
      const tempId = Date.now().toString();
      const tempConversation = {
        id: tempId,
        question: question.trim(),
        isPending: true,
        createdAt: new Date(),
      };

      // Add to UI immediately
      setConversations([tempConversation, ...conversations]);

      // Clear input
      setQuestion("");

      // Check if token needed
      const needsToken = freeQuestionsCount <= 0;

      if (needsToken) {
        const canAsk = hasEnoughTokens(TOKEN_COSTS.QUESTION);

        if (!canAsk) {
          // Update conversation to show error
          setConversations([
            {
              ...tempConversation,
              answer: "You don't have enough tokens to ask this question.",
              error: true,
              isPending: false,
            },
            ...conversations.filter((c) => c.id !== tempId),
          ]);

          setTimeout(() => {
            Alert.alert(
              "Not Enough Tokens",
              "You need to purchase more tokens to ask additional questions.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Get Tokens",
                  onPress: () => navigation.navigate("TokenStore"),
                },
              ]
            );
          }, 500);

          setSending(false);
          return;
        }

        // Use token
        await useToken(TOKEN_COSTS.QUESTION, "question", documentId);
      }

      // Get answer from Claude via DocumentService
      const conversation = await DocumentService.askDocumentQuestion(
        documentId,
        user.uid,
        tempConversation.question
      );

      // Update conversation list
      setConversations((prev) => [
        conversation,
        ...prev.filter((c) => c.id !== tempId),
      ]);

      // Update free questions count
      if (freeQuestionsCount > 0) {
        setFreeQuestionsCount(freeQuestionsCount - 1);
      }
    } catch (error) {
      console.error("Error asking question:", error);

      // Update conversation to show error
      setConversations((prev) => {
        const tempConv = prev.find((c) => c.isPending);
        if (tempConv) {
          return [
            {
              ...tempConv,
              answer:
                "Sorry, there was an error processing your question. Please try again.",
              error: true,
              isPending: false,
            },
            ...prev.filter((c) => !c.isPending),
          ];
        }
        return prev;
      });
    } finally {
      setSending(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: theme.spacing.md, color: theme.colors.text }}>
          Loading document...
        </Text>
      </View>
    );
  }

  // If document not found
  if (!document) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <EmptyState
          title="Document Not Found"
          message="This document may have been deleted or is no longer available"
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
          variant="default"
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <Header
        document={document}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={() => navigation.goBack()}
        onShare={shareDocument}
        onDelete={deleteDocument}
        theme={theme}
        isDark={isDark}
        conversationsCount={conversations.length}
      />

      <View style={styles.content}>
        {activeTab === "summary" ? (
          <SummaryView
            document={document}
            theme={theme}
            refreshDocument={refreshDocument}
            refreshing={refreshing}
          />
        ) : (
          <QuestionsView
            document={document}
            conversations={conversations}
            freeQuestionsCount={freeQuestionsCount}
            askQuestion={askQuestion}
            question={question}
            setQuestion={setQuestion}
            sending={sending}
            theme={theme}
            isDark={isDark}
            isConnected={isConnected}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default DocumentDetailScreen;