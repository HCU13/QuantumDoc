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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { LanguageSwitcher } from "../../hooks/LanguageSwitcher";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const DocumentDetailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = LanguageSwitcher();
  const [activeTab, setActiveTab] = useState("summary"); // summary, insights, qa

  // Q&A states
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([
    {
      id: "1",
      question: "What are the key financial metrics in this report?",
      answer:
        "The key financial metrics in this report include revenue growth (25% increase), operating cost reduction (12%), and customer acquisition cost (decreased by 18%).",
      timestamp: new Date().getTime() - 3600000,
    },
    {
      id: "2",
      question: "Which market showed the strongest growth?",
      answer:
        "According to the report, the new market expansion contributed to 15% of the overall growth, with the Asian markets showing particularly strong performance.",
      timestamp: new Date().getTime() - 1800000,
    },
  ]);
  const [sending, setSending] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  // Bu veriler normalde API'den gelecek
  const documentDetails = {
    title: "Financial Report Q4 2024",
    type: "PDF",
    pages: 15,
    dateAnalyzed: "2024-02-14",
    summary: "This financial report outlines the key performance indicators...",
    keyInsights: [
      "Revenue increased by 25% compared to Q3",
      "Operating costs reduced by 12%",
      "New market expansion contributed to 15% growth",
      "Customer acquisition cost decreased by 18%",
    ],
    topics: [
      { name: "Financial Performance", confidence: 0.95 },
      { name: "Market Analysis", confidence: 0.88 },
      { name: "Risk Assessment", confidence: 0.82 },
    ],
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!question.trim() || sending) return;

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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create answer based on question
      const answer = generateAnswer(newQuestion.question);

      // Update conversation with answer
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === newQuestion.id ? { ...conv, answer } : conv
        )
      );

      // Scroll to updated answer
      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error("Error generating answer:", error);
    } finally {
      setAiThinking(false);
      setSending(false);
    }
  };

  // Simple answer generation based on question
  const generateAnswer = (question) => {
    const lowercaseQuestion = question.toLowerCase();

    if (
      lowercaseQuestion.includes("revenue") ||
      lowercaseQuestion.includes("growth")
    ) {
      return "The revenue has increased by 25% compared to Q3, primarily driven by new market expansion which contributed to 15% of this growth.";
    } else if (
      lowercaseQuestion.includes("cost") ||
      lowercaseQuestion.includes("expense")
    ) {
      return "Operating costs were reduced by 12% this quarter. Additionally, customer acquisition cost decreased by 18%, which is a significant improvement from previous quarters.";
    } else if (
      lowercaseQuestion.includes("market") ||
      lowercaseQuestion.includes("expansion")
    ) {
      return "The new market expansion contributed to 15% growth. The company has successfully entered three new regional markets, with the Asian market showing particularly strong initial acceptance.";
    } else {
      return "Based on the financial report, the company had a strong Q4 with 25% revenue growth, 12% reduction in operating costs, and 18% decrease in customer acquisition costs. New market expansion was a key driver, contributing to 15% of overall growth.";
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
            <Ionicons name="document-text" size={32} color="white" />
          </View>
          <View style={styles.documentMeta}>
            <Text style={styles.documentTitle} color="white">
              {documentDetails.title}
            </Text>
            <Text style={styles.documentSubtitle} color="white">
              {documentDetails.type} • {documentDetails.pages} pages
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

  const renderSummary = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Document Summary
      </Text>
      <Text style={[styles.summaryText, { color: theme.colors.text }]}>
        {documentDetails.summary}
      </Text>

      <View style={styles.topicsContainer}>
        <Text style={[styles.topicsTitle, { color: theme.colors.text }]}>
          Main Topics
        </Text>
        {documentDetails.topics.map((topic, index) => (
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
    </View>
  );

  const renderInsights = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Key Insights
      </Text>
      {documentDetails.keyInsights.map((insight, index) => (
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

  // Professionally redesigned Q&A section with chat interface
  const renderQA = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={[styles.qaContainer, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {/* Compact header floating at the top of chat */}
      {/* <View
        style={[
          styles.qaCompactHeader,
          { borderBottomColor: theme.colors.border },
        ]}
      >
        <View style={styles.qaHeaderLeft}>
          <View
            style={[
              styles.qaHeaderIconSmall,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={18}
              color={theme.colors.primary}
            />
          </View>
          <Text
            style={[styles.qaCompactTitle, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            Document AI Assistant
          </Text>
        </View>

        {conversations.length > 0 && (
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.colors.border }]}
            onPress={() => setConversations([])}
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              Clear Chat
            </Text>
          </TouchableOpacity>
        )}
      </View> */}

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
              "Summarize the main risks mentioned",
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
                <Text style={{ color: theme.colors.primary }}>{example}</Text>
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
          {conversations.map((item, index) => (
            <View key={item.id} style={styles.messageGroup}>
              {/* Show date separator for first message or when day changes */}
              {index === 0 && (
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
                    Today
                  </Text>
                  <View
                    style={[
                      styles.dateLine,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                </View>
              )}

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
                    <Text style={{ color: theme.colors.text, lineHeight: 20 }}>
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
