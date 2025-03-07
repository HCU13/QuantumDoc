import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Keyboard,
  Share,
  ActivityIndicator,
  Animated,
  Image,
  Platform,
} from "react-native";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { documentManager } from "../../services/DocumentManager";
import { showToast } from "../../utils/toast";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 90 : 70;
const HEADER_EXPANDED_HEIGHT = 220;

export const DocumentDetailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { documentId } = route.params || {};
  
  // States
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([]);
  const [sending, setSending] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [parsedAnalysis, setParsedAnalysis] = useState(null);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_HEIGHT],
    extrapolate: "clamp",
  });
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_HEIGHT - 40, HEADER_EXPANDED_HEIGHT - HEADER_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });
  const headerDetailOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Load document when component mounts
  useEffect(() => {
    if (documentId) {
      loadDocument();
    } else {
      setLoading(false);
      showToast.error("Error", "No document ID provided");
      navigation.goBack();
    }
  }, [documentId]);

  // Load document from server
  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentManager.getDocumentById(documentId);

      if (!doc) {
        throw new Error("Document not found");
      }

      console.log("Document loaded:", doc);
      setDocument(doc);

      // Parse analysis content if available
      if (doc.analysisResult && doc.analysisResult.content) {
        const parsedContent = parseAnalysisContent(doc.analysisResult.content);
        setParsedAnalysis(parsedContent);
      }

      // Load conversations
      try {
        const convos = await documentManager.getDocumentConversations(documentId);
        if (convos && convos.length > 0) {
          setConversations(convos.map((c) => ({
            id: c.id,
            question: c.question,
            answer: c.answer,
            timestamp: c.createdAt ? new Date(c.createdAt).getTime() : new Date().getTime(),
          })));
        }
      } catch (convoError) {
        console.error("Error loading conversations:", convoError);
        // Continue anyway
      }
    } catch (error) {
      console.error("Error loading document:", error);
      showToast.error("Error", "Failed to load document");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Parse Claude's analysis into structured content
  const parseAnalysisContent = (content) => {
    // Extract text from analysis content
    const fullText = content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n\n");

    // Initialize structure
    const parsedContent = {
      summary: "",
      keyPoints: [],
      details: "",
      recommendations: [],
    };

    // Extract summary
    const summaryMatch = fullText.match(
      /(?:Özet|Summary):(.*?)(?:\n\n|\n(?:Ana|Key))/s
    );
    if (summaryMatch && summaryMatch[1]) {
      parsedContent.summary = summaryMatch[1].trim();
    } else {
      // Fallback: take first paragraph
      const firstParagraph = fullText.split(/\n\n/)[0];
      parsedContent.summary = firstParagraph;
    }

    // Extract key points
    const keyPointsPattern =
      /(?:Ana Noktalar|Ana Temalar|Key Points|Main Themes|Main Points):(.*?)(?:\n\n|\n(?:Detay|Detail|Özet|Sonuç|Öneri|Recom))/s;
    const keyPointsMatch = fullText.match(keyPointsPattern);

    if (keyPointsMatch && keyPointsMatch[1]) {
      const keyPointsText = keyPointsMatch[1].trim();
      parsedContent.keyPoints = keyPointsText
        .split(/\n(?:\d+\.|•|\*|-)\s*/)
        .filter((p) => p.trim().length > 0)
        .map((p) => p.trim());
    }

    // If no key points found, try to extract lines that start with numbers
    if (parsedContent.keyPoints.length === 0) {
      const numberedPoints = fullText.match(/\n\d+\.\s*(.*?)(?=\n\d+\.|\n\n|$)/g);
      if (numberedPoints) {
        parsedContent.keyPoints = numberedPoints
          .map((p) => p.replace(/\n\d+\.\s*/, "").trim())
          .filter((p) => p.length > 0);
      }
    }

    // Extract recommendations
    const recommendationsPattern =
      /(?:Öneriler|Tavsiyeler|Recommendations|Suggested|Actions):(.*?)(?:\n\n|\n(?:Sonuç|Conclusion|$))/s;
    const recommendationsMatch = fullText.match(recommendationsPattern);

    if (recommendationsMatch && recommendationsMatch[1]) {
      const recommendationsText = recommendationsMatch[1].trim();
      parsedContent.recommendations = recommendationsText
        .split(/\n(?:\d+\.|•|\*|-)\s*/)
        .filter((p) => p.trim().length > 0)
        .map((p) => p.trim());
    }

    // Extract details
    const detailsPattern =
      /(?:Detaylar|Bilgiler|Details|Additional Information):(.*?)(?:\n\n|\n(?:Sonuç|Öneriler|Conclusion|Recommendations))/s;
    const detailsMatch = fullText.match(detailsPattern);

    if (detailsMatch && detailsMatch[1]) {
      parsedContent.details = detailsMatch[1].trim();
    }

    return parsedContent;
  };

  // Handle sending a question
  const handleSendMessage = async () => {
    if (!question.trim() || sending || !documentId) return;

    // Provide haptic feedback
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
      // Send question to API
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

      // Show fallback response
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

  // Share document
  const shareDocument = async () => {
    try {
      if (!document) return;
      
      await Share.share({
        title: document.name || "Document",
        message: `Check out this document: ${document.name}\n\n${
          parsedAnalysis?.summary || "No summary available"
        }`,
      });
    } catch (error) {
      console.error("Error sharing document:", error);
      showToast.error("Error", "Failed to share document");
    }
  };

  // Get document icon based on type
  const getDocumentIcon = (type) => {
    if (!type) return "document";

    type = type.toLowerCase();
    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";

    return "document";
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";

    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Header Component
  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          backgroundColor: theme.colors.primary,
        },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Status Bar */}
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Back Button & Actions */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Animated.Text
            style={[
              styles.headerTitle,
              { opacity: headerTitleOpacity, color: "white" },
            ]}
            numberOfLines={1}
          >
            {document?.name || "Document"}
          </Animated.Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={shareDocument}
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Document Info (visible when expanded) */}
        <Animated.View 
          style={[
            styles.documentInfo,
            { opacity: headerDetailOpacity },
          ]}
        >
          <View
            style={[
              styles.documentIcon,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Ionicons
              name={getDocumentIcon(document?.type)}
              size={32}
              color="white"
            />
          </View>
          
          <View style={styles.documentMeta}>
            <Text style={styles.documentTitle} color="white">
              {document?.name || "Document"}
            </Text>
            <Text style={styles.documentSubtitle} color="white">
              {document?.type || "File"} • {formatFileSize(document?.size)} •{" "}
              {formatDate(document?.createdAt)}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );

  // Tabs Component
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

  // Summary Tab Content
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

    if (!document || !parsedAnalysis) {
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
                  ? formatDate(document.createdAt)
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
                Size: {formatFileSize(document?.size)}
              </Text>
            </View>
          </View>

          <Button
            title="Analyze Document"
            onPress={() => {
              showToast.info("Info", "Document analysis in progress");
            }}
            theme={theme}
            style={{ marginTop: 24 }}
          />
        </View>
      );
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Document Summary
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          {parsedAnalysis.summary || "No summary available"}
        </Text>

        {parsedAnalysis.keyPoints.length > 0 && (
          <View style={styles.keyPointsPreview}>
            <Text style={[styles.keyPointsTitle, { color: theme.colors.text }]}>
              Key Points
            </Text>
            {parsedAnalysis.keyPoints.slice(0, 3).map((point, index) => (
              <View key={index} style={styles.keyPointItem}>
                <View
                  style={[
                    styles.bulletPoint,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
                <Text
                  style={[styles.keyPointText, { color: theme.colors.text }]}
                >
                  {point}
                </Text>
              </View>
            ))}
            {parsedAnalysis.keyPoints.length > 3 && (
              <TouchableOpacity
                style={[
                  styles.seeMoreButton,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
                onPress={() => setActiveTab("insights")}
              >
                <Text style={{ color: theme.colors.primary }}>
                  See {parsedAnalysis.keyPoints.length - 3} more points
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Insights Tab Content
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

    if (!document || !parsedAnalysis) {
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

    return (
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Key Insights
        </Text>
        
        {parsedAnalysis.keyPoints.length > 0 ? (
          parsedAnalysis.keyPoints.map((point, index) => (
            <View
              key={index}
              style={[
                styles.insightItem,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <View
                style={[
                  styles.insightNumber,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.insightNumberText} color="white">
                  {index + 1}
                </Text>
              </View>
              <View style={styles.insightContent}>
                <Text
                  style={[styles.insightText, { color: theme.colors.text }]}
                >
                  {point}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View
            style={[
              styles.emptyInsights,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Ionicons
              name="bulb-outline"
              size={32}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.emptyInsightsText,
                { color: theme.colors.textSecondary },
              ]}
            >
              No key insights extracted from this document
            </Text>
          </View>
        )}

        {parsedAnalysis.recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text
              style={[
                styles.recommendationsTitle,
                { color: theme.colors.text },
              ]}
            >
              Recommendations
            </Text>
            {parsedAnalysis.recommendations.map((rec, index) => (
              <View
                key={index}
                style={[
                  styles.recommendationItem,
                  { backgroundColor: theme.colors.success + "10" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.success}
                  style={styles.recommendationIcon}
                />
                <Text
                  style={[
                    styles.recommendationText,
                    { color: theme.colors.text },
                  ]}
                >
                  {rec}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Q&A Tab Content
  const renderQA = () => (
    <View style={[styles.qaContainer, { backgroundColor: theme.colors.background }]}>
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
          {/* Chat conversation area */}
          {conversations.length === 0 ? (
            <View style={styles.emptyChat}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: theme.colors.primary + "10" },
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={38}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Ask Questions About This Document
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Get instant AI-powered answers about this document's content
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
                  "What are the key points in this document?",
                  "Summarize the main conclusion",
                  "What are the recommendations?",
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
                { paddingBottom: 100 },
              ]}
              showsVerticalScrollIndicator={false}
            >
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
                      <Text style={styles.messageText} color="white">{item.question}</Text>
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
                          style={[
                            styles.messageText, 
                            { color: theme.colors.text }
                          ]}
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
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
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
          </View>
        </>
      )}
    </View>
  );

  // Content based on active tab
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "summary":
        return renderSummary();
      case "insights":
        return renderInsights();
      case "qa":
        return renderQA();
      default:
        return renderSummary();
    }
  };

  // Main render
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_EXPANDED_HEIGHT }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        showsVerticalScrollIndicator={false}
      >
        {renderTabs()}
        {renderActiveTabContent()}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    position: "absolute",
    left: 60,
    right: 60,
    textAlign: "center",
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  documentIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
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
  
  // Tabs Styles
  tabsContainer: {
    flexDirection: "row",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Content Styles
  section: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
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
  
  // Loading Container
  loadingContainer: {
    padding: 40,
    margin: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  // Document Details
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
  
  // Key Points Preview
  keyPointsPreview: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 20,
  },
  keyPointsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  keyPointItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 10,
  },
  keyPointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 8,
  },
  
  // Insights Tab
  insightItem: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  insightNumber: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  insightNumberText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  insightContent: {
    flex: 1,
    padding: 10,
    paddingLeft: 12,
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyInsights: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyInsightsText: {
    marginTop: 16,
    textAlign: "center",
  },
  recommendationsSection: {
    marginTop: 24,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  recommendationIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  
  // Q&A Tab
  qaContainer: {
    flex: 1,
    minHeight: height - HEADER_EXPANDED_HEIGHT - 100,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    minHeight: 400,
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
    padding: 16,
  },
  chatContent: {
    paddingBottom: 100,
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
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 50,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 15,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 22,
    bottom: 19,
  },
});