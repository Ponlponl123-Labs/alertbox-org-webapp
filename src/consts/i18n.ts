import thTH from "@/data/langs/th.json";
import enUS from "@/data/langs/en.json";
import type { Language, LanguageKey } from "@/types/i18n.types";

export const VALID_LANGUAGE_KEYS: LanguageKey[] = ["th-TH", "en-US"];

export const LANG_MAP: Record<LanguageKey, typeof enUS> = {
  "th-TH": thTH,
  "en-US": enUS,
};

export const LANGS: Language[] = [
  {
    key: "th-TH",
    label: "ไทย",
    country: "th",
    flag: "🇹🇭",
    data: thTH,
  },
  {
    key: "en-US",
    label: "English",
    country: "us",
    flag: "🇺🇸",
    data: enUS,
  },
];
