import type { Language, LanguageKey } from "@/types/i18n.types";
import { VALID_LANGUAGE_KEYS, LANG_MAP, LANGS } from "@/consts/i18n";
import enUS from "@/data/langs/en.json";

export type languageKeys = LanguageKey;
export type { Language };

export const isValidLanguageKey = (key: string): key is LanguageKey => {
  return VALID_LANGUAGE_KEYS.includes(key as LanguageKey);
};

export const langs: Language[] = LANGS;

export function formatI18n(
  template: string,
  vars?: Record<string, string | number | null | undefined>,
): string {
  if (!vars) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    const val = vars[key];
    return val === undefined || val === null ? match : String(val);
  });
}

export function formatCount(one: string, other: string, count: number): string {
  return count === 1 ? one : other;
}

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
