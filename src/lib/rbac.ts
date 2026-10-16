/**
 * 64-bit bitmask flags for client-side RBAC checks.
 * Standard Domain-Scoped Bitwise hierarchy: RESOURCE_ACTION.
 */
export const OrgPerm = {
  // 0-9: Organization Management
  ORG_VIEW:                  BigInt(1) << BigInt(0),
  ORG_MANAGE:                BigInt(1) << BigInt(1),
  ORG_MEMBERS_MANAGE:        BigInt(1) << BigInt(2),
  ORG_ROLES_MANAGE:          BigInt(1) << BigInt(3),
  ORG_DELETE:                BigInt(1) << BigInt(4),

  // 10-19: Streamer Channels Management
  STREAMER_VIEW:             BigInt(1) << BigInt(10),
  STREAMER_CREATE:           BigInt(1) << BigInt(11),
  STREAMER_MANAGE:           BigInt(1) << BigInt(12),
  STREAMER_DELETE:           BigInt(1) << BigInt(13),

  // 20-29: Widgets & OBS Overlays
  WIDGET_VIEW:               BigInt(1) << BigInt(20),
  WIDGET_MANAGE:             BigInt(1) << BigInt(21),
  WIDGET_TOKEN_ROTATE:       BigInt(1) << BigInt(22),

  // 30-39: Integrations & Payments
  INTEGRATION_VIEW:          BigInt(1) << BigInt(30),
  INTEGRATION_MANAGE:        BigInt(1) << BigInt(31),

  // 40-49: Financials, Analytics & Logs
  ANALYTICS_VIEW:            BigInt(1) << BigInt(40),
  TRANSACTION_VIEW:          BigInt(1) << BigInt(41),
  REPORT_EXPORT:             BigInt(1) << BigInt(42),

  // Full Admin Mask
  ALL:                       BigInt("18446744073709551615"),
} as const;

export const RolePresets: Record<string, bigint> = {
  OWNER: OrgPerm.ALL,
  ADMIN: OrgPerm.ALL & ~OrgPerm.ORG_DELETE,
  MANAGER:
    OrgPerm.ORG_VIEW |
    OrgPerm.STREAMER_VIEW |
    OrgPerm.STREAMER_MANAGE |
    OrgPerm.WIDGET_VIEW |
    OrgPerm.WIDGET_MANAGE |
    OrgPerm.WIDGET_TOKEN_ROTATE |
    OrgPerm.INTEGRATION_VIEW |
    OrgPerm.INTEGRATION_MANAGE |
    OrgPerm.ANALYTICS_VIEW |
    OrgPerm.TRANSACTION_VIEW,
  EDITOR:
    OrgPerm.ORG_VIEW |
    OrgPerm.STREAMER_VIEW |
    OrgPerm.STREAMER_MANAGE |
    OrgPerm.WIDGET_VIEW |
    OrgPerm.WIDGET_MANAGE,
  VIEWER:
    OrgPerm.ORG_VIEW |
    OrgPerm.STREAMER_VIEW |
    OrgPerm.WIDGET_VIEW |
    OrgPerm.ANALYTICS_VIEW,
  MEMBER: OrgPerm.ORG_VIEW,
};

/**
 * Bitwise flags for granular channel/streamer level delegations.
 */
export const StreamerPerm = {
  STREAMER_VIEW:               1 << 0, // 1
  STREAMER_MANAGE:             1 << 1, // 2
  STREAMER_WIDGET_MANAGE:      1 << 2, // 4
  STREAMER_INTEGRATION_MANAGE: 1 << 3, // 8
  STREAMER_ANALYTICS_VIEW:     1 << 4, // 16
  STREAMER_TRANSACTION_VIEW:   1 << 5, // 32

  ALL:                         63,     // 0b111111
} as const;

export function hasPermission(userPerms: string | bigint | number | undefined, required: bigint): boolean {
  if (userPerms === undefined || userPerms === null) return false;
  try {
    const mask = typeof userPerms === "bigint" ? userPerms : BigInt(userPerms);
    return (mask & required) === required;
  } catch {
    return false;
  }
}

export function hasAnyPermission(userPerms: string | bigint | number | undefined, required: bigint): boolean {
  if (userPerms === undefined || userPerms === null) return false;
  try {
    const mask = typeof userPerms === "bigint" ? userPerms : BigInt(userPerms);
    return (mask & required) !== BigInt(0);
  } catch {
    return false;
  }
}

export function canAccessStreamer(
  activeOrg: { role?: string; permissions?: string | bigint | number } | null | undefined,
  activeStreamer: { permissions?: number | string[] } | null | undefined,
  requiredStreamerPerm?: number,
  fallbackOrgPerm?: bigint,
): boolean {
  if (!activeOrg) return false;
  const role = (activeOrg.role || "").toLowerCase();
  if (role === "owner" || role === "admin") return true;

  if (requiredStreamerPerm !== undefined && activeStreamer?.permissions !== undefined) {
    const p = activeStreamer.permissions;
    if (typeof p === "number") {
      if ((p & requiredStreamerPerm) === requiredStreamerPerm) return true;
    } else if (Array.isArray(p)) {
      const mask = p.reduce((acc: number, item: unknown) => {
        if (typeof item === "number") return acc | item;
        if (typeof item === "string") {
          if (!isNaN(Number(item))) return acc | Number(item);
          if (item === "READ_STREAMER_BASIC" || item === "STREAMER_VIEW") return acc | StreamerPerm.STREAMER_VIEW;
          if (item === "WRITE_STREAMER_BASIC" || item === "STREAMER_MANAGE") return acc | StreamerPerm.STREAMER_MANAGE;
          if (item === "MANAGE_STREAMER_WIDGETS" || item === "STREAMER_WIDGET_MANAGE") return acc | StreamerPerm.STREAMER_WIDGET_MANAGE;
          if (item === "MANAGE_STREAMER_INTEGRATIONS" || item === "STREAMER_INTEGRATION_MANAGE") return acc | StreamerPerm.STREAMER_INTEGRATION_MANAGE;
          if (item === "READ_STREAMER_ANALISTIC" || item === "STREAMER_ANALYTICS_VIEW") return acc | StreamerPerm.STREAMER_ANALYTICS_VIEW;
          if (item === "READ_STREAMER_TRANSACTION" || item === "STREAMER_TRANSACTION_VIEW") return acc | StreamerPerm.STREAMER_TRANSACTION_VIEW;
        }
        return acc;
      }, 0);
      if ((mask & requiredStreamerPerm) === requiredStreamerPerm) return true;
    }
  }

  if (fallbackOrgPerm && hasPermission(activeOrg.permissions, fallbackOrgPerm)) {
    return true;
  }

  return false;
}
