import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { SIZES, FONTS } from "../../constants/theme";

const { width, height } = Dimensions.get('window');

const CalculatorScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearDisplay = () => {
    setDisplay("0");
    setWaitingForOperand(false);
  };

  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performFunction = (func) => {
    const inputValue = parseFloat(display);
    let result;
    
    try {
      switch (func) {
        case "sqrt":
          result = Math.sqrt(inputValue);
          break;
        case "square":
          result = inputValue * inputValue;
          break;
        case "sin":
          result = Math.sin(inputValue * Math.PI / 180);
          break;
        case "log":
          result = Math.log10(inputValue);
          break;
        default:
          result = inputValue;
      }
      
      if (isNaN(result) || !isFinite(result)) {
        setDisplay("Error");
      } else {
        setDisplay(String(result));
      }
    } catch (error) {
      setDisplay("Error");
    }
    
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const styles = {
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    displayContainer: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    displayText: {
      ...FONTS.h2,
      color: colors.textPrimary,
      textAlign: "right",
      fontFamily: "monospace",
      fontSize: 28,
    },
    buttonGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "space-between",
    },
    button: (type = "number") => ({
      width: (width - 48) / 5 - 6.4,
      height: 55,
      backgroundColor: type === "operator" ? colors.calculatorPrimary : 
                    type === "function" ? colors.calculatorPrimary :
                    type === "clear" ? colors.error :
                    type === "equals" ? colors.calculatorPrimary :
                    type === "calculate" ? colors.calculatorPrimary :
                    type === "variable" ? colors.calculatorSecondary :
                    colors.white,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: type === "operator" ? colors.calculatorPrimary : 
                   type === "function" ? colors.calculatorPrimary :
                   type === "clear" ? colors.error :
                   type === "equals" ? colors.calculatorPrimary :
                   type === "calculate" ? colors.calculatorPrimary :
                   type === "variable" ? colors.calculatorSecondary :
                   colors.border,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2.22,
      elevation: 3,
    }),
    buttonText: (type = "number") => ({
      ...FONTS.body5,
      color: type === "operator" || type === "function" || type === "clear" || type === "equals" || type === "calculate" || type === "variable" ? colors.white : colors.textPrimary,
      fontWeight: "600",
      fontSize: 14,
    }),
    wideButton: {
      width: (width - 48) / 2.5 - 3.2,
    },
    calculateButton: {
      width: (width - 48) / 2.5 - 3.2,
      height: 55,
    },
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <Header title="Hesap Makinesi" />
        
        <View style={styles.content}>
          {/* Ekran */}
          <View style={styles.displayContainer}>
            <Text style={styles.displayText}>{display}</Text>
          </View>

          {/* Butonlar - Profesyonel Hesap Makinesi Düzeni */}
          <View style={styles.buttonGrid}>
            {/* Row 1: Parantezler, Değişkenler, Temizleme */}
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("(")}>
              <Text style={styles.buttonText("variable")}>(</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit(")")}>
              <Text style={styles.buttonText("variable")}>)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("x")}>
              <Text style={styles.buttonText("variable")}>x</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("y")}>
              <Text style={styles.buttonText("variable")}>y</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("clear")} onPress={clearAll}>
              <Text style={styles.buttonText("clear")}>AC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("function")} onPress={backspace}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>

            {/* Row 2: Karşılaştırma ve Sayılar 7-8-9 */}
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit(">")}>
              <Text style={styles.buttonText("variable")}>{">"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("<")}>
              <Text style={styles.buttonText("variable")}>{"<"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(7)}>
              <Text style={styles.buttonText("number")}>7</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(8)}>
              <Text style={styles.buttonText("number")}>8</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(9)}>
              <Text style={styles.buttonText("number")}>9</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("operator")} onPress={() => performOperation("÷")}>
              <Text style={styles.buttonText("operator")}>÷</Text>
            </TouchableOpacity>

            {/* Row 3: Karşılaştırma ve Sayılar 4-5-6 */}
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("≥")}>
              <Text style={styles.buttonText("variable")}>{"≥"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("≤")}>
              <Text style={styles.buttonText("variable")}>{"≤"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(4)}>
              <Text style={styles.buttonText("number")}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(5)}>
              <Text style={styles.buttonText("number")}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(6)}>
              <Text style={styles.buttonText("number")}>6</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("operator")} onPress={() => performOperation("×")}>
              <Text style={styles.buttonText("operator")}>×</Text>
            </TouchableOpacity>

            {/* Row 4: Fonksiyonlar ve Sayılar 1-2-3 */}
            <TouchableOpacity style={styles.button("function")} onPress={() => performFunction("sqrt")}>
              <Text style={styles.buttonText("function")}>√</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("function")} onPress={() => performFunction("square")}>
              <Text style={styles.buttonText("function")}>x²</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(1)}>
              <Text style={styles.buttonText("number")}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(2)}>
              <Text style={styles.buttonText("number")}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={() => inputDigit(3)}>
              <Text style={styles.buttonText("number")}>3</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("operator")} onPress={() => performOperation("-")}>
              <Text style={styles.buttonText("operator")}>-</Text>
            </TouchableOpacity>

            {/* Row 5: Özel Fonksiyonlar ve Alt Satır 0 */}
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("()")}>
              <Text style={styles.buttonText("variable")}>()</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("variable")} onPress={() => inputDigit("a/b")}>
              <Text style={styles.buttonText("variable")}>a/b</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button("number"), styles.wideButton]} onPress={() => inputDigit(0)}>
              <Text style={styles.buttonText("number")}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("number")} onPress={inputDecimal}>
              <Text style={styles.buttonText("number")}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("equals")} onPress={handleEquals}>
              <Text style={styles.buttonText("equals")}>=</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("operator")} onPress={() => performOperation("+")}>
              <Text style={styles.buttonText("operator")}>+</Text>
            </TouchableOpacity>

            {/* Row 6: Alt Satır - Navigasyon ve Hesapla */}
            <TouchableOpacity style={styles.button("function")} onPress={() => performFunction("sin")}>
              <Text style={styles.buttonText("function")}>sin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("function")} onPress={() => performFunction("log")}>
              <Text style={styles.buttonText("function")}>log</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("function")} onPress={() => {}}>
              <Ionicons name="arrow-undo" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("function")} onPress={() => {}}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button("function")} onPress={() => {}}>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button("calculate"), styles.calculateButton]} onPress={handleEquals}>
              <Text style={styles.buttonText("calculate")}>Hesapla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default CalculatorScreen; 