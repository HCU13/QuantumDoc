import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";

const SocialButtons = ({ onGooglePress, onApplePress }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.divider} />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={onGooglePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Google ile giriş yap"
      >
        <View style={styles.iconContainer}>
          <FontAwesome name="google" size={22} color="#EA4335" />
        </View>
        <Text style={styles.text}>Google ile Giriş Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={onApplePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Apple ile giriş yap"
      >
        <View style={styles.iconContainer}>
          <FontAwesome name="apple" size={22} color={isDark ? colors.white : colors.black} />
        </View>
        <Text style={styles.text}>Apple ile Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 13,
    color: "#888",
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});

export default SocialButtons;