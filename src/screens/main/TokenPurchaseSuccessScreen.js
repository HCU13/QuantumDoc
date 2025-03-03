import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export const TokenPurchaseSuccessScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { tokenAmount = 50 } = route.params || {};
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate("Documents");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.closeButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.successIcon,
            {
              backgroundColor: theme.colors.success + "15",
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={64}
            color={theme.colors.success}
          />
        </Animated.View>

        <Text variant="h1" style={[styles.title, { color: theme.colors.text }]}>
          Purchase Successful!
        </Text>

        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {tokenAmount} tokens have been added to your account
        </Text>

        <View
          style={[styles.tokenCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.tokenInfo}>
            <View
              style={[
                styles.tokenIcon,
                { backgroundColor: theme.colors.warning + "15" },
              ]}
            >
              <Ionicons name="flash" size={24} color={theme.colors.warning} />
            </View>
            <View>
              <Text style={[styles.tokenCount, { color: theme.colors.text }]}>
                {tokenAmount} Tokens
              </Text>
              <Text
                style={[
                  styles.tokenStatus,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Available for use
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresGrid}>
          <View
            style={[
              styles.featureCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name="document-text"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
              Document Analysis
            </Text>
          </View>

          <View
            style={[
              styles.featureCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.colors.secondary + "15" },
              ]}
            >
              <Ionicons
                name="chatbubbles"
                size={24}
                color={theme.colors.secondary}
              />
            </View>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
              AI Q&A
            </Text>
          </View>
        </View>
      </View>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <Button
          title="Start Using Tokens"
          onPress={handleContinue}
          theme={theme}
          style={styles.continueButton}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  tokenCard: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenCount: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  tokenStatus: {
    fontSize: 14,
  },
  featuresGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    padding: 16,
    paddingTop: 0,
  },
  continueButton: {
    height: 56,
  },
});
