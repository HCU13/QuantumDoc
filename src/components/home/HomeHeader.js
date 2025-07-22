import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SIZES, FONTS } from "../../constants/theme";
import TokenDisplay from "../common/TokenDisplay";
import ProfileImage from "../common/ProfileImage";
import useTheme from "../../hooks/useTheme";

const HomeHeader = ({ onProfilePress, onSettingsPress, navigation, showProfileImage = true, title, subtitle }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
      paddingVertical: 15,
    },
    leftContainer: {
      flex: 1,
    },
    greeting: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      marginBottom: 2,
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    username: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
    rightContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    tokenDisplay: {
      marginRight: 15,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {title ? (
          <>
            <Text style={styles.username}>{title}</Text>
            {subtitle && (
              <Text style={styles.greeting}>{subtitle}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.greeting}>{t("home.greeting")},</Text>
            <View style={styles.nameContainer}>
              <Text style={styles.username}>
                {/* {user?.name || user?.firstName || "Kullanıcı"} */}
                Kullanıcı
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.rightContainer}>
        <TokenDisplay
          size="small"
          onPress={() => navigation.navigate("Tokens")}
          containerStyle={styles.tokenDisplay}
        />

        {/* <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={22} color={colors.primary} />
        </TouchableOpacity> */}

        {showProfileImage && (
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <ProfileImage user={null} size={40} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HomeHeader;
