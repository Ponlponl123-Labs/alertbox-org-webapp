"use client";
import { useUserContext } from "@/contexts/user";
import React from "react";
import Login from "./login";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import StreamerModeProtection from "@/components/streamer-mode-protection";

const protectedPaths = ["/app/connections", "/app/account/security"];

function AppLayout({ children }: { children: React.ReactNode }) {
  const { userInfo } = useUserContext();
  const pathname = usePathname();
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
        {protectedPaths.includes(pathname) && <StreamerModeProtection />}
        {!userInfo && !pathname.startsWith("/app/login/") ? (
          <Login />
        ) : (
          <ScrollArea className={"h-screen flex flex-col relative"}>
            <div className="w-full h-12 sticky top-0" />
            <div className="px-12 max-sm:px-4 max-md:px-6 py-2 flex-1 w-full min-h-[calc(100%-3rem)] flex flex-col">
              {children}
            </div>
          </ScrollArea>
        )}
      </motion.main>
    </div>
  );
}

export default AppLayout;
