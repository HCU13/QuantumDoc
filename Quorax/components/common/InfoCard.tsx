import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from "@/constants/theme";

interface InfoCardProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
  modulePrimary?: string; // Modül primary rengi
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  content,
  defaultExpanded = false,
  modulePrimary,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const primaryColor = modulePrimary || colors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name="information-circle"
            size={20}
            color={primaryColor}
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <Text style={[styles.contentText, { color: colors.textSecondary }]}>
            {content}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  contentText: {
    ...TEXT_STYLES.bodySmall,
    lineHeight: 20,
  },
});

