import React, { createContext, useCallback, useContext, useState } from "react";
import { supabase, TABLES } from "@/services/supabase";

interface WrongQuestion {
  id: string;
  exam_type_id: string;
  subject_id: string | null;
  subject_label: string | null;
  topic: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  user_answer: string | null;
  is_mastered: boolean;
  attempt_count: number;
  last_wrong_at: string;
}

interface TopicMastery {
  id: string;
  exam_type_id: string;
  subject_label: string | null;
  topic: string;
  total_attempts: number;
  correct_count: number;
  last_attempted: string;
  mastery_level: "learning" | "developing" | "proficient" | "mastered";
}

interface ExamProgressContextType {
  wrongQuestions: WrongQuestion[];
  masteryData: TopicMastery[];
  loadingErrors: boolean;
  loadingMastery: boolean;
  load: (userId: string) => Promise<void>;
  markMastered: (id: string) => Promise<void>;
  deleteWrongQuestion: (id: string) => Promise<void>;
}

const ExamProgressContext = createContext<ExamProgressContextType | null>(null);

export function ExamProgressProvider({ children }: { children: React.ReactNode }) {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [masteryData, setMasteryData] = useState<TopicMastery[]>([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [loadingMastery, setLoadingMastery] = useState(false);

  const load = useCallback(async (userId: string) => {
    setLoadingErrors(true);
    setLoadingMastery(true);

    const [wrongRes, masteryRes] = await Promise.all([
      supabase
        .from(TABLES.WRONG_QUESTIONS)
        .select("*")
        .eq("user_id", userId)
        .order("last_wrong_at", { ascending: false }),
      supabase
        .from(TABLES.TOPIC_MASTERY)
        .select("*")
        .eq("user_id", userId)
        .order("last_attempted", { ascending: false }),
    ]);

    if (!wrongRes.error && wrongRes.data) setWrongQuestions(wrongRes.data as WrongQuestion[]);
    if (!masteryRes.error && masteryRes.data) setMasteryData(masteryRes.data as TopicMastery[]);

    setLoadingErrors(false);
    setLoadingMastery(false);
  }, []);

  const markMastered = useCallback(async (id: string) => {
    setWrongQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_mastered: true } : q))
    );
    await supabase.from(TABLES.WRONG_QUESTIONS).update({ is_mastered: true }).eq("id", id);
  }, []);

  const deleteWrongQuestion = useCallback(async (id: string) => {
    setWrongQuestions((prev) => prev.filter((q) => q.id !== id));
    await supabase.from(TABLES.WRONG_QUESTIONS).delete().eq("id", id);
  }, []);

  return (
    <ExamProgressContext.Provider
      value={{ wrongQuestions, masteryData, loadingErrors, loadingMastery, load, markMastered, deleteWrongQuestion }}
    >
      {children}
    </ExamProgressContext.Provider>
  );
}

export function useExamProgress() {
  const ctx = useContext(ExamProgressContext);
  if (!ctx) throw new Error("useExamProgress must be used within ExamProgressProvider");
  return ctx;
}
