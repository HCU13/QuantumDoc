import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { ActivityItem } from "@/components/home/ActivityItem";
import {
  BentoCard,
  HapticPressable,
  QuietHeader,
  SoftSurface,
  SuggestionCard,
} from "@/components/v2";
import { SPACING_V2 } from "@/constants/theme";
import { useActivity } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";

type UsageInfo = { used: number; limit: number; remaining: number } | null;

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, profile, isLoggedIn, isAnonymous } = useAuth();
  const { activities } = useActivity();
  const { isPremium, checkUsageLimit } = useSubscription();

  // Anonymous users carry a DB-default "Guest" full_name from the auth trigger —
  // don't surface it; show a localized greeting instead.
  const userName = isAnonymous
    ? ""
    : profile?.full_name ||
      profile?.display_name ||
      user?.email?.split("@")[0] ||
      "";

  const [usageMap, setUsageMap] = React.useState<Record<string, UsageInfo>>({});

  React.useEffect(() => {
    if (!isLoggedIn || isPremium) return;
    const modules = ["math", "exam_lab", "chat"] as const;
    Promise.all(
      modules.map(async (m) => {
        const info = await checkUsageLimit(m);
        return [m, info] as const;
      }),
    ).then((results) => {
      const map: Record<string, UsageInfo> = {};
      results.forEach(([m, info]) => {
        if (info)
          map[m] = {
            used: info.used,
            limit: info.limit,
            remaining: info.remaining,
          };
      });
      setUsageMap(map);
    });
  }, [isLoggedIn, isPremium]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 6) return t("home.greetingNight", { defaultValue: "Good night," });
    if (hour < 12) return t("home.greetingMorning", { defaultValue: "Good morning," });
    if (hour < 18) return t("home.greetingAfternoon", { defaultValue: "Good afternoon," });
    return t("home.greetingEvening", { defaultValue: "Good evening," });
  })();

  const dateLabel = new Date().toLocaleDateString(i18n.language, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
          {
            text: t("modules.lockedAlert.signIn"),
            onPress: () => router.push("/(main)/login" as any),
          },
        ],
      );
      return;
    }
    router.push(`/(main)/${moduleId}` as any);
  };

  // Pick a contextual suggestion: most recent activity or default to exam-lab
  const recentActivities = activities.slice(0, 3);
  const lastActivity = activities[0];
  const suggestion = lastActivity
    ? {
        title:
          lastActivity.type === "math"
            ? t("modules.math.title")
            : lastActivity.type === "exam"
            ? t("modules.examLab.title")
            : lastActivity.type === "chat"
            ? t("modules.chat.title")
            : t("modules.calculator.title"),
        subtitle: lastActivity.title ?? "",
        accent:
          lastActivity.type === "math"
            ? colors.moduleMathPrimary
            : lastActivity.type === "exam"
            ? colors.moduleExamLabPrimary
            : lastActivity.type === "chat"
            ? colors.moduleChatPrimary
            : colors.moduleCalcPrimary,
        icon:
          lastActivity.type === "math"
            ? ("calculator-outline" as const)
            : lastActivity.type === "exam"
            ? ("document-text-outline" as const)
            : lastActivity.type === "chat"
            ? ("chatbubble-ellipses-outline" as const)
            : ("sparkles" as const),
        moduleId:
          lastActivity.type === "math"
            ? "math"
            : lastActivity.type === "exam"
            ? "exam-lab"
            : lastActivity.type === "chat"
            ? "chat"
            : "calculator",
      }
    : {
        title: t("modules.examLab.title"),
        subtitle: t("home.suggestionStartLearning", {
          defaultValue: "Start your first exam session",
        }),
        accent: colors.moduleExamLabPrimary,
        icon: "document-text-outline" as const,
        moduleId: "exam-lab",
      };

  // Streak (placeholder — derive from activities count of distinct days)
  const streakDays = (() => {
    if (!activities.length) return 0;
    const days = new Set(
      activities.map((a) => new Date(a.timestamp).toDateString()),
    );
    return days.size;
  })();

  return (
    <SoftSurface tone="warm">
      <StatusBar style={isDark ? "light" : "dark"} />

      <QuietHeader
        greeting={greeting}
        name={userName}
        subtitle={dateLabel}
        isPremium={isPremium}
        onAvatarPress={() => router.push("/(main)/profile" as any)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero: AI-native suggestion */}
        {isLoggedIn && (
          <SuggestionCard
            eyebrow={t("home.continue", { defaultValue: "Continue" })}
            title={suggestion.title}
            subtitle={suggestion.subtitle}
            icon={suggestion.icon}
            accent={suggestion.accent}
            onPress={() => handleModulePress(suggestion.moduleId)}
          />
        )}

        {/* 2x2 grid: 4 modules, equal weight */}
        <View style={[styles.bentoRow, { marginTop: isLoggedIn ? SPACING_V2.md : 0 }]}>
          <BentoCard
            size="md"
            title={t("modules.math.title")}
            subtitle={t("modules.math.description")}
            icon="calculator-outline"
            accent={colors.moduleMathPrimary}
            badge={
              !isPremium && usageMap.math
                ? `${usageMap.math.remaining}`
                : undefined
            }
            onPress={() => handleModulePress("math")}
          />
          <BentoCard
            size="md"
            title={t("modules.examLab.title")}
            subtitle={t("modules.examLab.description")}
            icon="document-text-outline"
            accent={colors.moduleExamLabPrimary}
            badge={
              !isPremium && usageMap.exam_lab
                ? `${usageMap.exam_lab.remaining}`
                : undefined
            }
            onPress={() => handleModulePress("exam-lab")}
          />
        </View>

        <View style={styles.bentoRow}>
          <BentoCard
            size="md"
            title={t("modules.chat.title")}
            subtitle={t("modules.chat.description")}
            icon="chatbubble-ellipses-outline"
            accent={colors.moduleChatPrimary}
            badge={
              !isPremium && usageMap.chat
                ? `${usageMap.chat.remaining}`
                : undefined
            }
            onPress={() => handleModulePress("chat")}
          />
          <BentoCard
            size="md"
            title={t("modules.calculator.title")}
            subtitle={t("modules.calculator.description")}
            icon="calculator"
            accent={colors.moduleCalcPrimary}
            onPress={() => handleModulePress("calculator")}
          />
        </View>

        {/* Recent — sade liste */}
        {isLoggedIn && recentActivities.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <View style={styles.recentTitleRow}>
                <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>
                  {t("home.recentActivity", { defaultValue: "Recent" })}
                </Text>
                {streakDays > 0 && (
                  <View style={styles.streakChip}>
                    <Text style={styles.streakFlame}>🔥</Text>
                    <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                      {streakDays}
                    </Text>
                  </View>
                )}
              </View>
              <HapticPressable
                haptic="light"
                onPress={() => router.push("/(main)/activity" as any)}
              >
                <Text style={[styles.viewAll, { color: colors.primary }]}>
                  {t("home.viewAll", { defaultValue: "View all" })}
                </Text>
              </HapticPressable>
            </View>
            <View style={styles.recentList}>
              {recentActivities.map((activity) => (
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
              ))}
            </View>
          </View>
        )}

        <View style={{ height: SPACING_V2.xxl }} />
      </ScrollView>
    </SoftSurface>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING_V2.lg,
    paddingTop: SPACING_V2.sm,
    paddingBottom: SPACING_V2.xl,
  },
  bentoRow: {
    flexDirection: "row",
    gap: SPACING_V2.md,
    marginTop: SPACING_V2.md,
  },
  recentSection: {
    marginTop: SPACING_V2.xl,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING_V2.md,
  },
  recentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING_V2.sm,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
  },
  streakFlame: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "700",
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "600",
  },
  recentList: {
    gap: SPACING_V2.sm,
  },
});
