"use client";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { ReactNode } from "react";
import { useStore } from "zustand";
import RegisURIPage from "./renew/page";

function ProfileLayout({ children }: { children: ReactNode }) {
  const { userInfo } = useUserContext();
  const lang = useStore(coreStore, (state) => state.lang);
  return (
    <>
      <h1 className="font-semibold text-3xl mt-1.5 z-10 relative items-center flex gap-3">
        {lang.data.app.profile.title}
        {userInfo?.profile?.publishedAt ? (
          <div className="relative size-2.5 rounded-full bg-emerald-400 inline-flex">
            <div className="size-full rounded-full animate-ping bg-emerald-400" />
          </div>
        ) : (
          <div className="relative size-2.5 rounded-full bg-zinc-600 inline-flex" />
        )}
      </h1>
      {userInfo?.profile?.uri ? children : <RegisURIPage />}
    </>
  );
}

export default ProfileLayout;
