"use client";

import lang, { Language, isValidLanguageKey, languageKeys } from "@/lib/i18n";
import { createStore } from "zustand";

export type SystemStatusLevel = "down" | "degraded" | "maintenance" | "operational";

export type SystemStatus = {
  id?: string;
  level: SystemStatusLevel;
  title?: string | null;
  message?: string | null;
  details?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  link?: string | null;
};

type CoreStoreState = {
  lang: Language;
  isSidebarHiddenOnMobile: boolean;
  isSidebarCollapsed: boolean;
  isBackendAlive: boolean | null;
  systemStatus: SystemStatus | null;
  systemStatuses: SystemStatus[];
  openAccordions: Record<string, boolean>;
};

type CoreStoreActions = {
  setSidebarHiddenOnMobile: (state: boolean) => void;
  setSidebarCollapsed: (state: boolean) => void;
  setLang: (nextLang: languageKeys) => void;
  hydrateLang: () => void;
  setBackendAlive: (alive: boolean | null) => void;
  setSystemStatus: (status: SystemStatus | null) => void;
  setSystemStatuses: (statuses: SystemStatus[]) => void;
  setAccordionOpen: (key: string, isOpen: boolean) => void;
  hydrateSidebar: () => void;
};

type CoreStore = CoreStoreState & CoreStoreActions;

const STORAGE_KEY = "alertbox-org-webapp-lang";

export const coreStore = createStore<CoreStore>()((set) => ({
  lang: lang("en-US"),
  isSidebarHiddenOnMobile: false,
  isSidebarCollapsed: false,
  isBackendAlive: null,
  systemStatus: null,
  systemStatuses: [],
  openAccordions: {
    alertbox: true,
    settings: true,
  },
  setSidebarHiddenOnMobile: (b) => {
    set({ isSidebarHiddenOnMobile: b });
  },
  setSidebarCollapsed: (b) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("alertbox-sidebar-collapsed", b ? "true" : "false");
    }
    set({ isSidebarCollapsed: b });
  },
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
  setBackendAlive: (alive) => {
    set({ isBackendAlive: alive });
  },
  setSystemStatus: (status) => {
    set({ systemStatus: status, systemStatuses: status ? [status] : [] });
  },
  setSystemStatuses: (statuses) => {
    set({ systemStatuses: statuses, systemStatus: statuses[0] || null });
  },
  setAccordionOpen: (key, isOpen) => {
    set((state) => {
      if (state.openAccordions[key] === isOpen) return state;
      const nextOpenAccordions = { ...state.openAccordions, [key]: isOpen };
      if (typeof window !== "undefined") {
        localStorage.setItem("alertbox-sidebar-open-accordions", JSON.stringify(nextOpenAccordions));
      }
      return { openAccordions: nextOpenAccordions };
    });
  },
  hydrateSidebar: () => {
    if (typeof window === "undefined") return;

    const collapsedStored = localStorage.getItem("alertbox-sidebar-collapsed");
    const openAccordionsStored = localStorage.getItem("alertbox-sidebar-open-accordions");

    const updates: Partial<CoreStoreState> = {};
    if (collapsedStored !== null) {
      updates.isSidebarCollapsed = collapsedStored === "true";
    }
    if (openAccordionsStored !== null) {
      try {
        updates.openAccordions = JSON.parse(openAccordionsStored);
      } catch (e) {
        console.error(e);
      }
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
}));
