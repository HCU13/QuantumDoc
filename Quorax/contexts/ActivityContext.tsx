import type { Activity } from "@/components/home/ActivityItem";
import { supabase, TABLES } from "@/services/supabase";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  fetchRecentActivities: () => Promise<void>;
  clearAllActivities: () => Promise<boolean>;
  deleteActivity: (
    activityId: string,
    activityType: string,
  ) => Promise<boolean>;
  refreshActivities: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, isLoggedIn } = useAuth();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // Zaman formatla
  const formatTime = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("home.activity.justNow") || "Az önce";
    if (diffMins < 60)
      return `${diffMins} ${t("home.activity.minutesAgo") || "dakika önce"}`;
    if (diffHours < 24)
      return `${diffHours} ${t("home.activity.hoursAgo") || "saat önce"}`;
    if (diffDays === 1) return t("home.activity.yesterday") || "Dün";
    if (diffDays < 7)
      return `${diffDays} ${t("home.activity.daysAgo") || "gün önce"}`;

    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  // Son aktiviteleri yükle (ana sayfa için - sadece 3 tane)
  const fetchRecentActivities = useCallback(async () => {
    if (!user?.id || !isLoggedIn) {
      setActivities([]);
      return;
    }

    setLoading(true);
    try {
      // 1. Matematik geçmişi
      const { data: mathData } = await supabase
        .from("math_solutions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // 2. Sınav sonuçları (konu, doğru/toplam)
      const { data: examData } = await supabase
        .from(TABLES.EXAM_RESULTS)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const allActivities: (Activity & { created_at: string })[] = [
        ...(mathData || []).map((math) => ({
          id: `math-${math.id}`,
          type: "math" as const,
          title:
            math.problem_text?.slice(0, 50) ||
            t("home.activity.mathProblem") ||
            "Matematik problemi",
          timestamp: formatTime(math.created_at),
          tokenCost: 0,
          problemImageUrl: math.problem_image_url || undefined,
          created_at: math.created_at,
        })),
        ...(examData || []).map((exam) => ({
          id: `exam-${exam.id}`,
          type: "exam" as const,
          title: exam.topic || t("home.activity.exam") || "Sınav",
          subtitle: `${exam.correct_count}/${exam.total_questions} ${t("home.activity.correctShort") || "doğru"}`,
          timestamp: formatTime(exam.created_at),
          created_at: exam.created_at,
        })),
      ];

      // Tarihe göre sırala ve ilk 3'ünü al
      allActivities.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setActivities(
        allActivities
          .slice(0, 3)
          .map(({ created_at, ...activity }) => activity),
      );
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [user, isLoggedIn, t]);

  // Tüm aktiviteleri sil
  const clearAllActivities = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      await Promise.all([
        supabase.from("math_solutions").delete().eq("user_id", user.id),
        supabase.from(TABLES.EXAM_RESULTS).delete().eq("user_id", user.id),
      ]);
      setActivities([]);
      return true;
    } catch (error: any) {
      console.error("Error clearing activities:", error);
      return false;
    }
  }, [user]);

  // Tek bir aktiviteyi sil
  const deleteActivity = useCallback(
    async (activityId: string, activityType: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        if (activityType === "math" && activityId.startsWith("math-")) {
          const mathId = activityId.replace("math-", "");
          const { error } = await supabase
            .from("math_solutions")
            .delete()
            .eq("id", mathId)
            .eq("user_id", user.id);
          if (error) throw error;
        } else if (activityType === "exam" && activityId.startsWith("exam-")) {
          const examId = activityId.replace("exam-", "");
          const { error } = await supabase
            .from(TABLES.EXAM_RESULTS)
            .delete()
            .eq("id", examId)
            .eq("user_id", user.id);
          if (error) throw error;
        }
        setActivities((prev) => prev.filter((act) => act.id !== activityId));
        return true;
      } catch (error: any) {
        console.error("Error deleting activity:", error);
        return false;
      }
    },
    [user],
  );

  // Aktivite listesini yenile
  const refreshActivities = useCallback(async () => {
    await fetchRecentActivities();
  }, [fetchRecentActivities]);

  // Kullanıcı değiştiğinde veya giriş yaptığında aktiviteleri yükle
  React.useEffect(() => {
    if (isLoggedIn && user) {
      fetchRecentActivities();
    } else {
      setActivities([]);
    }
  }, [isLoggedIn, user, fetchRecentActivities]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loading,
        fetchRecentActivities,
        clearAllActivities,
        deleteActivity,
        refreshActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
