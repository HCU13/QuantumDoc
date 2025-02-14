// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./theme/themeSlice";
import languageReducer from "./language/languageSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    language: languageReducer,
  },
});
