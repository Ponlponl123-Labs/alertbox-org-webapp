"use client";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import { CraneTowerIcon } from "@phosphor-icons/react";
import { Streamlabs } from "@thesvg/react";
import Link from "next/link";
import { useStore } from "zustand";

export default () => {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <div className="w-full flex max-md:flex-col items-center justify-center gap-6 min-h-0 bg-foreground/5 mt-6 rounded-4xl flex-1 border-2 border-dashed border-foreground/10 p-3">
      <div className="flex flex-col gap-3 items-center justify-center max-w-xs text-center">
        <CraneTowerIcon weight="fill" className="size-12 text-foreground/20" />
        <h1 className="tracking-wider text-foreground/40 text-lg font-semibold">
          {lang.data.common.comming_soon}
        </h1>
        <p className="tracking-wider text-foreground/30 text-xs -mt-1.5">
          {lang.data.app.alertbox.donation.description}
        </p>
      </div>
      <span className="tracking-wider font-semibold text-foreground/30 text-sm">
        {lang.data.app.alertbox.donation.or}
      </span>
      <div className="flex flex-col gap-3 items-center justify-center max-w-xs text-center">
        <Streamlabs className="size-12" />
        <h1 className="tracking-wider text-foreground/40 text-lg font-semibold">
          {lang.data.app.alertbox.donation.streamlabs.title}
        </h1>
        <p className="tracking-wider text-foreground/30 text-xs text-center max-w-2xl mx-auto">
          {lang.data.app.alertbox.donation.streamlabs.description}
        </p>
        <Link href={"/app/connections?t=trigger"}>
          <Button className={"rounded-full"}>
            {lang.data.app.alertbox.donation.streamlabs.button}
          </Button>
        </Link>
      </div>
    </div>
  );
};
