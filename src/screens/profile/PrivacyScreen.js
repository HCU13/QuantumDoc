import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";

const PrivacyScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Gizlilik ayarları state'leri
  const [privacySettings, setPrivacySettings] = useState({
    dataSaving: false,
    saveHistory: true,
    anonymousAnalytics: true,
    personalizedContent: true,
    thirdPartySharing: false,
    locationTracking: false,
  });

  const updateSetting = (key, value) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const privacyControls = [
    {
      id: 'dataSaving',
      title: 'Veri Tasarrufu',
      description: 'Daha az veri kullanarak AI yanıtları alma',
      icon: 'leaf-outline',
      value: privacySettings.dataSaving,
    },
    {
      id: 'saveHistory',
      title: 'Geçmiş Kaydetme',
      description: 'Sohbet ve etkinlik geçmişinizi saklama',
      icon: 'time-outline',
      value: privacySettings.saveHistory,
    },
    {
      id: 'anonymousAnalytics',
      title: 'Anonim Analitik',
      description: 'Uygulamayı geliştirmek için anonim veriler',
      icon: 'analytics-outline',
      value: privacySettings.anonymousAnalytics,
    },
    {
      id: 'personalizedContent',
      title: 'Kişiselleştirilmiş İçerik',
      description: 'İlgi alanlarınıza göre öneriler alma',
      icon: 'person-outline',
      value: privacySettings.personalizedContent,
    },
    {
      id: 'thirdPartySharing',
      title: 'Üçüncü Taraf Paylaşımı',
      description: 'Anonim verilerin araştırma ortaklarıyla paylaşımı',
      icon: 'share-outline',
      value: privacySettings.thirdPartySharing,
    },
    {
      id: 'locationTracking',
      title: 'Konum İzleme',
      description: 'Konuma dayalı özelliklerin etkinleştirilmesi',
      icon: 'location-outline',
      value: privacySettings.locationTracking,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    content: {
      paddingHorizontal: SPACING.md,
      paddingTop:SPACING.md
    },
    introCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.small,
      borderWidth: 1,
      borderColor: colors.border,
    },
    introTitle: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textPrimary,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    introDescription: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    lastUpdated: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.sm,
      fontStyle: 'italic',
    },
    sectionHeader: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
      fontWeight: 'bold',
      marginBottom: SPACING.md,
      marginTop: SPACING.lg,
    },
    controlCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    controlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    controlLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlIcon: {
      width: 36,
      height: 36,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    controlInfo: {
      flex: 1,
    },
    controlTitle: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: 2,
    },
    controlDescription: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    infoTitle: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      fontWeight: 'bold',
      marginBottom: SPACING.sm,
    },
    infoText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: SPACING.xs,
    },
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: SPACING.xs,
      paddingLeft: SPACING.sm,
    },
    bulletIcon: {
      marginTop: 2,
      marginRight: SPACING.xs,
    },
    bulletText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    highlightCard: {
      backgroundColor: colors.primary + '10',
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    highlightText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    contactCard: {
      backgroundColor: colors.primary + '05',
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.xl,
      borderWidth: 1,
      borderColor: colors.primary + '20',
      alignItems: 'center',
    },
    contactTitle: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      fontWeight: 'bold',
      marginBottom: SPACING.sm,
    },
    contactEmail: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.primary,
      fontWeight: '600',
    },
  });

  const renderBulletPoint = (text) => (
    <View style={styles.bulletPoint}>
      <Ionicons name="checkmark" size={12} color={colors.success || '#10B981'} style={styles.bulletIcon} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  const renderPrivacyControl = (control) => (
    <View key={control.id} style={styles.controlCard}>
      <View style={styles.controlRow}>
        <View style={styles.controlLeft}>
          <View style={styles.controlIcon}>
            <Ionicons name={control.icon} size={18} color={colors.primary} />
          </View>
          <View style={styles.controlInfo}>
            <Text style={styles.controlTitle}>{control.title}</Text>
            <Text style={styles.controlDescription}>{control.description}</Text>
          </View>
        </View>
        <Switch
          value={control.value}
          onValueChange={(value) => updateSetting(control.id, value)}
          trackColor={{ false: colors.border, true: colors.primary + '30' }}
          thumbColor={control.value ? colors.primary : colors.textSecondary}
          ios_backgroundColor={colors.border}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t('profile.privacy.title')} showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Giriş Kartı */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>{t('profile.privacy.intro.title')}</Text>
            <Text style={styles.introDescription}>
              {t('profile.privacy.intro.description')}
            </Text>
            <Text style={styles.lastUpdated}>{t('profile.privacy.intro.lastUpdated')}</Text>
          </View>

          {/* Gizlilik Kontrolleri */}
          <Text style={styles.sectionHeader}>{t('profile.privacy.sections.controls')}</Text>
          {privacyControls.map(renderPrivacyControl)}

          {/* Veri Toplama */}
          <Text style={styles.sectionHeader}>{t('profile.privacy.sections.dataCollection')}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('profile.privacy.collected.title')}</Text>
            <Text style={styles.infoText}>
              {t('profile.privacy.collected.description')}
            </Text>
            {renderBulletPoint(t('profile.privacy.collected.account'))}
            {renderBulletPoint(t('profile.privacy.collected.history'))}
            {renderBulletPoint(t('profile.privacy.collected.device'))}
            {renderBulletPoint(t('profile.privacy.collected.location'))}
          </View>

          {/* Veri Kullanımı */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('profile.privacy.usage.title')}</Text>
            <Text style={styles.infoText}>
              {t('profile.privacy.usage.description')}
            </Text>
            {renderBulletPoint(t('profile.privacy.usage.improve'))}
            {renderBulletPoint(t('profile.privacy.usage.personalize'))}
            {renderBulletPoint(t('profile.privacy.usage.security'))}
            {renderBulletPoint(t('profile.privacy.usage.support'))}
          </View>

          {/* Veri Güvenliği */}
          <View style={styles.highlightCard}>
            <Text style={styles.highlightText}>
              {t('profile.privacy.securityInfo')}
            </Text>
          </View>

          {/* Kullanıcı Hakları */}
          <Text style={styles.sectionHeader}>{t('profile.privacy.sections.rights')}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('profile.privacy.userRights.title')}</Text>
            <Text style={styles.infoText}>
              {t('profile.privacy.userRights.description')}
            </Text>
            {renderBulletPoint(t('profile.privacy.userRights.access'))}
            {renderBulletPoint(t('profile.privacy.userRights.rectify'))}
            {renderBulletPoint(t('profile.privacy.userRights.delete'))}
            {renderBulletPoint(t('profile.privacy.userRights.object'))}
          </View>

          {/* İletişim */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>{t('profile.privacy.contact.title')}</Text>
            <TouchableOpacity onPress={() => Alert.alert(t('common.info'), 'E-posta uygulaması açılacak...')}>
              <Text style={styles.contactEmail}>{t('profile.privacy.contact.email')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default PrivacyScreen;
