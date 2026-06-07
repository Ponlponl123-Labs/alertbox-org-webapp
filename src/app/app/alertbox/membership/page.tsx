"use client";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { useStore } from "zustand";
import Soon from "../soon";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <>
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.alertbox.subscription.title}
      </h1>
      <Soon />
    </>
  );
}

export default Page;
