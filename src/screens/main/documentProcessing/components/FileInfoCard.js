import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Text, Badge } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const FileInfoCard = ({
  file,
  fileInfo,
  getFileTypeIcon,
  getFileTypeColor,
}) => {
  const { theme, isDark } = useTheme();

  // Get file extension from name
  const getFileExtension = () => {
    if (!fileInfo?.name) return "DOC";

    const parts = fileInfo.name.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }

    return "DOC";
  };

  return (
    <Card style={styles.card}>
      <View style={styles.fileHeader}>
        {/* File Preview or Icon */}
        {fileInfo?.type?.includes("image") && file?.uri ? (
          <Image
            source={{ uri: file.uri }}
            style={styles.fileImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.fileIcon,
              { backgroundColor: getFileTypeColor() + "15" },
            ]}
          >
            <Ionicons
              name={getFileTypeIcon()}
              size={32}
              color={getFileTypeColor()}
            />
          </View>
        )}

        {/* File Details */}
        <View style={styles.fileDetails}>
          <Text variant="subtitle1" numberOfLines={1} style={styles.fileName}>
            {fileInfo?.name || "Document File"}
          </Text>

          <View style={styles.fileMetaRow}>
            <Badge
              label={getFileExtension()}
              variant="primary"
              size="small"
              style={styles.fileBadge}
            />

            <Text variant="caption" color={theme.colors.textSecondary}>
              {fileInfo?.size || "Unknown size"}
            </Text>
          </View>
        </View>
      </View>

      {/* File Properties */}
      <View
        style={[styles.fileProperties, { borderTopColor: theme.colors.border }]}
      >
        <View style={styles.propertyItem}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Type
          </Text>
          <Text variant="body2">
            {fileInfo?.type?.split("/").pop().toUpperCase() || "Unknown"}
          </Text>
        </View>

        <View style={styles.propertyItem}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Size
          </Text>
          <Text variant="body2">{fileInfo?.size || "Unknown"}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Pages (Est.)
          </Text>
          <Text variant="body2">{fileInfo?.pages || "1"}</Text>
        </View>

        <View style={styles.propertyItem}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Modified
          </Text>
          <Text variant="body2">{fileInfo?.lastModified || "Unknown"}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  fileIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    marginBottom: 6,
  },
  fileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileBadge: {
    marginRight: 8,
  },
  fileProperties: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  propertyItem: {
    width: "50%",
    marginBottom: 12,
  },
});

export default FileInfoCard;
