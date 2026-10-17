import type { ReactNode } from "react";

export interface StreamerMini {
  id: string;
  name: string;
  displayName: string;
  avatar: string | null;
}

export interface StreamerPermissionAssignment {
  streamerId: string;
  permissions: string[];
}

export interface OrgMemberData {
  id: string;
  userId: string;
  role: string;
  permissions: string;
  status?: string;
  joinedAt: string;
  email: string;
  name: string | null;
  avatar: string | null;
  streamerAssignments?: StreamerPermissionAssignment[];
  streamers?: StreamerMini[];
}

export interface OrgMemberOption {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
}

export interface VerifiedTargetUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface CreatedInviteCode {
  code: string;
  email: string;
  role: string;
  expiresAt: string;
}

export type CropType = "avatar" | "banner";
export type TransferStep = 1 | 2;

export interface InviteRoleOption {
  value: string;
  label: string;
  desc: string;
  badgeStyle: string;
}

export interface OrgPermItem {
  bit: bigint;
  key: string;
  name: string;
  desc: string;
}

export interface OrgPermDefinition {
  category: string;
  icon: ReactNode;
  color: string;
  perms: OrgPermItem[];
}

export interface StreamerPermDefinition {
  key: string;
  bit: number;
  name: string;
  desc: string;
}
