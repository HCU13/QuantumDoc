// HistoryScreen.js (Eski Analytics sayfasının yerine)
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

export const HistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [histories, setHistories] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock data - grouped by date
      const mockData = [
        {
          title: "Today",
          data: [
            {
              id: "1",
              title: "Invoice Analysis",
              type: "PDF",
              action: "analyze",
              time: "2 hours ago",
              icon: "receipt-outline",
            },
            {
              id: "2",
              title: "Contract Scan",
              type: "PDF",
              action: "scan",
              time: "5 hours ago",
              icon: "document-text-outline",
            },
          ],
        },
        {
          title: "Yesterday",
          data: [
            {
              id: "3",
              title: "Meeting Notes Upload",
              type: "DOCX",
              action: "upload",
              time: "1 day ago",
              icon: "document-text-outline",
            },
          ],
        },
        {
          title: "This Week",
          data: [
            {
              id: "4",
              title: "Resume Analysis",
              type: "PDF",
              action: "analyze",
              time: "2 days ago",
              icon: "person-outline",
            },
            {
              id: "5",
              title: "Receipt Scan",
              type: "Image",
              action: "scan",
              time: "3 days ago",
              icon: "receipt-outline",
            },
            {
              id: "6",
              title: "Project Proposal",
              type: "DOCX",
              action: "upload",
              time: "5 days ago",
              icon: "document-text-outline",
            },
          ],
        },
      ];

      setHistories(mockData);
    } catch (error) {
      showToast.error("Error", "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHistory().finally(() => setRefreshing(false));
  }, []);

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
