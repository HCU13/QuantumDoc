import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import React from "react";
import { View, Text } from "react-native";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: "#22c55e", 
        backgroundColor: "#eafbe7",
        height: 50,
        borderRadius: 12,
        marginHorizontal: 16,
      }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
      text1Style={{ 
        fontSize: 13, 
        fontWeight: "600", 
        color: "#166534",
        marginBottom: 2,
      }}
      text2Style={{ 
        fontSize: 11, 
        color: "#166534",
        lineHeight: 14,
      }}
      text1NumberOfLines={1}
      text2NumberOfLines={1}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: "#ef4444", 
        backgroundColor: "#fee2e2",
        height: 50,
        borderRadius: 12,
        marginHorizontal: 16,
      }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
      text1Style={{ 
        fontSize: 13, 
        fontWeight: "600", 
        color: "#991b1b",
        marginBottom: 2,
      }}
      text2Style={{ 
        fontSize: 11, 
        color: "#991b1b",
        lineHeight: 14,
      }}
      text1NumberOfLines={1}
      text2NumberOfLines={1}
    />
  ),
  warning: ({ text1, text2, ...rest }) => (
    <View
      style={{
        borderLeftWidth: 4,
        borderLeftColor: "#facc15",
        backgroundColor: "#fef9c3",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginTop: 10,
        height: 50,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
      {...rest}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#854d0e", marginBottom: 2 }} numberOfLines={1}>{text1}</Text>
      {text2 ? <Text style={{ fontSize: 11, color: "#854d0e", lineHeight: 14 }} numberOfLines={1}>{text2}</Text> : null}
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