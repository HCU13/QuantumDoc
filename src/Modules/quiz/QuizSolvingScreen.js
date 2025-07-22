import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  Alert,
  BackHandler,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { showError, showSuccess, showInfo } from '../../utils/toast';
import { SIZES, FONTS } from "../../constants/theme";

const QuizSolvingScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  
  const { quiz, onFinish } = route.params;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(quiz.estimatedTime * 60);
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [quizTimer, setQuizTimer] = useState(null);
  const [showAiHelpModal, setShowAiHelpModal] = useState(false);
  const [aiHelpLoading, setAiHelpLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [isQuizInProgress, setIsQuizInProgress] = useState(true);

  // Animasyon değerleri
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Quiz timer
  useEffect(() => {
    if (!showResults && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setQuizTimer(timer);
      return () => clearInterval(timer);
    }
  }, [showResults, remainingTime]);

  // Quiz timer cleanup
  useEffect(() => {
    return () => {
      if (quizTimer) {
        clearInterval(quizTimer);
      }
    };
  }, [quizTimer]);

  // Back handler
  useEffect(() => {
    const backAction = () => {
      if (!showResults) {
        Alert.alert(
          "Sınavdan Çık",
          "Sınav devam ediyor. Çıkmak istediğinizden emin misiniz?",
          [
            {
              text: "İptal",
              style: "cancel",
            },
            {
              text: "Çık",
              onPress: () => {
                if (quizTimer) {
                  clearInterval(quizTimer);
                }
                navigation.goBack();
              },
            },
          ]
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showResults, quizTimer, navigation]);

  // Animasyon başlat
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleMarkQuestion = (questionId) => {
    setMarkedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFinishQuiz = () => {
    if (quizTimer) {
      clearInterval(quizTimer);
    }
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    setTimeSpent(totalTime);
    setShowResults(true);
    setIsQuizInProgress(false);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setMarkedQuestions({});
    setStartTime(Date.now());
    setTimeSpent(0);
    setRemainingTime(quiz.estimatedTime * 60);
    setIsQuizInProgress(true);
    setShowDetailedResults(false);
  };

  const handleAiHelp = async () => {
    setShowAiHelpModal(true);
    setAiHelpLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentQ = quiz.questions[currentQuestion];
      const mockAiHelp = `Bu soru ${currentQ.topic} konusundan geliyor. ${currentQ.explanation} Ayrıca bu tür sorularda dikkat edilmesi gereken noktalar: 1) Soruyu dikkatli okuyun, 2) Verilen bilgileri analiz edin, 3) Uygun formülü seçin, 4) Hesaplamayı yapın, 5) Sonucu kontrol edin.`;
      
      setAiExplanation(mockAiHelp);
    } catch (error) {
      showError("Hata", "AI yardımı alınamadı");
    } finally {
      setAiHelpLoading(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    const questionResults = [];

    quiz.questions.forEach((q, index) => {
      const isCorrect = userAnswers[q.id] === q.correctAnswer;
      if (isCorrect) correct++;
      
      questionResults.push({
        question: q.question,
        userAnswer: q.options[userAnswers[q.id] || 0],
        correctAnswer: q.options[q.correctAnswer],
        isCorrect,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty
      });
    });

    return {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100),
      questionResults,
      timeSpent
    };
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getPerformanceLevel = (percentage, timeSpent) => {
    if (percentage >= 80 && timeSpent < 300) return "Mükemmel";
    if (percentage >= 80) return "Çok İyi";
    if (percentage >= 60) return "İyi";
    if (percentage >= 40) return "Orta";
    return "Geliştirilmeli";
  };

  const getPerformanceIcon = (percentage, timeSpent) => {
    if (percentage >= 80 && timeSpent < 300) return "trophy";
    if (percentage >= 80) return "star";
    if (percentage >= 60) return "thumbs-up";
    if (percentage >= 40) return "checkmark-circle";
    return "alert-circle";
  };

  const getPerformanceColor = (percentage, timeSpent) => {
    if (percentage >= 80 && timeSpent < 300) return "#10B981";
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getTimeText = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length;
  };

  const getMarkedCount = () => {
    return Object.keys(markedQuestions).length;
  };

  const styles = {
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 18,
    },
    quizCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 20,
      marginTop: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.quizPrimary,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    timerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.quizPrimary + "10",
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: colors.quizPrimary + "30",
    },
    timerText: {
      ...FONTS.h4,
      color: colors.quizPrimary,
      fontWeight: "bold",
    },
    timerWarning: {
      color: "#EF4444",
      animation: "pulse",
    },
    progressStats: {
      flexDirection: "row",
      gap: 20,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statIcon: {
      marginRight: 4,
    },
    statText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressText: {
      ...FONTS.body5,
      color: colors.textSecondary,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.quizPrimary,
      borderRadius: 3,
    },
    questionNavigation: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
      justifyContent: "center",
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
    quizHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    quizTitle: {
      ...FONTS.h4,
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
      marginBottom: 20,
    },
    questionContainer: {
      marginBottom: 24,
    },
    questionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    questionNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.quizPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    questionNumberText: {
      ...FONTS.body4,
      color: colors.white,
      fontWeight: "bold",
    },
    questionTopic: {
      ...FONTS.body5,
      color: colors.quizPrimary,
      backgroundColor: colors.quizPrimary + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontWeight: "600",
    },
    questionText: {
      ...FONTS.h5,
      color: colors.textPrimary,
      lineHeight: 24,
      marginBottom: 20,
    },
    optionBtn: (selected, correct, showResults) => ({
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
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
        ? (correct ? "#10B981" : (selected && !correct ? "#EF4444" : colors.textPrimary))
        : colors.textPrimary,
      marginLeft: 12,
      flex: 1,
      fontWeight: selected ? "600" : "400",
    }),
    navigationButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    navBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.quizPrimary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: SIZES.radius,
      gap: 8,
    },
    navBtnText: {
      ...FONTS.body4,
      color: colors.white,
      fontWeight: "600",
    },
    resultsContainer: {
      alignItems: "center",
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
    },
    scoreText: {
      ...FONTS.h2,
      color: colors.white,
      fontWeight: "bold",
    },
    performanceCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    performanceIcon: {
      marginBottom: 12,
    },
    performanceText: {
      ...FONTS.h4,
      color: colors.textPrimary,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 8,
    },
    performanceStats: {
      flexDirection: "row",
      gap: 20,
      marginTop: 12,
    },
    statCard: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      ...FONTS.h5,
      color: colors.textPrimary,
      fontWeight: "bold",
    },
    statLabel: {
      ...FONTS.body5,
      color: colors.textSecondary,
      marginTop: 4,
    },
    detailedResultsBtn: {
      marginTop: 20,
    },
    detailedResultsContainer: {
      marginTop: 20,
      width: "100%",
    },
    questionResultCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    answerComparison: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 8,
    },
    answerValueCorrect: {
      ...FONTS.body5,
      color: "#10B981",
      fontWeight: "600",
    },
    answerValueIncorrect: {
      ...FONTS.body5,
      color: "#EF4444",
      fontWeight: "600",
    },
    retakeBtn: {
      marginTop: 20,
    },
    aiHelpModal: {
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
      maxHeight: "80%",
    },
    modalTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: 'center',
    },
    modalText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    modalCloseBtn: {
      marginTop: 20,
      backgroundColor: colors.quizPrimary,
      paddingVertical: 12,
      borderRadius: SIZES.radius,
      alignItems: "center",
    },
    modalCloseText: {
      ...FONTS.body4,
      color: colors.white,
      fontWeight: "600",
    },
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <Header title={quiz.title} showBack={true} onBack={() => navigation.goBack()} />
        
        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {!showResults ? (
              <Card style={styles.quizCard}>
                {/* Timer ve İlerleme */}
                <View style={styles.timerContainer}>
                  <View style={styles.progressStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} style={styles.statIcon} />
                      <Text style={styles.statText}>{getTimeText(remainingTime)}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="checkmark-circle-outline" size={16} color={colors.textSecondary} style={styles.statIcon} />
                      <Text style={styles.statText}>{getAnsweredCount()}/{quiz.questions.length}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="bookmark-outline" size={16} color={colors.textSecondary} style={styles.statIcon} />
                      <Text style={styles.statText}>{getMarkedCount()}</Text>
                    </View>
                  </View>
                  {remainingTime <= 300 && (
                    <Text style={[styles.timerText, styles.timerWarning]}>
                      {getTimeText(remainingTime)}
                    </Text>
                  )}
                </View>

                {/* İlerleme Çubuğu */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      {currentQuestion + 1} / {quiz.questions.length}
                    </Text>
                    <Text style={styles.progressText}>
                      %{Math.round(getProgressPercentage())}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${getProgressPercentage()}%` }
                      ]} 
                    />
                  </View>
                </View>

                {/* Soru Navigasyonu */}
                <View style={styles.questionNavigation}>
                  {quiz.questions.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.questionNavBtn(
                        userAnswers[quiz.questions[index].id] !== undefined,
                        markedQuestions[quiz.questions[index].id],
                        index === currentQuestion
                      )}
                      onPress={() => setCurrentQuestion(index)}
                    >
                      <Text style={styles.questionNavText(
                        userAnswers[quiz.questions[index].id] !== undefined,
                        index === currentQuestion
                      )}>
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quiz Başlığı */}
                <View style={styles.quizHeader}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <TouchableOpacity 
                    style={styles.aiHelpBtn}
                    onPress={handleAiHelp}
                  >
                    <Ionicons name="bulb-outline" size={16} color={colors.quizPrimary} />
                    <Text style={styles.aiHelpText}>AI Yardım</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.quizInfo}>
                  {quiz.subject} • {quiz.difficulty} • {currentQuestion + 1}/{quiz.questions.length}
                </Text>

                {/* Soru */}
                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <View style={styles.questionNumber}>
                      <Text style={styles.questionNumberText}>{currentQuestion + 1}</Text>
                    </View>
                    <Text style={styles.questionTopic}>
                      {quiz.questions[currentQuestion].topic}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleMarkQuestion(quiz.questions[currentQuestion].id)}
                      style={{ marginLeft: "auto" }}
                    >
                      <Ionicons 
                        name={markedQuestions[quiz.questions[currentQuestion].id] ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={markedQuestions[quiz.questions[currentQuestion].id] ? colors.quizPrimary : colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.questionText}>
                    {quiz.questions[currentQuestion].question}
                  </Text>

                  {/* Seçenekler */}
                  {quiz.questions[currentQuestion].options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionBtn(
                        userAnswers[quiz.questions[currentQuestion].id] === index,
                        false,
                        false
                      )}
                      onPress={() => handleAnswerSelect(quiz.questions[currentQuestion].id, index)}
                    >
                      <Ionicons 
                        name="radio-button-off" 
                        size={20} 
                        color={userAnswers[quiz.questions[currentQuestion].id] === index ? colors.quizPrimary : colors.textSecondary} 
                      />
                      <Text style={styles.optionText(
                        userAnswers[quiz.questions[currentQuestion].id] === index,
                        false,
                        false
                      )}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Navigasyon Butonları */}
                <View style={styles.navigationButtons}>
                  {currentQuestion > 0 && (
                    <TouchableOpacity style={styles.navBtn} onPress={handlePreviousQuestion}>
                      <Ionicons name="chevron-back" size={18} color={colors.white} />
                      <Text style={styles.navBtnText}>Önceki</Text>
                    </TouchableOpacity>
                  )}
                  
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <TouchableOpacity 
                      style={[styles.navBtn, { marginLeft: "auto" }]} 
                      onPress={handleNextQuestion}
                    >
                      <Text style={styles.navBtnText}>Sonraki</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.white} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.navBtn, { marginLeft: "auto" }]} 
                      onPress={handleFinishQuiz}
                    >
                      <Text style={styles.navBtnText}>Bitir</Text>
                      <Ionicons name="checkmark" size={18} color={colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ) : (
              <Card style={styles.quizCard}>
                <View style={styles.resultsContainer}>
                  {(() => {
                    const score = calculateScore();
                    const scoreColor = getScoreColor(score.percentage);
                    const performanceLevel = getPerformanceLevel(score.percentage, score.timeSpent);
                    
                    return (
                      <>
                        {/* Ana Skor */}
                        <View style={styles.scoreHeader}>
                          <View style={[styles.scoreCircle, { backgroundColor: scoreColor }]}>
                            <Text style={styles.scoreText}>{score.percentage}%</Text>
                          </View>
                          <Text style={styles.performanceText}>{performanceLevel}</Text>
                        </View>

                        {/* Performans Kartı */}
                        <Card style={styles.performanceCard}>
                          <Ionicons 
                            name={getPerformanceIcon(score.percentage, score.timeSpent)} 
                            size={48} 
                            color={getPerformanceColor(score.percentage, score.timeSpent)} 
                            style={styles.performanceIcon}
                          />
                          <Text style={styles.performanceText}>{performanceLevel}</Text>
                          
                          <View style={styles.performanceStats}>
                            <View style={styles.statCard}>
                              <Text style={styles.statValue}>{score.correct}/{score.total}</Text>
                              <Text style={styles.statLabel}>Doğru</Text>
                            </View>
                            <View style={styles.statCard}>
                              <Text style={styles.statValue}>{getTimeText(score.timeSpent)}</Text>
                              <Text style={styles.statLabel}>Süre</Text>
                            </View>
                            <View style={styles.statCard}>
                              <Text style={styles.statValue}>{Math.round((score.correct / score.total) * 100)}%</Text>
                              <Text style={styles.statLabel}>Başarı</Text>
                            </View>
                          </View>
                        </Card>

                        {/* Detaylı Sonuçlar */}
                        <TouchableOpacity
                          style={styles.detailedResultsBtn}
                          onPress={() => setShowDetailedResults(!showDetailedResults)}
                        >
                          <Text style={[styles.performanceText, { color: colors.quizPrimary }]}>
                            {showDetailedResults ? "Sonuçları Gizle" : "Detaylı Sonuçlar"}
                          </Text>
                        </TouchableOpacity>

                        {showDetailedResults && (
                          <View style={styles.detailedResultsContainer}>
                            {score.questionResults.map((result, index) => (
                              <Card key={index} style={styles.questionResultCard}>
                                <Text style={styles.questionText}>
                                  {index + 1}. {result.question}
                                </Text>
                                <View style={styles.answerComparison}>
                                  <Ionicons 
                                    name={result.isCorrect ? "checkmark-circle" : "close-circle"} 
                                    size={20} 
                                    color={result.isCorrect ? "#10B981" : "#EF4444"} 
                                  />
                                  <Text style={result.isCorrect ? styles.answerValueCorrect : styles.answerValueIncorrect}>
                                    {result.isCorrect ? "Doğru" : "Yanlış"}
                                  </Text>
                                  {!result.isCorrect && (
                                    <>
                                      <Text style={styles.answerValueCorrect}>
                                        Doğru: {result.correctAnswer}
                                      </Text>
                                    </>
                                  )}
                                </View>
                                <Text style={styles.modalText}>{result.explanation}</Text>
                              </Card>
                            ))}
                          </View>
                        )}

                        {/* Quiz Sayfasına Dön Butonu */}
                        <TouchableOpacity
                          style={[styles.navBtn, styles.retakeBtn]}
                          onPress={() => navigation.goBack()}
                        >
                          <Ionicons name="arrow-back" size={18} color={colors.white} />
                          <Text style={styles.navBtnText}>Quiz Sayfasına Dön</Text>
                        </TouchableOpacity>
                      </>
                    );
                  })()}
                </View>
              </Card>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* AI Yardım Modal */}
      {showAiHelpModal && (
        <View style={styles.aiHelpModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Yardım</Text>
            {aiHelpLoading ? (
              <View style={{ alignItems: "center", padding: 20 }}>
                <ActivityIndicator size="large" color={colors.quizPrimary} />
                <Text style={[styles.modalText, { marginTop: 16 }]}>AI analiz ediyor...</Text>
              </View>
            ) : (
              <Text style={styles.modalText}>{aiExplanation}</Text>
            )}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowAiHelpModal(false)}
            >
              <Text style={styles.modalCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GradientBackground>
  );
};

export default QuizSolvingScreen; 