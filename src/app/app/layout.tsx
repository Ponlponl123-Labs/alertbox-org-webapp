"use client";
import { useUserContext } from "@/contexts/user";
import React, { useState } from "react";
import Login from "./login";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/layout/app-sidebar";
import { motion, useScroll, useTransform } from "motion/react";
import { clamp, cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import StreamerModeProtection from "@/components/shared/streamer-mode-protection";
import { GithubLogoIcon, HandHeartIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

export function AppFooter() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <footer className="flex flex-col sm:flex-row items-center gap-2 opacity-30 p-4 sm:p-6 lg:p-12 select-none">
      <div className="flex flex-col justify-start max-sm:items-center gap-1">
        <div className="inline-flex gap-2">
          <HandHeartIcon size={22} weight="fill" className="text-foreground" />
          <span className="text-sm font-semibold font-sans">
            AlertBox<span className="text-xs opacity-60 ml-0.5 font-light tracking-wider">.org</span>
          </span>
        </div>
        <span className="text-xs font-light opacity-50">
          {lang.data.footer.author}
        </span>
      </div>
      <div className="flex flex-1 gap-2 justify-end">
        <Link href={"https://law.ponlponl123.com/tos"} target="_blank">
          <Button size={"xs"} variant="ghost" className={"rounded-lg"}>
            {lang.data.footer.links.legal.tos}
          </Button>
        </Link>
        <Link href={"https://law.ponlponl123.com/privacy"} target="_blank">
          <Button size={"xs"} variant="ghost" className={"rounded-lg"}>
            {lang.data.footer.links.legal.privacy}
          </Button>
        </Link>
        <Link href={"https://law.ponlponl123.com/additional/alertbox.org"} target="_blank">
          <Button size={"xs"} variant="ghost" className={"rounded-lg"}>
            {lang.data.footer.links.legal.additional}
          </Button>
        </Link>
        <Link href={"https://github.com/ponlponl123-labs/alertbox-org"} target="_blank">
          <Button size="icon" variant="ghost" className={"rounded-lg"}>
            <GithubLogoIcon size={22} weight="fill" className="text-foreground" />
          </Button>
        </Link>
      </div>
    </footer>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [scrollarea, setScrollarea] = useState<HTMLDivElement | null>(null);
  const { userInfo } = useUserContext();
  const pathname = usePathname();
  const scroll = useScroll({
    container: scrollarea ? { current: scrollarea } : undefined,
  });

  const headerOpacity = useTransform(scroll.scrollY, (v) =>
    clamp(v / 200, 0, 1),
  );

  return (
    <div
      id="webapp-wrapper"
      className={cn("flex min-w-0 h-[calc(100dvh-var(--status-banner-height,0))] -mb-(--status-banner-height,0) w-dvw", userInfo && "bg-sidebar")}
    >
      {userInfo && <AppSidebar />}
      <motion.main
        id="webapp-main"
        className="flex-1 flex flex-col min-w-0 bg-black/10 dark:bg-background md:rounded-bl-4xl md:border-l md:border-border relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.56 }}
      >
        {(pathname.includes("/connections") || pathname.startsWith("/app/account/security")) && userInfo && (
          <StreamerModeProtection />
        )}
        {!userInfo && !pathname.startsWith("/app/login/") ? (
          <Login />
        ) : (
          <ScrollArea
            ref={setScrollarea}
            className={"h-[calc(100dvh-var(--status-banner-height,0))] flex-1 flex flex-col relative"}
          >
            <motion.div
              style={{ opacity: headerOpacity }}
              className="w-full h-24 -mb-24 sticky top-0 bg-background mask-b-from-0% z-20 pointer-events-none"
            />
            <div className="flex-1 w-full min-h-[calc(100%-4rem-var(--status-banner-height,0))] flex flex-col z-10">
              <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
                {children}
              </div>
            </div>
            <AppFooter />
          </ScrollArea>
        )}
      </motion.main>
    </div>
  );
}

export default AppLayout;
