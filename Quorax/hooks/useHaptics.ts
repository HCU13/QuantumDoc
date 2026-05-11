import * as Haptics from "expo-haptics";
import { useCallback } from "react";

/**
 * 2026: Tüm interaktif elemanlarda kullanılacak haptic API.
 * Hata durumunda sessizce yutar (tarayıcı / unsupported device).
 */
export function useHaptics() {
  const safe = (fn: () => Promise<void>) => {
    fn().catch(() => {
      /* noop */
    });
  };

  const selection = useCallback(() => safe(Haptics.selectionAsync), []);

  const impactLight = useCallback(
    () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    [],
  );
  const impactMedium = useCallback(
    () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
    [],
  );
  const impactHeavy = useCallback(
    () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
    [],
  );

  const success = useCallback(
    () =>
      safe(() =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      ),
    [],
  );
  const warning = useCallback(
    () =>
      safe(() =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
      ),
    [],
  );
  const error = useCallback(
    () =>
      safe(() =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      ),
    [],
  );

  return {
    selection,
    impactLight,
    impactMedium,
    impactHeavy,
    success,
    warning,
    error,
  };
}
