import { createContext, useContext, useEffect, useState } from "react";

// 1. Define your available color themes here
type ThemeMode = "dark" | "light" | "system";
export type ThemeColor =
  | "amethyst haze"
  | "cosmic night"
  | "midnight bloom"
  | "pastel dreams"
  | "violet bloom"
  | "quantum rose"
  | "flutter shy"
  | "claude"
  | "t3 chat";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultColor?: ThemeColor;
  storageKeyMode?: string;
  storageKeyColor?: string;
};

type ThemeProviderState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
};

const initialState: ThemeProviderState = {
  mode: "system",
  setMode: () => null,
  color: "amethyst haze",
  setColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "system",
  defaultColor = "amethyst haze",
  storageKeyMode = "vite-ui-theme-mode",
  storageKeyColor = "vite-ui-theme-color",
  ...props
}) => {
  // State for Light/Dark Mode
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem(storageKeyMode) as ThemeMode) || defaultMode,
  );

  // State for Color Theme
  const [color, setColor] = useState<ThemeColor>(
    () => (localStorage.getItem(storageKeyColor) as ThemeColor) || defaultColor,
  );

  // Effect 1: Handle Light/Dark Class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(mode);
  }, [mode]);

  // Effect 2: Handle Data-Theme Attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", color);
  }, [color]);

  const value = {
    mode,
    setMode: (mode: ThemeMode) => {
      localStorage.setItem(storageKeyMode, mode);
      setMode(mode);
    },
    color,
    setColor: (color: ThemeColor) => {
      localStorage.setItem(storageKeyColor, color);
      setColor(color);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
