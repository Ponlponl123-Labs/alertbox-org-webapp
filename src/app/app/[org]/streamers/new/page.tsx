"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import {
  BroadcastIcon,
  ArrowLeftIcon,
  CheckIcon,
  BellRingingIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { hasPermission } from "@/lib/rbac";
import { OrgPerm } from "@/consts/permission";
import { motion } from "motion/react";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getFallbackInitial } from "@/lib/utils";

export default function NewStreamerPage() {
  const router = useRouter();
  const { activeOrg, authFetch, refreshUserInfo, setActiveStreamerId, isSelfHosted } = useUserContext();

  const [channelName, setChannelName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orgKey = activeOrg?.slug || activeOrg?.id || "org";
  const role = (activeOrg?.role || "").toLowerCase();
  const isOwnerOrAdmin = role === "owner" || role === "admin";
  const streamers = activeOrg?.streamers || [];
  const isEnterprise = activeOrg?.type === "ENTERPRISE";
  const isChannelLimitReached = !isSelfHosted && !isEnterprise && streamers.length >= 1;
  const canCreateStreamer = (isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.STREAMER_CREATE)) && !isChannelLimitReached;

  const sanitizedHandle = channelName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const effectiveDisplayName = displayName.trim() || sanitizedHandle || "New Channel";

  const handleNameChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setChannelName(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanitizedHandle || !activeOrg || isChannelLimitReached) return;

    if (!/^[a-z0-9_-]+$/.test(sanitizedHandle)) {
      toast.error("Channel handle can only contain lowercase letters, numbers, hyphens, and underscores.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${activeOrg.id}/streamers`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizedHandle,
          displayName: displayName.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        toast.success(`Channel "${sanitizedHandle}" created successfully!`);
        await refreshUserInfo();
        if (data?.id) {
          setActiveStreamerId(data.id);
        }
        router.push(`/app/${orgKey}/streamers`);
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to create channel");
      }
    } catch {
      toast.error("Network error creating channel");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10"
    >
      <div>
        <Link
          href={`/app/${orgKey}/streamers`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
        >
          <ArrowLeftIcon size={14} weight="bold" />
          <span>Back to Channels</span>
        </Link>

        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
          <BroadcastIcon size={16} weight="bold" />
          <span>Organization Channels</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground my-3">
          Create New Channel
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Provision a dedicated streamer profile under {activeOrg?.name || "your organization"} with its own AlertBox overlays, tipping gateways, and access control.
        </p>
      </div>

      {isChannelLimitReached && (
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 text-xs font-medium flex items-center gap-3">
          <WarningCircleIcon size={20} weight="bold" className="shrink-0" />
          <span>
            This organization has reached its Community tier limit of 1 streamer channel. Upgrade to an Enterprise plan or self-host to provision unlimited channels.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-card shadow-xs flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Channel Handle / Slug</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. main-stream, live_01"
                value={channelName}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isSubmitting || isChannelLimitReached || !canCreateStreamer}
                required
                fontStyle={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
                className="w-full"
                classNames={{ base: "h-9 rounded-xl" }}
              />
              <span className="text-[11px] text-muted-foreground">
                Unique identifier used in URLs. Only lowercase letters, numbers, hyphens, and underscores.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Display Name</span>
                <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Main Studio Stream"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSubmitting || isChannelLimitReached || !canCreateStreamer}
                maxLength={64}
                fontStyle={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
                className="w-full"
                classNames={{ base: "h-9 rounded-xl" }}
              />
              <span className="text-[11px] text-muted-foreground">
                Public display name shown on viewer overlays and donation pages.
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !sanitizedHandle || isChannelLimitReached || !canCreateStreamer}
                className="gap-2 rounded-xl text-xs font-semibold p-3 h-max"
              >
                {isSubmitting ? <Spinner className="size-3.5" /> : <CheckIcon size={14} weight="bold" />}
                <span>Create Channel</span>
              </Button>
              <Link href={`/app/${orgKey}/streamers`}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting}
                  className="rounded-xl text-xs p-3 h-max"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-card flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <BellRingingIcon size={16} weight="bold" />
                <span>AlertBox Overlay</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automatically provisions a dedicated cryptographic token and browser source for OBS Studio.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <CreditCardIcon size={16} weight="bold" />
                <span>Payment Gateways</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connect Streamlabs, BMAC, and Ko-fi integrations isolated to this channel.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <ShieldCheckIcon size={16} weight="bold" />
                <span>Staff Access</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Delegate channel permissions to specific team members without giving full org access.
              </p>
            </div>
          </div>
        </form>

        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="p-5 rounded-3xl bg-card shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar className="size-14 rounded-2xl shrink-0 after:border-0">
                <AvatarFallback className="bg-blue-600 text-white font-bold text-base rounded-2xl">
                  {getFallbackInitial(effectiveDisplayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-semibold text-base text-foreground truncate">
                  {effectiveDisplayName}
                </span>
                <span className="text-xs text-muted-foreground font-sans truncate mt-0.5">
                  @{sanitizedHandle || "channel-handle"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Organization</span>
                <span className="font-medium text-foreground">{activeOrg?.name || "Active Org"}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Public Route</span>
                <span className="font-sans text-xs text-primary select-none">
                  /app/{orgKey}/{sanitizedHandle || "handle"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Default Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg select-none text-xs font-medium bg-emerald-500/10 text-emerald-400">
                  Ready to stream
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
