"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GalleryVerticalEnd, ChevronsUpDown, Plus, Check, KeyRound } from "lucide-react";
import { BroadcastIcon } from "@phosphor-icons/react";
import { JoinOrgDialog } from "@/components/join-org-dialog";

export function OrgSwitcher({ isCollapsed }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const { userInfo, organizations, activeOrg, activeStreamer, setActiveOrgId, setActiveStreamerId } = useUserContext();
  const [open, setOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const displayName = activeOrg?.name || (userInfo?.name ? `${userInfo.name}'s Org` : "Acme Inc");
  const displayPlan = activeOrg?.role
    ? `${activeOrg.role.charAt(0) + activeOrg.role.slice(1).toLowerCase()} Plan`
    : "Enterprise";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= organizations.length) {
          e.preventDefault();
          const targetOrg = organizations[num - 1];
          if (targetOrg && targetOrg.id !== activeOrg?.id) {
            setActiveOrgId(targetOrg.id);
            if (targetOrg.streamers?.[0]) {
              setActiveStreamerId(targetOrg.streamers[0].id);
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [organizations, activeOrg, setActiveOrgId, setActiveStreamerId]);

  return (
    <div className="w-full shrink-0 mb-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-foreground/5 data-[state=open]:bg-foreground/5 transition-colors cursor-pointer text-left select-none outline-none focus-visible:ring-1 focus-visible:ring-primary",
            isCollapsed && "justify-center p-1.5",
          )}
          title={displayName}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow-sm font-semibold text-xs">
            {activeOrg?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeOrg.avatar} alt={displayName} className="size-full rounded-lg object-cover" />
            ) : (
              <GalleryVerticalEnd className="size-4" />
            )}
          </div>

          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold text-foreground text-sm">
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {displayPlan}
              </span>
            </div>
          )}

          {!isCollapsed && (
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70 shrink-0" />
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-64 p-1.5 rounded-lg bg-popover border border-border text-popover-foreground shadow-lg"
        >
          <div className="flex flex-col gap-1">
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
                        if (org.streamers?.[0]) {
                          setActiveStreamerId(org.streamers[0].id);
                          const streamerKey = org.streamers[0].name || org.streamers[0].id;
                          router.push(`/app/${orgKey}/${streamerKey}`);
                        } else {
                          router.push(`/app/${orgKey}`);
                        }
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
                        {org.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={org.avatar} alt={org.name} className="size-full rounded-md object-cover" />
                        ) : (
                          getFallbackInitial(org.name)
                        )}
                      </div>
                      <div className="grid flex-1 min-w-0 leading-tight">
                        <span className="truncate font-medium">{org.name}</span>
                        <span className="truncate text-[10px] text-muted-foreground capitalize">
                          {org.role?.toLowerCase() || "member"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0 font-mono opacity-60">
                        ⌘{index + 1}
                      </span>
                      {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="flex items-center gap-2.5 w-full p-2 rounded-md text-left text-xs text-muted-foreground">
                  <div className="flex size-6 items-center justify-center rounded-md bg-blue-600/90 text-white font-semibold text-[10px] shrink-0">
                    <GalleryVerticalEnd className="size-3" />
                  </div>
                  <div className="grid flex-1 min-w-0 leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-[10px] text-muted-foreground">Default</span>
                  </div>
                  <Check className="size-3.5 text-primary shrink-0" />
                </div>
              )}
            </div>

            {activeOrg && activeOrg.streamers.length > 1 && (
              <>
                <div className="h-px bg-border my-1 -mx-1" />
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Channels ({activeOrg.name})
                </div>
                <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
                  {activeOrg.streamers.map((s) => {
                    const isStreamerSelected = s.id === activeStreamer?.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setActiveStreamerId(s.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-xs transition-colors cursor-pointer",
                          isStreamerSelected
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent/60 text-foreground/70",
                        )}
                      >
                        <BroadcastIcon size={13} weight={isStreamerSelected ? "fill" : "regular"} className="shrink-0 text-primary" />
                        <span className="truncate flex-1">{s.displayName || s.name}</span>
                        {isStreamerSelected && <Check className="size-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="h-px bg-border my-1 -mx-1" />
            <button
              type="button"
              className="flex items-center gap-2.5 w-full p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-xs font-medium text-foreground/80 text-left"
              onClick={() => {
                setOpen(false);
                router.push("/app/org/create");
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-border bg-background shrink-0">
                <Plus className="size-3.5" />
              </div>
              <span>Create organization</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 w-full p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-xs font-medium text-foreground/80 text-left"
              onClick={() => {
                setOpen(false);
                setIsJoinOpen(true);
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-border bg-background shrink-0">
                <KeyRound className="size-3.5" />
              </div>
              <span>Join organization</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <JoinOrgDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </div>
  );
}

export default OrgSwitcher;
