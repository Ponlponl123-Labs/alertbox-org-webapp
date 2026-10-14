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
  PencilSimpleIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CopySimpleIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  DotsThreeVerticalIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { getFallbackInitial, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  streamers?: StreamerMini[];
}

export default function OrgMembersPage() {
  const routeParams = useParams();
  const { activeOrg, authFetch } = useUserContext();
  const [members, setMembers] = useState<OrgMemberData[]>([]);
  const [customPresets, setCustomPresets] = useState<{
    id: string;
    name: string;
    description: string | null;
    color: string;
    permissions: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const [editingMember, setEditingMember] = useState<OrgMemberData | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
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

  const fetchMembers = useCallback(() => {
    if (!orgTarget) return;
    authFetch(getApiUrl(`/api/v1/org/${orgTarget}/members`))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setMembers(data);
      })
      .catch(() => toast.error("Failed to load organization members"))
      .finally(() => {
        setLoading(false);
      });

    authFetch(getApiUrl(`/api/v1/org/${orgTarget}/permissions/presets`))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCustomPresets(data || []))
      .catch(() => {});
  }, [orgTarget, authFetch]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !orgTarget) return;
    setIsInviting(true);
    const isCustom = inviteRole.startsWith("custom:");
    const customPreset = isCustom
      ? customPresets.find((p) => p.id === inviteRole.replace("custom:", ""))
      : null;
    const payload = isCustom && customPreset
      ? { email: inviteEmail.trim(), role: "MEMBER", permissions: customPreset.permissions }
      : { email: inviteEmail.trim(), role: inviteRole };

    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}/invites`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedInviteCode({
          code: data.code,
          email: data.email,
          role: data.role,
          expiresAt: data.expiresAt,
        });
        toast.success(`8-digit invitation code generated!`);
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

  const handleUpdateRole = async () => {
    if (!editingMember || !orgTarget || !newRole) return;
    setIsUpdatingRole(true);
    const isCustom = newRole.startsWith("custom:");
    const customPreset = isCustom
      ? customPresets.find((p) => p.id === newRole.replace("custom:", ""))
      : null;
    const payload = isCustom && customPreset
      ? { role: "MEMBER", permissions: customPreset.permissions }
      : { role: newRole };

    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/members/${editingMember.id}`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editingMember.id
              ? {
                  ...m,
                  role: payload.role || m.role,
                  permissions: customPreset ? customPreset.permissions : m.permissions,
                }
              : m,
          ),
        );
        toast.success("Member role updated");
        setEditingMember(null);
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to update role");
      }
    } catch {
      toast.error("Network error updating role");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!deletingMember || !orgTarget) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/members/${deletingMember.id}`),
        {
          method: "DELETE",
        },
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
      case "DEVELOPER":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "EDITOR":
      case "DESIGNER":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "VIEWER":
        return "bg-zinc-800 text-zinc-300 border-zinc-700/50";
      default:
        return "bg-zinc-800/80 text-zinc-400 border-zinc-700/40";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Owner";
      case "ADMIN":
        return "Admin";
      case "MANAGER":
        return "Manager";
      case "EDITOR":
        return "Editor";
      case "VIEWER":
        return "Viewer";
      default:
        return role.charAt(0) + role.slice(1).toLowerCase();
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Away":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-800/80 text-zinc-400 border-zinc-700/40";
    }
  };

  const streamers = activeOrg?.streamers || [];

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <UsersIcon size={16} weight="bold" />
            <span>Organization Members</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Staff & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage team roles, staff permissions, and assigned channel access for {activeOrg?.name}.
          </p>
        </div>

        <Button
          onClick={() => setIsInviteOpen(true)}
          className="gap-2 rounded-xl text-xs font-semibold px-4 py-2"
        >
          <UserPlusIcon size={16} weight="bold" />
          <span>Invite Member</span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
        </span>
      </div>

      <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-xs font-semibold text-muted-foreground select-none">
                <th className="py-3.5 px-6 font-semibold">Member</th>
                <th className="py-3.5 px-6 font-semibold">Role</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Joined Date</th>
                <th className="py-3.5 px-6 font-semibold">Assigned Streamers</th>
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
                  const assignedStreamers = m.streamers && m.streamers.length > 0 ? m.streamers : streamers;
                  const memberStatus = m.status || "Active";
                  const formattedDate = m.joinedAt
                    ? new Date(m.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-foreground/2 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <Avatar className="size-10 rounded-full border border-border/40 shrink-0">
                            {m.avatar ? (
                              <AvatarImage src={m.avatar} alt={m.name || "Member"} />
                            ) : null}
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
                        {(() => {
                          const customMatch = customPresets.find((cp) => cp.permissions === m.permissions);
                          if (customMatch) {
                            return (
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={cn(
                                    "inline-block w-fit px-2.5 py-0.5 rounded-md text-xs font-semibold border leading-normal",
                                    customMatch.color || "text-primary bg-primary/10 border-primary/20",
                                  )}
                                >
                                  {customMatch.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground/80 font-normal">
                                  {customMatch.description || "Custom Org Preset"}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={cn(
                                  "inline-block w-fit px-2.5 py-0.5 rounded-md text-xs font-semibold border leading-normal",
                                  getRoleBadgeStyle(m.role),
                                )}
                              >
                                {getRoleLabel(m.role)}
                              </span>
                              <span className="text-[11px] text-muted-foreground/80 font-normal">
                                {ROLE_SUMMARIES[m.role] || "Standard Access"}
                              </span>
                            </div>
                          );
                        })()}
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
                              memberStatus === "Active"
                                ? "bg-emerald-400"
                                : memberStatus === "Away"
                                  ? "bg-amber-400"
                                  : "bg-zinc-400",
                            )}
                          />
                          {memberStatus}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {formattedDate}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {assignedStreamers.length > 0 ? (
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {assignedStreamers.slice(0, 3).map((st) => (
                              <Avatar
                                key={st.id}
                                className="size-7 ring-2 ring-card border border-border/50 shrink-0"
                                title={st.displayName || st.name}
                              >
                                {st.avatar ? (
                                  <AvatarImage
                                    src={st.avatar}
                                    alt={st.displayName || st.name}
                                  />
                                ) : (
                                  <AvatarFallback className="text-[9px] bg-blue-600 text-white font-bold">
                                    {getFallbackInitial(st.displayName || st.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            ))}
                            {assignedStreamers.length > 3 && (
                              <span
                                className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground ring-2 ring-card"
                                title={assignedStreamers
                                  .slice(3)
                                  .map((s) => s.displayName || s.name)
                                  .join(", ")}
                              >
                                +{assignedStreamers.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">
                            All channels
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
                            className="w-48 p-1.5 rounded-2xl border border-border shadow-xl bg-popover"
                          >
                            <div className="flex flex-col gap-0.5 text-xs">
                              {m.role !== "OWNER" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenuMemberId(null);
                                    setEditingMember(m);
                                    const customMatch = customPresets.find((cp) => cp.permissions === m.permissions);
                                    setNewRole(customMatch ? `custom:${customMatch.id}` : m.role);
                                  }}
                                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-accent hover:text-accent-foreground text-foreground transition-colors text-left font-medium cursor-pointer"
                                >
                                  <PencilSimpleIcon size={14} weight="bold" className="text-muted-foreground" />
                                  <span>Edit Role</span>
                                </button>
                              ) : (
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
                              {m.role !== "OWNER" && (
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

      <Dialog
        open={isInviteOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseInvite();
          else setIsInviteOpen(true);
        }}
      >
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
                  <label className="text-xs font-semibold text-foreground/80">
                    Role & Access Level
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground outline-none focus:border-primary/50"
                  >
                    <optgroup label="System Presets">
                      <option value="MEMBER">Member (Standard staff)</option>
                      <option value="VIEWER">Viewer (Read-only)</option>
                      <option value="EDITOR">Editor (Manage streamers & widgets)</option>
                      <option value="MANAGER">Manager (Manage staff & streams)</option>
                      <option value="ADMIN">Admin (Full access except owner)</option>
                    </optgroup>
                    {customPresets.length > 0 && (
                      <optgroup label="Custom Organization Presets">
                        {customPresets.map((cp) => (
                          <option key={cp.id} value={`custom:${cp.id}`}>
                            {cp.name} (Custom Preset)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <DialogFooter className="mt-4 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseInvite}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim()}
                    className="rounded-xl gap-2 font-semibold"
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
                  className="rounded-xl text-xs gap-1.5"
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
                  <span className="font-semibold text-primary capitalize">
                    {createdInviteCode.role.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Validity:</span>
                  <span className="font-semibold text-amber-500 flex items-center gap-1 font-mono">
                    <ClockCountdownIcon size={14} />
                    <span>5 Minutes (Single-Use)</span>
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The target user should open <strong>Join Organization</strong> and enter this code to confirm and join. Only 1 active code is allowed per organization at any time.
              </p>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  onClick={handleCloseInvite}
                  className="rounded-xl w-full font-semibold text-xs"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingMember)} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6" showCloseButton={false}>
          <DialogHeader>
            <div className="bg-primary/10 p-2.5 size-12 rounded-2xl text-primary flex items-center justify-center mb-2">
              <PencilSimpleIcon weight="bold" size={22} />
            </div>
            <DialogTitle className="text-xl font-bold">Edit Member Role</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Change the role and permissions for {editingMember?.name || editingMember?.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Select Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground outline-none focus:border-primary/50"
              >
                <optgroup label="System Presets">
                  <option value="MEMBER">Member (Standard staff)</option>
                  <option value="VIEWER">Viewer (Read-only)</option>
                  <option value="EDITOR">Editor (Manage streamers & widgets)</option>
                  <option value="MANAGER">Manager (Manage staff & streams)</option>
                  <option value="ADMIN">Admin (Full access except owner)</option>
                </optgroup>
                {customPresets.length > 0 && (
                  <optgroup label="Custom Organization Presets">
                    {customPresets.map((cp) => (
                      <option key={cp.id} value={`custom:${cp.id}`}>
                        {cp.name} (Custom Preset)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingMember(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateRole}
                disabled={isUpdatingRole}
                className="rounded-xl gap-2 font-semibold"
              >
                {isUpdatingRole ? <Spinner /> : <CheckIcon size={16} weight="bold" />}
                <span>Save Changes</span>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingMember)} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6" showCloseButton={false}>
          <DialogHeader>
            <div className="bg-destructive/10 p-2.5 size-12 rounded-2xl text-destructive flex items-center justify-center mb-2">
              <TrashIcon weight="bold" size={22} />
            </div>
            <DialogTitle className="text-xl font-bold">Remove Member</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Are you sure you want to remove {deletingMember?.name || deletingMember?.email} from {activeOrg?.name}? They will lose access to all channels immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingMember(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isDeleting}
              className="rounded-xl gap-2 font-semibold"
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
