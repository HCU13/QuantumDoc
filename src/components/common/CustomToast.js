import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import React from "react";
import { View, Text } from "react-native";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#22c55e", backgroundColor: "#eafbe7" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: "bold", color: "#166534" }}
      text2Style={{ fontSize: 14, color: "#166534" }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#ef4444", backgroundColor: "#fee2e2" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: "bold", color: "#991b1b" }}
      text2Style={{ fontSize: 14, color: "#991b1b" }}
    />
  ),
  warning: ({ text1, text2, ...rest }) => (
    <View
      style={{
        borderLeftWidth: 6,
        borderLeftColor: "#facc15",
        backgroundColor: "#fef9c3",
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
      {...rest}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#854d0e" }}>{text1}</Text>
      {text2 ? <Text style={{ fontSize: 14, color: "#854d0e" }}>{text2}</Text> : null}
    </View>
  ),
};

export const showToast = ({ type = "success", title = "", message = "" }) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

export const ToastContainer = () => <Toast config={toastConfig} />;

export default ToastContainer; 