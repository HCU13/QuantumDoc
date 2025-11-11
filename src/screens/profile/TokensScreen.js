import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useTokenContext } from "../../contexts/TokenContext";
import { useAuth } from "../../contexts/AuthContext";
import { useRewardedAd } from "../../hooks/useAdMob";
import tokenEarnings from "../../services/tokenEarnings";
import { showSuccess, showError } from "../../utils/toast";
import { supabase } from "../../services/supabase";
import FeedbackModal from "../../components/common/FeedbackModal";

const { width } = Dimensions.get("window");

const TokensScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { tokens, refreshTokens } = useTokenContext();
  const { user } = useAuth();
  const { showAd, isLoading: adLoading, isReady: adReady } = useRewardedAd();

  const [loading, setLoading] = useState(true);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [watchedAdsToday, setWatchedAdsToday] = useState(0);
  const [dailyLoginClaimed, setDailyLoginClaimed] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [claimingAd, setClaimingAd] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Token değerlerini DB'den al
  const { getTokenCost } = useTokenContext();
  const [tokenRewards, setTokenRewards] = useState({
    dailyLogin: 1,
    adReward: 2,
    feedback: 5,
  });

  useEffect(() => {
    loadData();
    loadTokenRewards();
  }, []);

  const loadTokenRewards = async () => {
    try {
      const dailyLogin = getTokenCost('daily_login') || 1;
      const adReward = getTokenCost('ad_reward') || 2;
      const feedback = getTokenCost('feedback') || 5;
      
      setTokenRewards({
        dailyLogin,
        adReward,
        feedback,
      });
    } catch (error) {
      console.error('[TokensScreen] Token reward yükleme hatası:', error);
    }
  };

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Streak bilgisini al (DB'den)
      const streakData = await tokenEarnings.getLoginStreak(user.id);
      setDailyStreak(streakData.streak);

      // Bugün izlenen reklam sayısı (DB'den)
      const adCount = await tokenEarnings.getTodayAdWatchCount(user.id);
      setWatchedAdsToday(adCount);

      // Bugün günlük giriş ödülü alınmış mı? (DB'den)
      const isClaimed = await tokenEarnings.isDailyLoginClaimed(user.id);
      setDailyLoginClaimed(isClaimed);
    } catch (error) {
      console.error('[TokensScreen] Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyLogin = async () => {
    if (!user?.id || dailyLoginClaimed || claimingDaily) return;

    setClaimingDaily(true);
    try {
      const result = await tokenEarnings.claimDailyLoginReward(user.id);
      
      if (result.claimed) {
        showError(t('profile.tokens.alerts.completed'), t('profile.tokens.alerts.completedMessage'));
        return;
      }

      showSuccess(t('profile.tokens.success.title'), `${t('profile.tokens.success.message')} +${result.tokens} 🎉`);
      setDailyLoginClaimed(true);
      setDailyStreak(result.streak || 1);
      
      // Token context'i yenile ve verileri yeniden yükle
      refreshTokens();
      loadData();
    } catch (error) {
      console.error('[TokensScreen] Günlük giriş hatası:', error);
      showError(t('profile.tokens.alerts.error'), t('profile.tokens.alerts.errorMessage'));
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleWatchAd = async () => {
    if (!user?.id || watchedAdsToday >= 5 || claimingAd) return;

    setClaimingAd(true);
    try {
      // Reklamı göster - Kullanıcı reklamı tam izlediyse reward döner
      const adResult = await showAd();
      
      // Reklam izlendi (reward geldi), şimdi DB'ye kaydet
      const adIncrementResult = await tokenEarnings.incrementAdWatchCount(user.id);
      
      if (!adIncrementResult.success) {
        throw new Error(adIncrementResult.limitReached ? 'Günlük limit doldu' : 'Reklam sayısı artırılamadı');
      }

      // Token ödülünü DB'den al ve ver
      const adRewardAmount = tokenRewards.adReward;
      await tokenEarnings.earnTokens(
        user.id,
        adRewardAmount,
        'ad_reward',
        { adUnitId: 'rewarded_ad', timestamp: new Date().toISOString() }
      );

      showSuccess(t('profile.tokens.success.title'), `${t('profile.tokens.success.message')} +${adRewardAmount} 🎉`);
      
      // State'i güncelle
      setWatchedAdsToday(adIncrementResult.currentCount);
      refreshTokens();
    } catch (error) {
      console.error('[TokensScreen] Reklam hatası:', error);
      showError(t('profile.tokens.alerts.error'), error.message || t('profile.tokens.alerts.videoError'));
    } finally {
      setClaimingAd(false);
    }
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
    },
    tokenBalance: {
      alignItems: "center",
      paddingVertical: SPACING.xl,
      marginBottom: SPACING.lg,
    },
    tokenAmount: {
      fontSize: 42,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    tokenLabel: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "15",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      marginTop: SPACING.sm,
    },
    streakText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.primary,
      marginLeft: SPACING.xs,
      fontWeight: "600",
    },
    sectionTitle: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
      marginTop: SPACING.lg,
      fontWeight: "600",
    },
    missionCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    missionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    missionIcon: {
      width: 36,
      height: 36,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    missionContent: {
      flex: 1,
    },
    missionTitle: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      fontWeight: "600",
      marginBottom: 2,
    },
    missionDescription: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
    },
    missionFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: SPACING.sm,
    },
    rewardBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: BORDER_RADIUS.sm,
    },
    rewardAmount: {
      ...TEXT_STYLES.labelSmall,
      color: colors.primary,
      fontWeight: "600",
      marginLeft: 4,
    },
    statusBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
      ...TEXT_STYLES.labelSmall,
      fontWeight: "600",
    },
    completedStatus: {
      backgroundColor: colors.success + "20",
    },
    completedText: {
      color: colors.success || "#10B981",
    },
    pendingStatus: {
      backgroundColor: colors.textSecondary + "15",
    },
    pendingText: {
      color: colors.textSecondary,
    },
    limitText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textSecondary,
      fontSize: 11,
    },
  });

  const dailyMissions = [
    {
      id: "daily_login",
      title: t('profile.tokens.missions.dailyLogin.title'),
      description: t('profile.tokens.missions.dailyLogin.description'),
      tokens: tokenRewards.dailyLogin,
      icon: "calendar-outline",
      completed: dailyLoginClaimed,
      onPress: handleDailyLogin,
      loading: claimingDaily,
      disabled: dailyLoginClaimed,
      actionText: dailyLoginClaimed ? undefined : t('profile.tokens.claimReward', 'Ödülü Al'),
    },
    {
      id: "watch_ad",
      title: t('profile.tokens.missions.watchVideo.title'),
      description: t('profile.tokens.missions.watchVideo.description'),
      tokens: tokenRewards.adReward,
      icon: "play-circle-outline",
      completed: watchedAdsToday >= 5,
      onPress: handleWatchAd,
      loading: claimingAd || adLoading,
      disabled: watchedAdsToday >= 5,
      progress: watchedAdsToday,
      maxProgress: 5,
      actionText: watchedAdsToday >= 5 ? undefined : t('profile.tokens.watchAd', 'Reklam İzle'),
      limitText: watchedAdsToday >= 5 ? t('profile.tokens.alerts.limitReached') : undefined,
    },
  ];

  const handleFeedback = () => {
    setFeedbackModalVisible(true);
  };

  const handleFeedbackSuccess = (tokenEarned) => {
    if (tokenEarned) {
      setFeedbackSubmitted(true);
      refreshTokens();
      loadData(); // Verileri yenile
    }
  };

  // Hiç geri bildirim verilmiş mi kontrol et (tek seferlik)
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data: previousFeedback } = await supabase
          .from('token_transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('reference_type', 'feedback')
          .limit(1)
          .maybeSingle();

        setFeedbackSubmitted(!!previousFeedback);
      } catch (error) {
        // Hata yoksa false kalır
        setFeedbackSubmitted(false);
      }
    };

    checkFeedbackStatus();
  }, [user?.id]);

  const weeklyMissions = [
    {
      id: "feedback",
      title: t('profile.tokens.missions.feedback.title'),
      description: t('profile.tokens.missions.feedback.description'),
      tokens: tokenRewards.feedback,
      icon: "star-outline",
      completed: feedbackSubmitted,
      onPress: handleFeedback,
      disabled: feedbackSubmitted,
      actionText: feedbackSubmitted ? undefined : t('profile.tokens.feedback.giveFeedback', 'Geri Bildirim Ver'),
    },
  ];

  const MissionCard = ({ mission }) => {
    const progressPercentage = mission.maxProgress 
      ? (mission.progress / mission.maxProgress) * 100 
      : 100;

    return (
      <TouchableOpacity
        style={[
          styles.missionCard,
          mission.disabled && { opacity: 0.6 }
        ]}
        onPress={mission.onPress}
        activeOpacity={0.7}
        disabled={mission.disabled || mission.loading}
      >
        <View style={styles.missionHeader}>
          <View style={styles.missionIcon}>
            <Ionicons
              name={mission.icon}
              size={18}
              color={mission.completed ? colors.success || "#10B981" : colors.primary}
            />
          </View>
          <View style={styles.missionContent}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionDescription}>{mission.description}</Text>
          </View>
        </View>

        <View style={styles.missionFooter}>
          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.rewardAmount}>+{mission.tokens}</Text>
          </View>

          {mission.loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : mission.completed ? (
            <View style={[styles.statusBadge, styles.completedStatus]}>
              <Text style={[styles.statusText, styles.completedText]}>
                {t('profile.tokens.alerts.completed')}
              </Text>
            </View>
          ) : mission.limitText ? (
            <Text style={styles.limitText}>{mission.limitText}</Text>
          ) : mission.actionText ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.statusText, { color: colors.primary }]}>
                {mission.actionText}
              </Text>
            </View>
          ) : mission.maxProgress ? (
            <View style={[styles.statusBadge, styles.pendingStatus]}>
              <Text style={[styles.statusText, styles.pendingText]}>
                {`${mission.progress || 0}/${mission.maxProgress}`}
              </Text>
            </View>
          ) : null}
        </View>

        {mission.maxProgress && !mission.completed && (
          <View style={{ marginTop: SPACING.xs }}>
            <View style={{
              height: 3,
              backgroundColor: colors.border,
              borderRadius: BORDER_RADIUS.xs,
              overflow: 'hidden',
            }}>
              <View
                style={{
                  height: "100%",
                  width: `${progressPercentage}%`,
                  backgroundColor: colors.primary,
                  borderRadius: BORDER_RADIUS.xs,
                }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <Header title={t('profile.tokens.title')} showBackButton={true} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t('profile.tokens.title')} showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Token Balance */}
          <View style={styles.tokenBalance}>
            <Text style={styles.tokenAmount}>{tokens}</Text>
            <Text style={styles.tokenLabel}>{t('profile.tokens.totalTokens')}</Text>
            
            {dailyStreak > 0 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color={colors.primary} />
                <Text style={styles.streakText}>
                  {dailyStreak} {t('profile.tokens.streak')}
                </Text>
              </View>
            )}
          </View>

          {/* Günlük Görevler */}
          <Text style={styles.sectionTitle}>{t('profile.tokens.dailyMissions')}</Text>
          {dailyMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}

          {/* Haftalık Görevler */}
          <Text style={styles.sectionTitle}>{t('profile.tokens.weeklyMissions')}</Text>
          {weeklyMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>

        {/* Feedback Modal */}
        <FeedbackModal
          visible={feedbackModalVisible}
          onClose={() => setFeedbackModalVisible(false)}
          onSuccess={handleFeedbackSuccess}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TokensScreen;
