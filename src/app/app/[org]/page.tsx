"use client";
import React from "react";
import { useUserContext } from "@/contexts/user";
import {
  BroadcastIcon,
  UsersIcon,
  HandCoinsIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BuildingsIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFallbackInitial } from "@/lib/utils";
import { hasPermission, OrgPerm } from "@/lib/rbac";

export default function OrgOverviewPage() {
  const { activeOrg } = useUserContext();

  const role = (activeOrg?.role || "").toLowerCase();
  const isOwnerOrAdmin = role === "owner" || role === "admin";
  const canCreateStreamer = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.STREAMER_CREATE);

  const streamers = activeOrg?.streamers || [];
  const orgSlug = activeOrg?.slug || activeOrg?.id || "org";

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <BuildingsIcon size={16} weight="bold" />
            <span>Organization Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            {activeOrg?.name || "Organization Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Centralized hub for all streamer channels, staff members, and subscription billing.
          </p>
        </div>
        {canCreateStreamer && (
          <Link href={`/app/${orgSlug}/streamers`}>
            <Button size="sm" className="gap-2">
              <BroadcastIcon size={15} weight="bold" />
              <span>Add Channel</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Channels</span>
            <BroadcastIcon size={18} weight="bold" className="text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1">{streamers.length}</span>
          <span className="text-[11px] text-muted-foreground">Active streamer profiles</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Team Members</span>
            <UsersIcon size={18} weight="bold" className="text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1">
            {activeOrg?.memberCount || 1}
          </span>
          <span className="text-[11px] text-muted-foreground">Staff with delegated roles</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Your Role</span>
            <ShieldCheckIcon size={18} weight="bold" className="text-purple-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1">
            {activeOrg?.role || "OWNER"}
          </span>
          <span className="text-[11px] text-muted-foreground">Role permissions applied</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Subscription</span>
            <HandCoinsIcon size={18} weight="bold" className="text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1">Active</span>
          <span className="text-[11px] text-muted-foreground">Enterprise multi-channel plan</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Streaming Channels</h2>
          <Link
            href={`/app/${orgSlug}/streamers`}
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <span>Manage All</span>
            <ArrowRightIcon size={12} weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {streamers.map((s) => {
            const streamerKey = s.name || s.id;
            return (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {s.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="size-full rounded-lg object-cover"
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
                      @{s.name}
                    </span>
                  </div>
                </div>

                <Link href={`/app/${orgSlug}/${streamerKey}`}>
                  <Button size="xs" variant="outline" className="gap-1.5 shrink-0">
                    <span>Open Workspace</span>
                    <ArrowRightIcon size={12} weight="bold" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
