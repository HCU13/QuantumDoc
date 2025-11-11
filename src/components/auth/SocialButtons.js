import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";

const SocialButtons = ({ onGooglePress, onApplePress, onFacebookPress }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.divider} />
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onGooglePress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Google ile giriş yap"
        >
          <FontAwesome name="google" size={24} color="#EA4335" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onFacebookPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Facebook ile giriş yap"
        >
          <FontAwesome name="facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onApplePress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Apple ile giriş yap"
        >
          <FontAwesome name="apple" size={24} color={isDark ? colors.white : colors.black} />
        </TouchableOpacity>
      </View>
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
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default SocialButtons;