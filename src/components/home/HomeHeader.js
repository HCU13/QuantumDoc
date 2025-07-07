import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SIZES, FONTS } from "../../constants/theme";
import TokenDisplay from "../common/TokenDisplay";
import ProfileImage from "../common/ProfileImage";
import { useAuth } from "../../contexts/AuthContext";
import useTheme from "../../hooks/useTheme";

const HomeHeader = ({ onProfilePress, onSettingsPress, navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
        <Text style={styles.greeting}>{t("home.greeting")},</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.username}>
            {user?.name || user?.firstName || "Kullanıcı"}
          </Text>
        </View>
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

        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <ProfileImage user={user} size={40} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
