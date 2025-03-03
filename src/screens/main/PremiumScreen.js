import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Abonelik planları
const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    tokenCount: 50,
    period: "month",
    features: [
      "50 AI tokens/month",
      "Document scanning",
      "Basic AI analysis",
      "Email support",
      "Export to PDF"
    ],
    popular: false,
    savePercent: 0
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    tokenCount: 150,
    period: "month",
    features: [
      "150 AI tokens/month",
      "Priority processing",
      "Advanced AI analysis",
      "Chat with documents",
      "Priority email support",
      "Export to multiple formats",
      "Cloud storage (5GB)"
    ],
    popular: true,
    savePercent: 0
  },
  {
    id: "business",
    name: "Business",
    price: 179.88,
    displayPrice: "14.99",
    tokenCount: 200,
    period: "year",
    features: [
      "200 AI tokens/month",
      "Priority processing",
      "Advanced AI analysis",
      "Chat with documents",
      "Priority email support",
      "Export to multiple formats",
      "Cloud storage (20GB)",
      "Team sharing (up to 3 members)"
    ],
    popular: false,
    savePercent: 25
  }
];

// Token paketleri
const TOKEN_PACKAGES = [
  {
    id: "small",
    title: "Starter Pack",
    tokens: 20,
    price: 4.99,
    description: "Perfect for trying out",
    popular: false
  },
  {
    id: "medium",
    title: "Standard Pack",
    tokens: 100,
    price: 19.99,
    description: "Most popular choice",
    popular: true
  },
  {
    id: "large",
    title: "Power User",
    tokens: 300,
    price: 49.99,
    description: "Best value for power users",
    popular: false
  }
];

