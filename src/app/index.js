import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { AppNavigator } from "../navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { toastConfig } from "../utils/toast";
import ErrorBoundary from "../components/ErrorBoundary";
import "../i18n";
import { LoadingProvider } from "../context/LoadingContext";
import { setupFirebase } from "../../FirebaseConfig"; // Firebase'i başlatmaya gerek yok, FirebaseConfig'i direkt kullanacağız
import NetInfo from "@react-native-community/netinfo";
import { View, Text } from "react-native";

export default function App() {
  useEffect(() => {
    // Ağ durumunu izle
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        console.log("Network is disconnected");
      } else if (state.isConnected) {
        console.log("Network is connected");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <LoadingProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <Toast config={toastConfig} />
        </LoadingProvider>
      </Provider>
    </ErrorBoundary>
  );
}
