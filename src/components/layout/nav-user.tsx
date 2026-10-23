"use client";
import { useSyncExternalStore } from "react";
import { useUserContext } from "@/contexts/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover } from '@animate-ui/react/primitives/base-ui/popover';
import { cn, getFallbackInitial } from "@/lib/utils";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { ChevronUpDown } from "../animate-ui/icons/chevron-up-down";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Logout01 } from "../animate-ui/icons/hugeicons/logout-01";
import { Moon02 } from "../animate-ui/icons/hugeicons/moon-02";
import { Sun03 } from "../animate-ui/icons/hugeicons/sun-03";
import { ShieldCheck } from "../animate-ui/icons/hugeicons/shield-check";
import { Settings02 } from "../animate-ui/icons/hugeicons/settings-02";
import Image from "next/image";

const emptySubscribe = () => () => { };

export function NavUser({ isCollapsed }: { isCollapsed?: boolean }) {
  const { userInfo, logout } = useUserContext();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isDark = useStore(coreStore, (state) => state.isDark);
  const toggleTheme = coreStore.getState().toggleTheme;

  if (!userInfo) return null;

  const displayName =
    userInfo.displayName?.trim() ||
    userInfo.name?.trim() ||
    userInfo.email?.split("@")[0] ||
    "User";
  const displayEmail =
    userInfo.email?.trim() ||
    (userInfo.name ? `@${userInfo.name.trim()}` : "");
  const avatarUrl = userInfo.avatar || "";

  return (
    <div className="w-full shrink-0 mt-auto">
      <Popover.Root>
        <AnimateIcon animateOnHover animation="default" asChild>
          <Popover.Trigger
            className={cn(
              "flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-foreground/5 data-[state=open]:bg-foreground/5 text-left select-none outline-none focus-visible:ring-1 focus-visible:ring-primary",
              isCollapsed && "justify-center p-1",
            )}
          >
            <Avatar className="size-8 rounded-lg shrink-0 after:border-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="rounded-lg object-cover" />}
              <AvatarFallback className="rounded-lg text-xs font-semibold bg-accent text-accent-foreground">
                {getFallbackInitial(displayName)}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold text-foreground text-xs">
                  {displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <ChevronUpDown className="ml-auto size-4 text-muted-foreground/70 shrink-0" />
            )}
          </Popover.Trigger>
        </AnimateIcon>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup
              className="w-56 p-1.5 z-0 relative rounded-xl bg-popover overflow-hidden text-popover-foreground shadow-lg"
            >
              {
                avatarUrl && <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={50}
                  height={50}
                  className="rounded-xl absolute top-0 left-0 w-full h-32 blur-2xl saturate-150 contrast-120 dark:contrast-150 dark:brightness-50 object-cover -z-10"
                />
              }
              <div className="flex items-center gap-2 p-1 select-none hover:bg-secondary/90 transition-all duration-200 mb-0.5 rounded-lg">
                <Avatar className="size-8 rounded-md shrink-0 after:border-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="rounded-md object-cover" />}
                  <AvatarFallback className="rounded-md text-xs font-semibold bg-accent text-accent-foreground">
                    {getFallbackInitial(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                  <span className="truncate font-medium text-foreground">{displayName}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{displayEmail}</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 z-10">
                <AnimateIcon animateOnHover asChild>
                  <Link
                    href="/app/account"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings02 className="size-3.5 text-muted-foreground" />
                    <span>Account settings</span>
                  </Link>
                </AnimateIcon>
                <AnimateIcon animateOnHover asChild>
                  <Link
                    href="/app/account/security"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    <ShieldCheck className="size-3.5 text-muted-foreground" />
                    <span>Security</span>
                  </Link>
                </AnimateIcon>
                <AnimateIcon animateOnHover asChild>
                  <button
                    type="button"
                    onClick={() => toggleTheme()}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground w-full text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {mounted && isDark ? (
                        <Moon02 className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Sun03 className="size-3.5 text-amber-500" />
                      )}
                      <span>Theme</span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-lg">
                      {mounted ? (isDark ? "Dark" : "Light") : "Theme"}
                    </span>
                  </button>
                </AnimateIcon>
                <AnimateIcon animateOnHover asChild>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-destructive hover:bg-destructive/10 w-full text-left cursor-pointer"
                  >
                    <Logout01 className="size-3.5" />
                    <span>Log out</span>
                  </button>
                </AnimateIcon>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export default NavUser;
