// src/components/Avatar.js
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

/**
 * Avatar bileşeni
 * Kullanıcı avatarı gösterimi
 *
 * @param {string} source - Resim kaynağı URL'si
 * @param {number} size - Avatar boyutu
 * @param {function} onPress - Tıklama işleyicisi (isteğe bağlı)
 * @param {Object} style - Özel stil özellikleri
 */
export const Avatar = ({ source, size = 40, onPress, style, ...props }) => {
  const { theme } = useTheme();

  // Eğer onPress varsa TouchableOpacity, yoksa View kullan
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {source ? (
        <Image source={{ uri: source }} style={styles.image} />
      ) : (
        <Ionicons
          name="person"
          size={size * 0.6}
          color={theme.colors.textSecondary}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
