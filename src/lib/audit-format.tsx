import React from "react";
import {
  UserMentionChip,
  RoleMentionChip,
  ChannelMentionChip,
  StreamerMentionChip,
  MemberMentionChip,
  type TinyUser,
  type TinyStreamer,
} from "./tiny-user-cache";
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
  ArrowRightIcon,
  CheckIcon,
  XIcon,
  ShieldIcon,
} from "@phosphor-icons/react";
import { ORG_PERM_DEFINITIONS } from "@/consts/org";
import {
  type AuditCategory,
  AUDIT_ACTION_CATEGORY_MAP,
  FIELD_FRIENDLY_NAMES,
  STREAMER_PERM_LABELS,
  STREAMER_PERM_BITS,
} from "@/consts/audit";

export type { AuditCategory };

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
    const now = Date.now();
    const diffMs = now - date.getTime();
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
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

export function isAuditActionInCategory(action: string, category: AuditCategory): boolean {
  if (category === "ALL") return true;
  const categories = AUDIT_ACTION_CATEGORY_MAP[action];
  if (categories) return categories.includes(category);

  // Dynamic fallback for custom/unmapped actions
  const upper = action.toUpperCase();
  if (category === "SECURITY") {
    return upper.includes("OWNER") || upper.includes("TRANSFERRED") || upper.includes("SECURITY") || upper.includes("TOKEN");
  }
  if (category === "MEMBERS") return upper.startsWith("MEMBER_");
  if (category === "CHANNELS") return upper.startsWith("STREAMER_") || upper.startsWith("WIDGET_") || upper.startsWith("INTEGRATION_") || upper.startsWith("TRANSACTION_");
  if (category === "SETTINGS") return upper.startsWith("ORG_");
  return true;
}

