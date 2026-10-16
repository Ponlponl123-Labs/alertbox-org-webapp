"use client";
import React from "react";
import { useUserContext } from "@/contexts/user";
import {
  BroadcastIcon,
  BellRingingIcon,
  PlugsIcon,
  UserIcon,
  ArrowSquareOutIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getFallbackInitial } from "@/lib/utils";
import { toast } from "sonner";

export default function StreamerDashboardPage() {
  const { activeOrg, activeStreamer } = useUserContext();
  const [copied, setCopied] = React.useState(false);

  const orgKey = activeOrg?.slug || activeOrg?.id || "org";
  const streamerKey = activeStreamer?.name || activeStreamer?.id || "streamer";

  if (!activeStreamer) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-12 border border-border rounded-2xl bg-card">
        <BroadcastIcon size={36} className="text-muted-foreground/60 mb-3" />
        <h2 className="text-base font-bold text-foreground">No Channel Assigned</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          You do not have access to this streaming channel in {activeOrg?.name || "this organization"}. Contact an administrator to assign channel permissions to your account.
        </p>
      </div>
    );
  }

  const widgetToken = activeStreamer?.widgets?.[0]?.token;
  const overlayUrl = typeof window !== "undefined" && widgetToken
    ? `${window.location.origin}/overlay/alertbox?token=${widgetToken}`
    : "";

  const handleCopy = () => {
    if (!overlayUrl) return;
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    toast.success("Alertbox overlay URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-blue-600/90 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
            {activeStreamer?.avatar ? (
              <Image
                src={activeStreamer.avatar}
                alt={activeStreamer.name}
                width={48}
                height={48}
                className="size-full rounded-xl object-cover"
                unoptimized
              />
            ) : (
              getFallbackInitial(activeStreamer?.displayName || activeStreamer?.name || "Channel")
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {activeStreamer?.displayName || activeStreamer?.name || "Channel Dashboard"}
              </h1>
              {activeStreamer?.uri && (
                <Link
                  href={`/@${activeStreamer.uri}`}
                  target="_blank"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                >
                  <span>@{activeStreamer.uri}</span>
                  <ArrowSquareOutIcon size={12} />
                </Link>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Managed under organization <span className="font-semibold text-foreground">{activeOrg?.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/app/${orgKey}/${streamerKey}/profile`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserIcon size={15} weight="bold" />
              <span>Channel Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {overlayUrl && (
        <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="grid leading-tight">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <BellRingingIcon size={14} className="text-primary" weight="bold" />
              OBS Browser Source Overlay URL
            </span>
            <span className="text-[11px] text-muted-foreground font-mono truncate max-w-md mt-0.5">
              {overlayUrl}
            </span>
          </div>
          <Button size="xs" variant="secondary" onClick={handleCopy} className="gap-1.5 shrink-0">
            {copied ? <CheckIcon size={13} weight="bold" /> : <CopyIcon size={13} weight="bold" />}
            <span>{copied ? "Copied" : "Copy OBS URL"}</span>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/app/${orgKey}/${streamerKey}/alertbox/tip`}
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col justify-between gap-3 group"
        >
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BellRingingIcon size={20} weight="bold" />
          </div>
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Alertbox & Audio</h3>
            <p className="text-xs text-muted-foreground mt-1">Configure tip, membership, and donation alerts.</p>
          </div>
        </Link>

        <Link
          href={`/app/${orgKey}/${streamerKey}/connections`}
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col justify-between gap-3 group"
        >
          <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <PlugsIcon size={20} weight="bold" />
          </div>
          <div>
            <h3 className="font-semibold text-sm group-hover:text-emerald-500 transition-colors">Integrations</h3>
            <p className="text-xs text-muted-foreground mt-1">Connect Ko-fi, Buy Me a Coffee, and Streamlabs.</p>
          </div>
        </Link>

        <Link
          href={`/app/${orgKey}/${streamerKey}/profile`}
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col justify-between gap-3 group"
        >
          <div className="size-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <BroadcastIcon size={20} weight="bold" />
          </div>
          <div>
            <h3 className="font-semibold text-sm group-hover:text-indigo-500 transition-colors">Public Page</h3>
            <p className="text-xs text-muted-foreground mt-1">Customize bio, banner, socials, and published state.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
