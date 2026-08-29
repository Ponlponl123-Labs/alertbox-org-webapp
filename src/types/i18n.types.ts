import type enUS from "@/data/langs/en.json";

export type LanguageKey = "th-TH" | "en-US";
export type LanguageData = typeof enUS;

export interface Language {
  key: LanguageKey;
  label: string;
  country: string;
  flag: string;
  data: LanguageData;
}
