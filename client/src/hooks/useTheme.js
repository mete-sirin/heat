import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("Attemp to use ThemeContext outside of the context range!");
  }

  return context;
}

export default useTheme;
