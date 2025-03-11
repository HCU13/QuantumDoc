import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Keyboard,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../context/ThemeContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import {
  AIAnalysisCard,
  Loading,
  Badge,
  Card,
  Text,
  Button,
  Divider,
  AnimatedHeader,
} from "../../components";
import { useFocusEffect } from "@react-navigation/native";
import { MotiView } from "moti";

const { width, height } = Dimensions.get("window");

/**
 * DocumentDetailScreen
 *
 * A comprehensive document viewing and analysis screen that allows users to:
 * - View document details and content
 * - See AI analysis of the document
 * - Ask questions about the document
 * - Navigate between summary and Q&A modes
 *
 * @param {Object} route - Navigation route with params
 * @param {Object} navigation - Navigation object
 */
const DocumentDetailScreen = ({ route, navigation }) => {
  // Get params from route or use default
  const params = route?.params || {};
  const { documentId, newDocument } = params;

  // Hooks
  const { theme, isDark } = useTheme();
  const { tokens, hasEnoughTokens, useToken, TOKEN_COSTS } = useTokens();
  const { t } = useLocalization();

  // Refs
  const scrollViewRef = useRef(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const headerHeight = useRef(new Animated.Value(0)).current;

  // State
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [analyzing, setAnalyzing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [question, setQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [freeQuestionsCount, setFreeQuestionsCount] = useState(3);
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const inputHeightAnim = useRef(new Animated.Value(48)).current;
  const sendButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const questionSlideAnim = useRef(new Animated.Value(50)).current;

  // Status bar height (for platform differences)
  const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 40 : StatusBar.currentHeight;

  // Load document data
  useEffect(() => {
    loadDocument();
  }, [documentId]);

  // Refetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!loading && !refreshing) {
        refreshDocument();
      }
    }, [documentId])
  );

  // Start entrance animations
  useEffect(() => {
    startEntranceAnimations();
  }, [document]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom in chat view
        if (activeTab === "ask" && flatListRef.current) {
          setTimeout(() => {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }, 100);
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [activeTab]);

  // Start entrance animations
  const startEntranceAnimations = () => {
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
      Animated.timing(questionSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // For new documents, animate header
    if (newDocument) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(headerHeight, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(headerHeight, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  // Load document with mock data
  const loadDocument = async () => {
    try {
      setLoading(true);

      // Mock document data with realistic properties
      const mockDocument = {
        id: documentId || "doc123",
        name: "Financial Report Q2 2024.pdf",
        type: "application/pdf",
        size: 2458000,
        downloadUrl: "https://source.unsplash.com/random/800x600/?document",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: "analyzed",
        source: "upload",
        analysis: {
          summary:
            "This quarterly financial report outlines company performance for Q2 2024. Revenue increased by 12% compared to Q1, reaching $3.4M. Operating expenses were reduced by 7% through effective cost management strategies. The gross profit margin improved to 58%, up from 52% in the previous quarter. The report highlights successful product launches and market expansion efforts that contributed to growth. Cash flow remains positive with $4.2M in reserves, positioning the company well for planned Q3 investments.",
          keyPoints: [
            "Revenue increased by 12% quarter-over-quarter to $3.4M",
            "Operating expenses reduced by 7% through cost optimization",
            "Gross profit margin improved to 58% from 52%",
            "Product launches in European markets exceeded expectations",
            "Cash reserves at $4.2M, sufficient for planned Q3 investments",
            "Customer acquisition cost reduced by 15% through digital marketing optimization",
          ],
          details:
            "The financial performance for Q2 2024 exceeded projections in several key areas. The marketing department's reallocation of budget to digital channels resulted in higher conversion rates and lower customer acquisition costs. Software division revenue grew by 18%, while hardware sales increased by 9%. Research and development expenses remained consistent at 15% of revenue, focusing on next-generation product features. The company maintained healthy inventory levels with a turnover ratio of 8.2. Accounts receivable decreased slightly, indicating improved collection efficiency.",
          recommendations: [
            "Continue expanding digital marketing efforts based on Q2 performance",
            "Increase investment in the software division given its higher growth rate",
            "Consider strategic acquisitions with current cash reserves",
            "Implement planned price adjustments for enterprise customers",
            "Accelerate hiring in engineering to support product roadmap",
          ],
        },
      };

      // Mock conversations
      const mockConversations = [
        {
          id: "conv1",
          question: "What was the revenue increase in Q2?",
          answer:
            "According to the financial report, revenue increased by 12% quarter-over-quarter, reaching $3.4M in Q2 2024.",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: "conv2",
          question:
            "How much are the cash reserves and what are they planned for?",
          answer:
            "The cash reserves stand at $4.2M. The report indicates these reserves are sufficient for the planned investments in Q3 2024, though specific investment targets aren't detailed in the document.",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      ];

      // Set document and conversations with a slight delay for smoother animation
      setTimeout(() => {
        setDocument(mockDocument);
        setConversations(mockConversations);

        // Calculate free questions left
        setFreeQuestionsCount(Math.max(0, 3 - mockConversations.length));

        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading document:", error);
      Alert.alert(
        t("errors.somethingWentWrong"),
        "Could not load document details. Please try again later."
      );
      setLoading(false);
    }
  };

  // Refresh document data
  const refreshDocument = async () => {
    try {
      setRefreshing(true);
      await loadDocument();
    } catch (error) {
      console.error("Error refreshing document:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate input height
    Animated.timing(inputHeightAnim, {
      toValue: 80,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Handle input blur
  const handleInputBlur = () => {
    setIsFocused(false);

    // Animate input height back if empty
    if (!question.trim()) {
      Animated.timing(inputHeightAnim, {
        toValue: 48,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);

    // Dismiss keyboard when switching tabs
    Keyboard.dismiss();

    // Reset animations for the new tab
    slideAnim.setValue(20);
    fadeAnim.setValue(0);
    questionSlideAnim.setValue(50);

    // Start animations again
    startEntranceAnimations();

    // If switching to ask tab, scroll to bottom of chat
    if (tab === "ask" && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }, 300);
    }
  };

  // Analyze document
  const analyzeDocument = async () => {
    try {
      // Check if user has enough tokens
      const canAnalyze = hasEnoughTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS);

      if (!canAnalyze) {
        Alert.alert(t("tokens.notEnoughTokens"), t("tokens.addTokens"), [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("tokens.buyTokens"),
            onPress: () => navigation.navigate("TokenStore"),
          },
        ]);
        return;
      }

      setAnalyzing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Simulate using tokens
      await useToken(TOKEN_COSTS.DOCUMENT_ANALYSIS, "analysis", documentId);

      // Simulate analysis delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Update document with analysis
      const updatedDoc = {
        ...document,
        status: "analyzed",
        analysis: {
          summary:
            "This quarterly financial report outlines company performance for Q2 2024. Revenue increased by 12% compared to Q1, reaching $3.4M. Operating expenses were reduced by 7% through effective cost management strategies. The gross profit margin improved to 58%, up from 52% in the previous quarter. The report highlights successful product launches and market expansion efforts that contributed to growth. Cash flow remains positive with $4.2M in reserves, positioning the company well for planned Q3 investments.",
          keyPoints: [
            "Revenue increased by 12% quarter-over-quarter to $3.4M",
            "Operating expenses reduced by 7% through cost optimization",
            "Gross profit margin improved to 58% from 52%",
            "Product launches in European markets exceeded expectations",
            "Cash reserves at $4.2M, sufficient for planned Q3 investments",
            "Customer acquisition cost reduced by 15% through digital marketing optimization",
          ],
          details:
            "The financial performance for Q2 2024 exceeded projections in several key areas. The marketing department's reallocation of budget to digital channels resulted in higher conversion rates and lower customer acquisition costs. Software division revenue grew by 18%, while hardware sales increased by 9%. Research and development expenses remained consistent at 15% of revenue, focusing on next-generation product features. The company maintained healthy inventory levels with a turnover ratio of 8.2. Accounts receivable decreased slightly, indicating improved collection efficiency.",
          recommendations: [
            "Continue expanding digital marketing efforts based on Q2 performance",
            "Increase investment in the software division given its higher growth rate",
            "Consider strategic acquisitions with current cash reserves",
            "Implement planned price adjustments for enterprise customers",
            "Accelerate hiring in engineering to support product roadmap",
          ],
        },
      };

      setDocument(updatedDoc);
      Alert.alert("Success", "Document analysis completed");
      setActiveTab("summary");
    } catch (error) {
      console.error("Error analyzing document:", error);
      Alert.alert(t("errors.analysisFailed"), "Please try again later.");
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            navigation.goBack();
          } catch (error) {
            console.error("Error deleting document:", error);
            Alert.alert(t("errors.somethingWentWrong"));
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

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: `Check out this document: ${document.name}\n${document.downloadUrl}`,
      });
    } catch (error) {
      console.error("Error sharing document:", error);
    }
  };

  // Ask question
  const askQuestion = async () => {
    if (!question.trim()) return;

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setSending(true);
      setAskingQuestion(true);

      // Create new conversation with pending state
      const newConversationId = Date.now().toString();
      const pendingConversation = {
        id: newConversationId,
        question: question,
        answer: "",
        createdAt: new Date(),
        isPending: true,
      };

      // Add to conversations right away
      setConversations([pendingConversation, ...conversations]);

      // Clear question input
      setQuestion("");

      // Reset input height
      Animated.timing(inputHeightAnim, {
        toValue: 48,
        duration: 200,
        useNativeDriver: false,
      }).start();

      // Check if token needed
      const needsToken = freeQuestionsCount <= 0;

      if (needsToken) {
        const canAsk = hasEnoughTokens(TOKEN_COSTS.QUESTION);

        if (!canAsk) {
          // Update conversation to show error
          setConversations([
            {
              ...pendingConversation,
              answer: "You don't have enough tokens to ask this question.",
              error: true,
              isPending: false,
            },
            ...conversations,
          ]);

          setAskingQuestion(false);
          setSending(false);

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

          // Show token purchase prompt
          setTimeout(() => {
            Alert.alert(t("tokens.notEnoughTokens"), t("tokens.addTokens"), [
              {
                text: t("common.cancel"),
                style: "cancel",
              },
              {
                text: t("tokens.buyTokens"),
                onPress: () => navigation.navigate("TokenStore"),
              },
            ]);
          }, 500);

          return;
        }

        // Use token
        await useToken(TOKEN_COSTS.QUESTION, "question", documentId);
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Generate a simple answer based on the question
      let answer = "";
      const questionLower = pendingConversation.question.toLowerCase();

      if (questionLower.includes("revenue")) {
        answer =
          "The report shows a revenue increase of 12% compared to the previous quarter, reaching $3.4M in Q2 2024.";
      } else if (
        questionLower.includes("profit") ||
        questionLower.includes("margin")
      ) {
        answer =
          "The gross profit margin improved to 58%, up from 52% in the previous quarter. This represents a 6% increase in profitability.";
      } else if (questionLower.includes("expense")) {
        answer =
          "Operating expenses were reduced by 7% through effective cost management strategies. The company maintained R&D spending at 15% of revenue.";
      } else if (
        questionLower.includes("cash") ||
        questionLower.includes("reserve")
      ) {
        answer =
          "Cash flow remains positive with $4.2M in reserves, which positions the company well for planned investments in Q3.";
      } else {
        answer =
          "Based on the financial report for Q2 2024, the company is showing strong performance with growth in revenue, improved margins, and healthy cash reserves. Specific details about " +
          questionLower +
          " may require further analysis of the complete financial statements.";
      }

      // Update conversation
      const updatedConversations = conversations.map((conv) =>
        conv.id === newConversationId
          ? { ...conv, answer, isPending: false }
          : conv
      );

      setConversations([
        { ...pendingConversation, answer, isPending: false },
        ...conversations.filter((c) => c.id !== newConversationId),
      ]);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Update free questions count
      if (freeQuestionsCount > 0) {
        setFreeQuestionsCount(freeQuestionsCount - 1);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      Alert.alert(t("errors.somethingWentWrong"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAskingQuestion(false);
      setSending(false);

      // After getting response, scroll to bottom
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      }
    }
  };

  // Helper functions

  // Get document type icon
  const getDocumentTypeIcon = () => {
    const type = document?.type?.toLowerCase() || "";

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

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get formatted date for messages
  const getMessageDate = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const today = new Date();

    // Reset hours for today
    today.setHours(0, 0, 0, 0);

    // Create yesterday date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours for message date
    const messageDateNoTime = new Date(messageDate);
    messageDateNoTime.setHours(0, 0, 0, 0);

    if (messageDateNoTime.getTime() === today.getTime()) {
      return `Today, ${formatTime(messageDate)}`;
    } else if (messageDateNoTime.getTime() === yesterday.getTime()) {
      return `Yesterday, ${formatTime(messageDate)}`;
    } else {
      return `${formatDate(messageDate)}, ${formatTime(messageDate)}`;
    }
  };

  // Animated header opacity based on scroll
  const animatedHeaderOpacity = scrollY.interpolate({
    inputRange: [0, 100, 130],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });

  // Image parallax effect with scroll
  const imageParallaxY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [50, 0, -30],
    extrapolate: "clamp",
  });

  // Render components

  // Render DocumentDetailScreen
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <Loading text={t("common.loading")} fullScreen />
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
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
      </SafeAreaView>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Header that appears on scroll */}
      <AnimatedHeader
        title={document.name}
        scrollY={scrollY}
        theme={theme}
        onBackPress={() => navigation.goBack()}
        maxHeaderHeight={60}
        statusBarHeight={STATUSBAR_HEIGHT}
      />

      {activeTab === "summary" ? (
        // Summary tab uses ScrollView
        <Animated.ScrollView
          ref={scrollViewRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshDocument}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* Header with back button and document title */}
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
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>

                <Text variant="h3" numberOfLines={1} style={styles.title}>
                  {document.name}
                </Text>

                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

          {/* Document image (if applicable) */}
          {document.type?.includes("image") && document.downloadUrl && (
            <View style={styles.imageContainer}>
              <Animated.View
                style={[
                  styles.imageWrapper,
                  {
                    transform: [
                      {
                        translateY: imageParallaxY,
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={{ uri: document.downloadUrl }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
              </Animated.View>

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
                      opacity: headerHeight,
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
          )}

          {/* Document info card */}
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
                      {document.type?.split("/").pop().toUpperCase() ||
                        "Unknown"}
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
                    <Text variant="body2">
                      {formatDate(document.createdAt)}
                    </Text>
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
                    label={
                      document.status === "analyzed" ? "Analyzed" : "Uploaded"
                    }
                    variant={
                      document.status === "analyzed" ? "success" : "info"
                    }
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

          {/* Tabs for switching between Summary and Ask */}
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
              onPress={() => handleTabChange("summary")}
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
              onPress={() => handleTabChange("ask")}
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
              {conversations.length > 0 && (
                <View style={styles.conversationCount}>
                  <Text variant="caption" color="white">
                    {conversations.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Summary content */}
          {document.status !== "analyzed" ? (
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
                  colors={[
                    theme.colors.background,
                    theme.colors.primary + "10",
                  ]}
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
                    Analyze this document with AI to get a summary, key points,
                    and insights.
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
          ) : (
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
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500 }}
              >
                <View style={styles.summarySection}>
                  <AIAnalysisCard
                    analysis={document.analysis}
                    analysisType="summary"
                    style={styles.analysisCard}
                  />
                </View>
              </MotiView>

              {/* Key Points */}
              {document.analysis.keyPoints &&
                document.analysis.keyPoints.length > 0 && (
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500, delay: 100 }}
                  >
                    <View style={styles.summarySection}>
                      <AIAnalysisCard
                        analysis={document.analysis}
                        analysisType="keyPoints"
                        style={styles.analysisCard}
                      />
                    </View>
                  </MotiView>
                )}

              {/* Details */}
              {document.analysis.details && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 500, delay: 200 }}
                >
                  <View style={styles.summarySection}>
                    <AIAnalysisCard
                      analysis={document.analysis}
                      analysisType="details"
                      style={styles.analysisCard}
                    />
                  </View>
                </MotiView>
              )}

              {/* Recommendations */}
              {document.analysis.recommendations &&
                document.analysis.recommendations.length > 0 && (
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500, delay: 300 }}
                  >
                    <View style={styles.summarySection}>
                      <AIAnalysisCard
                        analysis={document.analysis}
                        analysisType="recommendations"
                        style={styles.analysisCard}
                      />
                    </View>
                  </MotiView>
                )}
            </Animated.View>
          )}
        </Animated.ScrollView>
      ) : (
        // Ask tab - Q&A interface
        <View style={styles.askContainer}>
          {/* Document header - compact version */}
          <Animated.ScrollView
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 140 }}
          >
            <View style={styles.askHeaderContainer}>
              <LinearGradient
                colors={
                  isDark
                    ? [theme.colors.primary + "40", theme.colors.background]
                    : [theme.colors.primary + "20", theme.colors.background]
                }
                style={styles.askHeaderGradient}
              >
                <View style={styles.askHeader}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>

                  <Text
                    variant="subtitle1"
                    numberOfLines={1}
                    style={styles.askHeaderTitle}
                  >
                    {document.name}
                  </Text>

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

            {/* Short document info for Ask tab */}
            <View style={styles.askDocInfoContainer}>
              <View
                style={[
                  styles.askDocIconContainer,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name={getDocumentTypeIcon()}
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <Text variant="caption" color={theme.colors.textSecondary}>
                {document.type?.split("/").pop().toUpperCase()} •{" "}
                {formatFileSize(document.size)}
              </Text>
            </View>
          </Animated.ScrollView>

          {/* Tabs for switching between Summary and Ask */}
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
              onPress={() => handleTabChange("summary")}
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
              onPress={() => handleTabChange("ask")}
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
              {conversations.length > 0 && (
                <View style={styles.conversationCount}>
                  <Text variant="caption" color="white">
                    {conversations.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Document must be analyzed first message */}
          {document.status !== "analyzed" ? (
            <View style={styles.askMustAnalyzeFirst}>
              <Card style={styles.mustAnalyzeCard}>
                <View style={styles.mustAnalyzeContent}>
                  <Ionicons
                    name="alert-circle"
                    size={40}
                    color={theme.colors.warning}
                  />
                  <Text variant="subtitle1" style={styles.mustAnalyzeTitle}>
                    Document must be analyzed first
                  </Text>
                  <Text
                    variant="body2"
                    color={theme.colors.textSecondary}
                    style={styles.mustAnalyzeDesc}
                  >
                    Please analyze the document in the Summary tab to ask
                    questions about it.
                  </Text>
                  <Button
                    label="Go to Summary"
                    onPress={() => handleTabChange("summary")}
                    gradient={true}
                    style={styles.mustAnalyzeButton}
                  />
                </View>
              </Card>
            </View>
          ) : (
            <>
              {/* Chat messages - using inverted FlatList for better performance */}
              <FlatList
                ref={flatListRef}
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <View style={{ transform: [{ scaleY: -1 }] }}>
                    <Animated.View
                      style={[
                        {
                          opacity: fadeAnim,
                          transform: [
                            {
                              translateY: questionSlideAnim.interpolate({
                                inputRange: [0, 50],
                                outputRange: [0, 20],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      {/* Determine if we should show date */}
                      {index === conversations.length - 1 ||
                      new Date(
                        conversations[index].createdAt
                      ).toDateString() !==
                        new Date(
                          conversations[index + 1].createdAt
                        ).toDateString() ? (
                        <View style={styles.messageDateContainer}>
                          <Text
                            variant="caption"
                            color={theme.colors.textTertiary}
                            style={styles.messageDate}
                          >
                            {getMessageDate(item.createdAt)}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.messageContainer}>
                        {/* User message */}
                        <View style={styles.userMessageContainer}>
                          <View
                            style={[
                              styles.userMessage,
                              { backgroundColor: theme.colors.primary },
                            ]}
                          >
                            <Text
                              variant="body2"
                              color="#FFFFFF"
                              style={styles.messageText}
                            >
                              {item.question}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.messageTail,
                              styles.userMessageTail,
                              { borderRightColor: theme.colors.primary },
                            ]}
                          />
                        </View>

                        {/* AI Response */}
                        <View style={styles.aiMessageContainer}>
                          <View
                            style={[
                              styles.messageTail,
                              styles.aiMessageTail,
                              {
                                borderLeftColor: isDark
                                  ? theme.colors.card
                                  : "#F0F0F0",
                              },
                            ]}
                          />
                          <View
                            style={[
                              styles.aiMessage,
                              {
                                backgroundColor: isDark
                                  ? theme.colors.card
                                  : "#F0F0F0",
                                borderColor: item.error
                                  ? theme.colors.error + "40"
                                  : "transparent",
                              },
                            ]}
                          >
                            {item.isPending ? (
                              <View style={styles.typingIndicator}>
                                <View
                                  style={[
                                    styles.typingDot,
                                    {
                                      backgroundColor: theme.colors.primary,
                                      animationDelay: "0s",
                                    },
                                  ]}
                                />
                                <View
                                  style={[
                                    styles.typingDot,
                                    {
                                      backgroundColor: theme.colors.primary,
                                      animationDelay: "0.2s",
                                    },
                                  ]}
                                />
                                <View
                                  style={[
                                    styles.typingDot,
                                    {
                                      backgroundColor: theme.colors.primary,
                                      animationDelay: "0.4s",
                                    },
                                  ]}
                                />
                              </View>
                            ) : (
                              <Text
                                variant="body2"
                                color={
                                  item.error
                                    ? theme.colors.error
                                    : theme.colors.text
                                }
                                style={styles.messageText}
                              >
                                {item.answer}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  </View>
                )}
                inverted
                contentContainerStyle={[
                  styles.conversationsList,
                  { paddingBottom: isKeyboardVisible ? 20 : 0 },
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={{ transform: [{ scaleY: -1 }] }}>
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
                            Your first 3 questions are free. Additional
                            questions cost
                            {" " + TOKEN_COSTS.QUESTION} tokens each.
                          </Text>
                        </LinearGradient>
                      </Card>
                    </Animated.View>
                  </View>
                }
              />

              {/* Free questions indicator */}
              {freeQuestionsCount > 0 && !isKeyboardVisible && (
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
              )}

              {/* Chat input */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
              >
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.background,
                      borderTopColor: theme.colors.border,
                      paddingBottom: Platform.OS === "ios" ? 24 : 12,
                      paddingTop: 12,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.inputRow,
                      {
                        backgroundColor: isDark
                          ? theme.colors.card
                          : theme.colors.border + "20",
                        borderColor: isFocused
                          ? theme.colors.primary
                          : "transparent",
                        height: inputHeightAnim,
                      },
                    ]}
                  >
                    <TextInput
                      ref={inputRef}
                      style={[
                        styles.input,
                        {
                          color: theme.colors.text,
                          height: inputHeightAnim,
                        },
                      ]}
                      placeholder={t("document.askPlaceholder")}
                      placeholderTextColor={theme.colors.textSecondary}
                      value={question}
                      onChangeText={setQuestion}
                      multiline
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />

                    <Animated.View
                      style={[
                        styles.sendButtonContainer,
                        {
                          opacity: question.trim() ? 1 : 0.5,
                          transform: [{ scale: sendButtonScaleAnim }],
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.sendButton,
                          {
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                        onPress={askQuestion}
                        disabled={!question.trim() || askingQuestion}
                      >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>

                  {!isKeyboardVisible && freeQuestionsCount <= 0 && (
                    <View style={styles.tokenWarningContainer}>
                      <Text variant="caption" color={theme.colors.warning}>
                        <Ionicons
                          name="key"
                          size={12}
                          color={theme.colors.warning}
                        />{" "}
                        {TOKEN_COSTS.QUESTION} tokens per question
                      </Text>
                    </View>
                  )}
                </View>
              </KeyboardAvoidingView>
            </>
          )}
        </View>
      )}

      {/* Loading overlay if analyzing */}
      {analyzing && (
        <View style={styles.loadingOverlay}>
          <Loading text={t("document.processingDocument")} variant="pulse" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerContainer: {
    overflow: "hidden",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerGradient: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  imageContainer: {
    height: 240,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  imageWrapper: {
    height: 280, // Extra height for parallax effect
    width: "100%",
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
    marginVertical: 16,
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
    position: "relative",
  },
  tabIcon: {
    marginRight: 6,
  },
  conversationCount: {
    position: "absolute",
    top: 8,
    right: 0,
    backgroundColor: "#FF3B30",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
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
  askHeaderContainer: {
    overflow: "hidden",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  askHeaderGradient: {
    padding: 12,
    paddingTop: 50,
    paddingBottom: 16,
  },
  askHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  askHeaderTitle: {
    flex: 1,
    textAlign: "center",
  },
  askDocInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  askDocIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  askMustAnalyzeFirst: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  mustAnalyzeCard: {
    padding: 24,
  },
  mustAnalyzeContent: {
    alignItems: "center",
  },
  mustAnalyzeTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  mustAnalyzeDesc: {
    textAlign: "center",
    marginBottom: 24,
  },
  mustAnalyzeButton: {
    minWidth: 160,
  },
  conversationsList: {
    paddingHorizontal: 16,
    paddingTop: 100,
  },
  messageDateContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  messageDate: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    overflow: "hidden",
  },
  messageContainer: {
    marginBottom: 20,
  },
  userMessageContainer: {
    alignItems: "flex-end",
    marginLeft: width * 0.2,
    marginBottom: 2,
    position: "relative",
  },
  userMessage: {
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: "100%",
  },
  aiMessageContainer: {
    alignItems: "flex-start",
    marginRight: width * 0.2,
    marginTop: 2,
    position: "relative",
  },
  aiMessage: {
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: "100%",
    borderWidth: 1,
  },
  messageTail: {
    position: "absolute",
    bottom: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 8,
    borderTopColor: "transparent",
  },
  userMessageTail: {
    right: -6,
    borderLeftWidth: 6,
    borderLeftColor: "transparent",
    borderRightWidth: 6,
  },
  aiMessageTail: {
    left: -6,
    borderRightWidth: 6,
    borderRightColor: "transparent",
    borderLeftWidth: 6,
  },
  messageText: {
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: "row",
    height: 20,
    alignItems: "center",
    marginHorizontal: 10,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  freeQuestionsContainer: {
    position: "absolute",
    top: 140,
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
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
    paddingHorizontal: 16,
    borderTopWidth: 1,
    zIndex: 1,
  },
  tokenWarningContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    fontSize: 16,
    paddingRight: 40,
  },
  sendButtonContainer: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  // Pulse animation for the typing dots
  "@keyframes pulse": {
    "0%": {
      opacity: 0.4,
      transform: [{ scale: 0.8 }],
    },
    "50%": {
      opacity: 1,
      transform: [{ scale: 1.2 }],
    },
    "100%": {
      opacity: 0.4,
      transform: [{ scale: 0.8 }],
    },
  },
  typingDot: {
    animationName: "pulse",
    animationDuration: "1s",
    animationIterationCount: "infinite",
  },
});

export default DocumentDetailScreen;
