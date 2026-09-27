"use client";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import { CheckCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useStore } from "zustand";

function Success() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <div className="my-auto relative flex flex-col p-6 pb-24 items-center">
      <div className="m-auto flex flex-col gap-3 max-w-sm">
        <div className="p-8 text-center flex flex-col items-center justify-center z-10 w-full">
          <CheckCircleIcon
            weight="fill"
            className="mb-6 text-green-600"
            size={32}
          />
          <h1 className="text-lg tracking-wider font-semibold">
            {lang.data.app.success.title}
          </h1>
          <p className="text-xs text-foreground/60 mt-1.5">
            {lang.data.app.success.description}
          </p>
          <Link href={"/app"} className="mt-6">
            <Button className={"p-3 rounded-2xl"}>
              {lang.data.app.success.button}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Success;
