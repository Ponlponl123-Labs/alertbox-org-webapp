"use client";
import React, { useState } from "react";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import { BroadcastIcon, PlusIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { getFallbackInitial } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { hasPermission } from "@/lib/rbac";
import { OrgPerm } from "@/consts/permission";

export default function OrgStreamersPage() {
  const { activeOrg, authFetch, setActiveStreamerId, refreshUserInfo, isSelfHosted } = useUserContext();
  const [newStreamerName, setNewStreamerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const role = (activeOrg?.role || "").toLowerCase();
  const isOwner = role === "owner";
  const isOwnerOrAdmin = isOwner || role === "admin";
  const streamers = activeOrg?.streamers || [];
  const isEnterprise = activeOrg?.type === "ENTERPRISE";
  const isChannelLimitReached = !isSelfHosted && !isEnterprise && streamers.length >= 1;
  const canCreateStreamer = (isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.STREAMER_CREATE)) && !isChannelLimitReached;

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStreamerName.trim().toLowerCase();
    if (!trimmed || !activeOrg || isChannelLimitReached) return;
    if (!/^[a-z0-9_-]+$/.test(trimmed)) {
      toast.error("Channel name can only contain lowercase letters, numbers, hyphens, and underscores");
      return;
    }
    setIsCreating(true);
    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${activeOrg.id}/streamers`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        toast.success(`Channel "${trimmed}" created!`);
        setNewStreamerName("");
        await refreshUserInfo();
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to create channel");
      }
    } catch {
      toast.error("Network error creating channel");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full py-4">
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
          <BroadcastIcon size={16} weight="bold" />
          <span>Organization Channels</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          Streamer Channels
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage all streaming profiles and public channels belonging to {activeOrg?.name}.
        </p>
      </div>

      {!isSelfHosted && !isEnterprise && streamers.length >= 1 && (
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 text-xs font-medium">
          This is a Community organization which is limited to 1 streamer channel. Enterprise organizations have unlimited channels.
        </div>
      )}

      {canCreateStreamer && (
        <div className="p-4 rounded-xl border border-border bg-card text-card-foreground">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <PlusIcon size={16} weight="bold" className="text-primary" />
            Create New Channel
          </h2>
          <form onSubmit={handleCreateChannel} className="flex gap-2">
            <Input
              type="text"
              placeholder="Channel Name (e.g. main-stream, live_01)"
              value={newStreamerName}
              onChange={(e) => setNewStreamerName(e.target.value.toLowerCase())}
              pattern="^[a-z0-9_\-]+$"
              title="Allowed characters: lowercase letters, numbers, hyphens, underscores"
              className="flex-1 text-xs"
              required
            />
            <Button type="submit" size="sm" disabled={isCreating || !newStreamerName.trim()}>
              {isCreating ? "Creating..." : "Create Channel"}
            </Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streamers.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between gap-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-600/90 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {s.avatar ? (
                  <Image
                    src={s.avatar}
                    alt={s.name}
                    width={40}
                    height={40}
                    className="size-full rounded-lg object-cover"
                    unoptimized
                  />
                ) : (
                  getFallbackInitial(s.displayName || s.name)
                )}
              </div>
              <div className="grid leading-tight min-w-0">
                <span className="truncate font-semibold text-foreground text-sm">
                  {s.displayName || s.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  @{s.uri || s.name}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
              <span className="text-muted-foreground text-[11px]">
                {s.widgets?.length || 1} Active Alertbox Widget
              </span>
              <div className="flex items-center gap-2">
                {s.uri && (
                  <Link
                    href={`/@${s.uri}`}
                    target="_blank"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ArrowSquareOutIcon size={14} />
                    <span>Public</span>
                  </Link>
                )}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setActiveStreamerId(s.id);
                    toast.success(`Switched to channel ${s.displayName || s.name}`);
                  }}
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
