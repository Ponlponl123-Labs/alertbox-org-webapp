"use client";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { useStore } from "zustand";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo } = useUserContext();

  return (
    <>
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.alertbox.subscription.title}
      </h1>
      <div className="w-full flex flex-col items-center justify-center min-h-0 bg-foreground/5 mt-6 rounded-4xl flex-1 border-2 border-dashed border-foreground/10">
        <span className="tracking-wider text-foreground/40">
          {lang.data.common.comming_soon}
        </span>
      </div>
    </>
  );
}

export default Page;
