import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useTokens } from "../../../context/TokenContext";
import {
  Text,
  Button,
  Card,
  Badge,
  Divider,
  AIAnalysisCard,
} from "../../../components";
import documentService from "../../../services/documentService";
import { formatFileSize } from "../../../utils/formatUtils";

const { width, height } = Dimensions.get("window");

const DocumentDetailScreen = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { tokens, hasEnoughTokens, useToken, TOKEN_COSTS } = useTokens();

  // Get document ID from route
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

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [200, 70],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 0.7, 0],
    extrapolate: "clamp",
  });

  const headerTextSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [24, 18],
    extrapolate: "clamp",
  });

  // Load document data
  useEffect(() => {
    loadDocument();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [documentId]);

  // Load document and conversations
  const loadDocument = async () => {
    try {
      setLoading(true);

      // Get document from service
      const doc = await documentService.getDocumentById(documentId);
      setDocument(doc);
      console.log("Conversations:", documentId);
      // Get conversations
      const convs = await documentService.getDocumentConversations(documentId);
      setConversations(convs);
 
      // Calculate free questions left
      setFreeQuestionsCount(Math.max(0, 3 - convs.length));

      setLoading(false);
    } catch (error) {

      console.error("Error loading document:", error);
      setLoading(false);

      // Show error and navigate back
      Alert.alert("Error", "Failed to load document. Please try again later.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  // Analyze document
  const analyzeDocument = async () => {
    try {
      // Check if user has enough tokens
      if (!hasEnoughTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS)) {
        Alert.alert(
          "Not Enough Tokens",
          "You don't have enough tokens to analyze this document.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Get Tokens",
              onPress: () => navigation.navigate("TokenStore"),
            },
          ]
        );
        return;
      }

      setAnalyzing(true);

      // Use token for analysis
      await useToken(TOKEN_COSTS.DOCUMENT_ANALYSIS, "analysis", documentId);

      // Analyze document
      const result = await documentService.analyzeDocument(documentId);

      // Update document state
      setDocument(result);
      setActiveTab("summary");
    } catch (error) {
      console.error("Error analyzing document:", error);
      Alert.alert(
        "Error",
        "Failed to analyze document. Please try again later."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Ask a question
  const askQuestion = async () => {
    if (!question.trim() || sending) return;

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

      // Get answer from service
      const conversation = await documentService.askDocumentQuestion(
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

  // Share document
  const shareDocument = () => {
    // Implement sharing functionality
    Alert.alert("Share", "Sharing functionality would go here");
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
              await documentService.deleteDocument(documentId);
              setLoading(false);
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

  // Format date
  const formatDate = (date) => {
    if (!date) return "Unknown";

    const d = new Date(date);
    const now = new Date();
    const diff = Math.abs(now - d);
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString();
  };

  // Get message time
  const getMessageTime = (date) => {
    if (!date) return "";

    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body1" style={{ marginTop: 16 }}>
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
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={theme.colors.error}
        />
        <Text variant="h3" style={{ marginTop: 16, marginBottom: 8 }}>
          Document Not Found
        </Text>
        <Text
          variant="body1"
          color={theme.colors.textSecondary}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          This document may have been deleted or is no longer available.
        </Text>
        <Button
          label="Go Back"
          onPress={() => navigation.goBack()}
          variant="primary"
          size="medium"
        />
      </View>
    );
  }

  // File type and color
  const getFileIconName = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("doc")) return "document";
    if (type.includes("text") || type.includes("txt"))
      return "document-text-outline";

    return "document-outline";
  };

  const getFileColor = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return theme.colors.error;
    if (type.includes("image")) return theme.colors.info;
    if (type.includes("doc")) return theme.colors.primary;
    if (type.includes("text") || type.includes("txt"))
      return theme.colors.textSecondary;

    return theme.colors.primary;
  };

  const getFileType = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return "PDF";
    if (type.includes("jpg") || type.includes("jpeg")) return "JPG";
    if (type.includes("png")) return "PNG";
    if (type.includes("docx")) return "DOCX";
    if (type.includes("doc")) return "DOC";
    if (type.includes("text") || type.includes("txt")) return "TXT";

    return "DOC";
  };

  // Render header with animations
  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <LinearGradient
        colors={[getFileColor() + "CC", getFileColor() + "66"]}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerTopBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={shareDocument}
              >
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={deleteDocument}
              >
                <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View
            style={[styles.documentInfo, { opacity: headerOpacity }]}
          >
            <View style={styles.documentIconContainer}>
              {document.type?.includes("image") && document.downloadUrl ? (
                <Image
                  source={{ uri: document.downloadUrl }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.documentIcon,
                    { backgroundColor: "#FFFFFF40" },
                  ]}
                >
                  <Ionicons
                    name={getFileIconName()}
                    size={36}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </View>

            <View style={styles.documentDetails}>
              <Animated.Text
                style={[
                  styles.documentTitle,
                  { fontSize: headerTextSize, color: "#FFFFFF" },
                ]}
              >
                {document.name}
              </Animated.Text>

              <View style={styles.documentMeta}>
                <Badge
                  label={getFileType()}
                  variant="primary"
                  size="small"
                  style={styles.documentBadge}
                />

                <Text variant="caption" color="#FFFFFFCC">
                  {formatFileSize(document.size)} •{" "}
                  {formatDate(document.createdAt)}
                </Text>
              </View>

              <Badge
                label={
                  document.status === "analyzed"
                    ? "Analyzed"
                    : document.status === "analyzing"
                    ? "Analyzing..."
                    : "Not Analyzed"
                }
                variant={
                  document.status === "analyzed"
                    ? "success"
                    : document.status === "analyzing"
                    ? "warning"
                    : "secondary"
                }
                size="small"
              />
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "summary" && styles.activeTab]}
        onPress={() => setActiveTab("summary")}
      >
        <Ionicons
          name="document-text-outline"
          size={20}
          color={
            activeTab === "summary"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
          style={styles.tabIcon}
        />
        <Text
          variant="body2"
          weight={activeTab === "summary" ? "semibold" : "regular"}
          color={
            activeTab === "summary"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        >
          Summary
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "ask" && styles.activeTab]}
        onPress={() => setActiveTab("ask")}
      >
        <Ionicons
          name="chatbubble-outline"
          size={20}
          color={
            activeTab === "ask"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
          style={styles.tabIcon}
        />
        <Text
          variant="body2"
          weight={activeTab === "ask" ? "semibold" : "regular"}
          color={
            activeTab === "ask"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        >
          Ask Questions
        </Text>

        {conversations.length > 0 && (
          <Badge
            label={conversations.length.toString()}
            variant="error"
            size="small"
            style={styles.conversationBadge}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  // Render summary tab content
  const renderSummaryTab = () => {
    // If document is not yet analyzed
    if (document.status !== "analyzed") {
      return (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.notAnalyzedContainer}
        >
          <Card style={styles.notAnalyzedCard}>
            <View style={styles.notAnalyzedContent}>
              <Ionicons
                name="analytics-outline"
                size={64}
                color={theme.colors.primary}
              />

              <Text variant="h3" style={styles.notAnalyzedTitle}>
                Not Yet Analyzed
              </Text>

              <Text
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.notAnalyzedDescription}
              >
                Analyze this document with AI to get a summary, key points, and
                actionable insights.
              </Text>

              <Button
                label="Analyze Document"
                onPress={analyzeDocument}
                gradient={true}
                loading={analyzing}
                style={styles.analyzeButton}
                leftIcon={
                  !analyzing && (
                    <Ionicons name="analytics" size={18} color="#FFFFFF" />
                  )
                }
              />

              <View style={styles.tokenCost}>
                <Ionicons
                  name="key"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ marginLeft: 4 }}
                >
                  Cost: {TOKEN_COSTS?.DOCUMENT_ANALYSIS || 1} token
                </Text>
              </View>
            </View>
          </Card>
        </MotiView>
      );
    }

    // Rendered when document is analyzed
    return (
      <View style={styles.analysisContainer}>
        {/* Summary Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 0 }}
        >
          <AIAnalysisCard
            analysis={document.analysis}
            analysisType="summary"
            style={styles.analysisCard}
          />
        </MotiView>

        {/* Key Points Card */}
        {document.analysis.keyPoints &&
          document.analysis.keyPoints.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: 100 }}
            >
              <AIAnalysisCard
                analysis={document.analysis}
                analysisType="keyPoints"
                style={styles.analysisCard}
              />
            </MotiView>
          )}

        {/* Details Card */}
        {document.analysis.details && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 200 }}
          >
            <AIAnalysisCard
              analysis={document.analysis}
              analysisType="details"
              style={styles.analysisCard}
            />
          </MotiView>
        )}

        {/* Recommendations Card */}
        {document.analysis.recommendations &&
          document.analysis.recommendations.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: 300 }}
            >
              <AIAnalysisCard
                analysis={document.analysis}
                analysisType="recommendations"
                style={styles.analysisCard}
              />
            </MotiView>
          )}
      </View>
    );
  };

  // Render ask tab content
  const renderAskTab = () => {
    // Document must be analyzed first
    if (document.status !== "analyzed") {
      return (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.notAnalyzedContainer}
        >
          <Card style={styles.notAnalyzedCard}>
            <View style={styles.notAnalyzedContent}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={theme.colors.primary}
              />

              <Text variant="h3" style={styles.notAnalyzedTitle}>
                Analysis Required
              </Text>

              <Text
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.notAnalyzedDescription}
              >
                You need to analyze the document first before you can ask
                questions about it.
              </Text>

              <Button
                label="Analyze Document"
                onPress={analyzeDocument}
                gradient={true}
                loading={analyzing}
                style={styles.analyzeButton}
                leftIcon={
                  !analyzing && (
                    <Ionicons name="analytics" size={18} color="#FFFFFF" />
                  )
                }
              />
            </View>
          </Card>
        </MotiView>
      );
    }

    return (
      <View style={styles.questionsContainer}>
        {/* Free questions indicator */}
        {freeQuestionsCount > 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
          >
            <View style={styles.freeQuestionsContainer}>
              <Badge
                label={`${freeQuestionsCount} free ${
                  freeQuestionsCount === 1 ? "question" : "questions"
                } left`}
                variant="info"
                size="small"
                leftIcon={
                  <Ionicons
                    name="information-circle"
                    size={14}
                    color={theme.colors.info}
                  />
                }
              />
            </View>
          </MotiView>
        )}

        {/* Conversations list */}
        <View style={styles.conversationsContainer}>
          {conversations.length === 0 ? (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 400 }}
            >
              <Card style={styles.emptyConversationsCard}>
                <View style={styles.emptyConversationsContent}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={64}
                    color={theme.colors.textSecondary}
                  />

                  <Text variant="h3" style={styles.emptyConversationsTitle}>
                    Ask Your First Question
                  </Text>

                  <Text
                    variant="body1"
                    color={theme.colors.textSecondary}
                    style={styles.emptyConversationsDescription}
                  >
                    Ask questions about the document and AI will provide answers
                    based on its content.
                  </Text>

                  <View style={styles.firstQuestionExamples}>
                    <TouchableOpacity
                      style={[
                        styles.exampleQuestion,
                        { backgroundColor: theme.colors.primary + "15" },
                      ]}
                      onPress={() =>
                        setQuestion(
                          "What are the key findings in this document?"
                        )
                      }
                    >
                      <Text variant="body2" color={theme.colors.primary}>
                        What are the key findings?
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.exampleQuestion,
                        { backgroundColor: theme.colors.primary + "15" },
                      ]}
                      onPress={() =>
                        setQuestion("Can you summarize the main points?")
                      }
                    >
                      <Text variant="body2" color={theme.colors.primary}>
                        Summarize the main points
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.exampleQuestion,
                        { backgroundColor: theme.colors.primary + "15" },
                      ]}
                      onPress={() =>
                        setQuestion(
                          "What recommendations are made in this document?"
                        )
                      }
                    >
                      <Text variant="body2" color={theme.colors.primary}>
                        What recommendations are made?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </MotiView>
          ) : (
            conversations.map((conversation, index) => (
              <MotiView
                key={conversation.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  duration: 300,
                  delay: Math.min(index * 100, 500),
                }}
                style={styles.conversationItem}
              >
                {/* Question */}
                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      You • {formatDate(conversation.createdAt)}{" "}
                      {getMessageTime(conversation.createdAt)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.questionBubble,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Text variant="body2" color="#FFFFFF">
                      {conversation.question}
                    </Text>
                  </View>
                </View>

                {/* Answer */}
                <View style={styles.answerContainer}>
                  <View style={styles.answerHeader}>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      AI Assistant
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.answerBubble,
                      {
                        backgroundColor: isDark ? theme.colors.card : "#F0F0F0",
                        borderColor: conversation.error
                          ? theme.colors.error + "40"
                          : "transparent",
                      },
                    ]}
                  >
                    {conversation.isPending ? (
                      <View style={styles.pendingAnswer}>
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                        />
                        <Text
                          variant="caption"
                          color={theme.colors.textSecondary}
                          style={{ marginLeft: 8 }}
                        >
                          Thinking...
                        </Text>
                      </View>
                    ) : (
                      <Text
                        variant="body2"
                        color={
                          conversation.error
                            ? theme.colors.error
                            : theme.colors.text
                        }
                      >
                        {conversation.answer}
                      </Text>
                    )}
                  </View>
                </View>
              </MotiView>
            ))
          )}
        </View>
      </View>
    );
  };

  // Question input field
  const renderQuestionInput = () => {
    // Only show if on ask tab and document is analyzed
    if (activeTab !== "ask" || document.status !== "analyzed") {
      return null;
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.questionInputContainer}
      >
        <View
          style={[
            styles.questionInputWrapper,
            {
              backgroundColor: isDark ? theme.colors.card : "#F0F0F0",
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.questionInput,
              { backgroundColor: isDark ? theme.colors.background : "#FFFFFF" },
            ]}
          >
            <TextInput
              style={[styles.questionTextInput, { color: theme.colors.text }]}
              placeholder="Ask a question about this document..."
              placeholderTextColor={theme.colors.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={280}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: !question.trim() || sending ? 0.6 : 1,
                },
              ]}
              onPress={askQuestion}
              disabled={!question.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {freeQuestionsCount <= 0 && (
            <View style={styles.tokenCostIndicator}>
              <Ionicons name="key" size={12} color={theme.colors.warning} />
              <Text
                variant="caption"
                color={theme.colors.warning}
                style={{ marginLeft: 4 }}
              >
                {TOKEN_COSTS?.QUESTION || 0.2} tokens per question
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {renderHeader()}

      <Animated.View
        style={[
          styles.compactHeader,
          {
            backgroundColor: getFileColor() + "BF",
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100, 101],
                  outputRange: [-100, 0, 0],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.compactHeaderContent}>
          <TouchableOpacity
            style={styles.compactBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text
            variant="subtitle2"
            color="#FFFFFF"
            numberOfLines={1}
            style={styles.compactTitle}
          >
            {document.name}
          </Text>

          <View style={{ width: 24 }} />
        </View>
      </Animated.View>

      {renderTabs()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: 210 }, // Account for header height
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {activeTab === "summary" ? renderSummaryTab() : renderAskTab()}

        {/* Bottom padding for question input */}
        <View style={{ height: activeTab === "ask" ? 100 : 20 }} />
      </ScrollView>

      {renderQuestionInput()}
    </View>
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
    paddingTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  documentInfo: {
    flexDirection: "row",
    marginTop: 16,
  },
  documentIconContainer: {
    marginRight: 16,
  },
  documentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  documentIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  documentDetails: {
    flex: 1,
  },
  documentTitle: {
    marginBottom: 6,
    fontWeight: "600",
  },
  documentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  documentBadge: {
    marginRight: 10,
  },
  compactHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: StatusBar.currentHeight || 40,
    zIndex: 20,
  },
  compactHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  compactBackButton: {
    marginRight: 16,
  },
  compactTitle: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 200, // Space for header
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    position: "relative",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: (theme) => theme.colors.primary,
  },
  tabIcon: {
    marginRight: 8,
  },
  conversationBadge: {
    position: "absolute",
    top: 8,
    right: 30,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notAnalyzedContainer: {
    marginBottom: 20,
  },
  notAnalyzedCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  notAnalyzedContent: {
    padding: 24,
    alignItems: "center",
  },
  notAnalyzedTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  notAnalyzedDescription: {
    textAlign: "center",
    marginBottom: 24,
  },
  analyzeButton: {
    paddingHorizontal: 24,
  },
  tokenCost: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisCard: {
    marginBottom: 16,
  },
  questionsContainer: {
    marginBottom: 20,
  },
  freeQuestionsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  conversationsContainer: {
    marginBottom: 20,
  },
  emptyConversationsCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  emptyConversationsContent: {
    padding: 24,
    alignItems: "center",
  },
  emptyConversationsTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyConversationsDescription: {
    textAlign: "center",
    marginBottom: 24,
  },
  firstQuestionExamples: {
    width: "100%",
  },
  exampleQuestion: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  conversationItem: {
    marginBottom: 24,
  },
  questionContainer: {
    marginBottom: 2,
  },
  questionHeader: {
    alignItems: "flex-end",
    marginBottom: 4,
    paddingRight: 8,
  },
  questionBubble: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  answerContainer: {
    marginTop: 2,
  },
  answerHeader: {
    marginBottom: 4,
    paddingLeft: 8,
  },
  answerBubble: {
    alignSelf: "flex-start",
    maxWidth: "85%",
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  pendingAnswer: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionInputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  questionInputWrapper: {
    borderTopWidth: 1,
    padding: 8,
  },
  questionInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  questionTextInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  tokenCostIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
});

export default DocumentDetailScreen;
