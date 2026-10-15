import React from "react";
import {
  CrownIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserGearIcon,
  UserCheckIcon,
  GearSixIcon,
  BroadcastIcon,
  KeyIcon,
  PlugsConnectedIcon,
  PlugIcon,
  BrowsersIcon,
  TrashIcon,
  SlidersIcon,
  InfoIcon,
} from "@phosphor-icons/react";

export type AuditCategory =
  | "ALL"
  | "MEMBERS"
  | "CHANNELS"
  | "SETTINGS"
  | "SECURITY";

export interface AuditActionInfo {
  title: string;
  description: string;
  category: "Ownership" | "Members" | "Channels" | "Security" | "Integrations" | "Organization" | "Other";
  filterCategory: AuditCategory;
  badgeClass: string;
  dotClass: string;
  icon: React.ReactNode;
}

export function formatTableDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

export function humanizeAuditAction(action: string, payload?: unknown): AuditActionInfo {
  const p = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;

  switch (action) {
    case "OWNERSHIP_TRANSFERRED":
    case "OWNER_TRANSFERRED":
      return {
        title: "Transferred Ownership",
        description: "Organization ownership was safely transferred to a new team member.",
        category: "Ownership",
        filterCategory: "SECURITY",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400",
        icon: <CrownIcon size={14} weight="bold" />,
      };

    case "ORG_SETTINGS_UPDATED":
    case "ORG_UPDATED":
      return {
        title: "Updated Org Settings",
        description: p.name
          ? `Updated organization configuration (Renamed to "${String(p.name)}").`
          : "Updated organization profile details, branding, or configuration.",
        category: "Organization",
        filterCategory: "SETTINGS",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dotClass: "bg-blue-400",
        icon: <GearSixIcon size={14} weight="bold" />,
      };

    case "MEMBER_INVITED":
      return {
        title: "Invited Member",
        description: p.email
          ? `Sent invite to ${String(p.email)} with ${String(p.role || "Member")} role.`
          : "Invited a new member to join the organization.",
        category: "Members",
        filterCategory: "MEMBERS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <UserPlusIcon size={14} weight="bold" />,
      };

    case "MEMBER_INVITE_REVOKED":
      return {
        title: "Revoked Invite",
        description: p.email
          ? `Cancelled pending invitation for ${String(p.email)}.`
          : "Revoked a pending organization invite.",
        category: "Members",
        filterCategory: "MEMBERS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <UserMinusIcon size={14} weight="bold" />,
      };

    case "MEMBER_ROLE_UPDATED":
      return {
        title: "Role Changed",
        description: p.role
          ? `Assigned ${String(p.role)} role${p.streamerAssignmentsCount ? ` with ${p.streamerAssignmentsCount} channel(s)` : ""}.`
          : "Modified team member role and granular channel permissions.",
        category: "Members",
        filterCategory: "MEMBERS",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotClass: "bg-purple-400",
        icon: <UserGearIcon size={14} weight="bold" />,
      };

    case "MEMBER_REMOVED":
      return {
        title: "Member Removed",
        description: p.email
          ? `Removed ${String(p.email)} from the organization.`
          : "Revoked organization membership from staff member.",
        category: "Members",
        filterCategory: "MEMBERS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <UserMinusIcon size={14} weight="bold" />,
      };

    case "MEMBER_JOINED":
      return {
        title: "Member Joined",
        description: "Accepted team invitation and activated organization access.",
        category: "Members",
        filterCategory: "MEMBERS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <UserCheckIcon size={14} weight="bold" />,
      };

    case "STREAMER_CREATED":
      return {
        title: "Channel Created",
        description: p.name
          ? `Provisioned channel @${String(p.name)}${p.displayName ? ` (${String(p.displayName)})` : ""}.`
          : "Provisioned a new streaming channel.",
        category: "Channels",
        filterCategory: "CHANNELS",
        badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        dotClass: "bg-cyan-400",
        icon: <BroadcastIcon size={14} weight="bold" />,
      };

    case "STREAMER_UPDATED":
      return {
        title: "Channel Updated",
        description: p.name
          ? `Updated channel profile and metadata for @${String(p.name)}.`
          : "Updated channel profile, appearance, or social connections.",
        category: "Channels",
        filterCategory: "CHANNELS",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400",
        icon: <SlidersIcon size={14} weight="bold" />,
      };

    case "STREAMER_DELETED":
      return {
        title: "Channel Deleted",
        description: p.name
          ? `Permanently removed channel @${String(p.name)}.`
          : "Permanently deleted a streaming channel.",
        category: "Channels",
        filterCategory: "CHANNELS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <TrashIcon size={14} weight="bold" />,
      };

    case "TOKEN_ROTATED":
      return {
        title: "Token Rotated",
        description: "Invalidated and regenerated OBS browser source security token.",
        category: "Security",
        filterCategory: "SECURITY",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotClass: "bg-purple-400",
        icon: <KeyIcon size={14} weight="bold" />,
      };

    case "INTEGRATION_CONNECTED":
      return {
        title: "Connected Gateway",
        description: p.platform
          ? `Linked ${String(p.platform).toUpperCase()} integration to channel.`
          : "Connected new payment gateway.",
        category: "Integrations",
        filterCategory: "CHANNELS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <PlugsConnectedIcon size={14} weight="bold" />,
      };

    case "INTEGRATION_DISCONNECTED":
      return {
        title: "Disconnected Gateway",
        description: p.platform
          ? `Removed ${String(p.platform).toUpperCase()} payment gateway.`
          : "Disconnected payment integration.",
        category: "Integrations",
        filterCategory: "CHANNELS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <PlugIcon size={14} weight="bold" />,
      };

    case "WIDGET_UPDATED":
      return {
        title: "Widget Updated",
        description: "Modified AlertBox overlay configuration, sound, or visual triggers.",
        category: "Channels",
        filterCategory: "CHANNELS",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dotClass: "bg-blue-400",
        icon: <BrowsersIcon size={14} weight="bold" />,
      };

    default:
      return {
        title: action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        description: "Administrative event recorded in organization security audit trail.",
        category: "Other",
        filterCategory: "SETTINGS",
        badgeClass: "bg-secondary text-muted-foreground border-border",
        dotClass: "bg-zinc-400",
        icon: <InfoIcon size={14} weight="bold" />,
      };
  }
}

