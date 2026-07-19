"use client";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LightningIcon,
  CodeBlockIcon,
} from "@phosphor-icons/react";
import { BuyMeACoffee } from "@thesvg/react";
import BorderGlow from "@/components/BorderGlow";
import { motion, useInView } from "motion/react";
import { Input } from "react-smooth-input";
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

function FeeSavingsCalculator({ t }: { t: any }) {
  const [volume, setVolume] = useState(1500);
  const competitorFee = Math.round(volume * 0.1);
  const saved = competitorFee;

  return (
    <div className="w-full">
      <div className="flex items-end gap-16 pb-10 pl-2 pt-4">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="relative w-14 overflow-hidden rounded-t-sm bg-foreground/10"
            animate={{ height: Math.max(20, (competitorFee / 500) * 150) }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <motion.span
              key={competitorFee}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] font-medium tabular-nums text-foreground/40"
            >
              -${competitorFee}
            </motion.span>
          </motion.div>
          <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-foreground/35">
            {t.calculator?.others}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative h-[3px] w-14 rounded-t-sm bg-foreground">
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[11px] font-semibold tabular-nums text-foreground">
              $0
            </span>
          </div>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-foreground">
            AlertBox
          </span>
        </div>

        <div className="flex-1 border-l border-foreground/10 pl-8">
          <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/30">
            {t.calculator?.volume_label}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
            ${volume.toLocaleString()}
          </p>
          <p className="mt-2 font-mono text-[10px] text-foreground/50">
            {t.calculator?.you_save}{" "}
            <span className="text-foreground font-bold">
              ${saved.toLocaleString()}
            </span>
            /{t.calculator?.per_mo}
          </p>
        </div>
      </div>

      <input
        type="range"
        min="100"
        max="5000"
        step="100"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="h-px w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-foreground"
      />
      <div className="mt-2 flex justify-between font-mono text-[9px] text-foreground/25">
        <span>$100</span>
        <span>$5,000 / {t.calculator?.per_mo}</span>
      </div>
    </div>
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

export default function PricingPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pricing;
  const [username, setUsername] = useState("");

  return (
    <div className="w-full min-h-screen bg-background font-sans pt-32 pb-24 text-foreground relative">
      <GridOverlay />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,var(--foreground)_0%,transparent_20%)] blur-[128px] opacity-40 pointer-events-none" />

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
              backgroundColor="var(--card)"
              borderRadius={24}
              glowRadius={40}
              glowIntensity={0.8}
              coneSpread={25}
              animated={false}
              colors={["#c084fc", "#f472b6", "#38bdf8"]}
              className="w-full h-full flex flex-col justify-between p-8 bg-card border-0 rounded-3xl shadow-xl"
            >
              <div>
                <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40 mb-6 block">
                  {t.free_plan.title}
                </span>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black tracking-tighter text-foreground">
                    {t.free_plan.price}
                  </span>
                  <span className="text-sm font-medium text-foreground/40">
                    / {t.free_plan.period}
                  </span>
                </div>
                <p className="text-sm text-foreground/50 mb-8 font-medium leading-relaxed">
                  {t.free_plan.desc}
                </p>

                <ul className="flex flex-col gap-4 mb-8">
                  {t.free_plan.features.map((feature: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm text-foreground/70"
                    >
                      <CheckIcon
                        className="size-4 text-foreground shrink-0"
                        weight="bold"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/app" className="w-full">
                <Button className="w-full h-11 rounded-full px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-foreground text-background hover:bg-foreground/90 transition-all">
                  {t.get_started}
                </Button>
              </Link>
            </BorderGlow>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="md:col-span-6 flex flex-col justify-center"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground mb-4">
                {t.gateway_fees.title}
              </h2>
              <p className="text-sm text-foreground/50 mb-8 leading-relaxed font-medium">
                {t.gateway_fees.desc}
              </p>

              <div className="flex flex-col gap-6">
                {t.gateway_fees.providers.map((prov: any, idx: number) => (
                  <div
                    key={idx}
                    className="border-b border-border pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-semibold text-sm text-foreground">
                        {prov.name}
                      </h3>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {prov.fee}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                      {prov.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <hr className="border-t border-border mb-16" />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20"
        >
          <div className="md:col-span-4 flex flex-col justify-center">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40 mb-4 block">
              {t.calculator?.subtitle}
            </span>
            <h2 className="text-2xl md:text-3xl tracking-tighter text-foreground mb-3">
              {t.calculator?.title}
            </h2>
            <p className="text-sm text-foreground/50 leading-relaxed font-medium">
              {t.calculator?.desc}
            </p>
          </div>
          <div className="md:col-span-8">
            <div className="p-8 rounded-xl bg-background border border-border shadow-lg">
              <FeeSavingsCalculator t={t} />
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20"
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40 mb-8"
          >
            {t.features_grid?.subtitle}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheckIcon,
                title: t.features_grid?.privacy?.title,
                desc: t.features_grid?.privacy?.desc,
              },
              {
                icon: LightningIcon,
                title: t.features_grid?.alerts?.title,
                desc: t.features_grid?.alerts?.desc,
              },
              {
                icon: CodeBlockIcon,
                title: t.features_grid?.open_source?.title,
                desc: t.features_grid?.open_source?.desc,
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="flex flex-col gap-3 p-6 rounded-xl bg-foreground/5 hover:bg-foreground/8 backdrop-blur-sm transition-colors duration-300"
              >
                <div className="size-10 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground">
                  <feature.icon size={20} weight="fill" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <hr className="border-t border-border mb-16" />

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20"
        >
          <motion.div variants={fadeInUp} className="md:col-span-4">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40">
              {t.support_us}
            </span>
          </motion.div>
          <motion.div variants={fadeInUp} className="md:col-span-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {t.help_title}
            </h3>
            <p className="text-base text-foreground/50 leading-relaxed font-medium mb-8">
              {t.help_desc}
            </p>
            <Link
              href="https://buymeacoffee.com/ponlponl123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="h-11 rounded-full px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-amber-100 hover:bg-amber-50 text-black transition-all flex items-center gap-2">
                <BuyMeACoffee className="size-4" />
                {t.help_action}
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center py-20 border-t border-border"
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

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full max-w-md relative group mx-auto"
          >
            <div className="absolute -inset-px rounded-full bg-linear-to-r from-rose-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 group-hover:opacity-60 blur-md transition-all duration-500 pointer-events-none" />

            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.cta_bottom?.placeholder}
              className="relative flex-1 bg-transparent border-none focus:ring-0 text-foreground pl-5 z-10"
              classNames={{
                base: "p-1 rounded-full backdrop-blur-xs border-2",
              }}
              fontStyle={{
                fontFamily: "var(--font-sans)",
                fontWeight: "600",
                fontSize: "14px",
              }}
              startContent={
                <span className="text-sm font-semibold text-foreground/50 ml-3 -mr-2.5 hidden sm:block">
                  tip-to.me/@
                </span>
              }
              endContent={
                <Link
                  href={
                    username.trim()
                      ? `/app/profile?username=${username}`
                      : "/app/profile"
                  }
                  className="relative h-full px-5 py-3 rounded-full bg-foreground text-background font-black text-xs flex items-center justify-center gap-1.5 hover:bg-foreground/90 active:scale-95 ml-2 shadow-md z-10 cursor-pointer"
                >
                  <span>{t.cta_bottom?.claim}</span>
                  <ArrowRightIcon weight="bold" size={13} />
                </Link>
              }
            />
          </motion.div>

          <p className="text-[9px] font-mono tracking-widest text-foreground/25 uppercase mt-10">
            {t.cta_bottom?.footnote}
          </p>
        </motion.section>
      </div>
    </div>
  );
}
