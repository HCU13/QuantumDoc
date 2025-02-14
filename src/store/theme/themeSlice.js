// store/theme/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { lightTheme, darkTheme } from "../../config/theme";

const initialState = {
  isDark: false,
  current: lightTheme,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      state.current = state.isDark ? darkTheme : lightTheme;
    },
    setTheme: (state, action) => {
      state.isDark = action.payload === 'dark';
      state.current = state.isDark ? darkTheme : lightTheme;
    }
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;