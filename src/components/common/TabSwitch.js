import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const TabSwitch = ({
  options = [],
  selectedValue,
  onValueChange,
  containerStyle,
  module = null, // 'textEditor', 'imageAnalyzer', etc.
  ...props
}) => {
  const { colors, isDark } = useTheme();

  // Modül rengini belirle
  const getModuleColor = () => {
    if (!module) return colors.primary;
    switch (module) {
      case "textEditor":
        return colors.textEditorPrimary;
      case "imageAnalyzer":
        return colors.imageAnalyzerPrimary;
      case "noteGenerator":
        return colors.noteGeneratorPrimary;
      case "math":
        return colors.mathPrimary;
      case "chat":
        return colors.chatPrimary;
      case "calculator":
        return colors.calculatorPrimary;
      default:
        return colors.primary;
    }
  };

  const moduleColor = getModuleColor();

  const styles = StyleSheet.create({
    tabSwitch: {
      flexDirection: "row",
      paddingVertical: SPACING.xs,
      alignItems: "center",
      ...(shouldEqualWidth && !useScrollView
        ? { justifyContent: "center" }
        : {}),
    },
    tabBtn: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.xs + 2,
      paddingHorizontal: SPACING.md,
      borderRadius: 12,
      flexDirection: "row",
      height: 36, // Sabit yükseklik - tüm butonlar eşit
      marginHorizontal: SPACING.xs,
      borderWidth: 0,
    },
    tabActive: {
      backgroundColor: moduleColor,
      shadowColor: moduleColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    tabInactive: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)",
    },
    tabText: {
      ...TEXT_STYLES.labelSmall,
      fontSize: 11,
      letterSpacing: 0.1,
    },
    tabTextActive: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    tabTextInactive: {
      color: colors.textSecondary,
      fontWeight: "600",
    },
    iconContainer: {
      marginRight: SPACING.xs,
    },
  });

  // 2 buton varsa eşit genişlik için flex hesapla
  const buttonCount = options.length;
  const shouldEqualWidth = buttonCount <= 3; // 3 veya daha az buton varsa eşit genişlik

  // 2 buton varsa ScrollView yerine View kullan (scroll gerekmez)
  const useScrollView = buttonCount > 2;

  const content = (
    <>
      {options.map((option) => {
        const isActive = selectedValue === option.value;
        const dynamicStyles = StyleSheet.create({
          tabBtn: {
            ...styles.tabBtn,
            backgroundColor: isActive
              ? moduleColor
              : isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
            ...(shouldEqualWidth && { flex: 1 }), // Eşit genişlik için
          },
        });

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              dynamicStyles.tabBtn,
              isActive ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={option.icon}
                  size={14}
                  color={isActive ? "#FFFFFF" : colors.textSecondary}
                />
              </View>
            )}
            <Text
              style={[
                styles.tabText,
                isActive ? styles.tabTextActive : styles.tabTextInactive,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );

  if (useScrollView) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabSwitch, containerStyle]}
        style={{ flexGrow: 0 }}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={[styles.tabSwitch, containerStyle]}>{content}</View>;
};

export default TabSwitch;
