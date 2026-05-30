"use client";

import lang, { Language, isValidLanguageKey, languageKeys } from "@/lib/i18n";
import { createStore } from "zustand";

type CoreStoreState = { lang: Language };

type CoreStoreActions = {
  setLang: (nextLang: languageKeys) => void;
  hydrateLang: () => void;
};

type CoreStore = CoreStoreState & CoreStoreActions;

const STORAGE_KEY = "alertbox-org-webapp-lang";

export const coreStore = createStore<CoreStore>()((set) => ({
  lang: lang("en-US"),
  setLang: (nextLang: languageKeys) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextLang);
    }
    set({ lang: lang(nextLang) });
  },
  hydrateLang: () => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLanguageKey(stored)) {
      set({ lang: lang(stored) });
    }
  },
}));
