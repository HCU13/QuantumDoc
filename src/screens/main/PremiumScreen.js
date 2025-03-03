// PremiumScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PACKAGES = [
  {
    id: "starter",
    title: "Starter Pack",
    tokens: 50,
    price: 4.99,
    description: "Perfect for getting started",
    features: [
      "50 AI Analysis Tokens",
      "Basic Document Analysis",
      "Export to PDF",
      "30 Days Validity",
    ],
    popular: false,
  },
  {
    id: "pro",
    title: "Pro Pack",
    tokens: 200,
    price: 14.99,
    description: "Most Popular Choice",
    features: [
      "200 AI Analysis Tokens",
      "Advanced Document Analysis",
      "Priority Processing",
      "Export to Multiple Formats",
      "60 Days Validity",
    ],
    popular: true,
  },
  {
    id: "unlimited",
    title: "Power User",
    tokens: 500,
    price: 29.99,
    description: "Best value for power users",
    features: [
      "500 AI Analysis Tokens",
      "Premium Document Analysis",
      "Instant Processing",
      "Unlimited Exports",
      "90 Days Validity",
      "Premium Support",
    ],
    popular: false,
  },
];

export const PremiumScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // Burada ödeme işlemi gerçekleşecek
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigation.replace("TokenPurchaseSuccess", {
        tokenAmount: selectedPackage.tokens,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to complete purchase. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderTitle = () => (
    <View style={styles.titleSection}>
      <View
        style={[styles.titleIcon, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="flash" size={32} color="white" />
      </View>
      <Text variant="h1" style={[styles.title, { color: theme.colors.text }]}>
        Get More Tokens
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Choose the package that suits your needs
      </Text>
    </View>
  );

  const renderPackage = (pkg) => (
    <TouchableOpacity
      key={pkg.id}
      style={[
        styles.packageCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor:
            selectedPackage?.id === pkg.id
              ? theme.colors.primary
              : "transparent",
        },
      ]}
      onPress={() => {
        setSelectedPackage(pkg);
        navigation.navigate("TokenPurchaseSuccess", {
          tokenAmount: pkg.tokens,
        });
      }}
    >
      {pkg.popular && (
        <View
          style={[
            styles.popularBadge,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.popularText} color="white">
            Most Popular
          </Text>
        </View>
      )}

      <View style={styles.packageHeader}>
        <View>
          <Text style={[styles.packageTitle, { color: theme.colors.text }]}>
            {pkg.title}
          </Text>
          <Text
            style={[
              styles.packageDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {pkg.description}
          </Text>
        </View>
        <View
          style={[
            styles.tokenBadge,
            { backgroundColor: theme.colors.warning + "20" },
          ]}
        >
          <Ionicons name="flash" size={16} color={theme.colors.warning} />
          <Text style={[styles.tokenCount, { color: theme.colors.warning }]}>
            {pkg.tokens}
          </Text>
        </View>
      </View>

      <View style={styles.featuresList}>
        {pkg.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.success}
            />
            <Text style={[styles.featureText, { color: theme.colors.text }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.priceText, { color: theme.colors.primary }]}>
        ${pkg.price}
      </Text>
    </TouchableOpacity>
  );

  const renderFeatures = () => (
    <View style={styles.featuresSection}>
      <Text
        variant="h2"
        style={[styles.featuresTitle, { color: theme.colors.text }]}
      >
        Why Choose DocAI?
      </Text>

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
            <Ionicons name="flash" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>
            Fast Processing
          </Text>
          <Text
            style={[
              styles.featureCardDesc,
              { color: theme.colors.textSecondary },
            ]}
          >
            Get instant document analysis
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
              { backgroundColor: theme.colors.success + "15" },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={theme.colors.success}
            />
          </View>
          <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>
            High Accuracy
          </Text>
          <Text
            style={[
              styles.featureCardDesc,
              { color: theme.colors.textSecondary },
            ]}
          >
            98% accuracy rate
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
              { backgroundColor: theme.colors.warning + "15" },
            ]}
          >
            <Ionicons name="key" size={24} color={theme.colors.warning} />
          </View>
          <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>
            Secure
          </Text>
          <Text
            style={[
              styles.featureCardDesc,
              { color: theme.colors.textSecondary },
            ]}
          >
            End-to-end encryption
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
              { backgroundColor: theme.colors.info + "15" },
            ]}
          >
            <Ionicons name="cloud-done" size={24} color={theme.colors.info} />
          </View>
          <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>
            Cloud Sync
          </Text>
          <Text
            style={[
              styles.featureCardDesc,
              { color: theme.colors.textSecondary },
            ]}
          >
            Access anywhere
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderTitle()}
        {PACKAGES.map(renderPackage)}
        {renderFeatures()}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <LinearGradient
          colors={[
            "transparent",
            theme.isDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
          ]}
          style={styles.footerGradient}
        >
          <View style={styles.footerContent}>
            <Button
              title={
                purchasing
                  ? "Processing..."
                  : `Buy Now • $${selectedPackage?.price}`
              }
              onPress={handlePurchase}
              disabled={!selectedPackage || purchasing}
              loading={purchasing}
              theme={theme}
              style={styles.purchaseButton}
            />
          </View>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  titleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  packageCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "600",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tokenCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  featuresList: {
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "right",
  },
  featuresSection: {
    marginTop: 32,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  featureCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  featureCardDesc: {
    fontSize: 12,
    textAlign: "center",
  },
  footer: {
    backgroundColor: "transparent",
  },
  footerGradient: {
    paddingTop: 20,
  },
  footerContent: {
    padding: 20,
    paddingTop: 0,
  },
  purchaseButton: {
    height: 56,
  },
});
