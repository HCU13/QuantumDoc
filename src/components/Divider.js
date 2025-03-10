// src/components/Divider.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Text } from "./Text";

/**
 * Divider bileşeni
 * İçerik arasına ayırıcı/bölücü çizgi ekleme
 *
 * @param {string} text - Ayırıcı ortasında gösterilecek metin (isteğe bağlı)
 * @param {number} thickness - Çizgi kalınlığı
 * @param {string} orientation - Yönlendirme (horizontal, vertical)
 * @param {Object} style - Özel stil özellikleri
 */
export const Divider = ({
  text,
  thickness = 1,
  orientation = "horizontal",
  style,
}) => {
  const { theme } = useTheme();

  // Text yoksa basit bir ayırıcı çizgi göster
  if (!text) {
    return (
      <View
        style={[
          styles.divider,
          orientation === "vertical" && styles.verticalDivider,
          { backgroundColor: theme.colors.border, height: thickness },
          style,
        ]}
      />
    );
  }

  // Text varsa, metni ortada gösteren bir ayırıcı göster
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.line,
          { backgroundColor: theme.colors.border, height: thickness },
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            color: theme.colors.textSecondary,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {text}
      </Text>
      <View
        style={[
          styles.line,
          { backgroundColor: theme.colors.border, height: thickness },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    marginVertical: 10,
  },
  verticalDivider: {
    height: "100%",
    width: 1,
    marginHorizontal: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: {
    flex: 1,
  },
  text: {
    paddingHorizontal: 10,
    fontSize: 14,
  },
});
