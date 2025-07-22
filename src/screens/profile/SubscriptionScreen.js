import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";

const plans = [
  {
    id: "free",
    title: "Ücretsiz",
    price: "0 ₺",
    description: "Temel özellikler için",
    tokenAmount: 10,
    popular: false,
    icon: "gift-outline",
    features: [
      "Günlük 10 soru limiti",
      "1 AI modülüne erişim",
      "Temel yanıt kalitesi",
      "Reklam destekli",
    ],
  },
  {
    id: "premium",
    title: "Premium",
    price: "49,99 ₺/ay",
    description: "Daha fazla özellik için ideal",
    tokenAmount: 100,
    popular: true,
    icon: "star-outline",
    features: [
      "Günlük 100 soru limiti",
      "Tüm AI modüllerine erişim",
      "Yüksek yanıt kalitesi",
      "Reklamsız deneyim",
      "Öncelikli destek",
    ],
  },
  {
    id: "unlimited",
    title: "Sınırsız",
    price: "99,99 ₺/ay",
    description: "En iyi deneyim için",
    tokenAmount: "Sınırsız",
    popular: false,
    icon: "rocket-outline",
    features: [
      "Sınırsız soru",
      "Tüm AI modüllerine erişim",
      "En yüksek yanıt kalitesi",
      "Reklamsız deneyim",
      "7/24 özel destek",
      "Öncelikli işleme",
    ],
  },
];

const tokenPackages = [
  {
    id: "small",
    title: "Hızlı Paket",
    price: "9,99 ₺",
    description: "Acil işlemler için ideal",
    tokens: 50,
    popular: false,
    icon: "flash-outline",
    savings: null,
  },
  {
    id: "medium",
    title: "Popüler Paket",
    price: "24,99 ₺",
    description: "En çok tercih edilen",
    tokens: 150,
    popular: true,
    icon: "star-outline",
    savings: "%17 tasarruf",
  },
  {
    id: "large",
    title: "Mega Paket",
    price: "69,99 ₺",
    description: "Yoğun kullanım için",
    tokens: 500,
    popular: false,
    icon: "cube-outline",
    savings: "%30 tasarruf",
  },
];

const SubscriptionScreen = () => {
  const { colors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(plans[0].id);
  const [selectedTab, setSelectedTab] = useState("subscription");
  const [selectedToken, setSelectedToken] = useState(tokenPackages[0].id);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    tabSwitch: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.card + '30' : colors.gray,
      borderRadius: 16,
      marginBottom: 18,
      marginTop: 8,
      padding: 4,
      alignSelf: 'center',
      width: '80%', // genişlik küçültüldü
    },
    tabBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      flexDirection: 'row',
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabInactive: {
      backgroundColor: 'transparent',
    },
    tabText: {
      ...FONTS.body4,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    tabTextActive: {
      color: colors.textOnPrimary,
    },
    tabTextInactive: {
      color: colors.textSecondary,
    },
    planCard: {
      marginBottom: 14,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.09,
      shadowRadius: 8,
      elevation: 3,
    },
    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    popularBadge: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 7,
    },
    priceBox: {
      alignItems: 'flex-end',
      marginLeft: 8,
    },
    tokenBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      backgroundColor: colors.primary + '10',
      borderRadius: 7,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    tokenIcon: {
      width: 13,
      height: 13,
      marginRight: 2,
    },
  });

  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id;
    return (
      <TouchableOpacity
        key={plan.id}
        activeOpacity={0.92}
        onPress={() => setSelectedPlan(plan.id)}
        style={[
          styles.planCard,
          {
            backgroundColor: isSelected
              ? (isDark ? 'rgba(138,79,255,0.10)' : 'rgba(138,79,255,0.06)')
              : colors.card,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
      >
        {/* İkon */}
        <View style={styles.iconBox}>
          <Ionicons name={plan.icon} size={20} color={colors.primary} />
        </View>
        {/* Bilgiler */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...FONTS.h4, color: colors.textPrimary, fontWeight: 'bold' }}>{plan.title}</Text>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={{ ...FONTS.body5, color: colors.textOnPrimary, fontWeight: 'bold' }}>En Popüler</Text>
              </View>
            )}
          </View>
          <Text style={{ ...FONTS.body5, color: colors.textSecondary, marginTop: 2 }}>{plan.description}</Text>
          {/* Özellikler */}
          <View style={{ marginTop: 6 }}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                <Text style={{ ...FONTS.body5, color: colors.textPrimary, marginLeft: 5 }}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Fiyat ve token */}
        <View style={styles.priceBox}>
          <Text style={{ ...FONTS.h4, color: colors.primary, fontWeight: 'bold' }}>{plan.price}</Text>
          <View style={styles.tokenBox}>
            <Image source={require('../../assets/images/token.png')} style={styles.tokenIcon} />
            <Text style={{ ...FONTS.body5, color: colors.primary, fontWeight: 'bold' }}>{plan.tokenAmount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTokenCard = (pkg) => {
    const isSelected = selectedToken === pkg.id;
    return (
      <TouchableOpacity
        key={pkg.id}
        activeOpacity={0.92}
        onPress={() => setSelectedToken(pkg.id)}
        style={[
          styles.planCard,
          {
            backgroundColor: isSelected
              ? (isDark ? 'rgba(138,79,255,0.10)' : 'rgba(138,79,255,0.06)')
              : colors.card,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
      >
        {/* İkon */}
        <View style={styles.iconBox}>
          <Ionicons name={pkg.icon} size={20} color={colors.primary} />
        </View>
        {/* Bilgiler */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...FONTS.h4, color: colors.textPrimary, fontWeight: 'bold' }}>{pkg.title}</Text>
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={{ ...FONTS.body5, color: colors.textOnPrimary, fontWeight: 'bold' }}>En Popüler</Text>
              </View>
            )}
          </View>
          <Text style={{ ...FONTS.body5, color: colors.textSecondary, marginTop: 2 }}>{pkg.description}</Text>
          {/* Tasarruf */}
          {pkg.savings && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="pricetag" size={14} color={colors.success} />
              <Text style={{ ...FONTS.body5, color: colors.success, marginLeft: 5 }}>{pkg.savings}</Text>
            </View>
          )}
        </View>
        {/* Fiyat ve token */}
        <View style={styles.priceBox}>
          <Text style={{ ...FONTS.h4, color: colors.primary, fontWeight: 'bold' }}>{pkg.price}</Text>
          <View style={styles.tokenBox}>
            <Image source={require('../../assets/images/token.png')} style={styles.tokenIcon} />
            <Text style={{ ...FONTS.body5, color: colors.primary, fontWeight: 'bold' }}>{pkg.tokens}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Abonelik & Token" showBackButton={true} />
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              selectedTab === "subscription" ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => setSelectedTab("subscription")}
          >
            <Ionicons name="card-outline" size={18} color={selectedTab === "subscription" ? colors.textOnPrimary : colors.textSecondary} />
            <Text style={[styles.tabText, selectedTab === "subscription" ? styles.tabTextActive : styles.tabTextInactive]}>Abonelik</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              selectedTab === "token" ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => setSelectedTab("token")}
          >
            <Ionicons name="flash-outline" size={18} color={selectedTab === "token" ? colors.textOnPrimary : colors.textSecondary} />
            <Text style={[styles.tabText, selectedTab === "token" ? styles.tabTextActive : styles.tabTextInactive]}>Token Al</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === "subscription"
            ? plans.map(renderPlanCard)
            : tokenPackages.map(renderTokenCard)}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SubscriptionScreen;
