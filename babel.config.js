module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module-resolver", {
        root: ["./src"],
        extensions: [
          ".ios.ts",
          ".android.ts",
          ".ts",
          ".ios.tsx",
          ".android.tsx",
          ".tsx",
          ".jsx",
          ".js",
          ".json",
        ],
        alias: {
          "@": "./src",
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@navigation": "./src/navigation",
          "@hooks": "./src/hooks",
          "@utils": "./src/utils",
          "@constants": "./src/constants",
          "@assets": "./assets",
        },
      }],
      "react-native-reanimated/plugin",
    ],
  };
};