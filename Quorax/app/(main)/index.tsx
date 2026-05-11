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
import { NotebookBackground } from "@/components/common/NotebookBackground";

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
    if (moduleId === "calculator") {
      router.push(`/(main)/${moduleId}` as any);
      return;
    }

    if (!isLoggedIn) {
      Alert.alert(
        t("modules.lockedAlert.title"),
        t("modules.lockedAlert.message"),
        [
          { text: t("modules.lockedAlert.cancel"), style: "cancel" },
          { text: t("modules.lockedAlert.signIn"), onPress: () => router.push("/(main)/login" as any) },
        ]
      );
      return;
    }

    router.push(`/(main)/${moduleId}` as any);
  };


  return (
    <NotebookBackground cornerGlyphs={["∮", "λ"]}>
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
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            §  {t("home.otherTools")}
          </Text>
          <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />

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
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={[styles.sectionLabel, { color: colors.primary }]}>
                §  {t("home.recentActivity")}
              </Text>
              <View
                style={[styles.sectionAccent, { backgroundColor: colors.primary }]}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(main)/activity" as any)}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                {t("home.viewAll")} →
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
    </NotebookBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },

  primarySection: {
    marginBottom: SPACING.xl,
  },

  secondarySection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: SPACING.xs,
  },
  sectionAccent: {
    width: 32,
    height: 3,
    borderRadius: 2,
    opacity: 0.85,
    marginBottom: SPACING.md,
  },
  secondaryListWrap: {
    marginLeft: -SPACING.xl,
    marginRight: -SPACING.xl,
  },
  secondaryScrollContent: {
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.xl,
  },

  historySection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
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
