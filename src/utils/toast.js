// src/utils/toast.js
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

/**
 * Farklı bildirim türlerinde toast gösterme fonksiyonu
 * @param {string} type - Toast türü (success, error, info, warning)
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Görünme süresi (ms, varsayılan: 3000)
 */
export const showToast = (type, message, duration = 3000) => {
  Toast.show({
    type: type,
    text1: message,
    position: "bottom",
    visibilityTime: duration,
  });
};

/**
 * Başarı bildirimi gösterir
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Görünme süresi (ms)
 */
export const showSuccessToast = (message, duration) => {
  showToast("success", message, duration);
};

/**
 * Hata bildirimi gösterir
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Görünme süresi (ms)
 */
export const showErrorToast = (message, duration) => {
  showToast("error", message, duration);
};

/**
 * Bilgi bildirimi gösterir
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Görünme süresi (ms)
 */
export const showInfoToast = (message, duration) => {
  showToast("info", message, duration);
};

/**
 * Uyarı bildirimi gösterir
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Görünme süresi (ms)
 */
export const showWarningToast = (message, duration) => {
  showToast("warning", message, duration);
};

/**
 * Toast konfigürasyonu
 * Özelleştirilmiş toast bileşenleri
 */
export const toastConfig = {
  success: ({ text1, props }) => (
    <View style={[styles.container, styles.successContainer]}>
      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  error: ({ text1, props }) => (
    <View style={[styles.container, styles.errorContainer]}>
      <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  info: ({ text1, props }) => (
    <View style={[styles.container, styles.infoContainer]}>
      <Ionicons name="information-circle" size={24} color="#FFFFFF" />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  warning: ({ text1, props }) => (
    <View style={[styles.container, styles.warningContainer]}>
      <Ionicons name="warning" size={24} color="#FFFFFF" />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 56,
  },
  successContainer: {
    backgroundColor: "#10B981", // Yeşil
  },
  errorContainer: {
    backgroundColor: "#EF4444", // Kırmızı
  },
  infoContainer: {
    backgroundColor: "#3B82F6", // Mavi
  },
  warningContainer: {
    backgroundColor: "#F59E0B", // Turuncu
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
});
