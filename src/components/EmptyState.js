// src/components/EmptyState.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Button } from "./Button";
import { useTheme } from "../context/ThemeContext";
import { useLocalization } from "../context/LocalizationContext";

/**
 * EmptyState bileşeni
 * Veri olmadığı durumlarda görüntülenecek boş durum
 *
 * @param {string} icon - İkon adı (Ionicons)
 * @param {string} title - Başlık metni
 * @param {string} description - Açıklama metni
 * @param {string} actionText - Eylem düğmesi metni
 * @param {function} onAction - Eylem düğmesi tıklama işleyicisi
 * @param {Object} style - Özel stil özellikleri
 */
export const EmptyState = ({
  icon = "document-outline",
  title = "No Data Yet",
  description = "There's nothing to show here yet",
  actionText,
  onAction,
  style,
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();

  // Çeviri desteği
  const translatedTitle =
    title?.startsWith("common.") || title?.startsWith("empty.")
      ? t(title)
      : title;

  const translatedDescription =
    description?.startsWith("common.") || description?.startsWith("empty.")
      ? t(description)
      : description;

  const translatedActionText =
    actionText?.startsWith("common.") || actionText?.startsWith("button.")
      ? t(actionText)
      : actionText;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
        style,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.primary + "15" }, // %15 opaklıkta primary rengi
        ]}
      >
        <Ionicons name={icon} size={38} color={theme.colors.primary} />
      </View>

      <Text variant="h2" style={[styles.title, { color: theme.colors.text }]}>
        {translatedTitle}
      </Text>

      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {translatedDescription}
      </Text>

      {actionText && onAction && (
        <Button
          title={translatedActionText}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    margin: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 20,
    maxWidth: "80%",
  },
  button: {
    minWidth: 200,
  },
});
