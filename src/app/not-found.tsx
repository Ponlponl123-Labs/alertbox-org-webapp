"use client";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import Link from "next/link";
import { useStore } from "zustand";

function NotFound() {
  const lang = useStore(coreStore, (state) => state.lang);
  return (
    <div className="min-h-screen pt-24 flex flex-col gap-3 items-center p-8 relative">
      <div className="absolute size-full top-0 left-0">
        <StarsBackground />
      </div>
      <div className="z-10 m-auto text-center flex flex-col items-center justify-center gap-3">
        <h1 className="font-semibold text-3xl tracking-wider">
          {lang.data.pages.notfound.title}
        </h1>
        <p className="text-foreground/40">
          {lang.data.pages.notfound.description}
        </p>
        <Link href={"/"}>
          <Button className={"rounded-xl"}>
            {lang.data.pages.notfound.back}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
