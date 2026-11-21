"use client";
import { User, Organization, Streamer, OrganizationMember } from "@/types/user.types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { getApiOrigin, getApiUrl, getDiscordRedirectUri } from "@/lib/api";
import { checkIsAlertboxProduction, isSelfHosted } from "@/lib/instance";
import { clearAllClientCaches } from "@/lib/lru-cache";
import { isHttpsRuntime, isTrustedApiUrl, safeDecodeBase64 } from "@/lib/security";

import { useStore } from "zustand";
import { orgStore, selectActiveOrg, selectActiveStreamer } from "@/hooks/store/org";

const FETCH_CREDENTIALS: RequestCredentials | undefined =
  process.env.NEXT_PUBLIC_USE_COOKIE_AUTH === "true" ? "include" : undefined;

export interface UserContext {
  userInfo: User | null;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  patchUserInfo: (patch: Partial<User>) => void;
  patchStreamer: (streamerId: string, patch: Partial<Streamer>) => void;
  patchOrg: (patch: Partial<Organization>) => void;
  organizations: Organization[];
  activeOrg: Organization | null;
  activeStreamer: Streamer | null;
  isOrgMode: boolean;
  setOrgMode: (enabled: boolean) => void;
  setActiveOrgId: (id: string) => void;
  setActiveStreamerId: (id: string | null) => void;
  removeStreamer: (streamerId: string) => void;
  removeOrganization: (orgId: string) => void;
  addStreamer: (streamer: Streamer) => void;
  refreshUserInfo: () => Promise<void>;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  isSelfHosted: boolean;
}

const userContext = createContext<UserContext>({
  userInfo: null,
  login: async () => false,
  logout: () => {},
  patchUserInfo: () => {},
  patchStreamer: () => {},
  patchOrg: () => {},
  removeStreamer: () => {},
  removeOrganization: () => {},
  addStreamer: () => {},
  refreshUserInfo: async () => {},
  organizations: [],
  activeOrg: null,
  activeStreamer: null,
  isOrgMode: false,
  setOrgMode: () => {},
  setActiveOrgId: () => {},
  setActiveStreamerId: () => {},
  authFetch: async () => new Response(),
  isSelfHosted: true,
});

interface BufferedResponse {
  body: ArrayBuffer;
  status: number;
  statusText: string;
  headers: Array<[string, string]>;
}

interface DedupEntry {
  controller: AbortController;
  refCount: number;
  promise: Promise<BufferedResponse>;
}

function toResponse(buf: BufferedResponse): Response {
  const isNullBodyStatus =
    buf.status === 204 || buf.status === 205 || buf.status === 304;
  return new Response(isNullBodyStatus ? null : buf.body.slice(0), {
    status: buf.status,
    statusText: buf.statusText,
    headers: buf.headers,
  });
}

