import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
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
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [groupedDocuments, setGroupedDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all', 'pdf', 'image', 'document'

  // Load documents when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      loadDocuments();
    } else {
      setLoading(false);
      setError("Please log in to view your document history");
    }
  }, [user]);

  // Load documents from the server
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      // Load user documents
      const userDocuments = await documentManager.getUserDocuments();
      setDocuments(userDocuments);

      // Group documents for display
      const grouped = groupDocumentsByDate(userDocuments);
      setGroupedDocuments(grouped);
    } catch (error) {
      console.error("Error loading document history:", error);
      setError(error.message || "Failed to load document history");
      showToast.error("Error", "Failed to load document history");
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDocuments().finally(() => setRefreshing(false));
  }, [user]);

  // Group documents by date (Today, Yesterday, This Week, Earlier)
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
      // Skip documents that don't match the filter
      if (selectedFilter !== "all") {
        const docType = (doc.type || "").toLowerCase();
        if (
          (selectedFilter === "pdf" && !docType.includes("pdf")) ||
          (selectedFilter === "image" && !docType.includes("image")) ||
          (selectedFilter === "document" &&
            !(docType.includes("doc") || docType.includes("word")))
        ) {
          return;
        }
      }

      // Skip documents that don't match the search
      if (searchQuery) {
        const docName = (doc.name || "").toLowerCase();
        if (!docName.includes(searchQuery.toLowerCase())) {
          return;
        }
      }

      // Get document date
      const docDate = doc.createdAt ? new Date(doc.createdAt) : new Date(0);
      docDate.setHours(0, 0, 0, 0);

      // Format the document item
      const formattedItem = formatDocumentItem(doc);

      // Add to appropriate group
      if (docDate.getTime() === today.getTime()) {
        todayDocs.push(formattedItem);
      } else if (docDate.getTime() === yesterday.getTime()) {
        yesterdayDocs.push(formattedItem);
      } else if (docDate >= thisWeekStart) {
        thisWeekDocs.push(formattedItem);
      } else {
        earlierDocs.push(formattedItem);
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

  // Format document item for display
  const formatDocumentItem = (doc) => {
    // Determine document icon based on type
    let icon = "document-text-outline";
    const docType = (doc.type || "").toLowerCase();

    if (docType.includes("pdf")) {
      icon = "document-text-outline";
    } else if (
      docType.includes("image") ||
      docType.includes("jpg") ||
      docType.includes("png")
    ) {
      icon = "image-outline";
    } else if (docType.includes("word") || docType.includes("doc")) {
      icon = "document-outline";
    } else if (
      doc.name?.toLowerCase().includes("invoice") ||
      doc.name?.toLowerCase().includes("receipt")
    ) {
      icon = "receipt-outline";
    }

    // Format file size
    const formatFileSize = (bytes) => {
      if (!bytes) return "Unknown size";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Format relative time
    const getRelativeTime = (dateString) => {
      if (!dateString) return "Unknown";

      const date = new Date(dateString);
      const now = new Date();
      const diffSeconds = Math.floor((now - date) / 1000);

      if (diffSeconds < 60) return "Just now";
      if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
      if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
      if (diffSeconds < 604800)
        return `${Math.floor(diffSeconds / 86400)}d ago`;

      return date.toLocaleDateString();
    };

    // Return formatted document item
    return {
      id: doc.id,
      title: doc.name || "Unnamed Document",
      type: doc.type || "Unknown type",
      size: formatFileSize(doc.size),
      time: getRelativeTime(doc.createdAt),
      icon,
      status: doc.status || "uploaded",
      originalDoc: doc,
    };
  };

  // Delete document
  const handleDeleteDocument = (docId) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await documentManager.deleteDocument(docId);
              showToast.success("Success", "Document deleted successfully");
              loadDocuments();
            } catch (error) {
              console.error("Error deleting document:", error);
              showToast.error("Error", "Failed to delete document");
            }
          },
        },
      ]
    );
  };

  // Update filtered documents when search query or filter changes
  useEffect(() => {
    const filtered = groupDocumentsByDate(documents);
    setGroupedDocuments(filtered);
  }, [searchQuery, selectedFilter, documents]);

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        Document History
      </Text>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => navigation.navigate("Documents")}
        >
          <Ionicons name="add-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render search bar
  const renderSearchBar = () => (
    <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
      <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search documents..."
        placeholderTextColor={theme.colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery ? (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // Render filter chips
  const renderFilterChips = () => {
    const filters = [
      { id: "all", label: "All" },
      { id: "pdf", label: "PDFs" },
      { id: "document", label: "Documents" },
      { id: "image", label: "Images" },
    ];

    return (
      <View style={styles.filtersContainer}>
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
            <Text
              style={{
                color:
                  selectedFilter === filter.id ? "white" : theme.colors.text,
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render section header
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

  // Render document item
  const renderDocumentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.documentItem, { backgroundColor: theme.colors.surface }]}
      onPress={() =>
        navigation.navigate("DocumentDetail", { documentId: item.id })
      }
    >
      <View style={styles.documentContent}>
        <View
          style={[
            styles.documentIcon,
            { backgroundColor: theme.colors.primary + "15" },
          ]}
        >
          <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
        </View>

        <View style={styles.documentInfo}>
          <Text
            style={[styles.documentTitle, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View style={styles.documentMeta}>
            <Text
              style={[
                styles.documentType,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.type}
            </Text>
            <Text
              style={[
                styles.metaSeparator,
                { color: theme.colors.textSecondary },
              ]}
            >
              •
            </Text>
            <Text
              style={[
                styles.documentSize,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.size}
            </Text>
            <Text
              style={[
                styles.metaSeparator,
                { color: theme.colors.textSecondary },
              ]}
            >
              •
            </Text>
            <Text
              style={[
                styles.documentTime,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.time}
            </Text>
          </View>
        </View>

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => handleDeleteDocument(item.id)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Badge */}
      {item.status === "analyzed" && (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: theme.colors.success + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: theme.colors.success }]}>
            Analyzed
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View
      style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}
    >
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons name="document-text" size={40} color={theme.colors.primary} />
      </View>

      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Documents Found
      </Text>

      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {searchQuery || selectedFilter !== "all"
          ? "Try changing your search or filters"
          : "Your document history will appear here"}
      </Text>

      <Button
        title="Upload a Document"
        onPress={() => navigation.navigate("Documents")}
        theme={theme}
        style={styles.uploadButton}
      />
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View
      style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}
    >
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.colors.error + "15" },
        ]}
      >
        <Ionicons name="alert-circle" size={40} color={theme.colors.error} />
      </View>

      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Something Went Wrong
      </Text>

      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {error || "Failed to load your document history"}
      </Text>

      <Button
        title="Try Again"
        onPress={loadDocuments}
        theme={theme}
        style={styles.uploadButton}
      />
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading documents...
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {renderHeader()}
      {renderSearchBar()}
      {renderFilterChips()}

      {loading ? (
        renderLoading()
      ) : error ? (
        renderErrorState()
      ) : groupedDocuments.length > 0 ? (
        <SectionList
          sections={groupedDocuments}
          keyExtractor={(item) => item.id}
          renderItem={renderDocumentItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
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
        renderEmptyState()
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 24,
  },
  documentItem: {
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  documentContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  documentMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  documentType: {
    fontSize: 13,
  },
  documentSize: {
    fontSize: 13,
  },
  documentTime: {
    fontSize: 13,
  },
  metaSeparator: {
    marginHorizontal: 6,
    fontSize: 13,
  },
  documentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  actionIcon: {
    padding: 5,
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    margin: 20,
    borderRadius: 20,
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
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  uploadButton: {
    minWidth: 200,
  },
});
