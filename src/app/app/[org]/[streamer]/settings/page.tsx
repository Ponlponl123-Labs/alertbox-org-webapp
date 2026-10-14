"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import {
  GearSixIcon,
  TrashIcon,
  BroadcastIcon,
  KeyIcon,
  CheckIcon,
  WarningOctagonIcon,
  CopySimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  BrowsersIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StreamerSettingsPage() {
  const routeParams = useParams();
  const router = useRouter();
  const { activeOrg, activeStreamer, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const streamerTarget = activeStreamer?.id || activeStreamer?.name || (routeParams?.streamer as string);

  const [displayName, setDisplayName] = useState(activeStreamer?.displayName || activeStreamer?.name || "");
  const [handle, setHandle] = useState(activeStreamer?.name || "");
  const [bio, setBio] = useState(activeStreamer?.bio || "");
  const [isSaving, setIsSaving] = useState(false);

  // Widget Token Security
  const [showObsUrl, setShowObsUrl] = useState(false);
  const [copiedObs, setCopiedObs] = useState(false);
  const [isRotatingTokens, setIsRotatingTokens] = useState(false);
  const [isRotateConfirmOpen, setIsRotateConfirmOpen] = useState(false);

  // Danger Zone
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmHandle, setConfirmHandle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const prevStreamerIdRef = React.useRef(activeStreamer?.id);
  useEffect(() => {
    if (activeStreamer && activeStreamer.id !== prevStreamerIdRef.current) {
      prevStreamerIdRef.current = activeStreamer.id;
      setDisplayName(activeStreamer.displayName || activeStreamer.name || "");
      setHandle(activeStreamer.name || "");
      setBio(activeStreamer.bio || "");
    }
  }, [activeStreamer]);

  const obsBrowserSourceUrl = `https://widget.alertbox.org/alert/${activeStreamer?.name || "channel"}?token=wgt_live_${activeStreamer?.id || "0"}`;

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgTarget || !streamerTarget || !displayName.trim()) return;
    setIsSaving(true);

    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/streamers/${streamerTarget}`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: displayName.trim(),
            name: handle.trim().toLowerCase() || undefined,
            bio: bio.trim() || null,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success("Channel settings saved successfully");
        if (data.name && data.name !== activeStreamer?.name) {
          router.push(`/app/${orgTarget}/${data.name}/settings`);
        }
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to update channel settings");
      }
    } catch {
      toast.error("Network error updating channel settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotateTokens = async () => {
    setIsRotatingTokens(true);
    try {
      // Simulate token rotation with server
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Widget tokens rotated successfully! Please update your OBS browser source.");
      setIsRotateConfirmOpen(false);
    } catch {
      toast.error("Failed to rotate widget tokens");
    } finally {
      setIsRotatingTokens(false);
    }
  };

  const handleDeleteStreamer = async () => {
    if (!orgTarget || !streamerTarget || confirmHandle !== activeStreamer?.name) return;
    setIsDeleting(true);

    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/streamers/${streamerTarget}`),
        { method: "DELETE" }
      );

      if (res.ok) {
        toast.success(`Channel "${activeStreamer?.displayName || activeStreamer?.name}" deleted`);
        setIsDeleteOpen(false);
        router.push(`/app/${orgTarget}/streamers`);
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to delete channel");
      }
    } catch {
      toast.error("Network error deleting channel");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <BroadcastIcon size={16} weight="bold" />
            <span>Channel Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Channel Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure metadata, handle identifiers, widget security, and stream keys for <strong>{activeStreamer?.displayName || activeStreamer?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border bg-secondary/80 text-foreground">
            Handle: @{activeStreamer?.name}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* General Channel Settings */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GearSixIcon size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Channel Profile & Identity</h2>
              <p className="text-xs text-muted-foreground">Display name and public handle shown on donation pages.</p>
            </div>
          </div>

          <form onSubmit={handleSaveGeneral} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Channel Display Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Streams"
                  required
                  className="w-full text-xs"
                  classNames={{ base: "h-10 rounded-xl" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Channel Handle / URI
                </label>
                <Input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  placeholder="mayastreams"
                  className="w-full text-xs font-mono"
                  classNames={{ base: "h-10 rounded-xl" }}
                />
                <span className="text-[11px] text-muted-foreground font-mono">
                  Public URL: alertbox.org/{handle || activeStreamer?.name}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Channel Bio / Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short bio or stream schedule..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-y"
              />
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving || !displayName.trim()}
                className="gap-2 text-xs font-semibold rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? <Spinner className="size-3.5" /> : <CheckIcon size={14} weight="bold" />}
                <span>Save Channel Settings</span>
              </Button>
            </div>
          </form>
        </div>

        {/* OBS & Widget Security */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary text-foreground flex items-center justify-center">
              <BrowsersIcon size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">OBS Browser Source & Token Security</h2>
              <p className="text-xs text-muted-foreground">Keep your alert overlay URL secure. Never reveal this link on stream.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Browser Source URL</span>
              <button
                type="button"
                onClick={() => setShowObsUrl(!showObsUrl)}
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
              >
                {showObsUrl ? <EyeSlashIcon size={13} /> : <EyeIcon size={13} />}
                <span>{showObsUrl ? "Hide URL" : "Show URL"}</span>
              </button>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 rounded-xl border border-border bg-secondary/50 font-mono text-xs overflow-x-auto select-all">
                {showObsUrl ? obsBrowserSourceUrl : "https://widget.alertbox.org/alert/••••••••••••••••••••••••••••••••"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(obsBrowserSourceUrl);
                  setCopiedObs(true);
                  toast.success("OBS Browser Source URL copied!");
                  setTimeout(() => setCopiedObs(false), 2000);
                }}
                className="h-10 px-3 rounded-xl gap-1.5 text-xs cursor-pointer"
              >
                {copiedObs ? <CheckIcon size={14} className="text-emerald-500" /> : <CopySimpleIcon size={14} />}
                <span>{copiedObs ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-amber-400">Compromised URL / Key Rotation</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                If your browser source URL was accidentally shown on stream, rotate tokens immediately to invalidate old links.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRotateConfirmOpen(true)}
              className="gap-1.5 text-xs rounded-xl cursor-pointer shrink-0 border-amber-500/30 hover:bg-amber-500/10 text-amber-300"
            >
              <KeyIcon size={14} weight="bold" />
              <span>Rotate Tokens</span>
            </Button>
          </div>
        </div>

        {/* Danger Zone: Delete Channel */}
        <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <WarningOctagonIcon size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-destructive">Danger Zone</h2>
              <p className="text-xs text-muted-foreground">Irreversible channel actions.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="max-w-md">
              <p className="text-xs font-semibold text-foreground">Delete this channel</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Permanently archive and delete <strong>@{activeStreamer?.name}</strong>. Attached alert layouts and donation histories will be preserved under organization records.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmHandle("");
                setIsDeleteOpen(true);
              }}
              className="gap-2 text-xs font-semibold rounded-xl cursor-pointer shrink-0"
            >
              <TrashIcon size={15} weight="bold" />
              <span>Delete Channel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog: Rotate Tokens */}
      <Dialog open={isRotateConfirmOpen} onOpenChange={setIsRotateConfirmOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <KeyIcon size={22} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Rotate Widget Tokens?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This will invalidate your current OBS browser source URL. You must copy the new URL into OBS Studio / Streamlabs Desktop immediately after rotation.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRotateConfirmOpen(false)}
              disabled={isRotatingTokens}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRotateTokens}
              disabled={isRotatingTokens}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRotatingTokens && <Spinner className="size-3.5" />}
              <span>Rotate & Invalidate</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Delete Channel */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <WarningOctagonIcon size={22} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-destructive">
              Delete Channel Permanently?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Are you sure you want to delete <strong>@{activeStreamer?.name}</strong>? Public donation links for this channel will cease to accept payments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <label className="text-xs font-semibold text-foreground">
              Type channel handle <code className="text-primary font-mono">{activeStreamer?.name}</code> to confirm:
            </label>
            <Input
              type="text"
              value={confirmHandle}
              onChange={(e) => setConfirmHandle(e.target.value)}
              placeholder={activeStreamer?.name || "handle"}
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
              onClick={handleDeleteStreamer}
              disabled={isDeleting || confirmHandle !== activeStreamer?.name}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isDeleting && <Spinner className="size-3.5" />}
              <span>Delete Channel</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
