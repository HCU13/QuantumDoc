import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Vibration,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import {
  calculateFunction,
  calculateOperation,
  formatDisplay,
  formatExpression,
  formatNumber,
  calculateArcSin,
  calculateArcCos,
  calculateArcTan,
  calculateTenToX,
  calculateTwoToX,
  calculateYRootX,
  getPi,
  getE,
  calculatePercentage,
} from "../../utils/calculatorUtils";

const { width } = Dimensions.get("window");
const BUTTON_GAP = 10;
const BUTTON_SIZE = ((width - SPACING.md * 4 - BUTTON_GAP * 6) / 7) * 1.13; // 7 sütun - butonlar %5 daha büyük

const CalculatorScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [shouldReset, setShouldReset] = useState(false);
  const [isRadMode, setIsRadMode] = useState(false);
  const [openParentheses, setOpenParentheses] = useState(0);

  const handleNumber = (num) => {
    Vibration.vibrate(10);

    // Eğer display "Error" veya hata mesajı varsa sıfırla
    if (display === "Error" || display.startsWith("Hata:")) {
      setDisplay(String(num));
      setShouldReset(false);
      setPreviousValue(null);
      setOperation(null);
      setOpenParentheses(0);
      return;
    }

    // Eğer display "(" ise, parantez içine sayı gir: "(num"
    if (display === "(") {
      setDisplay("(" + String(num));
      setShouldReset(false);
      return;
    }

    // Eğer display "(" ile başlıyorsa (parantez içindeyiz), sayıyı ekle
    if (display.startsWith("(") && !display.includes(")")) {
      setDisplay(display + String(num));
      setShouldReset(false);
      return;
    }

    // Eğer reset durumundaysak veya display "0" ise yeni sayıyı göster
    if (shouldReset || display === "0") {
      setDisplay(String(num));
      setShouldReset(false);
    } else {
      // Mevcut display'e yeni rakamı ekle
      setDisplay(display + String(num));
    }
  };

  const handleDecimal = () => {
    Vibration.vibrate(10);
    // Eğer hata varsa, işlem yapma
    if (display === "Error" || display.startsWith("Hata:")) {
      setDisplay("0.");
      setPreviousValue(null);
      setOperation(null);
      setOpenParentheses(0);
      setShouldReset(false);
      return;
    }
    // Eğer display "(" ise, "(0." yap
    if (display === "(") {
      setDisplay("(0.");
      setShouldReset(false);
      return;
    }
    // Eğer display "(" ile başlıyorsa (parantez içindeyiz), "." ekle
    if (
      display.startsWith("(") &&
      !display.includes(")") &&
      !display.includes(".")
    ) {
      setDisplay(display + ".");
      setShouldReset(false);
      return;
    }
    if (shouldReset) {
      setDisplay("0.");
      setShouldReset(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperation = (op) => {
    Vibration.vibrate(10);

    // Eğer display "(" ise, işlem yapma (kullanıcı önce sayı girmeli)
    if (
      display === "(" ||
      (display.startsWith("(") && !display.includes(")"))
    ) {
      return; // İşlem yapma - parantez içinde sayı girişi devam ediyor
    }

    // Eğer display parantez içinde sayı içeriyorsa (örn: "(564)"), parantez içindeki sayıyı al
    let currentValueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      // "(564)" -> "564" çıkar
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        currentValueStr = match[1];
      }
    }

    const currentValue = parseFloat(currentValueStr);

    // NaN veya geçersiz değer kontrolü
    if (
      isNaN(currentValue) ||
      display === "Error" ||
      display.startsWith("Hata:")
    ) {
      return; // İşlem yapma
    }

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const { result, error } = calculateOperation(
        previousValue,
        currentValue,
        operation
      );
      if (error) {
        setDisplay(`Hata: ${error}`);
        setPreviousValue(null);
        setOperation(null);
        setShouldReset(true);
        return;
      }
      setPreviousValue(result);
      setDisplay(String(result));
    }

    setOperation(op);
    setShouldReset(true);
  };

  const handleEquals = () => {
    Vibration.vibrate(20);
    if (!operation || previousValue === null) return;

    // Eğer display parantez içinde sayı içeriyorsa (örn: "(564)"), parantez içindeki sayıyı al
    let currentValueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        currentValueStr = match[1];
      }
    }

    const currentValue = parseFloat(currentValueStr);

    // NaN veya geçersiz değer kontrolü
    if (
      isNaN(currentValue) ||
      display === "Error" ||
      display === "(" ||
      display.startsWith("Hata:")
    ) {
      setDisplay("Hata: Geçersiz değer");
      setPreviousValue(null);
      setOperation(null);
      setShouldReset(true);
      return;
    }

    const { result, error } = calculateOperation(
      previousValue,
      currentValue,
      operation
    );

    if (error) {
      setDisplay(`Hata: ${error}`);
      setPreviousValue(null);
      setOperation(null);
      setShouldReset(true);
      return;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setShouldReset(true);
  };

  const handleClear = () => {
    Vibration.vibrate(10);
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setShouldReset(false);
    setOpenParentheses(0);
  };

  const handleClearEntry = () => {
    Vibration.vibrate(10);
    setDisplay("0");
    setShouldReset(false);
  };

  const handleBackspace = () => {
    Vibration.vibrate(10);
    // Eğer hata mesajı varsa, sıfırla
    if (display === "Error" || display.startsWith("Hata:")) {
      setDisplay("0");
      setPreviousValue(null);
      setOperation(null);
      setOpenParentheses(0);
      setShouldReset(false);
      return;
    }

    // Eğer display parantez içindeyse (örn: "(564"), geri sil
    if (display.startsWith("(") && !display.includes(")")) {
      if (display.length > 2) {
        // Örnek: "(564" -> "(56"
        setDisplay(display.slice(0, -1));
      } else if (display.length === 2) {
        // Örnek: "(5" -> "("
        setDisplay("(");
      } else {
        // Örnek: "(" -> "0"
        setDisplay("0");
        setOpenParentheses(Math.max(0, openParentheses - 1));
      }
      setShouldReset(false);
      return;
    }

    // Eğer display parantez içinde kapalı parantez varsa (örn: "(564)"), parantezi aç
    if (display.startsWith("(") && display.includes(")")) {
      // "(564)" -> "(564"
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        setDisplay("(" + match[1]);
        setShouldReset(false);
        return;
      }
    }

    // Normal durum: son karakteri sil
    if (display.length > 1 && display !== "0") {
      setDisplay(display.slice(0, -1));
      setShouldReset(false);
    } else {
      setDisplay("0");
      setShouldReset(false);
    }
  };

  const handleFunction = (func) => {
    Vibration.vibrate(10);

    // Eğer display parantez içinde sayı içeriyorsa (örn: "(564)"), parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      // Parantez açılmış ama kapanmamışsa, işlem yapma
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }

    const value = parseFloat(valueStr);

    if (
      isNaN(value) ||
      display === "Error" ||
      display === "(" ||
      display.startsWith("Hata:")
    ) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }

    const result = calculateFunction(func, value, isRadMode);

    if (result) {
      if (result.error) {
        setDisplay(`Hata: ${result.error}`);
        setPreviousValue(null);
        setOperation(null);
        setShouldReset(true);
        return;
      }
      if (!isFinite(result.result)) {
        setDisplay("Hata: Sonuç tanımsız");
        setShouldReset(true);
        return;
      }
      setDisplay(String(result.result));
      setShouldReset(true);
    }
  };

  const handlePower = () => {
    Vibration.vibrate(10);
    handleOperation("^");
  };

  const handleOpenParenthesis = () => {
    Vibration.vibrate(10);
    // Eğer hata varsa sıfırla
    if (display === "Error" || display.startsWith("Hata:")) {
      setDisplay("(");
      setPreviousValue(null);
      setOperation(null);
      setOpenParentheses(1);
      setShouldReset(false);
      return;
    }

    // Eğer display'de "0" varsa veya reset durumundaysa, parantez aç
    if (display === "0" || shouldReset) {
      setDisplay("(");
      setOpenParentheses(openParentheses + 1);
      setShouldReset(false);
      return;
    }

    // Eğer display'de geçerli bir sayı varsa, işlem yapılmadan parantez aç
    const currentValue = parseFloat(display);
    if (!isNaN(currentValue) && previousValue === null && operation === null) {
      // Sayı varsa ama işlem yoksa, parantez aç ve sayıyı sakla
      setPreviousValue(currentValue);
      setDisplay("(");
      setOpenParentheses(openParentheses + 1);
      setShouldReset(false);
    } else if (operation !== null) {
      // İşlem varsa, parantez içine geç
      setDisplay("(");
      setOpenParentheses(openParentheses + 1);
      setShouldReset(false);
    } else {
      // Diğer durumlarda parantez aç
      setDisplay("(");
      setOpenParentheses(openParentheses + 1);
      setShouldReset(false);
    }
  };

  const handleCloseParenthesis = () => {
    Vibration.vibrate(10);
    // Eğer açık parantez yoksa, işlem yapma
    if (openParentheses === 0) {
      return;
    }

    // Eğer hata varsa veya display sadece "(" ise, işlem yapma
    if (display === "Error" || display.startsWith("Hata:") || display === "(") {
      return;
    }

    // Eğer display "(" ile başlıyorsa ama ")" yoksa, parantezi kapat
    if (display.startsWith("(") && !display.includes(")")) {
      // Parantez içindeki sayıyı al ve parantezi kapat: "(564)" yap
      const valueInsideParentheses = display.substring(1); // "(" kısmını kaldır
      const currentValue = parseFloat(valueInsideParentheses);

      if (isNaN(currentValue)) {
        return;
      }

      // Önce parantezi kapat: "(564)"
      const closedParentheses = display + ")";
      setDisplay(closedParentheses);

      // Eğer işlem varsa, hesapla
      if (previousValue !== null && operation !== null) {
        const { result, error } = calculateOperation(
          previousValue,
          currentValue,
          operation
        );
        if (error) {
          setDisplay(`Hata: ${error}`);
          setPreviousValue(null);
          setOperation(null);
          setOpenParentheses(0);
          setShouldReset(true);
          return;
        }
        setDisplay(String(result));
        setPreviousValue(result);
        setOperation(null);
        setOpenParentheses(openParentheses - 1);
        setShouldReset(true);
      } else {
        // İşlem yoksa, parantezi kapalı bırak ve sayacı azalt
        setOpenParentheses(openParentheses - 1);
        setShouldReset(false);
      }
      return;
    }

    // Eğer display zaten ")" içeriyorsa (çoklu parantez), sadece sayacı azalt
    if (display.includes(")")) {
      setOpenParentheses(openParentheses - 1);
      setShouldReset(false);
      return;
    }

    const currentValue = parseFloat(display);
    if (isNaN(currentValue)) {
      return;
    }

    // Normal durum: parantez kapat ve hesapla
    if (previousValue !== null && operation !== null) {
      const { result, error } = calculateOperation(
        previousValue,
        currentValue,
        operation
      );
      if (error) {
        setDisplay(`Hata: ${error}`);
        setPreviousValue(null);
        setOperation(null);
        setOpenParentheses(0);
        setShouldReset(true);
        return;
      }
      setDisplay(String(result));
      setPreviousValue(result);
      setOperation(null);
      setOpenParentheses(openParentheses - 1);
      setShouldReset(true);
    } else {
      setOpenParentheses(openParentheses - 1);
      setShouldReset(false);
    }
  };

  const handlePi = () => {
    Vibration.vibrate(10);
    setDisplay(String(getPi()));
    setShouldReset(true);
  };

  const handleE = () => {
    Vibration.vibrate(10);
    setDisplay(String(getE()));
    setShouldReset(true);
  };

  const handleArcSin = () => {
    Vibration.vibrate(10);
    // Parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || display === "Error" || display.startsWith("Hata:")) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }
    const { result, error } = calculateArcSin(value, isRadMode);
    if (error) {
      setDisplay(`Hata: ${error}`);
      setPreviousValue(null);
      setOperation(null);
      setShouldReset(true);
      return;
    }
    setDisplay(String(result));
    setShouldReset(true);
  };

  const handleArcCos = () => {
    Vibration.vibrate(10);
    // Parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || display === "Error" || display.startsWith("Hata:")) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }
    const { result, error } = calculateArcCos(value, isRadMode);
    if (error) {
      setDisplay(`Hata: ${error}`);
      setPreviousValue(null);
      setOperation(null);
      setShouldReset(true);
      return;
    }
    setDisplay(String(result));
    setShouldReset(true);
  };

  const handleArcTan = () => {
    Vibration.vibrate(10);
    // Parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || display === "Error" || display.startsWith("Hata:")) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }
    const { result, error } = calculateArcTan(value, isRadMode);
    if (error) {
      setDisplay(`Hata: ${error}`);
      setPreviousValue(null);
      setOperation(null);
      setShouldReset(true);
      return;
    }
    setDisplay(String(result));
    setShouldReset(true);
  };

  const handleTenToX = () => {
    Vibration.vibrate(10);
    // Parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || display === "Error" || display.startsWith("Hata:")) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }
    const { result, error } = calculateTenToX(value);
    if (error) {
      setDisplay(`Hata: ${error}`);
      setShouldReset(true);
      return;
    }
    setDisplay(String(result));
    setShouldReset(true);
  };

  const handleTwoToX = () => {
    Vibration.vibrate(10);
    // Parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || display === "Error" || display.startsWith("Hata:")) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }
    const { result, error } = calculateTwoToX(value);
    if (error) {
      setDisplay(`Hata: ${error}`);
      setShouldReset(true);
      return;
    }
    setDisplay(String(result));
    setShouldReset(true);
  };

  const handleYRootX = () => {
    Vibration.vibrate(10);
    // Parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || display === "Error" || display.startsWith("Hata:")) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }
    if (previousValue !== null) {
      const { result, error } = calculateYRootX(value, previousValue);
      if (error) {
        setDisplay(`Hata: ${error}`);
        setPreviousValue(null);
        setOperation(null);
        setShouldReset(true);
        return;
      }
      setDisplay(String(result));
      setPreviousValue(null);
      setShouldReset(true);
    } else {
      setDisplay("Hata: Önce y değerini girin");
      setShouldReset(true);
    }
  };

  const handlePercentage = () => {
    Vibration.vibrate(10);
    // Parantez içindeki sayıyı al
    let valueStr = display;
    if (display.startsWith("(") && display.includes(")")) {
      const match = display.match(/\(([^)]+)\)/);
      if (match) {
        valueStr = match[1];
      }
    } else if (display.startsWith("(") && !display.includes(")")) {
      setDisplay("Hata: Parantez kapatılmadı");
      setShouldReset(true);
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || display === "Error" || display.startsWith("Hata:")) {
      setDisplay("Hata: Geçersiz değer");
      setShouldReset(true);
      return;
    }
    const { result, error } = calculatePercentage(value);
    if (error) {
      setDisplay(`Hata: ${error}`);
      setShouldReset(true);
      return;
    }
    setDisplay(String(result));
    setShouldReset(true);
  };

  // Dinamik font boyutu hesaplama - Apple Calculator tarzı
  const getDisplayFontSize = (text) => {
    if (!text || typeof text !== "string") {
      return 64; // Varsayılan font boyutu
    }
    const length = text.length;
    if (length === 0) return 64;
    // İlk 9 karaktere kadar tam boyutta kal (64px)
    if (length <= 9) return 64;
    // Sonrasında tutarlı bir şekilde küçül
    if (length <= 11) return 54;
    if (length <= 13) return 46;
    if (length <= 15) return 40;
    if (length <= 17) return 34;
    if (length <= 19) return 30;
    if (length <= 21) return 26;
    return 22;
  };

  const getExpressionFontSize = (text) => {
    if (!text || typeof text !== "string") {
      return 32; // Varsayılan font boyutu
    }
    const length = text.length;
    if (length === 0) return 32;
    // Expression text sadece kendi uzunluğuna göre küçülsün, display text'ten bağımsız
    if (length <= 10) return 32;
    if (length <= 15) return 28;
    if (length <= 20) return 24;
    if (length <= 25) return 20;
    if (length <= 30) return 18;
    return 16;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    modeButton: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeButtonActive: {
      backgroundColor: colors.primary + "20",
      borderColor: colors.primary,
    },
    modeText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textPrimary,
      fontWeight: "600",
      fontSize: 10,
    },
    modeTextActive: {
      color: colors.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.md,
      paddingBottom: 0,
      justifyContent: "space-between",
    },
    displaySection: {
      paddingTop: SPACING.xxxl + 140,
      paddingLeft: SPACING.sm,
      paddingRight: SPACING.md,
      minHeight: 70,
      maxHeight: 90,
      width: "100%",
    },
    expressionText: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
      textAlign: "right",
      marginBottom: 0,
      marginTop: 0,
      opacity: 0.7,
      minHeight: 52,
      maxHeight: 68,
      letterSpacing: 0.5,
      width: "100%",
      fontWeight: "400",
      paddingVertical: SPACING.sm + 5,
      includeFontPadding: false,
    },
    displayText: {
      ...TEXT_STYLES.displayLarge,
      color: colors.textPrimary,
      fontWeight: "300",
      textAlign: "right",
      fontFamily: "Inter-Light",
      letterSpacing: -0.5,
      width: "100%",
      flexShrink: 1,
      includeFontPadding: false,
    },
    buttonsContainer: {
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.sm,
      paddingTop: SPACING.xs,
      backgroundColor: "transparent",
    },
    fullRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: BUTTON_GAP,
      alignItems: "center",
      gap: BUTTON_GAP,
    },
    button: {
      borderRadius: BUTTON_SIZE / 2,
      justifyContent: "center",
      alignItems: "center",
      ...SHADOWS.medium,
    },
    scientificButton: {
      borderRadius: BUTTON_SIZE / 2,
      justifyContent: "center",
      alignItems: "center",
      ...SHADOWS.small,
    },
    buttonText: {
      fontSize: 36,
      fontWeight: "400",
      color: "#FFFFFF",
    },
    buttonTextGray: {
      fontSize: 22,
      fontWeight: "400",
      color: colors.textPrimary,
    },
    scientificButtonText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    buttonTextOrange: {
      fontSize: 36,
      fontWeight: "400",
      color: "#FFFFFF",
    },
    buttonLightGray: {
      backgroundColor: isDark ? "#505050" : "#D4D4D4",
    },
    buttonDarkGray: {
      backgroundColor: isDark ? "#1C1C1E" : "#9E9E9E",
    },
    buttonOrange: {
      backgroundColor: "#FF9500",
    },
    buttonOrangePressed: {
      backgroundColor: "#FFFFFF",
    },
    buttonOrangeTextPressed: {
      color: "#FF9500",
    },
  });

  const Button = ({
    label,
    onPress,
    type = "lightGray",
    wide = false,
    icon = null,
    small = false,
  }) => {
    const getButtonStyle = () => {
      const buttonSize = BUTTON_SIZE;
      const baseStyle = [
        small ? styles.scientificButton : styles.button,
        { width: buttonSize, height: buttonSize }, // Tüm butonlar aynı boyutta
      ];
      switch (type) {
        case "lightGray":
          return [...baseStyle, styles.buttonLightGray];
        case "darkGray":
          return [...baseStyle, styles.buttonDarkGray];
        case "orange":
          return [...baseStyle, styles.buttonOrange];
        default:
          return [...baseStyle, styles.buttonLightGray];
      }
    };

    const getTextStyle = () => {
      const baseStyle = small
        ? styles.scientificButtonText
        : styles.buttonTextGray;
      switch (type) {
        case "lightGray":
          return baseStyle;
        case "darkGray":
          return baseStyle;
        case "orange":
          return small ? styles.scientificButtonText : styles.buttonTextOrange;
        default:
          return baseStyle;
      }
    };

    return (
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={small ? 20 : 28}
            color={type === "orange" ? "#FFFFFF" : colors.textPrimary}
          />
        ) : (
          label && <Text style={getTextStyle()}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const currentExpression = formatExpression(previousValue, operation);

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        {/* Header */}
        <Header
          title={t("modules.calculator.title")}
          showBackButton={true}
          alignLeft={true}
          rightComponent={
            <TouchableOpacity
              style={[styles.modeButton, isRadMode && styles.modeButtonActive]}
              onPress={() => setIsRadMode(!isRadMode)}
              onLongPress={() => {
                Alert.alert(
                  isRadMode ? "Radyan Modu (RAD)" : "Derece Modu (DEG)",
                  isRadMode
                    ? "Trigonometrik fonksiyonlar radyan cinsinden çalışır (0-2π).\n\nÖrnek: sin(π/2) = 1"
                    : "Trigonometrik fonksiyonlar derece cinsinden çalışır (0-360°).\n\nÖrnek: sin(90°) = 1",
                  [{ text: "Tamam" }]
                );
              }}
            >
              <Text
                style={[styles.modeText, isRadMode && styles.modeTextActive]}
              >
                {isRadMode ? "RAD" : "DEG"}
              </Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.content}>
          {/* Display Section - Apple Calculator Style */}
          <View style={styles.displaySection}>
            <View
              style={{
                minHeight: 30,
                justifyContent: "flex-end",
                marginBottom: 2,
                paddingTop: 0,
                marginTop: 20,
              }}
            >
              {currentExpression ? (
                <Text
                  style={[
                    styles.expressionText,
                    {
                      fontSize: getExpressionFontSize(currentExpression),
                      minHeight: getExpressionFontSize(currentExpression) * 1.2,
                    },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={false}
                  ellipsizeMode="tail"
                >
                  {currentExpression}
                </Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.displayText,
                {
                  fontSize: getDisplayFontSize(formatNumber(display || "0")),
                  lineHeight:
                    getDisplayFontSize(formatNumber(display || "0")) * 1.15,
                  minHeight:
                    getDisplayFontSize(formatNumber(display || "0")) * 1.2,
                  marginTop: -10,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={false}
              ellipsizeMode="head"
            >
              {formatNumber(display || "0")}
            </Text>
          </View>
        </View>

        {/* Buttons - Professional Scientific Calculator Layout - Standard Arrangement */}
        <View style={styles.buttonsContainer}>
          {/* Row 1: AC | C | DEL | % | ÷ (Top row: Clear and division) */}
          <View style={styles.fullRow}>
            <Button label="AC" type="darkGray" onPress={handleClear} small />
            <Button
              label="C"
              type="darkGray"
              onPress={handleClearEntry}
              small
            />
            <Button
              label="DEL"
              type="lightGray"
              onPress={handleBackspace}
              icon="backspace-outline"
            />
            <Button label="%" type="lightGray" onPress={handlePercentage} />
            <Button
              label="÷"
              type="orange"
              onPress={() => handleOperation("÷")}
            />
            <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
            <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
          </View>

          {/* Row 2: sin | cos | tan | 7 | 8 | 9 | × (Trigonometry + Numpad row 1) */}
          <View style={styles.fullRow}>
            <Button
              label="sin"
              type="lightGray"
              onPress={() => handleFunction("sin")}
              small
            />
            <Button
              label="cos"
              type="lightGray"
              onPress={() => handleFunction("cos")}
              small
            />
            <Button
              label="tan"
              type="lightGray"
              onPress={() => handleFunction("tan")}
              small
            />
            <Button label="7" type="darkGray" onPress={() => handleNumber(7)} />
            <Button label="8" type="darkGray" onPress={() => handleNumber(8)} />
            <Button label="9" type="darkGray" onPress={() => handleNumber(9)} />
            <Button
              label="×"
              type="orange"
              onPress={() => handleOperation("×")}
            />
          </View>

          {/* Row 3: sin⁻¹ | cos⁻¹ | tan⁻¹ | 4 | 5 | 6 | − (Arc functions + Numpad row 2) */}
          <View style={styles.fullRow}>
            <Button
              label="sin⁻¹"
              type="lightGray"
              onPress={handleArcSin}
              small
            />
            <Button
              label="cos⁻¹"
              type="lightGray"
              onPress={handleArcCos}
              small
            />
            <Button
              label="tan⁻¹"
              type="lightGray"
              onPress={handleArcTan}
              small
            />
            <Button label="4" type="darkGray" onPress={() => handleNumber(4)} />
            <Button label="5" type="darkGray" onPress={() => handleNumber(5)} />
            <Button label="6" type="darkGray" onPress={() => handleNumber(6)} />
            <Button
              label="−"
              type="orange"
              onPress={() => handleOperation("-")}
            />
          </View>

          {/* Row 4: ln | log | √ | 1 | 2 | 3 | + (Logarithm + Numpad row 3) */}
          <View style={styles.fullRow}>
            <Button
              label="ln"
              type="lightGray"
              onPress={() => handleFunction("ln")}
              small
            />
            <Button
              label="log"
              type="lightGray"
              onPress={() => handleFunction("log")}
              small
            />
            <Button
              label="√"
              type="lightGray"
              onPress={() => handleFunction("sqrt")}
              small
            />
            <Button label="1" type="darkGray" onPress={() => handleNumber(1)} />
            <Button label="2" type="darkGray" onPress={() => handleNumber(2)} />
            <Button label="3" type="darkGray" onPress={() => handleNumber(3)} />
            <Button
              label="+"
              type="orange"
              onPress={() => handleOperation("+")}
            />
          </View>

          {/* Row 5: x² | x³ | x^y | 0 | . | ± | = (Power functions + Bottom row) */}
          <View style={styles.fullRow}>
            <Button
              label="x²"
              type="lightGray"
              onPress={() => handleFunction("square")}
              small
            />
            <Button
              label="x³"
              type="lightGray"
              onPress={() => handleFunction("cube")}
              small
            />
            <Button label="x^y" type="lightGray" onPress={handlePower} small />
            <Button label="0" type="darkGray" onPress={() => handleNumber(0)} />
            <Button label="." type="darkGray" onPress={handleDecimal} />
            <Button
              label="±"
              type="lightGray"
              onPress={() => {
                Vibration.vibrate(10);
                if (display === "Error" || display.startsWith("Hata:")) {
                  return;
                }
                // Parantez içindeki sayıyı al
                let valueStr = display;
                if (display.startsWith("(") && display.includes(")")) {
                  const match = display.match(/\(([^)]+)\)/);
                  if (match) {
                    valueStr = match[1];
                  }
                } else if (display.startsWith("(") && !display.includes(")")) {
                  // Parantez açılmış ama kapanmamışsa, işaret değiştirmeyi parantez içine uygula
                  const value = parseFloat(display.substring(1));
                  if (!isNaN(value)) {
                    setDisplay("(" + String(-value));
                  }
                  return;
                }
                const value = parseFloat(valueStr);
                if (!isNaN(value)) {
                  if (display.startsWith("(") && display.includes(")")) {
                    // Parantez içindeki sayının işaretini değiştir
                    setDisplay("(" + String(-value) + ")");
                  } else {
                    setDisplay(String(-value));
                  }
                  setShouldReset(false);
                }
              }}
            />
            <Button label="=" type="orange" onPress={handleEquals} />
          </View>

          {/* Row 6: 10ˣ | 2ˣ | y√x | eˣ | π | e | 1/x (Exponential functions + Constants) */}
          <View style={styles.fullRow}>
            <Button label="10ˣ" type="lightGray" onPress={handleTenToX} small />
            <Button label="2ˣ" type="lightGray" onPress={handleTwoToX} small />
            <Button label="y√x" type="lightGray" onPress={handleYRootX} small />
            <Button
              label="eˣ"
              type="lightGray"
              onPress={() => handleFunction("exp")}
              small
            />
            <Button label="π" type="lightGray" onPress={handlePi} small />
            <Button label="e" type="lightGray" onPress={handleE} small />
            <Button
              label="1/x"
              type="lightGray"
              onPress={() => handleFunction("1/x")}
              small
            />
          </View>

          {/* Row 7: x! | ( | ) | (empty) | (empty) | (empty) | (empty) (Factorial + Parentheses) */}
          <View style={styles.fullRow}>
            <Button
              label="x!"
              type="lightGray"
              onPress={() => handleFunction("factorial")}
              small
            />
            <Button
              label="("
              type="lightGray"
              onPress={handleOpenParenthesis}
              small
            />
            <Button
              label=")"
              type="lightGray"
              onPress={handleCloseParenthesis}
              small
            />
            <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
            <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
            <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
            <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default CalculatorScreen;
