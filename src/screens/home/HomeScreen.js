// src/screens/home/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  SIZES,
  FONTS,
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import HomeHeader from "../../components/home/HomeHeader";
import SearchBar from "../../components/home/SearchBar";
import QuickActions from "../../components/home/QuickActions";
import RecentActivity from "../../components/home/RecentActivity";
import BubbleFeature from "../../components/home/BubbleFeature";
import NewsSection from "../../components/home/NewsSection";
import StreakCard from "../../components/home/StreakCard";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import FeaturedModules from "../../components/home/FeaturedModules";
import { useAuth } from "../../contexts/AuthContext";
import userStorage from "../../utils/userStorage";
import { getUserAvatar } from "../../utils/avatarUtils";
import { useChat } from "../../hooks/useChat";
import { useActivity } from "../../hooks/useActivity";
import { useNews } from "../../hooks/useNews";
import Skeleton from "../../components/common/Skeleton";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const { user: authUser } = useAuth();
  const { chats } = useChat();
  const { activities, loading: activitiesLoading } = useActivity();
  const { featuredNews, loading: newsLoading } = useNews();
  const { t } = useTranslation();

  // User data'yı yükle
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);

      try {
        const data = await userStorage.getUserData();
        if (authUser?.id) {
          const profileData = await userStorage.getProfileFromDatabase(
            authUser.id
          );
          setUserData({ ...data, ...profileData });
        } else {
          setUserData(data);
        }
      } catch (error) {
        if (__DEV__) console.error("❌ HOME: Load user data error:", error);
        setUserData(null);
      } finally {
        // News loading'i de bekliyoruz
        if (!newsLoading) {
          setIsLoading(false);
        }
      }
    };

    if (authUser?.id) {
      loadUserData();
    }
  }, [authUser?.id, newsLoading]);

  // Kullanıcı verilerini birleştir
  const user = {
    ...authUser,
    ...userData,
    avatar_url: userData?.avatar_url || null, // Database'den gelen avatar
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    content: {
      flex: 1,
    },
    personalAssistantContainer: {
      paddingHorizontal: SPACING.md,
      marginVertical: SPACING.sm,
    },
    robotCard: {
      borderRadius: BORDER_RADIUS.lg,
      overflow: "hidden",
      ...SHADOWS.medium,
    },
    robotGradient: {
      padding: SPACING.md,
    },
    robotContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    robotImageContainer: {
      width: 60,
      height: 60,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
      overflow: "hidden",
    },
    robotImage: {
      width: 58,
      height: 58,
      resizeMode: "contain",
    },
    robotTextContainer: {
      flex: 1,
    },
    robotTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.xs / 2,
    },
    robotTitle: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    sparkleIcon: {
      marginLeft: SPACING.xs,
    },
    robotDescription: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    chevronIcon: {
      marginLeft: SPACING.xs,
      opacity: 0.5,
    },
  });

  // Haberler Supabase'den geliyor (useNews hook'undan)

  // Modül veya hızlı erişim butonu tıklandığında
  const handleHomeModulePress = (module) => {
    if (module.route) {
      navigation.navigate(module.route);
    }
  };

  // Son aktivite öğesi tıklandığında
  const handleActivityPress = (activity) => {
    navigation.navigate("Activity");
  };

  // Haber kartı tıklandığında
  const handleNewsPress = (news) => {
    navigation.navigate("News", { screen: "NewsDetail", params: { news } });
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <GradientBackground mode="default">
        <SafeAreaView style={styles.container}>
          <HomeHeader
            // onProfilePress={() => navigation.navigate("Profile")}
            // onSettingsPress={() => navigation.navigate("Settings")}
            // navigation={navigation}
            showProfileImage={true}
            user={user}
          />

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading Skeleton */}
            <View style={{ padding: SPACING.md }}>
              {/* News Slider Skeleton */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Skeleton
                  width={120}
                  height={24}
                  style={{ marginBottom: SPACING.sm }}
                />
                <View style={{ flexDirection: "row" }}>
                  <Skeleton
                    width={280}
                    height={180}
                    borderRadius={20}
                    style={{ marginRight: SPACING.sm }}
                  />
                  <Skeleton width={280} height={180} borderRadius={20} />
                </View>
              </View>

              {/* AI Assistant Card Skeleton */}
              <View
                style={{
                  padding: SPACING.md,
                  backgroundColor: colors.card,
                  borderRadius: BORDER_RADIUS.lg,
                  marginBottom: SPACING.lg,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: SPACING.sm,
                  }}
                >
                  <Skeleton
                    circle
                    width={50}
                    height={50}
                    style={{ marginRight: SPACING.sm }}
                  />
                  <View style={{ flex: 1 }}>
                    <Skeleton
                      width="60%"
                      height={20}
                      style={{ marginBottom: 6 }}
                    />
                    <Skeleton width="80%" height={16} />
                  </View>
                </View>
              </View>

              {/* Quick Actions Skeleton */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Skeleton
                  width={140}
                  height={24}
                  style={{ marginBottom: SPACING.sm }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: SPACING.sm,
                  }}
                >
                  {[1, 2, 3].map((_, i) => (
                    <Skeleton
                      key={i}
                      width={(styles.container.width || 360) / 3.5}
                      height={100}
                      borderRadius={16}
                    />
                  ))}
                </View>
              </View>

              {/* Activities Skeleton */}
              <View style={{ marginBottom: SPACING.lg }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: SPACING.sm,
                  }}
                >
                  <Skeleton width={140} height={24} />
                  <Skeleton width={80} height={20} />
                </View>
                {[1, 2, 3].map((_, i) => (
                  <View
                    key={i}
                    style={{
                      padding: SPACING.md,
                      backgroundColor: colors.card,
                      borderRadius: BORDER_RADIUS.lg,
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Skeleton
                        circle
                        width={40}
                        height={40}
                        style={{ marginRight: SPACING.sm }}
                      />
                      <View style={{ flex: 1 }}>
                        <Skeleton
                          width="70%"
                          height={18}
                          style={{ marginBottom: 6 }}
                        />
                        <Skeleton width="50%" height={14} />
                      </View>
                      <Skeleton width={60} height={24} borderRadius={12} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <HomeHeader
          onProfilePress={() => navigation.navigate("Profile")}
          onSettingsPress={() => navigation.navigate("Settings")}
          navigation={navigation}
          showProfileImage={true}
          user={user}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Son Yenilikler ve Kampanyalar - Supabase'den */}
          {featuredNews.length > 0 && (
            <NewsSection data={featuredNews} onCardPress={handleNewsPress} />
          )}

          {/* 7 Günlük Seri Kartı */}
          {authUser?.id && (
            <StreakCard
              onPress={() => {
                // Profile tab'ına git, sonra Tokens ekranına yönlendir
                navigation.navigate("Profile", {
                  screen: "Tokens",
                });
              }}
            />
          )}

          {/* Kişisel AI Asistan Kartı */}
          <View style={styles.personalAssistantContainer}>
            <TouchableOpacity
              style={styles.robotCard}
              onPress={() => navigation.navigate("Chat")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  isDark
                    ? ["rgba(139, 92, 246, 0.3)", "rgba(59, 130, 246, 0.3)"]
                    : ["rgba(139, 92, 246, 0.15)", "rgba(59, 130, 246, 0.15)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.robotGradient}
              >
                <View style={styles.robotContent}>
                  <View style={styles.robotImageContainer}>
                    <Image
                      source={require("../../assets/images/logo.png")}
                      style={styles.robotImage}
                    />
                  </View>
                  <View style={styles.robotTextContainer}>
                    <View style={styles.robotTitleRow}>
                      <Text style={styles.robotTitle}>
                        {t("home.assistant.title")}
                      </Text>
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color={colors.primary}
                        style={styles.sparkleIcon}
                      />
                    </View>
                    <Text style={styles.robotDescription} numberOfLines={2}>
                      {t("home.assistant.description")}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.chevronIcon}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <QuickActions onActionPress={handleHomeModulePress} />

          {/* Son Aktiviteler Bölümü */}
          <RecentActivity
            data={activities.slice(0, 3)}
            onItemPress={handleActivityPress}
            onSeeAllPress={() => navigation.navigate("Activity")}
            onNavigate={(route, params) => navigation.navigate(route, params)}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default HomeScreen;
