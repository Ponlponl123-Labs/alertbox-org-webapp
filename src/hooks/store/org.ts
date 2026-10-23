"use client";

import { createStore } from "zustand";
import { Organization, Streamer, OrganizationMember } from "@/types/user.types";
import { setCookie, deleteCookie } from "cookies-next";

export type OrgStoreState = {
  organizations: Organization[];
  activeOrgId: string | null;
  activeStreamerId: string | null;
  isOrgMode: boolean;
};

export type OrgStoreActions = {
  syncFromMemberships: (memberships?: OrganizationMember[]) => void;
  setActiveOrgId: (id: string) => void;
  setActiveStreamerId: (id: string | null) => void;
  setOrgMode: (enabled: boolean) => void;
  removeStreamer: (streamerId: string) => void;
  removeOrganization: (orgId: string) => void;
  addStreamer: (orgId: string, streamer: Streamer) => void;
  updateStreamer: (streamerId: string, partial: Partial<Streamer>) => void;
  updateOrganization: (orgId: string, partial: Partial<Organization>) => void;
};

export type OrgStore = OrgStoreState & OrgStoreActions;

export const isInvalidOrgId = (id?: string | null): boolean =>
  !id || /^\d{4}-\d{2}-\d{2}/.test(id) || id.includes("GMT") || id === "undefined" || id === "null";

const getInitialOrgId = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("ab_active_org_id");
  if (isInvalidOrgId(stored)) {
    localStorage.removeItem("ab_active_org_id");
    return null;
  }
  return stored;
};

export const orgStore = createStore<OrgStore>()((set, get) => ({
  organizations: [],
  activeOrgId: getInitialOrgId(),
  activeStreamerId: typeof window !== "undefined" ? localStorage.getItem("ab_active_streamer_id") : null,
  isOrgMode: typeof window !== "undefined" ? localStorage.getItem("ab_view_mode") === "org" : false,

  syncFromMemberships: (memberships) => {
    const orgs: Organization[] = (memberships || [])
      .map((item: OrganizationMember | Record<string, unknown>) => {
        const m = item as Record<string, unknown>;
        const orgData = (m.organization || (m.slug ? m : null)) as Record<string, unknown> | null;
        if (!orgData) return null;
        const roleObj = m.role as unknown;
        const roleStr = typeof m.role === "string"
          ? m.role
          : roleObj && typeof roleObj === "object" && "name" in roleObj && typeof (roleObj as Record<string, unknown>).name === "string"
            ? ((roleObj as Record<string, unknown>).name as string)
            : "";
        const typeStr = typeof orgData?.type === "string" ? orgData.type : "COMMUNITY";
        return {
          ...orgData,
          id: String(orgData.id),
          type: typeStr as Organization["type"],
          role: roleStr as Organization["role"],
          permissions: m.permissions as string | undefined,
        } as Organization;
      })
      .filter((o): o is Organization => Boolean(o && !isInvalidOrgId(o.id)));

    const state = get();
    let nextOrgId = state.activeOrgId;
    if ((isInvalidOrgId(nextOrgId) || !orgs.some((o) => o.id === nextOrgId)) && orgs.length > 0) {
      nextOrgId = orgs[0].id;
    }

    const currentOrg = orgs.find((o) => o.id === nextOrgId);
    const isOwnerOrAdmin = currentOrg?.role === "OWNER" || currentOrg?.role === "ADMIN";
    let nextStreamerId = state.activeStreamerId;
    let nextIsOrgMode = state.isOrgMode;

    if (isOwnerOrAdmin && (state.isOrgMode || !nextStreamerId)) {
      nextStreamerId = null;
      nextIsOrgMode = true;
    } else if (currentOrg?.streamers?.length) {
      if (!currentOrg.streamers.some((s) => s.id === nextStreamerId)) {
        nextStreamerId = isOwnerOrAdmin ? null : currentOrg.streamers[0].id;
        if (isOwnerOrAdmin) nextIsOrgMode = true;
      }
    } else {
      nextStreamerId = null;
      if (isOwnerOrAdmin) nextIsOrgMode = true;
    }

    if (typeof window !== "undefined") {
      if (nextOrgId && !isInvalidOrgId(nextOrgId)) {
        localStorage.setItem("ab_active_org_id", nextOrgId);
        setCookie("ab_org_id", nextOrgId, { path: "/" });
      }
      localStorage.setItem("ab_view_mode", nextIsOrgMode ? "org" : "streamer");
      if (nextStreamerId && !nextIsOrgMode) {
        localStorage.setItem("ab_active_streamer_id", nextStreamerId);
        setCookie("ab_streamer_id", nextStreamerId, { path: "/" });
      } else {
        localStorage.removeItem("ab_active_streamer_id");
        deleteCookie("ab_streamer_id");
      }
    }

    set({
      organizations: orgs,
      activeOrgId: nextOrgId,
      activeStreamerId: nextStreamerId,
      isOrgMode: nextIsOrgMode,
    });
  },

  setActiveOrgId: (id: string) => {
    if (isInvalidOrgId(id)) return;
    const orgs = get().organizations;
    const org = orgs.find((o) => o.id === id);
    const isOwnerOrAdmin = org?.role === "OWNER" || org?.role === "ADMIN";
    const shouldBeOrgMode = isOwnerOrAdmin || get().isOrgMode;
    const nextStreamerId = shouldBeOrgMode ? null : (org?.streamers?.[0]?.id ?? null);

    if (typeof window !== "undefined") {
      localStorage.setItem("ab_active_org_id", id);
      setCookie("ab_org_id", id, { path: "/" });
      localStorage.setItem("ab_view_mode", shouldBeOrgMode ? "org" : "streamer");
      if (nextStreamerId && !shouldBeOrgMode) {
        localStorage.setItem("ab_active_streamer_id", nextStreamerId);
        setCookie("ab_streamer_id", nextStreamerId, { path: "/" });
      } else {
        localStorage.removeItem("ab_active_streamer_id");
        deleteCookie("ab_streamer_id");
      }
    }

    set({
      activeOrgId: id,
      activeStreamerId: nextStreamerId,
      isOrgMode: shouldBeOrgMode,
    });
  },

  setActiveStreamerId: (id: string | null) => {
    if (!id || id === "org") {
      if (typeof window !== "undefined") {
        localStorage.setItem("ab_view_mode", "org");
        localStorage.removeItem("ab_active_streamer_id");
        deleteCookie("ab_streamer_id");
      }
      set({ isOrgMode: true, activeStreamerId: null });
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("ab_view_mode", "streamer");
        localStorage.setItem("ab_active_streamer_id", id);
        setCookie("ab_streamer_id", id, { path: "/" });
      }
      set({ isOrgMode: false, activeStreamerId: id });
    }
  },

  setOrgMode: (enabled: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ab_view_mode", enabled ? "org" : "streamer");
      if (enabled) {
        deleteCookie("ab_streamer_id");
      }
    }
    set({ isOrgMode: enabled });
  },

  removeStreamer: (streamerId: string) => {
    const state = get();
    const updatedOrgs = state.organizations.map((org) => ({
      ...org,
      streamers: org.streamers.filter((s) => s.id !== streamerId && s.name !== streamerId),
    }));

    let nextStreamerId = state.activeStreamerId;
    let nextIsOrgMode = state.isOrgMode;

    const currentOrg = updatedOrgs.find((o) => o.id === state.activeOrgId) || updatedOrgs[0] || null;
    const isOwnerOrAdmin = currentOrg?.role === "OWNER" || currentOrg?.role === "ADMIN";

    if (state.activeStreamerId === streamerId || (state.activeStreamerId && !currentOrg?.streamers.some((s) => s.id === state.activeStreamerId))) {
      if (isOwnerOrAdmin || !currentOrg?.streamers.length) {
        nextStreamerId = null;
        nextIsOrgMode = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("ab_view_mode", "org");
          localStorage.removeItem("ab_active_streamer_id");
          deleteCookie("ab_streamer_id");
        }
      } else {
        nextStreamerId = currentOrg.streamers[0]?.id || null;
        nextIsOrgMode = false;
        if (typeof window !== "undefined") {
          if (nextStreamerId) {
            localStorage.setItem("ab_view_mode", "streamer");
            localStorage.setItem("ab_active_streamer_id", nextStreamerId);
            setCookie("ab_streamer_id", nextStreamerId, { path: "/" });
          } else {
            localStorage.setItem("ab_view_mode", "org");
            localStorage.removeItem("ab_active_streamer_id");
            deleteCookie("ab_streamer_id");
          }
        }
      }
    }

    set({
      organizations: updatedOrgs,
      activeStreamerId: nextStreamerId,
      isOrgMode: nextIsOrgMode,
    });
  },

  removeOrganization: (orgId: string) => {
    const state = get();
    const updatedOrgs = state.organizations.filter(
      (o) => o.id !== orgId && o.slug !== orgId,
    );

    let nextOrgId = state.activeOrgId;
    let nextStreamerId = state.activeStreamerId;
    let nextIsOrgMode = state.isOrgMode;

    if (state.activeOrgId === orgId || !updatedOrgs.some((o) => o.id === state.activeOrgId)) {
      const nextOrg = updatedOrgs[0] || null;
      if (nextOrg) {
        nextOrgId = nextOrg.id;
        const isOwnerOrAdmin = nextOrg.role === "OWNER" || nextOrg.role === "ADMIN";
        if (isOwnerOrAdmin) {
          nextStreamerId = null;
          nextIsOrgMode = true;
        } else {
          nextStreamerId = nextOrg.streamers?.[0]?.id || null;
          nextIsOrgMode = !nextStreamerId;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("ab_active_org_id", nextOrg.id);
          setCookie("ab_org_id", nextOrg.id, { path: "/" });
          if (nextStreamerId) {
            localStorage.setItem("ab_view_mode", "streamer");
            localStorage.setItem("ab_active_streamer_id", nextStreamerId);
            setCookie("ab_streamer_id", nextStreamerId, { path: "/" });
          } else {
            localStorage.setItem("ab_view_mode", "org");
            localStorage.removeItem("ab_active_streamer_id");
            deleteCookie("ab_streamer_id");
          }
        }
      } else {
        nextOrgId = null;
        nextStreamerId = null;
        nextIsOrgMode = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("ab_active_org_id");
          localStorage.removeItem("ab_active_streamer_id");
          localStorage.removeItem("ab_view_mode");
          deleteCookie("ab_org_id");
          deleteCookie("ab_streamer_id");
        }
      }
    }

    set({
      organizations: updatedOrgs,
      activeOrgId: nextOrgId,
      activeStreamerId: nextStreamerId,
      isOrgMode: nextIsOrgMode,
    });
  },

  addStreamer: (orgId: string, streamer: Streamer) => {
    set((state) => ({
      organizations: state.organizations.map((org) => {
        if (org.id !== orgId && org.slug !== orgId) return org;
        if (org.streamers.some((s) => s.id === streamer.id || s.name === streamer.name)) return org;
        return { ...org, streamers: [...org.streamers, streamer] };
      }),
    }));
  },

  updateStreamer: (streamerId: string, partial: Partial<Streamer>) => {
    set((state) => ({
      organizations: state.organizations.map((org) => ({
        ...org,
        streamers: org.streamers.map((s) => (s.id === streamerId ? { ...s, ...partial } : s)),
      })),
    }));
  },

  updateOrganization: (orgId: string, partial: Partial<Organization>) => {
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === orgId || org.slug === orgId ? { ...org, ...partial } : org,
      ),
    }));
  },
}));

export const selectActiveOrg = (state: OrgStore): Organization | null => {
  if (!state.organizations.length) return null;
  return state.organizations.find((o) => o.id === state.activeOrgId) || state.organizations[0] || null;
};

export const selectActiveStreamer = (state: OrgStore): Streamer | null => {
  const activeOrg = selectActiveOrg(state);
  if (!activeOrg?.streamers?.length) return null;
  const isOwnerOrAdmin = activeOrg.role === "OWNER" || activeOrg.role === "ADMIN";
  if (isOwnerOrAdmin && (state.isOrgMode || !state.activeStreamerId)) return null;
  return activeOrg.streamers.find((s) => s.id === state.activeStreamerId) || (isOwnerOrAdmin ? null : activeOrg.streamers[0]) || null;
};
