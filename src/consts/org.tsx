import React from "react";
import {
  GearSixIcon,
  BroadcastIcon,
  BrowsersIcon,
  PlugsConnectedIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";
import { OrgPerm, StreamerPerm } from "@/lib/rbac";
import type { InviteRoleOption, OrgPermDefinition, StreamerPermDefinition } from "@/types";

export const TRANSFER_CONFIRM_PHRASE = "TRANSFER";

export const INVITE_ROLES: InviteRoleOption[] = [
  {
    value: "MEMBER",
    label: "Member",
    desc: "Standard staff access",
    badgeStyle: "bg-secondary text-foreground/80 border-border",
  },
  {
    value: "VIEWER",
    label: "Viewer",
    desc: "Read-only view across organization",
    badgeStyle: "bg-zinc-800 text-zinc-300 border-zinc-700/50",
  },
  {
    value: "EDITOR",
    label: "Editor",
    desc: "Manage channels, alerts & widgets",
    badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    value: "MANAGER",
    label: "Manager",
    desc: "Manage staff, channels & statistics",
    badgeStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    value: "ADMIN",
    label: "Admin",
    desc: "Full administrative access except owner",
    badgeStyle: "bg-white/10 text-white border-white/20",
  },
];

export const ORG_PERM_DEFINITIONS: OrgPermDefinition[] = [
  {
    category: "Organization Administration",
    icon: <GearSixIcon size={16} weight="bold" />,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    perms: [
      { bit: OrgPerm.ORG_VIEW, key: "ORG_VIEW", name: "View Organization", desc: "View organization dashboard, overview & public profile" },
      { bit: OrgPerm.ORG_MANAGE, key: "ORG_MANAGE", name: "Manage Settings", desc: "Update organization branding, banner, and parameters" },
      { bit: OrgPerm.ORG_MEMBERS_MANAGE, key: "ORG_MEMBERS_MANAGE", name: "Manage Members", desc: "Send invites, add and remove staff members" },
      { bit: OrgPerm.ORG_ROLES_MANAGE, key: "ORG_ROLES_MANAGE", name: "Manage Roles & Perms", desc: "Delegate permissions, roles, and channel assignments" },
    ],
  },
  {
    category: "Streamer Channels",
    icon: <BroadcastIcon size={16} weight="bold" />,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    perms: [
      { bit: OrgPerm.STREAMER_VIEW, key: "STREAMER_VIEW", name: "View Streamers", desc: "Access the channels list and channel dashboards" },
      { bit: OrgPerm.STREAMER_CREATE, key: "STREAMER_CREATE", name: "Create Streamers", desc: "Provision new streaming channels under the organization" },
      { bit: OrgPerm.STREAMER_MANAGE, key: "STREAMER_MANAGE", name: "Edit Channel Profiles", desc: "Modify handles, display names, bios, and visuals" },
      { bit: OrgPerm.STREAMER_DELETE, key: "STREAMER_DELETE", name: "Delete Channels", desc: "Permanently delete streaming channels" },
    ],
  },
  {
    category: "Widgets & Overlays",
    icon: <BrowsersIcon size={16} weight="bold" />,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    perms: [
      { bit: OrgPerm.WIDGET_VIEW, key: "WIDGET_VIEW", name: "View Overlays", desc: "Access alert overlay previews and OBS browser sources" },
      { bit: OrgPerm.WIDGET_MANAGE, key: "WIDGET_MANAGE", name: "Manage AlertBox", desc: "Customize alert events, animations, sounds, and TTS" },
      { bit: OrgPerm.WIDGET_TOKEN_ROTATE, key: "WIDGET_TOKEN_ROTATE", name: "Rotate Widget Tokens", desc: "Invalidate and regenerate OBS browser source tokens" },
    ],
  },
  {
    category: "Integrations & Gateways",
    icon: <PlugsConnectedIcon size={16} weight="bold" />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    perms: [
      { bit: OrgPerm.INTEGRATION_VIEW, key: "INTEGRATION_VIEW", name: "View Integrations", desc: "Inspect connected payment gateways and relay status" },
      { bit: OrgPerm.INTEGRATION_MANAGE, key: "INTEGRATION_MANAGE", name: "Manage Gateways", desc: "Connect/disconnect Stripe, Ko-fi, BMAC, and Streamlabs" },
    ],
  },
  {
    category: "Analytics & Finance",
    icon: <ChartLineUpIcon size={16} weight="bold" />,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    perms: [
      { bit: OrgPerm.ANALYTICS_VIEW, key: "ANALYTICS_VIEW", name: "View Analytics", desc: "Access viewer engagement charts and stream metrics" },
      { bit: OrgPerm.TRANSACTION_VIEW, key: "TRANSACTION_VIEW", name: "View Transactions", desc: "Access financial donation history and supporter receipts" },
      { bit: OrgPerm.REPORT_EXPORT, key: "REPORT_EXPORT", name: "Export Reports", desc: "Download CSV audit logs and accounting reports" },
    ],
  },
];

export const STREAMER_PERM_DEFINITIONS: StreamerPermDefinition[] = [
  { key: "STREAMER_VIEW", bit: StreamerPerm.STREAMER_VIEW, name: "View Channel & OBS", desc: "View channel dashboard and browser source overlay URLs" },
  { key: "STREAMER_MANAGE", bit: StreamerPerm.STREAMER_MANAGE, name: "Edit Channel Profile", desc: "Edit display name, bio, appearance, banner, and socials" },
  { key: "STREAMER_WIDGET_MANAGE", bit: StreamerPerm.STREAMER_WIDGET_MANAGE, name: "Manage AlertBox", desc: "Edit alert layouts, events, audio volumes, and TTS" },
  { key: "STREAMER_INTEGRATION_MANAGE", bit: StreamerPerm.STREAMER_INTEGRATION_MANAGE, name: "Manage Gateways", desc: "Configure Ko-fi, BMAC, Stripe, and Streamlabs relays" },
  { key: "STREAMER_ANALYTICS_VIEW", bit: StreamerPerm.STREAMER_ANALYTICS_VIEW, name: "View Analytics", desc: "View stream performance charts and viewer statistics" },
  { key: "STREAMER_TRANSACTION_VIEW", bit: StreamerPerm.STREAMER_TRANSACTION_VIEW, name: "View Transactions", desc: "Inspect donation histories, tips, and supporter records" },
];
