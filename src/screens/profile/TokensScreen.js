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
  Modal,
  Dimensions,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import TokenCard from "../../components/profile/TokenCard";
import RewardCard from "../../components/profile/RewardCard";
import Button from "../../components/common/Button";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const TokensScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Mock token data
  const [tokens, setTokens] = useState(100);
  const [watchedVideosToday, setWatchedVideosToday] = useState(1);
  const canWatchVideoForTokens = () => watchedVideosToday < 3;
  const mockTokenHistory = [
    {
      id: "1",
      type: "purchase",
      amount: 50,
      description: "Token paketi satın alındı",
      date: "2024-01-15",
      time: "14:30",
    },
    {
      id: "2",
      type: "usage",
      amount: -10,
      description: "AI sohbet kullanımı",
      date: "2024-01-14",
      time: "09:15",
    },
  ];

  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [isWatchingVideo, setIsWatchingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0);

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
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
      height: 60,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    headerTitle: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      flex: 1,
      textAlign: "center",
      marginRight: 40,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginTop: 20,
      marginBottom: 15,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    tokenInfoText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      textAlign: "center",
      marginVertical: 15,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: SIZES.radius,
      padding: 15,
      borderWidth: 1,
    },
    infoCard: {
      borderRadius: SIZES.radius,
      padding: 15,
      marginBottom: 20,
      borderWidth: 1,
    },
    infoCardTitle: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      fontWeight: "bold",
      marginBottom: 10,
    },
    infoCardText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      opacity: 0.8,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      justifyContent: "center",
      alignItems: "center",
    },
    videoContainer: {
      width: width * 0.85,
      height: (width * 0.85 * 9) / 16, // 16:9 aspect ratio
      backgroundColor: "#000",
      marginBottom: 20,
      borderRadius: 10,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    videoPlaceholder: {
      ...FONTS.h3,
      color: "#fff",
      textAlign: "center",
    },
    videoModalTitle: {
      ...FONTS.h3,
      color: "#fff",
      marginBottom: 20,
      textAlign: "center",
    },
    videoProgressContainer: {
      width: width * 0.85,
      height: 8,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 4,
      marginBottom: 20,
    },
    videoProgressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    closeButton: {
      marginTop: 20,
    },
    successModalContent: {
      width: width * 0.8,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: SIZES.radius,
      padding: 20,
      alignItems: "center",
    },
    successTitle: {
      ...FONTS.h2,
      color: colors.primary,
      marginVertical: 15,
      fontWeight: "bold",
    },
    successMessage: {
      ...FONTS.body3,
      color: "#333",
      textAlign: "center",
      marginBottom: 20,
    },
    tokenIconLarge: {
      width: 80,
      height: 80,
      marginBottom: 20,
    },
    tokenAmount: {
      ...FONTS.h1,
      color: colors.primary,
      fontWeight: "bold",
      marginVertical: 10,
    },
  });

  const rewards = [
    {
      id: "daily",
      title: "Günlük Giriş",
      description: "Her gün uygulamaya giriş yapın",
      tokens: 1,
      icon: "calendar-outline",
      claimed: true,
    },
    {
      id: "video",
      title: "Video İzle",
      description: `Video izleyerek token kazanın (${tokens}/3)`,
      tokens: 2,
      icon: "play-circle-outline",
      claimed: tokens >= 3,
    },
    {
      id: "share",
      title: "Uygulamayı Paylaş",
      description: "Arkadaşlarınızla paylaşın",
      tokens: 5,
      icon: "share-social-outline",
      claimed: false,
    },
    {
      id: "feedback",
      title: "Geri Bildirim",
      description: "Deneyiminizi değerlendirin",
      tokens: 3,
      icon: "chatbubble-ellipses-outline",
      claimed: false,
    },
  ];

  const handleRewardPress = (reward) => {
    console.log(`Ödül tıklandı: ${reward.id}`);
    // API çağrısı kaldırıldı, sadece UI kalacak
  };

  const simulateWatchVideo = () => {
    console.log("Video izleme simülasyonu başladı");
    setIsWatchingVideo(true);
    setVideoProgress(0);

    const progressInterval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsWatchingVideo(false);
          setVideoModalVisible(false);
          setSuccessModalVisible(true);
          setEarnedTokens(5);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const simulateAddTokens = (amount) => {
    console.log(`${amount} token eklendi`);
    // API çağrısı kaldırıldı, sadece UI kalacak
  };

  const handlePurchaseTokens = async (packageId) => {
    setLoading(true);
    try {
      // Mock API çağrısı - gerçek API çağrısı yerine
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Token paketi satın alındı:", packageId);
      // Başarılı satın alma sonrası işlem
      
    } catch (error) {
      console.error("Token satın alma hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        /> */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textOnGradient}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tokenlar</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TokenCard
            tokens={tokens}
            watchedVideosToday={watchedVideosToday}
            canWatchVideoForTokens={canWatchVideoForTokens}
            onGetTokenPress={() => {
              if (canWatchVideoForTokens()) {
                setVideoModalVisible(true);
              }
            }}
            onHistoryPress={() => console.log("Token geçmişi")}
          />

          <View
            style={[
              styles.infoCard,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={styles.infoCardTitle}>Tokenlar Nasıl Kullanılır?</Text>
            <Text style={styles.infoCardText}>
              Tokenlar, AI özelliklerine erişim sağlar. Farklı özelliklerin
              farklı token maliyeti vardır. Video izleyerek, uygulamayı
              paylaşarak veya geri bildirimde bulunarak token kazanabilirsiniz.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Token Kazan</Text>

          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onPress={() => handleRewardPress(reward)}
              containerStyle={{ opacity: reward.claimed ? 0.6 : 1 }}
            />
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Video İzleme Modal */}
        <Modal
          visible={videoModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => !isWatchingVideo && setVideoModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.videoModalTitle}>
              {isWatchingVideo
                ? t("screens.profile.tokens.watchingVideo")
                : t("screens.profile.tokens.watchVideoTitle")}
            </Text>

            <View style={styles.videoContainer}>
              <LinearGradient
                colors={["#6A11CB", "#2575FC"]}
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.videoPlaceholder}>
                  {isWatchingVideo
                    ? t("screens.profile.tokens.watchingVideo")
                    : t("screens.profile.tokens.clickToStart")}
                </Text>
              </LinearGradient>
            </View>

            {isWatchingVideo && (
              <View style={styles.videoProgressContainer}>
                <View
                  style={[
                    styles.videoProgressBar,
                    { width: `${videoProgress * 100}%` },
                  ]}
                />
              </View>
            )}

            {!isWatchingVideo ? (
              <Button
                title={t("screens.profile.tokens.watchVideo")}
                onPress={simulateWatchVideo}
                gradient
                icon={<Ionicons name="play" size={20} color="#fff" />}
              />
            ) : (
              <Text style={{ color: "#fff" }}>
                {t("screens.profile.tokens.watchUntilEnd")}
              </Text>
            )}

            {!isWatchingVideo && (
              <Button
                title={t("common.close")}
                onPress={() => setVideoModalVisible(false)}
                outlined
                containerStyle={styles.closeButton}
              />
            )}
          </View>
        </Modal>

        {/* Başarılı Modal */}
        <Modal
          visible={successModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.successModalContent}>
              <Image
                source={require("../../assets/images/token.png")}
                style={styles.tokenIconLarge}
              />

              <Text style={styles.successTitle}>{t("screens.profile.tokens.congratulations")}</Text>
              <Text style={styles.successMessage}>
                {t("screens.profile.tokens.tokensEarned")}
              </Text>

              <Text style={styles.tokenAmount}>+{earnedTokens}</Text>

              <Button
                title={t("screens.profile.tokens.great")}
                onPress={() => setSuccessModalVisible(false)}
                neon
                containerStyle={{ width: "100%" }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TokensScreen;
