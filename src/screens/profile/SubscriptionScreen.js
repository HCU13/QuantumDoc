import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "../../hooks/useTheme";

const SubscriptionScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    header: {
      alignItems: "center",
      marginVertical: 20,
    },
    headerTitle: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    headerSubtitle: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: "center",
    },
    currentPlanCard: {
      backgroundColor: isDark ? colors.card + "75" : colors.card + "75",
      borderRadius: SIZES.radius,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentPlanHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    currentPlanTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      fontWeight: "bold",
    },
    statusBadge: {
      backgroundColor: "rgba(52, 199, 89, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "rgba(52, 199, 89, 0.4)",
    },
    statusText: {
      ...FONTS.body5,
      color: isDark ? "#fff" : "#1c7e17",
      fontWeight: "bold",
    },
    planDetails: {
      marginBottom: 15,
    },
    planDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    planDetailText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginLeft: 10,
    },
    planCardContainer: {
      marginBottom: 12,
    },
    planCard: {
      padding: 20,
      borderWidth: 2,
      borderRadius: SIZES.radius,
    },
    selectedPlan: {
      borderColor: colors.primary,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(138, 79, 255, 0.1)",
    },
    unselectedPlan: {
      borderColor: colors.border,
      backgroundColor: isDark ? colors.card + "75" : colors.card + "75",
    },
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    planTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      fontWeight: "bold",
    },
    planPrice: {
      ...FONTS.body3,
      color: colors.textPrimary,
    },
    planDescription: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginBottom: 15,
    },
    planFeature: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    featureText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginLeft: 10,
    },
    popularBadge: {
      position: "absolute",
      top: -10,
      right: 20,
      backgroundColor: colors.secondary,
      paddingHorizontal: 15,
      paddingVertical: 5,
      borderRadius: 15,
      zIndex: 1,
    },
    popularText: {
      ...FONTS.body5,
      color: colors.textOnPrimary,
      fontWeight: "bold",
    },
    footnote: {
      ...FONTS.body5,
      color: colors.textTertiary,
      textAlign: "center",
      marginTop: 15,
      marginBottom: 30,
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 5,
    },
    tokenBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(138, 79, 255, 0.1)",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: 10,
    },
    tokenIcon: {
      width: 14,
      height: 14,
      marginRight: 4,
    },
    tokenText: {
      ...FONTS.body5,
      color: isDark ? colors.white : colors.primary,
      fontWeight: "bold",
    },
  });

  const plans = [
    {
      id: "free",
      title: "Ücretsiz",
      price: "0 ₺",
      description: "Temel özellikler için",
      features: [
        "Günlük 10 soru limiti",
        "1 AI modülüne erişim",
        "Temel yanıt kalitesi",
        "Reklam destekli",
      ],
      tokenAmount: 10,
      popular: false,
    },
    {
      id: "premium",
      title: "Premium",
      price: "49,99 ₺/ay",
      description: "Daha fazla özellik için ideal",
      features: [
        "Günlük 100 soru limiti",
        "Tüm AI modüllerine erişim",
        "Yüksek yanıt kalitesi",
        "Reklamsız deneyim",
        "Öncelikli destek",
      ],
      tokenAmount: 100,
      popular: true,
    },
    {
      id: "unlimited",
      title: "Sınırsız",
      price: "99,99 ₺/ay",
      description: "En iyi deneyim için",
      features: [
        "Sınırsız soru",
        "Tüm AI modüllerine erişim",
        "En yüksek yanıt kalitesi",
        "Reklamsız deneyim",
        "7/24 özel destek",
        "Öncelikli işleme",
      ],
      tokenAmount: "Sınırsız",
      popular: false,
    },
  ];

  const handleUpgrade = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Başarılı",
        `${
          plans.find((p) => p.id === selectedPlan).title
        } planına başarıyla abone oldunuz.`
      );
    }, 1500);
  };

  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        style={styles.planCardContainer}
        onPress={() => setSelectedPlan(plan.id)}
        activeOpacity={0.9}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>En Popüler</Text>
          </View>
        )}

        <View
          style={[
            styles.planCard,
            isSelected ? styles.selectedPlan : styles.unselectedPlan,
          ]}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
          </View>

          <Text style={styles.planDescription}>{plan.description}</Text>

          <View style={styles.planDetailRow}>
            <Ionicons
              name="flash-outline"
              size={18}
              color={colors.textPrimary}
            />
            <Text style={styles.planDetailText}>Token:</Text>
            <View style={styles.tokenBadge}>
              <Image
                source={require("../../assets/images/token.png")}
                style={styles.tokenIcon}
              />
              <Text style={styles.tokenText}>{plan.tokenAmount}</Text>
            </View>
          </View>

          {plan.features.map((feature, index) => (
            <View key={index} style={styles.planFeature}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}

          {isSelected && (
            <Button
              title={plan.id === "free" ? "Mevcut Plan" : "Seç"}
              neon={plan.id !== "free"}
              outlined={plan.id === "free"}
              disabled={plan.id === "free"}
              containerStyle={{ marginTop: 10 }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        /> */}

        <Header title="Abonelik" showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Abonelik Planları</Text>
            <Text style={styles.headerSubtitle}>
              İhtiyacınıza uygun planı seçin
            </Text>
          </View>

          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>Mevcut Plan</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Aktif</Text>
              </View>
            </View>

            <View style={styles.planDetails}>
              <View style={styles.planDetailRow}>
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.planDetailText}>Ücretsiz Plan</Text>
              </View>
              <View style={styles.planDetailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.planDetailText}>Yenileme: -</Text>
              </View>
              <View style={styles.planDetailRow}>
                <Ionicons
                  name="flash-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.planDetailText}>Kalan Token: 5/10</Text>
              </View>
            </View>
          </View>

          {plans.map(renderPlanCard)}

          {selectedPlan !== "free" && (
            <Button
              title={`${
                plans.find((p) => p.id === selectedPlan).title
              } Planına Yükselt`}
              gradient
              onPress={handleUpgrade}
              loading={loading}
              containerStyle={{ marginTop: 20, marginBottom: 10 }}
            />
          )}

          <Text style={styles.footnote}>
            Abonelikler otomatik olarak yenilenir. İstediğiniz zaman iptal
            edebilirsiniz.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SubscriptionScreen;
