import { describe, expect, it } from "bun:test";
import {
  hasPermission,
  hasAnyPermission,
  isOrgOwner,
  isOrgOwnerOrAdmin,
  canDelegateRolePreset,
  canManageTargetMember,
  canAccessStreamer,
  resolveStreamerPermMask,
} from "../rbac";
import { OrgPerm, StreamerPerm, RolePresets } from "@/consts/permission";

describe("RBAC & Privilege Boundary Controls", () => {
  describe("hasPermission & hasAnyPermission", () => {
    it("evaluates bitmasks accurately and rejects negative or zero masks", () => {
      const mask = (OrgPerm.ORG_VIEW | OrgPerm.STREAMER_VIEW).toString();
      expect(hasPermission(mask, OrgPerm.ORG_VIEW)).toBe(true);
      expect(hasPermission(mask, OrgPerm.ORG_MANAGE)).toBe(false);
      expect(hasPermission(mask, OrgPerm.ORG_VIEW | OrgPerm.STREAMER_VIEW)).toBe(true);
      expect(hasPermission(mask, BigInt(0))).toBe(false);
      expect(hasPermission("-1", OrgPerm.ORG_MANAGE)).toBe(false);
      expect(hasPermission("invalid", OrgPerm.ORG_VIEW)).toBe(false);
      expect(hasAnyPermission(mask, OrgPerm.ORG_MANAGE | OrgPerm.STREAMER_VIEW)).toBe(true);
      expect(hasAnyPermission("-1", OrgPerm.ORG_MANAGE)).toBe(false);
    });
  });

  describe("Role normalization", () => {
    it("handles mixed-case role strings safely", () => {
      expect(isOrgOwner({ role: "owner" })).toBe(true);
      expect(isOrgOwner({ role: "OWNER" })).toBe(true);
      expect(isOrgOwner({ role: "admin" })).toBe(false);
      expect(isOrgOwnerOrAdmin({ role: "Admin" })).toBe(true);
      expect(isOrgOwnerOrAdmin({ role: "MANAGER" })).toBe(false);
    });
  });

  describe("Privilege ceiling enforcement", () => {
    it("prevents delegating OWNER or higher permissions than caller holds", () => {
      const ownerOrg = { role: "OWNER", permissions: RolePresets.OWNER.toString() };
      const adminOrg = { role: "ADMIN", permissions: RolePresets.ADMIN.toString() };
      const managerOrg = { role: "MANAGER", permissions: RolePresets.MANAGER.toString() };
      const viewerOrg = { role: "VIEWER", permissions: RolePresets.VIEWER.toString() };

      expect(canDelegateRolePreset(ownerOrg, "OWNER")).toBe(false);
      expect(canDelegateRolePreset(ownerOrg, "ADMIN")).toBe(true);
      expect(canDelegateRolePreset(adminOrg, "MANAGER")).toBe(true);
      expect(canDelegateRolePreset(managerOrg, "ADMIN")).toBe(false);
      expect(canDelegateRolePreset(managerOrg, "EDITOR")).toBe(true);
      expect(canDelegateRolePreset(viewerOrg, "MANAGER")).toBe(false);
    });

    it("prevents lower-privileged callers from managing higher-privileged members", () => {
      const ownerOrg = { role: "OWNER", permissions: RolePresets.OWNER.toString() };
      const adminOrg = { role: "ADMIN", permissions: RolePresets.ADMIN.toString() };
      const managerOrg = { role: "MANAGER", permissions: RolePresets.MANAGER.toString() };
      const viewerOrg = { role: "VIEWER", permissions: RolePresets.VIEWER.toString() };

      expect(canManageTargetMember(ownerOrg, { role: "ADMIN", permissions: RolePresets.ADMIN.toString() })).toBe(true);
      expect(canManageTargetMember(adminOrg, { role: "OWNER", permissions: RolePresets.OWNER.toString() })).toBe(false);
      expect(canManageTargetMember(adminOrg, { role: "MANAGER", permissions: RolePresets.MANAGER.toString() })).toBe(true);
      expect(canManageTargetMember(managerOrg, { role: "ADMIN", permissions: RolePresets.ADMIN.toString() })).toBe(false);
      expect(canManageTargetMember(viewerOrg, { role: "EDITOR", permissions: RolePresets.EDITOR.toString() })).toBe(false);
    });
  });

  describe("canAccessStreamer & resolveStreamerPermMask", () => {
    it("resolves numeric and string-key streamer permissions accurately", () => {
      expect(resolveStreamerPermMask(StreamerPerm.STREAMER_INTEGRATION_MANAGE)).toBe(8);
      expect(resolveStreamerPermMask(["MANAGE_STREAMER_INTEGRATIONS", "READ_STREAMER_BASIC"])).toBe(
        StreamerPerm.STREAMER_INTEGRATION_MANAGE | StreamerPerm.STREAMER_VIEW,
      );
      expect(resolveStreamerPermMask(-1)).toBe(0);
    });

    it("grants OWNER/ADMIN full access and scopes non-admin staff by streamer/org bitmask", () => {
      const ownerOrg = { role: "OWNER", permissions: "0" };
      const memberOrg = { role: "MEMBER", permissions: OrgPerm.STREAMER_VIEW.toString() };
      const streamer = { permissions: StreamerPerm.STREAMER_INTEGRATION_MANAGE };

      expect(canAccessStreamer(ownerOrg, streamer, StreamerPerm.STREAMER_MANAGE, OrgPerm.STREAMER_MANAGE)).toBe(true);
      expect(canAccessStreamer(memberOrg, streamer, StreamerPerm.STREAMER_INTEGRATION_MANAGE, OrgPerm.INTEGRATION_MANAGE)).toBe(true);
      expect(canAccessStreamer(memberOrg, streamer, StreamerPerm.STREAMER_MANAGE, OrgPerm.STREAMER_MANAGE)).toBe(false);
    });
  });
});
