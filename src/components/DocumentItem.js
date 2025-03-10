// src/components/DocumentItem.js
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Card } from "./Card";
import { useTheme } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Modern DocumentItem component for document listings
 *
 * @param {Object} document - Document object
 * @param {function} onPress - Press handler
 * @param {Object} style - Custom style properties
 * @param {boolean} compact - Whether to use compact mode
 * @param {boolean} showAnalysisTag - Whether to show analysis tag
 */
export const DocumentItem = ({
  document,
  onPress,
  style,
  compact = false,
  showAnalysisTag = true,
}) => {
  const { theme, isDark } = useTheme();
  const pressAnim = React.useRef(new Animated.Value(0)).current;

  // Handle press animations
  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const scaleInterpolation = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  // Get document icon based on type
  const getDocumentIcon = () => {
    const type = document.type?.toLowerCase() || "";
    const name = document.name?.toLowerCase() || "";

    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";
    if (name.includes("invoice") || name.includes("receipt")) return "receipt";
    if (name.includes("report")) return "analytics";
    if (name.includes("presentation") || name.includes("slide")) return "easel";
    if (name.includes("spreadsheet") || name.includes("excel")) return "grid";

    return "document-outline";
  };

  // Get icon background color based on document type
  const getIconColor = () => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) {
      return {
        icon: "#F87171",
        bg: "#F8717130",
      };
    }
    if (type.includes("image")) {
      return {
        icon: "#60A5FA",
        bg: "#60A5FA30",
      };
    }
    if (type.includes("word") || type.includes("doc")) {
      return {
        icon: "#818CF8",
        bg: "#818CF830",
      };
    }
    if (type.includes("excel") || type.includes("spreadsheet")) {
      return {
        icon: "#34D399",
        bg: "#34D39930",
      };
    }

    return {
      icon: theme.colors.primary,
      bg: `${theme.colors.primary}30`,
    };
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

    // Today or recent dates
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    // Older dates
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  };

  const iconColors = getIconColor();

  // Determine document status color and text
  const getStatusInfo = () => {
    switch (document.status) {
      case "analyzed":
        return {
          color: theme.colors.success,
          text: "Analyzed",
          icon: "checkmark-circle",
          bg: `${theme.colors.success}20`,
        };
      case "analyzing":
        return {
          color: theme.colors.warning,
          text: "Analyzing",
          icon: "time",
          bg: `${theme.colors.warning}20`,
        };
      case "analysis_failed":
        return {
          color: theme.colors.error,
          text: "Failed",
          icon: "alert-circle",
          bg: `${theme.colors.error}20`,
        };
      default:
        return {
          color: theme.colors.info,
          text: "Uploaded",
          icon: "cloud-done",
          bg: `${theme.colors.info}20`,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          styles.itemContainer,
          { transform: [{ scale: scaleInterpolation }] },
        ]}
      >
        <Card
          style={[
            styles.card,
            {
              padding: compact ? 12 : 16,
              backgroundColor: theme.colors.card,
            },
          ]}
          elevated={false}
        >
          <View style={styles.content}>
            {/* Document icon */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: iconColors.bg,
                  width: compact ? 40 : 48,
                  height: compact ? 40 : 48,
                },
              ]}
            >
              <Ionicons
                name={getDocumentIcon()}
                size={compact ? 20 : 24}
                color={iconColors.icon}
              />
            </View>

            {/* Document details */}
            <View style={styles.details}>
              <Text
                variant={compact ? "subtitle1" : "subtitle1"}
                style={styles.title}
                numberOfLines={1}
              >
                {document.name || "Untitled Document"}
              </Text>

              <View style={styles.metadataContainer}>
                {/* File type pill */}
                <View
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: isDark
                        ? theme.colors.surface
                        : theme.colors.border + "40",
                    },
                  ]}
                >
                  <Text variant="caption" style={styles.typeText}>
                    {document.type?.split("/")[1]?.toUpperCase() || "DOC"}
                  </Text>
                </View>

                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={styles.metadata}
                >
                  {formatFileSize(document.size)} •{" "}
                  {formatDate(document.createdAt)}
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={compact ? 18 : 20}
              color={theme.colors.textSecondary}
            />
          </View>

          {/* Status badge */}
          {showAnalysisTag && document.status && (
            <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
              <Ionicons
                name={statusInfo.icon}
                size={12}
                color={statusInfo.color}
                style={styles.badgeIcon}
              />
              <Text
                variant="caption"
                style={[styles.badgeText, { color: statusInfo.color }]}
              >
                {statusInfo.text}
              </Text>
            </View>
          )}
        </Card>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  itemContainer: {
    overflow: "hidden",
  },
  card: {
    overflow: "hidden",
    borderRadius: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  metadata: {
    fontSize: 12,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
