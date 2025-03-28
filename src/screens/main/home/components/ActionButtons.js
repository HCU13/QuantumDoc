import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Card, Text } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const ActionButtons = ({ onUploadPress, onScanPress }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="subtitle1" style={styles.title}>
        Actions
      </Text>

      <View style={styles.actionsRow}>
        {/* Upload Document Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onUploadPress}>
          <Card
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? theme.colors.card : "#FFFFFF",
                shadowOpacity: isDark ? 0.1 : 0.1,
              },
            ]}
          >
            <LinearGradient
              colors={["#5B5FEF20", "#5B5FEF10"]}
              style={styles.gradientBg}
            />
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Ionicons
                name="cloud-upload"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text variant="body1" weight="medium" style={styles.actionText}>
              Upload Document
            </Text>
          </Card>
        </TouchableOpacity>

        {/* Scan Document Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onScanPress}>
          <Card
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? theme.colors.card : "#FFFFFF",
                shadowOpacity: isDark ? 0.1 : 0.1,
              },
            ]}
          >
            <LinearGradient
              colors={["#61DAFB20", "#61DAFB10"]}
              style={styles.gradientBg}
            />
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.secondary + "20" },
              ]}
            >
              <Ionicons name="scan" size={24} color={theme.colors.secondary} />
            </View>
            <Text variant="body1" weight="medium" style={styles.actionText}>
              Scan Document
            </Text>
          </Card>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionCard: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    textAlign: "center",
  },
});

export default ActionButtons;
