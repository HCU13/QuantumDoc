import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

/**
 * In-app rating prompt.
 *
 * We never ask cold. The native review sheet is shown only after the user has
 * had several *successful* moments (a solved problem, a finished exam), and only
 * at a happy beat (a correct solve / a high exam score). Apple throttles the real
 * sheet to ~3 prompts per year, so we guard hard to avoid burning those on a bad
 * moment.
 */

const SUCCESS_COUNT_KEY = "@quorax_review_success_count";
const LAST_PROMPT_AT_KEY = "@quorax_review_last_prompt_at";
const PROMPTED_COUNT_KEY = "@quorax_review_prompted_count";

// How many successful actions before the first ask.
const MIN_SUCCESSES_BEFORE_PROMPT = 3;
// Don't ask again within this window even if eligible (ms). ~45 days.
const MIN_DAYS_BETWEEN_PROMPTS = 45 * 24 * 60 * 60 * 1000;
// Stop asking entirely after this many prompts (Apple caps at 3/yr anyway).
const MAX_PROMPTS_EVER = 3;

async function getNumber(key: string): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v != null ? Number(v) : 0;
  } catch {
    return 0;
  }
}

/**
 * Call on every successful, satisfying action (solve shown, exam report opened).
 * `happy` should be true only when the moment is genuinely positive
 * (correct answer, good score) — we only show the sheet on happy beats.
 */
export async function registerSuccessAndMaybePrompt(happy: boolean): Promise<void> {
  try {
    const successes = (await getNumber(SUCCESS_COUNT_KEY)) + 1;
    await AsyncStorage.setItem(SUCCESS_COUNT_KEY, String(successes));

    if (!happy) return;
    if (successes < MIN_SUCCESSES_BEFORE_PROMPT) return;

    const promptedCount = await getNumber(PROMPTED_COUNT_KEY);
    if (promptedCount >= MAX_PROMPTS_EVER) return;

    const lastPromptAt = await getNumber(LAST_PROMPT_AT_KEY);
    if (lastPromptAt && Date.now() - lastPromptAt < MIN_DAYS_BETWEEN_PROMPTS) return;

    const available = await StoreReview.isAvailableAsync();
    if (!available) return;

    // Record the attempt *before* showing — the system sheet gives no callback,
    // and we'd rather under-ask than spam if something throws mid-flow.
    await AsyncStorage.multiSet([
      [LAST_PROMPT_AT_KEY, String(Date.now())],
      [PROMPTED_COUNT_KEY, String(promptedCount + 1)],
    ]);

    await StoreReview.requestReview();
  } catch {
    // Reviews are best-effort; never let this break a user flow.
  }
}
