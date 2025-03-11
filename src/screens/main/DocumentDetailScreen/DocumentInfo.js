import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Badge } from "../../../components";

const DocumentInfo = ({ document, onShare, onDelete, theme, onBackPress }) => {
  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get document type icon
  const getDocumentTypeIcon = () => {
    const type = document?.type?.toLowerCase() || "";
    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";
    return "document-outline";
  };

  return (
    <View style={styles.container}>
      {/* Header bar with title and actions */}
      <View style={styles.headerBar}>
        <View style={styles.documentInfoHeader}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.docIconContainer}>
            <Ionicons
              name={getDocumentTypeIcon()}
              size={20}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.headerTextContainer}>
            <Text
              variant="subtitle1"
              numberOfLines={1}
              style={styles.documentTitle}
            >
              {document.name}
            </Text>
            <View style={styles.documentMeta}>
              <Text variant="caption" color={theme.colors.textSecondary}>
                {document.type?.split("/").pop().toUpperCase() || "Unknown"} •{" "}
                {formatFileSize(document.size)}
              </Text>
              <Badge
                label={document.status === "analyzed" ? "Analyzed" : "Uploaded"}
                variant={document.status === "analyzed" ? "success" : "info"}
                size="small"
                style={styles.statusBadge}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(document.name, "", [
                {
                  text: "Share",
                  onPress: onShare,
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: onDelete,
                },
                {
                  text: "Cancel",
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  documentInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  docIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: (theme) => theme.colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  documentTitle: {
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    marginLeft: 8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default DocumentInfo;
