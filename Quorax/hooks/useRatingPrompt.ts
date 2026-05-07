import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase, TABLES } from "@/services/supabase";

const SHOW_INTERVALS = [5, 20]; // 5. girişte, skip ederse 20. girişte göster

export function useRatingPrompt() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    // Auth yüklenene kadar bekle
    if (isLoading) return;
    // Sadece bir kez çalış
    if (checkedRef.current) return;
    // Giriş yapmamışsa gösterme
    if (!isLoggedIn || !user?.id) return;

    checkedRef.current = true;
    check(user.id);
  }, [isLoading, isLoggedIn, user?.id]);

  const check = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from(TABLES.PROFILES)
        .select("rating_prompt_shown, rating_choice, app_session_count, created_at")
        .eq("id", userId)
        .single();

      if (error || !profile) return;

      // Daha önce yes veya no seçtiyse bir daha gösterme
      if (profile.rating_choice === "yes" || profile.rating_choice === "no") return;

      // Hesap en az 1 günlük olmalı
      if (profile.created_at) {
        const accountAgeMs = Date.now() - new Date(profile.created_at).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (accountAgeMs < oneDayMs) return;
      }

      // Session sayacını artır
      const newCount = (profile.app_session_count ?? 0) + 1;
      await supabase
        .from(TABLES.PROFILES)
        .update({ app_session_count: newCount })
        .eq("id", userId);

      if (SHOW_INTERVALS.includes(newCount)) {
        setShouldShow(true);
      }
    } catch {
      // Rating prompt kritik değil
    }
  };

  const markPrompted = async (choice: "yes" | "no" | "skip") => {
    setShouldShow(false);
    if (!user?.id) return;

    await supabase
      .from(TABLES.PROFILES)
      .update({
        rating_prompt_shown: true,
        rating_prompt_shown_at: new Date().toISOString(),
        ...(choice !== "skip" && {
          rating_choice: choice,
          rating_choice_at: new Date().toISOString(),
        }),
      })
      .eq("id", user.id);
  };

  return { shouldShow, markPrompted };
}
