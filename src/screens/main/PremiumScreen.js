// PremiumScreen.js - Hibrit Model (Abonelik + Token Paketleri) - Optimizasyonlu
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const PremiumScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("subscription"); // 'subscription' veya 'token'
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  // Abonelik paketleri - Fiyatlar ve token miktarları güncellendi
  const subscriptionPackages = [
    {
      id: "basic_monthly",
      title: "Temel",
      tokens: 20,
      price: 4.99,
      period: "ay",
      description: "Ayda 20 token ile başlangıç seviyesi",
      bestValue: false,
    },
    {
      id: "pro_monthly",
      title: "Pro",
      tokens: 50,
      price: 9.99,
      period: "ay",
      description: "Ayda 50 token ile düzenli kullanım",
      bestValue: true,
    },
    {
      id: "premium_monthly",
      title: "Premium",
      tokens: 120,
      price: 19.99,
      period: "ay",
      description: "Ayda 120 token ile yoğun kullanım",
      bestValue: false,
    },
  ];

  // Token paketleri - Güncellendi
  const tokenPackages = [
    {
      id: "tokens_15",
      title: "Küçük Paket",
      tokens: 15,
      price: 4.99,
      description: "15 token ile ek döküman analizi",
      bestValue: false,
    },
    {
      id: "tokens_40",
      title: "Orta Paket",
      tokens: 40,
      price: 9.99,
      description: "40 token ile daha fazla analiz",
      bestValue: true,
    },
    {
      id: "tokens_90",
      title: "Büyük Paket",
      tokens: 90,
      price: 19.99,
      description: "90 token ile kapsamlı kullanım",
      bestValue: false,
    },
  ];

  // Aktif paketler
  const activePackages =
    activeTab === "subscription" ? subscriptionPackages : tokenPackages;

  const handlePurchase = async () => {
    if (!selectedPackage) {
      return;
    }

    setPurchasing(true);
    try {
      // RevenueCat ile satın alma işlemi
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (activeTab === "subscription") {
        // Abonelik satın alma başarılı
        navigation.navigate("Home");
      } else {
        // Token paketi satın alma başarılı
        navigation.replace("TokenPurchaseSuccess", {
          tokenAmount: selectedPackage.tokens,
        });
      }
    } catch (error) {
      console.error("Purchase error:", error);
    } finally {
      setPurchasing(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close-outline" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        Premium
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "subscription" && [
            styles.activeTabButton,
            { backgroundColor: theme.colors.primary + "15" },
          ],
        ]}
        onPress={() => {
          setActiveTab("subscription");
          setSelectedPackage(null);
        }}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={
            activeTab === "subscription"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "subscription"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          Aylık Abonelik
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "token" && [
            styles.activeTabButton,
            { backgroundColor: theme.colors.primary + "15" },
          ],
        ]}
        onPress={() => {
          setActiveTab("token");
          setSelectedPackage(null);
        }}
      >
        <Ionicons
          name="flash-outline"
          size={20}
          color={
            activeTab === "token"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "token"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          Token Paketleri
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderIntroText = () => (
    <View style={styles.introTextContainer}>
      {activeTab === "subscription" ? (
        <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
          Aylık yenilenen abonelik ile düzenli token alın. Her ay yeni tokenler
          otomatik olarak hesabınıza eklenir.
        </Text>
      ) : (
        <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
          Tek seferlik token paketleri satın alarak mevcut tokenlerinize
          ekleyin. İhtiyaç duydukça kullanın.
        </Text>
      )}
    </View>
  );

  const renderPackages = () => (
    <View style={styles.packagesContainer}>
      {activePackages.map((pkg) => (
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
            selectedPackage?.id === pkg.id && styles.selectedPackage,
          ]}
          onPress={() => setSelectedPackage(pkg)}
          disabled={purchasing}
        >
          {pkg.bestValue && (
            <View
              style={[
                styles.bestValueTag,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.bestValueText} color="white">
                En İyi Değer
              </Text>
            </View>
          )}

          <View style={styles.packageHeader}>
            <View style={styles.packageTitleRow}>
              <Text style={[styles.packageTitle, { color: theme.colors.text }]}>
                {pkg.title}
              </Text>

              <Text style={[styles.packagePrice, { color: theme.colors.text }]}>
                ${pkg.price}
                {activeTab === "subscription" && (
                  <Text style={styles.periodText}>/{pkg.period}</Text>
                )}
              </Text>
            </View>

            <View
              style={[
                styles.tokenBadge,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons name="flash" size={16} color={theme.colors.primary} />
              <Text
                style={[styles.tokenBadgeText, { color: theme.colors.primary }]}
              >
                {pkg.tokens} token{" "}
                {activeTab === "subscription" && `/ ${pkg.period}`}
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
          </View>

          <View
            style={[styles.radioButton, { borderColor: theme.colors.border }]}
          >
            {selectedPackage?.id === pkg.id && (
              <View
                style={[
                  styles.radioButtonInner,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderComparisonInfo = () =>
    activeTab === "subscription" && (
      <View style={styles.comparisonContainer}>
        <Text style={[styles.comparisonTitle, { color: theme.colors.text }]}>
          Abonelik Avantajları
        </Text>

        <View style={styles.comparisonList}>
          <View style={styles.comparisonItem}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={theme.colors.success}
            />
            <Text
              style={[
                styles.comparisonText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Her ay otomatik olarak yenilenen tokenler
            </Text>
          </View>

          <View style={styles.comparisonItem}>
            <Ionicons
              name="trending-down-outline"
              size={20}
              color={theme.colors.success}
            />
            <Text
              style={[
                styles.comparisonText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Token başına daha düşük maliyet
            </Text>
          </View>

          <View style={styles.comparisonItem}>
            <Ionicons
              name="gift-outline"
              size={20}
              color={theme.colors.success}
            />
            <Text
              style={[
                styles.comparisonText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Premium özelliklere öncelikli erişim
            </Text>
          </View>
        </View>
      </View>
    );

  // Güncellenmiş Token Kullanım Bölümü
  const renderUsageInfo = () => (
    <View style={styles.usageInfoContainer}>
      <Text style={[styles.usageTitle, { color: theme.colors.text }]}>
        Tokenler ne için kullanılır?
      </Text>

      <View style={styles.usageList}>
        <View style={styles.usageItem}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.usageText, { color: theme.colors.textSecondary }]}
          >
            1-5 sayfalık döküman analizi = 1 token
          </Text>
        </View>

        <View style={styles.usageItem}>
          <Ionicons
            name="copy-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.usageText, { color: theme.colors.textSecondary }]}
          >
            5 sayfadan sonra her 5 sayfa için +1 token
          </Text>
        </View>

        <View style={styles.usageItem}>
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.usageText, { color: theme.colors.textSecondary }]}
          >
            Her döküman için ilk 3 soru ücretsiz, sonraki 5 soru = 1 token
          </Text>
        </View>

        <View style={styles.usageItem}>
          <Ionicons
            name="download-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.usageText, { color: theme.colors.textSecondary }]}
          >
            PDF veya Word dışa aktarma = 1 token
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
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabSelector()}
        {renderIntroText()}
        {renderPackages()}
        {renderComparisonInfo()}
        {renderUsageInfo()}

        <TouchableOpacity style={styles.restoreButton}>
          <Text style={{ color: theme.colors.primary, fontSize: 14 }}>
            Önceki satın alımlarımı geri yükle
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <SafeAreaView
        edges={["bottom"]}
        style={[
          styles.footer,
          {
            backgroundColor: theme.isDark ? "#1A1A1A" : "#FFFFFF",
            borderTopColor: theme.isDark ? "#333333" : "#E5E7EB",
          },
        ]}
      >
        <Button
          title={
            purchasing
              ? "İşlem yapılıyor..."
              : selectedPackage
              ? activeTab === "subscription"
                ? `${selectedPackage.title} Plan - $${selectedPackage.price}/${selectedPackage.period}`
                : `${selectedPackage.tokens} Token Satın Al - $${selectedPackage.price}`
              : activeTab === "subscription"
              ? "Abonelik Planı Seçin"
              : "Token Paketi Seçin"
          }
          onPress={handlePurchase}
          disabled={purchasing || !selectedPackage}
          loading={purchasing}
          theme={theme}
          style={styles.purchaseButton}
        />

        <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
          {activeTab === "subscription"
            ? "Abonelik, iptal edilmediği sürece otomatik olarak yenilenir. Aboneliğinizi istediğiniz zaman hesap ayarlarınızdan iptal edebilirsiniz."
            : "Ödeme Apple App Store/Google Play üzerinden gerçekleştirilecektir."}
        </Text>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  activeTabButton: {
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  introTextContainer: {
    marginBottom: 20,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  packagesContainer: {
    marginBottom: 24,
    gap: 12,
  },
  packageCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedPackage: {
    borderWidth: 2,
  },
  bestValueTag: {
    position: "absolute",
    top: -10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: "600",
  },
  packageHeader: {
    flex: 1,
  },
  packageTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: "700",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "normal",
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
    gap: 4,
  },
  tokenBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  packageDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  comparisonContainer: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  comparisonList: {
    gap: 10,
  },
  comparisonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  comparisonText: {
    fontSize: 14,
    flex: 1,
  },
  usageInfoContainer: {
    marginBottom: 24,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  usageList: {
    gap: 10,
  },
  usageItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  usageText: {
    fontSize: 14,
  },
  restoreButton: {
    alignSelf: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
  },
  purchaseButton: {
    marginBottom: 10,
  },
  termsText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
