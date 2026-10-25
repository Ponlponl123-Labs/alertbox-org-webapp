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
  CheckIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { hasPermission } from "@/lib/rbac";
import { OrgPerm } from "@/consts/permission";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ChevronUpDown } from "@/components/animate-ui/icons/chevron-up-down";
import { motion, AnimatePresence } from "motion/react";

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
        <AnimateIcon animateOnHover animation="default" asChild>
          <PopoverTrigger
            className={cn(
              "flex items-center gap-2 w-full p-1.5 rounded-xl -mt-1 border-2 border-transparent data-popup-open:border-border data-popup-open:bg-foreground/5 bg-transparent hover:bg-foreground/10 text-xs select-none outline-none focus-visible:ring-1 focus-visible:ring-primary",
              isCollapsed && "justify-center p-1 border-0 bg-transparent hover:bg-foreground/5",
            )}
            title={
              effectiveOrgMode
                ? "Organization Overview"
                : activeStreamer?.displayName || activeStreamer?.name || "Select Channel"
            }
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, scale: 0.95, filter: "blur(4px)" }}
                transition={{
                  duration: 0.36,
                  ease: "easeOut",
                }}
                className="flex items-center gap-2 w-full"
                key={`${activeStreamer?.name}-${effectiveOrgMode}`}
              >
                {effectiveOrgMode ? (
                  <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                    <BuildingsIcon size={13} weight="bold" />
                  </div>
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                    {activeStreamer?.avatar ? (
                      <Image
                        src={activeStreamer.avatar}
                        alt={activeStreamer.name}
                        width={20}
                        height={20}
                        className="size-full rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <BroadcastIcon size={13} weight="fill" />
                    )}
                  </div>
                )}

                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate font-medium text-foreground/80 text-xs tracking-wide">
                      {effectiveOrgMode
                        ? "Org Overview"
                        : activeStreamer?.displayName || activeStreamer?.name || "No Channel"}
                    </span>
                    <ChevronUpDown className="ml-auto size-3 text-muted-foreground/70 shrink-0" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </PopoverTrigger>
        </AnimateIcon>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-60 p-1.5 rounded-xl bg-popover text-popover-foreground shadow-none border-none"
        >
          <div className="flex flex-col gap-0.5">
            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
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
                  "flex items-center gap-2.5 w-full p-2 rounded-lg text-left text-xs",
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
                      "flex items-center gap-2.5 w-full p-2 rounded-lg text-left text-xs",
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
                <Link
                  href={`/app/${activeOrg.slug || activeOrg.id}/streamers`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <div className="flex size-6 items-center justify-center rounded-lg border border-dashed border-border shrink-0">
                    <PlusIcon className="size-3.5" weight="bold" />
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
