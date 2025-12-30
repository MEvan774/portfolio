"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/UseTheme";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#1C2594] to-[#5BCAF3] dark:from-gray-900 dark:to-gray-800 p-4 shadow-md">
      <div className="flex items-center justify-between px-8">

        {/* Left: Name / Logo */}
        <div className="text-lg font-bold text-white">
          <Link href="/">Milan Breuren</Link>
        </div>

        {/* Right: Language + Dark Mode */}
        <div className="flex items-center gap-6 text-white">

          <button className="text-xl font-bold hover:opacity-80">
            ENG
          </button>

          {/* Dark mode toggle */}
          <button
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="rounded-full p-2 hover:bg-white/20 transition"
          >
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>

        </div>
      </div>
    </nav>
  );
}
