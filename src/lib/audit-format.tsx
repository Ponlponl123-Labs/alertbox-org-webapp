"use client";
import React, { useMemo, useState } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import lang, { formatCount, formatI18n } from "@/lib/i18n";
import { formatMoneyMinorUnits, getCachedDateFormat } from "@/lib/formatters";
import { safeParseBigInt } from "@/lib/security";
import type { LanguageData, LanguageKey } from "@/types";
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
  CaretRightIcon,
} from "@phosphor-icons/react";
import { getOrgPermDefinitions, getRoleLabel } from "@/consts/org";
import {
  type AuditCategory,
  AUDIT_ACTION_CATEGORY_MAP,
  getFieldFriendlyNames,
  getStreamerPermBits,
  getStreamerPermLabels,
} from "@/consts/audit";

export interface AuditActionInfo {
  title: string;
  description: string;
  category:
    | "Ownership"
    | "Members"
    | "Channels"
    | "Security"
    | "Integrations"
    | "Organization"
    | "Other";
  categoryLabel: string;
  filterCategory: AuditCategory;
  badgeClass: string;
  dotClass: string;
  icon: React.ReactNode;
}

const DEFAULT_LANG = lang("en-US").data;

export function formatTableDate(
  dateString: string,
  locale: LanguageKey = "en-US",
): string {
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return getCachedDateFormat(locale, { month: "short", day: "numeric" }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDonationAmount(
  amount: unknown,
  currency?: unknown,
  locale: LanguageKey = "en-US",
): string {
  return formatMoneyMinorUnits(amount, currency, locale);
}

export function formatRelativeTime(
  dateString: string,
  locale: LanguageKey = "en-US",
  langData: LanguageData = DEFAULT_LANG,
): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const rt = langData.audit.relative_time;

    if (diffSec < 45) return rt.just_now;
    if (diffMin < 60) return formatI18n(rt.minutes_ago, { count: diffMin });
    if (diffHour < 24) return formatI18n(rt.hours_ago, { count: diffHour });
    if (diffDay === 1) {
      const time = getCachedDateFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
      return formatI18n(rt.yesterday_at, { time });
    }
    if (diffDay < 7) return formatI18n(rt.days_ago, { count: diffDay });

    const sameYear = date.getFullYear() === new Date().getFullYear();
    return getCachedDateFormat(locale, {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    }).format(date);
  } catch {
    return dateString;
  }
}

export function isAuditActionInCategory(action: string, category: AuditCategory): boolean {
  if (category === "ALL") return true;
  const categories = AUDIT_ACTION_CATEGORY_MAP[action];
  if (categories) return categories.includes(category);

  const upper = action.toUpperCase();
  if (category === "SECURITY") {
    return (
      upper.includes("OWNER") ||
      upper.includes("TRANSFERRED") ||
      upper.includes("SECURITY") ||
      upper.includes("TOKEN")
    );
  }
  if (category === "MEMBERS") return upper.startsWith("MEMBER_");
  if (category === "CHANNELS") {
    return (
      upper.startsWith("STREAMER_") ||
      upper.startsWith("WIDGET_") ||
      upper.startsWith("INTEGRATION_") ||
      upper.startsWith("TRANSACTION_")
    );
  }
  if (category === "SETTINGS") return upper.startsWith("ORG_");
  return true;
}

