import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { LanguageSwitcher } from "../../hooks/LanguageSwitcher";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { documentManager } from "../../services/DocumentManager";
import { showToast } from "../../utils/toast";

const { width } = Dimensions.get("window");

export const DocumentDetailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = LanguageSwitcher();
  const [activeTab, setActiveTab] = useState("summary"); // summary, insights, qa

  // Document states
  const { documentId } = route.params || {};
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentContent, setDocumentContent] = useState(null);

  // Q&A states
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([]);
  const [sending, setSending] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load document data when the component mounts
  useEffect(() => {
    if (documentId) {
      loadDocument();
    } else {
      setLoading(false);
      showToast.error("Error", "No document ID provided");
    }
  }, [documentId]);

  // Load document data from Firebase
  const loadDocument = async () => {
    try {
      setLoading(true);

      // Get document by ID
      const docData = await documentManager.getDocumentById(documentId);

      if (!docData) {
        throw new Error("Document not found");
      }

      console.log("Document loaded:", docData);
      setDocument(docData);

      // Get document conversations (Q&A history)
      try {
        const convos = await documentManager.getDocumentConversations(
          documentId
        );
        if (convos && convos.length > 0) {
          setConversations(
            convos.map((c) => ({
              id: c.id,
              question: c.question,
              answer: c.answer,
              timestamp: c.createdAt
                ? new Date(c.createdAt).getTime()
                : new Date().getTime(),
            }))
          );
        }
      } catch (convoError) {
        console.error("Error loading conversations:", convoError);
        // Continue anyway - just won't have conversations history
      }
    } catch (error) {
      console.error("Error loading document:", error);
      showToast.error("Error", "Failed to load document");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // This verifies scroll to end when a new message is added
  useEffect(() => {
    if (conversations.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversations]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!question.trim() || sending || !documentId) return;

    Keyboard.dismiss();
    setSending(true);

    // Create new question
    const newQuestion = {
      id: `q-${Date.now()}`,
      question: question.trim(),
      timestamp: new Date().getTime(),
    };

    // Add question to conversations
    setConversations((prev) => [...prev, newQuestion]);
    setQuestion("");

    // Scroll to bottom
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }

    // Simulate AI thinking
    setAiThinking(true);

    try {
      // Send question to Claude API
      const response = await documentManager.askDocumentQuestion(
        documentId,
        newQuestion.question
      );

      // Update conversation with answer
      if (response && response.answer) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newQuestion.id
              ? { ...conv, answer: response.answer }
              : conv
          )
        );
      } else {
        throw new Error("Failed to get answer");
      }

      // Scroll to updated answer
      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      showToast.error("Error", "Failed to generate answer");

      // Still show something
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === newQuestion.id
            ? {
                ...conv,
                answer:
                  "I'm sorry, I had trouble processing that question. Please try again or ask in a different way.",
              }
            : conv
        )
      );
    } finally {
      setAiThinking(false);
      setSending(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.documentInfo}>
          <View
            style={[
              styles.documentIcon,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Ionicons
              name={
                document?.type?.includes("pdf")
                  ? "document-text"
                  : document?.type?.includes("image")
                  ? "image"
                  : "document"
              }
              size={32}
              color="white"
            />
          </View>
          <View style={styles.documentMeta}>
            <Text style={styles.documentTitle} color="white">
              {document?.name || "Document"}
            </Text>
            <Text style={styles.documentSubtitle} color="white">
              {document?.type || "File"} •{" "}
              {document?.createdAt
                ? new Date(document.createdAt).toLocaleDateString()
                : ""}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderTabs = () => (
    <View
      style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "summary" && {
            borderBottomColor: theme.colors.primary,
            borderBottomWidth: 2,
          },
        ]}
        onPress={() => setActiveTab("summary")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "summary"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          Summary
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "insights" && {
            borderBottomColor: theme.colors.primary,
            borderBottomWidth: 2,
          },
        ]}
        onPress={() => setActiveTab("insights")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "insights"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          Key Insights
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "qa" && {
            borderBottomColor: theme.colors.primary,
            borderBottomWidth: 2,
          },
        ]}
        onPress={() => setActiveTab("qa")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "qa"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          Q&A
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSummary = () => {
    if (loading) {
      return (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
            Loading document information...
          </Text>
        </View>
      );
    }

    // If no document is loaded or analysis is not available
    if (!document || !document.analysisResult) {
      return (
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Document Summary
          </Text>
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            This document has not been analyzed yet or analysis information is
            not available.
          </Text>

          <View style={styles.documentDetails}>
            <View style={styles.detailItem}>
              <Ionicons
                name="folder-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Type: {document?.type || "Unknown"}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Date:{" "}
                {document?.createdAt
                  ? new Date(document.createdAt).toLocaleDateString()
                  : "Unknown"}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="document-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Size:{" "}
                {document?.size
                  ? Math.round(document.size / 1024) + " KB"
                  : "Unknown"}
              </Text>
            </View>
          </View>

          <Button
            title="Analyze Document"
            onPress={() =>
              Alert.alert(
                "Not Available",
                "Document analysis is not available at this time."
              )
            }
            theme={theme}
            style={{ marginTop: 24 }}
          />
        </View>
      );
    }

    // Extract summary from analysis result
    let summary = "No summary available";
    let topics = [];

    try {
      // Try to parse the analysis result and extract summary
      if (
        document.analysisResult.content &&
        document.analysisResult.content[0]
      ) {
        summary = document.analysisResult.content[0].text;

        // Extract main topics if available
        const topicsMatch = summary.match(
          /(?:main topics|key themes):(.*?)(?:\n\n|\n\d|\n$)/is
        );
        if (topicsMatch && topicsMatch[1]) {
          const topicsText = topicsMatch[1].trim();
          topics = topicsText
            .split(/\n/)
            .map((t) => ({
              name: t.replace(/^\d+\.\s*|\*\s*|-\s*/g, "").trim(),
              confidence: 0.8 + Math.random() * 0.2, // Just for display
            }))
            .filter((t) => t.name);
        }
      }
    } catch (error) {
      console.error("Error parsing analysis result:", error);
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Document Summary
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          {summary}
        </Text>

        {topics.length > 0 && (
          <View style={styles.topicsContainer}>
            <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>
              Main Topics
            </Text>
            {topics.map((topic, index) => (
              <View
                key={index}
                style={[
                  styles.topicItem,
                  { backgroundColor: theme.colors.primary + "10" },
                ]}
              >
                <Text style={{ color: theme.colors.text }}>{topic.name}</Text>
                <View
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text style={{ color: theme.colors.primary }}>
                    {Math.round(topic.confidence * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderInsights = () => {
    if (loading) {
      return (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
            Loading insights...
          </Text>
        </View>
      );
    }

    // If no document is loaded or analysis is not available
    if (!document || !document.analysisResult) {
      return (
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Key Insights
          </Text>
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            No insights available for this document.
          </Text>
        </View>
      );
    }

    // Extract insights from analysis result
    let insights = [];

    try {
      // Try to parse the analysis result and extract insights
      if (
        document.analysisResult.content &&
        document.analysisResult.content[0]
      ) {
        const analysisText = document.analysisResult.content[0].text;

        // Try to find insights, key points, or similar sections
        const insightsMatch = analysisText.match(
          /(?:key points|key insights|main points|important points):(.*?)(?:\n\n|\n[A-Z]|\n$)/is
        );
        if (insightsMatch && insightsMatch[1]) {
          const insightsText = insightsMatch[1].trim();
          insights = insightsText
            .split(/\n/)
            .map((i) => i.replace(/^\d+\.\s*|\*\s*|-\s*/g, "").trim())
            .filter((i) => i);
        }

        // If no insights found, try to extract some other meaningful content
        if (insights.length === 0) {
          // Just extract some paragraphs as insights
          insights = analysisText
            .split(/\n\n/)
            .filter((p) => p.length > 30 && p.length < 300)
            .slice(0, 4);
        }
      }
    } catch (error) {
      console.error("Error parsing insights:", error);
    }

    // If still no insights, provide a fallback
    if (insights.length === 0) {
      insights = [
        "No specific insights could be extracted from this document.",
      ];
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Key Insights
        </Text>
        {insights.map((insight, index) => (
          <View
            key={index}
            style={[
              styles.insightItem,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons name="bulb" size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              {insight}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Professionally redesigned Q&A section with chat interface
  const renderQA = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={[styles.qaContainer, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {loading ? (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
            Loading conversation history...
          </Text>
        </View>
      ) : (
        <>
          {/* Chat conversation area - taking maximum space */}
          {conversations.length === 0 ? (
            <View style={styles.emptyChat}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: theme.colors.primary + "10" },
                ]}
              >
                <Ionicons
                  name="chatbubbles"
                  size={38}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Ask About This Document
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Get instant AI-powered answers to your questions about this
                document's content
              </Text>
              <View style={styles.exampleContainer}>
                <Text
                  style={[
                    styles.exampleTitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Try asking:
                </Text>
                {[
                  "What are the key financial highlights?",
                  "Which areas showed growth?",
                  "Summarize the main points",
                ].map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.exampleItem,
                      { backgroundColor: theme.colors.surface },
                    ]}
                    onPress={() => {
                      setQuestion(example);
                      setTimeout(() => {
                        if (inputRef.current) inputRef.current.focus();
                      }, 100);
                    }}
                  >
                    <Text style={{ color: theme.colors.primary }}>
                      {example}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatContainer}
              contentContainerStyle={[
                styles.chatContent,
                { paddingBottom: keyboardVisible ? keyboardHeight + 20 : 80 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.dateSeparator}>
                <View
                  style={[
                    styles.dateLine,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <Text
                  style={[
                    styles.dateText,
                    {
                      color: theme.colors.textSecondary,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  Conversation
                </Text>
                <View
                  style={[
                    styles.dateLine,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              </View>

              {conversations.map((item, index) => (
                <View key={item.id || index} style={styles.messageGroup}>
                  {/* User question */}
                  <View style={styles.userMessageContainer}>
                    <View
                      style={[
                        styles.userMessage,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Text style={{ color: "white" }}>{item.question}</Text>
                    </View>
                  </View>

                  {/* AI response */}
                  <View style={styles.aiMessageContainer}>
                    {item.answer ? (
                      <View
                        style={[
                          styles.aiMessage,
                          { backgroundColor: theme.colors.surface },
                        ]}
                      >
                        <Text
                          style={{ color: theme.colors.text, lineHeight: 20 }}
                        >
                          {item.answer}
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.aiTypingContainer,
                          { backgroundColor: theme.colors.surface },
                        ]}
                      >
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.aiTypingText,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          AI is thinking...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Fixed input bar at the bottom */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -keyboardHeight],
                    }),
                  },
                ],
                bottom: keyboardVisible ? 0 : 0,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Ask a question about this document..."
              placeholderTextColor={theme.colors.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline={true}
              maxLength={200}
              numberOfLines={1}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: question.trim()
                    ? theme.colors.primary
                    : theme.colors.primary + "50",
                },
              ]}
              onPress={handleSendMessage}
              disabled={!question.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={18} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </KeyboardAvoidingView>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={[""]} style={{ flex: 1 }}>
        {renderHeader()}
        {renderTabs()}

        {activeTab === "summary" && renderSummary()}
        {activeTab === "insights" && renderInsights()}
        {activeTab === "qa" && renderQA()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    minHeight: 200,
  },
  documentDetails: {
    marginTop: 24,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    height: 220,
  },
  headerGradient: {
    flex: 1,
    padding: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 40 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 16,
  },
  documentIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  documentMeta: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    padding: 20,
    borderRadius: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  topicsContainer: {
    gap: 12,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Professional Q&A styles
  qaContainer: {
    flex: 1,
    position: "relative",
  },
  qaCompactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  qaHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  qaHeaderIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  qaCompactTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: "80%",
  },
  exampleContainer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "flex-start",
  },
  exampleTitle: {
    marginBottom: 8,
    fontSize: 14,
  },
  exampleItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 8,
    width: "100%",
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dateText: {
    paddingHorizontal: 8,
    fontSize: 12,
  },
  messageGroup: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  userMessage: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    minWidth: 80,
  },
  aiMessageContainer: {
    alignItems: "flex-start",
  },
  aiMessage: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 80,
  },
  aiTypingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aiTypingText: {
    marginLeft: 8,
    fontSize: 12,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8,
    paddingRight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 16,
    bottom: Platform.OS === "ios" ? 27 : 14,
  },
});
