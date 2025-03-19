import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const HomeHeader = ({ user, tokens, onTokenPress }) => {
  const { theme, isDark } = useTheme();

  // Get user's first name
  const getFirstName = () => {
    if (!user || !user.displayName) return "there";
    return user.displayName.split(" ")[0];
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? [theme.colors.primary + "80", theme.colors.background]
          : [theme.colors.primary, theme.colors.primary + "90"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.headerGradient}
    >
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop:
              Platform.OS === "android" ? StatusBar.currentHeight + 20 : 50,
          },
        ]}
      >
        {/* Greeting & App Title */}
        <View style={styles.headerTitleSection}>
          <Text variant="h3" color="#FFFFFF" style={styles.logoText}>
            QuantumDoc
          </Text>
          <Text
            variant="body2"
            color="rgba(255, 255, 255, 0.9)"
            style={styles.greeting}
          >
            Hello, {getFirstName()}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.headerActions}>
          {/* Token Button */}
          <TouchableOpacity style={styles.tokenButton} onPress={onTokenPress}>
            <View style={styles.tokenBadge}>
              <Ionicons name="key" size={14} color="#FFFFFF" />
              <Text style={styles.tokenText} color="#FFFFFF">
                {tokens || 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Wave Pattern (optional) */}
      <View style={styles.wave}>
        <View
          style={[
            styles.wavePattern,
            { backgroundColor: theme.colors.background },
          ]}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingBottom: 30,

  },
  headerContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleSection: {
    flex: 1,
  },
  logoText: {
    fontWeight: "700",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  greeting: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenButton: {
    padding: 4,
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  tokenText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  wave: {
    height: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  wavePattern: {
    height: 40,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    bottom: -20,
  },
});

export default HomeHeader;
