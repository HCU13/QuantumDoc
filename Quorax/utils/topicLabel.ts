/**
 * Topic label normalization — translates canonical and legacy category keys to the user's locale.
 *
 * The edge function now stores topics in the canonical English form ("calculus", "algebra", etc.).
 * But the DB also contains pre-migration rows with Turkish labels ("Kalkülüs", "Cebir") or raw
 * AI-generated values. This helper collapses all of those into i18n-translated display text.
 */

import type { TFunction } from "i18next";

// Legacy category labels (Turkish, from the TR-only era) → canonical English keys.
// Add mappings here if more legacy values surface in user data.
const LEGACY_CATEGORY_MAP: Record<string, string> = {
  "Kalkülüs": "calculus",
  "Analiz": "calculus",
  "Cebir": "algebra",
  "Geometri": "geometry",
  "Trigonometri": "trigonometry",
  "İstatistik & Olasılık": "statistics",
  "İstatistik ve Olasılık": "statistics",
  "İstatistik": "statistics",
  "Olasılık": "statistics",
  "Lineer Cebir": "linear_algebra",
  "Sayı Teorisi": "number_theory",
  "Sayılar Teorisi": "number_theory",
  "Temel Matematik": "basic_math",
  "Aritmetik": "basic_math",
  "Diğer": "other",
};

const CANONICAL_KEYS = new Set([
  "algebra",
  "geometry",
  "trigonometry",
  "calculus",
  "statistics",
  "linear_algebra",
  "number_theory",
  "basic_math",
  "other",
]);

/**
 * Convert any raw category string (canonical English, legacy TR, or unknown AI output)
 * into the canonical key — or null if it can't be classified.
 */
export function normalizeCategoryKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (CANONICAL_KEYS.has(trimmed)) return trimmed;
  if (LEGACY_CATEGORY_MAP[trimmed]) return LEGACY_CATEGORY_MAP[trimmed];
  const lower = trimmed.toLowerCase();
  if (CANONICAL_KEYS.has(lower)) return lower;
  return null;
}

/**
 * Translate a raw category string to the user's locale.
 * Falls back to the raw string (or empty) if it doesn't match any known key.
 */
export function getCategoryLabel(raw: string | null | undefined, t: TFunction): string {
  const key = normalizeCategoryKey(raw);
  if (key) return t(`math.topics.categories.${key}`, { defaultValue: key });
  return raw?.trim() || "";
}

/**
 * Format a "category - subtopic" topic string: translate the category, keep the subtopic verbatim.
 * Input examples:
 *   "basic_math - İşlem Önceliği (BODMAS)"  → "Temel Matematik - İşlem Önceliği (BODMAS)"
 *   "Cebir - 1. Dereceden Denklem"          → "Cebir - 1. Dereceden Denklem"
 *   "Trigonometri"                          → "Trigonometri"
 */
export function formatTopicDisplay(topic: string | null | undefined, t: TFunction): string {
  if (!topic) return "";
  const s = topic.trim();
  const dashMatch = s.match(/^([^\s-]+(?:\s[^\s-]+)*)\s*[-–]\s*(.+)$/);
  if (dashMatch) {
    const [, rawCategory, subtopic] = dashMatch;
    const categoryLabel = getCategoryLabel(rawCategory, t);
    return `${categoryLabel} - ${subtopic.trim()}`;
  }
  // No "category - subtopic" format — treat the whole string as either a category or a subtopic.
  const asCategory = normalizeCategoryKey(s);
  return asCategory ? t(`math.topics.categories.${asCategory}`, { defaultValue: s }) : s;
}
