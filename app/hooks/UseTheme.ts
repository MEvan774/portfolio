"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;

    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemTheme: Theme = prefersDark ? "dark" : "light";

    setTheme(systemTheme);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    if (!theme) return;

    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, toggleTheme };
}
