import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import ActivityItem from "../common/ActivityItem";

const RecentActivity = ({
  data,
  chatData = [],
  onItemPress,
  onSeeAllPress,
  onNavigate,
  containerStyle,
  showSeeAll = true,
  maxItems = 3,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: SPACING.md,
      marginVertical: SPACING.xs,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    title: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textOnGradient,
      fontWeight: 'bold',
    },
    seeAllText: {
      ...TEXT_STYLES.labelMedium,
      color: colors.primary,
      fontWeight: '600',
    },
    listContainer: {
      width: "100%",
    },
    emptyContainer: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      alignItems: "center",
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    emptyIcon: {
      marginBottom: SPACING.sm,
    },
    emptyText: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
      textAlign: "center",
    },
    chatSection: {
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
      fontWeight: '600',
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.sm,
      marginBottom: SPACING.xs,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    chatIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    chatInfo: {
      flex: 1,
    },
    chatTitle: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: 2,
    },
    chatMessage: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
    },
    chatTime: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textTertiary,
      fontSize: 10,
    },
  });

  // Maksimum öğe sayısına göre veri filtreleme
  const displayData = data.slice(0, maxItems);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t("home.recentActivity")}</Text>

        {showSeeAll && data.length > 0 && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>{t("home.seeAll")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listContainer}>
        {data.length > 0 ? (
          displayData.map((item) => (
            <ActivityItem key={item.id} item={item} onPress={undefined} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="time-outline" 
              size={48} 
              color={colors.textSecondary} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>{t("home.noActivity")}</Text>
          </View>
        )}
      </View>

      {/* Activity Detail Modal - Devre dışı bırakıldı */}
    </View>
  );
};

export default RecentActivity;