export function humanizeAuditAction(
  action: string,
  payload?: unknown,
  langData: LanguageData = DEFAULT_LANG,
  locale: LanguageKey = "en-US",
): AuditActionInfo {
  const p = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const a = langData.audit.actions;
  const c = langData.audit.categories;

  switch (action) {
    case "ORGANIZATION_TRANSFERRED":
    case "OWNERSHIP_TRANSFERRED":
    case "OWNER_TRANSFERRED":
      return {
        title: a.transferred_ownership.title,
        description: a.transferred_ownership.desc,
        category: "Ownership",
        categoryLabel: c.ownership,
        filterCategory: "SECURITY",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400",
        icon: <CrownIcon size={14} weight="bold" />,
      };

    case "ORGANIZATION_DELETED":
    case "ORG_DELETED":
      return {
        title: a.org_deleted.title,
        description: a.org_deleted.desc,
        category: "Security",
        categoryLabel: c.security,
        filterCategory: "SECURITY",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <TrashIcon size={14} weight="bold" />,
      };

    case "MEMBER_LEFT":
      return {
        title: a.member_left.title,
        description: a.member_left.desc,
        category: "Members",
        categoryLabel: c.members,
        filterCategory: "MEMBERS",
        badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
        dotClass: "bg-zinc-400",
        icon: <UserMinusIcon size={14} weight="bold" />,
      };

    case "ORG_SETTINGS_UPDATED":
    case "ORG_UPDATED":
      return {
        title: a.org_settings_updated.title,
        description: p.name
          ? formatI18n(a.org_settings_updated.desc_renamed, { name: String(p.name) })
          : a.org_settings_updated.desc_default,
        category: "Organization",
        categoryLabel: c.organization,
        filterCategory: "SETTINGS",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dotClass: "bg-blue-400",
        icon: <GearSixIcon size={14} weight="bold" />,
      };

    case "MEMBER_INVITED":
      return {
        title: a.member_invited.title,
        description: p.email
          ? formatI18n(a.member_invited.desc_with_email, {
              email: String(p.email),
              role: getRoleLabel(String(p.role || "MEMBER"), langData),
            })
          : a.member_invited.desc_default,
        category: "Members",
        categoryLabel: c.members,
        filterCategory: "MEMBERS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <UserPlusIcon size={14} weight="bold" />,
      };

    case "MEMBER_INVITE_REVOKED":
      return {
        title: a.member_invite_revoked.title,
        description: p.email
          ? formatI18n(a.member_invite_revoked.desc_with_email, { email: String(p.email) })
          : a.member_invite_revoked.desc_default,
        category: "Members",
        categoryLabel: c.members,
        filterCategory: "MEMBERS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <UserMinusIcon size={14} weight="bold" />,
      };

    case "MEMBER_ROLE_UPDATED": {
      const channelsSuffix = p.streamerAssignmentsCount
        ? formatI18n(a.member_role_updated.with_channels, {
            count: String(p.streamerAssignmentsCount),
          })
        : "";
      return {
        title: a.member_role_updated.title,
        description: p.role
          ? formatI18n(a.member_role_updated.desc_with_role, {
              role: getRoleLabel(String(p.role), langData),
              channelsSuffix,
            })
          : a.member_role_updated.desc_default,
        category: "Members",
        categoryLabel: c.members,
        filterCategory: "MEMBERS",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotClass: "bg-purple-400",
        icon: <UserGearIcon size={14} weight="bold" />,
      };
    }

    case "MEMBER_REMOVED":
      return {
        title: a.member_removed.title,
        description: p.email
          ? formatI18n(a.member_removed.desc_with_email, { email: String(p.email) })
          : a.member_removed.desc_default,
        category: "Members",
        categoryLabel: c.members,
        filterCategory: "MEMBERS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <UserMinusIcon size={14} weight="bold" />,
      };

    case "MEMBER_JOINED":
      return {
        title: a.member_joined.title,
        description: a.member_joined.desc,
        category: "Members",
        categoryLabel: c.members,
        filterCategory: "MEMBERS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <UserCheckIcon size={14} weight="bold" />,
      };

    case "STREAMER_CREATED": {
      const displayNameSuffix = p.displayName ? ` (${String(p.displayName)})` : "";
      return {
        title: a.streamer_created.title,
        description: p.name
          ? formatI18n(a.streamer_created.desc_with_name, {
              name: String(p.name),
              displayNameSuffix,
            })
          : a.streamer_created.desc_default,
        category: "Channels",
        categoryLabel: c.channels,
        filterCategory: "CHANNELS",
        badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        dotClass: "bg-cyan-400",
        icon: <BroadcastIcon size={14} weight="bold" />,
      };
    }

    case "STREAMER_UPDATED":
      return {
        title: a.streamer_updated.title,
        description: p.name
          ? formatI18n(a.streamer_updated.desc_with_name, { name: String(p.name) })
          : a.streamer_updated.desc_default,
        category: "Channels",
        categoryLabel: c.channels,
        filterCategory: "CHANNELS",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400",
        icon: <SlidersIcon size={14} weight="bold" />,
      };

    case "STREAMER_DELETED":
      return {
        title: a.streamer_deleted.title,
        description: p.name
          ? formatI18n(a.streamer_deleted.desc_with_name, { name: String(p.name) })
          : a.streamer_deleted.desc_default,
        category: "Channels",
        categoryLabel: c.channels,
        filterCategory: "CHANNELS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <TrashIcon size={14} weight="bold" />,
      };

    case "TOKEN_ROTATED":
      return {
        title: a.token_rotated.title,
        description: a.token_rotated.desc,
        category: "Security",
        categoryLabel: c.security,
        filterCategory: "SECURITY",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotClass: "bg-purple-400",
        icon: <KeyIcon size={14} weight="bold" />,
      };

    case "INTEGRATION_CONNECTED":
      return {
        title: a.integration_connected.title,
        description: p.platform
          ? formatI18n(a.integration_connected.desc_with_platform, {
              platform: String(p.platform).toUpperCase(),
            })
          : a.integration_connected.desc_default,
        category: "Integrations",
        categoryLabel: c.integrations,
        filterCategory: "CHANNELS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <PlugsConnectedIcon size={14} weight="bold" />,
      };

    case "INTEGRATION_DISCONNECTED":
      return {
        title: a.integration_disconnected.title,
        description: p.platform
          ? formatI18n(a.integration_disconnected.desc_with_platform, {
              platform: String(p.platform).toUpperCase(),
            })
          : a.integration_disconnected.desc_default,
        category: "Integrations",
        categoryLabel: c.integrations,
        filterCategory: "CHANNELS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <PlugIcon size={14} weight="bold" />,
      };

    case "INTEGRATION_UPDATED":
      return {
        title: a.integration_updated.title,
        description: p.platform
          ? formatI18n(a.integration_updated.desc_with_platform, {
              platform: String(p.platform).toUpperCase(),
            })
          : a.integration_updated.desc_default,
        category: "Integrations",
        categoryLabel: c.integrations,
        filterCategory: "CHANNELS",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dotClass: "bg-blue-400",
        icon: <SlidersIcon size={14} weight="bold" />,
      };

    case "TRANSACTION_DELETED": {
      const amountSuffix =
        p.amount !== undefined
          ? ` (${formatDonationAmount(p.amount, p.currency, locale)})`
          : "";
      return {
        title: a.transaction_deleted.title,
        description: p.senderName
          ? formatI18n(a.transaction_deleted.desc_with_sender, {
              sender: String(p.senderName),
              amountSuffix,
            })
          : a.transaction_deleted.desc_default,
        category: "Channels",
        categoryLabel: c.channels,
        filterCategory: "CHANNELS",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        dotClass: "bg-rose-500",
        icon: <TrashIcon size={14} weight="bold" />,
      };
    }

    case "TRANSACTION_RESTORED": {
      const amountSuffix =
        p.amount !== undefined
          ? ` (${formatDonationAmount(p.amount, p.currency, locale)})`
          : "";
      return {
        title: a.transaction_restored.title,
        description: p.senderName
          ? formatI18n(a.transaction_restored.desc_with_sender, {
              sender: String(p.senderName),
              amountSuffix,
            })
          : a.transaction_restored.desc_default,
        category: "Channels",
        categoryLabel: c.channels,
        filterCategory: "CHANNELS",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        icon: <BroadcastIcon size={14} weight="bold" />,
      };
    }

    case "TRANSACTION_RESENT": {
      const amountSuffix =
        p.amount !== undefined
          ? ` (${formatDonationAmount(p.amount, p.currency, locale)})`
          : "";
      return {
        title: a.transaction_resent.title,
        description: p.senderName
          ? formatI18n(a.transaction_resent.desc_with_sender, {
              sender: String(p.senderName),
              amountSuffix,
            })
          : a.transaction_resent.desc_default,
        category: "Channels",
        categoryLabel: c.channels,
        filterCategory: "CHANNELS",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dotClass: "bg-purple-400",
        icon: <BroadcastIcon size={14} weight="bold" />,
      };
    }

    case "WIDGET_UPDATED":
      return {
        title: a.widget_updated.title,
        description: a.widget_updated.desc,
        category: "Channels",
        categoryLabel: c.channels,
        filterCategory: "CHANNELS",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dotClass: "bg-blue-400",
        icon: <BrowsersIcon size={14} weight="bold" />,
      };

    default:
      return {
        title: action
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (ch) => ch.toUpperCase()),
        description: a.fallback_desc,
        category: "Other",
        categoryLabel: c.other,
        filterCategory: "SETTINGS",
        badgeClass: "bg-secondary text-muted-foreground border-border",
        dotClass: "bg-zinc-400",
        icon: <InfoIcon size={14} weight="bold" />,
      };
  }
}

