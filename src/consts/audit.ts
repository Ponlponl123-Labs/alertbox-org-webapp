export type AuditCategory = "ALL" | "MEMBERS" | "CHANNELS" | "SETTINGS" | "SECURITY";

export interface AuditCategoryTab {
  id: AuditCategory;
  label: string;
}

export const AUDIT_CATEGORY_TABS: AuditCategoryTab[] = [
  { id: "ALL", label: "All Activities" },
  { id: "MEMBERS", label: "Members & Roles" },
  { id: "CHANNELS", label: "Channels" },
  { id: "SETTINGS", label: "Settings" },
  { id: "SECURITY", label: "Security & Ownership" },
];

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

export const FIELD_FRIENDLY_NAMES: Record<string, string> = {
  name: "Handle / Name",
  displayName: "Display Name",
  bio: "Bio Description",
  avatar: "Avatar Image",
  banner: "Header Banner",
  accentColor: "Brand Accent Color",
  slug: "URL Slug",
  uri: "Custom URI",
  type: "Organization Type",
  twitch: "Twitch",
  youtube: "YouTube",
  twitter: "X / Twitter",
  facebook: "Facebook",
  reddit: "Reddit",
  discord: "Discord",
};

export const STREAMER_PERM_LABELS: Record<string, string> = {
  STREAMER_VIEW: "View Channel & OBS",
  STREAMER_MANAGE: "Edit Profile",
  STREAMER_WIDGET_MANAGE: "Manage AlertBox",
  STREAMER_INTEGRATION_MANAGE: "Manage Gateways",
  STREAMER_ANALYTICS_VIEW: "View Analytics",
  STREAMER_TRANSACTION_VIEW: "View Transactions",
};

export const STREAMER_PERM_BITS: Array<{ bit: number; key: string; label: string }> = [
  { bit: 1 << 0, key: "STREAMER_VIEW", label: "View Channel & OBS" },
  { bit: 1 << 1, key: "STREAMER_MANAGE", label: "Edit Profile" },
  { bit: 1 << 2, key: "STREAMER_WIDGET_MANAGE", label: "Manage AlertBox" },
  { bit: 1 << 3, key: "STREAMER_INTEGRATION_MANAGE", label: "Manage Gateways" },
  { bit: 1 << 4, key: "STREAMER_ANALYTICS_VIEW", label: "View Analytics" },
  { bit: 1 << 5, key: "STREAMER_TRANSACTION_VIEW", label: "View Transactions" },
];
