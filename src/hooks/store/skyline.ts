"use client";

import { createStore } from "zustand";
import { useStore } from "zustand";
import type { ContributionDay } from "@/components/ui/contribution-skyline";

export type CachedActivityEntry = {
  days: ContributionDay[];
  timestamp: number;
};

export type SkylineStoreState = {
  view: "2d" | "3d";
  activityCache: Record<string, CachedActivityEntry>;
};

export type SkylineStoreActions = {
  setView: (view: "2d" | "3d") => void;
  setCachedActivity: (orgId: string, days: ContributionDay[]) => void;
};

export type SkylineStore = SkylineStoreState & SkylineStoreActions;

const STORAGE_KEY = "alertbox:skyline_view_mode";

export const skylineStore = createStore<SkylineStore>()((set) => ({
  view:
    typeof window !== "undefined" &&
    (localStorage.getItem(STORAGE_KEY) === "2d" || localStorage.getItem(STORAGE_KEY) === "3d")
      ? (localStorage.getItem(STORAGE_KEY) as "2d" | "3d")
      : "3d",
  activityCache: {},

  setView: (view) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, view);
      } catch {
        // ignore
      }
    }
    set({ view });
  },

  setCachedActivity: (orgId, days) => {
    set((state) => ({
      activityCache: {
        ...state.activityCache,
        [orgId]: {
          days,
          timestamp: Date.now(),
        },
      },
    }));
  },
}));

export function useSkylineStore<T>(selector: (state: SkylineStore) => T): T {
  return useStore(skylineStore, selector);
}