export function formatPayloadSummary(
  _action: string,
  payload: unknown,
  langData: LanguageData = DEFAULT_LANG,
  locale: LanguageKey = "en-US",
): Array<{ label: string; value: string }> {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const sl = langData.audit.summary_labels;
  const items: Array<{ label: string; value: string }> = [];

  if (p.email) items.push({ label: sl.target_email, value: String(p.email) });
  if (p.role) items.push({ label: sl.assigned_role, value: getRoleLabel(String(p.role), langData) });
  if (p.streamerAssignmentsCount !== undefined) {
    items.push({
      label: sl.channel_delegations,
      value: formatI18n(sl.channels_assigned, { count: String(p.streamerAssignmentsCount) }),
    });
  }
  if (p.name) items.push({ label: sl.channel_handle, value: `@${String(p.name)}` });
  if (p.displayName) items.push({ label: sl.display_name, value: String(p.displayName) });
  if (p.platform) items.push({ label: sl.gateway_provider, value: String(p.platform).toUpperCase() });
  if (p.targetUserId) items.push({ label: sl.target_user_id, value: `#${String(p.targetUserId)}` });
  if (p.senderName) items.push({ label: sl.donor_name, value: String(p.senderName) });
  if (p.amount !== undefined) {
    items.push({
      label: sl.donation_amount,
      value: formatDonationAmount(p.amount, p.currency, locale),
    });
  }
  if (p.transactionId) items.push({ label: sl.transaction_id, value: `#${String(p.transactionId)}` });
  const prevOwner = p.previousOwnerUserId || p.previousOwnerId;
  const nextOwner = p.newOwnerUserId || p.newOwnerId;
  if (prevOwner && nextOwner) {
    items.push({
      label: sl.transfer_flow,
      value: formatI18n(sl.transfer_flow_value, {
        prev: String(prevOwner),
        next: String(nextOwner),
      }),
    });
  }

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
  langData?: LanguageData;
  locale?: LanguageKey;
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
    langData = DEFAULT_LANG,
    locale = "en-US",
  } = ctx;
  const n = langData.audit.narrative;
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
      (targetUserId
        ? formatI18n(n.user_fallback_id, { id: targetUserId })
        : n.member_fallback),
  );
  const channelName = String(p.name || (targetStreamer?.name ?? targetId) || n.channel_fallback);
  const channelDisplayName = p.displayName ? String(p.displayName) : targetStreamer?.displayName;

  switch (action) {
    case "MEMBER_ROLE_UPDATED": {
      const chCount = Number(p.streamerAssignmentsCount);
      const chLabel = formatI18n(
        formatCount(n.channel_count_one, n.channel_count_other, chCount),
        { count: String(p.streamerAssignmentsCount) },
      );
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.assigned_verb}</span>
          <RoleMentionChip role={String(p.role || "MEMBER")} />
          <span>{n.role_noun}</span>
          {p.streamerAssignmentsCount !== undefined && (
            <span className="text-muted-foreground">
              {n.with_word} <strong>{chLabel}</strong>
            </span>
          )}
          <span>{n.to_word}</span>
          <UserMentionChip
            user={targetUser}
            userId={targetUserId}
            email={p.email ? String(p.email) : undefined}
            fallbackText={targetFallbackName}
            loading={targetUserLoading}
          />
        </span>
      );
    }

    case "MEMBER_INVITED": {
      const invitedEmail = String(p.email || n.a_member_fallback);
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.invited_verb}</span>
          <UserMentionChip email={invitedEmail} fallbackText={invitedEmail} />
          <span>{n.with_word}</span>
          <RoleMentionChip role={String(p.role || "MEMBER")} />
          <span>{n.role_noun}</span>
        </span>
      );
    }

    case "MEMBER_INVITE_REVOKED": {
      const revokedEmail = String(p.email || targetFallbackName);
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.revoked_invite}</span>
          <UserMentionChip email={revokedEmail} fallbackText={revokedEmail} />
        </span>
      );
    }

    case "MEMBER_REMOVED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.removed_verb}</span>
          <UserMentionChip
            user={targetUser}
            userId={targetUserId}
            email={p.email ? String(p.email) : undefined}
            fallbackText={targetFallbackName}
            loading={targetUserLoading}
          />
          <span>{n.from_org}</span>
        </span>
      );

    case "MEMBER_JOINED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.joined_org}</span>
        </span>
      );

    case "MEMBER_LEFT":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.left_org}</span>
        </span>
      );

    case "ORGANIZATION_TRANSFERRED":
    case "OWNERSHIP_TRANSFERRED":
    case "OWNER_TRANSFERRED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.transferred_ownership}</span>
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
          <span>{n.scheduled_deletion}</span>
        </span>
      );

    case "ORG_SETTINGS_UPDATED":
    case "ORG_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.updated_org_settings}</span>
          {p.name ? (
            <>
              <span className="text-muted-foreground">{n.renamed_org_to}</span>
              <strong className="font-semibold text-foreground">&ldquo;{String(p.name)}&rdquo;</strong>
            </>
          ) : null}
        </span>
      );

    case "STREAMER_CREATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.created_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "STREAMER_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.updated_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "STREAMER_DELETED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.deleted_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TOKEN_ROTATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.rotated_token}</span>
        </span>
      );

    case "INTEGRATION_CONNECTED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.connected_verb}</span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase">
            {p.platform ? String(p.platform).toUpperCase() : n.payment_fallback}
          </span>
          <span>{n.gateway_noun}</span>
          <span className="text-muted-foreground">{n.on_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "INTEGRATION_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.updated_verb}</span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase">
            {p.platform ? String(p.platform).toUpperCase() : n.payment_fallback}
          </span>
          <span>{n.gateway_settings_noun}</span>
          <span className="text-muted-foreground">{n.on_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "INTEGRATION_DISCONNECTED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.disconnected_verb}</span>
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase">
            {p.platform ? String(p.platform).toUpperCase() : n.payment_fallback}
          </span>
          <span>{n.gateway_noun}</span>
          <span className="text-muted-foreground">{n.from_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TRANSACTION_DELETED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.deleted_tx}</span>
          {p.senderName ? (
            <span className="font-semibold text-foreground">
              {formatI18n(n.from_sender, { sender: String(p.senderName) })}
              {p.amount !== undefined
                ? ` (${formatDonationAmount(p.amount, p.currency, locale)})`
                : ""}
            </span>
          ) : null}
          <span className="text-muted-foreground">{n.on_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TRANSACTION_RESTORED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.restored_tx}</span>
          {p.senderName ? (
            <span className="font-semibold text-foreground">
              {formatI18n(n.from_sender, { sender: String(p.senderName) })}
              {p.amount !== undefined
                ? ` (${formatDonationAmount(p.amount, p.currency, locale)})`
                : ""}
            </span>
          ) : null}
          <span className="text-muted-foreground">{n.on_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "TRANSACTION_RESENT":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.replayed_tx}</span>
          {p.senderName ? (
            <span className="font-semibold text-foreground">
              {formatI18n(n.for_sender, { sender: String(p.senderName) })}
              {p.amount !== undefined
                ? ` (${formatDonationAmount(p.amount, p.currency, locale)})`
                : ""}
            </span>
          ) : null}
          <span className="text-muted-foreground">{n.on_channel}</span>
          <ChannelMentionChip
            streamer={targetStreamer}
            name={channelName}
            displayName={channelDisplayName}
            avatar={targetStreamer?.avatar}
            loading={targetStreamerLoading}
          />
        </span>
      );

    case "WIDGET_UPDATED":
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{n.updated_widget}</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
          <UserMentionChip user={actor} />
          <span>{formatI18n(n.performed_action, { action: action.toLowerCase().replace(/_/g, " ") })}</span>
          {targetType === "STREAMER" ? (
            <span className="text-muted-foreground">
              {n.on_channel_word}{" "}
              <ChannelMentionChip
                streamer={targetStreamer}
                name={p.name ? String(p.name) : (targetStreamer?.name ?? targetId ?? n.channel_fallback)}
                displayName={channelDisplayName}
                avatar={targetStreamer?.avatar}
                loading={targetStreamerLoading}
              />
            </span>
          ) : isUserTarget ? (
            <span className="text-muted-foreground">
              {n.on_member_word}{" "}
              <UserMentionChip
                user={targetUser}
                userId={targetUserId}
                fallbackText={targetFallbackName}
                loading={targetUserLoading}
              />
            </span>
          ) : targetType === "ORGANIZATION" ? (
            <span className="text-muted-foreground">{n.on_organization}</span>
          ) : targetType ? (
            <span className="text-muted-foreground">
              {formatI18n(n.on_target, { target: targetType.toLowerCase() })}
            </span>
          ) : null}
        </span>
      );
  }
}

