import * as StoreReview from "expo-store-review";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase, TABLES } from "@/services/supabase";

// Trigger at solve #N (lifetime session count). Apple's StoreReview API
// internally caps to 3 prompts/year, so we can call it relatively liberally.
const MIN_SESSIONS_TO_PROMPT = 3;

export function useRatingPrompt() {
  const { user, isLoading, isAnonymous } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (checkedRef.current) return;
    // Anonim user için DB write yine de çalışır, ama bu prompt'u
    // anonim user'lara göstermiyoruz (henüz commitment yok).
    if (!user?.id || isAnonymous) return;

    checkedRef.current = true;
    check(user.id);
  }, [isLoading, user?.id, isAnonymous]);

  const check = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from(TABLES.PROFILES)
        .select("rating_choice, app_session_count")
        .eq("id", userId)
        .maybeSingle();

      if (error || !profile) return;

      // Daha önce yes/no seçtiyse bir daha gösterme.
      if (profile.rating_choice === "yes" || profile.rating_choice === "no") return;

      const newCount = (profile.app_session_count ?? 0) + 1;
      await supabase
        .from(TABLES.PROFILES)
        .update({ app_session_count: newCount })
        .eq("id", userId);

      if (newCount >= MIN_SESSIONS_TO_PROMPT) {
        // Prefer Apple's native StoreReview API — it's quiet, capped to 3/year,
        // and never blocks the UX. Fall back to our custom modal if unavailable.
        try {
          const available = await StoreReview.isAvailableAsync();
          if (available) {
            await StoreReview.requestReview();
            // Mark as prompted to avoid re-triggering custom modal on next session
            await supabase
              .from(TABLES.PROFILES)
              .update({
                rating_prompt_shown: true,
                rating_prompt_shown_at: new Date().toISOString(),
              })
              .eq("id", userId);
            return;
          }
        } catch {
          // Native API fail -> fall back to custom modal
        }
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
