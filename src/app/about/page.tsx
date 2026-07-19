"use client";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import BorderGlow from "@/components/BorderGlow";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  ArrowRightIcon,
  BellIcon,
  StarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  HandCoinsIcon,
  CodeBlockIcon,
  TagIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

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

function LiveAlertDemo({ t }: { t: any }) {
  const [activeAlert, setActiveAlert] = useState<"donation" | "sub" | "cheer">(
    "donation",
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlert((prev) => {
        if (prev === "donation") return "sub";
        if (prev === "sub") return "cheer";
        return "donation";
      });
      setTick((t) => t + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const alerts = {
    donation: {
      title: "StreamFan",
      msg: t.live_demo?.messages?.donation,
      amount: "$10.00",
      icon: <BellIcon weight="fill" size={16} />,
      gradient: "from-rose-500 to-orange-500",
      glow: "shadow-rose-500/10",
      tag: t.live_demo?.tags?.donation,
    },
    sub: {
      title: "NightOwl_22",
      msg: t.live_demo?.messages?.sub,
      amount: "Tier 1",
      icon: <StarIcon weight="fill" size={16} />,
      gradient: "from-purple-500 to-indigo-500",
      glow: "shadow-purple-500/10",
      tag: t.live_demo?.tags?.sub,
    },
    cheer: {
      title: "HypeKing",
      msg: t.live_demo?.messages?.cheer,
      amount: "500 Bits",
      icon: <TrophyIcon weight="fill" size={16} />,
      gradient: "from-cyan-500 to-emerald-500",
      glow: "shadow-cyan-500/10",
      tag: t.live_demo?.tags?.cheer,
    },
  };

  const current = alerts[activeAlert];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-10 w-full bg-card border border-border rounded-2xl p-5 shadow-2xl backdrop-blur-md not-hover:grayscale"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-full text-[8px] font-bold font-mono text-foreground/60">
          <span className="size-1 rounded-full bg-emerald-500 animate-ping" />
          <span>LIVE</span>
        </div>

        <div className="flex items-center gap-4 text-left mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeAlert}-${tick}`}
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className={clsx(
                "size-12 rounded-2xl bg-linear-to-br flex items-center justify-center text-white shrink-0 shadow-lg",
                current.gradient,
                current.glow,
              )}
            >
              {current.icon}
            </motion.div>
          </AnimatePresence>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeAlert}-${tick}`}
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ duration: 0.25 }}
              >
                <span className="text-[8px] font-extrabold tracking-widest text-rose-500 font-mono">
                  {current.tag}
                </span>
                <h4 className="text-[13px] font-black text-foreground mt-0.5 truncate">
                  {current.title}{" "}
                  <span className="text-foreground/40 font-semibold">
                    — {current.amount}
                  </span>
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 italic truncate">
                  {current.msg}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[8px] text-muted-foreground/80 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheckIcon size={10} className="text-foreground/50" />
            {t.live_demo?.privacy_tag}
          </span>
          <span>{"<"}50ms</span>
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {(["donation", "sub", "cheer"] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setActiveAlert(type);
              setTick((t) => t + 1);
            }}
            className={clsx(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              activeAlert === type
                ? "w-6 bg-foreground"
                : "w-1.5 bg-foreground/20 hover:bg-foreground/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.about;

  return (
    <div className="w-full min-h-screen bg-background font-sans pt-32 pb-24 text-foreground relative">
      <GridOverlay />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,var(--foreground)_0%,transparent_20%)] blur-[128px] opacity-40 pointer-events-none" />

      <div className="max-w-368 mx-auto px-6 relative z-10">
        <motion.header
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-full mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40 mb-4"
          >
            {t.subtitle}
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-tight mb-6 text-foreground max-w-lg"
          >
            {t.title}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base text-foreground/50 leading-relaxed font-medium w-full"
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
              value: 50,
              prefix: "<",
              suffix: "ms",
              label: t.stats?.latency,
            },
            {
              value: 100,
              suffix: "%",
              label: t.stats?.open_source,
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
                  prefix={stat.prefix}
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

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20"
        >
          <motion.div variants={fadeInUp} className="md:col-span-4">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40">
              {t.mission_title}
            </span>
          </motion.div>
          <motion.div variants={fadeInUp} className="md:col-span-8">
            <p className="text-base md:text-lg text-foreground/60 leading-relaxed font-medium">
              {t.mission_desc}
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 border-t border-border pt-16"
        >
          <motion.div variants={fadeInUp} className="md:col-span-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground leading-snug">
              {t.faq_question}
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="md:col-span-8">
            <p className="text-base md:text-lg text-foreground/60 leading-relaxed font-medium">
              {t.faq_answer}
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 border-t border-border pt-16"
        >
          <motion.div variants={fadeInUp} className="md:col-span-4">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40">
              {t.core_values_title}
            </span>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {[
              {
                title: t.values.privacy_title,
                desc: t.values.privacy_desc,
                icon: ShieldCheckIcon,
              },
              {
                title: t.values.fee_title,
                desc: t.values.fee_desc,
                icon: HandCoinsIcon,
              },
              {
                title: t.values.open_source_title,
                desc: t.values.open_source_desc,
                icon: CodeBlockIcon,
              },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="flex flex-col gap-3 p-5 rounded-xl bg-foreground/5 hover:bg-foreground/8 backdrop-blur-sm transition-colors duration-300"
              >
                <div className="size-9 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground">
                  <value.icon size={18} weight="fill" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 border-t border-border pt-16"
        >
          <div className="md:col-span-4 flex flex-col justify-center">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40 mb-4 block">
              {t.live_demo?.badge}
            </span>
            <h2 className="text-2xl md:text-3xl tracking-tighter text-foreground mb-3">
              {t.live_demo?.title}
            </h2>
            <p className="text-sm text-foreground/50 leading-relaxed font-medium">
              {t.live_demo?.desc}
            </p>
          </div>
          <div className="md:col-span-8 flex items-center justify-center py-8">
            <LiveAlertDemo t={t} />
          </div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 border-t border-border pt-16"
        >
          <motion.div variants={fadeInUp} className="md:col-span-4">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40">
              {t.team_title}
            </span>
          </motion.div>
          <motion.div variants={fadeInUp} className="md:col-span-8">
            <p className="text-base md:text-lg text-foreground/60 leading-relaxed font-medium mb-8">
              {t.team_desc}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://github.com/Ponlponl123-Labs/alertbox-org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-6 text-xs font-bold uppercase tracking-wider cursor-pointer border border-foreground/20 bg-transparent text-foreground transition-all"
                >
                  GitHub
                </Button>
              </Link>
              <Link href="/app">
                <Button className="h-11 rounded-full px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-foreground text-background hover:bg-foreground/90 transition-all">
                  {t.get_started}
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.section>

        <hr className="border-t border-border mb-16" />

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-[11px] font-medium uppercase tracking-widest text-foreground/40 mb-8"
          >
            {t.explore?.subtitle}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {[
              {
                href: "/pricing",
                icon: CurrencyDollarIcon,
                title: t.explore?.pricing?.title,
                desc: t.explore?.pricing?.desc,
              },
              {
                href: "/donate",
                icon: HandCoinsIcon,
                title: t.explore?.donate?.title,
                desc: t.explore?.donate?.desc,
              },
              {
                href: "/app",
                icon: TagIcon,
                title: t.explore?.dashboard?.title,
                desc: t.explore?.dashboard?.desc,
              },
            ].map((card, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <Link href={card.href} className="block group">
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="40 80 80"
                    borderRadius={24}
                    glowRadius={30}
                    glowIntensity={0.6}
                    backgroundColor="var(--card)"
                    colors={["#F43F5E", "#38bdf8"]}
                    className="flex flex-col gap-4 p-6 bg-card border-0 rounded-3xl shadow-lg h-full group-hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="size-10 rounded-xl mb-3 bg-foreground/10 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                      <card.icon size={20} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                        {card.title}
                        <ArrowRightIcon
                          size={12}
                          weight="bold"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </h3>
                      <p className="text-xs text-foreground/50 font-medium">
                        {card.desc}
                      </p>
                    </div>
                  </BorderGlow>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
