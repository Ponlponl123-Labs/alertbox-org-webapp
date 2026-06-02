"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import { ReactNode } from "react";
import { useStore } from "zustand";
import RegisURIPage from "./renew/page";
import Image from "next/image";

function ProfileLayout({ children }: { children: ReactNode }) {
  const { userInfo } = useUserContext();
  const lang = useStore(coreStore, (state) => state.lang);
  return (
    <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
      {userInfo?.uri && userInfo?.banner && (
        <div className="mask-b-to-100% mask-b-from-30% opacity-40 -translate-y-32 w-full h-96 absolute pointer-events-none top-0 left-0">
          <Image
            src={userInfo?.banner}
            alt="Banner"
            className="size-full object-cover inset-0 rounded-b-full blur-3xl z-0 saturate-150 contrast-150"
            width={720}
            height={288}
          />
        </div>
      )}
      {userInfo && (
        <div className="flex gap-1.75 items-center z-10 relative">
          <Avatar size="sm">
            {userInfo.avatar && <AvatarImage src={userInfo.avatar} />}
            <AvatarFallback>{getFallbackInitial(userInfo.name)}</AvatarFallback>
          </Avatar>
          <span className="text-foreground/40">@{userInfo?.name}</span>
        </div>
      )}
      <h1 className="font-semibold text-3xl mt-1.5 z-10 relative items-center flex gap-3">
        {lang.data.app.profile.title}
        {userInfo?.published ? (
          <div className="relative size-2.5 rounded-full bg-emerald-400 inline-flex">
            <div className="size-full rounded-full animate-ping bg-emerald-400" />
          </div>
        ) : (
          <div className="relative size-2.5 rounded-full bg-zinc-600 inline-flex" />
        )}
      </h1>
      {userInfo?.uri ? children : <RegisURIPage />}
    </div>
  );
}

export default ProfileLayout;
