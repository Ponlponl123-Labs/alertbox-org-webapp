"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BellRingingIcon,
  HandHeartIcon,
  PaperPlaneRightIcon,
} from "@phosphor-icons/react";

import { type Language } from "@/types/i18n.types";

interface StreamerWorkspaceMockupProps {
  username: string;
  lang: Language;
}

export default function StreamerWorkspaceMockup({
  username,
  lang,
}: StreamerWorkspaceMockupProps) {
  const [isAlerting, setIsAlerting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isThai = lang?.key === "th-TH";
  const name = username.trim() || (isThai ? "ผู้สนับสนุน" : "Anonymous Fan");

  const triggerTip = React.useCallback(() => {
    setIsSending((prevSending) => {
      if (prevSending || isAlerting) return prevSending;
      setTimeout(() => {
        setIsSending(false);
        setIsAlerting(true);
      }, 850);
      return true;
    });
  }, [isAlerting]);

  useEffect(() => {
    if (isAlerting) {
      const timer = setTimeout(() => {
        setIsAlerting(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isAlerting]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerTip();
    }, 1500);
    return () => clearTimeout(timer);
  }, [triggerTip]);

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center pointer-events-auto">
      <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl -top-10 z-0 pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-primary/5 blur-3xl -bottom-10 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, x: -30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute left-2 sm:left-6 top-8 w-[250px] sm:w-[270px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl z-10 overflow-hidden font-sans"
      >
        <div className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 flex items-center gap-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-red-500" />
            <span className="size-1.5 rounded-full bg-yellow-500" />
            <span className="size-1.5 rounded-full bg-green-500" />
          </div>
          <div className="bg-white dark:bg-zinc-900 text-[8px] text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded-md flex-1 text-center font-mono select-none truncate">
            tip-to.me/@{username.toLowerCase().trim() || "streamer"}
          </div>
        </div>

        <div className="p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-primary flex items-center justify-center font-black text-primary-foreground text-[10px]">
              {name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-0.5">
                {username.trim() || "Streamer"}
                <span className="size-3 rounded-full bg-blue-500 flex items-center justify-center text-[6px] text-white font-bold">
                  ✓
                </span>
              </h4>
              <p className="text-[8px] text-zinc-400">
                {isThai ? "รับเงินสนับสนุนโดยตรง" : "Direct tip profile"}
              </p>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-200/40 dark:border-zinc-800/50 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[7px] text-zinc-400 font-bold uppercase tracking-wider">
              <span>{isThai ? "จำนวนเงิน" : "Tip Amount"}</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                USD
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-900 text-[11px] font-bold text-zinc-900 dark:text-white px-2 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 flex justify-between">
              <span>$ 10.00</span>
              <span className="text-[9px] text-zinc-400 font-normal">
                {isThai ? "ขั้นต่ำ $1.00" : "Min $1.00"}
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-900 text-[9px] text-zinc-400 dark:text-zinc-300 p-2 rounded-lg italic border border-zinc-200/30 dark:border-zinc-800/40 truncate">
              {isThai
                ? "สู้ๆ นะครับ ติดตามอยู่เสมอน้าา ❤️"
                : "Keep up the awesome streams! ❤️"}
            </div>
            <button
              onClick={triggerTip}
              disabled={isSending || isAlerting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] h-7 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-50"
            >
              <PaperPlaneRightIcon weight="bold" size={10} />
              {isSending
                ? isThai
                  ? "กำลังส่ง..."
                  : "Processing..."
                : isThai
                  ? "ส่งกำลังใจ"
                  : "Send Tipping Alert"}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isSending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: -60, y: -20 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 1],
              x: [-60, 0, 80],
              y: [-20, -52, 30],
            }}
            transition={{
              times: [0, 0.32, 1],
              duration: 0.55,
              ease: "easeOut",
            }}
            exit={{ opacity: 0 }}
            className="absolute z-30 size-6 bg-linear-to-r from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg border border-primary/20 pointer-events-none"
          >
            <HandHeartIcon
              weight="fill"
              size={12}
              className="text-primary-foreground"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: 30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="absolute right-2 sm:right-6 bottom-8 w-[250px] sm:w-[270px] bg-zinc-200 dark:bg-zinc-950 rounded-2xl shadow-2xl z-20 overflow-hidden font-sans aspect-video flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-radial-grid opacity-25 z-0" />
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[7px] text-red-500 font-mono tracking-wider uppercase font-semibold z-10 animate-pulse">
          <span className="h-1 w-1 rounded-full bg-red-500" />
          Live Overlay
        </div>

        <div className="relative z-10 w-full max-w-[85%] flex justify-center items-center pt-4 px-2">
          <AnimatePresence>
            {isAlerting && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className="w-full p-3.5 rounded-xl bg-background/60 backdrop-blur-md flex flex-col items-center justify-center gap-1 text-center shadow-lg absolute"
                style={{
                  boxShadow: `0 10px 25px -5px var(--primary-glow, rgba(244, 63, 94, 0.15))`,
                }}
              >
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-0.5 animate-bounce">
                  <BellRingingIcon weight="fill" size={16} />
                </div>
                <h4 className="text-[10px] font-bold tracking-tight text-foreground/90">
                  <span className="text-primary font-extrabold">{name}</span>{" "}
                  {isThai ? "โดเนท" : "donated"}{" "}
                  <span className="text-primary font-black font-baijamjuree">
                    $10.00
                  </span>
                </h4>
                <p className="text-[8px] text-foreground/40 italic max-w-xs truncate font-normal">
                  &ldquo;
                  {isThai
                    ? "สู้ๆ นะครับ ติดตามอยู่เสมอน้าา ❤️"
                    : "Keep up the awesome streams! ❤️"}
                  &rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isAlerting && !isSending && (
            <div className="text-center text-[9px] text-foreground/60 select-none absolute">
              {isThai
                ? "รอรับสัญญาณแจ้งเตือน..."
                : "Waiting for donation alert..."}
            </div>
          )}

          {isSending && (
            <div className="text-center text-[9px] text-foreground/60 animate-pulse font-semibold absolute">
              {isThai
                ? "กำลังตรวจสอบข้อมูลความปลอดภัย..."
                : "Verifying secure transaction..."}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
