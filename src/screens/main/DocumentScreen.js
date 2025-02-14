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
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");

export const DocumentScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const filters = [
    { id: "all", label: "All Files", icon: "documents" },
    { id: "analyzed", label: "Analyzed", icon: "checkmark-circle" },
    { id: "pending", label: "Pending", icon: "time" },
  ];

  const documents = [
    {
      id: "1",
      title: "Q4 Financial Report 2024",
      type: "PDF",
      size: "2.4 MB",
      date: "2h ago",
      status: "analyzed",
      pages: 12,
    },
    {
      id: "2",
      title: "Marketing Strategy Presentation",
      type: "PPTX",
      size: "4.8 MB",
      date: "5h ago",
      status: "pending",
      pages: 24,
    },
    {
      id: "3",
      title: "Customer Survey Results",
      type: "XLSX",
      size: "1.2 MB",
      date: "1d ago",
      status: "analyzed",
      pages: 8,
    },
  ];

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword"],
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        // Handle the selected document
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="h1" style={{ color: theme.colors.text }}>
        Documents
      </Text>
      {/* <TouchableOpacity
        style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate("Search")}
      ></TouchableOpacity> */}
    </View>
  );

  const renderUploadSection = () => (
    <TouchableOpacity
      onPress={pickDocument}
      style={[styles.uploadCard, { backgroundColor: theme.colors.surface }]}
    >
      <LinearGradient
        colors={[theme.colors.primary + "20", theme.colors.primary + "05"]}
        style={styles.uploadGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
            Upload Documents
          </Text>
          <Text
            style={[
              styles.uploadSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Tap to browse or drop files here
          </Text>
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
        navigation.navigate("DocumentDetail", { documentId: document.id })
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
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Text
        style={[styles.documentTitle, { color: theme.colors.text }]}
        numberOfLines={1}
      >
        {document.title}
      </Text>

      <View style={styles.documentMeta}>
        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
          {document.type} • {document.size}
        </Text>
        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
          {document.pages} pages
        </Text>
      </View>

      <View style={styles.documentFooter}>
        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
          {document.date}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                document.status === "analyzed"
                  ? theme.colors.success + "20"
                  : theme.colors.warning + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  document.status === "analyzed"
                    ? theme.colors.success
                    : theme.colors.warning,
              },
            ]}
          >
            {document.status === "analyzed" ? "Analyzed" : "Pending"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderUploadSection()}
        {renderFilters()}

        <View style={styles.documentsList}>
          {documents.map(renderDocumentItem)}
        </View>
      </ScrollView>
      {/* <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("Scan")}
      >
        <Ionicons name="scan" size={24} color="white" />
      </TouchableOpacity> */}
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
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  fabButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
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
  documentsList: {
    gap: 16,
  },
  documentItem: {
    padding: 16,
    borderRadius: 16,
  },
  documentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
  },
  documentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