export function parseStreamerPermLabels(
  perms: unknown,
  langData: LanguageData = DEFAULT_LANG,
): string[] {
  const permLabels = getStreamerPermLabels(langData);
  const permBits = getStreamerPermBits(langData);
  if (Array.isArray(perms)) {
    return perms.map(
      (p) =>
        permLabels[String(p)] || String(p).replace(/^STREAMER_/, "").replace(/_/g, " "),
    );
  }
  if (typeof perms === "number" || (typeof perms === "string" && /^\d+$/.test(perms))) {
    const num = Number(perms);
    const labels: string[] = [];
    for (const item of permBits) {
      if ((num & item.bit) === item.bit) {
        labels.push(item.label);
      }
    }
    return labels.length > 0 ? labels : [langData.audit.breakdown.standard_view];
  }
  return [];
}

export function decodeOrgPermissions(
  permBitmaskStr?: string | bigint,
  langData: LanguageData = DEFAULT_LANG,
): Array<{ key: string; name: string; bit: bigint }> {
  if (!permBitmaskStr) return [];
  try {
    const allOrgPerms = getOrgPermDefinitions(langData).flatMap((cat) => cat.perms);
    const mask = BigInt(permBitmaskStr);
    return allOrgPerms.filter((p) => (mask & p.bit) === p.bit);
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
  const activeLang = useStore(coreStore, (s) => s.lang);
  const b = activeLang.data.audit.breakdown;
  const fieldNames = useMemo(() => getFieldFriendlyNames(activeLang.data), [activeLang.data]);
  const allOrgPerms = useMemo(
    () => getOrgPermDefinitions(activeLang.data).flatMap((cat) => cat.perms),
    [activeLang.data],
  );

  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;

  const assignments: Array<{ streamerId: string; permissions?: unknown }> = Array.isArray(
    p.streamerAssignments,
  )
    ? (p.streamerAssignments as Array<{ streamerId: string; permissions?: unknown }>)
    : [];
  const hasAssignments = assignments.length > 0;

  const hasRoleChange = Boolean(p.previousRole && p.role && p.previousRole !== p.role);
  const prevBits = p.previousPermissions
    ? safeParseBigInt(String(p.previousPermissions), BigInt(-1))
    : null;
  const currBits = p.permissions ? safeParseBigInt(String(p.permissions), BigInt(-1)) : null;
  const validPrevBits = prevBits !== null && prevBits >= BigInt(0) ? prevBits : null;
  const validCurrBits = currBits !== null && currBits >= BigInt(0) ? currBits : null;

  const addedPerms =
    validPrevBits !== null && validCurrBits !== null
      ? allOrgPerms.filter(
          (perm) => (validCurrBits & perm.bit) === perm.bit && (validPrevBits & perm.bit) === BigInt(0),
        )
      : [];
  const removedPerms =
    validPrevBits !== null && validCurrBits !== null
      ? allOrgPerms.filter(
          (perm) => (validPrevBits & perm.bit) === perm.bit && (validCurrBits & perm.bit) === BigInt(0),
        )
      : [];
  const hasPermDiff = addedPerms.length > 0 || removedPerms.length > 0;
  const staticPerms =
    !hasPermDiff && validCurrBits !== null
      ? decodeOrgPermissions(validCurrBits, activeLang.data)
      : [];

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
      (prevOwnerId && nextOwnerId),
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
      {(hasRoleChange ||
        hasPermDiff ||
        (action === "MEMBER_ROLE_UPDATED" && staticPerms.length > 0)) && (
        <div className="flex flex-col gap-2 py-3 border-t">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <ShieldIcon size={13} weight="bold" className="text-purple-400" />
            <span>{b.role_and_perms}</span>
          </div>

          {hasRoleChange && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">{b.role_transition}</span>
              <RoleMentionChip role={String(p.previousRole)} />
              <ArrowRightIcon size={12} className="text-muted-foreground" />
              <RoleMentionChip role={String(p.role)} />
            </div>
          )}

          {hasPermDiff && (
            <div className="flex flex-col gap-2">
              {addedPerms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-emerald-400">{b.granted}</span>
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
                  <span className="text-[11px] font-medium text-destructive">{b.revoked}</span>
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
              <span className="text-[11px] font-medium text-muted-foreground">{b.active_perms}</span>
              {staticPerms.slice(0, 10).map((perm) => (
                <span
                  key={perm.key}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-foreground/80"
                >
                  {perm.name}
                </span>
              ))}
              {staticPerms.length > 10 && (
                <span className="text-[10px] text-muted-foreground font-sans tabular-nums">
                  {formatI18n(b.more_count, { count: staticPerms.length - 10 })}
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
            <span>{formatI18n(b.assigned_channels, { count: assignments.length })}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {assignments.map((a, idx) => {
              const sId = String(a.streamerId);
              const perms = parseStreamerPermLabels(a.permissions, activeLang.data);
              return (
                <div key={sId || idx} className="flex flex-col gap-2 p-2.5">
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
            <span>{b.updated_properties}</span>
          </div>

          {changes ? (
            <div className="rounded-lg border border-border/40 overflow-hidden bg-background/50">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-sans uppercase tracking-wider text-muted-foreground/60 bg-muted/15">
                    <th className="py-1.5 px-3 font-medium">{b.property}</th>
                    <th className="py-1.5 px-3 font-medium">{b.previous}</th>
                    <th className="py-1.5 px-3 font-medium">{b.updated}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25 text-[11px]">
                  {Object.entries(changes).map(([field, diff]) => {
                    const label =
                      fieldNames[field] ||
                      field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                    const fromVal = diff?.from;
                    const toVal = diff?.to;

                    return (
                      <tr key={field} className="hover:bg-muted/10 transition-colors">
                        <td className="py-1.5 px-3 text-muted-foreground font-sans text-xs">
                          {label}
                        </td>
                        <td className="py-1.5 px-3 text-muted-foreground/60 line-through">
                          {String(fromVal ?? "—")}
                        </td>
                        <td className="py-1.5 px-3 text-foreground">
                          {field === "accentColor" && toVal ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="size-2.5 rounded-full shrink-0 border border-white/20"
                                style={{ backgroundColor: String(toVal) }}
                              />
                              {String(toVal)}
                            </span>
                          ) : (
                            String(toVal ?? "—")
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {changedFields.map((f: string) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-medium"
                >
                  {fieldNames[f] || f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {isTransfer && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-xs">
          <span className="text-amber-400 font-semibold uppercase text-[11px]">
            {b.ownership_transfer}
          </span>
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
          <span className="text-muted-foreground font-semibold uppercase text-[11px]">
            {b.transaction}
          </span>
          {p.transactionId ? (
            <span className="font-sans tabular-nums text-muted-foreground">
              #{String(p.transactionId)}
            </span>
          ) : null}
          {p.senderName ? (
            <span className="font-medium text-foreground">{String(p.senderName)}</span>
          ) : null}
          {p.amount !== undefined ? (
            <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans tabular-nums">
              {formatDonationAmount(p.amount, p.currency, activeLang.key)}
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
  const activeLang = useStore(coreStore, (s) => s.lang);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const hasPayload =
    payload !== undefined &&
    payload !== null &&
    (typeof payload !== "object" || Object.keys(payload as object).length > 0);

  const serializedPayload = useMemo(
    () => (hasPayload ? JSON.stringify(payload, null, 2) : ""),
    [hasPayload, payload],
  );

  return (
    <div onClick={(e) => e.stopPropagation()} className="py-1 flex flex-col gap-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="text-xs text-foreground/90 font-normal leading-relaxed">
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
            langData: activeLang.data,
            locale: activeLang.key,
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-sans tabular-nums text-muted-foreground/60 shrink-0 select-text">
          <span>{new Date(createdAt).toLocaleString(activeLang.key)}</span>
          {ipAddress && (
            <>
              <span>·</span>
              <span>{ipAddress}</span>
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

      {hasPayload && (
        <details className="group/raw text-xs pt-1">
          <summary className="cursor-pointer text-[11px] font-sans text-muted-foreground/70 hover:text-foreground inline-flex items-center gap-1 select-none py-0.5 transition-colors">
            <CaretRightIcon size={10} className="transition-transform group-open/raw:rotate-90" />
            <span>{activeLang.data.audit.breakdown.payload}</span>
          </summary>
          <div className="relative mt-2 p-3 rounded-md bg-muted/20 border border-border/40 font-mono text-[11px] text-foreground/80 overflow-x-auto max-h-48 scrollbar-thin select-all">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(serializedPayload);
                  setCopiedRaw(true);
                  setTimeout(() => setCopiedRaw(false), 1500);
                } catch {}
              }}
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 border border-border/40 transition-colors cursor-pointer"
            >
              {copiedRaw ? activeLang.data.common.copied : activeLang.data.common.copy}
            </button>
            <pre className="leading-relaxed">{serializedPayload}</pre>
          </div>
        </details>
      )}
    </div>
  );
}
