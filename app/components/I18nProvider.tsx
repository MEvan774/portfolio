"use client";

import React from "react";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import global_en from "../translations/en/global.json";
import global_nl from "../translations/nl/global.json";

i18next.init({
  interpolation: { escapeValue: true },
  lng: "en",
  defaultNS: "global",
  resources: {
    en: { global: global_en },
    nl: { global: global_nl },
  },
});

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}