export const PremiumScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [purchaseType, setPurchaseType] = useState("subscription"); // "subscription" veya "tokens"
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]); // Default Pro plan
  const [selectedPackage, setSelectedPackage] = useState(TOKEN_PACKAGES[1]); // Default Standard pack
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [purchasing, setPurchasing] = useState(false);

  // İş süreci
  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // Burada ödeme işlemi yapılacak
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Başarılı ödeme sonrası
      if (purchaseType === "subscription") {
        Alert.alert(
          "Subscription Activated",
          `Your ${selectedPlan.name} plan is now active. You have been granted ${selectedPlan.tokenCount} tokens.`,
          [
            {
              text: "Continue",
              onPress: () => navigation.navigate("Home")
            }
          ]
        );
      } else {
        navigation.replace("TokenPurchaseSuccess", {
          tokenAmount: selectedPackage.tokens,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to complete purchase. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  // Başlık render
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

  // Başlık bölümünü render et
  const renderTitle = () => (
    <View style={styles.titleSection}>
      <View
        style={[styles.titleIcon, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="flash" size={32} color="white" />
      </View>
      <Text variant="h1" style={[styles.title, { color: theme.colors.text }]}>
        Upgrade Your Experience
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Choose the plan that suits your document processing needs
      </Text>
    </View>
  );

  // Segment kontrol render (Abonelik/Token seçimi)
  const renderSegmentControl = () => (
    <View style={styles.segmentContainer}>
      <TouchableOpacity
        style={[
          styles.segmentButton,
          purchaseType === "subscription" && [
            styles.segmentButtonActive,
            { backgroundColor: theme.colors.primary }
          ]
        ]}
        onPress={() => setPurchaseType("subscription")}
      >
        <Text
          style={[
            styles.segmentButtonText,
            { color: purchaseType === "subscription" ? "white" : theme.colors.textSecondary }
          ]}
        >
          Subscription
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.segmentButton,
          purchaseType === "tokens" && [
            styles.segmentButtonActive,
            { backgroundColor: theme.colors.primary }
          ]
        ]}
        onPress={() => setPurchaseType("tokens")}
      >
        <Text
          style={[
            styles.segmentButtonText,
            { color: purchaseType === "tokens" ? "white" : theme.colors.textSecondary }
          ]}
        >
          Buy Tokens
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Abonelik frekans seçicisi (aylık/yıllık)
  const renderBillingToggle = () => {
    if (purchaseType !== "subscription") return null;
    
    return (
      <View style={styles.billingToggleContainer}>
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === "monthly" && [
              styles.billingOptionActive,
              { borderColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setBillingPeriod("monthly")}
        >
          <Text
            style={[
              styles.billingOptionText,
              { 
                color: billingPeriod === "monthly" 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary
              }
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === "yearly" && [
              styles.billingOptionActive,
              { borderColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setBillingPeriod("yearly")}
        >
          <View style={styles.yearlyOption}>
            <Text
              style={[
                styles.billingOptionText,
                { 
                  color: billingPeriod === "yearly" 
                    ? theme.colors.primary 
                    : theme.colors.textSecondary
                }
              ]}
            >
              Yearly
            </Text>
            <View
              style={[
                styles.saveBadge,
                { backgroundColor: theme.colors.success }
              ]}
            >
              <Text style={styles.saveText} color="white">
                Save 25%
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Abonelik planları render
  const renderSubscriptionPlans = () => {
    if (purchaseType !== "subscription") return null;
    
    // Hangi abonelik planlarını göstereceğimizi belirle
    const filteredPlans = SUBSCRIPTION_PLANS.filter(plan => {
      if (billingPeriod === "monthly") {
        return plan.period === "month";
      } else {
        return plan.period === "year" || plan.id === "basic"; // Yıllık ve temel planlar
      }
    });
    
    return (
      <View style={styles.subscriptionPlansContainer}>
        {filteredPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: selectedPlan?.id === plan.id
                  ? theme.colors.primary
                  : "transparent",
              },
            ]}
            onPress={() => setSelectedPlan(plan)}
          >
            {plan.popular && (
              <View
                style={[
                  styles.popularBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.popularText} color="white">
                  Popular
                </Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planTitle, { color: theme.colors.text }]}>
                  {plan.name}
                </Text>
                <View style={styles.priceContainer}>
                  <Text
                    style={[styles.currencySymbol, { color: theme.colors.text }]}
                  >
                    $
                  </Text>
                  <Text
                    style={[styles.priceText, { color: theme.colors.primary }]}
                  >
                    {plan.displayPrice || plan.price}
                  </Text>
                  <Text
                    style={[
                      styles.pricePeriod,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    /{plan.period}
                  </Text>
                </View>
                
                {plan.savePercent > 0 && (
                  <View style={styles.savingContainer}>
                    <Text 
                      style={[styles.savingText, { color: theme.colors.success }]}
                    >
                      Save {plan.savePercent}%
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.tokenBadge,
                  { backgroundColor: theme.colors.warning + "20" },
                ]}
              >
                <Ionicons name="flash" size={16} color={theme.colors.warning} />
                <Text style={[styles.tokenText, { color: theme.colors.warning }]}>
                  {plan.tokenCount}
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
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
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Token paketleri render
  const renderTokenPackages = () => {
    if (purchaseType !== "tokens") return null;

    return (
      <View style={styles.tokenPackagesContainer}>
        {TOKEN_PACKAGES.map((pkg) => (
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
                  Popular
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
                <Text style={[styles.tokenText, { color: theme.colors.warning }]}>
                  {pkg.tokens}
                </Text>
              </View>
            </View>

            <View style={styles.tokenPriceContainer}>
              <Text
                style={[styles.currencySymbol, { color: theme.colors.text }]}
              >
                $
              </Text>
              <Text
                style={[styles.tokenPriceText, { color: theme.colors.primary }]}
              >
                {pkg.price.toFixed(2)}
              </Text>
            </View>

            {/* Token başına maliyet hesabı */}
            <Text
              style={[
                styles.tokenUnitPrice,
                { color: theme.colors.textSecondary },
              ]}
            >
              ${(pkg.price / pkg.tokens).toFixed(3)} per token
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Token kullanım alanları
  const renderTokenUsage = () => {
    return (
      <View style={styles.tokenUsageSection}>
        <Text style={[styles.tokenUsageTitle, { color: theme.colors.text }]}>
          What Can You Do With Tokens?
        </Text>
        
        <View style={styles.tokenUsageGrid}>
          <View style={[styles.usageItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.usageIcon, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.usageTitle, { color: theme.colors.text }]}>
              Document Analysis
            </Text>
            <Text style={[styles.usageDescription, { color: theme.colors.textSecondary }]}>
              1 token per document
            </Text>
          </View>
          
          <View style={[styles.usageItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.usageIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
              <Ionicons name="chatbubbles" size={24} color={theme.colors.secondary} />
            </View>
            <Text style={[styles.usageTitle, { color: theme.colors.text }]}>
              AI Chat
            </Text>
            <Text style={[styles.usageDescription, { color: theme.colors.textSecondary }]}>
              1 token per 5 questions
            </Text>
          </View>
          
          <View style={[styles.usageItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.usageIcon, { backgroundColor: theme.colors.warning + '15' }]}>
              <Ionicons name="cloud-download" size={24} color={theme.colors.warning} />
            </View>
            <Text style={[styles.usageTitle, { color: theme.colors.text }]}>
              Export
            </Text>
            <Text style={[styles.usageDescription, { color: theme.colors.textSecondary }]}>
              1 token per 10 exports
            </Text>
          </View>
          
          <View style={[styles.usageItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.usageIcon, { backgroundColor: theme.colors.success + '15' }]}>
              <Ionicons name="folder" size={24} color={theme.colors.success} />
            </View>
            <Text style={[styles.usageTitle, { color: theme.colors.text }]}>
              Storage
            </Text>
            <Text style={[styles.usageDescription, { color: theme.colors.textSecondary }]}>
              Unlimited storage
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
        {renderSegmentControl()}
        {renderBillingToggle()}
        {renderSubscriptionPlans()}
        {renderTokenPackages()}
        {renderTokenUsage()}
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
                  : purchaseType === "subscription"
                  ? `Subscribe • $${selectedPlan?.displayPrice || selectedPlan?.price}/${selectedPlan?.period}`
                  : `Buy Tokens • $${selectedPackage?.price.toFixed(2)}`
              }
              onPress={handlePurchase}
              disabled={purchasing || (!selectedPlan && !selectedPackage)}
              loading={purchasing}
              theme={theme}
              style={styles.purchaseButton}
            />
            <Text style={[styles.secureText, { color: theme.colors.textSecondary }]}>
              <Ionicons name="lock-closed" size={12} color={theme.colors.textSecondary} /> Secure payment via Stripe
            </Text>
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
    paddingBottom: 100,
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  
  // Segment Control
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  segmentButtonText: {
    fontWeight: "600",
  },
  
  // Billing Toggle
  billingToggleContainer: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  billingOptionActive: {
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  billingOptionText: {
    fontWeight: "600",
  },
  yearlyOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  
  // Subscription Plans
  subscriptionPlansContainer: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 28,
    fontWeight: "700",
  },
  pricePeriod: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 2,
  },
  savingContainer: {
    marginTop: 4,
  },
  savingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: "600",
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  
  // Token Packages
  tokenPackagesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  packageCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  tokenPriceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  tokenPriceText: {
    fontSize: 28,
    fontWeight: "700",
  },
  tokenUnitPrice: {
    fontSize: 12,
  },
  
  // Token Usage Section
  tokenUsageSection: {
    marginBottom: 32,
  },
  tokenUsageTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  tokenUsageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  usageItem: {
    width: "47%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  usageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  usageDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  footerGradient: {
    paddingTop: 20,
  },
  footerContent: {
    padding: 20,
    paddingTop: 0,
    alignItems: "center",
  },
  purchaseButton: {
    height: 56,
    width: "100%",
  },
  secureText: {
    fontSize: 12,
    marginTop: 8,
  },
});