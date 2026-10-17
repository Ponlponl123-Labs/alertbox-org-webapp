import type { Language, LanguageKey } from "@/types/i18n.types";
import { VALID_LANGUAGE_KEYS, LANG_MAP, LANGS } from "@/consts/i18n";
import enUS from "@/data/langs/en.json";

export type languageKeys = LanguageKey;
export type { Language };

export const isValidLanguageKey = (key: string): key is LanguageKey => {
  return VALID_LANGUAGE_KEYS.includes(key as LanguageKey);
};

export const langs: Language[] = LANGS;

export default function lang(languageKey: languageKeys): Language {
  const selected = LANG_MAP[languageKey] || enUS;

  return {
    key: (selected.key || languageKey) as languageKeys,
    label: selected.label,
    country: selected.country,
    flag: selected.flag,
    data: selected,
  };
}
