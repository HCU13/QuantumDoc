import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import Text from "./Text";
import Badge from "./Badge";
import Card from "./Card";
import { useTheme } from "../context/ThemeContext";
/**
 * DocumentItem Component - For displaying document in lists
 *
 * @param {Object} document - Document object with properties
 * @param {function} onPress - Press handler
 * @param {boolean} compact - Whether to use compact mode
 * @param {Object} style - Additional style overrides
 */
const DocumentItem = ({
  document,
  onPress,
  compact = false,
  style,
  ...props
}) => {
  // Constants for colors based on file type
  const FILE_COLORS = {
    pdf: "#EF4444", // Red
    image: "#3B82F6", // Blue
    doc: "#8B5CF6", // Purple
    txt: "#6B7280", // Gray
    default: "#5D5FEF", // Primary
  };

  // Get color based on file type
  const getFileColor = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return FILE_COLORS.pdf;
    if (type.includes("image")) return FILE_COLORS.image;
    if (type.includes("doc")) return FILE_COLORS.doc;
    if (type.includes("text") || type.includes("txt")) return FILE_COLORS.txt;

    return FILE_COLORS.default;
  };

  // Get file type display name
  const getFileType = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return "PDF";
    if (type.includes("jpg") || type.includes("jpeg")) return "JPG";
    if (type.includes("png")) return "PNG";
    if (type.includes("docx")) return "DOCX";
    if (type.includes("doc")) return "DOC";
    if (type.includes("text") || type.includes("txt")) return "TXT";

    return "DOC";
  };

  // Get file icon
  const getFileIcon = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("doc")) return "📝";
    if (type.includes("text") || type.includes("txt")) return "📃";

    return "📄";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    // For older dates
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  };

  // Get status info
  const getStatusInfo = () => {
    switch (document.status) {
      case "analyzed":
        return {
          label: "Analyzed",
          variant: "success",
        };
      case "analyzing":
        return {
          label: "Analyzing",
          variant: "warning",
        };
      case "analysis_failed":
        return {
          label: "Failed",
          variant: "error",
        };
      default:
        return {
          label: "Uploaded",
          variant: "info",
        };
    }
  };

  const fileColor = getFileColor();
  const statusInfo = getStatusInfo();

  // Compact view
  if (compact) {
    return (
      <Card
        variant="outlined"
        onPress={onPress}
        style={[styles.compactCard, style]}
        {...props}
      >
        <View style={styles.compactContent}>
          {/* Icon */}
          <View
            style={[styles.compactIcon, { backgroundColor: `${fileColor}15` }]}
          >
            <Text style={{ fontSize: 20 }}>{getFileIcon()}</Text>
          </View>

          {/* Details */}
          <View style={styles.compactDetails}>
            <Text
              variant="subtitle2"
              numberOfLines={1}
              style={styles.compactTitle}
            >
              {document.name || "Untitled Document"}
            </Text>

            <View style={styles.compactMeta}>
              <Badge
                label={getFileType()}
                variant="primary"
                size="small"
                style={styles.compactBadge}
              />

              <Text variant="caption" color={theme.colors.textSecondary}>
                {formatDate(document.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  }
  const { theme } = useTheme();
  // Full view
  return (
    <Card onPress={onPress} style={[styles.card, style]} {...props}>
      <View style={styles.content}>
        {/* Left side - Icon or Image */}
        {document.type?.includes("image") && document.downloadUrl ? (
          <Image
            source={{ uri: document.downloadUrl }}
            style={styles.documentImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${fileColor}15` },
            ]}
          >
            <Text style={{ fontSize: 32 }}>{getFileIcon()}</Text>
          </View>
        )}

        {/* Middle - Document Details */}
        <View style={styles.details}>
          <Text
            variant="subtitle1"
            numberOfLines={1}
            style={[styles.title, { color: theme.colors.text }]}
          >
            {document.name || "Untitled Document"}
          </Text>

          <View style={styles.metaData}>
            <Badge
              label={getFileType()}
              variant="primary"
              size="small"
              style={styles.badge}
            />

            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.metaText}
            >
              {formatFileSize(document.size)} • {formatDate(document.createdAt)}
            </Text>
          </View>

          {/* Status Badge */}
          {document.status && (
            <Badge
              label={statusInfo.label}
              variant={statusInfo.variant}
              size="small"
              style={styles.statusBadge}
            />
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  documentImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  metaData: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  badge: {
    marginRight: 8,
  },
  metaText: {
    marginRight: 8,
  },
  statusBadge: {
    marginTop: 4,
  },

  // Compact styles
  compactCard: {
    marginVertical: 4,
    padding: 12,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  compactDetails: {
    flex: 1,
  },
  compactTitle: {
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactBadge: {
    marginRight: 8,
  },
});

export default DocumentItem;
