import global_en from "@/app/translations/en/global.json";
import global_nl from "@/app/translations/nl/global.json";
import { cookies } from "next/headers";

const translations = {
  en: global_en,
  nl: global_nl,
};

export async function getServerTranslations() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value as "en" | "nl") || "en";
  
  return {
    t: (key: string) => {
      const keys = key.split(".");
      let value: any = translations[lang];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    },
    lang,
  };
}