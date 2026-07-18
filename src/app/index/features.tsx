"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
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
import { Button } from "@/components/ui/button";

function VisualFeeCalculator({ t }: { t: any }) {
  const [volume, setVolume] = useState(1500);
  const competitorFee = Math.round(volume * 0.1);

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
            {t.demos.calculator.others}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative h-[3px] w-14 rounded-t-sm bg-foreground">
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[11px] font-semibold tabular-nums text-foreground">
              $0
            </span>
          </div>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-foreground">
            {t.demos.calculator.alertbox}
          </span>
        </div>

        <div className="flex-1 border-l border-foreground/10 pl-8">
          <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/30">
            {t.demos.calculator.volume}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
            ${volume.toLocaleString()}
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
        <span>$5,000 / mo</span>
      </div>
    </div>
  );
}

function VisualCustomization({ t }: { t: any }) {
  const [accent, setAccent] = useState<
    "foreground" | "rose" | "purple" | "cyan"
  >("foreground");
  const [animation, setAnimation] = useState<"bounce" | "slide" | "scale">(
    "bounce",
  );
  const [triggerCount, setTriggerCount] = useState(0);

  const colors = {
    foreground: {
      hex: "var(--foreground)",
      text: "text-foreground",
      bg: "bg-foreground",
      icon: "text-background",
    },
    rose: {
      hex: "#F43F5E",
      text: "text-rose-500",
      bg: "bg-rose-500",
      icon: "text-white",
    },
    purple: {
      hex: "#a855f7",
      text: "text-purple-500",
      bg: "bg-purple-500",
      icon: "text-white",
    },
    cyan: {
      hex: "#22d3ee",
      text: "text-cyan-500",
      bg: "bg-cyan-500",
      icon: "text-white",
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
    <div className="w-full">
      <div className="relative flex min-h-[160px] items-center justify-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 blur-3xl transition-colors duration-500"
          style={{
            background: `radial-gradient(circle at center, ${activeColor.hex}, transparent 70%)`,
          }}
        />
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
            className="relative z-10 w-full max-w-[230px]"
          >
            <div className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-3.5 shadow-lg shadow-foreground/5 backdrop-blur-sm">
              <div
                className={clsx(
                  "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                  activeColor.icon,
                  activeColor.bg,
                )}
              >
                ★
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-mono text-[8px] font-medium uppercase tracking-widest text-foreground/35">
                  {t.demos.customizer.tip_received}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-foreground">
                  <span className={activeColor.text}>StreamFan</span>{" "}
                  {t.demos.customizer.sent}{" "}
                  <span className={activeColor.text}>$10.00</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-5">
        <div className="flex gap-2.5">
          {(["foreground", "rose", "purple", "cyan"] as const).map((col) => (
            <Button
              key={col}
              onClick={() => setAccent(col)}
              aria-label={col}
              className={clsx(
                "size-4.5 cursor-pointer rounded-full ring-1 ring-offset-2 ring-offset-background transition-all",
                accent === col
                  ? "ring-foreground"
                  : "ring-transparent hover:ring-foreground/30",
              )}
              style={{ backgroundColor: colors[col].hex }}
            />
          ))}
        </div>
        <div className="flex gap-1">
          {(["bounce", "scale", "slide"] as const).map((type) => (
            <Button
              variant={"outline"}
              key={type}
              onClick={() => handleTrigger(type)}
              className="cursor-pointer px-2 py-1 font-mono rounded-lg text-[9px] font-medium uppercase tracking-wider text-foreground/40 hover:text-foreground"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualWebhooks({ t }: { t: any }) {
  const [status, setStatus] = useState<"idle" | "firing" | "done">("idle");
  const [lines, setLines] = useState<{ text: string; color: string }[]>([
    { text: "$ alertbox listen --port 3000", color: "text-foreground/40" },
    { text: t.demos.webhooks.listening, color: "text-foreground/25" },
  ]);

  const handleWebhookFire = () => {
    if (status !== "idle") return;
    setStatus("firing");

    setLines((prev) => [
      ...prev,
      { text: t.demos.webhooks.ingesting, color: "text-foreground/60" },
    ]);

    setTimeout(() => {
      setLines((prev) => [
        ...prev,
        {
          text: '{ "type": "payment.succeeded", "amount": 5000 }',
          color: "text-foreground/45",
        },
      ]);
    }, 700);

    setTimeout(() => {
      setLines((prev) => [
        ...prev,
        { text: t.demos.webhooks.success, color: "text-foreground" },
      ]);
      setStatus("done");
    }, 1400);

    setTimeout(() => {
      setStatus("idle");
      setLines([
        { text: "$ alertbox listen --port 3000", color: "text-foreground/40" },
        { text: t.demos.webhooks.listening, color: "text-foreground/25" },
      ]);
    }, 4500);
  };

  return (
    <div className="w-full">
      <Button
        variant={"secondary"}
        onClick={handleWebhookFire}
        disabled={status !== "idle"}
        className="mb-5 flex cursor-pointer items-center gap-2 font-mono text-[11px] font-medium text-foreground rounded-xl hover:opacity-70 disabled:opacity-30"
      >
        <LightningIcon weight="bold" size={13} />
        {status === "idle"
          ? t.demos.webhooks.simulate
          : status === "firing"
            ? t.demos.webhooks.processing
            : t.demos.webhooks.done}
        <span className="text-foreground/25">→</span>
      </Button>

      <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4 font-mono text-[10px] leading-relaxed">
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
            className="text-foreground/50"
          >
            ▌
          </motion.span>
        )}
      </div>
    </div>
  );
}

function VisualOpenSource({ t }: { t: any }) {
  const [starred, setStarred] = useState(false);
  const [stars, setStars] = useState(1324);
  const [cells, setCells] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const levels = Array.from({ length: 60 }, () => Math.random());
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
    if (val < 0.25) return "bg-foreground/6";
    if (val < 0.5) return "bg-foreground/20";
    if (val < 0.75) return "bg-foreground/45";
    return "bg-foreground/90";
  };

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-mono text-sm text-foreground">
            Ponlponl123-Labs/alertbox-org
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-foreground/40">
            {t.demos.opensource.license}
          </p>
        </div>
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={handleStar}
          className={clsx(
            "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all",
            starred
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/15 bg-transparent text-foreground/60 hover:border-foreground/30 hover:text-foreground",
          )}
        >
          <StarIcon weight={starred ? "fill" : "bold"} size={12} />
          <span className="font-mono tabular-nums hidden">
            {stars.toLocaleString()}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-20 gap-[3px]">
        {cells.map((val, idx) => (
          <div
            key={idx}
            className={clsx("aspect-square rounded-[1.5px]", getColor(val))}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-foreground/10 pt-4 font-mono text-[10px]">
        <span className="select-all text-foreground/40">
          git clone Ponlponl123-Labs/alertbox-org
        </span>
        <Button
          variant={"secondary"}
          size={"icon"}
          onClick={handleCopy}
          className="flex cursor-pointer rounded-lg items-center gap-1 text-foreground/40 transition-colors hover:text-foreground"
        >
          {copied ? (
            <span className="font-sans text-[10px] font-medium text-foreground">
              {t.demos.opensource.copied}
            </span>
          ) : (
            <CopyIcon size={13} />
          )}
        </Button>
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

  const rows = [
    {
      tag: "Live",
      title: t.items[0].title,
      desc: t.items[0].desc,
      icon: HandCoinsIcon,
      visual: <VisualFeeCalculator t={t} />,
    },
    {
      tag: "Preview",
      title: t.items[2].title,
      desc: t.items[2].desc,
      icon: PaintBrushIcon,
      visual: <VisualCustomization t={t} />,
    },
    {
      tag: "Realtime",
      title: t.items[3].title,
      desc: t.items[3].desc,
      icon: LightningIcon,
      visual: <VisualWebhooks t={t} />,
    },
    {
      tag: "Public",
      title: t.items[4].title,
      desc: t.items[4].desc,
      icon: CodeBlockIcon,
      visual: <VisualOpenSource t={t} />,
    },
  ];

  return (
    <section ref={ref} className="relative w-full py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-362 px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col justify-between gap-8 lg:mb-4 lg:flex-row lg:items-end"
        >
          <div>
            <span className="mb-3 block font-mono text-[11px] font-medium uppercase tracking-tight text-foreground/40">
              {t.subtitle}
            </span>
            <h2 className="max-w-2xl text-5xl tracking-tighter text-foreground md:text-6xl lg:text-7xl">
              {t.title}
            </h2>
          </div>
          <p className="max-w-md text-sm font-medium leading-relaxed text-foreground/50 lg:text-right">
            {t.description}
          </p>
        </motion.div>

        <div>
          {rows.map((row, i) => {
            const Icon = row.icon;
            const reversed = i % 2 === 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.08 * i,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative grid grid-cols-1 gap-x-12 gap-y-8 py-14 min-h-128 md:py-20 lg:grid-cols-12"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-2 select-none font-mono text-[110px] font-bold leading-none text-foreground/[0.025] md:text-[150px]"
                  style={reversed ? { right: 0 } : { left: 0 }}
                >
                  0{i + 1}
                </span>

                <div
                  className={clsx(
                    "relative flex flex-col justify-center lg:col-span-4",
                    reversed ? "lg:order-2" : "lg:order-1",
                  )}
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
                      <Icon
                        size={14}
                        weight="bold"
                        className="text-background"
                      />
                    </div>
                    <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-foreground/35">
                      {row.tag}
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">
                    {row.title}
                  </h3>
                  <p className="max-w-xs text-sm leading-relaxed text-foreground/50">
                    {row.desc}
                  </p>
                </div>

                <div
                  className={clsx(
                    "relative flex items-center lg:col-span-8",
                    reversed ? "lg:order-1" : "lg:order-2",
                  )}
                >
                  {row.visual}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
