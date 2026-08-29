"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRingingIcon, PlayIcon, PaletteIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";

import { type Language } from "@/types/i18n.types";

interface AlertSimulatorProps {
  username: string;
  lang: Language;
}

type TemplateType = "modern" | "glow" | "minimal";

const TEMPLATES: { id: TemplateType; label: { en: string; th: string } }[] = [
  { id: "modern", label: { en: "Glassmorphic", th: "กลาสมอร์ฟิก" } },
  { id: "glow", label: { en: "Neon Glow", th: "นีออน โกลว์" } },
  { id: "minimal", label: { en: "Minimal Bold", th: "มินิมอล โบล์ด" } },
];

const COLORS = [
  { name: "Rose", value: "#F43F5E" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Green", value: "#10B981" },
];

export default function AlertSimulator({ username, lang }: AlertSimulatorProps) {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>("modern");
  const [activeColor, setActiveColor] = useState("#F43F5E");
  const [isAlerting, setIsAlerting] = useState(false);
  const isThai = lang?.key === "th-TH";

  const triggerAlert = React.useCallback(() => {
    setIsAlerting(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerAlert();
    }, 800);
    return () => clearTimeout(timer);
  }, [username, triggerAlert]);

  useEffect(() => {
    if (isAlerting) {
      const timer = setTimeout(() => {
        setIsAlerting(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isAlerting]);

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      <div className="relative aspect-video w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-25 z-0" />
        <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 font-mono tracking-wider uppercase font-semibold z-10 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Live Overlay Preview
        </div>

        <div className="relative z-10 w-full max-w-[80%] flex justify-center">
          <AnimatePresence mode="wait">
            {isAlerting && (
              <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full"
              >
                {activeTemplate === "modern" && (
                  <div
                    className="p-5 rounded-2xl backdrop-blur-md border flex flex-col items-center justify-center gap-2 text-center shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: "rgba(9, 9, 11, 0.65)",
                      borderColor: `${activeColor}40`,
                      boxShadow: `0 10px 30px -10px ${activeColor}20`,
                    }}
                  >
                    <div
                      className="size-12 rounded-full flex items-center justify-center mb-1 animate-bounce"
                      style={{ backgroundColor: `${activeColor}20`, color: activeColor }}
                    >
                      <BellRingingIcon weight="fill" size={24} />
                    </div>
                    <h2 className="text-sm font-semibold tracking-tight text-white/90">
                      <span style={{ color: activeColor }}>
                        {username.trim() || (isThai ? "ผู้สนับสนุน" : "Anonymous")}
                      </span>{" "}
                      {isThai ? "โดเนท" : "donated"}{" "}
                      <span className="font-bold font-baijamjuree" style={{ color: activeColor }}>
                        $50.00
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-300 italic max-w-xs font-normal">
                      &ldquo;{isThai ? "สู้ๆ นะครับพี่สตรีมเมอร์! ติดตามอยู่เสมอครับ ❤️" : "Keep up the awesome streams! Best streamer ever ❤️"}&rdquo;
                    </p>
                  </div>
                )}

                {activeTemplate === "glow" && (
                  <div
                    className="p-6 rounded-xl border flex flex-col items-center text-center relative overflow-hidden transition-all duration-300"
                    style={{
                      backgroundColor: "black",
                      borderColor: activeColor,
                      boxShadow: `0 0 20px ${activeColor}50, inset 0 0 10px ${activeColor}20`,
                    }}
                  >
                    <div
                      className="text-xs font-bold uppercase tracking-widest mb-1 animate-pulse"
                      style={{ color: activeColor }}
                    >
                      ★ {isThai ? "โดเนทใหม่!" : "New Donation!"} ★
                    </div>
                    <h2 className="text-base font-black text-white">
                      {username.trim() || (isThai ? "ผู้สนับสนุน" : "Anonymous")}
                    </h2>
                    <p className="text-xl font-bold font-baijamjuree mt-1" style={{ color: activeColor }}>
                      $50.00
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 font-normal">
                      {isThai ? "สู้ๆ นะครับพี่สตรีมเมอร์! ติดตามอยู่เสมอครับ ❤️" : "Keep up the awesome streams! Best streamer ever ❤️"}
                    </p>
                  </div>
                )}

                {activeTemplate === "minimal" && (
                  <div className="bg-white text-black p-4 border-l-8 flex flex-row items-center justify-between text-left shadow-2xl transition-all duration-300"
                    style={{ borderColor: activeColor }}
                  >
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                        {isThai ? "แจ้งเตือนการโอน" : "Tipping Alert"}
                      </h2>
                      <p className="text-sm font-black">
                        {username.trim() || (isThai ? "ผู้สนับสนุน" : "Anonymous")}{" "}
                        <span className="font-baijamjuree font-bold" style={{ color: activeColor }}>$50.00</span>
                      </p>
                      <p className="text-xs text-zinc-600 mt-1 font-normal italic">
                        {isThai ? "สู้ๆ นะครับพี่สตรีมเมอร์! ติดตามอยู่เสมอครับ ❤️" : "Keep up the awesome streams! Best streamer ever ❤️"}
                      </p>
                    </div>
                    <div className="text-zinc-300">
                      <BellRingingIcon weight="fill" size={32} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!isAlerting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-center text-xs text-zinc-500 py-8"
            >
              {isThai ? "คลิกปุ่มด้านล่างเพื่อทดสอบการแจ้งเตือน" : "Click below to trigger test alert"}
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-1.5">
            <PaletteIcon size={14} />
            {isThai ? "ธีมกล่องแจ้งเตือน" : "Alert Theme"}
          </label>
          <div className="flex flex-col gap-1.5">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setActiveTemplate(tmpl.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeTemplate === tmpl.id
                    ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-sm"
                    : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {isThai ? tmpl.label.th : tmpl.label.en}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-wider uppercase text-zinc-500">
              {isThai ? "โทนสีหลัก" : "Accent Color"}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLORS.map((col) => (
                <button
                  key={col.value}
                  onClick={() => setActiveColor(col.value)}
                  className={`size-6 rounded-full border transition-all ${
                    activeColor === col.value
                      ? "ring-2 ring-offset-2 ring-rose-500 dark:ring-offset-black scale-110"
                      : "opacity-75 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: col.value, borderColor: "rgba(0,0,0,0.1)" }}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={triggerAlert}
            disabled={isAlerting}
            variant="outline"
            className="w-full text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 font-bold bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 border border-transparent shadow-md transition-all active:scale-[0.98]"
          >
            <PlayIcon size={14} weight="fill" />
            {isThai ? "จำลองส่งโดเนท" : "Trigger Test Alert"}
          </Button>
        </div>
      </div>
    </div>
  );
}
