"use client";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import BorderGlow from "@/components/BorderGlow";
import { BuyMeACoffee } from "@thesvg/react";
import { HeartIcon, GithubLogoIcon } from "@phosphor-icons/react";
import Aurora from "@/components/Aurora";

export default function DonatePage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.donate;

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black font-sans pt-32 pb-24 text-zinc-900 dark:text-zinc-50 relative selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Backdrop Light Rays */}
        <div className="w-full absolute top-0 left-0 h-128 mask-b-from-0% opacity-60 pointer-events-none overflow-hidden z-0">
          <div className="w-full absolute top-0 left-0 h-128">
            <Aurora
              colorStops={["#f43f5e", "#ec4899", "#be185d"]}
              blend={1}
              amplitude={1.0}
              speed={1}
            />
          </div>
        </div>

        {/* Header Section */}
        <header className="max-w-3xl mb-16 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
            {t.subtitle}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            {t.title}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal max-w-2xl">
            {t.description}
          </p>
        </header>

        {/* Separator line */}
        <hr className="border-t border-zinc-100 dark:border-zinc-900 mb-16 relative z-10" />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 relative z-10">
          {/* Left Column: Direct Call to Action */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <BorderGlow
              edgeSensitivity={30}
              glowColor="10 80 80"
              borderRadius={0}
              glowRadius={40}
              glowIntensity={1}
              backgroundColor="var(--bg-card)"
              colors={["#f43f5e", "#ec4899", "#d946ef"]}
              className="flex flex-col justify-between p-8 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 h-full"
            >
              <div>
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 mb-6">
                  <HeartIcon size={32} weight="fill" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
                  {t.cta_title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                  {t.cta_desc}
                </p>
              </div>

              <Link
                href="https://buymeacoffee.com/ponlponl123"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full h-12 rounded-none px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-amber-100 hover:bg-amber-50 text-black border border-transparent transition-all flex items-center justify-center gap-2">
                  <BuyMeACoffee className="size-4" />
                  {t.button}
                </Button>
              </Link>
              <Link
                href="https://github.com/sponsors/ponlponl123"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full h-12 rounded-none px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black border border-transparent transition-all flex items-center justify-center gap-2">
                  <GithubLogoIcon weight="fill" className="size-4" />
                  {t.button_github}
                </Button>
              </Link>
            </BorderGlow>
          </div>

          {/* Right Column: Funding Allocations */}
          <div className="md:col-span-6 flex flex-col justify-center">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
              {t.usage_title}
            </h2>

            <div className="flex flex-col gap-6">
              {t.usage_items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 text-sm font-bold text-zinc-400 dark:text-zinc-600 font-mono">
                    0{idx + 1}.
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
