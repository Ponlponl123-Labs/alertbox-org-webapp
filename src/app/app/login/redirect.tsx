"use client";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Link from "next/link";

function Redirect({ redirectUrl }: { redirectUrl: string }) {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <div className="min-h-screen relative flex flex-col p-6 pb-24 items-center">
      <div className="m-auto flex flex-col gap-3 max-w-92">
        <div className="p-8 bg-background supports-backdrop-filter:bg-background/60 text-center supports-backdrop-filter:bg-linear-150 supports-backdrop-filter:from-indigo-950/10 supports-backdrop-filter:to-indigo-600/10 flex flex-col items-center justify-center z-10 supports-backdrop-filter:backdrop-blur-2xl rounded-3xl w-full">
          <ArrowUpRightIcon weight="bold" className="mb-6" size={26} />
          <h1 className="text-lg tracking-wider font-semibold">
            {lang.data.app.redirect.title}
          </h1>
          <p className="text-sm text-foreground/60 mt-1.5">
            {lang.data.app.redirect.description}
          </p>
          <span className="text-xs text-foreground/40 mt-8">
            {lang.data.app.redirect.manually.placeholder}
            <br />
            <Link className="text-blue-500 mt-1.5" href={redirectUrl}>
              {lang.data.app.redirect.manually.link}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Redirect;
