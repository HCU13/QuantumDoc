import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_ID_KEY = "@quorax_daily_reminder_id";
const REMINDER_HOUR_KEY = "@quorax_daily_reminder_hour";
const REMINDER_MINUTE_KEY = "@quorax_daily_reminder_minute";
const REMINDER_ENABLED_KEY = "@quorax_daily_reminder_enabled";

export const DEFAULT_REMINDER_HOUR = 19;
export const DEFAULT_REMINDER_MINUTE = 0;

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const [enabled, hour, minute] = await Promise.all([
      AsyncStorage.getItem(REMINDER_ENABLED_KEY),
      AsyncStorage.getItem(REMINDER_HOUR_KEY),
      AsyncStorage.getItem(REMINDER_MINUTE_KEY),
    ]);
    return {
      enabled: enabled === "true",
      hour: hour != null ? Number(hour) : DEFAULT_REMINDER_HOUR,
      minute: minute != null ? Number(minute) : DEFAULT_REMINDER_MINUTE,
    };
  } catch {
    return { enabled: false, hour: DEFAULT_REMINDER_HOUR, minute: DEFAULT_REMINDER_MINUTE };
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(REMINDER_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      await AsyncStorage.removeItem(REMINDER_ID_KEY);
    }
    await AsyncStorage.setItem(REMINDER_ENABLED_KEY, "false");
  } catch {
    // ignore
  }
}

/**
 * Schedule (or reschedule) a repeating daily local notification at the given hour:minute.
 * Returns true on success. Requires notification permission to already be granted.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<boolean> {
  try {
    if (Platform.OS === "web") return false;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return false;

    // Cancel any previously scheduled reminder before creating a new one
    await cancelDailyReminder();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      } as any,
    });

    await Promise.all([
      AsyncStorage.setItem(REMINDER_ID_KEY, id),
      AsyncStorage.setItem(REMINDER_HOUR_KEY, String(hour)),
      AsyncStorage.setItem(REMINDER_MINUTE_KEY, String(minute)),
      AsyncStorage.setItem(REMINDER_ENABLED_KEY, "true"),
    ]);
    return true;
  } catch {
    return false;
  }
}
