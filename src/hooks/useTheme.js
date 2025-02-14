import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, setTheme } from "../store/theme/themeSlice";
import { lightTheme } from "../config/theme";

export const useTheme = () => {
  const dispatch = useDispatch();
  const themeState = useSelector((state) => state.theme);

  // Provide a fallback if themeState is undefined
  const theme = themeState?.current || lightTheme;
  const isDark = themeState?.isDark || false;

  const switchTheme = () => {
    dispatch(toggleTheme());
  };

  const changeTheme = (mode) => {
    dispatch(setTheme(mode));
  };

  return {
    theme: {
      ...theme,
      isDark,
    },
    switchTheme,
    changeTheme,
  };
};
