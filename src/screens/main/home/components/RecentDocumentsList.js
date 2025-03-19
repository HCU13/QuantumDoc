import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Card } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const RecentDocumentsList = ({
  documents,
  onSelectDocument,
  onSeeAllPress,
}) => {
  const { theme, isDark } = useTheme();

  // Skip if no documents
  if (!documents || documents.length === 0) {
    return null;
  }

  // Format date (e.g., "Today", "Yesterday", or date)
  const formatDate = (date) => {
    if (!date) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const documentDate = new Date(date);
    const documentDay = new Date(
      documentDate.getFullYear(),
      documentDate.getMonth(),
      documentDate.getDate()
    );

    if (documentDay.getTime() === today.getTime()) {
      return "Today";
    } else if (documentDay.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return documentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get icon based on file type
  const getFileIcon = (type) => {
    if (!type) return "document-outline";

    const fileType = type.toLowerCase();
    if (fileType.includes("pdf")) return "document-text";
    if (fileType.includes("image")) return "image";
    if (fileType.includes("word") || fileType.includes("doc"))
      return "document";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "grid";

    return "document-outline";
  };

  // Get color based on file type
  const getFileColor = (type) => {
    if (!type) return theme.colors.primary;

    const fileType = type.toLowerCase();
    if (fileType.includes("pdf")) return theme.colors.error;
    if (fileType.includes("image")) return theme.colors.info;
    if (fileType.includes("word") || fileType.includes("doc"))
      return theme.colors.primary;
    if (fileType.includes("sheet") || fileType.includes("excel"))
      return theme.colors.success;

    return theme.colors.secondary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="h3" style={styles.title}>
          Recent Documents
        </Text>
        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
          <Text variant="body2" color={theme.colors.primary}>
            See All
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {documents.map((document) => (
          <TouchableOpacity
            key={document.id}
            style={styles.documentItem}
            onPress={() => onSelectDocument(document)}
          >
            <Card
              style={[
                styles.documentCard,
                { backgroundColor: isDark ? theme.colors.card : "#FFFFFF" },
              ]}
            >
              {/* Document Preview/Icon */}
              {document.type?.includes("image") && document.downloadUrl ? (
                <Image
                  source={{ uri: document.downloadUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.documentIcon,
                    { backgroundColor: getFileColor(document.type) + "15" },
                  ]}
                >
                  <Ionicons
                    name={getFileIcon(document.type)}
                    size={28}
                    color={getFileColor(document.type)}
                  />
                </View>
              )}

              {/* Document Info */}
              <View style={styles.documentInfo}>
                <Text
                  variant="subtitle2"
                  style={styles.documentName}
                  numberOfLines={1}
                >
                  {document.name}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={styles.documentMeta}
                >
                  {formatDate(document.createdAt)}
                </Text>
              </View>

              {/* Status Indicator */}
              {document.status === "analyzed" && (
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: theme.colors.success },
                  ]}
                />
              )}
            </Card>
          </TouchableOpacity>
        ))}

        {/* "Add New" Card */}
        {/* <TouchableOpacity style={styles.documentItem} onPress={onSeeAllPress}>
          <Card
            style={[
              styles.addNewCard,
              {
                backgroundColor: isDark
                  ? "rgba(91, 95, 239, 0.15)"
                  : "rgba(91, 95, 239, 0.08)",
                borderColor: isDark
                  ? "rgba(91, 95, 239, 0.3)"
                  : "rgba(91, 95, 239, 0.2)",
              },
            ]}
          >
            <View style={styles.addNewContent}>
              <View
                style={[
                  styles.addNewIcon,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Ionicons name="add" size={24} color={theme.colors.primary} />
              </View>
              <Text
                variant="body2"
                color={theme.colors.primary}
                style={styles.addNewText}
              >
                Add New
              </Text>
            </View>
          </Card>
        </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -10,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  documentItem: {
    width: 150,
    marginRight: 12,
  },
  documentCard: {
    padding: 12,
    borderRadius: 16,
    height: 190,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  documentIcon: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  documentInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  documentName: {
    fontSize: 14,
  },
  documentMeta: {
    fontSize: 12,
  },
  statusIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addNewCard: {
    padding: 12,
    borderRadius: 16,
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addNewContent: {
    alignItems: "center",
  },
  addNewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  addNewText: {
    fontWeight: "500",
  },
});

export default RecentDocumentsList;
