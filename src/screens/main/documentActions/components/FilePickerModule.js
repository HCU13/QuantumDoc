import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Text, Card } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const FilePickerModule = ({ onPress }) => {
  const { theme, isDark } = useTheme();

  // Supported file types
  const fileTypes = [
    { extension: "PDF", icon: "document-text", color: theme.colors.error },
    { extension: "DOC", icon: "document", color: theme.colors.primary },
    { extension: "JPG", icon: "image", color: theme.colors.info },
    {
      extension: "TXT",
      icon: "document-text-outline",
      color: theme.colors.textSecondary,
    },
  ];

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={
          isDark
            ? [theme.colors.card, theme.colors.card]
            : ["#FFFFFF", "#F9FAFB"]
        }
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <TouchableOpacity style={styles.mainButton} onPress={onPress}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Ionicons name="cloud-upload" size={32} color="#FFFFFF" />
              <Text variant="h3" color="#FFFFFF" style={styles.buttonText}>
                Upload File
              </Text>
              <Text
                variant="body2"
                color="rgba(255, 255, 255, 0.8)"
                style={styles.buttonSubtext}
              >
                Select from your files
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.fileTypesContainer}>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.fileTypesLabel}
            >
              Supported formats:
            </Text>

            <View style={styles.fileTypesList}>
              {fileTypes.map((type, index) => (
                <View key={index} style={styles.fileTypeItem}>
                  <View
                    style={[
                      styles.fileTypeIcon,
                      { backgroundColor: type.color + "15" },
                    ]}
                  >
                    <Ionicons name={type.icon} size={16} color={type.color} />
                  </View>
                  <Text variant="caption" style={styles.fileTypeText}>
                    {type.extension}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Text
            variant="caption"
            color={theme.colors.textTertiary}
            style={styles.sizeLimit}
          >
            Maximum file size: 10MB
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardGradient: {
    width: "100%",
  },
  cardContent: {
    padding: 20,
    alignItems: "center",
  },
  mainButton: {
    width: "100%",
    height: 130,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  buttonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonText: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "600",
  },
  buttonSubtext: {
    textAlign: "center",
  },
  fileTypesContainer: {
    width: "100%",
    marginTop: 8,
  },
  fileTypesLabel: {
    marginBottom: 8,
    textAlign: "center",
  },
  fileTypesList: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  fileTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 8,
  },
  fileTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  fileTypeText: {
    fontWeight: "500",
  },
  sizeLimit: {
    marginTop: 16,
    textAlign: "center",
  },
});

export default FilePickerModule;
