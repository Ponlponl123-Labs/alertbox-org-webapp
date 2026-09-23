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
import { motion, type Variants } from "motion/react";
import { useState } from "react";

const menuVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -2, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 380, damping: 26 },
  },
};

function CurrentUserChip() {
  const { userInfo, logout } = useUserContext();
  const lang = useStore(coreStore, (state) => state.lang);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (!userInfo) return null;

  return (
    <Popover onOpenChange={setOpen} open={open} key={pathname}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "rounded-full text-base border-0 p-1.5 w-max max-w-none",
              open && "translate-y-6 blur-lg scale-110",
              !open && "backdrop-blur-sm"
            )}
            variant="outline"
          />
        }
      >
        <div>
          <Avatar size="sm">
            {userInfo.profile?.avatar && <AvatarImage src={userInfo.profile.avatar} />}
            <AvatarFallback>{getFallbackInitial(userInfo.profile?.name || "?")}</AvatarFallback>
          </Avatar>
        </div>
        <span className="text-xs text-foreground/60 ml-0.75 mr-1.5">
          {userInfo.profile?.displayName}
        </span>
      </PopoverTrigger>
      <PopoverContent
        render={
          <motion.div
            initial={{ y: -32, opacity: 0, filter: "blur(12px)" }}
            animate={{ y: -24, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -32, opacity: 0, filter: "blur(12px)" }}
            className="select-none"
            transition={{
              height: { type: "spring", stiffness: 320, damping: 26, mass: 0.8 },
              opacity: { duration: 0.16 },
              filter: { duration: 0.16 },
            }}
          />
        }
        className="w-42 rounded-2xl p-1 relative overflow-hidden data-open:animate-none bg-popover/30 backdrop-saturate-200 backdrop-blur-2xl">
        <motion.div
          initial={{ height: 96, opacity: 0, filter: "blur(6px)" }}
          animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
          transition={{
            height: { type: "spring", stiffness: 320, damping: 26, mass: 0.8 },
            opacity: { duration: 0.16 },
            filter: { duration: 0.16 },
          }}
          className="w-full flex flex-col relative overflow-hidden"
        >
          {userInfo?.profile?.banner && (
            <>
              <Image
                src={userInfo?.profile?.banner}
                alt="Banner"
                className="w-full blur-lg aspect-video top-0 left-0 pointer-events-none object-cover absolute rounded-2xl z-0 opacity-30 select-none"
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
                userInfo?.profile?.banner && "to-transparent",
              )}
            >
              {userInfo?.profile?.banner && (
                <div className="size-full top-0 left-0 pointer-events-none absolute overflow-hidden rounded-xl">
                  <Image
                    src={userInfo?.profile?.banner}
                    alt="Banner"
                    className="size-full top-0 left-0 pointer-events-none object-cover absolute z-0 mask-linear-160 mask-linear-from-10% mask-linear-to-92% blur-[1px] select-none"
                    width={720}
                    height={288}
                  />
                </div>
              )}
              <div className="flex items-center gap-1.75 w-full z-10 relative">
                <Avatar size="sm">
                  {userInfo.profile?.avatar && <AvatarImage src={userInfo.profile.avatar} />}
                  <AvatarFallback>
                    {getFallbackInitial(userInfo.profile?.name || "?")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-foreground/60 mr-1.5 flex-1 min-w-0 overflow-hidden text-ellipsis">
                  {userInfo.profile?.displayName}
                </span>
              </div>
              <span className="text-[10px] mt-1.5 block z-10 relative">
                @{userInfo.profile?.name}
              </span>
            </PopoverTitle>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={menuVariants}
              className="flex flex-col gap-px p-1.5 pt-0 -mt-0.5"
            >
              {[
                {
                  text: lang.data.header.user_chip.links.dashboard,
                  href: "/app",
                  icon: <ChartLineIcon weight="bold" size={16} />,
                },
                {
                  text: lang.data.header.user_chip.links.profile,
                  href: userInfo.profile?.uri ? "/@" + userInfo.profile.uri : "/app/profile",
                  icon: <UserRectangleIcon weight="fill" size={16} />,
                },
                {
                  text: lang.data.header.user_chip.links.account,
                  href: "/app/account",
                  icon: <UserGearIcon weight="fill" size={16} />,
                },
              ].map((l, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ x: 1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link href={l.href} onClick={() => setOpen(false)}>
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
                </motion.div>
              ))}
              <motion.div
                variants={itemVariants}
                whileHover={{ x: 2.5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  className={cn(
                    "rounded-lg text-base border-0 p-1.5 max-w-none text-foreground/40 w-full justify-start",
                    "hover:bg-rose-600/5! hover:text-rose-600",
                  )}
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                >
                  <DoorOpenIcon weight="bold" size={16} />
                  <span className="text-xs">
                    {lang.data.header.user_chip.logout}
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </PopoverHeader>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}

export default CurrentUserChip;
