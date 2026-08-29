"use client";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import BorderGlow from "@/components/BorderGlow";
import { BuyMeACoffee } from "@thesvg/react";
import {
  HeartIcon,
  GithubLogoIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";

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

function GridOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.4]"
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage:
          "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
      }}
    />
  );
}

function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.5,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

import { type DonatePageData } from "@/types/landing.types";

function FundAllocationBar({ t }: { t: DonatePageData }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const allocations = [
    {
      label: t.allocations?.servers?.title,
      pct: 40,
      color: "bg-foreground",
      desc: t.allocations?.servers?.desc,
    },
    {
      label: t.allocations?.webhooks?.title,
      pct: 30,
      color: "bg-foreground/70",
      desc: t.allocations?.webhooks?.desc,
    },
    {
      label: t.allocations?.dev?.title,
      pct: 30,
      color: "bg-foreground/40",
      desc: t.allocations?.dev?.desc,
    },
  ];

  return (
    <div ref={ref} className="w-full">
      <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 mb-4">
        {allocations.map((alloc, idx) => (
          <motion.div
            key={idx}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${alloc.pct}%` } : { width: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2 + idx * 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`${alloc.color} rounded-full cursor-pointer transition-opacity ${hoveredIdx !== null && hoveredIdx !== idx ? "opacity-30" : "opacity-100"}`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {allocations.map((alloc, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
            className={`flex items-center gap-3 transition-opacity duration-200 ${hoveredIdx !== null && hoveredIdx !== idx ? "opacity-30" : "opacity-100"}`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className={`size-2.5 rounded-full shrink-0 ${alloc.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {alloc.label}
                </span>
                <span className="font-mono text-xs font-bold text-foreground/40 tabular-nums">
                  {alloc.pct}%
                </span>
              </div>
              <p className="text-xs text-foreground/40 font-medium mt-0.5">
                {alloc.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function DonatePage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.donate;

  return (
    <div className="w-full min-h-screen bg-background font-sans pt-32 pb-24 text-foreground relative">
      <GridOverlay />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--foreground)_0%,transparent_20%)] blur-[128px] opacity-40 pointer-events-none" />

      <div className="max-w-368 mx-auto px-6 relative z-10">
        <motion.header
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40 mb-4"
          >
            {t.subtitle}
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-tight mb-6 text-foreground"
          >
            {t.title}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base text-foreground/50 leading-relaxed font-medium max-w-2xl"
          >
            {t.description}
          </motion.p>
        </motion.header>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-3 gap-6 md:gap-12 mb-16"
        >
          {[
            {
              value: 0,
              suffix: "%",
              label: t.stats?.fees,
            },
            {
              value: 100,
              suffix: "%",
              label: t.stats?.open_source,
            },
            {
              value: 24,
              suffix: "/7",
              label: t.stats?.uptime,
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="text-center md:text-left"
            >
              <p className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground mb-2">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  duration={1.2 + idx * 0.3}
                />
              </p>
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-foreground/35">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <hr className="border-t border-border mb-16" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20"
        >
          <motion.div
            variants={fadeInUp}
            className="md:col-span-6 flex flex-col justify-between"
          >
            <BorderGlow
              edgeSensitivity={30}
              glowColor="40 80 80"
              borderRadius={24}
              glowRadius={40}
              glowIntensity={0.8}
              backgroundColor="var(--card)"
              colors={["#F43F5E", "#ec4899", "#d946ef"]}
              className="flex flex-col justify-between p-8 bg-card border-0 rounded-3xl shadow-xl h-full"
            >
              <div>
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-foreground text-background mb-6">
                  <HeartIcon size={24} weight="fill" />
                </div>
                <h2 className="text-xl lg:text-2xl text-foreground mb-3">
                  {t.cta_title}
                </h2>
                <p className="text-sm text-foreground/50 leading-relaxed font-medium mb-8">
                  {t.cta_desc}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="https://buymeacoffee.com/ponlponl123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full h-11 rounded-full px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-amber-100 hover:bg-amber-50 text-black transition-all flex items-center justify-center gap-2">
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
                  <Button className="w-full h-11 rounded-full px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-foreground text-background hover:bg-foreground/90 transition-all flex items-center justify-center gap-2">
                    <GithubLogoIcon weight="fill" className="size-4" />
                    {t.button_github}
                  </Button>
                </Link>
              </div>
            </BorderGlow>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="md:col-span-6 flex flex-col justify-center"
          >
            <h2 className="text-xl font-semibold tracking-tight text-foreground mb-8">
              {t.usage_title}
            </h2>
            <FundAllocationBar t={t} />
          </motion.div>
        </motion.div>

        <hr className="border-t border-border mb-16" />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-foreground/10 bg-foreground/[0.03] mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-foreground" />
            </span>
            <span className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
              {t.cta_bottom?.badge}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl tracking-tighter text-foreground mb-5 leading-none">
            {t.cta_bottom?.title}
          </h2>
          <p className="text-sm md:text-base text-foreground/40 font-medium mb-10 max-w-lg mx-auto">
            {t.cta_bottom?.desc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/app">
              <Button className="h-11 rounded-full px-8 text-xs font-bold uppercase tracking-wider cursor-pointer bg-foreground text-background hover:bg-foreground/90 transition-all flex items-center gap-2">
                <RocketLaunchIcon weight="bold" size={14} />
                {t.cta_bottom?.get_started}
                <ArrowRightIcon weight="bold" size={13} />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="h-11 rounded-full px-8 text-xs font-bold uppercase tracking-wider cursor-pointer border border-foreground/20 bg-transparent text-foreground transition-all"
              >
                {t.cta_bottom?.view_pricing}
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
