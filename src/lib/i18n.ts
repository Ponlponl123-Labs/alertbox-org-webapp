import thTH from "@/data/langs/th.json";
import enUS from "@/data/langs/en.json";

export type languageKeys = "th-TH" | "en-US";

const validKeys: languageKeys[] = ["th-TH", "en-US"];

export const isValidLanguageKey = (key: string): key is languageKeys => {
  return validKeys.includes(key as languageKeys);
};

export interface Language {
  key: languageKeys;
  label: string;
  country: string;
  flag: string;
  data: typeof enUS;
}

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
