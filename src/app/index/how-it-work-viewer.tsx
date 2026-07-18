"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { coreStore } from "@/hooks/store/core";
import {
  CalendarHeartIcon,
  ChalkboardTeacherIcon,
  HandCoinsIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";
import { useStore } from "zustand";
import { AnimatePresence, motion } from "motion/react";

function Step1VisualViewer({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-border bg-card overflow-hidden shadow-xl font-sans text-left transition-all duration-300">
      <div className="bg-foreground/5 px-3 py-1.5 flex items-center gap-1 border-b border-border">
        <div className="flex gap-1 shrink-0">
          <span className="size-1.5 rounded-full bg-red-500" />
          <span className="size-1.5 rounded-full bg-yellow-500" />
          <span className="size-1.5 rounded-full bg-green-500" />
        </div>
        <div className="bg-background text-[8px] text-muted-foreground px-2 py-0.5 rounded-md flex-1 text-center font-mono truncate select-none border border-border/20">
          tip-to.me/@streamer
        </div>
      </div>

      <div className="h-10 w-full bg-linear-to-r from-primary to-indigo-950/80 relative" />

      <div className="p-3 grid grid-cols-12 gap-2 bg-card">
        <div className="col-span-5 flex flex-col items-start">
          <div className="size-8 rounded-full border-2 border-background bg-primary flex items-center justify-center font-black text-primary-foreground text-[8px] -mt-5 relative shadow">
            S
          </div>
          <h4 className="text-[9px] font-bold text-foreground mt-1 flex items-center gap-0.5 truncate max-w-full">
            Streamer
            <SealCheckIcon
              className="size-2.5 text-blue-500 shrink-0"
              weight="fill"
            />
          </h4>
          <span className="text-[6px] text-muted-foreground leading-none">
            @streamer
          </span>

          <p className="text-[6.5px] text-muted-foreground/85 mt-1 leading-normal line-clamp-2 font-read">
            {m.welcome_bio}
          </p>
        </div>

        <div className="col-span-7 bg-background border border-border rounded-xl p-2 flex flex-col gap-1 shadow-sm">
          <div className="text-[6px] font-bold text-muted-foreground uppercase tracking-wider">
            {m.tip_amount}
          </div>

          <div className="grid grid-cols-4 gap-0.5">
            {["$5", "$10", "$25", "$50"].map((preset, i) => (
              <span
                key={i}
                className={clsx(
                  "text-[7px] font-bold py-0.5 rounded text-center border font-baijamjuree",
                  i === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-foreground/5 text-foreground/75 border-border",
                )}
              >
                {preset}
              </span>
            ))}
          </div>

          <div className="bg-foreground/5 text-[8px] font-bold text-foreground px-1.5 py-0.5 rounded border border-border">
            $ 10.00
          </div>

          <div className="bg-foreground/5 text-[6px] text-muted-foreground px-2 py-0.5 rounded border border-border">
            {m.anonymous_fan}
          </div>
          <div className="bg-foreground/5 text-[6px] text-muted-foreground/85 p-1.5 rounded italic leading-normal border border-border line-clamp-1">
            {m.test_fan_msg}
          </div>

          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[7.5px] py-0.75 rounded shadow-sm transition-colors cursor-pointer">
            {m.send_alert}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2VisualViewer({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] bg-card border border-border rounded-2xl p-4 shadow-lg text-left flex flex-col gap-3">
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {m.complete_donation}
      </h4>
      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-border p-2 bg-foreground/2 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[8px] text-muted-foreground uppercase font-bold">
              {m.selected_amount}
            </span>
            <span className="text-[11px] font-bold text-foreground">
              $10.00 USD
            </span>
          </div>
          <span className="text-[8px] font-bold text-muted-foreground">
            {m.change}
          </span>
        </div>

        <div className="rounded-xl border border-border p-2 flex flex-col gap-1.5">
          <div className="flex justify-between items-center border-b border-border pb-1">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">
              {m.credit_card}
            </span>
            <div className="flex gap-1">
              <span className="text-[6.5px] bg-foreground/5 border border-border px-1 py-0.25 rounded font-bold">
                VISA
              </span>
              <span className="text-[6.5px] bg-foreground/5 border border-border px-1 py-0.25 rounded font-bold">
                MC
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-[8px]">
            <div className="h-6 rounded bg-background border border-border flex items-center px-2 text-muted-foreground font-mono">
              •••• •••• •••• 4242
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-6 rounded bg-background border border-border flex items-center px-2 text-muted-foreground">
                12/28
              </div>
              <div className="h-6 rounded bg-background border border-border flex items-center px-2 text-muted-foreground">
                ***
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-[9px] h-8 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
          <span>{m.pay_and_trigger.replace("{amount}", "$10.00")}</span>
        </button>
      </div>
    </div>
  );
}

function Step3VisualViewer({ lang }: { lang: any }) {
  const m = lang.data.pages.index.sections.howitworks.mockups;
  return (
    <div className="w-full max-w-[340px] bg-background border border-border rounded-2xl overflow-hidden shadow-lg text-left relative aspect-video flex flex-col justify-between">
      <div className="p-2 flex justify-between items-center z-10">
        <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
          <span className="size-1 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[6px] font-bold text-white uppercase tracking-wider font-mono">
            {m.live_overlay}
          </span>
        </div>
        <span className="text-[6.5px] text-foreground/50 font-semibold font-mono">
          {m.viewers_count.replace("{count}", "1,842")}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center z-10 px-6">
        <div className="p-2.5 rounded-xl bg-card border border-border shadow-[0_0_20px_var(--primary-glow)] flex flex-col gap-0.5 text-center scale-90 animate-bounce">
          <h1 className="whitespace-nowrap text-[9px] text-foreground/95 leading-none">
            <strong className="text-primary font-extrabold">
              {m.anonymous_fan}
            </strong>{" "}
            {lang.data.pages.index.sections.howitworks.donated}{" "}
            <strong className="text-primary font-extrabold font-baijamjuree">
              $10.00
            </strong>
          </h1>
          <p className="text-[7.5px] text-muted-foreground font-normal leading-none italic mt-0.5 select-none">
            {m.test_fan_msg}
          </p>
        </div>
      </div>

      <div className="bg-linear-to-t from-background/80 to-transparent p-2.5 flex items-center justify-between z-10 mt-auto">
        <span className="text-[7px] text-foreground/90 font-bold">
          {m.live_gameplay_stream}
        </span>
        <span className="text-[6px] text-foreground/50 font-mono">
          {m.powered_by}
        </span>
      </div>
    </div>
  );
}

export default function HowItWorkViewer() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: CalendarHeartIcon,
      title:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[0].title,
      description:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[0]
          .description,
      visual: <Step1VisualViewer lang={lang} />,
    },
    {
      icon: HandCoinsIcon,
      title:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[1].title,
      description:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[1]
          .description,
      visual: <Step2VisualViewer lang={lang} />,
    },
    {
      icon: ChalkboardTeacherIcon,
      title:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[2].title,
      description:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[2]
          .description,
      visual: <Step3VisualViewer lang={lang} />,
    },
  ];

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
            </motion.div>
          </AnimatePresence>
        </div>
        <div>
          <div className="flex flex-col gap-1.5">
            <strong className="font-mono text-foreground/40 text-sm font-normal">
              {lang.data.pages.index.sections.howitworks.viewer_guide_title}
            </strong>
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={clsx(
                    "text-left p-0 flex items-center uppercase gap-3 transition-all cursor-pointer",
                    !isActive && "text-foreground/40",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold font-mono tracking-wide leading-snug">
                      {step.title}
                    </h3>
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
