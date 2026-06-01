"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import { useStore } from "zustand";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo } = useUserContext();

  return (
    <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
      {userInfo && (
        <div className="flex gap-1.75 items-center">
          <Avatar size="sm">
            {userInfo.avatar && <AvatarImage src={userInfo.avatar} />}
            <AvatarFallback>{getFallbackInitial(userInfo.name)}</AvatarFallback>
          </Avatar>
          <span className="text-foreground/40">@{userInfo?.name}</span>
        </div>
      )}
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.alertbox.purchased.title}
      </h1>
      <div className="w-full flex flex-col items-center justify-center min-h-0 bg-foreground/5 mt-6 rounded-4xl flex-1 border-2 border-dashed border-foreground/10">
        <span className="tracking-wider text-foreground/40">
          {lang.data.common.comming_soon}
        </span>
      </div>
    </div>
  );
}

export default Page;
