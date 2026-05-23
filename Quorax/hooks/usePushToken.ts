import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { getReminderSettings, scheduleDailyReminder } from "@/services/dailyReminder";
import { supabase, TABLES } from "@/services/supabase";

const SOFT_PROMPT_SEEN_KEY = "@quorax_notif_soft_prompt_seen";

/**
 * Push token kaydı.
 *
 * Bu hook ARTIK OS izin dialog'unu OTOMATİK tetiklemez. Sadece:
 *   - Daha önce izin verilmişse token kaydeder
 *   - İlk OS prompt'u ekrandan tetiklenmesi için ayrı bir helper expose eder
 *
 * Soft prompt akışı:
 *   - Kullanıcı paywall'ı geçtikten / belirli bir milestone'a ulaştıktan sonra
 *     `triggerNotificationSoftPrompt()` çağrılır.
 *   - In-app açıklama modal'ı gösterilir ("Çalışma hatırlatması ister misin?").
 *   - "Evet" basarsa `requestPermissionsAsync()` çağrılır — iOS'un tek-shot
 *     prompt'u harcanır ama %2-3x daha yüksek accept rate ile.
 */
export const usePushToken = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user?.id) return;
    syncTokenIfAlreadyGranted(user.id);
    // Re-arm the daily reminder if the user had it enabled (covers app updates / OS reboots
    // that may not preserve scheduled notifications).
    (async () => {
      const settings = await getReminderSettings();
      if (settings.enabled) {
        await scheduleDailyReminder(
          settings.hour,
          settings.minute,
          t("notifications.daily.title"),
          t("notifications.daily.body"),
        );
      }
    })();
  }, [user?.id]);
};

async function syncTokenIfAlreadyGranted(userId: string) {
  try {
    if (Platform.OS === "web") return;

    // SADECE izin zaten verilmişse token al ve kaydet — yeni prompt tetikleme.
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    if (!token) return;

    await supabase
      .from(TABLES.PROFILES)
      .update({
        push_token: token,
        push_token_updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch {
    // ignore
  }
}

/** Soft prompt UI'sini gösterip "Evet" basıldığında OS dialog'unu tetikler. */
export async function triggerNotificationPermissionPrompt(userId?: string): Promise<boolean> {
  try {
    if (Platform.OS === "web") return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") {
      if (userId) await syncTokenIfAlreadyGranted(userId);
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return false;

    if (userId) await syncTokenIfAlreadyGranted(userId);
    return true;
  } catch {
    return false;
  }
}

/** Soft prompt'un daha önce gösterilip gösterilmediği. */
export async function hasShownNotificationSoftPrompt(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SOFT_PROMPT_SEEN_KEY)) === "true";
  } catch {
    return false;
  }
}

export async function markNotificationSoftPromptShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(SOFT_PROMPT_SEEN_KEY, "true");
  } catch {
    // ignore
  }
}
