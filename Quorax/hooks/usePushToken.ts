import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { supabase, TABLES } from "@/services/supabase";

export const usePushToken = () => {
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;
    registerAndSave(user.id);
  }, [isLoggedIn, user?.id]);
};

async function registerAndSave(userId: string) {
  try {
    // iOS/Android fiziksel cihaz kontrolü
    if (Platform.OS === "web") return;

    // İzin iste
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    // Expo Push Token al
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    if (!token) return;

    // DB'ye kaydet
    await supabase
      .from(TABLES.PROFILES)
      .update({
        push_token: token,
        push_token_updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch {
    // Sessizce hata yut — bildirim izni kritik değil
  }
}
