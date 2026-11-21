import React from "react";
import {
  GearSixIcon,
  BroadcastIcon,
  BrowsersIcon,
  PlugsConnectedIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";
import { OrgPerm, StreamerPerm } from "./permission";
import lang from "@/lib/i18n";
import type {
  InviteRoleOption,
  LanguageData,
  OrgPermDefinition,
  StreamerPermDefinition,
} from "@/types";

export const TRANSFER_CONFIRM_PHRASE = "TRANSFER";

export function getInviteRoles(
  langData: LanguageData = lang("en-US").data,
): InviteRoleOption[] {
  return [
    {
      value: "MEMBER",
      label: langData.roles.member.label,
      desc: langData.roles.member.invite_desc,
      badgeStyle: "bg-secondary text-foreground/80 border-border",
    },
    {
      value: "VIEWER",
      label: langData.roles.viewer.label,
      desc: langData.roles.viewer.invite_desc,
      badgeStyle: "bg-zinc-800 text-zinc-300 border-zinc-700/50",
    },
    {
      value: "EDITOR",
      label: langData.roles.editor.label,
      desc: langData.roles.editor.invite_desc,
      badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      value: "MANAGER",
      label: langData.roles.manager.label,
      desc: langData.roles.manager.invite_desc,
      badgeStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      value: "ADMIN",
      label: langData.roles.admin.label,
      desc: langData.roles.admin.invite_desc,
      badgeStyle: "bg-white/10 text-white border-white/20",
    },
  ];
}

export const INVITE_ROLES: InviteRoleOption[] = getInviteRoles();

export function getOrgPermDefinitions(
  langData: LanguageData = lang("en-US").data,
): OrgPermDefinition[] {
  const c = langData.permissions.org_categories;
  const p = langData.permissions.org;
  return [
    {
      category: c.admin,
      icon: <GearSixIcon size={16} weight="bold" />,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      perms: [
        { bit: OrgPerm.ORG_VIEW, key: "ORG_VIEW", ...p.ORG_VIEW },
        { bit: OrgPerm.ORG_MANAGE, key: "ORG_MANAGE", ...p.ORG_MANAGE },
        { bit: OrgPerm.ORG_MEMBER_ADD, key: "ORG_MEMBER_ADD", ...p.ORG_MEMBER_ADD },
        { bit: OrgPerm.ORG_MEMBER_MODIFY, key: "ORG_MEMBER_MODIFY", ...p.ORG_MEMBER_MODIFY },
        { bit: OrgPerm.ORG_MEMBER_REMOVE, key: "ORG_MEMBER_REMOVE", ...p.ORG_MEMBER_REMOVE },
        { bit: OrgPerm.ORG_ROLES_MANAGE, key: "ORG_ROLES_MANAGE", ...p.ORG_ROLES_MANAGE },
      ],
    },
    {
      category: c.channels,
      icon: <BroadcastIcon size={16} weight="bold" />,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      perms: [
        { bit: OrgPerm.STREAMER_VIEW, key: "STREAMER_VIEW", ...p.STREAMER_VIEW },
        { bit: OrgPerm.STREAMER_CREATE, key: "STREAMER_CREATE", ...p.STREAMER_CREATE },
        { bit: OrgPerm.STREAMER_MANAGE, key: "STREAMER_MANAGE", ...p.STREAMER_MANAGE },
        { bit: OrgPerm.STREAMER_DELETE, key: "STREAMER_DELETE", ...p.STREAMER_DELETE },
      ],
    },
    {
      category: c.widgets,
      icon: <BrowsersIcon size={16} weight="bold" />,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      perms: [
        { bit: OrgPerm.WIDGET_VIEW, key: "WIDGET_VIEW", ...p.WIDGET_VIEW },
        { bit: OrgPerm.WIDGET_MANAGE, key: "WIDGET_MANAGE", ...p.WIDGET_MANAGE },
        { bit: OrgPerm.WIDGET_TOKEN_ROTATE, key: "WIDGET_TOKEN_ROTATE", ...p.WIDGET_TOKEN_ROTATE },
      ],
    },
    {
      category: c.integrations,
      icon: <PlugsConnectedIcon size={16} weight="bold" />,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      perms: [
        { bit: OrgPerm.INTEGRATION_VIEW, key: "INTEGRATION_VIEW", ...p.INTEGRATION_VIEW },
        { bit: OrgPerm.INTEGRATION_MANAGE, key: "INTEGRATION_MANAGE", ...p.INTEGRATION_MANAGE },
      ],
    },
    {
      category: c.analytics,
      icon: <ChartLineUpIcon size={16} weight="bold" />,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      perms: [
        { bit: OrgPerm.ANALYTICS_VIEW, key: "ANALYTICS_VIEW", ...p.ANALYTICS_VIEW },
        { bit: OrgPerm.TRANSACTION_VIEW, key: "TRANSACTION_VIEW", ...p.TRANSACTION_VIEW },
        { bit: OrgPerm.REPORT_EXPORT, key: "REPORT_EXPORT", ...p.REPORT_EXPORT },
      ],
    },
  ];
}

export const ORG_PERM_DEFINITIONS: OrgPermDefinition[] = getOrgPermDefinitions();

export function getStreamerPermDefinitions(
  langData: LanguageData = lang("en-US").data,
): StreamerPermDefinition[] {
  const s = langData.permissions.streamer;
  return [
    { key: "STREAMER_VIEW", bit: StreamerPerm.STREAMER_VIEW, name: s.STREAMER_VIEW.name, desc: s.STREAMER_VIEW.desc },
    { key: "STREAMER_MANAGE", bit: StreamerPerm.STREAMER_MANAGE, name: s.STREAMER_MANAGE.name, desc: s.STREAMER_MANAGE.desc },
    { key: "STREAMER_WIDGET_MANAGE", bit: StreamerPerm.STREAMER_WIDGET_MANAGE, name: s.STREAMER_WIDGET_MANAGE.name, desc: s.STREAMER_WIDGET_MANAGE.desc },
    { key: "STREAMER_INTEGRATION_MANAGE", bit: StreamerPerm.STREAMER_INTEGRATION_MANAGE, name: s.STREAMER_INTEGRATION_MANAGE.name, desc: s.STREAMER_INTEGRATION_MANAGE.desc },
    { key: "STREAMER_ANALYTICS_VIEW", bit: StreamerPerm.STREAMER_ANALYTICS_VIEW, name: s.STREAMER_ANALYTICS_VIEW.name, desc: s.STREAMER_ANALYTICS_VIEW.desc },
    { key: "STREAMER_TRANSACTION_VIEW", bit: StreamerPerm.STREAMER_TRANSACTION_VIEW, name: s.STREAMER_TRANSACTION_VIEW.name, desc: s.STREAMER_TRANSACTION_VIEW.desc },
  ];
}

export const STREAMER_PERM_DEFINITIONS: StreamerPermDefinition[] = getStreamerPermDefinitions();

export function getRoleSummaries(
  langData: LanguageData = lang("en-US").data,
): Record<string, string> {
  return {
    OWNER: langData.roles.owner.summary,
    ADMIN: langData.roles.admin.summary,
    MANAGER: langData.roles.manager.summary,
    EDITOR: langData.roles.editor.summary,
    VIEWER: langData.roles.viewer.summary,
    MEMBER: langData.roles.member.summary,
  };
}

export function getRoleLabel(
  role: string,
  langData: LanguageData = lang("en-US").data,
): string {
  const key = role.toUpperCase();
  const map: Record<string, string> = {
    OWNER: langData.roles.owner.label,
    ADMIN: langData.roles.admin.label,
    MANAGER: langData.roles.manager.label,
    EDITOR: langData.roles.editor.label,
    VIEWER: langData.roles.viewer.label,
    MEMBER: langData.roles.member.label,
  };
  return map[key] || role;
}

export const ROLE_SUMMARIES: Record<string, string> = getRoleSummaries();
