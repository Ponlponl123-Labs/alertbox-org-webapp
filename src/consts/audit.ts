import lang from "@/lib/i18n";
import type { LanguageData } from "@/types";

export type AuditCategory = "ALL" | "MEMBERS" | "CHANNELS" | "SETTINGS" | "SECURITY";

export interface AuditCategoryTab {
  id: AuditCategory;
  label: string;
}

export function getAuditCategoryTabs(
  langData: LanguageData = lang("en-US").data,
): AuditCategoryTab[] {
  return [
    { id: "ALL", label: langData.audit.categories.all },
    { id: "MEMBERS", label: langData.audit.categories.members },
    { id: "CHANNELS", label: langData.audit.categories.channels },
    { id: "SETTINGS", label: langData.audit.categories.settings },
    { id: "SECURITY", label: langData.audit.categories.security },
  ];
}

export const AUDIT_CATEGORY_TABS: AuditCategoryTab[] = getAuditCategoryTabs();

export const DEFAULT_AUDIT_PAGE_SIZE = 10;

export const AUDIT_ACTION_CATEGORY_MAP: Record<string, readonly AuditCategory[]> = {
  ORGANIZATION_TRANSFERRED: ["SECURITY", "MEMBERS", "SETTINGS"],
  OWNERSHIP_TRANSFERRED: ["SECURITY", "MEMBERS", "SETTINGS"],
  OWNER_TRANSFERRED: ["SECURITY", "MEMBERS", "SETTINGS"],
  ORGANIZATION_DELETED: ["SECURITY", "SETTINGS"],
  ORG_DELETED: ["SECURITY", "SETTINGS"],
  ORG_SETTINGS_UPDATED: ["SETTINGS"],
  ORG_UPDATED: ["SETTINGS"],
  MEMBER_INVITED: ["MEMBERS"],
  MEMBER_INVITE_REVOKED: ["MEMBERS"],
  MEMBER_ROLE_UPDATED: ["MEMBERS"],
  MEMBER_REMOVED: ["SECURITY", "MEMBERS"],
  MEMBER_JOINED: ["MEMBERS"],
  MEMBER_LEFT: ["SECURITY", "MEMBERS"],
  STREAMER_CREATED: ["CHANNELS"],
  STREAMER_UPDATED: ["CHANNELS"],
  STREAMER_DELETED: ["CHANNELS"],
  TOKEN_ROTATED: ["SECURITY", "CHANNELS"],
  INTEGRATION_CONNECTED: ["CHANNELS"],
  INTEGRATION_DISCONNECTED: ["CHANNELS"],
  INTEGRATION_UPDATED: ["CHANNELS"],
  WIDGET_UPDATED: ["CHANNELS"],
  TRANSACTION_DELETED: ["CHANNELS"],
  TRANSACTION_RESTORED: ["CHANNELS"],
  TRANSACTION_RESENT: ["CHANNELS"],
};

export function getFieldFriendlyNames(
  langData: LanguageData = lang("en-US").data,
): Record<string, string> {
  return { ...langData.audit.fields };
}

export const FIELD_FRIENDLY_NAMES: Record<string, string> = getFieldFriendlyNames();

export function getStreamerPermLabels(
  langData: LanguageData = lang("en-US").data,
): Record<string, string> {
  const s = langData.permissions.streamer;
  return {
    STREAMER_VIEW: s.STREAMER_VIEW.short,
    STREAMER_MANAGE: s.STREAMER_MANAGE.short,
    STREAMER_WIDGET_MANAGE: s.STREAMER_WIDGET_MANAGE.short,
    STREAMER_INTEGRATION_MANAGE: s.STREAMER_INTEGRATION_MANAGE.short,
    STREAMER_ANALYTICS_VIEW: s.STREAMER_ANALYTICS_VIEW.short,
    STREAMER_TRANSACTION_VIEW: s.STREAMER_TRANSACTION_VIEW.short,
  };
}

export const STREAMER_PERM_LABELS: Record<string, string> = getStreamerPermLabels();

export function getStreamerPermBits(
  langData: LanguageData = lang("en-US").data,
): Array<{ bit: number; key: string; label: string }> {
  const labels = getStreamerPermLabels(langData);
  return [
    { bit: 1 << 0, key: "STREAMER_VIEW", label: labels.STREAMER_VIEW },
    { bit: 1 << 1, key: "STREAMER_MANAGE", label: labels.STREAMER_MANAGE },
    { bit: 1 << 2, key: "STREAMER_WIDGET_MANAGE", label: labels.STREAMER_WIDGET_MANAGE },
    { bit: 1 << 3, key: "STREAMER_INTEGRATION_MANAGE", label: labels.STREAMER_INTEGRATION_MANAGE },
    { bit: 1 << 4, key: "STREAMER_ANALYTICS_VIEW", label: labels.STREAMER_ANALYTICS_VIEW },
    { bit: 1 << 5, key: "STREAMER_TRANSACTION_VIEW", label: labels.STREAMER_TRANSACTION_VIEW },
  ];
}

export const STREAMER_PERM_BITS: Array<{ bit: number; key: string; label: string }> =
  getStreamerPermBits();
