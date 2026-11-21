import { OrgPerm, RolePresets, StreamerPerm } from "@/consts/permission";
import { safeParseBigInt } from "@/lib/security";

const STREAMER_PERM_KEY_MAP: Record<string, number> = {
  READ_STREAMER_BASIC: StreamerPerm.STREAMER_VIEW,
  STREAMER_VIEW: StreamerPerm.STREAMER_VIEW,
  WRITE_STREAMER_BASIC: StreamerPerm.STREAMER_MANAGE,
  STREAMER_MANAGE: StreamerPerm.STREAMER_MANAGE,
  MANAGE_STREAMER_WIDGETS: StreamerPerm.STREAMER_WIDGET_MANAGE,
  STREAMER_WIDGET_MANAGE: StreamerPerm.STREAMER_WIDGET_MANAGE,
  MANAGE_STREAMER_INTEGRATIONS: StreamerPerm.STREAMER_INTEGRATION_MANAGE,
  STREAMER_INTEGRATION_MANAGE: StreamerPerm.STREAMER_INTEGRATION_MANAGE,
  READ_STREAMER_ANALISTIC: StreamerPerm.STREAMER_ANALYTICS_VIEW,
  READ_STREAMER_ANALYTICS: StreamerPerm.STREAMER_ANALYTICS_VIEW,
  STREAMER_ANALYTICS_VIEW: StreamerPerm.STREAMER_ANALYTICS_VIEW,
  READ_STREAMER_TRANSACTION: StreamerPerm.STREAMER_TRANSACTION_VIEW,
  STREAMER_TRANSACTION_VIEW: StreamerPerm.STREAMER_TRANSACTION_VIEW,
};

export function normalizeRole(role: unknown): string {
  if (typeof role === "string") return role.trim().toLowerCase();
  if (role && typeof role === "object") {
    const obj = role as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name.trim().toLowerCase();
    if (typeof obj.role === "string") return obj.role.trim().toLowerCase();
  }
  return "";
}

export function isOrgOwner(activeOrg: { role?: unknown } | null | undefined): boolean {
  return normalizeRole(activeOrg?.role) === "owner";
}

export function isOrgOwnerOrAdmin(activeOrg: { role?: unknown } | null | undefined): boolean {
  const role = normalizeRole(activeOrg?.role);
  return role === "owner" || role === "admin";
}

export function getCallerPermMask(
  activeOrg: { role?: unknown; permissions?: string | bigint | number } | null | undefined,
): bigint {
  if (!activeOrg) return BigInt(0);
  if (isOrgOwner(activeOrg)) return OrgPerm.ALL;
  const parsed = safeParseBigInt(activeOrg.permissions, BigInt(0));
  return parsed < BigInt(0) ? BigInt(0) : parsed;
}

export function hasPermission(
  userPerms: string | bigint | number | undefined,
  required: bigint,
): boolean {
  if (userPerms === undefined || userPerms === null || required <= BigInt(0)) return false;
  const mask = safeParseBigInt(userPerms, BigInt(-1));
  if (mask < BigInt(0)) return false;
  return (mask & required) === required;
}

export function hasAnyPermission(
  userPerms: string | bigint | number | undefined,
  required: bigint,
): boolean {
  if (userPerms === undefined || userPerms === null || required <= BigInt(0)) return false;
  const mask = safeParseBigInt(userPerms, BigInt(-1));
  if (mask < BigInt(0)) return false;
  return (mask & required) !== BigInt(0);
}

export function canDelegateRolePreset(
  activeOrg: { role?: unknown; permissions?: string | bigint | number } | null | undefined,
  roleName: string,
): boolean {
  if (!activeOrg) return false;
  const upper = roleName.trim().toUpperCase();
  if (upper === "OWNER") return false;
  if (isOrgOwner(activeOrg)) return true;
  if (upper === "ADMIN" && normalizeRole(activeOrg.role) !== "admin") return false;
  const preset = RolePresets[upper];
  if (preset === undefined) return false;
  const callerMask = getCallerPermMask(activeOrg);
  return (preset & ~callerMask) === BigInt(0);
}

export function canManageTargetMember(
  activeOrg: { role?: unknown; permissions?: string | bigint | number } | null | undefined,
  target: { role?: unknown; permissions?: string | bigint | number } | null | undefined,
): boolean {
  if (!activeOrg || !target) return false;
  const targetRole = normalizeRole(target.role);
  if (targetRole === "owner") return false;
  if (isOrgOwner(activeOrg)) return true;
  if (targetRole === "admin" && normalizeRole(activeOrg.role) !== "admin") return false;
  const callerMask = getCallerPermMask(activeOrg);
  const targetMask = safeParseBigInt(target.permissions, BigInt(0));
  if (targetMask < BigInt(0)) return false;
  return (targetMask & ~callerMask) === BigInt(0);
}

export function resolveStreamerPermMask(permissions: number | string[] | undefined): number {
  if (typeof permissions === "number") {
    return Number.isSafeInteger(permissions) && permissions >= 0 ? permissions : 0;
  }
  if (!Array.isArray(permissions)) return 0;
  let mask = 0;
  for (const item of permissions) {
    if (typeof item === "number" && Number.isSafeInteger(item) && item > 0) {
      mask |= item;
    } else if (typeof item === "string") {
      const mapped = STREAMER_PERM_KEY_MAP[item];
      if (mapped !== undefined) {
        mask |= mapped;
      } else if (/^\d+$/.test(item)) {
        mask |= Number(item);
      }
    }
  }
  return mask;
}

export function canAccessStreamer(
  activeOrg: { role?: unknown; permissions?: string | bigint | number } | null | undefined,
  activeStreamer: { permissions?: number | string[] } | null | undefined,
  requiredStreamerPerm?: number,
  fallbackOrgPerm?: bigint,
): boolean {
  if (!activeOrg) return false;
  if (isOrgOwnerOrAdmin(activeOrg)) return true;

  if (
    requiredStreamerPerm !== undefined &&
    requiredStreamerPerm > 0 &&
    activeStreamer?.permissions !== undefined
  ) {
    const mask = resolveStreamerPermMask(activeStreamer.permissions);
    if ((mask & requiredStreamerPerm) === requiredStreamerPerm) return true;
  }

  if (fallbackOrgPerm && hasPermission(activeOrg.permissions, fallbackOrgPerm)) {
    return true;
  }

  return false;
}
