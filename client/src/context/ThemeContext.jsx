import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  /* index.css keys dark mode off a `dark` class on <html>. */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  }

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}

export { ThemeProvider, ThemeContext };
