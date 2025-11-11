import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  SIZES,
  FONTS,
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
} from "../../constants/theme";
import ProfileImage from "../common/ProfileImage";
import useTheme from "../../hooks/useTheme";

const HomeHeader = ({
  onProfilePress,
  onSettingsPress,
  navigation,
  showProfileImage = true,
  title,
  subtitle,
  user,
  rightButton,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      paddingTop: SPACING.sm,
    },
    leftContainer: {
      flex: 1,
    },
    greeting: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textOnGradient,
      marginBottom: SPACING.xs,
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    username: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textOnGradient,
    },
    rightContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.round,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {title ? (
          <>
            <Text style={styles.username}>{title}</Text>
            {subtitle && <Text style={styles.greeting}>{subtitle}</Text>}
          </>
        ) : (
          <>
            <View style={styles.nameContainer}>
              <Text style={styles.greeting}>👋 {t("home.header.welcome")}</Text>
            </View>
            <Text style={styles.username}>{t("home.header.discover")}</Text>
          </>
        )}
      </View>

      <View style={styles.rightContainer}>
        {/* <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={22} color={colors.primary} />
        </TouchableOpacity> */}

        {rightButton}

        {showProfileImage && (
          <TouchableOpacity style={styles.profileButton} activeOpacity={1}>
            <ProfileImage user={user} size={40} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HomeHeader;
