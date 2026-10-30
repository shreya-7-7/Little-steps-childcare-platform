import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { light, dark } from "../components/data/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  const value = useMemo(
    () => ({
      dark: isDark,
      colors: isDark ? dark : light,
      toggle,
    }),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
