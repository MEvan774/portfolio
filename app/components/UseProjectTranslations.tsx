"use client";

import { useLanguage } from "../hooks/UseLanguage";

type ProjectSection = {
  title: string;
  body: string;
};

export function UseProjectTranslations() {
  const { t } = useLanguage();

  const getSection = (key: "technologies" | "codeSnippet"): ProjectSection => {
    return t(`projectPage.${key}`, {
      returnObjects: true,
    }) as ProjectSection;
  };

  return {
    getSection,
  };
}
