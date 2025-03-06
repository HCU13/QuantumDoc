// HistoryScreen.js - Kullanıcının dökümanlarını gösteren ekran
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "../../utils/toast";
import { documentManager } from "../../services/DocumentManager";
import { useAuth } from "../../hooks/useAuth";

export const HistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [histories, setHistories] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      loadHistory();
    } else {
      setLoading(false);
      setHistories([]);
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      console.log("Loading documents for user:", user.uid);

      // Load user documents from Firebase
      const userDocuments = await documentManager.getUserDocuments(user.uid);
      console.log(`Loaded ${userDocuments.length} documents`);

      // Store the raw documents for filtering
      setDocuments(userDocuments);

      // Group documents by date
      const grouped = groupDocumentsByDate(userDocuments);
      setHistories(grouped);
    } catch (error) {
      console.error("Error loading history:", error);
      showToast.error("Error", "Failed to load document history");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to group documents by date
  const groupDocumentsByDate = (docs) => {
    if (!docs || docs.length === 0) return [];

    // Sort documents by date (newest first)
    const sortedDocs = [...docs].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    // Get today and yesterday dates for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    // Group documents
    const todayDocs = [];
    const yesterdayDocs = [];
    const thisWeekDocs = [];
    const earlierDocs = [];

    sortedDocs.forEach((doc) => {
      // Convert document date
      const docDate = doc.createdAt ? new Date(doc.createdAt) : new Date(0);
      docDate.setHours(0, 0, 0, 0);

      // Determine action type
      let action = "upload";
      if (doc.status === "analyzed") {
        action = "analyze";
      } else if (doc.type?.toLowerCase().includes("image")) {
        action = "scan";
      }

      // Format relative time
      const timeAgo = getRelativeTimeString(doc.createdAt);

      // Get appropriate icon
      let icon = "document-text-outline";
      if (doc.type?.toLowerCase().includes("pdf")) {
        icon = "document-text-outline";
      } else if (doc.type?.toLowerCase().includes("image")) {
        icon = "image-outline";
      } else if (
        doc.type?.toLowerCase().includes("word") ||
        doc.type?.toLowerCase().includes("docx")
      ) {
        icon = "document-outline";
      } else if (
        doc.name?.toLowerCase().includes("invoice") ||
        doc.name?.toLowerCase().includes("receipt")
      ) {
        icon = "receipt-outline";
      }

      // Create history item
      const historyItem = {
        id: doc.id,
        title: doc.name || "Document",
        type: doc.type || "File",
        action,
        time: timeAgo,
        icon,
        originalDoc: doc,
      };

      // Add to appropriate group
      if (docDate.getTime() === today.getTime()) {
        todayDocs.push(historyItem);
      } else if (docDate.getTime() === yesterday.getTime()) {
        yesterdayDocs.push(historyItem);
      } else if (docDate >= thisWeekStart) {
        thisWeekDocs.push(historyItem);
      } else {
        earlierDocs.push(historyItem);
      }
    });

    // Create sections
    const sections = [];

    if (todayDocs.length > 0) {
      sections.push({ title: "Today", data: todayDocs });
    }

    if (yesterdayDocs.length > 0) {
      sections.push({ title: "Yesterday", data: yesterdayDocs });
    }

    if (thisWeekDocs.length > 0) {
      sections.push({ title: "This Week", data: thisWeekDocs });
    }

    if (earlierDocs.length > 0) {
      sections.push({ title: "Earlier", data: earlierDocs });
    }

    return sections;
  };

  // Helper function to format relative time
  const getRelativeTimeString = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) {
      return "Just now";
    } else if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      return `${mins} ${mins === 1 ? "min" : "mins"} ago`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (diffSeconds < 604800) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHistory().finally(() => setRefreshing(false));
  }, [user]);

  const getActionColor = (action) => {
    switch (action) {
      case "upload":
        return theme.colors.primary;
      case "scan":
        return theme.colors.warning;
      case "analyze":
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "upload":
        return "cloud-upload-outline";
      case "scan":
        return "scan-outline";
      case "analyze":
        return "analytics-outline";
      default:
        return "ellipsis-horizontal-outline";
    }
  };

  const filters = [
    { id: "all", label: "All Activity", icon: "apps-outline" },
    { id: "upload", label: "Uploads", icon: "cloud-upload-outline" },
    { id: "scan", label: "Scans", icon: "scan-outline" },
    { id: "analyze", label: "Analyses", icon: "analytics-outline" },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <Text
        variant="h1"
        style={[styles.headerTitle, { color: theme.colors.text }]}
      >
        History
      </Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="filter-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
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

  const renderSectionHeader = ({ section: { title } }) => (
    <Text
      style={[
        styles.sectionHeader,
        {
          color: theme.colors.textSecondary,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {title}
    </Text>
  );

  const renderItem = ({ item }) => {
    // Filter items based on selected filter
    if (selectedFilter !== "all" && item.action !== selectedFilter) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: theme.colors.surface }]}
        onPress={() =>
          navigation.navigate("DocumentDetail", { documentId: item.id })
        }
      >
        <View style={styles.itemContent}>
          <View
            style={[
              styles.documentIcon,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
          >
            <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
          </View>

          <View style={styles.itemDetails}>
            <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text
              style={[styles.itemMeta, { color: theme.colors.textSecondary }]}
            >
              {item.type} • {item.time}
            </Text>
          </View>

          <View
            style={[
              styles.actionBadge,
              { backgroundColor: getActionColor(item.action) + "15" },
            ]}
          >
            <Ionicons
              name={getActionIcon(item.action)}
              size={14}
              color={getActionColor(item.action)}
            />
            <Text
              style={[
                styles.actionText,
                { color: getActionColor(item.action) },
              ]}
            >
              {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Ionicons name="time-outline" size={40} color={theme.colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No History Yet
      </Text>
      <Text
        style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}
      >
        Your document activity will appear here
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading history...
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {renderHeader()}
      {renderFilters()}

      {loading ? (
        renderLoading()
      ) : histories.length > 0 ? (
        <SectionList
          sections={histories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.historyList}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "center",
    height: 40,
    borderRadius: 20,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
  },
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
  },
});
