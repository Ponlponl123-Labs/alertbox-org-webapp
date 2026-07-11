"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import {
  CodeBlockIcon,
  ConfettiIcon,
  HandCoinsIcon,
  PaintBrushIcon,
  UserRectangleIcon,
  WebhooksLogoIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useStore } from "zustand";
import { PAYMENT_METHODS } from "./constants";
import { AnimatePresence, motion } from "motion/react";

function Step1Visual() {
  return (
    <div className="w-full max-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
        Payment Settings
      </h4>
      <div className="flex flex-col gap-2.5">
        {PAYMENT_METHODS.slice(0, 3).map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50"
          >
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-center p-1">
                <method.icon className="size-full animate-pulse" />
              </div>
              <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                {method.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase">
                Connected
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2Visual() {
  return (
    <div className="w-full max-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
        Create Profile
      </h4>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
            Your Link
          </label>
          <div className="h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center px-2.5 mt-1 text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
            tip-to.me/@<span className="text-primary font-bold">yourname</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
              Display Name
            </label>
            <div className="h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center px-2.5 mt-1 text-[9px] text-zinc-700 dark:text-zinc-300">
              Your Stream Name
            </div>
          </div>
          <div>
            <label className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
              Accent Theme
            </label>
            <div className="h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between px-2 mt-1">
              <div className="flex gap-1">
                <span className="size-3.5 rounded-full bg-rose-500 border border-white" />
                <span className="size-3.5 rounded-full bg-pink-500" />
                <span className="size-3.5 rounded-full bg-indigo-500" />
              </div>
              <span className="text-[8px] text-zinc-400">Rose</span>
            </div>
          </div>
        </div>
        <button className="w-full bg-black dark:bg-white text-white dark:text-black font-bold text-[9px] h-8 rounded-lg mt-1 transition-all shadow-sm">
          Save Settings
        </button>
      </div>
    </div>
  );
}

function Step3Visual() {
  return (
    <div className="w-full max-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>Webhook Settings</span>
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[7px] font-extrabold uppercase animate-pulse">
          Active
        </span>
      </h4>
      <div className="flex flex-col gap-2.5">
        <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 leading-normal font-read">
          Paste this webhook URL into your provider developer dashboard to
          listen to events.
        </p>
        <div className="flex gap-1">
          <div className="flex-1 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center px-2 text-[8px] text-zinc-400 dark:text-zinc-500 font-mono truncate select-none">
            https://api.alertbox.org/v1/webhooks/wh_9x28...
          </div>
          <button className="px-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-700 dark:text-zinc-300">
            Copy
          </button>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[8.5px] text-zinc-400 dark:text-zinc-500 font-semibold border-t border-zinc-100 dark:border-zinc-900/60 pt-2.5">
          <div className="size-1.5 rounded-full bg-emerald-500" />
          <span>Last success: 2 minutes ago (Stripe gateway)</span>
        </div>
      </div>
    </div>
  );
}

function Step4Visual({ lang }: { lang: any }) {
  return (
    <div className="w-full max-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg text-left flex flex-col gap-3">
      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Alert Customizer
      </h4>
      <div className="grid grid-cols-2 gap-2 text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
        <div>
          <span>Alert Template</span>
          <div className="h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center px-2 mt-1 font-mono text-[8px] text-zinc-700 dark:text-zinc-300">
            {"{name} tipped {amount}"}
          </div>
        </div>
        <div>
          <span>Alert Animation</span>
          <div className="h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between px-2 mt-1 text-[8px] text-zinc-700 dark:text-zinc-300">
            <span>Bounce Up</span>
            <span className="text-zinc-400">▼</span>
          </div>
        </div>
      </div>

      <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-200 dark:bg-zinc-900 flex justify-center items-center h-16 mt-1">
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 shadow-[0_0_20px_var(--primary-glow)] flex flex-col gap-1 text-center scale-90">
          <h1 className="whitespace-nowrap text-[9px] text-foreground/95 leading-none">
            <strong className="text-primary font-bold">Ponlponl123</strong>{" "}
            {lang.data.pages.index.sections.howitworks.donated}{" "}
            <strong className="text-primary font-bold font-baijamjuree">
              50.00 THB
            </strong>
          </h1>
          <p className="text-[7.5px] text-zinc-400 font-normal leading-none select-none">
            {lang.data.pages.index.sections.howitworks.test_message}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step5Visual() {
  return (
    <div className="w-full max-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
        Browser Source URL
      </h4>
      <div className="flex flex-col gap-3">
        <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 leading-normal font-read">
          Add this private URL as a Browser Source in OBS Studio or Streamlabs
          OBS.
        </p>
        <div className="flex gap-1">
          <div className="flex-1 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center px-2 text-[8px] text-zinc-400 dark:text-zinc-500 font-mono truncate select-none">
            https://overlay.alertbox.org/widget/ov_a39...
          </div>
          <button className="px-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-700 dark:text-zinc-300">
            Copy
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-200 dark:bg-zinc-900 mt-1">
          <div className="bg-zinc-300 dark:bg-zinc-800 px-2 py-1 flex items-center gap-1.5 border-b border-foreground/10">
            <span className="size-1.5 rounded-full bg-zinc-600" />
            <span className="text-[7.5px] text-zinc-400 font-bold font-mono uppercase">
              OBS Studio (64-bit)
            </span>
          </div>
          <div className="p-2 flex items-center gap-2">
            <div className="w-[65px] bg-zinc-200 dark:bg-zinc-900 rounded border border-zinc-800 p-1 flex flex-col gap-0.5 text-[5.5px]">
              <span className="text-zinc-500 font-bold uppercase text-[4.5px] mb-0.5">
                Sources
              </span>
              <span className="bg-zinc-800 text-white rounded px-1 py-0.5 truncate">
                Alertbox Link
              </span>
              <span className="text-zinc-500 px-1 py-0.5 truncate">
                Gameplay
              </span>
              <span className="text-zinc-500 px-1 py-0.5 truncate">Webcam</span>
            </div>
            <div className="flex-1 aspect-video rounded border border-zinc-800 bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden">
              <span className="text-[5px] font-bold text-zinc-800 uppercase font-mono z-0">
                Main Canvas
              </span>
              <div className="absolute top-1.5 px-1.5 py-0.75 rounded bg-black border border-primary/30 scale-75 shadow z-10">
                <span className="text-[5.5px] text-white whitespace-nowrap leading-none block">
                  Ponlponl123 donated 50.00 THB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step6Visual() {
  return (
    <div className="w-full max-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
        <span>Channel Activity</span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-500 text-[7px] font-extrabold uppercase">
            Live
          </span>
        </span>
      </h4>
      <div className="flex flex-col gap-2">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[7px] text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/40 pb-1">
            <span>Recent Alert Activity</span>
            <span>100% Direct</span>
          </div>

          <div className="flex items-center justify-between text-[7.5px]">
            <div className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-zinc-400" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                anonymous
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-600">
              +100.00 THB
            </span>
          </div>
          <div className="flex items-center justify-between text-[7.5px]">
            <div className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-zinc-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Ponlponl123
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-600">
              +50.00 THB
            </span>
          </div>
        </div>

        <div className="mt-0.5 flex items-center justify-between text-[8px] bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-emerald-600 dark:text-emerald-400">
          <span>🎉 Net direct revenue:</span>
          <strong className="font-bold font-baijamjuree">150.00 THB</strong>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorkStreamer() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: HandCoinsIcon,
      title: lang.data.pages.index.sections.howitworks.steps[0].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[0].description,
      visual: <Step1Visual />,
    },
    {
      icon: UserRectangleIcon,
      title: lang.data.pages.index.sections.howitworks.steps[1].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[1].description,
      visual: <Step2Visual />,
      action: (
        <Link href={"/app"} className="w-max mt-3 block">
          <Button
            variant="default"
            className="rounded-xl px-4 py-1.5 h-8 text-xs font-semibold"
          >
            {lang.data.header.actions.get_started}
          </Button>
        </Link>
      ),
    },
    {
      icon: WebhooksLogoIcon,
      title: lang.data.pages.index.sections.howitworks.steps[2].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[2].description,
      visual: <Step3Visual />,
      action: (
        <Link href={"/app/connect"} className="w-max mt-3 block">
          <Button
            variant="default"
            className="rounded-xl px-4 py-1.5 h-8 text-xs font-semibold"
          >
            {lang.data.common.connect}
          </Button>
        </Link>
      ),
    },
    {
      icon: PaintBrushIcon,
      title: lang.data.pages.index.sections.howitworks.steps[3].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[3].description,
      visual: <Step4Visual lang={lang} />,
      action: (
        <Link href={"/app/customize"} className="w-max mt-3 block">
          <Button
            variant="default"
            className="rounded-xl px-4 py-1.5 h-8 text-xs font-semibold"
          >
            {lang.data.common.customize}
          </Button>
        </Link>
      ),
    },
    {
      icon: CodeBlockIcon,
      title: lang.data.pages.index.sections.howitworks.steps[4].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[4].description,
      visual: <Step5Visual />,
      action: (
        <Link href={"/app/customize"} className="w-max mt-3 block">
          <Button
            variant="default"
            className="rounded-xl px-4 py-1.5 h-8 text-xs font-semibold"
          >
            {lang.data.common.overlay_url}
          </Button>
        </Link>
      ),
    },
    {
      icon: ConfettiIcon,
      title: lang.data.pages.index.sections.howitworks.steps[5].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[5].description,
      visual: <Step6Visual />,
      action: (
        <Link href={"/app"} className="w-max mt-3 block">
          <Button
            variant="default"
            className="rounded-xl px-4 py-1.5 h-8 text-xs font-semibold"
          >
            {lang.data.common.go_live}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-900/80 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-xl">
      <div className="flex-grow flex flex-col justify-between md:max-w-[45%] h-auto">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Setup Guide
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              >
                <ArrowLeftIcon size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={activeStep === steps.length - 1}
                onClick={() =>
                  setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))
                }
              >
                <ArrowRightIcon size={14} />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`text-left px-3.5 py-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm"
                      : "bg-transparent border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black font-extrabold"
                        : "bg-zinc-200/50 dark:bg-zinc-900 text-zinc-600"
                    }`}
                  >
                    <Icon size={15} weight={isActive ? "fill" : "regular"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold tracking-tight leading-snug">
                      {step.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-900/40 min-h-[140px] flex flex-col justify-between shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex-grow flex flex-col justify-between"
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed font-read">
                {steps[activeStep].description}
              </p>
              {steps[activeStep].action && (
                <div className="mt-2">{steps[activeStep].action}</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 min-w-0 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-900/40 flex items-center justify-center h-[340px] md:self-stretch relative overflow-hidden shadow-inner p-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center"
          >
            {steps[activeStep].visual}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
