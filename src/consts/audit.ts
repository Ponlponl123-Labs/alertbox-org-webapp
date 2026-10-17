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
