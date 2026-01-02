"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type ThemeContextType = {
  isDark: boolean;
  toggle: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // DO NOT read window/localStorage here so server and initial client render match
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // On mount, read persisted value or system preference and update state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) {
        setIsDark(stored === "dark");
      } else {
        const prefersDark =
          window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
        setIsDark(prefersDark);
      }
    } catch (e) {
      // ignore and keep default
    } finally {
      setMounted(true);
    }
  }, []);

  // Apply/remove html.dark and persist after state changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((v) => !v), []);
  
  return (
    <ThemeContext.Provider value={{ isDark, toggle, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}