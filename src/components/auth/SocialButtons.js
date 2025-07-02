import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import { useTranslation } from "react-i18next";

const SocialButton = ({ icon, onPress, text }) => {
  const { colors, shadows, isDark } = useTheme();

  const styles = StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: SIZES.radius * 1.5,
      marginVertical: 8,
      backgroundColor: isDark ? colors.gray : colors.card,
      ...shadows.light,
    },
    icon: {
      marginRight: 10,
    },
    text: {
      ...FONTS.body4,
      color: colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {icon}
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const SocialButtonsScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
      justifyContent: "center",
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? colors.gray : colors.lightGray,
    },
    dividerText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      paddingHorizontal: 10,
    },
    buttonsContainer: {
      width: "100%",
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{t("auth.continueWith")}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.buttonsContainer}>
          <SocialButton
            icon={
              <FontAwesome
                name="google"
                size={20}
                color={colors.secondary}
                style={{ marginRight: 10 }}
              />
            }
            text={t("auth.continueWithGoogle")}
            onPress={() => console.log("Google Sign In")}
          />

          <SocialButton
            icon={
              <FontAwesome
                name="apple"
                size={20}
                color={isDark ? colors.white : colors.black}
                style={{ marginRight: 10 }}
              />
            }
            text={t("auth.continueWithApple")}
            onPress={() => console.log("Apple Sign In")}
          />

          <SocialButton
            icon={
              <FontAwesome
                name="facebook"
                size={20}
                color={colors.primary}
                style={{ marginRight: 10 }}
              />
            }
            text={t("auth.continueWithFacebook")}
            onPress={() => console.log("Facebook Sign In")}
          />
        </View>
      </View>
    </>
  );
};

export default SocialButtonsScreen;