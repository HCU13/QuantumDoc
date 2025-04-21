import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

// Tema kullanımı için özel hook
const useTheme = () => {
  const themeContext = useContext(ThemeContext);

  if (themeContext === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return themeContext;
};

export default useTheme;
