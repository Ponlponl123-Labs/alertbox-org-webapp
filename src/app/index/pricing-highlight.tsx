"use client";

import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import BorderGlow from "@/components/BorderGlow";
import { CheckIcon, SparkleIcon } from "@phosphor-icons/react";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as never },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function PricingHighlight() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.pricing_highlight;

  return (
    <section className="w-full py-24 bg-background border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.02)_0%,transparent_50%)] pointer-events-none" />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-2xl w-max mx-auto px-6 z-10 relative"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border/60 shadow-sm mb-6">
            <SparkleIcon size={12} weight="fill" className="text-rose-500" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-foreground/80 font-mono">
              {t.subtitle}
            </span>
          </div>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <BorderGlow
            edgeSensitivity={30}
            glowColor="50 85 85"
            borderRadius={24}
            glowRadius={45}
            glowIntensity={1}
            colors={["#F43F5E", "#38bdf8", "#c084fc"]}
            backgroundColor="var(--card)"
            className="flex flex-col items-center gap-6 p-8 md:p-10 rounded-3xl bg-card/60 backdrop-blur-md border border-border shadow-xl animate-fade-in"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {t.title}
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl md:text-7xl font-black tracking-tighter text-foreground font-baijamjuree">
                {t.price}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / {t.period}
              </span>
            </div>
            <p className="text-sm text-muted-foreground/85 my-4 max-w-sm leading-relaxed font-normal font-read">
              {t.description}
            </p>
            <ul className="flex flex-col gap-3 w-full max-w-xs text-left">
              {t.features.map((feature: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-sm text-foreground/80"
                >
                  <CheckIcon
                    className="size-4 text-emerald-500 shrink-0"
                    weight="bold"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/app" className="w-full flex-1 min-w-0 max-w-xl mt-6">
              <Button className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer">
                {t.cta}
              </Button>
            </Link>
            <p className="text-[10px] text-muted-foreground text-center font-medium mt-6">
              {t.footnote}
            </p>
          </BorderGlow>
        </motion.div>
        <motion.div variants={fadeInUp} className="text-center mt-6">
          <Link
            href="/pricing"
            className="text-xs text-muted-foreground hover:text-foreground font-semibold underline underline-offset-4 transition-colors"
          >
            {lang.data.header.links.pricing} →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
