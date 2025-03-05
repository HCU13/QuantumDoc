import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { AppNavigator } from "../navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { toastConfig } from "../utils/toast";
import ErrorBoundary from "../components/ErrorBoundary";
import "../i18n";
import { LoadingProvider } from "../context/LoadingContext";
export default function App() {
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
