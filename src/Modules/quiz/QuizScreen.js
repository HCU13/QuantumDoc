import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import TokenInfo from "../../components/common/TokenInfo";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { showError, showSuccess, showInfo } from '../../utils/toast';
import { SIZES, FONTS } from "../../constants/theme";

const QuizScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [quizType, setQuizType] = useState("create"); // "create", "solve"
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [showStartModal, setShowStartModal] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [showSavedQuizzes, setShowSavedQuizzes] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [tempQuiz, setTempQuiz] = useState(null);

  // Navigation focus olduğunda tempQuiz'i temizle
  useFocusEffect(
    React.useCallback(() => {
      setTempQuiz(null);
      setShowStartModal(false);
    }, [])
  );

  // Mock kullanıcı bilgileri
  const tokenCost = 3;
  const tokens = 100;
  const remainingTokens = tokens - tokenCost;
  const isPremium = false;
  const hasExtraTokens = remainingTokens >= tokenCost;

  // Mock quiz verisi
  const mockQuiz = {
    title: "Matematik Testi",
    subject: "Matematik",
    difficulty: "Orta",
    questions: [
      {
        id: 1,
        question: "2x + 5 = 13 denkleminin çözümü nedir?",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correctAnswer: 1,
        explanation: "2x + 5 = 13 → 2x = 8 → x = 4",
        topic: "Lineer Denklemler",
        difficulty: "Orta"
      },
      {
        id: 2,
        question: "Bir üçgenin iç açıları toplamı kaç derecedir?",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: 1,
        explanation: "Üçgenin iç açıları toplamı her zaman 180°'dir",
        topic: "Geometri",
        difficulty: "Kolay"
      },
      {
        id: 3,
        question: "∫ x² dx integralinin sonucu nedir?",
        options: ["x³/2 + C", "x³/3 + C", "x³/4 + C", "x³ + C"],
        correctAnswer: 1,
        explanation: "∫ x^n dx = x^(n+1)/(n+1) + C formülü kullanılır",
        topic: "İntegral",
        difficulty: "Zor"
      },
      {
        id: 4,
        question: "sin(30°) + cos(60°) = ?",
        options: ["0", "1", "1/2", "√3/2"],
        correctAnswer: 1,
        explanation: "sin(30°) = 1/2, cos(60°) = 1/2 → 1/2 + 1/2 = 1",
        topic: "Trigonometri",
        difficulty: "Orta"
      },
      {
        id: 5,
        question: "x² + 3x + 2 = 0 denkleminin kökleri nedir?",
        options: ["x = -1, x = -2", "x = 1, x = 2", "x = -1, x = 2", "x = 1, x = -2"],
        correctAnswer: 0,
        explanation: "x² + 3x + 2 = (x + 1)(x + 2) → x = -1 veya x = -2",
        topic: "Kuadratik Denklemler",
        difficulty: "Orta"
      }
    ]
  };

  // Konular
  const subjects = [
    { name: "Matematik", icon: "calculator", color: "#4F8EF7" },
    { name: "Fizik", icon: "flash", color: "#FF6B6B" },
    { name: "Kimya", icon: "flask", color: "#45B7D1" },
    { name: "Biyoloji", icon: "leaf", color: "#96CEB4" },
    { name: "Tarih", icon: "time", color: "#FFEAA7" },
    { name: "Coğrafya", icon: "earth", color: "#DDA0DD" },
    { name: "Türkçe", icon: "book", color: "#98D8C8" },
    { name: "İngilizce", icon: "language", color: "#F7DC6F" }
  ];

  // Zorluk seviyeleri
  const difficulties = [
    { key: "easy", label: "Kolay", color: "#10B981", icon: "trending-up" },
    { key: "medium", label: "Orta", color: "#F59E0B", icon: "trending-up" },
    { key: "hard", label: "Zor", color: "#EF4444", icon: "trending-up" }
  ];

  // Soru sayıları
  const questionCounts = [5, 10, 15, 20];

  const handleCreateQuiz = async () => {
    if (!subject.trim()) {
      showError("Hata", "Lütfen bir konu seçin");
      return;
    }

    if (!hasExtraTokens) {
      showInfo("Token Yetersiz", `${tokenCost} token gerekiyor`);
      return;
    }

    setLoading(true);
    
    try {
      // Mock API çağrısı
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Quiz'i oluştur ve geçici state'e set et
      const newQuiz = {
        ...mockQuiz,
        title: `${subject} Testi`,
        subject: subject,
        difficulty: difficulties.find(d => d.key === difficulty)?.label || difficulty,
        questions: mockQuiz.questions.slice(0, questionCount)
      };
      setTempQuiz(newQuiz);
      setShowStartModal(true);
      
    } catch (error) {
      showError("Hata", "Test oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setTempQuiz(quiz);
    setShowStartModal(true);
  };

  const handleLoadAvailableQuizzes = () => {
    setAvailableQuizzes(mockAvailableQuizzes);
  };

  const handleStartQuiz = () => {
    setShowStartModal(false);
    setTempQuiz(null); // Quiz başlatıldıktan sonra tempQuiz'i temizle
    
    navigation.navigate('QuizSolving', { 
      quiz: tempQuiz,
      onFinish: (results) => {
        // Quiz bittiğinde buraya dönecek
        console.log('Quiz finished:', results);
      }
    });
  };

  const handleSaveQuiz = () => {
    const newQuiz = {
      id: Date.now(),
      title: tempQuiz.title,
      subject: tempQuiz.subject,
      difficulty: tempQuiz.difficulty,
      questionCount: tempQuiz.questions.length,
      createdAt: new Date().toISOString(),
    };
    setSavedQuizzes(prev => [newQuiz, ...prev]);
    showSuccess("Başarılı!", "Quiz kaydedildi");
  };

  // Mock hazır quiz'ler
  const mockAvailableQuizzes = [
    {
      id: 1,
      title: "Matematik Temel Testi",
      subject: "Matematik",
      difficulty: "Kolay",
      questionCount: 10,
      estimatedTime: 15,
      category: "Temel",
      description: "Temel matematik konularını test eder",
      questions: [
        {
          id: 1,
          question: "2 + 3 = ?",
          options: ["4", "5", "6", "7"],
          correctAnswer: 1,
          explanation: "2 + 3 = 5",
          topic: "Toplama",
          difficulty: "Kolay"
        },
        {
          id: 2,
          question: "5 x 6 = ?",
          options: ["25", "30", "35", "40"],
          correctAnswer: 1,
          explanation: "5 x 6 = 30",
          topic: "Çarpma",
          difficulty: "Kolay"
        },
        {
          id: 3,
          question: "Bir üçgenin iç açıları toplamı kaç derecedir?",
          options: ["90°", "180°", "270°", "360°"],
          correctAnswer: 1,
          explanation: "Üçgenin iç açıları toplamı 180°'dir",
          topic: "Geometri",
          difficulty: "Kolay"
        }
      ]
    },
    {
      id: 2,
      title: "Fizik Mekanik Testi",
      subject: "Fizik",
      difficulty: "Orta",
      questionCount: 8,
      estimatedTime: 12,
      category: "Mekanik",
      description: "Mekanik fizik konularını kapsar",
      questions: [
        {
          id: 1,
          question: "Hız birimi nedir?",
          options: ["m/s", "m/s²", "N", "J"],
          correctAnswer: 0,
          explanation: "Hız birimi metre/saniye (m/s)'dir",
          topic: "Kinematik",
          difficulty: "Orta"
        },
        {
          id: 2,
          question: "Kütle birimi nedir?",
          options: ["Newton", "Kilogram", "Metre", "Saniye"],
          correctAnswer: 1,
          explanation: "Kütle birimi kilogram (kg)'dır",
          topic: "Dinamik",
          difficulty: "Orta"
        }
      ]
    },
    {
      id: 3,
      title: "Kimya Organik Testi",
      subject: "Kimya",
      difficulty: "Zor",
      questionCount: 12,
      estimatedTime: 18,
      category: "Organik",
      description: "Organik kimya konularını test eder",
      questions: [
        {
          id: 1,
          question: "CH₄ molekülünün adı nedir?",
          options: ["Metan", "Etan", "Propan", "Bütan"],
          correctAnswer: 0,
          explanation: "CH₄ metan molekülüdür",
          topic: "Hidrokarbonlar",
          difficulty: "Zor"
        }
      ]
    }
  ];

  // --- Styles ---
  const styles = {
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 18,
    },
    section: {
      marginBottom: 16, // 22'den 16'ya düşürdüm
    },
    typeSelector: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 16, // 20'den 16'ya düşürdüm
      gap: 10,
    },
    typeBtn: (active) => ({
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10, // 12'den 10'a düşürdüm
      borderRadius: SIZES.radius,
      borderWidth: 2,
      borderColor: active ? colors.quizPrimary : colors.border,
      backgroundColor: active ? colors.quizPrimary : colors.card,
    }),
    typeText: (active) => ({
      ...FONTS.body4,
      color: active ? colors.white : colors.textPrimary,
      marginLeft: 8,
      fontWeight: "bold",
    }),
    subjectGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8, // 10'dan 8'e düşürdüm
      marginBottom: 12, // 16'dan 12'ye düşürdüm
    },
    subjectBtn: (selected, color) => ({
      width: "48%",
      flexDirection: "row",
      alignItems: "center",
      padding: 10, // 12'den 10'a düşürdüm
      borderRadius: SIZES.radius,
      borderWidth: 2,
      borderColor: selected ? color : colors.border,
      backgroundColor: selected ? color + "20" : colors.card,
    }),
    subjectText: (selected) => ({
      ...FONTS.body5,
      color: selected ? colors.textPrimary : colors.textSecondary,
      marginLeft: 8,
      fontWeight: "600",
    }),
    difficultySelector: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12, // 16'dan 12'ye düşürdüm
    },
    difficultyBtn: (active, color) => ({
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8, // 10'dan 8'e düşürdüm
      borderRadius: SIZES.radius,
      borderWidth: 2,
      borderColor: active ? color : colors.border,
      backgroundColor: active ? color : colors.card,
    }),
    difficultyText: (active) => ({
      ...FONTS.body5,
      color: active ? colors.white : colors.textSecondary,
      fontWeight: "600",
      marginLeft: 4,
    }),
    questionCountSelector: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16, // 20'den 16'ya düşürdüm
    },
    countBtn: (active) => ({
      flex: 1,
      paddingVertical: 8, // 10'dan 8'e düşürdüm
      borderRadius: SIZES.radius,
      borderWidth: 2,
      borderColor: active ? colors.quizPrimary : colors.border,
      backgroundColor: active ? colors.quizPrimary : colors.card,
      alignItems: "center",
    }),
    countText: (active) => ({
      ...FONTS.body5,
      color: active ? colors.white : colors.textSecondary,
      fontWeight: "600",
    }),
    createBtn: {
      marginVertical: 16, // 20'den 16'ya düşürdüm
    },
    quizCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    quizHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    quizTitle: {
      ...FONTS.h5,
      color: colors.textPrimary,
      fontWeight: "bold",
      flex: 1,
    },
    aiHelpBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: SIZES.radius,
      backgroundColor: colors.quizPrimary + "20",
      borderWidth: 1,
      borderColor: colors.quizPrimary,
    },
    aiHelpText: {
      ...FONTS.body5,
      color: colors.quizPrimary,
      marginLeft: 4,
      fontWeight: "600",
    },
    quizInfo: {
      ...FONTS.body5,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginBottom: 8,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.quizPrimary,
      borderRadius: 3,
    },
    progressText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      textAlign: "center",
    },
    questionContainer: {
      marginBottom: 16,
    },
    questionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    questionNumber: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    questionNumberText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "bold",
    },
    questionTopic: {
      ...FONTS.body5,
      color: colors.textSecondary,
      backgroundColor: colors.border + "30",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    questionText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      fontWeight: "600",
      marginBottom: 12,
      lineHeight: 20,
    },
    optionBtn: (selected, correct, showResults) => ({
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: SIZES.radius,
      borderWidth: 2,
      borderColor: showResults 
        ? (correct ? colors.success : (selected && !correct ? colors.error : colors.border))
        : (selected ? colors.quizPrimary : colors.border),
      backgroundColor: showResults 
        ? (correct ? colors.success + "20" : (selected && !correct ? colors.error + "20" : colors.card))
        : (selected ? colors.quizPrimary + "20" : colors.card),
      marginBottom: 8,
    }),
    optionText: (selected, correct, showResults) => ({
      ...FONTS.body4,
      color: showResults 
        ? (correct ? colors.success : (selected && !correct ? colors.error : colors.textPrimary))
        : colors.textPrimary,
      flex: 1,
      marginLeft: 8,
    }),
    navigationButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    navBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: SIZES.radius,
      backgroundColor: colors.primary,
    },
    navBtnText: {
      color: colors.white,
      marginLeft: 6,
      fontWeight: "bold",
      fontSize: 14,
    },
    resultsContainer: {
      padding: 20,
    },
    scoreHeader: {
      alignItems: "center",
      marginBottom: 24,
    },
    scoreCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      position: "relative",
    },
    scoreIcon: {
      position: "absolute",
      top: -10,
      right: -10,
      backgroundColor: colors.white,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    scoreIconLarge: {
      position: "absolute",
      top: -15,
      right: -15,
      backgroundColor: colors.white,
      borderRadius: 25,
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
    },
    scoreText: {
      ...FONTS.h3,
      color: colors.white,
      fontWeight: "bold",
    },
    scoreLabel: {
      ...FONTS.body5,
      color: colors.white,
      marginTop: 4,
    },
    scoreDescription: {
      ...FONTS.h6,
      color: colors.textPrimary,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 8,
    },
    scoreSubDescription: {
      ...FONTS.body5,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 16,
    },
    performanceCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    performanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    performanceIcon: {
      marginRight: 8,
    },
    performanceTitle: {
      ...FONTS.body4,
      color: colors.textPrimary,
      fontWeight: "bold",
      flex: 1,
    },
    performanceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    performanceLabel: {
      ...FONTS.body5,
      color: colors.textSecondary,
    },
    performanceValue: {
      ...FONTS.body4,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    detailedResultsBtn: {
      marginTop: 16,
    },
    detailedResultsContainer: {
      marginTop: 16,
    },
    questionResultCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    questionResultHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    resultIcon: {
      marginRight: 8,
    },
    questionResultText: {
      ...FONTS.body5,
      color: colors.textPrimary,
      fontWeight: "600",
      flex: 1,
    },
    answerComparison: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    answerRow: {
      flexDirection: "row",
      marginBottom: 4,
      alignItems: "center",
    },
    answerLabel: {
      ...FONTS.body5,
      color: colors.textSecondary,
      width: 100,
    },
    answerValue: {
      ...FONTS.body5,
      color: colors.textPrimary,
      flex: 1,
      fontWeight: "600",
    },
    answerValueCorrect: {
      ...FONTS.body5,
      color: "#10B981", // Daha yeşil
      flex: 1,
      fontWeight: "600",
    },
    answerValueIncorrect: {
      ...FONTS.body5,
      color: "#EF4444", // Daha kırmızı
      flex: 1,
      fontWeight: "600",
    },
    answerIcon: {
      marginLeft: 8,
    },
    explanationText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      elevation: 9999,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 24,
      margin: 20,
      maxHeight: '80%',
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      ...FONTS.h5,
      color: colors.textPrimary,
      fontWeight: "bold",
      flex: 1,
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalBody: {
      marginBottom: 20,
    },
    aiExplanationText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    modalFooter: {
      flexDirection: "row",
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      borderRadius: SIZES.radius,
      paddingVertical: 12,
      alignItems: "center",
    },
    modalBtnPrimary: {
      backgroundColor: colors.primary,
    },
    modalBtnSecondary: {
      backgroundColor: colors.border,
    },
    modalBtnText: {
      ...FONTS.body4,
      fontWeight: "bold",
    },
    modalBtnTextPrimary: {
      color: colors.white,
    },
    modalBtnTextSecondary: {
      color: colors.textPrimary,
    },
    quizPreviewCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    previewIcon: {
      marginRight: 12,
    },
    previewTitle: {
      ...FONTS.h5,
      color: colors.textPrimary,
      fontWeight: "bold",
      flex: 1,
    },
    previewInfo: {
      marginBottom: 16,
    },
    previewRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    previewLabel: {
      ...FONTS.body5,
      color: colors.textSecondary,
    },
    previewValue: {
      ...FONTS.body5,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    previewActions: {
      flexDirection: "row",
      gap: 12,
    },
    timerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timerText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      fontWeight: "bold",
    },
    timerWarning: {
      color: "#EF4444",
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressStats: {
      flexDirection: "row",
      gap: 16,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statIcon: {
      marginRight: 4,
    },
    statText: {
      ...FONTS.body5,
      color: colors.textSecondary,
    },
    questionNavigation: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    questionNavBtn: (answered, marked, current) => ({
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: current ? colors.quizPrimary : (answered ? colors.success : colors.border),
      backgroundColor: current ? colors.quizPrimary : (answered ? colors.success + "20" : colors.card),
    }),
    questionNavText: (answered, current) => ({
      ...FONTS.body5,
      color: current ? colors.white : (answered ? colors.success : colors.textSecondary),
      fontWeight: "bold",
    }),
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateTitle: {
      ...FONTS.h5,
      color: colors.textPrimary,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "center",
    },
    emptyStateText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    savedQuizzesContainer: {
      marginBottom: 16, // 20'den 16'ya düşürdüm
    },
    savedQuizCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 12, // 16'dan 12'ye düşürdüm
      marginBottom: 8, // 12'den 8'e düşürdüm
      borderWidth: 1,
      borderColor: colors.border,
    },
    savedQuizHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6, // 8'den 6'ya düşürdüm
    },
    savedQuizTitle: {
      ...FONTS.body4,
      color: colors.textPrimary,
      fontWeight: "600",
      flex: 1,
    },
    savedQuizDate: {
      ...FONTS.body5,
      color: colors.textSecondary,
    },
    savedQuizInfo: {
      flexDirection: "row",
      gap: 12, // 16'dan 12'ye düşürdüm
    },
    savedQuizInfoItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    savedQuizInfoText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    availableQuizCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 12, // 16'dan 12'ye düşürdüm
      marginBottom: 8, // 12'den 8'e düşürdüm
      borderWidth: 1,
      borderColor: colors.border,
    },
    availableQuizHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6, // 8'den 6'ya düşürdüm
    },
    availableQuizTitle: {
      ...FONTS.body4,
      color: colors.textPrimary,
      fontWeight: "600",
      flex: 1,
    },
    availableQuizDifficulty: {
      ...FONTS.body5,
      color: colors.textSecondary,
      backgroundColor: colors.border + "30",
      paddingHorizontal: 6, // 8'den 6'ya düşürdüm
      paddingVertical: 2,
      borderRadius: 6, // 8'den 6'ya düşürdüm
    },
    availableQuizDescription: {
      ...FONTS.body5,
      color: colors.textSecondary,
      marginBottom: 8, // 12'den 8'e düşürdüm
      lineHeight: 16,
    },
    availableQuizInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    availableQuizStats: {
      flexDirection: "row",
      gap: 12, // 16'dan 12'ye düşürdüm
    },
    availableQuizStat: {
      flexDirection: "row",
      alignItems: "center",
    },
    availableQuizStatText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    availableQuizButton: {
      backgroundColor: colors.quizPrimary,
      borderRadius: SIZES.radius,
      paddingHorizontal: 12, // 16'dan 12'ye düşürdüm
      paddingVertical: 6, // 8'den 6'ya düşürdüm
    },
    availableQuizButtonText: {
      ...FONTS.body5,
      color: colors.white,
      fontWeight: "600",
    },
    categoryFilter: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    categoryBtn: (active) => ({
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: active ? colors.primary : colors.border,
      backgroundColor: active ? colors.primary : colors.card,
    }),
    categoryBtnText: (active) => ({
      ...FONTS.body5,
      color: active ? colors.white : colors.textSecondary,
      fontWeight: "600",
    }),
    startModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 24,
      margin: 20,
      alignItems: 'center',
      shadowColor: colors.quizPrimary,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
    },
    modalTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      fontWeight: "bold",
      marginBottom: 12,
      textAlign: 'center',
    },
    modalText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    modalBtn: {
      flex: 1,
      borderRadius: SIZES.radius,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalBtnPrimary: {
      backgroundColor: colors.quizPrimary,
    },
    modalBtnSecondary: {
      backgroundColor: colors.border,
    },
    modalBtnText: {
      ...FONTS.body4,
      fontWeight: "bold",
    },
    modalBtnTextPrimary: {
      color: colors.white,
    },
    modalBtnTextSecondary: {
      color: colors.textPrimary,
    },
  };

  // --- Render ---
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <Header title={t("modules.quiz.title")} />
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Token Bilgisi */}
          <TokenInfo
            moduleName="Quiz & Test"
            tokenCost={tokenCost}
            remainingTokens={remainingTokens}
            isPremium={isPremium}
            showCost={true}
          />

          {/* Quiz Oluşturma Bölümü */}
          <>
            {/* Tip Seçici */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={styles.typeBtn(quizType === "create")}
                onPress={() => setQuizType("create")}
              >
                <Ionicons name="add-circle-outline" size={18} color={quizType === "create" ? colors.white : colors.textPrimary} />
                <Text style={styles.typeText(quizType === "create")}>Test Oluştur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.typeBtn(quizType === "solve")}
                onPress={() => {
                  setQuizType("solve");
                  handleLoadAvailableQuizzes();
                }}
              >
                <Ionicons name="play-circle-outline" size={18} color={quizType === "solve" ? colors.white : colors.textPrimary} />
                <Text style={styles.typeText(quizType === "solve")}>Test Çöz</Text>
              </TouchableOpacity>
            </View>

            {/* Test Oluştur Bölümü */}
            {quizType === "create" && (
              <>
                {/* Kaydedilen Quizler */}
                {savedQuizzes.length > 0 && (
                  <View style={styles.savedQuizzesContainer}>
                    <View style={styles.section}>
                      <Text style={[styles.inputLabel, { ...FONTS.body4, color: colors.textPrimary, fontWeight: "600", marginBottom: 6 }]}>
                        Kaydedilen Quizler
                      </Text>
                      {savedQuizzes.slice(0, 2).map((quiz) => (
                        <TouchableOpacity key={quiz.id} style={styles.savedQuizCard}>
                          <View style={styles.savedQuizHeader}>
                            <Text style={styles.savedQuizTitle}>{quiz.title}</Text>
                            <Text style={styles.savedQuizDate}>
                              {new Date(quiz.createdAt).toLocaleDateString('tr-TR')}
                            </Text>
                          </View>
                          <View style={styles.savedQuizInfo}>
                            <View style={styles.savedQuizInfoItem}>
                              <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                              <Text style={styles.savedQuizInfoText}>{quiz.subject}</Text>
                            </View>
                            <View style={styles.savedQuizInfoItem}>
                              <Ionicons name="trending-up-outline" size={14} color={colors.textSecondary} />
                              <Text style={styles.savedQuizInfoText}>{quiz.difficulty}</Text>
                            </View>
                            <View style={styles.savedQuizInfoItem}>
                              <Ionicons name="help-circle-outline" size={14} color={colors.textSecondary} />
                              <Text style={styles.savedQuizInfoText}>{quiz.questionCount} soru</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Konu Seçimi */}
                <View style={styles.section}>
                  <Text style={[styles.inputLabel, { ...FONTS.body4, color: colors.textPrimary, fontWeight: "600", marginBottom: 6 }]}>
                    Konu Seçin
                  </Text>
                  <View style={styles.subjectGrid}>
                    {subjects.map((subjectItem) => (
                      <TouchableOpacity
                        key={subjectItem.name}
                        style={styles.subjectBtn(subject === subjectItem.name, subjectItem.color)}
                        onPress={() => setSubject(subjectItem.name)}
                      >
                        <Ionicons name={subjectItem.icon} size={16} color={subject === subjectItem.name ? subjectItem.color : colors.textSecondary} />
                        <Text style={styles.subjectText(subject === subjectItem.name)}>
                          {subjectItem.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Zorluk Seviyesi */}
                <View style={styles.section}>
                  <Text style={[styles.inputLabel, { ...FONTS.body4, color: colors.textPrimary, fontWeight: "600", marginBottom: 6 }]}>
                    Zorluk Seviyesi
                  </Text>
                  <View style={styles.difficultySelector}>
                    {difficulties.map((diff) => (
                      <TouchableOpacity
                        key={diff.key}
                        style={styles.difficultyBtn(difficulty === diff.key, diff.color)}
                        onPress={() => setDifficulty(diff.key)}
                      >
                        <Ionicons name={diff.icon} size={16} color={difficulty === diff.key ? colors.white : colors.textSecondary} />
                        <Text style={styles.difficultyText(difficulty === diff.key)}>
                          {diff.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Soru Sayısı */}
                <View style={styles.section}>
                  <Text style={[styles.inputLabel, { ...FONTS.body4, color: colors.textPrimary, fontWeight: "600", marginBottom: 6 }]}>
                    Soru Sayısı
                  </Text>
                  <View style={styles.questionCountSelector}>
                    {questionCounts.map((count) => (
                      <TouchableOpacity
                        key={count}
                        style={styles.countBtn(questionCount === count)}
                        onPress={() => setQuestionCount(count)}
                      >
                        <Text style={styles.countText(questionCount === count)}>
                          {count}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Test Oluştur Butonu */}
                <Button
                  title={loading ? "Oluşturuluyor..." : "Test Oluştur"}
                  gradient
                  onPress={handleCreateQuiz}
                  loading={loading}
                  disabled={!subject.trim() || !hasExtraTokens}
                  containerStyle={styles.createBtn}
                  size="medium"
                />
              </>
            )}

            {/* Test Çöz Bölümü */}
            {quizType === "solve" && (
              <View>
                <Text style={[styles.inputLabel, { ...FONTS.body4, color: colors.textPrimary, fontWeight: "600", marginBottom: 12 }]}>
                  Hazır Testler
                </Text>
                
                {availableQuizzes.map((quiz) => (
                  <TouchableOpacity 
                    key={quiz.id} 
                    style={styles.availableQuizCard}
                    onPress={() => handleSelectQuiz(quiz)}
                  >
                    <View style={styles.availableQuizHeader}>
                      <Text style={styles.availableQuizTitle}>{quiz.title}</Text>
                      <Text style={styles.availableQuizDifficulty}>{quiz.difficulty}</Text>
                    </View>
                    
                    <Text style={styles.availableQuizDescription}>
                      {quiz.description}
                    </Text>
                    
                    <View style={styles.availableQuizInfo}>
                      <View style={styles.availableQuizStats}>
                        <View style={styles.availableQuizStat}>
                          <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.availableQuizStatText}>{quiz.subject}</Text>
                        </View>
                        <View style={styles.availableQuizStat}>
                          <Ionicons name="help-circle-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.availableQuizStatText}>{quiz.questionCount} soru</Text>
                        </View>
                        <View style={styles.availableQuizStat}>
                          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.availableQuizStatText}>{quiz.estimatedTime} dk</Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.availableQuizButton}
                        onPress={() => handleSelectQuiz(quiz)}
                      >
                        <Text style={styles.availableQuizButtonText}>Başla</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        </ScrollView>
      </SafeAreaView>

      {/* Quiz Başlatma Modal */}
      {showStartModal && tempQuiz && (
        <View style={styles.startModal}>
          <View style={styles.modalContent}>
            <Ionicons name="play-circle" size={64} color={colors.quizPrimary} style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Sınava Hazır mısınız?</Text>
            <Text style={styles.modalText}>
              {tempQuiz.title} sınavı başlamak üzeresiniz.
              {"\n\n"}
              • {tempQuiz.questions.length} soru
              {"\n"}
              • Tahmini süre: {Math.ceil(tempQuiz.questions.length * 1.2)} dakika
              {"\n"}
              • Konu: {tempQuiz.subject}
              {"\n"}
              • Zorluk: {tempQuiz.difficulty}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => {
                  setShowStartModal(false);
                  setTempQuiz(null); // Modal iptal edildiğinde tempQuiz'i temizle
                }}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextSecondary]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleStartQuiz}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextPrimary]}>
                  Sınava Başla
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </GradientBackground>
  );
};

export default QuizScreen; 