export function formatPayloadSummary(
  action: string,
  payload: unknown,
): Array<{ label: string; value: string }> {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;

  const items: Array<{ label: string; value: string }> = [];

  if (p.email) items.push({ label: "Target Email", value: String(p.email) });
  if (p.role) items.push({ label: "Assigned Role", value: String(p.role) });
  if (p.streamerAssignmentsCount !== undefined) {
    items.push({
      label: "Channel Delegations",
      value: `${String(p.streamerAssignmentsCount)} channel(s) assigned`,
    });
  }
  if (p.name) items.push({ label: "Channel Handle", value: `@${String(p.name)}` });
  if (p.displayName) items.push({ label: "Display Name", value: String(p.displayName) });
  if (p.platform) items.push({ label: "Gateway Provider", value: String(p.platform).toUpperCase() });
  if (p.targetUserId) items.push({ label: "Target User ID", value: `#${String(p.targetUserId)}` });
  if (p.previousOwnerUserId && p.newOwnerUserId) {
    items.push({
      label: "Transfer Flow",
      value: `Member #${String(p.previousOwnerUserId)} → Member #${String(p.newOwnerUserId)}`,
    });
  }

  // Fallback for simple scalar properties
  if (items.length === 0) {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        const humanLabel = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        items.push({ label: humanLabel, value: String(v) });
      }
    }
  }

  return items;
}
