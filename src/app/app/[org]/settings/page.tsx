"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import {
  GearSixIcon,
  ShieldCheckIcon,
  TrashIcon,
  CopySimpleIcon,
  CheckIcon,
  WarningOctagonIcon,
  IdentificationCardIcon,
  CameraIcon,
  LockSimpleIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { getFallbackInitial } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropperModal } from "@/components/image-cropper-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function OrgSettingsPage() {
  const routeParams = useParams();
  const router = useRouter();
  const { activeOrg, authFetch, patchOrg } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);

  const [name, setName] = useState(activeOrg?.name || "");
  const [avatar, setAvatar] = useState(activeOrg?.avatar || "");
  const [banner, setBanner] = useState(activeOrg?.banner || "");
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Danger zone
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full py-4">
      {/* Hidden File Inputs for Direct Upload */}
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

      {/* Header */}
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

      <div className="flex flex-col gap-6">
        {/* Branding & Visual Identity Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
          {/* Banner Container */}
          <div className="relative w-full h-44 sm:h-52 bg-linear-to-r from-secondary/80 via-secondary/40 to-muted/60 border-b border-border flex items-center justify-center overflow-hidden group">
            {banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner}
                alt="Organization Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/60 select-none">
                <ImageIcon size={36} weight="duotone" />
                <span className="text-xs font-medium">No banner uploaded</span>
              </div>
            )}

            {/* Banner Overlay Actions */}
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

            {/* Bottom-left Overlapping Avatar */}
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
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer border-4 border-transparent"
                  title="Change Logo"
                >
                  <CameraIcon size={18} weight="bold" />
                  <span className="text-[10px] font-semibold mt-0.5">Edit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Under-banner Info Header */}
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
          </div>

          {/* General Form */}
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
          </form>
        </div>

        {/* Organization Metadata Card */}
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
                  Organization ID
                </span>
                <p className="font-mono font-semibold text-foreground mt-0.5">
                  {activeOrg?.id || "N/A"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(String(activeOrg?.id || ""));
                  setCopiedId(true);
                  toast.success("Organization ID copied");
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="size-8 p-0 rounded-lg cursor-pointer"
                title="Copy Org ID"
              >
                {copiedId ? <CheckIcon size={14} className="text-emerald-500" /> : <CopySimpleIcon size={14} />}
              </Button>
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

        {/* Danger Zone */}
        {isOwner && (
          <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <WarningOctagonIcon size={20} weight="bold" />
              </div>
              <div>
                <h2 className="text-base font-bold text-destructive">Danger Zone</h2>
                <p className="text-xs text-muted-foreground">Irreversible administrative actions.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="max-w-md">
                <p className="text-xs font-semibold text-foreground">Delete this organization</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Permanently delete this organization, all attached streamer channels, widgets, and team memberships. This action cannot be undone.
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
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        image={imageToCrop}
        cropShape={cropType === "avatar" ? "round" : "rect"}
        aspect={cropType === "avatar" ? 1 : 3}
        title={cropType === "avatar" ? "Crop Organization Logo" : "Crop Organization Banner"}
        onCropComplete={onCropComplete}
      />

      {/* Confirmation Dialog: Delete Organization */}
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
    </div>
  );
}
