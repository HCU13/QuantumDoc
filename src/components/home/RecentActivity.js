import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Card from "../common/Card";
import { useTranslation } from "react-i18next";

const ActivityItem = ({ item, onPress }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "20", // %20 opacity
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      ...FONTS.body3,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      ...FONTS.body5,
      color: colors.textSecondary,
    },
    timeContainer: {
      marginLeft: 10,
    },
    time: {
      ...FONTS.body5,
      color: colors.textTertiary,
    },
    arrowIcon: {
      marginLeft: 5,
    },
  });

  // İkon tipine göre içerik belirleme
  const getIcon = () => {
    switch (item.type) {
      case "chat":
        return (
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors.primary}
          />
        );
      case "math":
        return (
          <Ionicons
            name="calculator-outline"
            size={20}
            color={colors.primary}
          />
        );
      case "note":
        return (
          <Ionicons
            name="document-text-outline"
            size={20}
            color={colors.primary}
          />
        );
      case "translate":
        return (
          <Ionicons name="language-outline" size={20} color={colors.primary} />
        );
      case "task":
        return (
          <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
        );
      default:
        return (
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={colors.primary}
          />
        );
    }
  };

  return (
    <Card shadowType="light" onPress={() => onPress(item)}>
      <View style={styles.itemContainer}>
        <View style={styles.iconContainer}>{getIcon()}</View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.description}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textTertiary}
          style={styles.arrowIcon}
        />
      </View>
    </Card>
  );
};

const RecentActivity = ({
  data,
  onItemPress,
  onSeeAllPress,
  containerStyle,
  showSeeAll = true,
  maxItems = 3,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: SIZES.padding,
      marginVertical: 10,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    title: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
    seeAllText: {
      ...FONTS.body4,
      color: colors.primary,
    },
    listContainer: {
      width: "100%",
    },
    emptyContainer: {
      alignItems: "center",
      padding: SIZES.padding,
    },
    emptyText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      textAlign: "center",
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
            <ActivityItem key={item.id} item={item} onPress={onItemPress} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("home.noActivity")}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecentActivity;
