import thTH from "@/data/langs/th.json";
import enUS from "@/data/langs/en.json";
import type { Language, LanguageKey } from "@/types/i18n.types";

export type languageKeys = LanguageKey;
export type { Language };

const validKeys: LanguageKey[] = ["th-TH", "en-US"];

export const isValidLanguageKey = (key: string): key is LanguageKey => {
  return validKeys.includes(key as LanguageKey);
};

const langMap: Record<languageKeys, typeof enUS> = {
  "th-TH": thTH,
  "en-US": enUS,
};

export const langs: Language[] = [
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

export default function lang(languageKey: languageKeys): Language {
  const selected = langMap[languageKey] || enUS;

  return {
    key: (selected.key || languageKey) as languageKeys,
    label: selected.label,
    country: selected.country,
    flag: selected.flag,
    data: selected,
  };
}
