import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "@quorax_welcome_shown";

export function useWelcomeModal() {
  const [shouldShow, setShouldShow] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    check();
  }, []);

  const check = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (!value) {
        // Küçük gecikme — splash/onboarding geçişinin üstüne binmesin
        setTimeout(() => setShouldShow(true), 800);
      }
    } catch {}
  };

  const dismiss = async () => {
    setShouldShow(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  return { shouldShow, dismiss };
}
