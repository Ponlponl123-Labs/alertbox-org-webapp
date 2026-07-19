"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
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
import { PAYMENT_METHODS } from "@/consts/payment";
import { AnimatePresence, motion } from "motion/react";

const STEP_DURATION = 5000;

function Step1Visual({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] border border-border bg-background rounded-2xl p-4 shadow-lg text-left group/preview">
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
        {m.payment_settings}
      </h4>
      <div className="flex flex-col gap-2.5">
        {PAYMENT_METHODS.slice(0, 3).map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-2 rounded-xl bg-foreground/2 border border-border/50"
          >
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-card border border-border/40 flex items-center justify-center p-1">
                <method.icon className="size-full animate-pulse not-group-hover/preview:grayscale" />
              </div>
              <span className="text-[10px] font-semibold text-foreground/90">
                {method.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-foreground group-hover/preview:bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-foreground group-hover/preview:text-emerald-600 dark:group-hover/preview:text-emerald-400 uppercase">
                {m.connected}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2Visual({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] bg-card border border-border rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
        {m.create_profile}
      </h4>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[8px] font-bold text-muted-foreground uppercase">
            {m.your_link}
          </label>
          <div className="h-8 rounded-lg bg-foreground/2 border border-border/50 flex items-center px-2.5 mt-1 text-[9px] text-muted-foreground font-mono">
            tip-to.me/@<span className="text-primary font-bold">yourname</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] font-bold text-muted-foreground uppercase">
              {m.display_name}
            </label>
            <div className="h-8 rounded-lg bg-foreground/2 border border-border/50 flex items-center px-2.5 mt-1 text-[9px] text-foreground/80">
              Your Stream Name
            </div>
          </div>
          <div>
            <label className="text-[8px] font-bold text-muted-foreground uppercase">
              {m.accent_theme}
            </label>
            <div className="h-8 rounded-lg bg-foreground/2 border border-border/50 flex items-center justify-between px-2 mt-1">
              <div className="flex gap-1">
                <span className="size-3.5 rounded-full bg-rose-500 border border-background" />
                <span className="size-3.5 rounded-full bg-pink-500" />
                <span className="size-3.5 rounded-full bg-indigo-500" />
              </div>
              <span className="text-[8px] text-muted-foreground">Rose</span>
            </div>
          </div>
        </div>
        <button className="w-full bg-foreground text-background font-bold text-[9px] h-8 rounded-lg mt-1 transition-all shadow-sm">
          {m.save_settings}
        </button>
      </div>
    </div>
  );
}

function Step3Visual({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] bg-card border border-border rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>{m.webhook_settings}</span>
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[7px] font-extrabold uppercase animate-pulse">
          {m.active}
        </span>
      </h4>
      <div className="flex flex-col gap-2.5">
        <p className="text-[8.5px] text-muted-foreground/85 leading-normal font-read">
          {m.webhook_instruction}
        </p>
        <div className="flex gap-1">
          <div className="flex-1 h-8 rounded-lg bg-foreground/2 border border-border/50 flex items-center px-2 text-[8px] text-muted-foreground font-mono truncate select-none">
            https://api.alertbox.org/v1/webhooks/wh_9x28...
          </div>
          <button className="px-3 bg-foreground/5 border border-border rounded-lg text-[9px] font-bold text-foreground/80">
            {m.copy}
          </button>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[8.5px] text-muted-foreground font-semibold border-t border-border pt-2.5">
          <div className="size-1.5 rounded-full bg-emerald-500" />
          <span>{m.last_success}</span>
        </div>
      </div>
    </div>
  );
}

