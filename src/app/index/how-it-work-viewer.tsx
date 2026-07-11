"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import {
  CalendarHeartIcon,
  ChalkboardTeacherIcon,
  HandCoinsIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";
import { useStore } from "zustand";
import { AnimatePresence, motion } from "motion/react";

function Step1VisualViewer() {
  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-hidden shadow-xl font-sans text-left transition-all duration-300">
      <div className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 flex items-center gap-1 border-b border-zinc-200/50 dark:border-zinc-800/80">
        <div className="flex gap-1 shrink-0">
          <span className="size-1.5 rounded-full bg-red-500" />
          <span className="size-1.5 rounded-full bg-yellow-500" />
          <span className="size-1.5 rounded-full bg-green-500" />
        </div>
        <div className="bg-white dark:bg-zinc-950 text-[8px] text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded-md flex-1 text-center font-mono truncate select-none">
          tip-to.me/@streamer
        </div>
      </div>

      <div className="h-10 w-full bg-gradient-to-r from-primary to-indigo-950 relative" />

      <div className="p-3 grid grid-cols-12 gap-2 bg-zinc-50 dark:bg-zinc-950">
        <div className="col-span-5 flex flex-col items-start">
          <div className="size-8 rounded-full border-2 border-white dark:border-zinc-950 bg-primary flex items-center justify-center font-black text-primary-foreground text-[8px] -mt-5 relative shadow">
            S
          </div>
          <h4 className="text-[9px] font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-0.5 truncate max-w-full">
            Streamer
            <SealCheckIcon
              className="size-2.5 text-blue-500 shrink-0"
              weight="fill"
            />
          </h4>
          <span className="text-[6px] text-zinc-400 dark:text-zinc-500 leading-none">
            @streamer
          </span>

          <p className="text-[6.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal line-clamp-2 font-read">
            Welcome to my tip page. Thank you for your support!
          </p>
        </div>

        <div className="col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-2 flex flex-col gap-1 shadow-sm">
          <div className="text-[6px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Tip Amount
          </div>

          <div className="grid grid-cols-4 gap-0.5">
            {["$5", "$10", "$25", "$50"].map((preset, i) => (
              <span
                key={i}
                className={`text-[7px] font-bold py-0.5 rounded text-center border font-baijamjuree ${
                  i === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800/80"
                }`}
              >
                {preset}
              </span>
            ))}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 text-[8px] font-bold text-zinc-900 dark:text-white px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-800/40">
            $ 10.00
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 text-[6px] text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded border border-zinc-200/30 dark:border-zinc-800/50">
            Anonymous Fan
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 text-[6px] text-zinc-300 dark:text-zinc-400 p-1.5 rounded italic leading-normal border border-zinc-200/30 dark:border-zinc-800/50 line-clamp-1">
            Keep streaming! ❤️
          </div>

          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[7.5px] py-0.75 rounded shadow-sm transition-colors">
            Send Alert
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2VisualViewer() {
  return (
    <div className="w-full max-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg text-left flex flex-col gap-3">
      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Complete Donation
      </h4>
      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-2 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">
              Selected Amount
            </span>
            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
              $10.00 USD
            </span>
          </div>
          <span className="text-[8px] font-bold text-zinc-400">Change</span>
        </div>

        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-2 flex flex-col gap-1.5">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-1">
            <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
              Credit Card
            </span>
            <div className="flex gap-1">
              <span className="text-[6.5px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 px-1 py-0.25 rounded font-bold">
                VISA
              </span>
              <span className="text-[6.5px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 px-1 py-0.25 rounded font-bold">
                MC
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-[8px]">
            <div className="h-6 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-2 text-zinc-600 dark:text-zinc-400 font-mono">
              •••• •••• •••• 4242
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-6 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-2 text-zinc-600 dark:text-zinc-400">
                12/28
              </div>
              <div className="h-6 rounded bg-zinc-55 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-2 text-zinc-600 dark:text-zinc-400">
                ***
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-[9px] h-8 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors">
          <span>Pay $10.00 & Trigger Alert</span>
        </button>
      </div>
    </div>
  );
}

function Step3VisualViewer() {
  return (
    <div className="w-full max-w-[340px] bg-zinc-200 dark:bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg text-left relative aspect-video flex flex-col justify-between">
      <div className="p-2 flex justify-between items-center z-10">
        <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
          <span className="size-1 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[6px] font-bold text-white uppercase tracking-wider font-mono">
            Live Overlay
          </span>
        </div>
        <span className="text-[6.5px] text-foreground/50 font-semibold font-mono">
          1,842 Viewers
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center z-10 px-6">
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 shadow-[0_0_20px_var(--primary-glow)] flex flex-col gap-0.5 text-center scale-90 animate-bounce">
          <h1 className="whitespace-nowrap text-[9px] text-foreground/95 leading-none">
            <strong className="text-primary font-extrabold">
              Anonymous Fan
            </strong>{" "}
            donated{" "}
            <strong className="text-primary font-extrabold font-baijamjuree">
              $10.00
            </strong>
          </h1>
          <p className="text-[7.5px] text-zinc-400 font-normal leading-none italic mt-0.5 select-none">
            Keep streaming! ❤️
          </p>
        </div>
      </div>

      <div className="bg-linear-to-t from-background/80 to-transparent p-2.5 flex items-center justify-between z-10 mt-auto">
        <span className="text-[7px] text-foreground/90 font-bold">
          Live Gameplay Stream
        </span>
        <span className="text-[6px] text-foreground/50 font-mono">
          Powered by Alertbox.org
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
      visual: <Step1VisualViewer />,
    },
    {
      icon: HandCoinsIcon,
      title:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[1].title,
      description:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[1]
          .description,
      visual: <Step2VisualViewer />,
    },
    {
      icon: ChalkboardTeacherIcon,
      title:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[2].title,
      description:
        lang.data.pages.index.sections.howitworks.steps_for_viewer[2]
          .description,
      visual: <Step3VisualViewer />,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-900/80 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-xl">
      <div className="flex-grow flex flex-col justify-between md:max-w-[45%] h-auto">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              Fans Guide
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
                        : "bg-zinc-200/50 dark:bg-zinc-900 text-zinc-500"
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
