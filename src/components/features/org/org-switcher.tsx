"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GalleryVerticalEnd, Plus, Check, KeyRound } from "lucide-react";
import { ChevronUpDown } from "@/components/animate-ui/icons/chevron-up-down";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { AnimatePresence, motion } from "motion/react";

export function OrgSwitcher({ isCollapsed }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const { userInfo, organizations, activeOrg, setActiveOrgId, setActiveStreamerId } = useUserContext();
  const [open, setOpen] = useState(false);

  const stateRef = useRef({ organizations, activeOrg });
  useEffect(() => {
    stateRef.current = { organizations, activeOrg };
  }, [organizations, activeOrg]);

  const userFallbackName = userInfo?.displayName?.trim() || userInfo?.name?.trim();
  const displayName =
    activeOrg?.name ||
    (organizations.length === 0
      ? "Workspace"
      : userFallbackName
        ? `${userFallbackName}'s Org`
        : "Workspace");
  const displayType =
    activeOrg?.type === "ENTERPRISE"
      ? "Enterprise"
      : activeOrg
        ? "Community"
        : organizations.length === 0
          ? "No Organization"
          : "Community";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        const { organizations: orgs, activeOrg: currentOrg } = stateRef.current;
        if (!isNaN(num) && num >= 1 && num <= orgs.length) {
          e.preventDefault();
          const targetOrg = orgs[num - 1];
          if (targetOrg && targetOrg.id !== currentOrg?.id) {
            setActiveOrgId(targetOrg.id);
            const orgKey = targetOrg.slug || targetOrg.id;
            const isOwnerOrAdmin = targetOrg.role === "OWNER" || targetOrg.role === "ADMIN";
            if (isOwnerOrAdmin) {
              setActiveStreamerId("org");
              router.push(`/app/${orgKey}`);
            } else if (targetOrg.streamers?.[0]) {
              setActiveStreamerId(targetOrg.streamers[0].id);
              const streamerKey = targetOrg.streamers[0].name || targetOrg.streamers[0].id;
              router.push(`/app/${orgKey}/${streamerKey}`);
            } else {
              router.push(`/app/${orgKey}`);
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveOrgId, setActiveStreamerId, router]);

  return (
    <div className="w-full shrink-0 mb-1">
      <Popover open={open} onOpenChange={setOpen}>
        <AnimateIcon animateOnHover animation="default" asChild>
          <PopoverTrigger
            className={cn(
              "w-full p-1.5 rounded-2xl hover:bg-foreground/10 border-2 border-transparent data-popup-open:border-border data-popup-open:bg-foreground/5 text-left select-none outline-none focus-visible:ring-1 focus-visible:ring-primary",
              isCollapsed && "justify-center p-0",
            )}
            title={displayName}
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
                className="flex items-center gap-2"
                key={activeOrg?.id}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background shrink-0 shadow-sm font-semibold text-xs">
                  {activeOrg?.avatar ? (
                    <Image
                      src={activeOrg.avatar}
                      alt={displayName}
                      width={32}
                      height={32}
                      className="size-full rounded-lg object-cover"
                      unoptimized
                    />
                  ) : (
                    <GalleryVerticalEnd className="size-4" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium text-foreground text-xs">
                      {displayName}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {displayType}
                    </span>
                  </div>
                )}

                {!isCollapsed && (
                  <ChevronUpDown className="ml-auto size-4 text-muted-foreground/70 shrink-0" />
                )}
              </motion.div>
            </AnimatePresence>
          </PopoverTrigger>
        </AnimateIcon>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-64 p-1.5 rounded-xl bg-popover text-popover-foreground shadow-none border-none"
        >
          <div className="flex flex-col gap-0.5">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Organizations
            </div>
            <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
              {organizations.length > 0 ? (
                organizations.map((org, index) => {
                  const isSelected = org.id === activeOrg?.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => {
                        setActiveOrgId(org.id);
                        const orgKey = org.slug || org.id;
                        const isOwnerOrAdmin = org.role === "OWNER" || org.role === "ADMIN";
                        if (isOwnerOrAdmin) {
                          setActiveStreamerId("org");
                          router.push(`/app/${orgKey}`);
                        } else if (org.streamers?.[0]) {
                          setActiveStreamerId(org.streamers[0].id);
                          const streamerKey = org.streamers[0].name || org.streamers[0].id;
                          router.push(`/app/${orgKey}/${streamerKey}`);
                        } else {
                          router.push(`/app/${orgKey}`);
                        }
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 w-full p-2 rounded-lg text-left text-xs",
                        isSelected
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-accent/60 text-foreground/80",
                      )}
                    >
                      <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background font-semibold text-[10px] shrink-0">
                        {org.avatar ? (
                          <Image
                            src={org.avatar}
                            alt={org.name}
                            width={24}
                            height={24}
                            className="size-full rounded-md object-cover"
                            unoptimized
                          />
                        ) : (
                          getFallbackInitial(org.name)
                        )}
                      </div>
                      <div className="grid flex-1 min-w-0 leading-tight">
                        <span className="truncate font-medium">{org.name}</span>
                        <span className="truncate text-[10px] text-muted-foreground capitalize">
                          {typeof org.type === "string" ? org.type.toLowerCase() : "community"}
                        </span>
                      </div>
                      <KbdGroup>
                        <Kbd className="rounded-sm bg-background">Ctrl + {index + 1}</Kbd>
                      </KbdGroup>
                      {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="flex items-center gap-2.5 w-full p-2 rounded-lg text-left text-xs text-muted-foreground">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground font-semibold text-[10px] shrink-0">
                    <GalleryVerticalEnd className="size-3" />
                  </div>
                  <div className="grid flex-1 min-w-0 leading-tight">
                    <span className="truncate font-medium">No Organization</span>
                    <span className="truncate text-[10px] text-muted-foreground">Workspace</span>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-accent/60 hover:text-accent-foreground text-xs font-medium text-foreground/80 text-left"
              onClick={() => {
                setOpen(false);
                router.push("/app/org/create");
              }}
            >
              <div className="flex size-7 items-center justify-center rounded-lg border border-dashed border-border shrink-0">
                <Plus className="size-3.5" />
              </div>
              <span>Create organization</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-accent/60 hover:text-accent-foreground text-xs font-medium text-foreground/80 text-left"
              onClick={() => {
                setOpen(false);
                router.push("/app/org/join");
              }}
            >
              <div className="flex size-7 items-center justify-center rounded-lg border border-dashed border-border shrink-0">
                <KeyRound className="size-3.5" />
              </div>
              <span>Join organization</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default OrgSwitcher;
