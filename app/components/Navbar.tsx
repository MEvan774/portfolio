"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/UseTheme";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const { t, i18n } = useTranslation("global");
  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#1C2594] to-[#5BCAF3] p-4 shadow-md">
      <div className="flex items-center justify-between px-8">

        <div className="text-lg font-bold text-white">
          <Link href="/">Milan Breuren</Link>
        </div>

        <div className="flex items-center gap-6 text-white">
          <button onClick={() => handleChangeLanguage(i18n.language === "en" ? "nl" : "en")} className="text-xl font-bold hover:opacity-80">{t("navbar.language")}</button>

          <button
            onClick={toggle}
            className="rounded-full p-2 hover:bg-white/20 transition"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

      </div>
    </nav>
  );
}
