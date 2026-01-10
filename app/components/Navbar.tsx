"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/UseTheme";
import { useLanguage } from "../hooks/UseLanguage";

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const { t, toggleLanguage } = useLanguage();

  return (
    <nav className="sticky top-5 z-50 bg-[#00AFC7] p-4 rounded-b-3xl border-4 border-black dark:border-[#00AFC7] sm:w-2/4 max-w-6xl sm:mx-auto mx-4 shadow-[6px_6px_0_0_#000] dark:shadow-[0px_0px_0_0_transparent]">
      <div className="flex items-center justify-between">
        <div className="font-black text-black text-2xl">
          <Link href="/">Milan Breuren</Link>
        </div>

        <div className="flex items-center gap-6 font-black text-black text-2xl">
          <button
            onClick={toggleLanguage}
            className="text-xl font-bold hover:opacity-80"
          >
            {t("navbar.language")}
          </button>

          <button
            onClick={toggle}
            className="rounded-full p-2 hover:bg-white/20 transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
