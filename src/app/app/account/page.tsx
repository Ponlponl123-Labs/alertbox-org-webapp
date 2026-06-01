"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import Image from "next/image";
import { useStore } from "zustand";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo } = useUserContext();

  return (
    <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
      {userInfo?.banner && (
        <Image
          src={userInfo?.banner}
          alt="Banner"
          className="w-full h-96 object-cover absolute inset-0 rounded-b-full blur-3xl pointer-events-none z-0 opacity-30"
          width={720}
          height={288}
        />
      )}
      <div>
        <div className="w-full h-48 rounded-4xl bg-foreground/5 overflow-hidden">
          {userInfo?.banner && (
            <Image
              src={userInfo?.banner}
              alt="Banner"
              className="w-full h-full object-cover pointer-events-none"
              width={720}
              height={288}
            />
          )}
        </div>
      </div>
      <Avatar className="size-24 -mt-12 border-4 border-background rounded-full">
        {userInfo?.avatar && <AvatarImage src={userInfo?.avatar} />}
        <AvatarFallback>
          {getFallbackInitial(userInfo?.name || "?")}
        </AvatarFallback>
      </Avatar>
      <h1 className="font-semibold text-3xl mt-1.5">{userInfo?.displayname}</h1>
      <span className="text-foreground/40">@{userInfo?.name}</span>
      <div className="w-full flex flex-col items-center justify-center min-h-0 bg-foreground/5 mt-6 rounded-4xl flex-1 border-2 border-dashed border-foreground/10">
        <span className="tracking-wider text-foreground/40">Coming soon</span>
      </div>
    </div>
  );
}

export default Page;
