// components/DocumentDetail/Header.js
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Badge } from "../../../components";

const Header = ({
  document,
  activeTab,
  setActiveTab,
  onBack,
  onShare,
  onDelete,
  theme,
  isDark,
  conversationsCount,
}) => {
  // File type and color
  const getFileInfo = () => {
    if (!document)
      return {
        type: "DOC",
        color: theme.colors.primary,
        icon: "document-outline",
      };

    const type = document.type?.toLowerCase() || "";
    const name = document.name?.toLowerCase() || "";

    // Determine file type display name
    let displayType = "DOC";
    if (type.includes("pdf")) displayType = "PDF";
    else if (
      type.includes("jpg") ||
      type.includes("jpeg") ||
      name.endsWith(".jpg")
    )
      displayType = "JPG";
    else if (type.includes("png") || name.endsWith(".png")) displayType = "PNG";
    else if (type.includes("docx") || name.endsWith(".docx"))
      displayType = "DOCX";
    else if (type.includes("doc") || name.endsWith(".doc")) displayType = "DOC";
    else if (
      type.includes("text") ||
      type.includes("txt") ||
      name.endsWith(".txt")
    )
      displayType = "TXT";

    // Determine icon
    let icon = "document-outline";
    if (type.includes("pdf")) icon = "document-text";
    else if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png")
    )
      icon = "image";
    else if (type.includes("doc")) icon = "document";
    else if (type.includes("text") || type.includes("txt"))
      icon = "document-text-outline";

    // Determine color based on theme
    let color = theme.colors.primary;
    if (type.includes("pdf")) color = theme.colors.error;
    else if (type.includes("image")) color = theme.colors.info;
    else if (type.includes("doc")) color = theme.colors.primary;
    else if (type.includes("text") || type.includes("txt"))
      color = theme.colors.textSecondary;

    return { type: displayType, color, icon };
  };

  const fileInfo = getFileInfo();

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

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Ionicons
              name="share-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Ionicons
              name="trash-outline"
              size={24}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Document Info */}
      <View style={styles.documentInfo}>
        <View
          style={[
            styles.fileIconContainer,
            {
              backgroundColor: fileInfo.color,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          <Ionicons name={fileInfo.icon} size={32} color="#FFFFFF" />
        </View>

        <View style={styles.documentDetails}>
          <Text
            style={[
              styles.documentTitle,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
              },
            ]}
            numberOfLines={2}
          >
            {document?.name || "Document"}
          </Text>

          <View style={styles.documentMeta}>
            <Badge
              label={fileInfo.type}
              variant="primary"
              size="small"
              style={styles.badge}
            />
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              {formatFileSize(document?.size)} •{" "}
              {formatDate(document?.createdAt)}
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
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "summary" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 3,
            },
          ]}
          onPress={() => setActiveTab("summary")}
        >
          <Ionicons
            name="document-text-outline"
            size={22}
            color={
              activeTab === "summary"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
            style={{ marginRight: theme.spacing.sm }}
          />
          <Text
            style={{
              fontWeight:
                activeTab === "summary"
                  ? theme.typography.fontWeight.semibold
                  : theme.typography.fontWeight.regular,
              color:
                activeTab === "summary"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.md,
            }}
          >
            Summary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "ask" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 3,
            },
          ]}
          onPress={() => setActiveTab("ask")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={
              activeTab === "ask"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
            style={{ marginRight: theme.spacing.sm }}
          />
          <Text
            style={{
              fontWeight:
                activeTab === "ask"
                  ? theme.typography.fontWeight.semibold
                  : theme.typography.fontWeight.regular,
              color:
                activeTab === "ask"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.md,
            }}
          >
            Ask AI
          </Text>
          {conversationsCount > 0 && (
            <Badge
              label={conversationsCount.toString()}
              variant="error"
              size="small"
              style={{ marginLeft: theme.spacing.sm }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  fileIconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  documentDetails: {
    flex: 1,
  },
  documentTitle: {
    marginBottom: 6,
  },
  documentMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  badge: {
    marginRight: 8,
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 24,
    paddingHorizontal: 4,
  },
});

export default Header;
