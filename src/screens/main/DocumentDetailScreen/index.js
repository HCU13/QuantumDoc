import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useTokens } from "../../../context/TokenContext";
import { useLocalization } from "../../../context/LocalizationContext";
import { Text, AnimatedHeader, Card } from "../../../components";
import DocumentInfo from "./DocumentInfo";
import SummaryView from "./SummaryView";
import QuestionsView from "./QuestionsView";

const DocumentDetailScreen = ({ route, navigation }) => {
  // Get params from route or use default
  const params = route?.params || {};
  const { documentId, newDocument } = params;

  // Hooks
  const { theme, isDark } = useTheme();
  const { tokens, hasEnoughTokens, useToken, TOKEN_COSTS } = useTokens();
  const { t } = useLocalization();

  // Refs
  const scrollY = useRef(new Animated.Value(0)).current;

  // State
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [analyzing, setAnalyzing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [freeQuestionsCount, setFreeQuestionsCount] = useState(3);

  // Load document data
  useEffect(() => {
    loadDocument();
  }, [documentId]);

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

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
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
      Alert.alert("Sharing document", "Share functionality would go here");
    } catch (error) {
      console.error("Error sharing document:", error);
    }
  };

  // Ask question
  const askQuestion = async (question) => {
    try {
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
      setConversations([
        { ...pendingConversation, answer, isPending: false },
        ...conversations.filter((c) => c.id !== newConversationId),
      ]);

      // Update free questions count
      if (freeQuestionsCount > 0) {
        setFreeQuestionsCount(freeQuestionsCount - 1);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      Alert.alert(t("errors.somethingWentWrong"));
    }
  };

  // Render tabs
  const renderTabs = () => {
    return (
      <View
        style={[
          styles.tabContainer,
          { borderBottomColor: theme.colors.border },
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
            <View
              style={[
                styles.conversationCount,
                { backgroundColor: theme.colors.error },
              ]}
            >
              <Text variant="caption" color="white">
                {conversations.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Show error view if document not found
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.loading}>
          <Ionicons name="hourglass" size={48} color={theme.colors.primary} />
          <Text variant="subtitle1" style={{ marginTop: 16 }}>
            {t("common.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
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
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text variant="body1" color="white">
              {t("common.back")}
            </Text>
          </TouchableOpacity>
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

      {/* Fixed Header Info */}
      <View style={styles.fixedContent}>
        {/* Document Info - Compact Version */}
        <DocumentInfo
          document={document}
          onShare={shareDocument}
          onDelete={deleteDocument}
          onBackPress={() => navigation.goBack()}
          theme={theme}
        />

        {/* Tabs */}
        {renderTabs()}
      </View>

      {/* Main Scrollable Content */}
      <View style={styles.mainContent}>
        {activeTab === "summary" ? (
          <SummaryView
            document={document}
            analyzing={analyzing}
            analyzeDocument={analyzeDocument}
            theme={theme}
            t={t}
            scrollY={scrollY}
            refreshDocument={refreshDocument}
            refreshing={refreshing}
          />
        ) : (
          <QuestionsView
            document={document}
            conversations={conversations}
            freeQuestionsCount={freeQuestionsCount}
            askQuestion={askQuestion}
            theme={theme}
            t={t}
            TOKEN_COSTS={TOKEN_COSTS}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  fixedContent: {
    zIndex: 1,
    backgroundColor: (theme) => theme.colors.background,
  },
  mainContent: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
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
    right: 20,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DocumentDetailScreen;
