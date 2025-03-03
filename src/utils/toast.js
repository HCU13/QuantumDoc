import Toast from "react-native-toast-message";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const showToast = {
  success: (title, message) => {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "bottom",
      visibilityTime: 3000,
    });
  },
  error: (title, message) => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "bottom",
      visibilityTime: 4000,
    });
  },
  info: (title, message) => {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position: "bottom",
      visibilityTime: 3000,
    });
  },
};

// App.js'e eklenecek config
export const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, { backgroundColor: "#10B981" }]}>
      <Ionicons name="checkmark-circle" size={24} color="white" />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, { backgroundColor: "#EF4444" }]}>
      <Ionicons name="alert-circle" size={24} color="white" />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, { backgroundColor: "#3B82F6" }]}>
      <Ionicons name="information-circle" size={24} color="white" />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    marginLeft: 12,
    flex: 1,
  },
  toastTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  toastMessage: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
});
