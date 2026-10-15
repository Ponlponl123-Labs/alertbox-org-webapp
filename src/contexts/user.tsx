"use client";
import { User, Organization, Streamer, Profile, OrganizationMember } from "@/types/user.types";
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
import { getApiUrl } from "@/lib/api";
import { allowedLocalhostWhen } from "@/consts/statement";

import { useStore } from "zustand";
import { orgStore, selectActiveOrg, selectActiveStreamer } from "@/hooks/store/org";

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
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserContext["userInfo"]>(null);
  const fetched = useRef(false);

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

        const updated: User = {
          ...prev,
          ...(typeof p.name === "string" ? { name: p.name } : {}),
          ...(typeof p.avatar === "string" ? { avatar: p.avatar } : {}),
          ...(typeof p.email === "string" ? { email: p.email } : {}),
          ...(Array.isArray(p.memberships) ? { memberships: p.memberships as OrganizationMember[] } : {}),
          profile: prev.profile ? { ...prev.profile } : null,
        };

        if (p.profile && typeof p.profile === "object") {
          updated.profile = { ...(prev.profile || {}), ...p.profile } as Profile;
        }

        return updated;
      });
    },
    [],
  );

  const authFetch = useCallback(
    async (url: string, init?: RequestInit) => {
      const authCookie = await getCookie("USRSS");
      const headers = new Headers(init?.headers);
      if (authCookie) {
        headers.set("authorization", "Bearer " + atob(authCookie));
      }
      const activeOrgNow = selectActiveOrg(orgStore.getState());
      const activeStreamerNow = selectActiveStreamer(orgStore.getState());
      if (activeOrgNow) {
        headers.set("x-org-id", activeOrgNow.id);
      }
      if (activeStreamerNow) {
        headers.set("x-streamer-id", activeStreamerNow.id);
      }
      return fetch(url, { ...init, headers });
    },
    [],
  );

  const login = useCallback(async (code: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({
        code,
        redirect_uri: allowedLocalhostWhen.includes(process.env.NODE_ENV || "")
          ? "http://localhost:3000/app/login/discord"
          : "https://alertbox.org/app/login/discord",
      });

      const r = await fetch(getApiUrl("/api/v1/auth/discord"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (r.ok) {
        const token = await r.text();
        const encodedToken = btoa(token);
        setCookie("USRSS", encodedToken, {
          maxAge: 2 * 60 * 60 * 24,
          path: "/",
        });
      }

      return r.ok;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const authCookie = await getCookie("USRSS");
      if (!authCookie) return false;
      const r = await fetch(getApiUrl("/api/v1/auth"), {
        method: "DELETE",
        headers: {
          authorization: "Bearer " + atob(authCookie),
        },
      });

      deleteCookie("USRSS");
      deleteCookie("ab_org_id");
      deleteCookie("ab_streamer_id");
      if (typeof window !== "undefined") {
        localStorage.removeItem("ab_active_org_id");
        localStorage.removeItem("ab_active_streamer_id");
      }
      window.location.reload();

      return r.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    (async () => {
      const authCookie = await getCookie("USRSS");
      if (!authCookie) return;

      try {
        const r = await fetch(getApiUrl("/api/v1/me"), {
          method: "GET",
          headers: {
            authorization: "Bearer " + atob(authCookie),
          },
        });

        if (r.ok) {
          const d = (await r.json()) as User;
          setUserInfo(d);
          orgStore.getState().syncFromMemberships(d.memberships);
        }
      } catch {
        // Silently catch network errors during initial load
      }
    })();
  }, []);

  const effectiveUserInfo = useMemo(() => {
    if (!userInfo) return null;
    return {
      ...userInfo,
      profile: userInfo.profile,
    };
  }, [userInfo]);

  const patchOrg = useCallback((patch: Partial<Organization>) => {
    const active = selectActiveOrg(orgStore.getState());
    if (active) {
      orgStore.getState().updateOrganization(active.id, patch);
    }
  }, []);

  const refreshUserInfo = useCallback(async () => {
    const authCookie = await getCookie("USRSS");
    if (!authCookie) return;
    try {
      const r = await fetch(getApiUrl("/api/v1/me"), {
        method: "GET",
        headers: {
          authorization: "Bearer " + atob(authCookie),
        },
      });
      if (r.ok) {
        const d = (await r.json()) as User;
        setUserInfo(d);
        orgStore.getState().syncFromMemberships(d.memberships);
      }
    } catch {}
  }, []);

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

  return (
    <userContext.Provider
      value={{
        userInfo: effectiveUserInfo,
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
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(userContext);
  if (!context) throw new Error("userContext must be used within Provider");
  return context;
};
