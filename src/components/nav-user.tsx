"use client";
import React from "react";
import { useUserContext } from "@/contexts/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getFallbackInitial } from "@/lib/utils";
import { ChevronsUpDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function NavUser({ isCollapsed }: { isCollapsed?: boolean }) {
  const { userInfo, logout } = useUserContext();
  if (!userInfo) return null;

  const displayName = userInfo.name || userInfo.email?.split("@")[0] || "User";
  const displayEmail = userInfo.email;
  const avatarUrl = userInfo.avatar;

  return (
    <div className="w-full shrink-0 mt-auto pt-1 border-t border-border/40">
      <Popover>
        <PopoverTrigger
          className={cn(
            "flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-foreground/5 data-[state=open]:bg-foreground/5 transition-colors cursor-pointer text-left select-none outline-none focus-visible:ring-1 focus-visible:ring-primary",
            isCollapsed && "justify-center p-1",
          )}
        >
          <Avatar className="size-8 rounded-lg shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="rounded-lg object-cover" />}
            <AvatarFallback className="rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
              {getFallbackInitial(displayName)}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold text-foreground text-sm">
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </span>
            </div>
          )}

          {!isCollapsed && (
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70 shrink-0" />
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-56 p-1.5 rounded-lg bg-popover border border-border text-popover-foreground shadow-lg"
        >
          <div className="flex items-center gap-2 p-2 border-b border-border mb-1">
            <Avatar className="size-8 rounded-lg shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="rounded-lg object-cover" />}
              <AvatarFallback className="rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
                {getFallbackInitial(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
              <span className="truncate font-medium text-foreground">{displayName}</span>
              <span className="truncate text-[10px] text-muted-foreground">{displayEmail}</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <Link
              href="/app/account"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="size-3.5 text-muted-foreground" />
              <span>Account settings</span>
            </Link>
            <Link
              href="/app/account/security"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ShieldCheck className="size-3.5 text-muted-foreground" />
              <span>Security</span>
            </Link>
            <div className="h-px bg-border my-1 -mx-1" />
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-destructive hover:bg-destructive/10 transition-colors w-full text-left cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default NavUser;