export function humanizeAuditAction(action: string, payload?: unknown): AuditActionInfo {
  const p = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;

  switch (action) {
    case "ORGANIZATION_TRANSFERRED":
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

    case "ORGANIZATION_DELETED":
    case "ORG_DELETED":
      return {
        title: "Organization Deleted",
        description: "Organization was marked for permanent deletion.",
        category: "Security",
        filterCategory: "SECURITY",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <TrashIcon size={14} weight="bold" />,
      };

    case "MEMBER_LEFT":
      return {
        title: "Member Left",
        description: "Member voluntarily left the organization.",
        category: "Members",
        filterCategory: "MEMBERS",
        badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
        dotClass: "bg-zinc-400",
        icon: <UserMinusIcon size={14} weight="bold" />,
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

    case "INTEGRATION_UPDATED":
      return {
        title: "Updated Gateway",
        description: p.platform
          ? `Updated ${String(p.platform).toUpperCase()} payment gateway configuration.`
          : "Updated payment gateway settings.",
        category: "Integrations",
        filterCategory: "CHANNELS",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dotClass: "bg-blue-400",
        icon: <SlidersIcon size={14} weight="bold" />,
      };

    case "TRANSACTION_DELETED":
      return {
        title: "Deleted Transaction",
        description: p.senderName
          ? `Soft-deleted transaction from ${String(p.senderName)}${p.amount !== undefined ? ` (${String(p.amount)} ${String(p.currency || "")})` : ""}.`
          : "Soft-deleted a transaction record.",
        category: "Channels",
        filterCategory: "CHANNELS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <TrashIcon size={14} weight="bold" />,
      };

    case "TRANSACTION_RESTORED":
      return {
        title: "Restored Transaction",
        description: p.senderName
          ? `Restored transaction from ${String(p.senderName)}${p.amount !== undefined ? ` (${String(p.amount)} ${String(p.currency || "")})` : ""}.`
          : "Restored a deleted transaction record.",
        category: "Channels",
        filterCategory: "CHANNELS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <BroadcastIcon size={14} weight="bold" />,
      };

    case "TRANSACTION_RESENT":
      return {
        title: "Resent Alert",
        description: p.senderName
          ? `Re-triggered donation alert for ${String(p.senderName)}${p.amount !== undefined ? ` (${String(p.amount)} ${String(p.currency || "")})` : ""}.`
          : "Re-triggered donation alert overlay.",
        category: "Channels",
        filterCategory: "CHANNELS",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotClass: "bg-purple-400",
        icon: <BroadcastIcon size={14} weight="bold" />,
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
  if (p.senderName) items.push({ label: "Donor Name", value: String(p.senderName) });
  if (p.amount !== undefined) {
    items.push({
      label: "Donation Amount",
      value: `${String(p.amount)} ${String(p.currency || "")}`.trim(),
    });
  }
  if (p.transactionId) items.push({ label: "Transaction ID", value: `#${String(p.transactionId)}` });
  const prevOwner = p.previousOwnerUserId || p.previousOwnerId;
  const nextOwner = p.newOwnerUserId || p.newOwnerId;
  if (prevOwner && nextOwner) {
    items.push({
      label: "Transfer Flow",
      value: `Member #${String(prevOwner)} → Member #${String(nextOwner)}`,
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

export interface AuditNarrativeContext {
  actor: { id: string; name: string | null; email: string; avatar: string | null };
  action: string;
  targetType: string;
  targetId: string | null;
  payload?: unknown;
  targetUser?: TinyUser | null;
  targetUserLoading?: boolean;
  targetStreamer?: TinyStreamer | null;
  targetStreamerLoading?: boolean;
}

export function renderAuditNarrative(ctx: AuditNarrativeContext): React.ReactNode {
  const {
    actor,
    action,
    targetType,
    targetId,
    payload,
    targetUser,
    targetUserLoading,
    targetStreamer,
    targetStreamerLoading,
  } = ctx;
  const p = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const isUserTarget = targetType === "MEMBER" || targetType === "USER";
  const rawTargetUserId =
    p.targetUserId ??
    p.newOwnerUserId ??
    p.newOwnerId ??
    p.removedUserId ??
    (isUserTarget ? targetId : null);
  const targetUserId = rawTargetUserId ? String(rawTargetUserId) : null;

  const targetFallbackName = String(
    p.email ||
    (targetUserId ? `User #${targetUserId}` : "member")
  );

  switch (action) {
    case "MEMBER_ROLE_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>assigned</span>
          <RoleMentionChip role={String(p.role || "MEMBER")} />
          <span>role</span>
          {p.streamerAssignmentsCount !== undefined && (
            <span className="text-muted-foreground">
              with <strong>{String(p.streamerAssignmentsCount)} channel{Number(p.streamerAssignmentsCount) === 1 ? "" : "s"}</strong>
            </span>
          )}
          <span>to</span>
          <UserMentionChip
            user={targetUser}
            userId={targetUserId}
            email={p.email ? String(p.email) : undefined}
            fallbackText={targetFallbackName}
            loading={targetUserLoading}
          />
        </span>
      );

    case "MEMBER_INVITED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>invited</span>
          <UserMentionChip email={String(p.email || "a member")} fallbackText={String(p.email || "a member")} />
          <span>with</span>
          <RoleMentionChip role={String(p.role || "MEMBER")} />
          <span>role</span>
        </span>
      );

    case "MEMBER_INVITE_REVOKED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>revoked invitation for</span>
          <UserMentionChip email={String(p.email || targetFallbackName)} fallbackText={String(p.email || targetFallbackName)} />
        </span>
      );

    case "MEMBER_REMOVED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>removed</span>
          <UserMentionChip
            user={targetUser}
            userId={targetUserId}
            email={p.email ? String(p.email) : undefined}
            fallbackText={targetFallbackName}
            loading={targetUserLoading}
          />
          <span>from the organization</span>
        </span>
      );

    case "MEMBER_JOINED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>accepted invitation and joined the organization</span>
        </span>
      );

    case "MEMBER_LEFT":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>voluntarily left the organization</span>
        </span>
      );

    case "ORGANIZATION_TRANSFERRED":
    case "OWNERSHIP_TRANSFERRED":
    case "OWNER_TRANSFERRED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>transferred organization ownership to</span>
          <UserMentionChip
            user={targetUser}
            userId={targetUserId}
            fallbackText={targetFallbackName}
            loading={targetUserLoading}
          />
        </span>
      );

    case "ORGANIZATION_DELETED":
    case "ORG_DELETED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>scheduled organization for deletion</span>
        </span>
      );

    case "ORG_SETTINGS_UPDATED":
    case "ORG_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>updated organization settings</span>
          {p.name ? (
            <>
              <span className="text-muted-foreground">and renamed organization to</span>
              <strong className="font-semibold text-foreground">&ldquo;{String(p.name)}&rdquo;</strong>
            </>
          ) : null}
        </span>
      );

    case "STREAMER_CREATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>created channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "STREAMER_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>updated channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "STREAMER_DELETED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>deleted channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TOKEN_ROTATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>rotated OBS browser source stream security token</span>
        </span>
      );

    case "INTEGRATION_CONNECTED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>connected</span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase">
            {p.platform ? String(p.platform).toUpperCase() : "PAYMENT"}
          </span>
          <span>gateway</span>
          <span className="text-muted-foreground">on channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "INTEGRATION_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>updated</span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase">
            {p.platform ? String(p.platform).toUpperCase() : "PAYMENT"}
          </span>
          <span>gateway settings</span>
          <span className="text-muted-foreground">on channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "INTEGRATION_DISCONNECTED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>disconnected</span>
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase">
            {p.platform ? String(p.platform).toUpperCase() : "PAYMENT"}
          </span>
          <span>gateway</span>
          <span className="text-muted-foreground">from channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TRANSACTION_DELETED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>soft-deleted transaction</span>
          {p.senderName ? (
            <span className="font-semibold text-foreground">
              from {String(p.senderName)}
              {p.amount !== undefined ? ` (${String(p.amount)} ${String(p.currency || "")})` : ""}
            </span>
          ) : null}
          <span className="text-muted-foreground">on channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TRANSACTION_RESTORED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>restored transaction</span>
          {p.senderName ? (
            <span className="font-semibold text-foreground">
              from {String(p.senderName)}
              {p.amount !== undefined ? ` (${String(p.amount)} ${String(p.currency || "")})` : ""}
            </span>
          ) : null}
          <span className="text-muted-foreground">on channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TRANSACTION_RESENT":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>replayed transaction alert</span>
          {p.senderName ? (
            <span className="font-semibold text-foreground">
              for {String(p.senderName)}
              {p.amount !== undefined ? ` (${String(p.amount)} ${String(p.currency || "")})` : ""}
            </span>
          ) : null}
          <span className="text-muted-foreground">on channel</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={String(p.name || (targetStreamer?.name ?? targetId) || "channel")}
            displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "WIDGET_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>updated AlertBox overlay configuration</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>performed {action.toLowerCase().replace(/_/g, " ")}</span>
          {targetType === "STREAMER" ? (
            <span className="text-muted-foreground">
              on channel{" "}
              <ChannelMentionChip
                streamer={targetStreamer}
                name={p.name ? String(p.name) : (targetStreamer?.name ?? targetId ?? "channel")}
                displayName={p.displayName ? String(p.displayName) : targetStreamer?.displayName}
                avatar={targetStreamer?.avatar}
                loading={targetStreamerLoading}
              />
            </span>
          ) : isUserTarget ? (
            <span className="text-muted-foreground">
              on member{" "}
              <UserMentionChip
                user={targetUser}
                userId={targetUserId}
                fallbackText={targetFallbackName}
                loading={targetUserLoading}
              />
            </span>
          ) : targetType === "ORGANIZATION" ? (
            <span className="text-muted-foreground">on organization</span>
          ) : targetType ? (
            <span className="text-muted-foreground">on {targetType.toLowerCase()}</span>
          ) : null}
        </span>
      );
  }
}

