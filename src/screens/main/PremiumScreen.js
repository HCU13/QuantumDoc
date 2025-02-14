import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const FEATURES = [
  {
    id: "1",
    title: "Unlimited Documents",
    description: "Scan and analyze as many documents as you want",
    icon: "infinite",
  },
  {
    id: "2",
    title: "AI-Powered Analysis",
    description: "Get detailed insights with advanced AI analysis",
    icon: "brain",
  },
  {
    id: "3",
    title: "Priority Processing",
    description: "Get faster processing times for your documents",
    icon: "flash",
  },
  {
    id: "4",
    title: "Export & Share",
    description: "Export to multiple formats and share easily",
    icon: "share-social",
  },
];

const MOCK_PACKAGES = [
  {
    id: "monthly",
    title: "Monthly",
    price: "$9.99",
    description: "Billed monthly",
    popular: false,
  },
  {
    id: "yearly",
    title: "Yearly",
    price: "$79.99",
    description: "Billed annually • Save 33%",
    popular: true,
  },
];

export const PremiumScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedPackage, setSelectedPackage] = useState(MOCK_PACKAGES[1]);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // Simüle edilmiş satın alma işlemi
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigation.goBack();
    } catch (error) {
      console.log("Purchase error:", error);
    } finally {
      setPurchasing(false);
    }
  };

  const renderFeature = (feature) => (
    <View
      key={feature.id}
      style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}
    >
      <View
        style={[
          styles.featureIcon,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons name={feature.icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
          {feature.title}
        </Text>
        <Text
          style={[
            styles.featureDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          {feature.description}
        </Text>
      </View>
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
              : theme.colors.border,
        },
      ]}
      onPress={() => setSelectedPackage(pkg)}
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
        <Text style={[styles.packageTitle, { color: theme.colors.text }]}>
          {pkg.title}
        </Text>
        <Text style={[styles.packagePrice, { color: theme.colors.primary }]}>
          {pkg.price}
        </Text>
      </View>
      <Text
        style={[
          styles.packageDescription,
          { color: theme.colors.textSecondary },
        ]}
      >
        {pkg.description}
      </Text>
      {selectedPackage?.id === pkg.id && (
        <View
          style={[
            styles.selectedBadge,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleSection}>
            <Text
              variant="h1"
              style={[styles.title, { color: theme.colors.text }]}
            >
              Upgrade to Premium
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Unlock all features and get the most out of your documents
            </Text>
          </View>

          <View style={styles.featuresSection}>
            {FEATURES.map(renderFeature)}
          </View>

          <View style={styles.packagesSection}>
            <Text
              variant="h2"
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              Choose Your Plan
            </Text>
            <View style={styles.packagesList}>
              {MOCK_PACKAGES.map(renderPackage)}
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={["bottom"]}>
          <View style={styles.footer}>
            <Button
              title={purchasing ? "Processing..." : "Upgrade Now"}
              onPress={handlePurchase}
              disabled={!selectedPackage || purchasing}
              loading={purchasing}
              theme={theme}
              style={styles.upgradeButton}
            />
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
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
    maxWidth: "80%",
  },
  featuresSection: {
    marginBottom: 32,
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
  },
  packagesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  packagesList: {
    gap: 16,
  },
  packageCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: "700",
  },
  packageDescription: {
    fontSize: 14,
  },
  selectedBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    paddingTop: 0,
  },
  upgradeButton: {
    height: 56,
  },
});
