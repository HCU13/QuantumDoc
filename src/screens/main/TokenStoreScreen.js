import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text, Card, Button, Badge, Loading } from "../../components";
import AnimatedHeader from "../../components/AnimatedHeader";
import { MotiView } from "moti";
import { TabBarStyleContext } from "../../navigation/MainNavigator";

const { width, height } = Dimensions.get("window");

const TokenStoreScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const {
    tokens,
    subscription,
    loading,
    tokenHistory,
    purchaseTokens,
    refreshBalance,
    refreshSubscription,
    freeTrialUsed,
    TOKEN_COSTS,
  } = useTokens();

  // Initial active tab from route params or default to "packages"
  const initialTab = route.params?.tab || "packages";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [purchasedTokens, setPurchasedTokens] = useState(0);

  // Refs
  const scrollViewRef = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tokenCountAnim = useRef(new Animated.Value(tokens || 0)).current;
  const balanceScaleAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate token balance when it changes
  useEffect(() => {
    Animated.spring(tokenCountAnim, {
      toValue: tokens || 0,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // We're animating a text value
    }).start();

    if (tokens > 0) {
      Animated.sequence([
        Animated.timing(balanceScaleAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(balanceScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [tokens]);

  // Play confetti when purchase completes
  useEffect(() => {
    if (purchaseComplete && transactionSuccess) {
      // After some time, reset states
      const timer = setTimeout(() => {
        setPurchaseComplete(false);
        setTransactionSuccess(false);
        setPurchaseInProgress(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [purchaseComplete, transactionSuccess]);

  // Page loading
  useEffect(() => {
    refreshData();
  }, []);

  // Refresh token data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), refreshSubscription()]);
    setRefreshing(false);
  };

  // Purchase tokens
  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchaseInProgress(true);

      // Get the package details to display purchased amount
      const packageDetails = getPackageDetails(selectedPackage);
      setPurchasedTokens(packageDetails.tokens);

      // Simulate purchase process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await purchaseTokens(selectedPackage);

      // Success animation
      setTransactionSuccess(true);
      setPurchaseComplete(true);
      setSelectedPackage(null);
    } catch (error) {
      console.error("Purchase error:", error);
      setTransactionSuccess(false);
      setPurchaseComplete(true);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);

    // If date is today, show time only
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // If date is yesterday, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Otherwise, show full date
    return `${d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Get package details by ID
  const getPackageDetails = (packageId) => {
    // Package list with details
    const packageList = [
      {
        id: "tokens_20_package",
        title: t("packages.tokens20.title") || "Basic Package",
        description:
          t("packages.tokens20.description") || "20 tokens for occasional use",
        tokens: 20,
        price: "$4.99",
        bestValue: false,
        color: theme.colors.info,
        icon: "key-outline",
      },
      {
        id: "tokens_50_package",
        title: t("packages.tokens50.title") || "Standard Package",
        description:
          t("packages.tokens50.description") || "50 tokens with 20% savings",
        tokens: 50,
        price: "$9.99",
        bestValue: false,
        color: theme.colors.primary,
        icon: "key",
      },
      {
        id: "tokens_120_package",
        title: t("packages.tokens120.title") || "Premium Package",
        description:
          t("packages.tokens120.description") || "120 tokens with 30% savings",
        tokens: 120,
        price: "$19.99",
        bestValue: true,
        color: theme.colors.secondary,
        icon: "diamond",
      },
      {
        id: "monthly_subscription",
        title: t("packages.subscription.title") || "Monthly Subscription",
        description:
          t("packages.subscription.description") ||
          "50 tokens per month + unlimited analysis",
        tokens: 50,
        price: "$9.99/month",
        isSubscription: true,
        bestValue: false,
        color: theme.colors.success,
        icon: "infinite",
      },
    ];

    return packageList.find((pkg) => pkg.id === packageId) || packageList[0];
  };

  // Header with token balance and back button
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text variant="h2">{t("tokens.buyTokens")}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  // Token balance card
  const renderTokenBalance = () => (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.balanceCard} variant="default" elevated={true}>
        <View style={styles.balanceRow}>
          <View>
            <Text
              variant="subtitle2"
              color={theme.colors.textSecondary}
              style={styles.balanceLabel}
            >
              {t("tokens.yourBalance")}
            </Text>
            <Animated.View
              style={[
                styles.tokenDisplay,
                {
                  transform: [{ scale: balanceScaleAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.tokenIconContainer,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Ionicons name="key" size={20} color={theme.colors.primary} />
              </View>
              <Animated.Text
                style={[
                  styles.tokenCount,
                  {
                    color: theme.colors.text,
                    fontSize: 28,
                    fontWeight: "bold",
                  },
                ]}
              >
                {Math.floor(tokenCountAnim.__getValue())}
              </Animated.Text>
            </Animated.View>
          </View>

          {subscription?.active ? (
            <Badge
              label="Active Subscription"
              variant="success"
              size="small"
              style={styles.subscriptionBadge}
            />
          ) : !freeTrialUsed ? (
            <Badge
              label="Free Trial Available"
              variant="info"
              size="small"
              style={styles.subscriptionBadge}
            />
          ) : null}
        </View>

        {subscription?.active ? (
          <Text
            variant="body2"
            color={theme.colors.success}
            style={styles.subscriptionText}
          >
            Your subscription renews on{" "}
            {formatDate(subscription.expirationDate)}
          </Text>
        ) : (
          <View style={styles.tokenUsageContainer}>
            <View style={styles.tokenUsageItem}>
              <Ionicons
                name="document-text"
                size={16}
                color={theme.colors.info}
              />
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={styles.tokenUsageText}
              >
                {t("tokens.documentAnalysis") ||
                  `${
                    TOKEN_COSTS?.DOCUMENT_ANALYSIS || 1
                  } token = Document analysis (up to 5 pages)`}
              </Text>
            </View>
            <View style={styles.tokenUsageItem}>
              <Ionicons
                name="chatbubble"
                size={16}
                color={theme.colors.secondary}
              />
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={styles.tokenUsageText}
              >
                {t("tokens.questionAnswering") ||
                  `${
                    TOKEN_COSTS?.QUESTION || 0.2
                  } tokens = Ask a question (after first 3 free)`}
              </Text>
            </View>
          </View>
        )}
      </Card>
    </Animated.View>
  );

  // Tabs for switching between packages and history
  const renderTabs = () => (
    <Animated.View
      style={[
        styles.tabContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "packages" && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
        ]}
        onPress={() => setActiveTab("packages")}
      >
        <Ionicons
          name="wallet"
          size={20}
          color={
            activeTab === "packages"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
          style={styles.tabIcon}
        />
        <Text
          variant="body2"
          weight={activeTab === "packages" ? "semibold" : "regular"}
          color={
            activeTab === "packages"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        >
          Packages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "history" && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
        ]}
        onPress={() => setActiveTab("history")}
      >
        <Ionicons
          name="time"
          size={20}
          color={
            activeTab === "history"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
          style={styles.tabIcon}
        />
        <Text
          variant="body2"
          weight={activeTab === "history" ? "semibold" : "regular"}
          color={
            activeTab === "history"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        >
          History
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Package listings
  const renderPackages = () => {
    // Package list
    const packageList = [
      {
        id: "tokens_20_package",
        title: t("packages.tokens20.title") || "Basic Package",
        description:
          t("packages.tokens20.description") || "20 tokens for occasional use",
        tokens: 20,
        price: "$4.99",
        bestValue: false,
        color: theme.colors.info,
        icon: "key-outline",
      },
      {
        id: "tokens_50_package",
        title: t("packages.tokens50.title") || "Standard Package",
        description:
          t("packages.tokens50.description") || "50 tokens with 20% savings",
        tokens: 50,
        price: "$9.99",
        bestValue: false,
        color: theme.colors.primary,
        icon: "key",
      },
      {
        id: "tokens_120_package",
        title: t("packages.tokens120.title") || "Premium Package",
        description:
          t("packages.tokens120.description") || "120 tokens with 30% savings",
        tokens: 120,
        price: "$19.99",
        bestValue: true,
        color: theme.colors.secondary,
        icon: "diamond",
      },
      {
        id: "monthly_subscription",
        title: t("packages.subscription.title") || "Monthly Subscription",
        description:
          t("packages.subscription.description") ||
          "50 tokens per month + unlimited analysis",
        tokens: 50,
        price: "$9.99/month",
        isSubscription: true,
        bestValue: false,
        color: theme.colors.success,
        icon: "infinite",
      },
    ];

    return (
      <Animated.View
        style={[
          styles.packagesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text
          variant="subtitle1"
          weight="semibold"
          style={styles.packagesTitle}
        >
          {t("packages.selectPackage") || "Select a package"}
        </Text>

        {packageList.map((pkg, index) => (
          <MotiView
            key={pkg.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 500,
              delay: index * 100,
            }}
          >
            <TouchableOpacity
              style={[
                styles.packageCard,
                selectedPackage === pkg.id && {
                  borderColor: pkg.color,
                  backgroundColor: pkg.color + "08",
                },
                { borderColor: theme.colors.border },
              ]}
              onPress={() => setSelectedPackage(pkg.id)}
            >
              <LinearGradient
                colors={[pkg.color + "20", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.packageGradient}
              />

              <View style={styles.packageHeader}>
                <View style={styles.packageTitleContainer}>
                  <View
                    style={[
                      styles.packageIconContainer,
                      { backgroundColor: pkg.color + "20" },
                    ]}
                  >
                    <Ionicons name={pkg.icon} size={20} color={pkg.color} />
                  </View>
                  <Text variant="h3" style={styles.packageTitle}>
                    {pkg.title}
                  </Text>
                </View>

                {pkg.bestValue && (
                  <Badge
                    label={t("packages.bestValue") || "Best Value"}
                    variant="secondary"
                    size="small"
                    style={styles.bestValueBadge}
                  />
                )}

                {pkg.isSubscription && (
                  <Badge
                    label="Subscription"
                    variant="success"
                    size="small"
                    style={styles.bestValueBadge}
                  />
                )}
              </View>

              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.packageDescription}
              >
                {pkg.description}
              </Text>

              <View style={styles.packageDetails}>
                <View style={styles.tokenAmount}>
                  <Ionicons name="key" size={18} color={pkg.color} />
                  <Text
                    variant="body1"
                    weight="semibold"
                    color={theme.colors.text}
                    style={styles.tokenAmountText}
                  >
                    {pkg.tokens} tokens
                  </Text>
                </View>
                <Text
                  variant="h3"
                  color={pkg.color}
                  style={styles.packagePrice}
                >
                  {pkg.price}
                </Text>
              </View>

              {pkg.isSubscription && (
                <View style={styles.subscriptionNoteContainer}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={styles.subscriptionNote}
                  >
                    Includes monthly tokens and unlimited document analysis
                  </Text>
                </View>
              )}

              {/* Selection indicator */}
              {selectedPackage === pkg.id && (
                <View style={styles.selectedIndicator}>
                  <View
                    style={[styles.selectedCircle, { borderColor: pkg.color }]}
                  >
                    <Ionicons name="checkmark" size={16} color={pkg.color} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </MotiView>
        ))}

        <Button
          label={t("tokens.buyTokens") || "Buy Tokens"}
          onPress={handlePurchase}
          style={styles.purchaseButton}
          disabled={!selectedPackage || loading || purchaseInProgress}
          loading={loading || purchaseInProgress}
          gradient={true}
        />
      </Animated.View>
    );
  };

  // Transaction history
  const renderHistory = () => {
    // Sample history data if tokenHistory is not available
    const historyData =
      tokenHistory && tokenHistory.length > 0
        ? tokenHistory
        : [
            {
              id: "1",
              operationType: "analysis",
              amount: -1,
              description: "Document analysis",
              timestamp: new Date(Date.now() - 86400000),
            },
            {
              id: "2",
              operationType: "purchase",
              amount: 50,
              description: "Token Purchase",
              timestamp: new Date(Date.now() - 172800000),
            },
            {
              id: "3",
              operationType: "question",
              amount: -0.2,
              description: "Document question",
              timestamp: new Date(Date.now() - 259200000),
            },
          ];

    return (
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 300,
              delay: index * 50,
            }}
          >
            <Card
              style={styles.historyCard}
              variant={isDark ? "default" : "bordered"}
            >
              <View style={styles.historyHeader}>
                <View style={styles.historyDescriptionContainer}>
                  <View
                    style={[
                      styles.historyIcon,
                      {
                        backgroundColor:
                          getHistoryIconColor(
                            item.operationType,
                            item.amount > 0
                          ) + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={getHistoryIconName(
                        item.operationType,
                        item.amount > 0
                      )}
                      size={16}
                      color={getHistoryIconColor(
                        item.operationType,
                        item.amount > 0
                      )}
                    />
                  </View>
                  <View>
                    <Text
                      variant="body1"
                      weight="medium"
                      style={styles.historyDescription}
                    >
                      {item.description}
                    </Text>
                    <Text
                      variant="caption"
                      color={theme.colors.textSecondary}
                      style={styles.historyDate}
                    >
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyAmount}>
                  <Text
                    variant="subtitle2"
                    color={
                      item.amount > 0
                        ? theme.colors.success
                        : theme.colors.error
                    }
                    style={styles.historyAmountText}
                  >
                    {item.amount > 0 ? "+" : ""}
                    {item.amount}
                  </Text>
                  <Ionicons
                    name="key"
                    size={14}
                    color={
                      item.amount > 0
                        ? theme.colors.success
                        : theme.colors.error
                    }
                  />
                </View>
              </View>

              {item.documentId && (
                <View style={styles.historyDocumentContainer}>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Document ID: {item.documentId.substring(0, 10)}...
                  </Text>
                </View>
              )}
            </Card>
          </MotiView>
        )}
        contentContainerStyle={styles.historyContent}
        ListEmptyComponent={
          <View style={styles.emptyHistory}>
            <Ionicons
              name="document-text-outline"
              size={60}
              color={theme.colors.textSecondary}
            />
            <Text variant="subtitle1" style={styles.emptyHistoryTitle}>
              No Transaction History
            </Text>
            <Text
              variant="body2"
              color={theme.colors.textSecondary}
              style={styles.emptyHistoryText}
            >
              Your token usage and purchases will appear here
            </Text>
          </View>
        }
      />
    );
  };

  // Get history icon name based on operation type
  const getHistoryIconName = (operationType, isPositive) => {
    if (isPositive) return "add-circle";

    switch (operationType) {
      case "analysis":
        return "document-text";
      case "question":
        return "chatbubble";
      case "export":
        return "download";
      default:
        return "remove-circle";
    }
  };

  // Get history icon color based on operation type
  const getHistoryIconColor = (operationType, isPositive) => {
    if (isPositive) return theme.colors.success;

    switch (operationType) {
      case "analysis":
        return theme.colors.primary;
      case "question":
        return theme.colors.secondary;
      case "export":
        return theme.colors.info;
      default:
        return theme.colors.error;
    }
  };

  // Purchase completion overlay
  const renderPurchaseCompleteOverlay = () => {
    if (!purchaseComplete) return null;

    return (
      <View style={StyleSheet.absoluteFill}>
        <View
          style={[
            styles.purchaseCompleteOverlay,
            { backgroundColor: theme.colors.background + "F0" },
          ]}
        >
          <View style={styles.purchaseResultContent}>
            <View style={styles.resultIconContainer}>
              <LinearGradient
                colors={
                  transactionSuccess
                    ? [theme.colors.success, theme.colors.primary]
                    : [theme.colors.error, theme.colors.warning]
                }
                style={styles.resultIconGradient}
              >
                <Ionicons
                  name={transactionSuccess ? "checkmark" : "close"}
                  size={40}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>

            <Text variant="h2" style={styles.purchaseResultTitle}>
              {transactionSuccess ? "Purchase Complete!" : "Purchase Failed"}
            </Text>

            {transactionSuccess ? (
              <Text
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.purchaseResultText}
              >
                You've successfully purchased {purchasedTokens} tokens
              </Text>
            ) : (
              <Text
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.purchaseResultText}
              >
                There was an issue with your purchase. Please try again.
              </Text>
            )}

            <Button
              label={transactionSuccess ? "Done" : "Try Again"}
              onPress={() => {
                setPurchaseComplete(false);
                setTransactionSuccess(false);
                setPurchaseInProgress(false);
              }}
              style={styles.purchaseResultButton}
              gradient={transactionSuccess}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 50,
      }}
    >
      <SafeAreaView
        style={{
          backgroundColor: theme.colors.primary + (isDark ? "80" : "40"),
        }}
      />
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <AnimatedHeader
        title={t("tokens.buyTokens")}
        scrollY={scrollY}
        theme={theme}
        onBackPress={() => navigation.goBack()}
        statusBarHeight={
          Platform.OS === "android" ? StatusBar.currentHeight : 0
        }
        topPosition={30}
      />

      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        {renderTokenBalance()}
        {renderTabs()}

        <View style={styles.content}>
          {activeTab === "packages" ? (
            <ScrollView
              style={styles.packagesScrollView}
              contentContainerStyle={styles.packagesScrollContent}
              showsVerticalScrollIndicator={false}
              ref={scrollViewRef}
            >
              {renderPackages()}
            </ScrollView>
          ) : (
            renderHistory()
          )}
        </View>
      </Animated.ScrollView>

      {purchaseComplete && renderPurchaseCompleteOverlay()}

      {loading && !purchaseInProgress && (
        <Loading fullScreen iconName="wallet" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  balanceCard: {
    margin: 16,
    marginTop: 10,
    marginBottom: 20,
    padding: 16,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    marginBottom: 4,
  },
  tokenDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  tokenCount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subscriptionBadge: {
    alignSelf: "flex-start",
  },
  tokenUsageContainer: {
    marginTop: 16,
  },
  tokenUsageItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  tokenUsageText: {
    marginLeft: 8,
  },
  subscriptionText: {
    marginTop: 12,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 6,
  },
  content: {
    flex: 1,
  },
  packagesScrollView: {
    flex: 1,
  },
  packagesScrollContent: {
    paddingBottom: 40,
  },
  packagesContainer: {
    padding: 16,
  },
  packagesTitle: {
    marginBottom: 16,
  },
  packageCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  packageGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  packageTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  packageIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  packageTitle: {
    flex: 1,
    marginBottom: 0,
  },
  bestValueBadge: {
    marginLeft: 8,
  },
  packageDescription: {
    marginBottom: 16,
  },
  packageDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenAmount: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenAmountText: {
    marginLeft: 6,
  },
  packagePrice: {
    marginBottom: 0,
  },
  subscriptionNoteContainer: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "flex-start",
  },
  subscriptionNote: {
    marginLeft: 6,
    flex: 1,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseButton: {
    marginTop: 20,
  },
  historyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  historyCard: {
    marginBottom: 12,
    padding: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDescriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyDescription: {
    fontSize: 15,
  },
  historyDate: {
    marginTop: 2,
  },
  historyAmount: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyAmountText: {
    fontWeight: "600",
    marginRight: 4,
  },
  historyDocumentContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyHistoryTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistoryText: {
    textAlign: "center",
  },
  purchaseCompleteOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  purchaseResultContent: {
    alignItems: "center",
    padding: 24,
    width: "90%",
    maxWidth: 360,
  },
  resultIconContainer: {
    marginBottom: 24,
    borderRadius: 50,
    overflow: "hidden",
  },
  resultIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseResultTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  purchaseResultText: {
    textAlign: "center",
    marginBottom: 24,
  },
  purchaseResultButton: {
    minWidth: 180,
  },
});

export default TokenStoreScreen;
