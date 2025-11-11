import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { purchaseTokenPackage } from "../../services/revenuecat";

const SubscriptionScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [selectedToken, setSelectedToken] = useState(null);
  const [purchasingToken, setPurchasingToken] = useState(false);

  // Token Paketleri
  const tokenPackages = [
    {
      id: "small",
      title: t('profile.subscription.packages.small.title'),
      price: "$0.50",
      description: t('profile.subscription.packages.small.description'),
      tokens: 100,
      popular: false,
      icon: "flash-outline",
      savings: null,
    },
    {
      id: "medium",
      title: t('profile.subscription.packages.medium.title'),
      price: "$2.50",
      description: t('profile.subscription.packages.medium.description'),
      tokens: 500,
      popular: false,
      icon: "star-outline",
      savings: null,
    },
    {
      id: "large",
      title: t('profile.subscription.packages.large.title'),
      price: "$3.50",
      description: t('profile.subscription.packages.large.description'),
      tokens: 1000,
      popular: false,
      icon: "cube-outline",
      savings: null,
    },
    {
      id: "xlarge",
      title: t('profile.subscription.packages.xlarge.title'),
      price: "$6.00",
      description: t('profile.subscription.packages.xlarge.description'),
      tokens: 2000,
      popular: true,
      icon: "diamond-outline",
      savings: "En iyi değer",
    },
    {
      id: "mega",
      title: "Mega Paket",
      price: "$14.00",
      description: "Yoğun kullanıcılar için",
      tokens: 5000,
      popular: false,
      icon: "rocket-outline",
      savings: null,
    },
    {
      id: "ultra",
      title: "Ultra Paket",
      price: "$27.00",
      description: "Maksimum verimlilik",
      tokens: 10000,
      popular: false,
      icon: "trophy-outline",
      savings: null,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    content: {
      paddingHorizontal: SPACING.md,
    },
    planCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    planCardSelected: {
      borderColor: colors.primary,
      borderWidth: 2.5,
      ...Platform.select({
        ios: {
          backgroundColor: colors.primary + '08',
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
        },
        android: {},
      }),
    },
    planCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.sm,
    },
    planInfo: {
      flex: 1,
    },
    planTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    planTitle: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    planDescription: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    planPricing: {
      alignItems: 'flex-end',
    },
    planPrice: {
      ...TEXT_STYLES.titleSmall,
      color: colors.primary,
      fontWeight: 'bold',
    },
    tokenBadge: {
      backgroundColor: colors.primary + '10',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: BORDER_RADIUS.sm,
      marginTop: SPACING.xs,
    },
    tokenText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.primary,
      fontWeight: '600',
      fontSize: 11,
    },
    popularBadge: {
      position: 'absolute',
      top: -8,
      right: SPACING.md,
      backgroundColor: colors.warning || '#F59E0B',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: BORDER_RADIUS.sm,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    popularText: {
      ...TEXT_STYLES.labelSmall,
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 10,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    featureText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      marginLeft: SPACING.xs,
      fontSize: 12,
    },
    selectButton: {
      marginTop: SPACING.sm,
      backgroundColor: colors.primary,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
    },
    selectButtonText: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textOnPrimary,
      fontWeight: '600',
    },
    selectedButton: {
      backgroundColor: colors.success || '#10B981',
    },
  });

  const handleTokenSelect = (tokenId) => {
    setSelectedToken(tokenId);
  };

  const handleTokenPurchase = async (pkg) => {
    if (!user?.id) {
      Alert.alert(t('common.error'), 'Lütfen giriş yapın');
      return;
    }

    Alert.alert(
      t('profile.subscription.alerts.tokenPurchase'),
      t('profile.subscription.alerts.tokenPurchaseMessage', { tokens: pkg.tokens, price: pkg.price }),
      [
        { text: t('profile.subscription.alerts.cancel'), style: "cancel" },
        { 
          text: t('profile.subscription.alerts.buy'), 
          onPress: async () => {
            try {
              setPurchasingToken(true);

              // Token satın al ve DB'ye kaydet
              const productId = `tokens_${pkg.tokens}`;
              await purchaseTokenPackage(productId, pkg.tokens, user.id);

              Alert.alert(
                '🎉 Başarılı!',
                `${pkg.tokens} token başarıyla hesabınıza eklendi!`,
                [{ 
                  text: 'Harika!', 
                  style: 'default',
                  onPress: () => navigation.goBack()
                }]
              );
            } catch (error) {
              console.error('Token purchase error:', error);
              Alert.alert(
                t('common.error'),
                'Token satın alımı sırasında bir hata oluştu. Lütfen tekrar deneyin.'
              );
            } finally {
              setPurchasingToken(false);
            }
          }
        },
      ]
    );
  };

  const renderTokenCard = (pkg) => {
    const isSelected = selectedToken === pkg.id;
    
    return (
      <TouchableOpacity
        key={pkg.id}
        activeOpacity={0.8}
        onPress={() => handleTokenSelect(pkg.id)}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
        ]}
      >
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>{t('profile.subscription.popular')}</Text>
          </View>
        )}

        <View style={styles.planCardHeader}>
          <View style={styles.planInfo}>
            <View style={styles.planTitleRow}>
              <Ionicons name={pkg.icon} size={18} color={colors.primary} />
              <Text style={styles.planTitle}>{pkg.title}</Text>
            </View>
            <Text style={styles.planDescription}>{pkg.description}</Text>
            {pkg.savings && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                <Ionicons name="pricetag" size={12} color={colors.success || '#10B981'} />
                <Text style={[styles.featureText, { 
                  color: colors.success || '#10B981',
                  fontWeight: '600',
                  marginLeft: 4,
                }]}>
                  {pkg.savings}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.planPricing}>
            <Text style={styles.planPrice}>{pkg.price}</Text>
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenText}>{pkg.tokens} Token</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.selectButton,
            isSelected && styles.selectedButton,
          ]}
          onPress={() => handleTokenPurchase(pkg)}
          activeOpacity={0.8}
          disabled={purchasingToken}
        >
          <Text style={styles.selectButtonText}>
            {purchasingToken 
              ? '⏳ İşlem yapılıyor...'
              : isSelected 
                ? t('profile.subscription.buyButtonSelected') 
                : t('profile.subscription.buyButton')}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t('profile.subscription.title') || "Token Satın Al"} showBackButton={true} />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Açıklama */}
          <View style={{ 
            backgroundColor: colors.primary + '10', 
            padding: SPACING.md, 
            borderRadius: BORDER_RADIUS.md,
            marginBottom: SPACING.lg,
            borderWidth: 1,
            borderColor: colors.primary + '20',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.planTitle, { marginLeft: SPACING.xs }]}>
                {t('profile.subscription.howItWorks.title')}
              </Text>
            </View>
            <Text style={[styles.planDescription, { marginTop: SPACING.xs }]}>
              {t('profile.subscription.howItWorks.description')}
            </Text>
          </View>

          {/* Token Paketleri */}
          {tokenPackages.map(renderTokenCard)}
          
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SubscriptionScreen;