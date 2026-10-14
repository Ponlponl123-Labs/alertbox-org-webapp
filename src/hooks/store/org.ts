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
  updateStreamer: (streamerId: string, partial: Partial<Streamer>) => void;
  updateOrganization: (orgId: string, partial: Partial<Organization>) => void;
};

export type OrgStore = OrgStoreState & OrgStoreActions;

export const orgStore = createStore<OrgStore>()((set, get) => ({
  organizations: [],
  activeOrgId: typeof window !== "undefined" ? localStorage.getItem("ab_active_org_id") : null,
  activeStreamerId: typeof window !== "undefined" ? localStorage.getItem("ab_active_streamer_id") : null,
  isOrgMode: typeof window !== "undefined" ? localStorage.getItem("ab_view_mode") === "org" : false,

  syncFromMemberships: (memberships) => {
    const orgs: Organization[] = (memberships || []).map((m: OrganizationMember) => ({
      ...m.organization,
      role: m.role,
      permissions: m.permissions,
    }));

    const state = get();
    let nextOrgId = state.activeOrgId;
    if (!orgs.some((o) => o.id === nextOrgId) && orgs.length > 0) {
      nextOrgId = orgs[0].id;
    }

    const currentOrg = orgs.find((o) => o.id === nextOrgId);
    let nextStreamerId = state.activeStreamerId;
    if (currentOrg?.streamers?.length) {
      if (!currentOrg.streamers.some((s) => s.id === nextStreamerId)) {
        nextStreamerId = currentOrg.streamers[0].id;
      }
    } else {
      nextStreamerId = null;
    }

    if (typeof window !== "undefined") {
      if (nextOrgId) {
        localStorage.setItem("ab_active_org_id", nextOrgId);
        setCookie("ab_org_id", nextOrgId, { path: "/" });
      }
      if (nextStreamerId && !state.isOrgMode) {
        localStorage.setItem("ab_active_streamer_id", nextStreamerId);
        setCookie("ab_streamer_id", nextStreamerId, { path: "/" });
      }
    }

    set({
      organizations: orgs,
      activeOrgId: nextOrgId,
      activeStreamerId: nextStreamerId,
    });
  },

  setActiveOrgId: (id: string) => {
    const orgs = get().organizations;
    const org = orgs.find((o) => o.id === id);
    const nextStreamerId = org?.streamers?.[0]?.id ?? null;

    if (typeof window !== "undefined") {
      localStorage.setItem("ab_active_org_id", id);
      setCookie("ab_org_id", id, { path: "/" });
      if (nextStreamerId && !get().isOrgMode) {
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
  if (state.isOrgMode && isOwnerOrAdmin) return null;
  return activeOrg.streamers.find((s) => s.id === state.activeStreamerId) || activeOrg.streamers[0] || null;
};
