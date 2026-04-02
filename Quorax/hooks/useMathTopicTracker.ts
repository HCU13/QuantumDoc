// Matematik konu takibi — her çözülen sorunun konusunu kaydeder
// Hangi konularda en çok çalışıldığını ve zayıf alanları göstermek için kullanılır

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@math_topic_history';
const MAX_HISTORY = 100; // En fazla 100 giriş tut

export interface TopicEntry {
  topic: string;
  count: number;
  lastSolvedAt: string; // ISO string
}

export function useMathTopicTracker() {
  const [topicStats, setTopicStats] = useState<TopicEntry[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setTopicStats(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => { load(); }, []);

  // Yeni konu çözüldüğünde çağır
  const trackTopic = useCallback(async (topic: string | null) => {
    if (!topic?.trim()) return;
    const normalized = topic.trim();

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const history: TopicEntry[] = raw ? JSON.parse(raw) : [];

      const existing = history.find((e) => e.topic.toLowerCase() === normalized.toLowerCase());
      if (existing) {
        existing.count += 1;
        existing.lastSolvedAt = new Date().toISOString();
      } else {
        history.push({ topic: normalized, count: 1, lastSolvedAt: new Date().toISOString() });
      }

      // En fazla MAX_HISTORY kayıt, en çok çalışılan önde
      const trimmed = history
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_HISTORY);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      setTopicStats(trimmed);
    } catch {}
  }, []);

  // En çok çalışılan N konu
  const topTopics = useCallback((n = 5): TopicEntry[] => {
    return topicStats.slice(0, n);
  }, [topicStats]);

  // Geçmişi temizle
  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setTopicStats([]);
  }, []);

  return { topicStats, trackTopic, topTopics, clearHistory };
}
