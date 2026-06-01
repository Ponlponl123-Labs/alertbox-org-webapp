"use client";
import { useUserContext } from "@/contexts/user";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover";
import { cn, getFallbackInitial } from "@/lib/utils";
import { useStore } from "zustand";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { coreStore } from "@/hooks/store/core";
import {
  ChartLineIcon,
  DoorOpenIcon,
  UserGearIcon,
  UserRectangleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function CurrentUserChip() {
  const { userInfo, logout } = useUserContext();
  const lang = useStore(coreStore, (state) => state.lang);
  const pathname = usePathname();

  if (!userInfo) return null;

  return (
    <Popover key={pathname}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "rounded-full text-base border-0 p-1.5 w-max max-w-none",
            )}
            variant="outline"
          />
        }
      >
        <div>
          <Avatar size="sm">
            {userInfo.avatar && <AvatarImage src={userInfo.avatar} />}
            <AvatarFallback>{getFallbackInitial(userInfo.name)}</AvatarFallback>
          </Avatar>
        </div>
        <span className="text-xs text-foreground/60 ml-0.75 mr-1.5">
          {userInfo.displayname}
        </span>
      </PopoverTrigger>
      <PopoverContent className={"w-42 rounded-2xl p-1 relative"}>
        {userInfo?.banner && (
          <>
            <Image
              src={userInfo?.banner}
              alt="Banner"
              className="w-full blur-lg aspect-video top-0 left-0 pointer-events-none object-cover absolute rounded-2xl z-0 opacity-30"
              width={720}
              height={288}
            />
            <div className="absolute inset-0 bg-linear-to-t from-white/50 dark:from-black/50 to-transparent z-5 rounded-2xl" />
          </>
        )}
        <PopoverHeader className="z-10">
          <PopoverTitle
            className={cn(
              "text-foreground/40 text-xs my-1 bg-background mt-0 p-2.5 rounded-xl bg-linear-150 to-rose-900/20 from-transparent relative",
              userInfo?.banner && "to-transparent",
            )}
          >
            {userInfo?.banner && (
              <Image
                src={userInfo?.banner}
                alt="Banner"
                className="size-full top-0 left-0 pointer-events-none object-cover absolute rounded-xl z-0 mask-linear-160 mask-linear-from-0% mask-linear-to-100%"
                width={720}
                height={288}
              />
            )}
            <div className="flex items-center gap-1.75 w-full z-10 relative">
              <Avatar size="sm">
                {userInfo.avatar && <AvatarImage src={userInfo.avatar} />}
                <AvatarFallback>
                  {getFallbackInitial(userInfo.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-foreground/60 mr-1.5 flex-1 min-w-0 overflow-hidden text-ellipsis">
                {userInfo.displayname}
              </span>
            </div>
            <span className="text-[10px] mt-1.5 block z-10 relative">
              @{userInfo.name}
            </span>
          </PopoverTitle>
          <div className="flex flex-col gap-px p-1.5 pt-0 -mt-0.5">
            {[
              {
                text: lang.data.header.user_chip.links.dashboard,
                href: "/app",
                icon: <ChartLineIcon weight="fill" size={16} />,
              },
              {
                text: lang.data.header.user_chip.links.profile,
                href: userInfo.uri ? "/@" + userInfo.uri : "/app/profile",
                icon: <UserRectangleIcon weight="fill" size={16} />,
              },
              {
                text: lang.data.header.user_chip.links.account,
                href: "/app/account",
                icon: <UserGearIcon weight="fill" size={16} />,
              },
            ].map((l, i) => (
              <Link key={i} href={l.href}>
                <Button
                  className={cn(
                    "rounded-lg text-base border-0 p-1.5 max-w-none text-foreground/40 w-full justify-start",
                  )}
                  variant="ghost"
                >
                  {l.icon}
                  <span className="text-xs">{l.text}</span>
                </Button>
              </Link>
            ))}
            <Button
              className={cn(
                "rounded-lg text-base border-0 p-1.5 max-w-none text-foreground/40 w-full justify-start",
                "hover:bg-rose-600/5! hover:text-rose-600",
              )}
              variant="ghost"
              onClick={() => void logout()}
            >
              <DoorOpenIcon weight="bold" size={16} />
              <span className="text-xs">
                {lang.data.header.user_chip.logout}
              </span>
            </Button>
          </div>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

export default CurrentUserChip;
