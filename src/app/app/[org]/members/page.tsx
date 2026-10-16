"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import {
  UsersIcon,
  UserPlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CopySimpleIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  DotsThreeVerticalIcon,
  ShieldCheckIcon,
  BroadcastIcon,
  GearSixIcon,
  BrowsersIcon,
  PlugsConnectedIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { getFallbackInitial, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { hasPermission, OrgPerm, RolePresets, StreamerPerm } from "@/lib/rbac";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface StreamerMini {
  id: string;
  name: string;
  displayName: string;
  avatar: string | null;
}

interface StreamerPermissionAssignment {
  streamerId: string;
  permissions: string[];
}

interface OrgMemberData {
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

const ORG_PERM_DEFINITIONS = [
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

const STREAMER_PERM_DEFINITIONS = [
  { key: "STREAMER_VIEW", bit: StreamerPerm.STREAMER_VIEW, name: "View Channel & OBS", desc: "View channel dashboard and browser source overlay URLs" },
  { key: "STREAMER_MANAGE", bit: StreamerPerm.STREAMER_MANAGE, name: "Edit Channel Profile", desc: "Edit display name, bio, appearance, banner, and socials" },
  { key: "STREAMER_WIDGET_MANAGE", bit: StreamerPerm.STREAMER_WIDGET_MANAGE, name: "Manage AlertBox", desc: "Edit alert layouts, events, audio volumes, and TTS" },
  { key: "STREAMER_INTEGRATION_MANAGE", bit: StreamerPerm.STREAMER_INTEGRATION_MANAGE, name: "Manage Gateways", desc: "Configure Ko-fi, BMAC, Stripe, and Streamlabs relays" },
  { key: "STREAMER_ANALYTICS_VIEW", bit: StreamerPerm.STREAMER_ANALYTICS_VIEW, name: "View Analytics", desc: "View stream performance charts and viewer statistics" },
  { key: "STREAMER_TRANSACTION_VIEW", bit: StreamerPerm.STREAMER_TRANSACTION_VIEW, name: "View Transactions", desc: "Inspect donation histories, tips, and supporter records" },
];

export default function OrgMembersPage() {
  const routeParams = useParams();
  const { activeOrg, authFetch } = useUserContext();
  const [members, setMembers] = useState<OrgMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isOwner = activeOrg?.role === "OWNER";
  const isOwnerOrAdmin = isOwner || activeOrg?.role === "ADMIN";
  const canManageMembers = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MEMBERS_MANAGE);
  const canManageRoles = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_ROLES_MANAGE);

  // Invite modal states
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [isInviting, setIsInviting] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<{
    code: string;
    email: string;
    role: string;
    expiresAt: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Full-screen Permissions & Streamer Assignment Dialog states
  const [managingMember, setManagingMember] = useState<OrgMemberData | null>(null);
  const [dialogTab, setDialogTab] = useState<"org" | "streamers">("org");
  const [dialogRole, setDialogRole] = useState<string>("MEMBER");
  const [dialogPerms, setDialogPerms] = useState<bigint>(BigInt(0));
  const [dialogAssignments, setDialogAssignments] = useState<StreamerPermissionAssignment[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState<boolean>(false);

  const [actionMenuMemberId, setActionMenuMemberId] = useState<string | null>(null);
  const [deletingMember, setDeletingMember] = useState<OrgMemberData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const ROLE_SUMMARIES: Record<string, string> = {
    OWNER: "Root Admin · All Channels",
    ADMIN: "Members, Channels & Finance",
    MANAGER: "Channels, Widgets & Stats",
    EDITOR: "Profiles & AlertBox",
    VIEWER: "Read-only View",
    MEMBER: "Standard Access",
  };

  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const streamers = activeOrg?.streamers || [];

  const fetchMembers = useCallback(() => {
    if (!orgTarget) return;
    authFetch(getApiUrl(`/api/v1/org/${orgTarget}/members`))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setMembers(data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        toast.error("Failed to load organization members");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orgTarget, authFetch]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openManageDialog = (m: OrgMemberData) => {
    if (m.role === "OWNER") {
      toast.error("Organization Owner cannot be modified here. Ownership must be transferred from Organization Settings.");
      return;
    }
    setManagingMember(m);
    setDialogTab("org");
    setDialogRole(m.role);
    setDialogPerms(BigInt(m.permissions || "0"));
    if (m.role === "ADMIN") {
      setDialogAssignments(
        streamers.map((s) => ({
          streamerId: s.id,
          permissions: STREAMER_PERM_DEFINITIONS.map((p) => p.key),
        })),
      );
    } else {
      setDialogAssignments(m.streamerAssignments ? JSON.parse(JSON.stringify(m.streamerAssignments)) : []);
    }
  };

  const handleSelectRolePreset = (role: string) => {
    if (role === "OWNER") return;
    setDialogRole(role);
    if (RolePresets[role] !== undefined) {
      setDialogPerms(RolePresets[role]);
    }
    if (role === "ADMIN") {
      setDialogAssignments(
        streamers.map((s) => ({
          streamerId: s.id,
          permissions: STREAMER_PERM_DEFINITIONS.map((p) => p.key),
        })),
      );
    }
  };

  const toggleOrgPermBit = (bit: bigint) => {
    setDialogPerms((prev) => prev ^ bit);
  };

  const isStreamerAssigned = (streamerId: string) => {
    if (dialogRole === "OWNER" || dialogRole === "ADMIN") return true;
    return dialogAssignments.some((a) => a.streamerId === streamerId);
  };

  const toggleStreamerAssignment = (streamerId: string) => {
    if (dialogRole === "OWNER" || dialogRole === "ADMIN") return;
    setDialogAssignments((prev) => {
      const exists = prev.some((a) => a.streamerId === streamerId);
      if (exists) {
        return prev.filter((a) => a.streamerId !== streamerId);
      }
      return [
        ...prev,
        {
          streamerId,
          permissions: [
            "STREAMER_VIEW",
            "STREAMER_MANAGE",
          ],
        },
      ];
    });
  };

  const toggleStreamerPermission = (streamerId: string, permKey: string) => {
    if (dialogRole === "OWNER" || dialogRole === "ADMIN") return;
    setDialogAssignments((prev) =>
      prev.map((a) => {
        if (a.streamerId !== streamerId) return a;
        const perms = a.permissions || [];
        const has = perms.includes(permKey);
        return {
          ...a,
          permissions: has ? perms.filter((p) => p !== permKey) : [...perms, permKey],
        };
      }),
    );
  };

  const handleAssignAllStreamers = () => {
    setDialogAssignments(
      streamers.map((s) => ({
        streamerId: s.id,
        permissions: STREAMER_PERM_DEFINITIONS.map((p) => p.key),
      })),
    );
  };

  const handleUnassignAllStreamers = () => {
    setDialogAssignments([]);
  };

  const handleSavePermissions = async () => {
    if (!managingMember || !orgTarget) return;
    setIsSavingPermissions(true);

    try {
      const isOwnerOrAdmin = dialogRole === "OWNER" || dialogRole === "ADMIN";
      const finalAssignments = isOwnerOrAdmin
        ? streamers.map((s) => ({
            streamerId: s.id,
            permissions: STREAMER_PERM_DEFINITIONS.map((p) => p.key),
          }))
        : dialogAssignments;

      const sanitizedPerms = (dialogPerms & ~OrgPerm.ORG_DELETE).toString();
      const payload = {
        role: dialogRole,
        permissions: sanitizedPerms,
        streamerAssignments: finalAssignments,
      };

      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/members/${managingMember.id}`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === managingMember.id
              ? {
                  ...m,
                  role: dialogRole,
                  permissions: sanitizedPerms,
                  streamerAssignments: finalAssignments,
                  streamers: isOwnerOrAdmin
                    ? streamers
                    : streamers.filter((s) =>
                        finalAssignments.some((a) => a.streamerId === s.id),
                      ),
                }
              : m,
          ),
        );
        toast.success("Permissions & channel assignments saved successfully");
        setManagingMember(null);
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to update permissions");
      }
    } catch {
      toast.error("Network error updating permissions");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !orgTarget) return;
    setIsInviting(true);

    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}/invites`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedInviteCode({
          code: data.code,
          email: data.email,
          role: data.role,
          expiresAt: data.expiresAt,
        });
        toast.success("Invite code generated!");
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to send invitation");
      }
    } catch {
      toast.error("Network error sending invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCloseInvite = () => {
    setIsInviteOpen(false);
    setCreatedInviteCode(null);
    setInviteEmail("");
    setIsCopied(false);
  };

  const handleRemoveMember = async () => {
    if (!deletingMember || !orgTarget) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/members/${deletingMember.id}`),
        { method: "DELETE" },
      );
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
        toast.success("Member removed");
        setDeletingMember(null);
      } else {
        toast.error("Failed to remove member");
      }
    } catch {
      toast.error("Network error removing member");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        m.role.toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ADMIN":
        return "bg-white/10 text-white border-white/20";
      case "MANAGER":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "EDITOR":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "VIEWER":
        return "bg-zinc-800 text-zinc-300 border-zinc-700/50";
      default:
        return "bg-secondary text-foreground/80 border-border";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Away":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700/50";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <UsersIcon size={16} weight="bold" />
            <span>Team & Delegated Access</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Members & Staff
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage teammates, granular bitmask permissions, and channel assignments for {activeOrg?.name}.
          </p>
        </div>

        {canManageMembers && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="gap-2 font-semibold text-xs rounded-xl cursor-pointer"
            >
              <UserPlusIcon size={16} weight="bold" />
              <span>Invite Member</span>
            </Button>
          </div>
        )}
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 text-xs"
            classNames={{ base: "h-9 rounded-xl" }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Total Staff: <strong className="text-foreground">{members.length}</strong></span>
          <span>•</span>
          <span>Channels: <strong className="text-foreground">{streamers.length}</strong></span>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground bg-secondary/30">
                <th className="py-3.5 px-6 font-semibold">User</th>
                <th className="py-3.5 px-6 font-semibold">Role & Permissions</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Joined Date</th>
                <th className="py-3.5 px-6 font-semibold">Assigned Channels</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner />
                      <span>Loading team members...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    {searchQuery ? "No members match your search query." : "No members found."}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isOwnerOrAdmin = m.role === "OWNER" || m.role === "ADMIN";
                  const memberStatus = m.status || "Active";
                  const formattedDate = m.joinedAt
                    ? new Date(m.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const assignedList = isOwnerOrAdmin ? streamers : (m.streamers || []);

                  return (
                    <tr key={m.id} className="hover:bg-foreground/2 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <Avatar className="size-10 rounded-full border border-border/40 shrink-0">
                            {m.avatar ? <AvatarImage src={m.avatar} alt={m.name || "Member"} /> : null}
                            <AvatarFallback className="bg-blue-600/90 text-white font-semibold text-xs">
                              {getFallbackInitial(m.name || m.email || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col leading-tight min-w-0">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {m.name || "Member"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate mt-0.5">
                              {m.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={cn(
                              "inline-block w-fit px-2.5 py-0.5 rounded-md text-xs font-semibold border leading-normal",
                              getRoleBadgeStyle(m.role),
                            )}
                          >
                            {m.role}
                          </span>
                          <span className="text-[11px] text-muted-foreground/80 font-normal">
                            {ROLE_SUMMARIES[m.role] || "Standard Access"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border leading-normal",
                            getStatusBadgeStyle(memberStatus),
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full shrink-0",
                              memberStatus === "Active" ? "bg-emerald-400" : "bg-zinc-400",
                            )}
                          />
                          {memberStatus}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {formattedDate}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {isOwnerOrAdmin ? (
                          <span className="text-xs text-muted-foreground/80 font-medium">
                            All channels (Full Access)
                          </span>
                        ) : assignedList.length > 0 ? (
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {assignedList.slice(0, 3).map((st) => (
                              <Avatar
                                key={st.id}
                                className="size-7 ring-2 ring-card border border-border/50 shrink-0"
                                title={st.displayName || st.name}
                              >
                                {st.avatar ? (
                                  <AvatarImage src={st.avatar} alt={st.displayName || st.name} />
                                ) : (
                                  <AvatarFallback className="text-[9px] bg-blue-600 text-white font-bold">
                                    {getFallbackInitial(st.displayName || st.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            ))}
                            {assignedList.length > 3 && (
                              <span
                                className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground ring-2 ring-card"
                                title={assignedList.slice(3).map((s) => s.displayName || s.name).join(", ")}
                              >
                                +{assignedList.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">
                            No channels assigned
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <Popover
                          open={actionMenuMemberId === m.id}
                          onOpenChange={(open) => setActionMenuMemberId(open ? m.id : null)}
                        >
                          <PopoverTrigger
                            className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                            title="Member actions"
                          >
                            <DotsThreeVerticalIcon size={16} weight="bold" />
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            sideOffset={4}
                            className="w-56 p-1.5 rounded-2xl border border-border shadow-xl bg-popover"
                          >
                            <div className="flex flex-col gap-0.5 text-xs">
                              {canManageRoles && m.role !== "OWNER" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenuMemberId(null);
                                    openManageDialog(m);
                                  }}
                                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-foreground transition-colors text-left font-medium cursor-pointer"
                                >
                                  <ShieldCheckIcon size={14} weight="bold" className="text-primary" />
                                  <span>Permissions & Channels</span>
                                </button>
                              )}
                              {m.role === "OWNER" && (
                                <div className="px-2.5 py-1.5 text-[11px] text-muted-foreground/80 font-semibold italic flex items-center gap-1.5">
                                  <ShieldCheckIcon size={14} weight="bold" className="text-amber-500" />
                                  <span>Organization Owner</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(m.email);
                                  toast.success("Email copied to clipboard");
                                  setActionMenuMemberId(null);
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-foreground transition-colors text-left font-medium cursor-pointer"
                              >
                                <CopySimpleIcon size={14} weight="bold" className="text-muted-foreground" />
                                <span>Copy Email</span>
                              </button>
                              {canManageMembers && m.role !== "OWNER" && (
                                <>
                                  <div className="h-px bg-border my-1 -mx-0.5" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuMemberId(null);
                                      setDeletingMember(m);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left font-medium cursor-pointer"
                                  >
                                    <TrashIcon size={14} weight="bold" />
                                    <span>Remove Member</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL-SCREEN / LARGE MODAL: Permissions, Streamer Assignment & Streamer Assigned Permissions */}
      <Dialog
        open={Boolean(managingMember)}
        onOpenChange={(open) => !open && setManagingMember(null)}
      >
        <DialogContent
          className="sm:max-w-4xl w-[95vw] h-[88vh] max-h-[88vh] p-0 flex flex-col gap-0 rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
          showCloseButton={false}
        >
          {/* Top Modal Navigation Header */}
          <DialogHeader className="px-6 py-4 border-b border-border bg-secondary/30 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-10 rounded-full border border-border shrink-0">
                  {managingMember?.avatar ? (
                    <AvatarImage src={managingMember.avatar} alt={managingMember.name || "Member"} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {getFallbackInitial(managingMember?.name || managingMember?.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base font-bold text-foreground truncate">
                      {managingMember?.name || "Staff Member"}
                    </DialogTitle>
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold border", getRoleBadgeStyle(dialogRole))}>
                      {dialogRole}
                    </span>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground truncate">
                    {managingMember?.email}
                  </DialogDescription>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50">
                <button
                  type="button"
                  onClick={() => setDialogTab("org")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    dialogTab === "org"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <ShieldCheckIcon size={14} weight="bold" />
                  <span>Org Role & Permissions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDialogTab("streamers")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    dialogTab === "streamers"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <BroadcastIcon size={14} weight="bold" />
                  <span>Channel Assignments</span>
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/20 text-primary font-bold">
                    {dialogRole === "OWNER" || dialogRole === "ADMIN" ? streamers.length : dialogAssignments.length}
                  </span>
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Content Scroll Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {dialogTab === "org" ? (
              <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
                {/* Role Preset Selector Card */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Organization Role Preset</h3>
                      <p className="text-xs text-muted-foreground">Select a standard preset to automatically populate the 64-bit permission bitmask.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                    {["ADMIN", "MANAGER", "EDITOR", "VIEWER", "MEMBER"].map((role) => {
                      const isSelected = dialogRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleSelectRolePreset(role)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer",
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                              : "border-border/60 bg-secondary/20 hover:bg-secondary/60 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <span className="text-xs font-semibold">{role}</span>
                          <span className="text-[10px] opacity-70 mt-0.5">{ROLE_SUMMARIES[role]?.split("·")[0] || "Role"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Granular Permission Categories */}
                <div className="flex flex-col gap-4">
                  {ORG_PERM_DEFINITIONS.map((cat) => (
                    <div
                      key={cat.category}
                      className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
                        <div className={cn("p-1.5 rounded-lg border", cat.color)}>{cat.icon}</div>
                        <h4 className="text-sm font-bold text-foreground">{cat.category}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {cat.perms.map((p) => {
                          const isGranted = (dialogPerms & p.bit) === p.bit;
                          return (
                            <div
                              key={p.key}
                              onClick={() => {
                                if (dialogRole !== "OWNER") toggleOrgPermBit(p.bit);
                              }}
                              className={cn(
                                "flex items-start justify-between gap-3 p-3 rounded-xl border transition-colors cursor-pointer select-none",
                                isGranted ? "border-primary/30 bg-primary/5" : "border-border/50 bg-secondary/10 hover:bg-secondary/20",
                                dialogRole === "OWNER" && "cursor-not-allowed opacity-80",
                              )}
                            >
                              <div className="grid leading-tight min-w-0 pr-2">
                                <span className="text-xs font-semibold text-foreground">{p.name}</span>
                                <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{p.desc}</span>
                              </div>
                              <Switch
                                checked={isGranted}
                                onCheckedChange={() => toggleOrgPermBit(p.bit)}
                                disabled={dialogRole === "OWNER"}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
                {/* Banner & Quick Actions */}
                {dialogRole === "OWNER" || dialogRole === "ADMIN" ? (
                  <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center gap-3.5">
                    <ShieldCheckIcon size={24} weight="bold" className="text-blue-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Unrestricted Channel Privileges
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Organization {dialogRole}s automatically have full access and management permissions across all channels.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <BroadcastIcon size={16} weight="bold" className="text-primary" />
                        <span>Streamer Channel Assignments & Unique Access</span>
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Staff members have <strong>no channels assigned by default</strong>. Assign streaming channels below and select which unique operations this member may execute per channel.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={handleAssignAllStreamers}
                        className="rounded-xl text-xs cursor-pointer font-medium"
                      >
                        Assign All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={handleUnassignAllStreamers}
                        className="rounded-xl text-xs cursor-pointer font-medium text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        Unassign All
                      </Button>
                    </div>
                  </div>
                )}

                {/* Channel Assignment Cards */}
                {streamers.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
                    No streaming channels found in this organization. Create a channel first under Organization Channels.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {streamers.map((st) => {
                      const isOwnerOrAdmin = dialogRole === "OWNER" || dialogRole === "ADMIN";
                      const assigned = isStreamerAssigned(st.id);
                      const currentAssign = dialogAssignments.find((a) => a.streamerId === st.id);
                      const assignedPerms = isOwnerOrAdmin
                        ? STREAMER_PERM_DEFINITIONS.map((p) => p.key)
                        : (currentAssign?.permissions || []);

                      return (
                        <div
                          key={st.id}
                          className={cn(
                            "rounded-2xl border transition-all overflow-hidden bg-card shadow-xs",
                            assigned ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "border-border/60 opacity-80",
                          )}
                        >
                          {/* Channel Card Header */}
                          <div
                            onClick={() => !isOwnerOrAdmin && toggleStreamerAssignment(st.id)}
                            className={cn(
                              "p-4 bg-secondary/30 border-b border-border/50 flex items-center justify-between gap-4 select-none",
                              !isOwnerOrAdmin && "cursor-pointer hover:bg-secondary/50",
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="size-10 rounded-xl border border-border shrink-0">
                                {st.avatar ? (
                                  <AvatarImage src={st.avatar} alt={st.displayName || st.name} />
                                ) : null}
                                <AvatarFallback className="bg-blue-600 text-white font-bold text-xs rounded-xl">
                                  {getFallbackInitial(st.displayName || st.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="grid min-w-0 leading-tight">
                                <span className="font-bold text-sm text-foreground truncate">
                                  {st.displayName || st.name}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono truncate">
                                  @{st.name}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                              <span className="text-xs font-semibold text-foreground/80">
                                {assigned ? "Assigned" : "Unassigned"}
                              </span>
                              <Switch
                                checked={assigned}
                                onCheckedChange={() => toggleStreamerAssignment(st.id)}
                                disabled={isOwnerOrAdmin}
                              />
                            </div>
                          </div>

                          {/* Channel Granular Permissions (Only shown when assigned) */}
                          {assigned ? (
                            <div className="p-5 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Delegated Channel Permissions
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDialogAssignments((prev) =>
                                        prev.map((a) =>
                                          a.streamerId === st.id
                                            ? { ...a, permissions: STREAMER_PERM_DEFINITIONS.map((p) => p.key) }
                                            : a,
                                        ),
                                      );
                                    }}
                                    className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                                  >
                                    Select All
                                  </button>
                                  <span className="text-muted-foreground">•</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDialogAssignments((prev) =>
                                        prev.map((a) =>
                                          a.streamerId === st.id ? { ...a, permissions: [] } : a,
                                        ),
                                      );
                                    }}
                                    className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {STREAMER_PERM_DEFINITIONS.map((sp) => {
                                  const isChecked = assignedPerms.includes(sp.key);
                                  return (
                                    <button
                                      key={sp.key}
                                      type="button"
                                      onClick={() => toggleStreamerPermission(st.id, sp.key)}
                                      className={cn(
                                        "flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer",
                                        isChecked
                                          ? "bg-primary/10 border-primary text-foreground"
                                          : "bg-secondary/20 border-border/60 text-muted-foreground hover:text-foreground",
                                      )}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="text-xs font-semibold">{sp.name}</span>
                                        <div
                                          className={cn(
                                            "size-4 rounded-md border flex items-center justify-center transition-colors",
                                            isChecked
                                              ? "bg-primary border-primary text-primary-foreground"
                                              : "border-border bg-background",
                                          )}
                                        >
                                          {isChecked && <CheckIcon size={11} weight="bold" />}
                                        </div>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground mt-1 leading-snug">
                                        {sp.desc}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 text-xs text-muted-foreground/60 italic bg-secondary/10">
                              This channel is currently not assigned. Toggle the switch above to grant access.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Bottom Footer */}
          <DialogFooter className="px-6 py-3.5 border-t border-border bg-secondary/20 flex flex-row items-center justify-between shrink-0 sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Configuring privileges for <strong className="text-foreground">{managingMember?.name || managingMember?.email}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManagingMember(null)}
                disabled={isSavingPermissions}
                className="rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </Button>
              {canManageRoles && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className="gap-2 rounded-xl text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSavingPermissions ? <Spinner className="size-3.5" /> : <CheckIcon size={14} weight="bold" />}
                  <span>Save Changes</span>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6" showCloseButton={false}>
          {!createdInviteCode ? (
            <>
              <DialogHeader>
                <div className="bg-primary/10 p-2.5 size-12 rounded-2xl text-primary flex items-center justify-center mb-2">
                  <UserPlusIcon weight="bold" size={22} />
                </div>
                <DialogTitle className="text-xl font-bold">Invite Staff Member</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                  Enter email and assigned role. The server will generate an 8-digit single-use invitation code valid for 5 minutes.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInvite} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full"
                    classNames={{ base: "h-10 rounded-xl" }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Must be registered in Alertbox. The code can only be used by this email.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Role & Access Level</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground outline-none focus:border-primary/50"
                  >
                    <option value="MEMBER">Member (Standard staff)</option>
                    <option value="VIEWER">Viewer (Read-only)</option>
                    <option value="EDITOR">Editor (Manage streamers & widgets)</option>
                    <option value="MANAGER">Manager (Manage staff & streams)</option>
                    <option value="ADMIN">Admin (Full access except owner)</option>
                  </select>
                </div>

                <DialogFooter className="mt-4 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseInvite}
                    className="rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim()}
                    className="rounded-xl gap-2 font-semibold cursor-pointer"
                  >
                    {isInviting ? <Spinner /> : <UserPlusIcon size={16} weight="bold" />}
                    <span>Generate Invite Code</span>
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <div className="bg-emerald-500/10 p-2.5 size-12 rounded-2xl text-emerald-500 flex items-center justify-center mb-1">
                  <CheckCircleIcon weight="bold" size={24} />
                </div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Invitation Code Created
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                  Share this 8-digit OTP code with <strong>{createdInviteCode.email}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col items-center gap-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  8-Digit Join Code
                </span>
                <div className="text-3xl font-mono font-extrabold tracking-widest text-primary flex items-center gap-2 select-all">
                  <span>{createdInviteCode.code.slice(0, 4)}</span>
                  <span className="text-muted-foreground/40">-</span>
                  <span>{createdInviteCode.code.slice(4, 8)}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(createdInviteCode.code);
                    setIsCopied(true);
                    toast.success("Code copied to clipboard!");
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="rounded-xl text-xs gap-1.5 cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <CheckIcon size={14} weight="bold" className="text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopySimpleIcon size={14} weight="bold" />
                      <span>Copy Code</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-accent/30 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Email:</span>
                  <span className="font-semibold text-foreground">{createdInviteCode.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Role:</span>
                  <span className="font-semibold text-primary capitalize">{createdInviteCode.role.toLowerCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Validity:</span>
                  <span className="font-semibold text-amber-500 flex items-center gap-1 font-mono">
                    <ClockCountdownIcon size={14} />
                    <span>5 Minutes (Single-Use)</span>
                  </span>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  onClick={handleCloseInvite}
                  className="rounded-xl w-full font-semibold text-xs cursor-pointer"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={Boolean(deletingMember)} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6" showCloseButton={false}>
          <DialogHeader>
            <div className="bg-destructive/10 p-2.5 size-12 rounded-2xl text-destructive flex items-center justify-center mb-2">
              <TrashIcon weight="bold" size={22} />
            </div>
            <DialogTitle className="text-xl font-bold">Remove Member</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
              Are you sure you want to remove <strong>{deletingMember?.name || deletingMember?.email}</strong> from {activeOrg?.name}? They will lose access to all channels immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingMember(null)}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isDeleting}
              className="rounded-xl gap-2 font-semibold cursor-pointer"
            >
              {isDeleting ? <Spinner /> : <TrashIcon size={16} weight="bold" />}
              <span>Remove Member</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
