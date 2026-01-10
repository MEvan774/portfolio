"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation"; // Add this
import Cookies from "js-cookie";

export function useLanguage() {
  const { i18n, t } = useTranslation("global");
  const router = useRouter(); // Add this

  const language = i18n.language;

  const setLanguage = (lang: "en" | "nl") => {
    i18n.changeLanguage(lang);
    Cookies.set("language", lang, { expires: 365 });
    router.refresh(); // Force server component re-render
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "nl" : "en";
    i18n.changeLanguage(newLang);
    Cookies.set("language", newLang, { expires: 365 });
    router.refresh(); // Force server component re-render
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}