import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActivity } from "@/contexts/ActivityContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from "@/constants/theme";
import { MODULES } from "@/constants/modules";
import { Header } from "@/components/home/Header";
import { ModuleCard } from "@/components/home/ModuleCard";
import { ActivityItem, type Activity } from "@/components/home/ActivityItem";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, isLoggedIn } = useAuth();

  const userName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || "";

  // Context'ten aktiviteleri al
  const { activities, loading: loadingActivities } = useActivity();
  const { isPremium, checkUsageLimit } = useSubscription();

  const [usageMap, setUsageMap] = React.useState<Record<string, { used: number; limit: number; remaining: number } | null>>({});

  React.useEffect(() => {
    if (!isLoggedIn || isPremium) return;
    const modules = ["math", "exam_lab", "chat"] as const;
    Promise.all(modules.map(async (m) => {
      const info = await checkUsageLimit(m);
      return [m, info] as const;
    })).then((results) => {
      const map: typeof usageMap = {};
      results.forEach(([m, info]) => {
        if (info) map[m] = { used: info.used, limit: info.limit, remaining: info.remaining };
      });
      setUsageMap(map);
    });
  }, [isLoggedIn, isPremium]);

  const handleModulePress = (moduleId: string) => {
    // Calculator is always available
    if (moduleId === "calculator") {
      router.push(`/(main)/${moduleId}` as any);
      return;
    }
    
    // Other modules require login
    if (!isLoggedIn) {
      // Navigate to login screen
      router.push("/(main)/login" as any);
      return;
    }
    
    router.push(`/(main)/${moduleId}` as any);
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Header
        userName={userName}
        onProfilePress={() => {
          router.push("/(main)/profile" as any);
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PRIMARY: Math + Exam Lab */}
        <View style={styles.primarySection}>
          {MODULES.filter((m) => m.isPrimary).map((module) => {
            const rpcId = module.id === "exam-lab" ? "exam_lab" : module.id;
            return (
              <ModuleCard
                key={module.id}
                module={module}
                isLoggedIn={isLoggedIn}
                onPress={() => handleModulePress(module.id)}
                usageInfo={!isPremium ? usageMap[rpcId] : null}
              />
            );
          })}
        </View>

        {/* SECONDARY */}
        <View style={styles.secondarySection}>
          <Text
            style={[styles.secondaryTitle, { color: colors.primary }]}
          >
            {t("home.otherTools")}
          </Text>

          <View style={styles.secondaryListWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.secondaryScrollContent}
            >
              {MODULES.filter((m) => !m.isPrimary).map((module) => {
                const rpcId = module.id === "exam-lab" ? "exam_lab" : module.id;
                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    isLoggedIn={isLoggedIn}
                    onPress={() => handleModulePress(module.id)}
                    usageInfo={!isPremium ? usageMap[rpcId] : null}
                  />
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* HISTORY */}
        {isLoggedIn && (
        <View
          style={[
            styles.historySection,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={styles.historyHeader}>
            <Text
              style={[styles.historyTitle, { color: colors.primary }]}
            >
              {t("home.recentActivity")}
            </Text>
              <TouchableOpacity
                onPress={() => router.push("/(main)/activity" as any)}
              >
              <Text
                style={[styles.viewAllText, { color: colors.primary }]}
              >
                {t("home.viewAll")}
              </Text>
            </TouchableOpacity>
          </View>

            {loadingActivities ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
                  onPress={() => {
                    router.push({
                      pathname: "/(main)/activity/[id]",
                      params: { id: activity.id, type: activity.type },
                    } as any);
                  }}
            />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={32} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  {t("home.noActivity")}
                </Text>
              </View>
            )}
        </View>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  primarySection: {
    marginBottom: SPACING.lg,
  },

  secondarySection: {
    marginBottom: SPACING.lg, // CHANGED
  },
  secondaryTitle: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "600",
    marginBottom: SPACING.sm, // CHANGED
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    opacity: 0.7,
  },
  secondaryListWrap: {
    marginLeft: -SPACING.lg,
    marginRight: -SPACING.lg,
  },
  secondaryScrollContent: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg,
  },

  historySection: {
    marginTop: SPACING.md,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  historyTitle: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.4,
    opacity: 0.7,
  },
  viewAllText: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 11,
  },
  loadingContainer: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: SPACING.md,
    alignItems: "center",
    gap: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 13,
  },
});