function getAuthHeaderFromCookie(rawCookie: unknown): string | null {
  if (!rawCookie) return null;
  const decoded = safeDecodeBase64(String(rawCookie));
  if (!decoded) {
    deleteCookie("USRSS", { path: "/" });
    return null;
  }
  return `Bearer ${decoded}`;
}

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserContext["userInfo"]>(null);
  const [selfHosted, setSelfHosted] = useState<boolean>(isSelfHosted());

  useEffect(() => {
    let active = true;
    void checkIsAlertboxProduction().then((isProd) => {
      if (active) setSelfHosted(!isProd);
    });
    return () => {
      active = false;
    };
  }, []);

  const organizations = useStore(orgStore, (s) => s.organizations);
  const activeOrg = useStore(orgStore, selectActiveOrg);
  const activeStreamer = useStore(orgStore, selectActiveStreamer);
  const isOrgMode = useStore(orgStore, (s) => s.isOrgMode);

  const setActiveOrgId = useCallback((id: string) => {
    orgStore.getState().setActiveOrgId(id);
  }, []);

  const setActiveStreamerId = useCallback((id: string | null) => {
    orgStore.getState().setActiveStreamerId(id);
  }, []);

  const setOrgMode = useCallback((enabled: boolean) => {
    orgStore.getState().setOrgMode(enabled);
  }, []);

  const patchStreamer = useCallback((streamerId: string, patch: Partial<Streamer>) => {
    orgStore.getState().updateStreamer(streamerId, patch);
  }, []);

  const patchUserInfo = useCallback(
    (patch: Partial<User> | Record<string, unknown>) => {
      const p = patch as Record<string, unknown>;

      if (Array.isArray(p.memberships)) {
        queueMicrotask(() => {
          orgStore.getState().syncFromMemberships(p.memberships as OrganizationMember[]);
        });
      }

      setUserInfo((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...(typeof p.name === "string" ? { name: p.name } : {}),
          ...(typeof p.displayName === "string" ? { displayName: p.displayName } : {}),
          ...(typeof p.avatar === "string" ? { avatar: p.avatar } : {}),
          ...(typeof p.email === "string" ? { email: p.email } : {}),
          ...(Array.isArray(p.memberships)
            ? { memberships: p.memberships as OrganizationMember[] }
            : {}),
        };
      });
    },
    [],
  );

  const inFlightGetRequests = useRef(new Map<string, DedupEntry>());
  const orgAbortControllerRef = useRef(new AbortController());
  const activeOrgIdRef = useRef<string | null>(orgStore.getState().activeOrgId);

  useEffect(() => {
    const unsub = orgStore.subscribe((state) => {
      if (state.activeOrgId !== activeOrgIdRef.current) {
        activeOrgIdRef.current = state.activeOrgId;
        orgAbortControllerRef.current.abort();
        orgAbortControllerRef.current = new AbortController();
        for (const entry of inFlightGetRequests.current.values()) {
          entry.controller.abort();
        }
        inFlightGetRequests.current.clear();
      }
    });
    return unsub;
  }, []);

  const fetchMe = useCallback(
    async (authHeader: string, signal?: AbortSignal): Promise<boolean> => {
      try {
        const r = await fetch(getApiUrl("/api/v1/me"), {
          method: "GET",
          headers: { authorization: authHeader },
          ...(FETCH_CREDENTIALS ? { credentials: FETCH_CREDENTIALS } : {}),
          ...(signal ? { signal } : {}),
        });
        if (r.status === 401) {
          deleteCookie("USRSS", { path: "/" });
          return false;
        }
        if (r.ok) {
          const d = (await r.json()) as User;
          if (!signal?.aborted) {
            setUserInfo(d);
            orgStore.getState().syncFromMemberships(d.memberships);
          }
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  const authFetch = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const trustedOrigin = getApiOrigin();
      if (!isTrustedApiUrl(url, trustedOrigin)) {
        throw new Error("Refused credentialed request to untrusted origin");
      }

      const method = (init?.method || "GET").toUpperCase();
      const authCookie = await getCookie("USRSS");
      const headers = new Headers(init?.headers);
      const authHeader = getAuthHeaderFromCookie(authCookie);
      if (authHeader) {
        headers.set("authorization", authHeader);
      }

      const storeState = orgStore.getState();
      const activeOrgNow = selectActiveOrg(storeState);
      const activeStreamerNow = selectActiveStreamer(storeState);
      if (activeOrgNow) {
        headers.set("x-org-id", activeOrgNow.id);
      }
      if (activeStreamerNow) {
        headers.set("x-streamer-id", activeStreamerNow.id);
      }

      if (method === "GET") {
        const callerSignal = init?.signal;
        if (callerSignal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        const key = `${url}::${activeOrgNow?.id || ""}::${activeStreamerNow?.id || ""}`;
        let entry = inFlightGetRequests.current.get(key);
        if (entry?.controller.signal.aborted) {
          entry = undefined;
        }

        if (!entry) {
          const controller = new AbortController();
          const fetchPromise = fetch(url, {
            ...init,
            headers,
            ...(FETCH_CREDENTIALS ? { credentials: FETCH_CREDENTIALS } : {}),
            signal: controller.signal,
          })
            .then(async (res): Promise<BufferedResponse> => {
              const body = await res.arrayBuffer();
              return {
                body,
                status: res.status,
                statusText: res.statusText,
                headers: Array.from(res.headers.entries()),
              };
            })
            .finally(() => {
              if (inFlightGetRequests.current.get(key)?.controller === controller) {
                inFlightGetRequests.current.delete(key);
              }
            });

          entry = { controller, refCount: 0, promise: fetchPromise };
          inFlightGetRequests.current.set(key, entry);
        }

        entry.refCount += 1;
        const activeEntry = entry;

        return await new Promise<Response>((resolve, reject) => {
          let settled = false;

          const cleanup = () => {
            callerSignal?.removeEventListener("abort", onCallerAbort);
          };

          const onCallerAbort = () => {
            if (settled) return;
            settled = true;
            cleanup();
            activeEntry.refCount -= 1;
            if (activeEntry.refCount <= 0) {
              if (inFlightGetRequests.current.get(key) === activeEntry) {
                inFlightGetRequests.current.delete(key);
              }
              activeEntry.controller.abort();
            }
            reject(new DOMException("Aborted", "AbortError"));
          };

          if (callerSignal) {
            callerSignal.addEventListener("abort", onCallerAbort, { once: true });
          }

          activeEntry.promise.then(
            (buffered) => {
              if (settled) return;
              settled = true;
              cleanup();
              resolve(toResponse(buffered));
            },
            (err) => {
              if (settled) return;
              settled = true;
              cleanup();
              reject(err);
            },
          );
        });
      }

      return fetch(url, {
        ...init,
        headers,
        ...(FETCH_CREDENTIALS ? { credentials: FETCH_CREDENTIALS } : {}),
      });
    },
    [],
  );

  const login = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        const params = new URLSearchParams({
          code,
          redirect_uri: getDiscordRedirectUri(),
        });

        const r = await fetch(getApiUrl("/api/v1/auth/discord"), {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
          ...(FETCH_CREDENTIALS ? { credentials: FETCH_CREDENTIALS } : {}),
        });

        if (r.ok) {
          const token = (await r.text()).trim();
          if (token) {
            await setCookie("USRSS", btoa(token), {
              maxAge: 2 * 60 * 60 * 24,
              path: "/",
              sameSite: "lax",
              secure: isHttpsRuntime(),
            });
            await fetchMe(`Bearer ${token}`);
          }
        }

        return r.ok;
      } catch {
        return false;
      }
    },
    [fetchMe],
  );

  const logout = useCallback(async () => {
    let ok = false;
    try {
      const authCookie = await getCookie("USRSS");
      const authHeader = getAuthHeaderFromCookie(authCookie);
      if (authHeader) {
        const r = await fetch(getApiUrl("/api/v1/auth"), {
          method: "DELETE",
          headers: { authorization: authHeader },
          ...(FETCH_CREDENTIALS ? { credentials: FETCH_CREDENTIALS } : {}),
          signal: AbortSignal.timeout(5000),
        });
        ok = r.ok;
      }
    } catch {
      ok = false;
    } finally {
      deleteCookie("USRSS", { path: "/" });
      deleteCookie("ab_org_id", { path: "/" });
      deleteCookie("ab_streamer_id", { path: "/" });
      clearAllClientCaches();
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("ab_active_org_id");
          localStorage.removeItem("ab_active_streamer_id");
          localStorage.removeItem("ab_view_mode");
        } catch {}
        window.location.reload();
      }
    }
    return ok;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const authCookie = await getCookie("USRSS");
      const authHeader = getAuthHeaderFromCookie(authCookie);
      if (!authHeader) return;
      await fetchMe(authHeader, controller.signal);
    })();

    return () => controller.abort();
  }, [fetchMe]);

  const patchOrg = useCallback((patch: Partial<Organization>) => {
    const active = selectActiveOrg(orgStore.getState());
    if (active) {
      orgStore.getState().updateOrganization(active.id, patch);
    }
  }, []);

  const refreshUserInfo = useCallback(async () => {
    const authCookie = await getCookie("USRSS");
    const authHeader = getAuthHeaderFromCookie(authCookie);
    if (!authHeader) return;
    await fetchMe(authHeader);
  }, [fetchMe]);

  const removeStreamer = useCallback((streamerId: string) => {
    orgStore.getState().removeStreamer(streamerId);
    setUserInfo((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        memberships: prev.memberships?.map((m) => ({
          ...m,
          organization: {
            ...m.organization,
            streamers: (m.organization.streamers || []).filter(
              (s: Streamer) => s.id !== streamerId && s.name !== streamerId,
            ),
          },
        })),
      };
    });
  }, []);

  const removeOrganization = useCallback((orgId: string) => {
    orgStore.getState().removeOrganization(orgId);
    setUserInfo((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        memberships: prev.memberships?.filter(
          (m) => m.organization.id !== orgId && m.organization.slug !== orgId,
        ),
      };
    });
  }, []);

  const addStreamer = useCallback((streamer: Streamer) => {
    const active = selectActiveOrg(orgStore.getState());
    if (active) {
      orgStore.getState().addStreamer(active.id, streamer);
      setUserInfo((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          memberships: prev.memberships?.map((m) => {
            if (m.organization.id !== active.id && m.organization.slug !== active.id) return m;
            const existing = m.organization.streamers || [];
            if (existing.some((s) => s.id === streamer.id || s.name === streamer.name)) return m;
            return {
              ...m,
              organization: {
                ...m.organization,
                streamers: [...existing, streamer],
              },
            };
          }),
        };
      });
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      userInfo,
      login,
      logout,
      patchUserInfo,
      patchStreamer,
      patchOrg,
      removeStreamer,
      removeOrganization,
      addStreamer,
      refreshUserInfo,
      organizations,
      activeOrg,
      activeStreamer,
      isOrgMode,
      setOrgMode,
      setActiveOrgId,
      setActiveStreamerId,
      authFetch,
      isSelfHosted: selfHosted,
    }),
    [
      userInfo,
      login,
      logout,
      patchUserInfo,
      patchStreamer,
      patchOrg,
      removeStreamer,
      removeOrganization,
      addStreamer,
      refreshUserInfo,
      organizations,
      activeOrg,
      activeStreamer,
      isOrgMode,
      setOrgMode,
      setActiveOrgId,
      setActiveStreamerId,
      authFetch,
      selfHosted,
    ],
  );

  return <userContext.Provider value={contextValue}>{children}</userContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(userContext);
  if (!context) throw new Error("userContext must be used within Provider");
  return context;
};
