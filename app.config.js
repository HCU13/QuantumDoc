export default {
  expo: {
    name: "QuantumDoc",
    slug: "quantumdoc",
    owner: "trooper13",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      newArchEnabled: true,
      supportsTablet: true,
      bundleIdentifier: "com.firebase.quantumdoc",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      newArchEnabled: true,
      package: "com.firebase.quantumdoc",
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production",
        },
      ],
    ],
  },
};
