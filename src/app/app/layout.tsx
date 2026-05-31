"use client";
import { useUserContext } from "@/contexts/user";
import React from "react";
import Login from "./login";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

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
        className="flex-1 min-w-0 bg-black/10 dark:bg-background rounded-bl-4xl overflow-x-hidden overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.56 }}
      >
        {!userInfo && !pathname.startsWith("/app/login/") ? (
          <Login />
        ) : (
          <>
            <div className="w-full h-12 sticky top-0" />
            <div className="px-12 py-2">{children}</div>
          </>
        )}
      </motion.main>
    </div>
  );
}

export default AppLayout;