export function parseStreamerPermLabels(perms: unknown): string[] {
  if (Array.isArray(perms)) {
    return perms.map((p) => STREAMER_PERM_LABELS[String(p)] || String(p).replace(/^STREAMER_/, "").replace(/_/g, " "));
  }
  if (typeof perms === "number" || (typeof perms === "string" && /^\d+$/.test(perms))) {
    const num = Number(perms);
    const labels: string[] = [];
    for (const item of STREAMER_PERM_BITS) {
      if ((num & item.bit) === item.bit) {
        labels.push(item.label);
      }
    }
    return labels.length > 0 ? labels : ["Standard View"];
  }
  return [];
}

const ALL_ORG_PERMS = ORG_PERM_DEFINITIONS.flatMap((cat) => cat.perms);

export function decodeOrgPermissions(permBitmaskStr?: string | bigint): Array<{ key: string; name: string; bit: bigint }> {
  if (!permBitmaskStr) return [];
  try {
    const mask = BigInt(permBitmaskStr);
    return ALL_ORG_PERMS.filter((p) => (mask & p.bit) === p.bit);
  } catch {
    return [];
  }
}

export function AuditDetailBreakdown({
  action,
  payload,
  orgTarget,
}: {
  action: string;
  payload?: unknown;
  targetType?: string;
  targetId?: string | null;
  orgTarget?: string;
}) {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;

  const assignments: Array<{ streamerId: string; permissions?: unknown }> = Array.isArray(p.streamerAssignments)
    ? (p.streamerAssignments as Array<{ streamerId: string; permissions?: unknown }>)
    : [];
  const hasAssignments = assignments.length > 0;

  const hasRoleChange = Boolean(p.previousRole && p.role && p.previousRole !== p.role);
  const prevBits = p.previousPermissions ? BigInt(String(p.previousPermissions)) : null;
  const currBits = p.permissions ? BigInt(String(p.permissions)) : null;

  const addedPerms =
    prevBits !== null && currBits !== null
      ? ALL_ORG_PERMS.filter((perm) => (currBits & perm.bit) === perm.bit && (prevBits & perm.bit) === BigInt(0))
      : [];
  const removedPerms =
    prevBits !== null && currBits !== null
      ? ALL_ORG_PERMS.filter((perm) => (prevBits & perm.bit) === perm.bit && (currBits & perm.bit) === BigInt(0))
      : [];
  const hasPermDiff = addedPerms.length > 0 || removedPerms.length > 0;
  const staticPerms = !hasPermDiff && currBits !== null ? decodeOrgPermissions(currBits) : [];

  const changes =
    p.changes && typeof p.changes === "object"
      ? (p.changes as Record<string, { from?: unknown; to?: unknown }>)
      : null;
  const changedFields = Array.isArray(p.changedFields) ? (p.changedFields as string[]) : [];

  const prevOwnerId = p.previousOwnerUserId || p.previousOwnerId;
  const nextOwnerId = p.newOwnerUserId || p.newOwnerId || p.targetUserId;
  const isTransfer = Boolean(
    action === "ORGANIZATION_TRANSFERRED" ||
    action === "OWNERSHIP_TRANSFERRED" ||
    action === "OWNER_TRANSFERRED" ||
    (prevOwnerId && nextOwnerId)
  );

  const hasTxDetails = Boolean(p.transactionId || p.senderName || p.amount !== undefined);

  if (
    !hasAssignments &&
    !hasRoleChange &&
    !hasPermDiff &&
    !changes &&
    changedFields.length === 0 &&
    !isTransfer &&
    !hasTxDetails
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 text-xs">
      {(hasRoleChange || hasPermDiff || (action === "MEMBER_ROLE_UPDATED" && staticPerms.length > 0)) && (
        <div className="flex flex-col gap-2 py-3 border-t">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <ShieldIcon size={13} weight="bold" className="text-purple-400" />
            <span>Role & Permissions</span>
          </div>

          {hasRoleChange && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Role Transition:</span>
              <RoleMentionChip role={String(p.previousRole)} />
              <ArrowRightIcon size={12} className="text-muted-foreground" />
              <RoleMentionChip role={String(p.role)} />
            </div>
          )}

          {hasPermDiff && (
            <div className="flex flex-col gap-2">
              {addedPerms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-emerald-400">Granted:</span>
                  {addedPerms.map((perm) => (
                    <span
                      key={perm.key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400"
                    >
                      <CheckIcon size={10} weight="bold" />
                      {perm.name}
                    </span>
                  ))}
                </div>
              )}
              {removedPerms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-destructive">Revoked:</span>
                  {removedPerms.map((perm) => (
                    <span
                      key={perm.key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive"
                    >
                      <XIcon size={10} weight="bold" />
                      {perm.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {!hasPermDiff && staticPerms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Active Permissions:</span>
              {staticPerms.slice(0, 10).map((perm) => (
                <span
                  key={perm.key}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-foreground/80"
                >
                  {perm.name}
                </span>
              ))}
              {staticPerms.length > 10 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  +{staticPerms.length - 10} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {hasAssignments && (
        <div className="flex flex-col gap-2 py-3 border-t">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <BroadcastIcon size={13} weight="bold" className="text-sky-400" />
            <span>Assigned Channels & Permissions ({assignments.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {assignments.map((a, idx) => {
              const sId = String(a.streamerId);
              const perms = parseStreamerPermLabels(a.permissions);
              return (
                <div
                  key={sId || idx}
                  className="flex flex-col gap-2 p-2.5"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <StreamerMentionChip streamerId={sId} orgTarget={orgTarget} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {perms.map((label, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(changes || changedFields.length > 0) && (
        <div className="flex flex-col gap-2 py-3 border-t">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <SlidersIcon size={13} weight="bold" className="text-amber-400" />
            <span>Updated Properties</span>
          </div>

          {changes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
              {Object.entries(changes).map(([field, diff]) => {
                const label =
                  FIELD_FRIENDLY_NAMES[field] ||
                  field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                const fromVal = diff?.from;
                const toVal = diff?.to;

                return (
                  <div
                    key={field}
                    className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-card"
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {label}
                    </span>
                    {field === "accentColor" ? (
                      <div className="flex items-center gap-2">
                        {Boolean(fromVal) ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                            <span
                              className="size-3 rounded-full shrink-0"
                              style={{ backgroundColor: String(fromVal) }}
                            />
                            {String(fromVal)}
                          </span>
                        ) : null}
                        <ArrowRightIcon size={10} className="text-muted-foreground shrink-0" />
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground">
                          <span
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: String(toVal) }}
                          />
                          {String(toVal || "Default")}
                        </span>
                      </div>
                    ) : field === "avatar" || field === "banner" ? (
                      <span className="text-xs text-foreground/90 font-medium">New image uploaded & published</span>
                    ) : (
                      <div className="flex items-center gap-2 truncate text-xs">
                        <span className="line-through text-muted-foreground truncate max-w-35">
                          {String(fromVal || "(empty)")}
                        </span>
                        <ArrowRightIcon size={10} className="text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground truncate max-w-35">
                          {String(toVal || "(cleared)")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {changedFields.map((f: string) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-medium"
                >
                  {FIELD_FRIENDLY_NAMES[f] || f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {isTransfer && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-xs">
          <span className="text-amber-400 font-semibold uppercase text-[11px]">Ownership Transfer:</span>
          {prevOwnerId ? (
            <MemberMentionChip userId={String(prevOwnerId)} orgTarget={orgTarget} />
          ) : null}
          {prevOwnerId && nextOwnerId ? (
            <ArrowRightIcon size={12} className="text-muted-foreground shrink-0" />
          ) : null}
          {nextOwnerId ? (
            <MemberMentionChip userId={String(nextOwnerId)} orgTarget={orgTarget} />
          ) : null}
        </div>
      )}

      {hasTxDetails && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/60 text-xs">
          <span className="text-muted-foreground font-semibold uppercase text-[11px]">Transaction:</span>
          {p.transactionId ? <span className="font-mono text-muted-foreground">#{String(p.transactionId)}</span> : null}
          {p.senderName ? <span className="font-medium text-foreground">{String(p.senderName)}</span> : null}
          {p.amount !== undefined ? (
            <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {String(p.amount)} {String(p.currency || "")}
            </span>
          ) : null}
          {p.provider ? (
            <span className="text-[10px] uppercase font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
              {String(p.provider)}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function AuditExpandedRowContent({
  actor,
  action,
  targetType,
  targetId,
  payload,
  createdAt,
  ipAddress,
  targetUser,
  targetUserLoading,
  targetStreamer,
  targetStreamerLoading,
  orgTarget,
}: {
  actor: { id: string; name: string | null; email: string; avatar: string | null };
  action: string;
  targetType: string;
  targetId: string | null;
  payload?: unknown;
  createdAt: string;
  ipAddress?: string;
  targetUser?: TinyUser | null;
  targetUserLoading?: boolean;
  targetStreamer?: TinyStreamer | null;
  targetStreamerLoading?: boolean;
  orgTarget?: string;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-xl flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-foreground/90 leading-relaxed font-normal">
          {renderAuditNarrative({
            actor,
            action,
            targetType,
            targetId,
            payload,
            targetUser,
            targetUserLoading,
            targetStreamer,
            targetStreamerLoading,
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap self-end sm:self-auto shrink-0 font-sans">
          <span>{new Date(createdAt).toLocaleString()} · {formatRelativeTime(createdAt)}</span>
          {ipAddress && (
            <>
              <span>·</span>
              <span className="font-mono text-[11px] bg-secondary/60 px-1.5 py-0.5 rounded text-muted-foreground/80">
                {ipAddress}
              </span>
            </>
          )}
        </div>
      </div>

      <AuditDetailBreakdown
        action={action}
        payload={payload}
        targetType={targetType}
        targetId={targetId}
        orgTarget={orgTarget}
      />
    </div>
  );
}
