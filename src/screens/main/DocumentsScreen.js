// DocumentsScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";

export const DocumentsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Token durumu (gerçek uygulamada redux/context'ten gelecek)
  const [tokenCount, setTokenCount] = useState(0);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);

  const filters = [
    { id: "all", label: "All Files", icon: "documents" },
    { id: "analyzed", label: "Analyzed", icon: "checkmark-circle" },
    { id: "pending", label: "Pending", icon: "time" },
  ];

  // Örnek doküman listesi
  const documents = [
    {
      id: "1",
      title: "Financial Report Q4 2024",
      type: "PDF",
      size: "2.4 MB",
      date: "2h ago",
      status: "analyzed",
      pages: 12,
      insights: 8,
    },
  ];

  const handleUpload = async () => {
    if (tokenCount === 0 && freeTrialUsed) {
      Alert.alert(
        "No Tokens Available",
        "Please purchase tokens to analyze more documents.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Get Tokens", onPress: () => navigation.navigate("Premium") },
        ]
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        // Burada doküman analizi başlatılacak
        if (!freeTrialUsed) {
          setFreeTrialUsed(true);
        } else {
          setTokenCount((prev) => prev - 1);
        }
        navigation.navigate("DocumentDetail", { documentId: "new" });
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text
        variant="h1"
        style={[styles.headerTitle, { color: theme.colors.text }]}
      >
        Documents
      </Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[
            styles.tokenButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => navigation.navigate("Premium")}
        >
          <Ionicons name="flash" size={18} color={theme.colors.warning} />
          <Text style={[styles.tokenCount, { color: theme.colors.text }]}>
            {tokenCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="search" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUploadSection = () => (
    <TouchableOpacity
      onPress={handleUpload}
      style={[styles.uploadCard, { backgroundColor: theme.colors.surface }]}
    >
      <LinearGradient
        colors={[theme.colors.primary + "20", theme.colors.primary + "05"]}
        style={styles.uploadGradient}
      >
        <View style={styles.uploadContent}>
          <View
            style={[
              styles.uploadIcon,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="cloud-upload"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.uploadTitle, { color: theme.colors.text }]}>
            Upload Document
          </Text>
          <Text
            style={[
              styles.uploadSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {!freeTrialUsed
              ? "Try it free - First analysis on us!"
              : `${tokenCount} tokens available`}
          </Text>
          {tokenCount === 0 && freeTrialUsed && (
            <Button
              title="Get Tokens"
              onPress={() => navigation.navigate("Premium")}
              theme={theme}
              size="small"
              style={styles.getTokensButton}
            />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                selectedFilter === filter.id
                  ? theme.colors.primary
                  : theme.colors.surface,
            },
          ]}
          onPress={() => setSelectedFilter(filter.id)}
        >
          <Ionicons
            name={filter.icon}
            size={18}
            color={selectedFilter === filter.id ? "white" : theme.colors.text}
          />
          <Text
            style={[
              styles.filterLabel,
              {
                color:
                  selectedFilter === filter.id ? "white" : theme.colors.text,
              },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDocumentItem = (document) => (
    <TouchableOpacity
      key={document.id}
      style={[styles.documentItem, { backgroundColor: theme.colors.surface }]}
      onPress={() =>
        navigation.navigate("DocumentDetail", {
          documentId: document.id,
        })
      }
    >
      <View style={styles.documentHeader}>
        <View
          style={[
            styles.typeIcon,
            { backgroundColor: theme.colors.primary + "15" },
          ]}
        >
          <Ionicons
            name={document.type === "PDF" ? "document-text" : "document"}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.documentTitle, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {document.title}
          </Text>
          <Text
            style={[styles.documentMeta, { color: theme.colors.textSecondary }]}
          >
            {document.type} • {document.size} • {document.pages} pages
          </Text>
        </View>
      </View>

      <View style={styles.documentInfo}>
        <View
          style={[
            styles.insightBadge,
            { backgroundColor: theme.colors.warning + "20" },
          ]}
        >
          <Ionicons name="bulb" size={14} color={theme.colors.warning} />
          <Text style={[styles.insightText, { color: theme.colors.warning }]}>
            {document.insights} insights
          </Text>
        </View>
        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
          {document.date}
        </Text>
      </View>

      <View style={styles.documentActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary + "10" },
          ]}
        >
          <Ionicons name="eye" size={18} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary }}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.success + "10" },
          ]}
        >
          <Ionicons name="share" size={18} color={theme.colors.success} />
          <Text style={{ color: theme.colors.success }}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View
      style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}
    >
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons name="document-text" size={32} color={theme.colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Documents Yet
      </Text>
      <Text
        style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}
      >
        Upload your first document to get started
      </Text>
      <Button
        title={!freeTrialUsed ? "Try it Free" : "Upload Document"}
        onPress={handleUpload}
        theme={theme}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderUploadSection()}
        {renderFilters()}
        {documents.length > 0
          ? documents.map(renderDocumentItem)
          : renderEmptyState()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  tokenButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    gap: 6,
  },
  tokenCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  uploadGradient: {
    padding: 24,
  },
  uploadContent: {
    alignItems: "center",
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  getTokensButton: {
    minWidth: 120,
  },
  filtersContainer: {
    paddingBottom: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  documentItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
  },
  documentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  insightText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
  },
  documentActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 200,
  },
});
