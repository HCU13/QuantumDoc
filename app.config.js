export default {
  expo: {
    name: "DocAI",
    slug: "doc-ai",
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
      bundleIdentifier: "com.yourdomain.docai",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      newArchEnabled: true,
      package: "com.yourdomain.docai",
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      eas: {
        projectId: "your-project-id",
      },
    },
    plugins: [
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production",
        },
      ],
    ],
  },
};
