"use client";
import { useUserContext } from "@/contexts/user";
import React, { useState } from "react";
import Login from "./login";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";
import { motion, useScroll, useTransform } from "motion/react";
import { cn, getFallbackInitial } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import StreamerModeProtection from "@/components/streamer-mode-protection";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const protectedPaths = ["/app/connections", "/app/account/security"];

function AppLayout({ children }: { children: React.ReactNode }) {
  const [scrollarea, setScrollarea] = useState<HTMLDivElement | null>(null);
  const { userInfo } = useUserContext();
  const pathname = usePathname();
  const scroll = useScroll({
    container: scrollarea ? { current: scrollarea } : undefined,
  });

  const headerOpacity = useTransform(scroll.scrollY, (v) => (v > 0 ? 1 : 0));

  const bannerUrl = userInfo?.profile?.banner;
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);

  React.useEffect(() => {
    setIsBannerLoaded(false);
  }, [bannerUrl]);

  return (
    <div
      id="webapp-wrapper"
      className={cn("flex flex-1 min-w-0 w-full", userInfo && "bg-sidebar")}
    >
      {userInfo && <AppSidebar />}
      <motion.main
        id="webapp-main"
        className="flex-1 flex flex-col min-w-0 bg-black/10 dark:bg-background md:rounded-bl-4xl relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.56 }}
      >
        {protectedPaths.includes(pathname) && userInfo && (
          <StreamerModeProtection />
        )}
        {!userInfo && !pathname.startsWith("/app/login/") ? (
          <Login />
        ) : (
          <ScrollArea
            ref={setScrollarea}
            className={"h-screen flex flex-col relative"}
          >
            {userInfo?.profile?.uri && bannerUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isBannerLoaded ? 1 : 0 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="mask-b-to-100% mask-b-from-30% opacity-40 -translate-y-32 w-full h-96 absolute pointer-events-none top-0 left-0 z-0"
              >
                <Image
                  src={bannerUrl}
                  alt="Banner"
                  className="size-full object-cover inset-0 rounded-b-full blur-3xl z-0 saturate-150 contrast-150 select-none"
                  width={720}
                  height={288}
                  onLoad={() => setIsBannerLoaded(true)}
                />
              </motion.div>
            )}
            <motion.div
              style={{ opacity: headerOpacity }}
              className="w-full h-12 sticky top-0 bg-background mask-b-from-0% z-20"
            />
            <div className="px-12 max-sm:px-4 max-lg:px-6 py-2 flex-1 w-full min-h-[calc(100%-3rem)] flex flex-col z-10 relative">
              <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
                {userInfo && !["/app/account"].includes(pathname) && (
                  <div className="flex gap-1.75 items-center">
                    <Avatar size="sm">
                      {userInfo.profile?.avatar && (
                        <AvatarImage src={userInfo.profile.avatar} />
                      )}
                      <AvatarFallback>
                        {getFallbackInitial(userInfo.profile?.name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground/40">
                      @{userInfo.profile?.name}
                    </span>
                  </div>
                )}
                {children}
              </div>
            </div>
          </ScrollArea>
        )}
      </motion.main>
    </div>
  );
}

export default AppLayout;
