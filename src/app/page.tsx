"use client";
import Link from "next/link";
import DotField from "@/components/DotField";
import { coreStore } from "@/hooks/store/core";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "zustand";
import { ArrowUpRightIcon, BellRingingIcon } from "@phosphor-icons/react";
import { Input } from "react-smooth-input";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import HowItWorkStreamer from "./index/how-it-work-streamer";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "@/components/animate-ui/components/headless/accordion";

export default function Home() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [isHIWStreamer, setIsHIWStreamer] = useState(true);
  const sectionHIW = useRef<HTMLDivElement>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col flex-1 min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black relative"
      >
        <div className="absolute w-full h-full top-0 left-0 opacity-15 dark:invert">
          <DotField
            dotRadius={2.4}
            dotSpacing={14}
            bulgeStrength={16}
            glowRadius={160}
            sparkle={false}
            waveAmplitude={0.1}
            cursorRadius={120}
            cursorForce={0.1}
            bulgeOnly
            gradientFrom="#000000A0"
            gradientTo="#000000A0"
            glowColor="#00000010"
          />
        </div>
        <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-32 px-16 sm:items-start z-10">
          <div />
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
              <h1 className="max-w-xs text-4xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                {lang.data.pages.index.title}
              </h1>
              <p className="max-w-md text-lg max-md:text-sm leading-8 text-zinc-600 dark:text-zinc-400">
                {lang.data.pages.index.description}
              </p>
            </div>
            <div className="max-md:hidden"></div>
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full items-center">
            <Input
              type="text"
              startContent={
                <span className="text-xs font-read translate-y-0.5 ml-2 relative flex -mr-2.75 text-foreground/40">
                  tip-to.me/@
                </span>
              }
              endContent={
                <Link
                  className="text-xs flex w-max -mr-0.5 h-8 items-center justify-center gap-2 rounded-full bg-foreground px-3 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
                  href="/app"
                >
                  <BellRingingIcon
                    weight="fill"
                    className="max-sm:hidden"
                    size={16}
                  />
                  {lang.data.pages.index.actions.primary}
                </Link>
              }
              fontStyle={{
                fontFamily: "var(--font-read)",
                fontSize: "12px",
              }}
              placeholder="your-name"
              classNames={{
                base: "h-12 rounded-full backdrop-blur-xs",
                container: "min-w-0 max-w-106 max-md:min-w-88 flex-1",
              }}
            />
            <Button
              variant={"outline"}
              className="text-sm flex h-11 items-center justify-center rounded-full border-2 border-solid border-black/8 px-5 hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              onClick={() =>
                sectionHIW.current &&
                sectionHIW.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              {lang.data.pages.index.actions.secondary}
            </Button>
          </div>
        </main>
      </motion.div>
      <section
        ref={sectionHIW}
        className="p-6 py-16 min-h-screen w-full flex flex-col items-center bg-zinc-50 font-sans dark:bg-black"
      >
        <div className="sticky top-12 mt-16 -mb-16 flex flex-col items-center">
          <h1 className="text-4xl font-semibold mb-3">
            {lang.data.pages.index.sections.howitworks.title}
          </h1>
          <p>{lang.data.pages.index.sections.howitworks.description}</p>
          <div className="mt-6 bg-foreground/5 p-1 rounded-full">
            <Button
              className="rounded-full relative"
              variant={"ghost"}
              onClick={() => setIsHIWStreamer(true)}
            >
              <AnimatePresence>
                {isHIWStreamer && (
                  <motion.div
                    layoutId="HIW-Selector-Active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="size-full top-0 left-0 rounded-full absolute bg-foreground pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <span className={cn("z-10", isHIWStreamer && "text-background")}>
                {lang.data.pages.index.sections.howitworks.selectors.streamer}
              </span>
            </Button>
            <Button
              className="rounded-full relative"
              variant={"ghost"}
              onClick={() => setIsHIWStreamer(false)}
            >
              <AnimatePresence>
                {!isHIWStreamer && (
                  <motion.div
                    layoutId="HIW-Selector-Active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="size-full top-0 left-0 rounded-full absolute bg-foreground pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <span className={cn("z-10", !isHIWStreamer && "text-background")}>
                {lang.data.pages.index.sections.howitworks.selectors.viewer}
              </span>
            </Button>
          </div>
        </div>
        <div className="flex gap-8 w-full min-h-screen z-10 -mb-16 bg-zinc-50 dark:bg-black relative mt-64">
          <div className="absolute w-full pointer-events-none h-64 bg-linear-180 to-zinc-50 dark:to-black from-transparent top-0 left-0 -translate-y-full" />
          <AnimatePresence mode="wait">
            {isHIWStreamer ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto"
                key="HIW-Streamer"
                layoutId="HIW-Streamer"
              >
                <HowItWorkStreamer />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto"
                key="HIW-Viewer"
                layoutId="HIW-Viewer"
              ></motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <section className="p-6 py-16 min-h-screen w-full flex flex-col items-center bg-zinc-50 font-sans dark:bg-black">
        <div className="w-full max-w-xl flex flex-col items-center text-center">
          <div className="flex gap-1 w-full max-w-lg my-16 items-center justify-center">
            <div className="flex-1 min-w-0 h-px bg-foreground/40" />
            <div className="py-1 px-3 rounded-full bg-foreground/10 border-2 border-foreground/10 text-xs">
              สำหรับผู้ที่มีสัญชาติไทย และกำลังอาศัยอยู่ในประเทศไทย
            </div>
            <div className="flex-1 min-w-0 h-px bg-foreground/40" />
          </div>
          <h1 className="text-4xl font-semibold mb-3">
            หากบริการของเรายังไม่ตอบโจทย์
          </h1>
          <p className="text-foreground/40">
            และ ฉันสามารถยอมรับความเสี่ยงด้านเส้นทางการเงินได้
          </p>

          <p className="mt-12">
            เราขอแนะนำให้ท่านลองทำความรู้จักกับ{" "}
            <Link
              href={"https://easydonate.app/?ref=alertbox.org"}
              className="text-blue-500"
              target="_blank"
            >
              EasyDonate
            </Link>
          </p>
        </div>
        <Accordion className="w-full max-w-md mt-16 mb-6 bg-muted rounded-2xl overflow-hidden">
          <AccordionItem>
            <AccordionButton
              className={
                "p-4 hover:no-underline hover:bg-foreground/5 rounded-sm"
              }
            >
              EasyDonate แตกต่างจากเราอย่างไร?
            </AccordionButton>
            <AccordionPanel
              data-default-transition="false"
              className={"p-4 bg-background/40 rounded-t-xl"}
            >
              <div>
                <p>
                  EasyDonate
                  จะแสดงกล่องแจ้งเตือนต่อเมื่อผู้บริจาคอัพโหลดสลิปโอนเงินเพื่อยืนยัน
                  และเป็นการโอนไปยังบัญชีสตรีมเมอร์โดยตรง
                </p>
                <span className="mt-4 block text-xs text-foreground/40">
                  Alertbox.org:
                </span>
                <p className="mt-2 text-xs text-foreground/40">
                  แต่เราจะแสดงกล่องแจ้งเตือนต่อเมื่อผู้บริจาคได้ทำการซื้อ,
                  สมัครรายเดือน หรือบริจาค ทันที
                  โดยผู้ให้บริการช่องทางการชำระเงิน เช่น Stripe, Buy me a
                  coffee, Ko-Fi จะส่งกิจกรรม Webhook
                  มาให้เราเพื่อแสดงกล่องแจ้งเตือน
                </p>
                <p className="mt-2 text-xs text-foreground/40">
                  โดยที่วิธีนี้จะสามารถปกปิดข้อมูลส่วนตัวของสตรีมเมอร์ได้โดยที่ผู้บริจาคจะชำระเงินให้กับผู้ให้บริการช่องทางการชำระเงินก่อนที่เงินทั้งหมดจะถูกโอนให้กับสตรีมเมอร์
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton
              className={
                "p-4 hover:no-underline hover:bg-foreground/5 rounded-sm"
              }
            >
              ค่าบริการ
            </AccordionButton>
            <AccordionPanel
              data-default-transition="false"
              className={"p-4 bg-background/40 rounded-t-xl"}
            >
              <div>
                <p>
                  EasyDonate
                  สำหรับแพ็คเกจฟรีจะอนุญาตให้สามารถแสดงการแจ้งเตือนการบริจาคได้เพียง
                  10 ครั้ง/เดือน และอาจมีโฆษณาในหน้ารับเงิน
                  <br />
                  <br />
                  โปรดศึกษาเพิ่มเติมเกี่ยวกับ
                  <Link
                    href={"https://easydonate.app/plans?ref=alertbox.org"}
                    target="_blank"
                    className="text-blue-500"
                  >
                    ค่าบริการของ EasyDonate ที่นี่
                  </Link>
                </p>
                <span className="mt-4 block text-xs text-foreground/40">
                  Alertbox.org:
                </span>
                <p className="mt-2 text-xs text-foreground/40">
                  เราเป็นองค์กรไม่แสวงผลกำไร โดยเราจะไม่เก็บค่าบริการใดๆ
                  จากแพลตฟอร์มทั้งสิ้น
                  เว้นแต่ค่าบริการและค่าธรรมเนียมที่เกิดขึ้นจากผู้ให้บริการช่องทางการชำระเงิน
                  เช่น Stripe, Buy me a coffee, Ko-Fi
                  ซึ่งทั้งหมดนี้ไม่ได้อยู่ในการควบคุมของเรา
                </p>
                <p className="mt-2 text-xs text-foreground/40">
                  ซึ่งการทำเช่นนี้เราจะสามารถได้รับรายได้เพื่อนำมาบำรุงรักษาและให้บริการ
                  Alertbox.org และ tip-to.me
                  ต่อไปได้โดยการบริจาคจากผู้ใช้งานของเราเท่านั้น
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Link
          href={"https://easydonate.app/?ref=alertbox.org"}
          target="_blank"
          className="mb-3"
        >
          <Button
            className={
              "bg-linear-60 from-blue-800 to-cyan-700 bg-transparent p-5 text-white rounded-full"
            }
            size={"lg"}
          >
            ลองดู EasyDonate.app <ArrowUpRightIcon size={16} weight="bold" />
          </Button>
        </Link>
        <div className="flex flex-col font-read text-center gap-2 mb-12">
          <strong className="uppercase tracking-widest font-mono text-foreground/40 mt-12">
            DISCLAMER
          </strong>
          <span className="text-foreground/40 text-xs mt-2">
            เรา AlertBox.org ไม่ได้มีส่วนร่วม หรือความเกี่ยวข้องใดๆกัน
            และไม่ได้รู้จักกับผู้บริหารของ EasyDonate เป็นการส่วนตัว
          </span>
          <span className="text-foreground/40 text-xs">
            AlertBox.org เกิดขึ้นมาจากกลุ่มนักพัฒนาเล็กๆ ที่ชื่นชอบ
            และมีอุดมคติเดียวกันคือ
          </span>
          <strong className="text-foreground/60 text-sm mt-2">
            &quot;นวัตกรรมที่แท้จริงจะเจริญงอกงามได้เมื่อความรู้เป็นสิ่งที่เข้าถึงได้ฟรี&quot;
          </strong>
          <span className="text-foreground/40 text-xs mt-2">
            ทั้งนี้ ความตั้งใจของเราในการสร้าง AlertBox.org
            ของเราไม่ได้เกิดมาเพื่อฆ่าผู้เล่นในตลาด
            เราเป็นเพียงอีกทางเลือกหนึ่งสำหรับทุกคน
          </span>
          <span className="text-foreground/40 text-xs mt-2">
            สร้างโดย มนุยษ์ เพื่อ มนุยษ์ เกิดขึ้นบน โลก
          </span>
        </div>
      </section>
    </>
  );
}