function Step4Visual({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] bg-card border border-border rounded-2xl p-4 shadow-lg text-left flex flex-col gap-3">
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {m.alert_customizer}
      </h4>
      <div className="grid grid-cols-2 gap-2 text-[8px] font-bold text-muted-foreground uppercase">
        <div>
          <span>{m.alert_template}</span>
          <div className="h-7 rounded-lg bg-foreground/2 border border-border/50 flex items-center px-2 mt-1 font-mono text-[8px] text-foreground/80">
            {"{name} tipped {amount}"}
          </div>
        </div>
        <div>
          <span>{m.alert_animation}</span>
          <div className="h-7 rounded-lg bg-foreground/2 border border-border/50 flex items-center justify-between px-2 mt-1 text-[8px] text-foreground/80">
            <span>{m.bounce_up}</span>
            <span className="text-muted-foreground">▼</span>
          </div>
        </div>
      </div>

      <div className="border border-dashed border-border rounded-xl p-3 bg-foreground/2 flex justify-center items-center h-16 mt-1">
        <div className="p-2.5 rounded-xl bg-card border border-border/40 shadow-[0_0_20px_var(--primary-glow)] flex flex-col gap-1 text-center scale-90">
          <h1 className="whitespace-nowrap text-[9px] text-foreground/95 leading-none">
            <strong className="text-primary font-bold">Ponlponl123</strong>{" "}
            {lang.data.pages.index.sections.howitworks.donated}{" "}
            <strong className="text-primary font-bold font-baijamjuree">
              50.00 THB
            </strong>
          </h1>
          <p className="text-[7.5px] text-muted-foreground font-normal leading-none select-none">
            {lang.data.pages.index.sections.howitworks.test_message}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step5Visual({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] bg-card border border-border rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
        {m.browser_source_url}
      </h4>
      <div className="flex flex-col gap-3">
        <p className="text-[8.5px] text-muted-foreground/85 leading-normal font-read">
          {m.browser_source_instruction}
        </p>
        <div className="flex gap-1">
          <div className="flex-1 h-8 rounded-lg bg-foreground/2 border border-border/50 flex items-center px-2 text-[8px] text-muted-foreground font-mono truncate select-none">
            https://overlay.alertbox.org/widget/ov_a39...
          </div>
          <button className="px-3 bg-foreground/5 border border-border rounded-lg text-[9px] font-bold text-foreground/80">
            {m.copy}
          </button>
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-foreground/2 mt-1">
          <div className="bg-foreground/10 px-2 py-1 flex items-center gap-1.5 border-b border-border">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            <span className="text-[7.5px] text-muted-foreground font-bold font-mono uppercase">
              OBS Studio (64-bit)
            </span>
          </div>
          <div className="p-2 flex items-center gap-2">
            <div className="w-[65px] bg-background rounded border border-border p-1 flex flex-col gap-0.5 text-[5.5px]">
              <span className="text-muted-foreground font-bold uppercase text-[4.5px] mb-0.5">
                {m.sources}
              </span>
              <span className="bg-foreground text-background rounded px-1 py-0.5 truncate">
                {m.alertbox_link}
              </span>
              <span className="text-muted-foreground/85 px-1 py-0.5 truncate">
                {m.gameplay}
              </span>
              <span className="text-muted-foreground/85 px-1 py-0.5 truncate">
                {m.webcam}
              </span>
            </div>
            <div className="flex-1 aspect-video rounded border border-border bg-background flex items-center justify-center relative overflow-hidden">
              <span className="text-[5px] font-bold text-foreground/80 uppercase font-mono z-0">
                {m.main_canvas}
              </span>
              <div className="absolute top-1.5 px-1.5 py-0.75 rounded bg-background border border-primary/35 scale-75 shadow z-10">
                <span className="text-[5.5px] text-foreground whitespace-nowrap leading-none block font-semibold">
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

function Step6Visual({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] bg-card border border-border rounded-2xl p-4 shadow-lg text-left">
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center justify-between">
        <span>{m.channel_activity}</span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-500 text-[7px] font-extrabold uppercase font-mono">
            {m.live}
          </span>
        </span>
      </h4>
      <div className="flex flex-col gap-2">
        <div className="rounded-xl bg-foreground/2 border border-border/50 p-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[7px] text-muted-foreground border-b border-border pb-1">
            <span>{m.recent_activity}</span>
            <span>{m.direct_100}</span>
          </div>

          <div className="flex items-center justify-between text-[7.5px]">
            <div className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-muted-foreground" />
              <span className="font-semibold text-foreground/90">
                {m.anonymous}
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +100.00 THB
            </span>
          </div>
          <div className="flex items-center justify-between text-[7.5px]">
            <div className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-muted-foreground" />
              <span className="font-semibold text-foreground/90">
                Ponlponl123
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +50.00 THB
            </span>
          </div>
        </div>

        <div className="mt-0.5 flex items-center justify-between text-[8px] bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-emerald-600 dark:text-emerald-400">
          <span>{m.net_revenue}</span>
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
      visual: <Step1Visual lang={lang} />,
    },
    {
      icon: UserRectangleIcon,
      title: lang.data.pages.index.sections.howitworks.steps[1].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[1].description,
      visual: <Step2Visual lang={lang} />,
      action: (
        <Link
          href={"/app"}
          className="w-max mt-3 block text-muted-foreground font-semibold"
        >
          {lang.data.header.actions.get_started}
          <ArrowRightIcon className="inline ml-1.5 -mt-0.5" />
        </Link>
      ),
    },
    {
      icon: WebhooksLogoIcon,
      title: lang.data.pages.index.sections.howitworks.steps[2].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[2].description,
      visual: <Step3Visual lang={lang} />,
      action: (
        <Link
          href={"/app/connect"}
          className="w-max mt-3 block text-muted-foreground font-semibold"
        >
          {lang.data.common.connect}
          <ArrowRightIcon className="inline ml-1.5 -mt-0.5" />
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
        <Link
          href={"/app/customize"}
          className="w-max mt-3 block text-muted-foreground font-semibold"
        >
          {lang.data.common.customize}
          <ArrowRightIcon className="inline ml-1.5 -mt-0.5" />
        </Link>
      ),
    },
    {
      icon: CodeBlockIcon,
      title: lang.data.pages.index.sections.howitworks.steps[4].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[4].description,
      visual: <Step5Visual lang={lang} />,
      action: (
        <Link
          href={"/app/customize"}
          className="w-max mt-3 block text-muted-foreground font-semibold"
        >
          {lang.data.common.overlay_url}
          <ArrowRightIcon className="inline ml-1.5 -mt-0.5" />
        </Link>
      ),
    },
    {
      icon: ConfettiIcon,
      title: lang.data.pages.index.sections.howitworks.steps[5].title,
      description:
        lang.data.pages.index.sections.howitworks.steps[5].description,
      visual: <Step6Visual lang={lang} />,
      action: (
        <Link
          href={"/app"}
          className="w-max mt-3 block text-muted-foreground font-semibold"
        >
          {lang.data.common.go_live}
          <ArrowRightIcon className="inline ml-1.5 -mt-0.5" />
        </Link>
      ),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, STEP_DURATION);

    return () => clearInterval(timer);
  }, [steps.length, activeStep]);

  return (
    <div className="w-full mx-auto flex flex-col md:flex-row gap-8">
      <div className="flex-1 min-w-0 flex flex-col justify-between h-auto">
        <div className="mt-16 mb-12 min-h-[140px] flex flex-col justify-between shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grow flex flex-col justify-between text-left"
            >
              <p className="text-2xl text-foreground font-medium leading-relaxed font-heading max-w-sm">
                {steps[activeStep].description}
              </p>
              {steps[activeStep].action && (
                <div className="mt-2">{steps[activeStep].action}</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div>
          <div className="flex flex-col gap-1.5">
            <strong className="font-mono text-foreground/40 text-sm font-normal">
              {lang.data.pages.index.sections.howitworks.steps_title}
            </strong>
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={clsx(
                    "text-left relative transition-all cursor-pointer flex items-center gap-3",
                    isActive
                      ? "text-foreground"
                      : "text-foreground/40 hover:text-foreground/70",
                  )}
                >
                  <div className="flex-1 flex gap-2 min-w-0 items-center">
                    <h3 className="text-sm font-bold font-mono tracking-wide leading-snug uppercase">
                      {step.title}
                    </h3>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.15,
                        }}
                        className="flex-1 bg-muted relative h-0.5 rounded-2xl ml-auto"
                      >
                        <motion.div
                          key={`progress-${activeStep}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: STEP_DURATION / 1000,
                            ease: "linear",
                          }}
                          className="absolute bottom-0 left-0 h-full bg-primary"
                        />
                      </motion.div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-2 min-w-0 bg-foreground/2 rounded-2xl border border-border flex items-center justify-center min-h-[52vh] md:self-stretch relative overflow-hidden shadow-inner p-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

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
