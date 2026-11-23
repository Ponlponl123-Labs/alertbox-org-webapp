"use client";

import { createStore } from "zustand";
import { getApiUrl } from "@/lib/api";
import {
  VIOLATION_CACHE_TTL_MS,
  SAMPLE_VIOLATIONS_BY_SCOPE,
  isSampleViolationsEnabled,
} from "@/consts/violation";
import type { ViolationResponse, ViolationScope } from "@/types";

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

interface CacheEntry {
  data: ViolationResponse;
  fetchedAt: number;
}

export interface ViolationStoreState {
  cache: Record<string, CacheEntry>;
  fetchScope: (
    key: string,
    path: string,
    authFetch: AuthFetch,
    force?: boolean,
  ) => Promise<ViolationResponse | null>;
  fetchUserViolations: (authFetch: AuthFetch, force?: boolean) => Promise<ViolationResponse | null>;
  fetchOrgViolations: (
    orgId: string,
    authFetch: AuthFetch,
    force?: boolean,
  ) => Promise<ViolationResponse | null>;
  fetchStreamerViolations: (
    orgId: string,
    streamerId: string,
    authFetch: AuthFetch,
    force?: boolean,
  ) => Promise<ViolationResponse | null>;
  clear: () => void;
}

const inFlight = new Map<string, Promise<ViolationResponse | null>>();

function resolveScopeFromKey(key: string): ViolationScope {
  if (key.startsWith("streamer:")) return "streamer";
  if (key.startsWith("org:")) return "org";
  return "user";
}

export const violationStore = createStore<ViolationStoreState>()((set, get) => ({
  cache: {},

  fetchScope: async (key, path, authFetch, force = false) => {
    if (isSampleViolationsEnabled()) {
      const data = SAMPLE_VIOLATIONS_BY_SCOPE[resolveScopeFromKey(key)];
      set((state) => ({
        cache: {
          ...state.cache,
          [key]: { data, fetchedAt: Date.now() },
        },
      }));
      return data;
    }

    const existing = get().cache[key];
    if (!force && existing && Date.now() - existing.fetchedAt < VIOLATION_CACHE_TTL_MS) {
      return existing.data;
    }

    const pending = inFlight.get(key);
    if (pending) return pending;

    const req = (async () => {
      try {
        const res = await authFetch(getApiUrl(path));
        if (!res.ok) return null;
        const data = (await res.json()) as ViolationResponse;
        if (!data || !Array.isArray(data.violate)) return null;
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: { data, fetchedAt: Date.now() },
          },
        }));
        return data;
      } catch {
        return null;
      } finally {
        inFlight.delete(key);
      }
    })();

    inFlight.set(key, req);
    return req;
  },

  fetchUserViolations: (authFetch, force) =>
    get().fetchScope("user", "/api/v1/me/violations", authFetch, force),

  fetchOrgViolations: (orgId, authFetch, force) =>
    get().fetchScope(`org:${orgId}`, `/api/v1/org/${orgId}/violations`, authFetch, force),

  fetchStreamerViolations: (orgId, streamerId, authFetch, force) =>
    get().fetchScope(
      `streamer:${orgId}:${streamerId}`,
      `/api/v1/org/${orgId}/streamers/${streamerId}/violations`,
      authFetch,
      force,
    ),

  clear: () => {
    inFlight.clear();
    set({ cache: {} });
  },
}));
