/**
 * 64-bit bitmask flags for client-side RBAC checks.
 */
export const OrgPerm = {
  // 0-9: Organization Administration
  VIEW_ORG:              BigInt(1) << BigInt(0),
  MANAGE_SETTINGS:       BigInt(1) << BigInt(1),
  MANAGE_MEMBERS:        BigInt(1) << BigInt(2),
  MANAGE_ROLES:          BigInt(1) << BigInt(3),
  DELETE_ORG:            BigInt(1) << BigInt(4),

  // 10-19: Streamer & Profile Operations
  VIEW_STREAMERS:        BigInt(1) << BigInt(10),
  CREATE_STREAMER:       BigInt(1) << BigInt(11),
  EDIT_STREAMER_PROFILE: BigInt(1) << BigInt(12),
  DELETE_STREAMER:       BigInt(1) << BigInt(13),

  // 20-29: Widgets & OBS Overlays
  VIEW_WIDGETS:          BigInt(1) << BigInt(20),
  MANAGE_ALERTBOX:       BigInt(1) << BigInt(21),
  ROTATE_WIDGET_TOKENS:  BigInt(1) << BigInt(22),

  // 30-39: Integrations & Payments
  VIEW_INTEGRATIONS:     BigInt(1) << BigInt(30),
  MANAGE_INTEGRATIONS:   BigInt(1) << BigInt(31),

  // 40-49: Financials, Analytics & Logs
  VIEW_ANALYTICS:        BigInt(1) << BigInt(40),
  VIEW_TRANSACTIONS:     BigInt(1) << BigInt(41),
  EXPORT_REPORTS:        BigInt(1) << BigInt(42),

  // Full Admin Mask
  ALL:                   BigInt("18446744073709551615"),
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
