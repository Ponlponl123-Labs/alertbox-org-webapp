"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { AnimatePresence, motion } from "motion/react";
import {
  GithubLogoIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { BuyMeACoffee } from "@thesvg/react";
import type { DonatePageData } from "@/types/landing.types";
import PixelSnow from "@/components/PixelSnow";
import { Button } from "@/components/ui/button";

const MotionButton = motion.create(Button);
const MotionLink = motion.create(Link);

export default function DonatePage() {
  const isDark = useStore(coreStore, (state) => state.isDark);
  const lang = useStore(coreStore, (state) => state.lang);
  const t: DonatePageData = lang.data.donate;

  const [selectedTier, setSelectedTier] = useState(1);

  const tiers = t.tiers;
  const activeTier = tiers[selectedTier];

  const bmacLabel = activeTier.amount
    ? t.button_bmac_tier.replace("{amount}", `$${activeTier.amount}`)
    : t.button_bmac;

  return (
    <div className="w-full min-h-dvh flex flex-col justify-center items-center px-6 py-32 relative overflow-hidden text-foreground select-none">
      <div className="absolute inset-0 opacity-40 not-dark:opacity-10">
        <PixelSnow
          color={isDark ? "#ffffff" : "#a0a0a0"}
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1}
          density={0.3}
          direction={125}
          brightness={1}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
      </div>

      <div
        className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-medium tracking-tight text-foreground leading-[1.08] mb-5 text-balance">
          {t.title_prefix}{" "}
          <span className="bg-linear-to-r from-rose-500 to-primary bg-clip-text text-transparent">
            {t.title_highlight}
          </span>{" "}
          {t.title_suffix}
        </h1>

        <p className="text-sm sm:text-base text-foreground/60 font-normal leading-relaxed max-w-lg mb-8 text-pretty">
          {t.description}
        </p>

        <div className="inline-flex max-w-full overflow-x-auto no-scrollbar items-center p-1 rounded-2xl bg-foreground/4 border border-foreground/8 not-hover:scale-99 active:scale-99 apply-smooth-transition backdrop-blur-md mb-8 gap-px">
          {tiers.map((tier, idx) => {
            const isSelected = selectedTier === idx;
            return (
              <Button
                key={tier.amount ?? "custom"}
                type="button"
                onClick={() => setSelectedTier(idx)}
                className={`relative px-4 py-2 rounded-md first:rounded-l-xl last:rounded-r-xl first:[&_#active-pill]:rounded-l-xl last:[&_#active-pill]:rounded-r-xl text-xs font-mono hover:bg-transparent whitespace-nowrap ${isSelected
                  ? "text-background bg-transparent font-semibold"
                  : "text-foreground/60 bg-transparent hover:text-foreground"
                  }`}
              >
                {isSelected && (
                  <motion.div
                    id="active-pill"
                    layoutId="active-pill"
                    className="absolute inset-0 bg-foreground rounded-md shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {tier.amount ? `$${tier.amount} (${tier.label})` : tier.label}
                </span>
              </Button>
            );
          })}
        </div>

        <motion.div
          layout
          transition={{ layout: { type: "spring", stiffness: 380, damping: 30 } }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-6"
        >
          <MotionLink
            layout
            transition={{ layout: { type: "spring", stiffness: 380, damping: 30 } }}
            href="https://buymeacoffee.com/ponlponl123"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-auto"
          >
            <MotionButton
              layout
              transition={{ layout: { type: "spring", stiffness: 380, damping: 30 } }}
              type="button"
              className="p-5 rounded-full flex items-center justify-center gap-2 shadow-md"
            >
              <BuyMeACoffee className="size-4 shrink-0" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${activeTier?.amount}-${activeTier?.label}`}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  className="inline-block text-xs sm:text-sm font-semibold"
                  transition={{
                    duration: 0.2,
                    ease: [0.16, 1, 0.3, 1] as never,
                  }}
                >
                  {bmacLabel}
                </motion.span>
              </AnimatePresence>
              <ArrowRightIcon size={14} weight="bold" />
            </MotionButton>
          </MotionLink>

          <MotionLink
            layout
            transition={{ layout: { type: "spring", stiffness: 380, damping: 30 } }}
            href="https://github.com/sponsors/ponlponl123"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-auto"
          >
            <Button
              type="button"
              variant={"outline"}
              className="p-5 rounded-full font-sans text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <GithubLogoIcon size={15} weight="fill" className="shrink-0" />
              <span>{t.button_github}</span>
            </Button>
          </MotionLink>
        </motion.div>

        {t?.footnote && (
          <p className="text-xs font-mono text-foreground/40 text-center tracking-tight">
            {t.footnote}
          </p>
        )}
      </div>
    </div>
  );
}
