import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import TokenDisplay from "../common/TokenDisplay";

const HomeHeader = ({
  username = "Human",
  onProfilePress,
  onSettingsPress,
}) => {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SIZES.padding,
      paddingVertical: SIZES.padding * 0.7,
    },
    leftContainer: {
      flex: 1,
    },
    greeting: {
      ...FONTS.body4,
      color: colors.textOnGradient,
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
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.gray : colors.white,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
      overflow: "hidden",
    },
    profileImage: {
      width: "100%",
      height: "100%",
      borderRadius: 20,
    },
    tokenDisplay: {
      marginLeft: 10,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.greeting}>Merhaba,</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        <TokenDisplay
          size="small"
          onPress={() => navigation.navigate("Tokens")}
          containerStyle={styles.tokenDisplay}
        />

        <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={22} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          {/* Kullanıcı profil resmi */}
          <Image
            source={{ uri: "https://i.pravatar.cc/300" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
