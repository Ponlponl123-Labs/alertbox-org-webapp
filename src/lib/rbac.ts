import { StreamerPerm } from "@/consts/permission";

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
