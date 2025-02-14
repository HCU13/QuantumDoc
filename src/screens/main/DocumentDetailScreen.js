import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const DocumentDetailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("summary"); // summary, insights, qa

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
          activeTab === "qa" && { borderBottomColor: theme.colors.primary },
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

  const renderQA = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.qaHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Ask Questions
        </Text>
        <Text
          style={[styles.qaSubtitle, { color: theme.colors.textSecondary }]}
        >
          Get instant answers about your document
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.askButton,
          { backgroundColor: theme.colors.primary + "10" },
        ]}
        onPress={() => {}}
      >
        <Ionicons
          name="chatbubble-outline"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={{ color: theme.colors.primary }}>Ask a Question</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderTabs()}

          {activeTab === "summary" && renderSummary()}
          {activeTab === "insights" && renderInsights()}
          {activeTab === "qa" && renderQA()}
        </ScrollView>
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
  qaHeader: {
    marginBottom: 24,
  },
  qaSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
});
