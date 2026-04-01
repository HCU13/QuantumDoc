import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

const KEYS = {
  SESSION_COUNT: "@quorax_session_count",
  FIRST_LAUNCH_DATE: "@quorax_first_launch_date",
  RATING_PROMPTED: "@quorax_rating_prompted",
};

const MIN_SESSIONS = 5;          // en az 5. oturumda göster
const MIN_DAYS_SINCE_INSTALL = 1; // asla ilk günde

export function useRatingPrompt() {
  const [shouldShow, setShouldShow] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    checkAndMaybePrompt();
  }, []);

  const checkAndMaybePrompt = async () => {
    try {
      // Daha önce gösterildi mi?
      const alreadyPrompted = await AsyncStorage.getItem(KEYS.RATING_PROMPTED);
      if (alreadyPrompted) return;

      // İlk başlatma tarihini kaydet (yoksa)
      let firstLaunchDate = await AsyncStorage.getItem(KEYS.FIRST_LAUNCH_DATE);
      if (!firstLaunchDate) {
        firstLaunchDate = new Date().toISOString();
        await AsyncStorage.setItem(KEYS.FIRST_LAUNCH_DATE, firstLaunchDate);
      }

      // Kaç gün geçti?
      const daysSinceInstall =
        (Date.now() - new Date(firstLaunchDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceInstall < MIN_DAYS_SINCE_INSTALL) return;

      // Oturum sayacını artır
      const countStr = await AsyncStorage.getItem(KEYS.SESSION_COUNT);
      const count = (parseInt(countStr ?? "0", 10) || 0) + 1;
      await AsyncStorage.setItem(KEYS.SESSION_COUNT, String(count));

      // 5. oturumdan itibaren göster
      if (count >= MIN_SESSIONS) {
        setShouldShow(true);
      }
    } catch {
      // Sessizce devam et — rating prompt kritik değil
    }
  };

  const markPrompted = async () => {
    setShouldShow(false);
    try {
      await AsyncStorage.setItem(KEYS.RATING_PROMPTED, "true");
    } catch {}
  };

  return { shouldShow, markPrompted };
}
