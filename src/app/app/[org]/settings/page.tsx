"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import {
  GearSixIcon,
  ShieldCheckIcon,
  TrashIcon,
  CheckIcon,
  WarningOctagonIcon,
  IdentificationCardIcon,
  CameraIcon,
  LockSimpleIcon,
  ImageIcon,
  ArrowsLeftRightIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CaretUpDownIcon,
  MagnifyingGlassIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropperModal } from "@/components/features/modals/image-cropper-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hasPermission, OrgPerm } from "@/lib/rbac";
import type { CropType, TransferStep, OrgMemberOption } from "@/types";
import { TRANSFER_CONFIRM_PHRASE } from "@/consts/org";

export default function OrgSettingsPage() {
  const routeParams = useParams();
  const router = useRouter();
  const { activeOrg, authFetch, patchOrg, removeOrganization, refreshUserInfo } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);

  const [name, setName] = useState(activeOrg?.name || "");
  const [avatar, setAvatar] = useState(activeOrg?.avatar || "");
  const [banner, setBanner] = useState(activeOrg?.banner || "");
  const [isSaving, setIsSaving] = useState(false);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [members, setMembers] = useState<OrgMemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberComboboxOpen, setMemberComboboxOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [transferStep, setTransferStep] = useState<TransferStep>(1);
  const [transferAck, setTransferAck] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<CropType>("avatar");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Keep state synchronized when active organization switches
  const prevOrgIdRef = useRef(activeOrg?.id);
  useEffect(() => {
    if (activeOrg && activeOrg.id !== prevOrgIdRef.current) {
      prevOrgIdRef.current = activeOrg.id;
      setName(activeOrg.name);
      setAvatar(activeOrg.avatar || "");
      setBanner(activeOrg.banner || "");
    }
  }, [activeOrg]);

  const isOwner = activeOrg?.role === "OWNER";
  const isOwnerOrAdmin = isOwner || activeOrg?.role === "ADMIN";
  const canManageSettings = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MANAGE);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropType(type);
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    if (!orgTarget) return;
    try {
      const formData = new FormData();
      formData.append(cropType, croppedBlob, `${cropType}.webp`);

      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}`), {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        if (cropType === "avatar") {
          setAvatar(updated.avatar || "");
          patchOrg({ avatar: updated.avatar });
        } else {
          setBanner(updated.banner || "");
          patchOrg({ banner: updated.banner });
        }
        toast.success(`Organization ${cropType} updated successfully`);
      } else if (res.status === 451) {
        const msg = await res.text();
        toast.error(msg || "Image contains inappropriate content");
      } else {
        const msg = await res.text();
        toast.error(msg || `Failed to update ${cropType}`);
      }
    } catch {
      toast.error(`Network error uploading ${cropType}`);
    }
  };

  const handleRemoveMedia = async (type: "avatar" | "banner") => {
    if (!orgTarget) return;
    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: null }),
      });

      if (res.ok) {
        if (type === "avatar") {
          setAvatar("");
          patchOrg({ avatar: null });
        } else {
          setBanner("");
          patchOrg({ banner: null });
        }
        toast.success(`Organization ${type} removed`);
      } else {
        toast.error(`Failed to remove ${type}`);
      }
    } catch {
      toast.error(`Network error removing ${type}`);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgTarget || !name.trim()) return;
    setIsSaving(true);

    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        patchOrg({ name: data.name });
        toast.success("Organization name updated successfully");
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to update settings");
      }
    } catch {
      toast.error("Network error updating settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!orgTarget || confirmSlug !== activeOrg?.slug) return;
    setIsDeleting(true);

    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}`), {
        method: "DELETE",
      });

      if (res.ok) {
        if (activeOrg) removeOrganization(activeOrg.id);
        toast.success("Organization deleted successfully");
        setIsDeleteOpen(false);
        router.push("/app");
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to delete organization");
      }
    } catch {
      toast.error("Network error deleting organization");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeaveOrg = async () => {
    if (!orgTarget || isLeaving) return;
    setIsLeaving(true);
    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}/leave`), {
        method: "POST",
      });

      if (res.ok) {
        if (activeOrg) removeOrganization(activeOrg.id);
        toast.success(`You have left ${activeOrg?.name || "the organization"}`);
        setIsLeaveOpen(false);
        await refreshUserInfo();
        router.push("/app");
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to leave organization");
      }
    } catch {
      toast.error("Network error while leaving organization");
    } finally {
      setIsLeaving(false);
    }
  };

  const openTransferDialog = async () => {
    setIsTransferOpen(true);
    setTransferStep(1);
    setTransferAck(false);
    setConfirmPhrase("");
    setSelectedMemberId("");
    setMemberComboboxOpen(false);
    setMemberSearchQuery("");
    setLoadingMembers(true);
    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}/members`));
      if (res.ok) {
        const data = await res.json();
        const nonOwners = (Array.isArray(data) ? data : []).filter(
          (m: { role: string }) => m.role !== "OWNER",
        );
        setMembers(nonOwners);
        if (nonOwners.length > 0) {
          setSelectedMemberId(nonOwners[0].id);
        }
      }
    } catch {
      toast.error("Failed to load organization members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedMemberId || isTransferring || confirmPhrase !== TRANSFER_CONFIRM_PHRASE || !transferAck) return;
    setIsTransferring(true);
    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${orgTarget}/transfer`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMemberId: selectedMemberId }),
      });

      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to transfer ownership");
        return;
      }

      toast.success("Organization ownership transferred successfully!");
      setIsTransferOpen(false);
      await refreshUserInfo();
      router.refresh();
    } catch {
      toast.error("Network error while transferring ownership");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full py-4">
      <input
        type="file"
        ref={avatarInputRef}
        onChange={(e) => handleFileChange(e, "avatar")}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={bannerInputRef}
        onChange={(e) => handleFileChange(e, "banner")}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <GearSixIcon size={16} weight="bold" />
            <span>Organization Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Organization Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage organization branding, banner, logo, and administrative parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-secondary/80 text-foreground">
            Role: {activeOrg?.role || "MEMBER"}
          </span>
        </div>
      </div>

      {!canManageSettings && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border/80 bg-muted/40 text-xs text-muted-foreground">
          <LockSimpleIcon size={16} weight="bold" className="text-muted-foreground shrink-0" />
          <span>You are viewing organization settings in read-only mode. Organization management permissions are required to edit branding or settings.</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
          <div className="relative w-full h-44 sm:h-52 bg-linear-to-r from-secondary/80 via-secondary/40 to-muted/60 border-b border-border flex items-center justify-center overflow-hidden group">
            {banner ? (
              <Image
                src={banner}
                alt="Organization Banner"
                width={800}
                height={208}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/60 select-none">
                <ImageIcon size={36} weight="duotone" />
                <span className="text-xs font-medium">No banner uploaded</span>
              </div>
            )}

            {canManageSettings && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => bannerInputRef.current?.click()}
                  className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-md backdrop-blur-md bg-background/80 hover:bg-background border border-border cursor-pointer"
                >
                  <CameraIcon size={14} weight="bold" />
                  <span>{banner ? "Change Banner" : "Upload Banner"}</span>
                </Button>
                {banner && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveMedia("banner")}
                    className="h-8 px-2.5 rounded-xl text-xs font-semibold text-destructive hover:text-destructive shadow-md backdrop-blur-md bg-background/80 hover:bg-destructive/10 border border-destructive/20 cursor-pointer"
                    title="Remove banner"
                  >
                    <TrashIcon size={14} weight="bold" />
                  </Button>
                )}
              </div>
            )}

            <div className="absolute -bottom-8 left-6 flex items-end gap-3 z-10">
              <div className="relative group/avatar">
                <Avatar className="size-20 sm:size-22 rounded-2xl border-4 border-card shadow-md bg-card shrink-0">
                  {avatar ? (
                    <AvatarImage src={avatar} alt={name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="font-bold text-xl bg-primary/10 text-primary rounded-2xl">
                      {getFallbackInitial(name || activeOrg?.name || "Org")}
                    </AvatarFallback>
                  )}
                </Avatar>
                {canManageSettings && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer border-4 border-transparent"
                    title="Change Logo"
                  >
                    <CameraIcon size={18} weight="bold" />
                    <span className="text-[10px] font-semibold mt-0.5">Edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-10 pb-6 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {activeOrg?.name || "Organization"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono text-primary font-medium">/app/{activeOrg?.slug}</span>
                <span>•</span>
                <span>{activeOrg?.memberCount ?? 1} members</span>
              </div>
            </div>

            {canManageSettings && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  className="h-8 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
                >
                  <CameraIcon size={14} weight="bold" />
                  <span>Upload Logo</span>
                </Button>
                {avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMedia("avatar")}
                    className="h-8 px-2.5 text-xs rounded-xl text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 cursor-pointer"
                    title="Remove logo"
                  >
                    <TrashIcon size={14} weight="bold" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveGeneral} className="p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Organization Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pixel Studio"
                  required
                  disabled={!canManageSettings}
                  readOnly={!canManageSettings}
                  className="w-full text-xs"
                  classNames={{ base: "h-10 rounded-xl" }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Organization Handle</span>
                    <LockSimpleIcon size={12} weight="bold" className="text-muted-foreground" />
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">Immutable</span>
                </div>
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    value={activeOrg?.slug || ""}
                    disabled
                    readOnly
                    className="w-full text-xs font-mono opacity-80 cursor-not-allowed bg-muted/40"
                    classNames={{ base: "h-10 rounded-xl" }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Slug handle is permanently locked: /app/{activeOrg?.slug || "org"}
                </span>
              </div>
            </div>

            {canManageSettings && (
              <div className="pt-3 border-t border-border/50 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving || !name.trim() || name.trim() === activeOrg?.name}
                  className="gap-2 text-xs font-semibold rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? <Spinner className="size-3.5" /> : <CheckIcon size={14} weight="bold" />}
                  <span>Save Changes</span>
                </Button>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary text-foreground flex items-center justify-center">
              <IdentificationCardIcon size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Organization Credentials</h2>
              <p className="text-xs text-muted-foreground">Internal identifiers and tenancy parameters.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Workspace Handle
                </span>
                <p className="font-mono font-semibold text-foreground mt-0.5">
                  /app/{activeOrg?.slug || "org"}
                </p>
              </div>
              <ShieldCheckIcon size={20} weight="bold" className="text-primary" />
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Access Level
                </span>
                <p className="font-semibold text-foreground mt-0.5">
                  {activeOrg?.role || "MEMBER"} · Full Tenant
                </p>
              </div>
              <ShieldCheckIcon size={20} weight="bold" className="text-primary" />
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ArrowsLeftRightIcon size={20} weight="bold" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Transfer Ownership</h2>
                <p className="text-xs text-muted-foreground">Transfer primary tenancy and owner rights to another active team member.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="max-w-md">
                <p className="text-xs font-semibold text-foreground">Designate a new organization owner</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Each organization can have only a single owner. You will become an Admin with full administrative privileges once transferred.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openTransferDialog}
                className="gap-2 text-xs font-semibold rounded-xl cursor-pointer border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shrink-0"
              >
                <ArrowsLeftRightIcon size={15} weight="bold" />
                <span>Transfer Ownership</span>
              </Button>
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <WarningOctagonIcon size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-destructive">Danger Zone</h2>
              <p className="text-xs text-muted-foreground">Irreversible actions and membership departure.</p>
            </div>
          </div>

          {!isOwner ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="max-w-md">
                <p className="text-xs font-semibold text-foreground">Leave this organization</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Revoke your membership and leave this organization. You will immediately lose access to all channels, widgets, and settings. You can only rejoin if an administrator re-invites you.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsLeaveOpen(true)}
                className="gap-2 text-xs font-semibold rounded-xl cursor-pointer shrink-0"
              >
                <SignOutIcon size={15} weight="bold" />
                <span>Leave Organization</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="max-w-md">
                <p className="text-xs font-semibold text-foreground">Delete this organization</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Permanently delete this organization, all attached streamer channels, widgets, and team memberships. As the owner, you cannot leave without deleting or transferring ownership first.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirmSlug("");
                  setIsDeleteOpen(true);
                }}
                className="gap-2 text-xs font-semibold rounded-xl cursor-pointer shrink-0"
              >
                <TrashIcon size={15} weight="bold" />
                <span>Delete Organization</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ImageCropperModal
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        image={imageToCrop}
        cropShape={cropType === "avatar" ? "round" : "rect"}
        aspect={cropType === "avatar" ? 1 : 3}
        title={cropType === "avatar" ? "Crop Organization Logo" : "Crop Organization Banner"}
        onCropComplete={onCropComplete}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <WarningOctagonIcon size={22} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-destructive">
              Delete Organization Permanently?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This action <strong>CANNOT</strong> be undone. All streamer channels, alert widgets, team members, and presets under <strong>{activeOrg?.name}</strong> will be immediately deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <label className="text-xs font-semibold text-foreground">
              Type your organization slug <code className="text-primary font-mono">{activeOrg?.slug}</code> to confirm:
            </label>
            <Input
              type="text"
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              placeholder={activeOrg?.slug || "org-slug"}
              className="w-full text-xs font-mono"
              classNames={{ base: "h-10 rounded-xl" }}
            />
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteOrg}
              disabled={isDeleting || confirmSlug !== activeOrg?.slug}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isDeleting && <Spinner className="size-3.5" />}
              <span>Delete Permanently</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <SignOutIcon size={22} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-destructive">
              Leave Organization?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Are you sure you want to leave <strong>{activeOrg?.name}</strong>? You will immediately lose access to this organization, its channels, widgets, and administrative tools. An administrator will need to invite you again to rejoin.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLeaveOpen(false)}
              disabled={isLeaving}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveOrg}
              disabled={isLeaving}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isLeaving && <Spinner className="size-3.5" />}
              <span>Confirm & Leave</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <ArrowsLeftRightIcon size={22} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Transfer Organization Ownership
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Transfer ownership of <strong>{activeOrg?.name}</strong>. Each organization can only have one single owner.
            </DialogDescription>
          </DialogHeader>

          {loadingMembers ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <Spinner className="size-5" />
              <span>Loading organization members...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs text-muted-foreground flex flex-col gap-2 mt-2">
              <p className="font-semibold text-foreground">No eligible members found</p>
              <p>There are no other members in this organization to transfer ownership to. Invite members in Members & Staff first.</p>
              <DialogFooter className="mt-4">
                <Button variant="secondary" size="sm" onClick={() => setIsTransferOpen(false)} className="rounded-xl w-full">
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-2">
              {transferStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Select New Owner</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Active Members</span>
                    </label>

                    <Popover open={memberComboboxOpen} onOpenChange={setMemberComboboxOpen}>
                      <PopoverTrigger
                        type="button"
                        className={cn(
                          "w-full flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-input bg-background/50 hover:bg-accent/40 text-left transition-all cursor-pointer outline-none focus:ring-1 focus:ring-primary shadow-xs",
                          memberComboboxOpen && "ring-1 ring-primary border-primary",
                        )}
                      >
                        {(() => {
                          const selectedMember = members.find((m) => m.id === selectedMemberId);
                          if (!selectedMember) {
                            return <span className="text-xs text-muted-foreground pl-1">Select an active team member...</span>;
                          }
                          return (
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="size-8 rounded-full border border-border shrink-0">
                                {selectedMember.avatar && <AvatarImage src={selectedMember.avatar} />}
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                  {getFallbackInitial(selectedMember.name || selectedMember.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 leading-tight">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground truncate">
                                    {selectedMember.name || "Member"}
                                  </span>
                                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md border bg-secondary/80 text-foreground/80 leading-none capitalize">
                                    {selectedMember.role.toLowerCase()}
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {selectedMember.email}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                        <CaretUpDownIcon size={14} weight="bold" className="text-muted-foreground shrink-0 ml-1" />
                      </PopoverTrigger>

                      <PopoverContent
                        align="start"
                        sideOffset={6}
                        className="w-[calc(100vw-2.5rem)] sm:w-100 p-2 rounded-2xl bg-popover border border-border shadow-xl z-50 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-input bg-background/80">
                          <MagnifyingGlassIcon size={14} weight="bold" className="text-muted-foreground shrink-0" />
                          <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="w-full text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                            autoFocus
                          />
                        </div>

                        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-0.5">
                          {(() => {
                            const query = memberSearchQuery.toLowerCase().trim();
                            const filtered = members.filter((m) => {
                              if (!query) return true;
                              return (
                                (m.name && m.name.toLowerCase().includes(query)) ||
                                m.email.toLowerCase().includes(query) ||
                                m.role.toLowerCase().includes(query)
                              );
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                  No members match &ldquo;{memberSearchQuery}&rdquo;
                                </div>
                              );
                            }

                            return filtered.map((m) => {
                              const isSelected = m.id === selectedMemberId;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMemberId(m.id);
                                    setMemberComboboxOpen(false);
                                  }}
                                  className={cn(
                                    "flex items-center justify-between gap-3 p-2 rounded-xl text-left transition-colors cursor-pointer",
                                    isSelected
                                      ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                                      : "hover:bg-accent/60 text-foreground",
                                  )}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Avatar className="size-7 rounded-full border border-border shrink-0">
                                      {m.avatar && <AvatarImage src={m.avatar} />}
                                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                        {getFallbackInitial(m.name || m.email)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0 leading-tight">
                                      <span className="text-xs font-semibold truncate text-foreground">
                                        {m.name || m.email}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground truncate">
                                        {m.email}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md border bg-secondary/80 text-foreground/70 capitalize">
                                      {m.role.toLowerCase()}
                                    </span>
                                    {isSelected && (
                                      <CheckIcon size={14} weight="bold" className="text-primary" />
                                    )}
                                  </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={transferAck}
                      onChange={(e) => setTransferAck(e.target.checked)}
                      className="mt-0.5 rounded border-input size-4 text-primary focus:ring-primary shrink-0"
                    />
                    <span className="text-[11px] text-foreground/90 leading-snug">
                      I understand that transferring ownership will demote my account to <strong>Admin</strong> and grant full control of the organization to the selected member.
                    </span>
                  </label>

                  <DialogFooter className="mt-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTransferOpen(false)}
                      className="text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={!selectedMemberId || !transferAck}
                      onClick={() => setTransferStep(2)}
                      className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRightIcon size={14} weight="bold" />
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex flex-col gap-1.5 leading-relaxed">
                    <span className="font-bold flex items-center gap-1.5">
                      <WarningOctagonIcon size={16} weight="bold" />
                      Final Confirmation Required
                    </span>
                    <p className="text-[11px] text-destructive/90">
                      Once confirmed, only the new owner can transfer ownership back to you. There can only be one owner at a time.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Type <code className="text-destructive font-mono font-bold">{TRANSFER_CONFIRM_PHRASE}</code> to execute:
                    </label>
                    <Input
                      type="text"
                      value={confirmPhrase}
                      onChange={(e) => setConfirmPhrase(e.target.value)}
                      placeholder={TRANSFER_CONFIRM_PHRASE}
                      className="w-full text-xs font-mono"
                      classNames={{ base: "h-10 rounded-xl" }}
                      autoFocus
                    />
                  </div>

                  <DialogFooter className="mt-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransferStep(1)}
                      disabled={isTransferring}
                      className="text-xs rounded-xl cursor-pointer gap-1"
                    >
                      <ArrowLeftIcon size={14} weight="bold" />
                      <span>Back</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleTransferOwnership}
                      disabled={isTransferring || confirmPhrase !== TRANSFER_CONFIRM_PHRASE}
                      className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      {isTransferring && <Spinner className="size-3.5" />}
                      <span>Confirm & Transfer</span>
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
