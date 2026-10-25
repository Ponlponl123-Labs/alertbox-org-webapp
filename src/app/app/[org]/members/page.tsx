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
  HandWavingIcon,
  HandshakeIcon,
  CaretUpDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckeredIcon,
  PersonSimpleTaiChiIcon,
} from "@phosphor-icons/react";
import { toast } from "@/components/custom-ui/toast";
import { getFallbackInitial, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { hasPermission } from "@/lib/rbac";
import { OrgPerm, RolePresets } from "@/consts/permission";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type {
  OrgMemberData,
  StreamerPermissionAssignment,
  VerifiedTargetUser,
  CreatedInviteCode,
} from "@/types";
import {
  ORG_PERM_DEFINITIONS,
  STREAMER_PERM_DEFINITIONS,
  INVITE_ROLES,
  ROLE_SUMMARIES,
} from "@/consts/org";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OrgMembersPage() {
  const routeParams = useParams();
  const { activeOrg, authFetch, userInfo } = useUserContext();
  const [members, setMembers] = useState<OrgMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isOwner = activeOrg?.role === "OWNER";
  const isOwnerOrAdmin = isOwner || activeOrg?.role === "ADMIN";
  const canAddMembers = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MEMBER_ADD);
  const canModifyMembers = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MEMBER_MODIFY);
  const canRemoveMembers = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MEMBER_REMOVE);
  const canManageRoles = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_ROLES_MANAGE);
  const canEditStaff = canManageRoles || canModifyMembers;
  const callerPerms = isOwner ? OrgPerm.ALL : BigInt(activeOrg?.permissions || "0");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteStep, setInviteStep] = useState<1 | 2>(1);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [verifiedTargetUser, setVerifiedTargetUser] = useState<VerifiedTargetUser | null>(null);
  const [isRolePopoverOpen, setIsRolePopoverOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<CreatedInviteCode | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const selectedInviteRoleObj = INVITE_ROLES.find((r) => r.value === inviteRole) || INVITE_ROLES[0];

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
    const isSelf = Boolean(
      (userInfo?.id && m.userId === userInfo.id) ||
      (userInfo?.email && m.email.toLowerCase() === userInfo.email.toLowerCase())
    );
    if (isSelf) {
      toast.error("You cannot manage your own role or permissions.");
      return;
    }
    if (m.role === "OWNER") {
      toast.error("Organization Owner cannot be modified here. Ownership must be transferred from Organization Settings.");
      return;
    }
    if (!isOwner) {
      if (m.role === "ADMIN" && activeOrg?.role !== "ADMIN") {
        toast.error("You cannot modify an Administrator member.");
        return;
      }
      const targetPerms = BigInt(m.permissions || "0");
      if ((targetPerms & ~callerPerms) !== BigInt(0)) {
        toast.error("You cannot manage this member because their permissions exceed your own.");
        return;
      }
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
    const presetPerms = RolePresets[role] ?? BigInt(0);
    if (!isOwner && (presetPerms & ~callerPerms) !== BigInt(0)) {
      toast.error(`Cannot select ${role} preset because it contains permissions above your own.`);
      return;
    }
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
    if (!isOwner && (callerPerms & bit) !== bit) {
      toast.error("You cannot toggle a permission higher than your own.");
      return;
    }
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
    const isSelf = Boolean(
      (userInfo?.id && managingMember.userId === userInfo.id) ||
      (userInfo?.email && managingMember.email.toLowerCase() === userInfo.email.toLowerCase())
    );
    if (isSelf) {
      toast.error("You cannot modify your own role or permissions.");
      return;
    }
    if (!isOwner && (dialogPerms & ~callerPerms) !== BigInt(0)) {
      toast.error("Cannot save permissions that exceed your own.");
      return;
    }
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

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (!cleanEmail || !orgTarget) return;

    setIsCheckingEmail(true);
    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}/invites/lookup`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerifiedTargetUser(data);
        setInviteStep(2);
      } else {
        const msg = await res.text();
        toast.error(msg || "No active registered user found with this email");
      }
    } catch {
      toast.error("Network error verifying email");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleInvite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    setInviteStep(1);
    setInviteEmail("");
    setInviteRole("MEMBER");
    setVerifiedTargetUser(null);
    setCreatedInviteCode(null);
    setIsCopied(false);
    setIsRolePopoverOpen(false);
    setIsCheckingEmail(false);
    setIsInviting(false);
  };

  const handleRemoveMember = async () => {
    if (!deletingMember || !orgTarget) return;
    const isSelf = Boolean(
      (userInfo?.id && deletingMember.userId === userInfo.id) ||
      (userInfo?.email && deletingMember.email.toLowerCase() === userInfo.email.toLowerCase())
    );
    if (isSelf) {
      toast.error("You cannot remove yourself here. Use organization settings to leave.");
      return;
    }
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-1 z-10"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <UsersIcon size={16} weight="bold" />
            <span>Team & Delegated Access</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground my-3">
            Members & Staff
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage teammates, granular bitmask permissions, and channel assignments for {activeOrg?.name}.
          </p>
        </div>

        {canAddMembers && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setInviteStep(1);
                setInviteEmail("");
                setInviteRole("MEMBER");
                setVerifiedTargetUser(null);
                setCreatedInviteCode(null);
                setIsInviteOpen(true);
              }}
              className="gap-2 font-semibold text-xs rounded-xl p-3 h-max"
            >
              <UserPlusIcon size={16} weight="bold" />
              <span>Invite Member</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<MagnifyingGlassIcon size={16} className="text-muted-foreground" />}
            fontStyle={{
              fontFamily: "var(--font-sans)",
              fontWeight: "500",
              fontSize: "14px",
            }}
            className="w-full"
            classNames={{ base: "h-9 rounded-xl" }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={"secondary"} className="p-2 h-max rounded-xl select-none"><ShieldCheckeredIcon weight="fill" size={16} /> Total Staff: <strong className="text-foreground">{members.length}</strong></Badge>
          <Badge variant={"secondary"} className="p-2 h-max rounded-xl select-none"><PersonSimpleTaiChiIcon weight="fill" size={16} /> Channels: <strong className="text-foreground">{streamers.length}</strong></Badge>
        </div>
      </div>

      <div className="rounded-2xl bg-card border shadow-xs overflow-hidden">
        <Table className="w-full text-left border-collapse">
          <TableHeader>
            <TableRow className="text-xs text-muted-foreground select-none border-b border-border/60 bg-muted/20">
              <TableHead className="py-3.5 px-6 font-semibold h-auto text-muted-foreground">User</TableHead>
              <TableHead className="py-3.5 px-6 font-semibold h-auto text-muted-foreground">Role & Permissions</TableHead>
              <TableHead className="py-3.5 px-6 font-semibold h-auto text-muted-foreground hidden">Status</TableHead>
              <TableHead className="py-3.5 px-6 font-semibold h-auto text-muted-foreground">Joined Date</TableHead>
              <TableHead className="py-3.5 px-6 font-semibold h-auto text-muted-foreground">Assigned Channels</TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-right h-auto text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30 text-sm">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner />
                    <span>Loading team members...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                  {searchQuery ? "No members match your search query." : "No members found."}
                </TableCell>
              </TableRow>
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
                const isSelf = Boolean(
                  (userInfo?.id && m.userId === userInfo.id) ||
                  (userInfo?.email && m.email.toLowerCase() === userInfo.email.toLowerCase())
                );
                const isTargetAboveCaller = !isOwner && (
                  (m.role === "ADMIN" && activeOrg?.role !== "ADMIN") ||
                  ((BigInt(m.permissions || "0") & ~callerPerms) !== BigInt(0))
                );

                return (
                  <TableRow key={m.id} className="hover:bg-foreground/2 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <Avatar className="size-12 rounded-full border border-border/40 shrink-0">
                          {m.avatar ? <AvatarImage src={m.avatar} alt={m.name || "Member"} /> : null}
                          <AvatarFallback className="bg-blue-600/90 text-white font-semibold text-xs">
                            {getFallbackInitial(m.name || m.email || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {m.name || "Member"}
                            </span>
                            {isSelf && (
                              <Badge
                                variant="default"
                                className="text-[10px] p-2 h-4 font-medium rounded-xl select-none shrink-0"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate mt-0.5">
                            {m.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "inline-block w-fit px-2 py-1 rounded-lg text-xs font-semibold leading-normal select-none",
                            getRoleBadgeStyle(m.role),
                          )}
                        >
                          {m.role}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80 font-normal">
                          {ROLE_SUMMARIES[m.role] || "Standard Access"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6 whitespace-nowrap hidden">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium leading-normal select-none",
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
                    </TableCell>

                    <TableCell className="py-4 px-6 whitespace-nowrap text-xs text-muted-foreground font-sans">
                      {formattedDate}
                    </TableCell>

                    <TableCell className="py-4 px-6 whitespace-nowrap">
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
                    </TableCell>

                    <TableCell className="py-4 px-6 whitespace-nowrap text-right">
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
                            {canEditStaff && m.role !== "OWNER" && !isSelf && !isTargetAboveCaller && (
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
                            {isTargetAboveCaller && !isSelf && m.role !== "OWNER" && (
                              <div className="px-2.5 py-1.5 text-[11px] text-muted-foreground/80 font-medium italic flex items-center gap-1.5">
                                <ShieldCheckIcon size={14} weight="bold" className="text-muted-foreground/60" />
                                <span>Higher Privileges</span>
                              </div>
                            )}
                            {isSelf && (
                              <div className="px-2.5 py-1.5 text-[11px] text-muted-foreground/80 font-medium italic flex items-center gap-1.5">
                                <ShieldCheckIcon size={14} weight="bold" className="text-primary/70" />
                                <span>Your Account</span>
                              </div>
                            )}
                            {m.role === "OWNER" && !isSelf && (
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
                            {canRemoveMembers && m.role !== "OWNER" && !isSelf && (
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(managingMember)}
        onOpenChange={(open) => !open && setManagingMember(null)}
      >
        <DialogContent
          className="sm:max-w-4xl w-[95vw] h-[88vh] max-h-[88vh] p-0 flex flex-col gap-0 rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="px-6 py-3 bg-secondary/30 shrink-0 absolute z-10 top-0 left-0 backdrop-blur-xl w-full rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-12 rounded-full border border-border shrink-0">
                  {managingMember?.avatar ? (
                    <AvatarImage src={managingMember.avatar} alt={managingMember.name || "Member"} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {getFallbackInitial(managingMember?.name || managingMember?.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="flex items-center gap-2 -mt-0.5">
                    <DialogTitle className="text-lg font-semibold text-foreground font-sans truncate">
                      {managingMember?.name || "Staff Member"}
                    </DialogTitle>
                    <span className={cn("px-2 py-1 rounded-md text-[10px] font-semibold", getRoleBadgeStyle(dialogRole))}>
                      {dialogRole}
                    </span>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground font-sans truncate">
                    {managingMember?.email}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-0.5 p-0.5 bg-muted/60 rounded-lg">
                <Button
                  variant={"ghost"}
                  onClick={() => setDialogTab("org")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    dialogTab === "org"
                      ? "bg-foreground text-background hover:bg-foreground/90! hover:text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <ShieldCheckIcon size={14} weight="bold" />
                  <span>Org Role & Permissions</span>
                </Button>

                <Button
                  variant={"ghost"}
                  onClick={() => setDialogTab("streamers")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    dialogTab === "streamers"
                      ? "bg-foreground text-background hover:bg-foreground/90! hover:text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <BroadcastIcon size={14} weight="bold" />
                  <span>Channel Assignments</span>
                  <span className={cn(
                    "ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                    dialogTab === "streamers"
                      ? "bg-background text-foreground"
                      : "bg-primary/20 text-primary",
                  )}>
                    {dialogRole === "OWNER" || dialogRole === "ADMIN" ? streamers.length : dialogAssignments.length}
                  </span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="overflow-y-auto">
            <div className="flex flex-col gap-6 p-2 pt-20">
              {dialogTab === "org" ? (
                <div className="flex flex-col gap-2 max-w-5xl mx-auto w-full">
                  <div className="py-5 px-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Organization Role Preset</h3>
                        <p className="text-xs text-muted-foreground">Select a standard preset to automatically populate the 64-bit permission bitmask.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-1 bg-primary/5 rounded-2xl">
                      {["ADMIN", "MANAGER", "EDITOR", "VIEWER", "MEMBER"].map((role) => {
                        const isSelected = dialogRole === role;
                        const presetPerms = RolePresets[role] ?? BigInt(0);
                        const isLocked = !isOwner && ((presetPerms & ~callerPerms) !== BigInt(0));
                        return (
                          <Button
                            key={role}
                            variant={isSelected ? "default" : "ghost"}
                            disabled={isLocked}
                            onClick={() => !isLocked && handleSelectRolePreset(role)}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-xl h-max text-center transition-all"
                            )}
                          >
                            <span className="text-xs font-semibold">{role}</span>
                            <span className="text-[10px] opacity-70 mt-0.5">
                              {isLocked ? "Locked" : ROLE_SUMMARIES[role]?.split("·")[0] || "Role"}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {ORG_PERM_DEFINITIONS.map((cat) => (
                      <div
                        key={cat.category}
                        className="p-3 rounded-2xl flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn("p-2 rounded-lg", cat.color)}>{cat.icon}</div>
                          <h4 className="text-base font-semibold text-foreground">{cat.category}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pt-1">
                          {cat.perms.map((p) => {
                            const isGranted = (dialogPerms & p.bit) === p.bit;
                            const isLocked = !isOwner && ((callerPerms & p.bit) !== p.bit);
                            return (
                              <div
                                key={p.key}
                                onClick={() => {
                                  if (dialogRole !== "OWNER" && !isLocked) toggleOrgPermBit(p.bit);
                                }}
                                className={cn(
                                  "flex items-start justify-between gap-3 p-3 rounded-lg select-none",
                                  isLocked
                                    ? "opacity-50 cursor-not-allowed"
                                    : isGranted
                                      ? "bg-primary/5 cursor-pointer"
                                      : "bg-secondary/10 hover:bg-secondary/20 cursor-pointer",
                                  dialogRole === "OWNER" && "cursor-not-allowed opacity-80",
                                )}
                              >
                                <div className="grid leading-tight min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-foreground">{p.name}</span>
                                    {isLocked && (
                                      <span className="text-[10px] text-amber-500 font-medium border border-amber-500/20 bg-amber-500/10 px-1 py-0.2 rounded">
                                        Locked
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{p.desc}</span>
                                </div>
                                <Switch
                                  checked={isGranted}
                                  onCheckedChange={() => !isLocked && toggleOrgPermBit(p.bit)}
                                  disabled={dialogRole === "OWNER" || isLocked}
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
                <div className="flex flex-col gap-2 max-w-5xl mx-auto w-full">
                  {dialogRole === "OWNER" || dialogRole === "ADMIN" ? (
                    <div className="p-5 rounded-2xl bg-blue-500/10 flex items-center gap-5">
                      <ShieldCheckIcon size={24} weight="bold" className="text-blue-400 shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Unrestricted Channel Privileges
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          Organization {dialogRole}s automatically have full access and management permissions across all channels.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5 max-w-lg">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
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
                          variant="secondary"
                          size="xs"
                          onClick={handleAssignAllStreamers}
                          className="rounded-xl text-xs p-3 h-max font-medium"
                        >
                          Assign All
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          onClick={handleUnassignAllStreamers}
                          className="rounded-xl text-xs p-3 h-max font-medium"
                        >
                          Unassign All
                        </Button>
                      </div>
                    </div>
                  )}

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
                              "rounded-2xl transition-all overflow-hidden bg-primary/5 shadow-xs",
                              assigned ? "shadow-md" : "opacity-80",
                            )}
                          >
                            <div
                              onClick={() => !isOwnerOrAdmin && toggleStreamerAssignment(st.id)}
                              className={cn(
                                "p-4 bg-secondary/30 rounded-xl m-1.5 mb-0 flex items-center justify-between gap-4 select-none transition-interactive",
                                !isOwnerOrAdmin && "cursor-pointer hover:bg-secondary/50",
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="size-12 rounded-xl border border-border shrink-0">
                                  {st.avatar ? (
                                    <AvatarImage src={st.avatar} alt={st.displayName || st.name} className={"rounded-xl"} />
                                  ) : null}
                                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs rounded-xl">
                                    {getFallbackInitial(st.displayName || st.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="grid min-w-0 leading-tight">
                                  <span className="font-semibold text-base text-foreground truncate">
                                    {st.displayName || st.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground/80 font-sans truncate">
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

                            {assigned ? (
                              <div className="p-4 flex flex-col gap-3">
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
                                      className="text-[11px] text-primary font-medium"
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
                                      className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 pb-1">
                                  {STREAMER_PERM_DEFINITIONS.map((sp) => {
                                    const isChecked = assignedPerms.includes(sp.key);
                                    return (
                                      <button
                                        key={sp.key}
                                        type="button"
                                        onClick={() => toggleStreamerPermission(st.id, sp.key)}
                                        className={cn(
                                          "flex flex-col text-left p-3 rounded-lg transition-all cursor-pointer",
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
          </ScrollArea>

          <DialogFooter className="px-6 py-3.5 mt-auto border-t border-border bg-secondary/20 flex flex-row items-center justify-between shrink-0 sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Configuring privileges for <strong className="text-foreground">{managingMember?.name || managingMember?.email}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setManagingMember(null)}
                disabled={isSavingPermissions}
                className="rounded-xl text-xs p-3 h-max"
              >
                Cancel
              </Button>
              {canManageRoles && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className="gap-2 rounded-xl text-xs font-semibold p-3 h-max"
                >
                  {isSavingPermissions ? <Spinner className="size-3.5" /> : <CheckIcon size={14} weight="bold" />}
                  <span>Save Changes</span>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md! rounded-3xl p-6" showCloseButton={false}>
          {!createdInviteCode ? (
            inviteStep === 1 ? (
              <>
                <DialogHeader>
                  <div className="bg-primary/10 p-2.5 size-12 rounded-2xl text-primary flex items-center justify-center mb-2">
                    <HandshakeIcon weight="bold" size={22} />
                  </div>
                  <DialogTitle className="text-2xl font-semibold">Work together always better!</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                    Enter the email address of a registered Alertbox user to invite them to this organization.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCheckEmail} className="flex flex-col gap-4 mt-2">
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
                      fontStyle={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                      className="w-full"
                      classNames={{ base: "h-10 rounded-xl" }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      Must be registered in Alertbox. We will verify their identity before proceeding.
                    </span>
                  </div>

                  <DialogFooter className="mt-4 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCloseInvite}
                      className="rounded-xl p-2 h-max text-xs font-semibold gap-2 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCheckingEmail || !inviteEmail.trim()}
                      className="rounded-xl p-2 h-max text-xs font-semibold gap-2 cursor-pointer"
                    >
                      {isCheckingEmail ? <Spinner className="size-4" /> : <ArrowRightIcon size={16} weight="bold" />}
                      <span>Continue</span>
                    </Button>
                  </DialogFooter>
                </form>
              </>
            ) : (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => setInviteStep(1)}
                      className="p-1 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Back to email"
                    >
                      <ArrowLeftIcon size={18} weight="bold" />
                    </button>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Step 2 of 2</span>
                  </div>
                  <DialogTitle className="text-2xl font-semibold">Verify Member Identity</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                    Confirm member identity and configure their assigned role and permissions.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                  <div className="p-3.5 rounded-2xl border border-border bg-accent/30 flex items-center gap-3.5">
                    <Avatar className="size-12 rounded-xl border border-border shrink-0">
                      <AvatarImage src={verifiedTargetUser?.avatar || undefined} className="rounded-xl" />
                      <AvatarFallback className="rounded-xl bg-blue-600 text-white font-bold text-sm">
                        {getFallbackInitial(verifiedTargetUser?.name || verifiedTargetUser?.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {verifiedTargetUser?.name || "Alertbox User"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 shrink-0">
                          <CheckCircleIcon size={12} weight="bold" />
                          Verified
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate font-mono">
                        {verifiedTargetUser?.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Role & Access Level</label>
                    <Popover open={isRolePopoverOpen} onOpenChange={setIsRolePopoverOpen}>
                      <PopoverTrigger
                        type="button"
                        className={cn(
                          "w-full flex items-center justify-between gap-3 p-3 rounded-2xl border border-input bg-background/50 hover:bg-accent/40 text-left transition-all cursor-pointer outline-none focus:ring-1 focus:ring-primary shadow-xs",
                          isRolePopoverOpen && "ring-1 ring-primary border-primary",
                        )}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {selectedInviteRoleObj.label}
                            </span>
                            <span className={cn("px-1.5 py-0.2 rounded text-[10px] font-medium border capitalize", selectedInviteRoleObj.badgeStyle)}>
                              {selectedInviteRoleObj.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {selectedInviteRoleObj.desc}
                          </span>
                        </div>
                        <CaretUpDownIcon size={16} weight="bold" className="text-muted-foreground shrink-0 ml-1" />
                      </PopoverTrigger>

                      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) max-w-sm p-1.5 rounded-2xl bg-card border border-border shadow-xl">
                        <div className="flex flex-col gap-1">
                          {INVITE_ROLES.map((r) => {
                            const isSelected = r.value === inviteRole;
                            return (
                              <button
                                key={r.value}
                                type="button"
                                onClick={() => {
                                  setInviteRole(r.value);
                                  setIsRolePopoverOpen(false);
                                }}
                                className={cn(
                                  "flex items-start justify-between gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer",
                                  isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground",
                                )}
                              >
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-foreground">
                                      {r.label}
                                    </span>
                                    <span className={cn("px-1.5 py-0.2 rounded text-[10px] font-medium border capitalize", r.badgeStyle)}>
                                      {r.label}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                    {r.desc}
                                  </span>
                                </div>
                                {isSelected && (
                                  <CheckIcon size={16} weight="bold" className="text-primary shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <DialogFooter className="mt-4 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setInviteStep(1)}
                      className="rounded-xl p-2 h-max text-xs font-semibold gap-2 cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleInvite()}
                      disabled={isInviting}
                      className="rounded-xl p-2 h-max text-xs font-semibold gap-2 cursor-pointer"
                    >
                      {isInviting ? <Spinner className="size-4" /> : <UserPlusIcon size={16} weight="bold" />}
                      <span>Generate Invite Code</span>
                    </Button>
                  </DialogFooter>
                </div>
              </>
            )
          ) : (
            <div className="flex flex-col gap-4 select-none">
              <DialogHeader>
                <div className="bg-emerald-500/10 p-2.5 size-12 rounded-2xl text-emerald-500 flex items-center justify-center mb-1">
                  <CheckCircleIcon weight="bold" size={24} />
                </div>
                <DialogTitle className="text-2xl font-semibold text-foreground">
                  Invitation Code Created
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                  Share this 8-digit OTP code with <strong className="p-1 bg-muted rounded-md">{createdInviteCode.email}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-2xl bg-primary/5 flex flex-col items-center gap-6">
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
                  className="rounded-xl p-2 h-max text-xs font-semibold gap-2"
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

              <div className="flex flex-col gap-1.5 text-xs">
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

              <DialogFooter className="mt-3">
                <Button
                  type="button"
                  onClick={handleCloseInvite}
                  className="rounded-xl p-2 w-full h-max text-xs font-semibold gap-2"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingMember)} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6" showCloseButton={false}>
          <DialogHeader>
            <div className="bg-destructive/10 p-2.5 size-12 rounded-2xl text-destructive flex items-center justify-center mb-2">
              <HandWavingIcon weight="bold" size={22} />
            </div>
            <DialogTitle className="text-2xl font-semibold">Remove Member</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
              Are you sure you want to remove <strong>{deletingMember?.name || deletingMember?.email}</strong> from {activeOrg?.name}? They will lose access to all channels immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingMember(null)}
              className="rounded-xl p-3 h-max text-xs font-semibold gap-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isDeleting}
              className="rounded-xl p-3 h-max text-xs font-semibold gap-2"
            >
              {isDeleting ? <Spinner /> : <TrashIcon size={16} weight="bold" />}
              <span>Remove Member</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
