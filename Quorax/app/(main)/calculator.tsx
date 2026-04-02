import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import {
  SPACING,
  BORDER_RADIUS,
  TEXT_STYLES,
  SHADOWS,
} from "@/constants/theme";

const { width, height } = Dimensions.get("window");
const BUTTON_SIZE = (width - SPACING.lg * 2 - SPACING.sm * 4) / 5;

type Operation = "+" | "-" | "×" | "÷" | "^" | null;
type Mode = "basic" | "scientific";

export default function CalculatorScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [tokens] = useState(150);

  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");

  const formatNumber = (num: number): string => {
    if (!isFinite(num)) return "Error";
    if (Math.abs(num) > 1e15) {
      return num.toExponential(10);
    }
    if (Math.abs(num) < 1e-10 && num !== 0) {
      return num.toExponential(10);
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperation = (op: Operation) => {
    const currentValue = parseFloat(display.replace(/,/g, ""));

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(formatNumber(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setWaitingForNewValue(true);
  };

  const calculate = (prev: number, current: number, op: Operation): number => {
    switch (op) {
      case "+":
        return prev + current;
      case "-":
        return prev - current;
      case "×":
        return prev * current;
      case "÷":
        return current !== 0 ? prev / current : 0;
      case "^":
        return Math.pow(prev, current);
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (previousValue === null || operation === null) return;

    const currentValue = parseFloat(display.replace(/,/g, ""));
    const result = calculate(previousValue, currentValue, operation);
    setDisplay(formatNumber(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleClearEntry = () => {
    setDisplay("0");
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleToggleSign = () => {
    const currentValue = parseFloat(display.replace(/,/g, ""));
    setDisplay(formatNumber(-currentValue));
  };

  const handlePercentage = () => {
    const currentValue = parseFloat(display.replace(/,/g, ""));
    setDisplay(formatNumber(currentValue / 100));
  };

  // Scientific functions
  const handleScientificFunction = (func: string) => {
    const currentValue = parseFloat(display.replace(/,/g, ""));
    let result: number;

    switch (func) {
      case "sin":
        result = Math.sin(
          angleMode === "deg" ? (currentValue * Math.PI) / 180 : currentValue
        );
        break;
      case "cos":
        result = Math.cos(
          angleMode === "deg" ? (currentValue * Math.PI) / 180 : currentValue
        );
        break;
      case "tan":
        result = Math.tan(
          angleMode === "deg" ? (currentValue * Math.PI) / 180 : currentValue
        );
        break;
      case "ln":
        result = currentValue > 0 ? Math.log(currentValue) : 0;
        break;
      case "log":
        result = currentValue > 0 ? Math.log10(currentValue) : 0;
        break;
      case "sqrt":
        result = currentValue >= 0 ? Math.sqrt(currentValue) : 0;
        break;
      case "square":
        result = currentValue * currentValue;
        break;
      case "cube":
        result = currentValue * currentValue * currentValue;
        break;
      case "factorial":
        if (currentValue < 0 || currentValue > 170 || currentValue % 1 !== 0) {
          result = 0;
        } else {
          result = factorial(Math.floor(currentValue));
        }
        break;
      case "1/x":
        result = currentValue !== 0 ? 1 / currentValue : 0;
        break;
      case "exp":
        result = Math.exp(currentValue);
        break;
      case "pi":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      default:
        result = currentValue;
    }

    setDisplay(formatNumber(result));
    setWaitingForNewValue(true);
  };

  const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  // Memory functions
  const handleMemory = (action: "add" | "subtract" | "recall" | "clear") => {
    const currentValue = parseFloat(display.replace(/,/g, ""));

    switch (action) {
      case "add":
        setMemory(memory + currentValue);
        break;
      case "subtract":
        setMemory(memory - currentValue);
        break;
      case "recall":
        setDisplay(formatNumber(memory));
        setWaitingForNewValue(true);
        break;
      case "clear":
        setMemory(0);
        break;
    }
  };

  const getButtonStyle = (
    type:
      | "number"
      | "operation"
      | "function"
      | "equals"
      | "scientific"
      | "memory"
  ) => {
    const buttonHeight = BUTTON_SIZE * 0.9;
    const baseStyle = {
      width: BUTTON_SIZE,
      height: buttonHeight,
      borderRadius: BORDER_RADIUS.md,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingHorizontal: SPACING.xs,
      paddingVertical: SPACING.xs,
    };

    switch (type) {
      case "number":
        return [
          baseStyle,
          {
            backgroundColor: colors.card,
            ...SHADOWS.subtle,
          },
        ];
      case "operation":
        return [
          baseStyle,
          {
            backgroundColor: colors.moduleCalcLight,
            ...SHADOWS.subtle,
          },
        ];
      case "function":
        return [
          baseStyle,
          {
            backgroundColor: colors.backgroundSecondary,
            ...SHADOWS.subtle,
          },
        ];
      case "scientific":
        return [
          baseStyle,
          {
            backgroundColor: colors.surfaceMuted,
            ...SHADOWS.subtle,
          },
        ];
      case "memory":
        return [
          baseStyle,
          {
            backgroundColor: colors.moduleCalcIconBg,
            ...SHADOWS.subtle,
          },
        ];
      case "equals":
        return [
          baseStyle,
          {
            backgroundColor: colors.moduleCalcPrimary,
            ...SHADOWS.small,
          },
        ];
      default:
        return baseStyle;
    }
  };

  const getButtonTextStyle = (
    type:
      | "number"
      | "operation"
      | "function"
      | "equals"
      | "scientific"
      | "memory"
  ) => {
    const baseStyle = {
      ...TEXT_STYLES.labelMedium,
      fontWeight: "600" as const,
      textAlign: "center" as const,
      paddingHorizontal: SPACING.xs,
      paddingVertical: SPACING.xs,
    };

    switch (type) {
      case "number":
        return [baseStyle, { color: colors.textPrimary, fontSize: 18 }];
      case "operation":
        return [baseStyle, { color: colors.moduleCalcPrimary, fontSize: 22 }];
      case "function":
        return [baseStyle, { color: colors.textSecondary, fontSize: 16 }];
      case "scientific":
        return [baseStyle, { color: colors.moduleCalcPrimary, fontSize: 14 }];
      case "memory":
        return [baseStyle, { color: colors.textOnPrimary, fontSize: 12 }];
      case "equals":
        return [baseStyle, { color: colors.textOnPrimary, fontSize: 22 }];
      default:
        return [baseStyle, { color: colors.textPrimary }];
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ModuleHeader
        title={t("modules.calculator.title")}
        modulePrimary={colors.moduleCalcPrimary}
        moduleLight={colors.moduleCalcLight}
        onBackPress={() => router.canDismiss() ? router.dismiss() : router.replace("/(main)")}
      />

      <View style={styles.content}>
        {/* Top Section - Display */}
        <View style={styles.topSection}>
          {/* Display */}
          <View
            style={[
              styles.displayContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderSubtle,
              },
              SHADOWS.subtle,
            ]}
          >
            <View style={styles.displayContent}>
              {operation && previousValue !== null && (
                <Text
                  style={[
                    styles.operationText,
                    { color: colors.moduleCalcPrimary },
                  ]}
                >
                  {formatNumber(previousValue)} {operation}
                </Text>
              )}
              <Text
                style={[styles.displayText, { color: colors.textPrimary }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {display}
              </Text>
              <Text
                style={[styles.angleModeText, { color: colors.textTertiary }]}
              >
                {angleMode.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Memory Display */}
          {memory !== 0 && (
            <View
              style={[
                styles.memoryContainer,
                { backgroundColor: colors.moduleCalcLight },
              ]}
            >
              <Ionicons
                name="bookmark"
                size={16}
                color={colors.moduleCalcPrimary}
              />
              <Text
                style={[styles.memoryText, { color: colors.moduleCalcPrimary }]}
              >
                M: {formatNumber(memory)}
              </Text>
            </View>
          )}
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          {/* Scientific Functions Row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("sin")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>sin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("cos")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>cos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("tan")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>tan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("ln")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>ln</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("log")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>log</Text>
            </TouchableOpacity>
          </View>

          {/* Memory Functions Row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={getButtonStyle("memory")}
              onPress={() => handleMemory("add")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("memory")}>M+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("memory")}
              onPress={() => handleMemory("subtract")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("memory")}>M-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("memory")}
              onPress={() => handleMemory("recall")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("memory")}>MR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("memory")}
              onPress={() => handleMemory("clear")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("memory")}>MC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                getButtonStyle("scientific"),
                {
                  backgroundColor:
                    angleMode === "deg"
                      ? colors.moduleCalcPrimary
                      : colors.surfaceMuted,
                },
              ]}
              onPress={() => setAngleMode(angleMode === "deg" ? "rad" : "deg")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  getButtonTextStyle("scientific"),
                  {
                    color:
                      angleMode === "deg"
                        ? colors.textOnPrimary
                        : colors.moduleCalcPrimary,
                  },
                ]}
              >
                {angleMode === "deg" ? "DEG" : "RAD"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Function Row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={getButtonStyle("function")}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("function")}>AC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("function")}
              onPress={handleClearEntry}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("function")}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("function")}
              onPress={handleToggleSign}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("function")}>±</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("function")}
              onPress={handlePercentage}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("function")}>%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("operation")}
              onPress={() => handleOperation("÷")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("operation")}>÷</Text>
            </TouchableOpacity>
          </View>

          {/* Scientific Functions Row 2 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("sqrt")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>√</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("square")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>x²</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("cube")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>x³</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("factorial")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>x!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("1/x")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>1/x</Text>
            </TouchableOpacity>
          </View>

          {/* Number Row 1 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("7")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>7</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("8")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>8</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("9")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>9</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("operation")}
              onPress={() => handleOperation("^")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("operation")}>x^y</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("exp")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>e^x</Text>
            </TouchableOpacity>
          </View>

          {/* Number Row 2 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("4")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("5")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("6")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>6</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("operation")}
              onPress={() => handleOperation("-")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("operation")}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("pi")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>π</Text>
            </TouchableOpacity>
          </View>

          {/* Number Row 3 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("1")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("2")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={() => handleNumber("3")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("operation")}
              onPress={() => handleOperation("+")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("operation")}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("scientific")}
              onPress={() => handleScientificFunction("e")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("scientific")}>e</Text>
            </TouchableOpacity>
          </View>

          {/* Number Row 4 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                getButtonStyle("number"),
                {
                  width: BUTTON_SIZE * 2 + SPACING.sm,
                  height: BUTTON_SIZE * 0.9,
                },
              ]}
              onPress={() => handleNumber("0")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("number")}
              onPress={handleDecimal}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("number")}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("equals")}
              onPress={handleEquals}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("equals")}>=</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("operation")}
              onPress={() => handleOperation("×")}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle("operation")}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  topSection: {
    flexShrink: 0,
  },
  buttonsSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? SPACING.md : SPACING.sm,
  },
  displayContainer: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    height: 150,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  displayContent: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  displayText: {
    ...TEXT_STYLES.titleLarge,
    fontSize: 42,
    fontWeight: "300",
    textAlign: "right",
    letterSpacing: -1,
    paddingTop: 14,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  operationText: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 14,
    marginBottom: SPACING.xs,
    opacity: 0.7,
    textAlign: "right",
    paddingHorizontal: SPACING.xs,
  },
  angleModeText: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: "right",
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  memoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    height: 28,
  },
  memoryText: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "600",
  },
  scientificRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
});
