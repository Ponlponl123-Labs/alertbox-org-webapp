"use client";

import lang, { Language, languageKeys } from "@/lib/i18n";
import { createStore } from "zustand";

type CoreStoreState = { lang: Language };

type CoreStoreActions = {
  setLang: (nextLang: languageKeys) => void;
};

type CoreStore = CoreStoreState & CoreStoreActions;

export const coreStore = createStore<CoreStore>()((set) => ({
  lang: lang("en-US"),
  setLang: (nextLang: languageKeys) => set({ lang: lang(nextLang) }),
}));
