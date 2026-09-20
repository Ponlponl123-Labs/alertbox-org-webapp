"use client";

import { motion } from "motion/react";
import {
  Stripe,
  BuyMeACoffee,
  KoFi,
  Twitch,
  Youtube,
  Streamlabs,
  Patreon,
} from "@thesvg/react";
import { FeelFreePay } from "@/components/icons";
import {
  ArrowRightIcon,
  DesktopIcon,
  DiscordLogoIcon,
  QrCodeIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

export default function CentralizedHub() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.centralized_hub;

  return (
    <section className="relative w-full py-28 md:py-36 overflow-hidden text-foreground border-t border-foreground/5">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-linear-to-r from-transparent via-foreground/30 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-64 bg-[radial-gradient(ellipse_at_top,var(--muted),transparent_70%)] blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center px-4 py-1 rounded-full border border-foreground/10 bg-foreground/4 mb-6">
          <span className="text-xs font-medium tracking-wide text-foreground/80">
            {t?.badge ?? "Seamless Integrations"}
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground max-w-3xl leading-[1.08] mb-5">
          {t?.title ?? "Connect your favorite tools and streamline alerts effortlessly"}
        </h2>

        <p className="text-base sm:text-lg text-foreground/50 max-w-xl font-normal leading-relaxed mb-8">
          {t?.description ?? "Integrate your favorite payment gateways and OBS software to keep everything unified across your stream."}
        </p>

        <Link
          href="/app/connections"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-semibold text-xs transition-all hover:bg-foreground/80 active:scale-95 mb-16 cursor-pointer"
        >
          <span>{t?.cta ?? "Start integrating"}</span>
          <ArrowRightIcon size={14} weight="bold" />
        </Link>

        <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center gap-3">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 rounded-full bg-muted blur-[90px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-65 sm:size-75 rounded-full border border-foreground/6 dark:border-white/8 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-105 sm:size-120 rounded-full border border-dashed border-foreground/4 dark:border-white/6 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-145 sm:size-160 rounded-full border border-foreground/2.5 dark:border-white/4 pointer-events-none" />
          <div className="flex items-center justify-center gap-3.5 sm:gap-4">
            <div className="size-8 sm:size-14 rounded-2xl bg-black backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-40 hover:opacity-100 transition-opacity">
              <Patreon className="size-full text-white" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-black backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-70 hover:opacity-100 transition-opacity">
              <Streamlabs className="size-full text-white" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-black backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
              <Twitch className="size-full text-white" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-black backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-40 hover:opacity-100 transition-opacity">
              <Youtube className="size-full text-white" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3.5 sm:gap-4">
            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-60 hover:opacity-100 transition-opacity">
              <QrCodeIcon size={24} className="text-white" weight="bold" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg hover:opacity-100 transition-opacity">
              <Stripe className="size-full text-white" />
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="size-18 sm:size-20 rounded-[32px] bg-[#151522] border-2 border-white/30 flex items-center justify-center p-3 shadow-2xl z-10 relative"
            >
              <div className="size-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shadow-md">
                <Image
                  src="/alertbox-black.png"
                  alt="AlertBox"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg hover:opacity-100 transition-opacity">
              <KoFi className="size-full text-white" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-60 hover:opacity-100 transition-opacity">
              <BuyMeACoffee className="size-full text-white" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3.5 sm:gap-4">
            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-40 hover:opacity-100 transition-opacity">
              <FeelFreePay className="size-full text-white" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
              <DesktopIcon size={24} className="text-white" weight="bold" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-70 hover:opacity-100 transition-opacity">
              <DiscordLogoIcon size={24} className="text-white" weight="bold" />
            </div>
            <div className="size-8 sm:size-14 rounded-2xl bg-[#111118] backdrop-blur-sm flex items-center justify-center p-3 shadow-lg opacity-40 hover:opacity-100 transition-opacity">
              <span className="font-mono text-xs font-bold text-white/70">API</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
