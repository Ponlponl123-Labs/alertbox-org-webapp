"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getFallbackInitial } from "@/lib/utils";
import {
  BroadcastIcon,
  BuildingsIcon,
  CaretUpDownIcon,
  CheckIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { hasPermission, OrgPerm } from "@/lib/rbac";

export function StreamerSelector({ isCollapsed }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeOrg,
    activeStreamer,
    isOrgMode,
    setActiveStreamerId,
  } = useUserContext();
  const [open, setOpen] = useState(false);

  const orgKey = activeOrg?.slug || activeOrg?.id || "org";
  const orgPages = ["/members", "/streamers", "/billing", "/transactions"];
  const isOrgRoute =
    pathname === `/app/${orgKey}` ||
    orgPages.some((p) => pathname.startsWith(`/app/${orgKey}${p}`));
  const effectiveOrgMode = isOrgMode || isOrgRoute;

  if (!activeOrg) return null;

  const isOwner = activeOrg.role === "OWNER";
  const isOwnerOrAdmin = isOwner || activeOrg.role === "ADMIN";
  const canViewOrg =
    isOwnerOrAdmin ||
    hasPermission(activeOrg.permissions, OrgPerm.ORG_VIEW);
  const canCreateStreamer =
    isOwnerOrAdmin ||
    hasPermission(activeOrg.permissions, OrgPerm.STREAMER_CREATE);

  const streamers = activeOrg.streamers || [];

  return (
    <div className="w-full shrink-0 mb-1.5 px-0.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex items-center gap-2 w-full px-2 py-1.5 rounded-lg border border-border/50 bg-foreground/2 hover:bg-foreground/6 text-xs transition-colors cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-primary",
            isCollapsed && "justify-center p-1.5 border-0 bg-transparent hover:bg-foreground/5",
          )}
          title={
            effectiveOrgMode
              ? "Organization Overview"
              : activeStreamer?.displayName || activeStreamer?.name || "Select Channel"
          }
        >
          {effectiveOrgMode ? (
            <div className="flex size-5 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
              <BuildingsIcon size={13} weight="bold" />
            </div>
          ) : (
            <div className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
              {activeStreamer?.avatar ? (
                <Image
                  src={activeStreamer.avatar}
                  alt={activeStreamer.name}
                  width={20}
                  height={20}
                  className="size-full rounded-md object-cover"
                  unoptimized
                />
              ) : (
                <BroadcastIcon size={13} weight="fill" />
              )}
            </div>
          )}

          {!isCollapsed && (
            <div className="flex flex-1 items-center justify-between min-w-0">
              <span className="truncate font-medium text-foreground/80 text-[11px]">
                {effectiveOrgMode
                  ? "Org Overview"
                  : activeStreamer?.displayName || activeStreamer?.name || "No Channel"}
              </span>
              <CaretUpDownIcon
                size={12}
                weight="bold"
                className="text-muted-foreground/60 shrink-0 ml-1"
              />
            </div>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-60 p-1.5 rounded-lg bg-popover border border-border text-popover-foreground shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Channel / Workspace
            </div>

            {canViewOrg && (
              <button
                type="button"
                onClick={() => {
                  setActiveStreamerId("org");
                  router.push(`/app/${activeOrg.slug || activeOrg.id}`);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 w-full p-2 rounded-md text-left text-xs transition-colors cursor-pointer",
                  effectiveOrgMode
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/60 text-foreground/80",
                )}
              >
                <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                  <BuildingsIcon size={14} weight="bold" />
                </div>
                <div className="grid flex-1 min-w-0 leading-tight">
                  <span className="truncate font-medium">Organization Overview</span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    Staff, Roles & Finance
                  </span>
                </div>
                {effectiveOrgMode && <CheckIcon size={13} weight="bold" className="text-primary shrink-0" />}
              </button>
            )}

            {canViewOrg && streamers.length > 0 && (
              <div className="h-px bg-border my-1 -mx-1" />
            )}

            <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
              {streamers.map((s) => {
                const isSelected = !effectiveOrgMode && s.id === activeStreamer?.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setActiveStreamerId(s.id);
                      const orgKey = activeOrg.slug || activeOrg.id;
                      const streamerKey = s.name || s.id;
                      router.push(`/app/${orgKey}/${streamerKey}`);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 w-full p-2 rounded-md text-left text-xs transition-colors cursor-pointer",
                      isSelected
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-accent/60 text-foreground/80",
                    )}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md bg-blue-600/90 text-white font-semibold text-[10px] shrink-0">
                      {s.avatar ? (
                        <Image
                          src={s.avatar}
                          alt={s.name}
                          width={24}
                          height={24}
                          className="size-full rounded-md object-cover"
                          unoptimized
                        />
                      ) : (
                        getFallbackInitial(s.displayName || s.name)
                      )}
                    </div>
                    <div className="grid flex-1 min-w-0 leading-tight">
                      <span className="truncate font-medium">
                        {s.displayName || s.name}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        @{s.uri || s.name}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckIcon size={13} weight="bold" className="text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {canCreateStreamer && (
              <>
                <div className="h-px bg-border my-1 -mx-1" />
                <Link
                  href={`/app/${activeOrg.slug || activeOrg.id}/streamers`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="flex size-5 items-center justify-center rounded-md border border-dashed border-border bg-background shrink-0">
                    <PlusIcon size={12} weight="bold" />
                  </div>
                  <span>Add channel</span>
                </Link>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default StreamerSelector;
