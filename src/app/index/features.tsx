"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  HandCoinsIcon,
  PaintBrushIcon,
  LightningIcon,
  CodeBlockIcon,
  CopyIcon,
  StarIcon,
} from "@phosphor-icons/react";

function DemoFeeCalculator({ t }: { t: any }) {
  const [volume, setVolume] = useState(1500);
  const competitorFee = Math.round(volume * 0.1);

  return (
    <div className="flex flex-col h-full justify-between bg-foreground/1 p-5 md:p-6 border border-foreground/5 rounded-2xl">
      <div className="flex items-end justify-center gap-8 md:gap-12 flex-1 py-6 px-4">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="w-16 rounded-t-lg bg-foreground/10 relative overflow-hidden"
            animate={{ height: Math.max(20, (competitorFee / 500) * 140) }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="absolute inset-0 bg-linear-to-b from-foreground/5 to-transparent" />
            <motion.span
              key={competitorFee}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-7 left-1/2 -translate-x-1/2 text-foreground/45 font-mono text-[10px] font-bold whitespace-nowrap"
            >
              -${competitorFee}
            </motion.span>
          </motion.div>
          <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest font-mono">
            {t.demos.calculator.others}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="w-16 h-2 rounded-t-lg relative"
            style={{
              background: "linear-gradient(to top, #F43F5E, #ec4899)",
              boxShadow: "0 0 20px rgba(244,63,94,0.3)",
            }}
          >
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-rose-500 font-mono text-[10px] font-black">
              $0
            </span>
          </motion.div>
          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-mono">
            {t.demos.calculator.alertbox}
          </span>
        </div>
      </div>

      <div className="bg-background border border-foreground/5 p-4 rounded-xl mt-4">
        <div className="flex justify-between items-center text-xs font-semibold text-foreground/50 mb-3">
          <span>{t.demos.calculator.volume}</span>
          <span className="font-mono text-foreground font-bold">
            ${volume.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-rose-500 h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[8px] text-foreground/25 font-mono mt-1.5">
          <span>$100</span>
          <span>$5,000</span>
        </div>
      </div>
    </div>
  );
}

function DemoCustomization({ t }: { t: any }) {
  const [accent, setAccent] = useState<"rose" | "purple" | "cyan">("rose");
  const [animation, setAnimation] = useState<"bounce" | "slide" | "scale">(
    "bounce",
  );
  const [triggerCount, setTriggerCount] = useState(0);

  const colors = {
    rose: {
      hex: "#F43F5E",
      text: "text-rose-500",
      bg: "bg-rose-500",
      glow: "shadow-rose-500/20",
    },
    purple: {
      hex: "#a855f7",
      text: "text-purple-500",
      bg: "bg-purple-500",
      glow: "shadow-purple-500/20",
    },
    cyan: {
      hex: "#22d3ee",
      text: "text-cyan-500",
      bg: "bg-cyan-500",
      glow: "shadow-cyan-500/20",
    },
  };

  const animEffects = {
    bounce: { y: [0, -12, 0, -5, 0], scale: [0.95, 1.05, 1, 1.02, 1] },
    slide: { x: [-40, 5, 0], opacity: [0, 1] },
    scale: { scale: [0.8, 1.05, 1], opacity: [0, 1] },
  };

  const activeColor = colors[accent];

  const handleTrigger = (animType: "bounce" | "slide" | "scale") => {
    setAnimation(animType);
    setTriggerCount((c) => c + 1);
  };

  return (
    <div className="flex flex-col h-full bg-foreground/1 p-5 md:p-6 justify-between border border-foreground/5 rounded-2xl">
      <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-[140px] border border-foreground/5 rounded-xl bg-background/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${animation}-${triggerCount}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, ...animEffects[animation] }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 22,
              x: { type: "tween", duration: 0.5, ease: "easeOut" },
              y: { type: "tween", duration: 0.5, ease: "easeOut" },
              scale: { type: "tween", duration: 0.5, ease: "easeOut" },
            }}
            className="relative z-10 w-full max-w-[220px]"
          >
            <div className="p-3.5 rounded-xl border border-foreground/10 bg-background flex items-center gap-3 shadow-lg">
              <div
                className={`size-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 shadow-lg ${activeColor.bg} ${activeColor.glow}`}
              >
                ★
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest font-mono">
                  {t.demos.customizer.tip_received}
                </p>
                <p className="text-[10px] font-black text-foreground mt-0.5 truncate">
                  <span className={activeColor.text}>StreamFan</span>{" "}
                  {t.demos.customizer.sent}{" "}
                  <span className={activeColor.text}>$10.00</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-foreground/5 pt-4 mt-4">
        <div className="flex gap-2">
          {(["rose", "purple", "cyan"] as const).map((col) => (
            <button
              key={col}
              onClick={() => setAccent(col)}
              className={`size-4.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${accent === col
                ? "border-foreground scale-110"
                : "border-transparent hover:scale-105"
                }`}
              style={{ backgroundColor: colors[col].hex }}
            />
          ))}
        </div>

        <div className="flex gap-1">
          {(["bounce", "scale", "slide"] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTrigger(type)}
              className="text-[8px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-foreground/10 bg-background hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-all cursor-pointer"
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoWebhooks({ t }: { t: any }) {
  const [status, setStatus] = useState<"idle" | "firing" | "done">("idle");
  const [lines, setLines] = useState<{ text: string; color: string }[]>([
    { text: "$ alertbox listen --port 3000", color: "text-foreground/45" },
    { text: t.demos.webhooks.listening, color: "text-foreground/30" },
  ]);

  const handleWebhookFire = () => {
    if (status !== "idle") return;
    setStatus("firing");

    setLines((prev) => [
      ...prev,
      { text: t.demos.webhooks.ingesting, color: "text-yellow-500" },
    ]);

    setTimeout(() => {
      setLines((prev) => [
        ...prev,
        {
          text: '{ "type": "payment.succeeded", "amount": 5000 }',
          color: "text-cyan-500 dark:text-cyan-400",
        },
      ]);
    }, 700);

    setTimeout(() => {
      setLines((prev) => [
        ...prev,
        { text: t.demos.webhooks.success, color: "text-emerald-500" },
      ]);
      setStatus("done");
    }, 1400);

    setTimeout(() => {
      setStatus("idle");
      setLines([
        { text: "$ alertbox listen --port 3000", color: "text-foreground/45" },
        { text: t.demos.webhooks.listening, color: "text-foreground/30" },
      ]);
    }, 4500);
  };

  return (
    <div className="flex flex-col h-full bg-foreground/1 p-5 md:p-6 justify-between border border-foreground/5 rounded-2xl">
      <div className="border border-foreground/10 bg-background/50 rounded-xl p-4 font-mono text-[9px] flex-1 flex flex-col justify-between min-h-[140px] text-left">
        <div className="flex gap-1 mb-2 border-b border-foreground/5 pb-2">
          <span className="size-1.5 rounded-full bg-foreground/20" />
          <span className="size-1.5 rounded-full bg-foreground/20" />
          <span className="size-1.5 rounded-full bg-foreground/20" />
        </div>
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          {lines.map((line, idx) => (
            <motion.p
              key={`${idx}-${line.text}`}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className={line.color}
            >
              {line.text}
            </motion.p>
          ))}
          {status === "firing" && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-yellow-500"
            >
              ▌
            </motion.span>
          )}
        </div>
      </div>

      <div className="border-t border-foreground/5 pt-4 mt-4">
        <button
          onClick={handleWebhookFire}
          disabled={status !== "idle"}
          className="w-full h-9 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
        >
          <LightningIcon weight="fill" size={14} />
          {status === "idle"
            ? t.demos.webhooks.simulate
            : status === "firing"
              ? t.demos.webhooks.processing
              : t.demos.webhooks.done}
        </button>
      </div>
    </div>
  );
}

function DemoOpenSource({ t }: { t: any }) {
  const [starred, setStarred] = useState(false);
  const [stars, setStars] = useState(1324);
  const [cells, setCells] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const levels = Array.from({ length: 36 }, () => Math.random());
    setCells(levels);
  }, []);

  const handleStar = () => {
    setStarred(!starred);
    setStars((s) => (starred ? s - 1 : s + 1));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      "git clone https://github.com/Ponlponl123-Labs/alertbox-org.git",
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getColor = (val: number) => {
    if (val < 0.25) return "bg-foreground/2 border border-foreground/5";
    if (val < 0.5) return "bg-rose-500/10";
    if (val < 0.75) return "bg-rose-500/25";
    return "bg-rose-500/50";
  };

  return (
    <div className="flex flex-col h-full bg-foreground/1 p-5 md:p-6 justify-between border border-foreground/5 rounded-2xl">
      <div>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-foreground/5">
          <div className="flex items-center gap-2">
            <CodeBlockIcon size={18} className="text-rose-500" />
            <div className="text-left">
              <p className="text-xs font-bold text-foreground font-mono">
                Ponlponl123-Labs/alertbox-org
              </p>
              <p className="text-[9px] text-foreground/30 font-mono">
                {t.demos.opensource.license}
              </p>
            </div>
          </div>
          <button
            onClick={handleStar}
            className={`p-2.5 rounded-full border flex items-center gap-1.5 text-[9px] font-bold transition-all cursor-pointer ${starred
              ? "bg-rose-500/15 border-rose-500/30 text-rose-500"
              : "border-foreground/10 hover:border-foreground/20 text-foreground/60 hover:text-foreground"
              }`}
          >
            <StarIcon weight={starred ? "fill" : "bold"} size={11} />
            <span className="hidden">{stars.toLocaleString()}</span>
          </button>
        </div>

        <div className="mb-4 text-left">
          <p className="text-[9px] font-bold text-foreground/35 uppercase tracking-widest mb-2 font-mono">
            {t.demos.opensource.contributions}
          </p>
          <div className="grid grid-cols-12 gap-1 bg-background p-2.5 rounded-xl border border-foreground/5">
            {cells.map((val, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-[3px] ${getColor(val)}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border border-foreground/10 bg-background/50 px-3.5 h-9 rounded-xl text-[9px] font-mono">
        <span className="text-foreground/45 select-all">
          git clone Ponlponl123-Labs/alertbox-org
        </span>
        <button
          onClick={handleCopy}
          className="text-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer"
        >
          {copied ? (
            <span className="text-emerald-500 font-bold text-[8px]">
              {t.demos.opensource.copied}
            </span>
          ) : (
            <CopyIcon size={12} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function Features() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.features;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (!t) return null;

  const featureConfigs = [
    {
      title: t.items[0].title,
      desc: t.items[0].desc,
      icon: HandCoinsIcon,
      accent: "text-rose-500",
      accentBg: "bg-rose-500/10",
      accentBorder: "border-rose-500/20",
      colSpan: "lg:col-span-7",
      demo: <DemoFeeCalculator t={t} />,
    },
    {
      title: t.items[2].title,
      desc: t.items[2].desc,
      icon: PaintBrushIcon,
      accent: "text-purple-500",
      accentBg: "bg-purple-500/10",
      accentBorder: "border-purple-500/20",
      colSpan: "lg:col-span-5",
      demo: <DemoCustomization t={t} />,
    },
    {
      title: t.items[3].title,
      desc: t.items[3].desc,
      icon: LightningIcon,
      accent: "text-cyan-500",
      accentBg: "bg-cyan-500/10",
      accentBorder: "border-cyan-500/20",
      colSpan: "lg:col-span-5",
      demo: <DemoWebhooks t={t} />,
    },
    {
      title: t.items[4].title,
      desc: t.items[4].desc,
      icon: CodeBlockIcon,
      accent: "text-rose-500",
      accentBg: "bg-rose-500/10",
      accentBorder: "border-rose-500/20",
      colSpan: "lg:col-span-7",
      demo: <DemoOpenSource t={t} />,
    },
  ];

  return (
    <section
      ref={ref}
      className="w-full py-24 md:py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-left mb-16"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500 mb-2 block font-mono">
            {t.subtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-sm md:text-base text-foreground/50 max-w-2xl font-medium">
            {t.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {featureConfigs.map((config, i) => {
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.1 * i,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`flex flex-col justify-between p-6 rounded-3xl border border-foreground/10 bg-foreground/2 hover:border-foreground/20 transition-all duration-300 backdrop-blur-xl group relative overflow-hidden ${config.colSpan}`}
              >
                <div className="mb-6 flex-1">{config.demo}</div>

                <div className="flex items-start gap-4">
                  <div
                    className={`size-10 rounded-2xl flex items-center justify-center shrink-0 border ${config.accentBg} ${config.accentBorder}`}
                  >
                    <Icon size={18} weight="fill" className={config.accent} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-foreground group-hover:text-rose-500 transition-colors">
                      {config.title}
                    </h3>
                    <p className="text-xs text-foreground/50 leading-relaxed font-medium mt-1">
                      {config.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
