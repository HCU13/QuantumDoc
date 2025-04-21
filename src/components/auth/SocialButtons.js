import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";

const SocialButton = ({ icon, color, onPress, text }) => {
  const { colors, shadows, isDark } = useTheme();

  const styles = StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: SIZES.radius,
      marginVertical: 6,
      backgroundColor: isDark ? colors.gray : colors.white,
      ...shadows.light,
    },
    icon: {
      marginRight: 10,
    },
    text: {
      ...FONTS.body4,
      color: colors.textPrimary,
    },
  });

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {icon}
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const SocialButtons = ({ containerStyle }) => {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: SIZES.padding,
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? colors.gray : colors.lightGray,
    },
    dividerText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      paddingHorizontal: 10,
    },
    buttonsContainer: {
      width: "100%",
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Şununla devam et</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.buttonsContainer}>
        <SocialButton
          icon={
            <FontAwesome
              name="google"
              size={20}
              color="#DB4437"
              style={styles.icon}
            />
          }
          text="Google ile devam et"
          onPress={() => console.log("Google Sign In")}
        />

        <SocialButton
          icon={
            <FontAwesome
              name="apple"
              size={20}
              color={isDark ? colors.white : colors.black}
              style={styles.icon}
            />
          }
          text="Apple ile devam et"
          onPress={() => console.log("Apple Sign In")}
        />

        <SocialButton
          icon={
            <FontAwesome
              name="facebook"
              size={20}
              color="#3b5998"
              style={styles.icon}
            />
          }
          text="Facebook ile devam et"
          onPress={() => console.log("Facebook Sign In")}
        />
      </View>
    </View>
  );
};

export default SocialButtons;
