"use client";
import { useUserContext } from "@/contexts/user";
import React from "react";
import Login from "./login";
import { usePathname } from "next/navigation";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { userInfo } = useUserContext();
  const pathname = usePathname();
  return (
    <div id="webapp-wrapper">
      <main id="webapp-main" className="pt-12">
        {!userInfo && !pathname.startsWith("/app/login/") ? (
          <Login />
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export default AppLayout;
