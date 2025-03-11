import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  Share,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "../../context/ThemeContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import { useApp } from "../../context/AppContext";

import { AIAnalysisCard } from "../../components/AIAnalysisCard";
import { documentApi } from "../../api/documentApi";
import { Loading, Badge, Card, Text, Button, Divider } from "../../components";

const { width, height } = Dimensions.get("window");

const DocumentDetailScreen = ({ route, navigation }) => {
  const { documentId, newDocument } = route.params;
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const { hasEnoughTokens, useToken, TOKEN_COSTS } = useTokens();
  const { handleError, addNotification } = useApp();

  const scrollViewRef = useRef(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [analyzing, setAnalyzing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [question, setQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [freeQuestionsCount, setFreeQuestionsCount] = useState(3);
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // For new documents, animate header indicator
    if (newDocument) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(headerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(headerAnimation, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [newDocument]);

  // Header animations based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 130],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 60],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  // Load document
  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentApi.getDocumentById(documentId);
      if (!doc) {
        throw new Error("Document not found");
      }

      setDocument(doc);

      // Load document conversations
      const convs = await documentApi.getDocumentConversations(documentId);
      setConversations(convs);

      // Calculate free questions
      const usedQuestions = convs.length;
      setFreeQuestionsCount(Math.max(0, 3 - usedQuestions));
    } catch (error) {
      console.error("Error loading document:", error);
      handleError(error, t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  // Initial loading
  useEffect(() => {
    loadDocument();
  }, [documentId]);

  // Analyze document
  const analyzeDocument = async () => {
    try {
      const canAnalyze = hasEnoughTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS);

      if (!canAnalyze) {
        navigation.navigate("TokenStore");
        return;
      }

      setAnalyzing(true);
      await useToken(TOKEN_COSTS.DOCUMENT_ANALYSIS, "analysis", documentId);
      const updatedDoc = await documentApi.analyzeDocument(documentId);
      setDocument(updatedDoc);

      // Show success notification
      addNotification({
        title: "Analysis Complete",
        message: "Document has been successfully analyzed",
        type: "success",
      });

      setActiveTab("summary");
    } catch (error) {
      console.error("Error analyzing document:", error);
      handleError(error, t("errors.analysisFailed"));
    } finally {
      setAnalyzing(false);
    }
  };

  // Delete document
  const deleteDocument = async () => {
    Alert.alert(t("document.delete"), t("document.deleteConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await documentApi.deleteDocument(documentId);

            // Add notification for successful deletion
            addNotification({
              title: "Document Deleted",
              message: `"${document.name}" has been deleted`,
              type: "info",
            });

            navigation.goBack();
          } catch (error) {
            console.error("Error deleting document:", error);
            handleError(error, t("errors.somethingWentWrong"));
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Share document
  const shareDocument = async () => {
    try {
      if (!document?.downloadUrl) {
        Alert.alert("Error", "No document URL available");
        return;
      }

      await Share.share({
        message: `Check out this document: ${document.name}\n${document.downloadUrl}`,
      });
    } catch (error) {
      console.error("Error sharing document:", error);
      handleError(error, "Failed to share document");
    }
  };

  // Ask question
  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setSending(true);
      setAskingQuestion(true);

      // Check if token needed
      const needsToken = freeQuestionsCount <= 0;

      if (needsToken) {
        const canAsk = hasEnoughTokens(TOKEN_COSTS.QUESTION);

        if (!canAsk) {
          navigation.navigate("TokenStore");
          setAskingQuestion(false);
          setSending(false);
          return;
        }

        await useToken(TOKEN_COSTS.QUESTION, "question", documentId);
      }

      // Send question
      const result = await documentApi.askDocumentQuestion(
        documentId,
        question
      );

      // Add new conversation
      const newConversation = {
        id: Date.now().toString(), // Temporary ID
        question: result.question,
        answer: result.answer,
        createdAt: new Date(),
      };

      setConversations([newConversation, ...conversations]);

      // Update free questions count
      if (freeQuestionsCount > 0) {
        setFreeQuestionsCount(freeQuestionsCount - 1);
      }

      // Clear question
      setQuestion("");
    } catch (error) {
      console.error("Error asking question:", error);
      handleError(error, t("errors.somethingWentWrong"));
    } finally {
      setAskingQuestion(false);
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <Loading fullScreen text={t("common.loading")} />
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text variant="h2">{t("document.details")}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={60}
              color={theme.colors.error}
            />
            <Text variant="h3" style={{ textAlign: "center", marginTop: 16 }}>
              {t("errors.somethingWentWrong")}
            </Text>
            <Button
              label={t("common.back")}
              onPress={() => navigation.goBack()}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Get document type icon
  const getDocumentTypeIcon = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";
    return "document-outline";
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Render functions
  const renderAnimatedHeader = () => (
    <Animated.View
      style={[
        styles.animatedHeader,
        {
          height: headerHeight,
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          opacity: headerOpacity,
        },
      ]}
    >
      <View style={styles.headerContentCompact}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text variant="subtitle1" numberOfLines={1} style={styles.headerTitle}>
          {document.name}
        </Text>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(document.name, "", [
              {
                text: t("document.share"),
                onPress: shareDocument,
              },
              {
                text: t("document.delete"),
                style: "destructive",
                onPress: deleteDocument,
              },
              {
                text: t("common.cancel"),
                style: "cancel",
              },
            ]);
          }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={
          isDark
            ? [theme.colors.primary + "60", theme.colors.background]
            : [theme.colors.primary + "30", theme.colors.background]
        }
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text variant="h3" numberOfLines={1} style={styles.title}>
            {document.name}
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(document.name, "", [
                {
                  text: t("document.share"),
                  onPress: shareDocument,
                },
                {
                  text: t("document.delete"),
                  style: "destructive",
                  onPress: deleteDocument,
                },
                {
                  text: t("common.cancel"),
                  style: "cancel",
                },
              ]);
            }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderDocumentImage = () => {
    if (!document.type?.includes("image") || !document.downloadUrl) return null;

    return (
      <View style={styles.imageContainer}>
        <Animated.Image
          source={{ uri: document.downloadUrl }}
          style={[styles.documentImage, { transform: [{ scale: imageScale }] }]}
          resizeMode="cover"
        />

        {/* Image overlay gradient */}
        <LinearGradient
          colors={["transparent", theme.colors.background]}
          style={styles.imageOverlay}
        />

        {/* New document indicator */}
        {newDocument && (
          <Animated.View
            style={[
              styles.newDocIndicator,
              {
                opacity: headerAnimation,
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Text variant="caption" weight="semibold" color="#FFFFFF">
              NEW
            </Text>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderDocumentInfo = () => (
    <Animated.View
      style={[
        styles.infoContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.infoCard} variant="bordered" elevated={true}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.infoLabel}
            >
              {t("document.documentType")}
            </Text>
            <View style={styles.infoValueContainer}>
              <Ionicons
                name={getDocumentTypeIcon()}
                size={16}
                color={theme.colors.primary}
                style={styles.infoIcon}
              />
              <Text variant="body2">
                {document.type?.split("/").pop().toUpperCase() || "Unknown"}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.infoLabel}
            >
              {t("document.documentSize")}
            </Text>
            <View style={styles.infoValueContainer}>
              <Ionicons
                name="resize"
                size={16}
                color={theme.colors.primary}
                style={styles.infoIcon}
              />
              <Text variant="body2">{formatFileSize(document.size)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.infoLabel}
            >
              {t("document.uploadDate")}
            </Text>
            <View style={styles.infoValueContainer}>
              <Ionicons
                name="calendar"
                size={16}
                color={theme.colors.primary}
                style={styles.infoIcon}
              />
              <Text variant="body2">{formatDate(document.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.infoLabel}
            >
              Status
            </Text>
            <Badge
              label={document.status === "analyzed" ? "Analyzed" : "Uploaded"}
              variant={document.status === "analyzed" ? "success" : "info"}
              size="small"
            />
          </View>
        </View>

        {document.source === "scan" && (
          <View style={styles.sourceBadgeContainer}>
            <Badge
              label="Scanned Document"
              variant="secondary"
              size="small"
              leftIcon={
                <Ionicons
                  name="scan"
                  size={14}
                  color={theme.colors.secondary}
                />
              }
            />
          </View>
        )}
      </Card>
    </Animated.View>
  );

  const renderTabs = () => (
    <Animated.View
      style={[
        styles.tabContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "summary" && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
        ]}
        onPress={() => setActiveTab("summary")}
      >
        <Ionicons
          name="document-text"
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
          {t("document.summary")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "ask" && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
        ]}
        onPress={() => setActiveTab("ask")}
      >
        <Ionicons
          name="chatbubble"
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
          {t("document.askQuestion")}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSummaryContent = () => {
    // If document not yet analyzed, show analysis button
    if (document.status !== "analyzed") {
      return (
        <Animated.View
          style={[
            styles.noAnalysisContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card
            style={styles.noAnalysisCard}
            variant={isDark ? "default" : "bordered"}
            elevated={true}
          >
            <LinearGradient
              colors={[theme.colors.background, theme.colors.primary + "10"]}
              style={styles.noAnalysisGradient}
            >
              <Ionicons
                name="analytics-outline"
                size={60}
                color={theme.colors.primary}
                style={styles.noAnalysisIcon}
              />
              <Text variant="subtitle1" style={styles.noAnalysisText}>
                {t("document.noAnalysis")}
              </Text>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.noAnalysisDescription}
              >
                Analyze this document with AI to get a summary, key points, and
                insights.
              </Text>
              <Button
                label={t("document.analyze")}
                onPress={analyzeDocument}
                loading={analyzing}
                leftIcon={
                  <Ionicons name="analytics" size={20} color="#FFFFFF" />
                }
                gradient={true}
                style={styles.analyzeButton}
              />
            </LinearGradient>
          </Card>
        </Animated.View>
      );
    }

    // Analyzed document content
    const analysis = document.analysis || {};

    return (
      <Animated.View
        style={[
          styles.summaryContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <AIAnalysisCard
            analysis={analysis}
            analysisType="summary"
            style={styles.analysisCard}
          />
        </View>

        {/* Key Points */}
        {analysis.keyPoints && analysis.keyPoints.length > 0 && (
          <View style={styles.summarySection}>
            <AIAnalysisCard
              analysis={analysis}
              analysisType="keyPoints"
              style={styles.analysisCard}
            />
          </View>
        )}

        {/* Details */}
        {analysis.details && (
          <View style={styles.summarySection}>
            <AIAnalysisCard
              analysis={analysis}
              analysisType="details"
              style={styles.analysisCard}
            />
          </View>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <View style={styles.summarySection}>
            <AIAnalysisCard
              analysis={analysis}
              analysisType="recommendations"
              style={styles.analysisCard}
            />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderAskContent = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Animated.View
        style={[
          styles.askContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Conversations */}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.multiply(
                        slideAnim,
                        new Animated.Value(1 + index * 0.1)
                      ),
                    },
                  ],
                },
              ]}
            >
              <Card
                style={styles.conversationCard}
                variant={isDark ? "default" : "bordered"}
                elevated={true}
              >
                <View style={styles.questionContainer}>
                  <View
                    style={[
                      styles.avatarContainer,
                      { backgroundColor: theme.colors.textSecondary },
                    ]}
                  >
                    <Ionicons name="person" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.questionContent}>
                    <Text variant="subtitle2" style={styles.questionText}>
                      {item.question}
                    </Text>
                  </View>
                </View>

                <View style={styles.answerContainer}>
                  <View
                    style={[
                      styles.avatarContainer,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.answerContent}>
                    <Text variant="body2" style={styles.answerText}>
                      {item.answer}
                    </Text>
                  </View>
                </View>
                <View style={styles.conversationTimeContainer}>
                  <Text variant="caption" color={theme.colors.textTertiary}>
                    {formatDate(item.createdAt)} {formatTime(item.createdAt)}
                  </Text>
                </View>
              </Card>
            </Animated.View>
          )}
          inverted
          contentContainerStyle={styles.conversationsList}
          ListEmptyComponent={
            <Animated.View
              style={[
                styles.emptyConversation,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Card
                style={styles.emptyConversationCard}
                variant={isDark ? "default" : "bordered"}
                elevated={true}
              >
                <LinearGradient
                  colors={[
                    theme.colors.background,
                    theme.colors.primary + "10",
                  ]}
                  style={styles.emptyConversationGradient}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={60}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    variant="subtitle1"
                    color={theme.colors.text}
                    style={styles.emptyConversationText}
                  >
                    Ask your first question about this document
                  </Text>
                  <Text
                    variant="body2"
                    color={theme.colors.textSecondary}
                    style={styles.emptyConversationDescription}
                  >
                    Your first 3 questions are free. Additional questions cost
                    {" " + TOKEN_COSTS.QUESTION} tokens each.
                  </Text>
                </LinearGradient>
              </Card>
            </Animated.View>
          }
        />

        {/* Question input area */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          {freeQuestionsCount > 0 ? (
            <Badge
              label={`${freeQuestionsCount} free questions left`}
              variant="info"
              size="small"
              leftIcon={
                <Ionicons
                  name="information-circle"
                  size={14}
                  color={theme.colors.info}
                />
              }
              style={styles.freeQuestionsBadge}
            />
          ) : (
            <Badge
              label={`${TOKEN_COSTS.QUESTION} tokens per question`}
              variant="warning"
              size="small"
              leftIcon={
                <Ionicons name="key" size={14} color={theme.colors.warning} />
              }
              style={styles.freeQuestionsBadge}
            />
          )}

          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: isDark
                  ? theme.colors.card
                  : theme.colors.border + "30",
                borderColor: isFocused ? theme.colors.primary : "transparent",
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={t("document.askPlaceholder")}
              placeholderTextColor={theme.colors.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                question.trim()
                  ? { backgroundColor: theme.colors.primary }
                  : { backgroundColor: theme.colors.border },
              ]}
              onPress={askQuestion}
              disabled={!question.trim() || askingQuestion}
            >
              {askingQuestion ? (
                <Loading size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );

  const renderContent = () => {
    if (analyzing) {
      return (
        <View style={styles.loadingContainer}>
          <Loading text={t("document.processingDocument")} variant="pulse" />
        </View>
      );
    }

    return activeTab === "summary"
      ? renderSummaryContent()
      : renderAskContent();
  };

  // Format time helper
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {renderAnimatedHeader()}

      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderDocumentImage()}
        {renderDocumentInfo()}
        {renderTabs()}
        {renderContent()}
      </Animated.ScrollView>

      {/* Sending indicator */}
      {sending && (
        <View style={styles.sendingOverlay}>
          <Card style={styles.sendingCard} elevated={true}>
            <Loading color={theme.colors.primary} size="small" />
            <Text style={styles.sendingText}>{t("document.thinking")}</Text>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  headerContainer: {
    overflow: "hidden",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerGradient: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerContentCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: "100%",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  imageContainer: {
    height: 240,
    width: "100%",
    marginBottom: 16,
    position: "relative",
  },
  documentImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  newDocIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    marginBottom: 6,
  },
  infoValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 8,
  },
  sourceBadgeContainer: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 6,
  },
  noAnalysisContainer: {
    padding: 16,
  },
  noAnalysisCard: {
    overflow: "hidden",
    borderRadius: 16,
  },
  noAnalysisGradient: {
    alignItems: "center",
    padding: 24,
  },
  noAnalysisIcon: {
    marginBottom: 16,
  },
  noAnalysisText: {
    textAlign: "center",
    marginBottom: 8,
  },
  noAnalysisDescription: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  analyzeButton: {
    minWidth: 180,
  },
  summaryContainer: {
    padding: 16,
  },
  summarySection: {
    marginBottom: 16,
  },
  analysisCard: {
    marginBottom: 8,
  },
  askContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  conversationsList: {
    padding: 16,
  },
  conversationCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  questionContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    flex: 1,
  },
  answerContainer: {
    flexDirection: "row",
  },
  answerContent: {
    flex: 1,
  },
  answerText: {
    flex: 1,
    lineHeight: 24,
  },
  conversationTimeContainer: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  emptyConversation: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyConversationCard: {
    overflow: "hidden",
    borderRadius: 16,
  },
  emptyConversationGradient: {
    alignItems: "center",
    padding: 24,
  },
  emptyConversationText: {
    marginTop: 16,
    textAlign: "center",
  },
  emptyConversationDescription: {
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  freeQuestionsBadge: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sendingOverlay: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  sendingCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  sendingText: {
    marginLeft: 12,
  },
});

export default DocumentDetailScreen;
