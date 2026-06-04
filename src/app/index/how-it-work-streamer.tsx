"use client";
import Circle from "@/components/circle";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import {
  CodeBlockIcon,
  ConfettiIcon,
  HandCoinsIcon,
  PaintBrushIcon,
  UserIcon,
  UserRectangleIcon,
  VideoCameraIcon,
  WebhooksLogoIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, createRef } from "react";
import { useStore } from "zustand";
import { PAYMENT_METHODS } from "./constants";
import Image from "next/image";
import { Discord, Google, Obs } from "@thesvg/react";

function HowItWorkStreamer() {
  const lang = useStore(coreStore, (state) => state.lang);

  // Static element refs
  const cameraRefS2 = useRef<HTMLDivElement>(null);
  const discordRefS2 = useRef<HTMLDivElement>(null);
  const googleRefS2 = useRef<HTMLDivElement>(null);
  const alertboxRefS2 = useRef<HTMLDivElement>(null);

  const cameraRefS3 = useRef<HTMLDivElement>(null);
  const alertboxRefS3 = useRef<HTMLDivElement>(null);

  const alertboxRefS5 = useRef<HTMLDivElement>(null);
  const obsRefS5 = useRef<HTMLDivElement>(null);

  const donorRefS6 = useRef<HTMLDivElement>(null);
  const alertboxRefS6 = useRef<HTMLDivElement>(null);
  const obsRefS6 = useRef<HTMLDivElement>(null);

  // Dynamic payment refs
  const paymentRefsS3 = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  if (paymentRefsS3.current.length === 0) {
    paymentRefsS3.current = PAYMENT_METHODS.map(() =>
      createRef<HTMLDivElement>(),
    );
  }

  const paymentRefsS6 = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  if (paymentRefsS6.current.length === 0) {
    paymentRefsS6.current = PAYMENT_METHODS.map(() =>
      createRef<HTMLDivElement>(),
    );
  }

  const sectionHIW1_content = useRef<HTMLDivElement>(null);
  const sectionHIW1_image = useRef<HTMLDivElement>(null);
  const sectionHIW2_content = useRef<HTMLDivElement>(null);
  const sectionHIW2_image = useRef<HTMLDivElement>(null);
  const sectionHIW3_content = useRef<HTMLDivElement>(null);
  const sectionHIW3_image = useRef<HTMLDivElement>(null);
  const sectionHIW4_content = useRef<HTMLDivElement>(null);
  const sectionHIW4_image = useRef<HTMLDivElement>(null);
  const sectionHIW5_content = useRef<HTMLDivElement>(null);
  const sectionHIW5_image = useRef<HTMLDivElement>(null);
  const sectionHIW6_content = useRef<HTMLDivElement>(null);
  const sectionHIW6_image = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-4xl mx-auto font-sans flex flex-1 min-w-0 w-full gap-16 -mt-48">
      <div className=" min-w-0 flex-1">
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW1_content}
        >
          <HandCoinsIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {lang.data.pages.index.sections.howitworks.steps[0].title}
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {lang.data.pages.index.sections.howitworks.steps[0].description}
          </p>
        </div>
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW2_content}
        >
          <UserRectangleIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {lang.data.pages.index.sections.howitworks.steps[1].title}
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {lang.data.pages.index.sections.howitworks.steps[1].description}
          </p>
          <Link href={"/app"} className="w-max mt-3">
            <Button variant="default" className="rounded-xl p-4">
              {lang.data.header.actions.get_started}
            </Button>
          </Link>
        </div>
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW3_content}
        >
          <WebhooksLogoIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {lang.data.pages.index.sections.howitworks.steps[2].title}
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {lang.data.pages.index.sections.howitworks.steps[2].description}
          </p>
          <Link href={"/app/connect"} className="w-max mt-3">
            <Button variant="default" className="rounded-xl p-4">
              {lang.data.common.connect}
            </Button>
          </Link>
        </div>
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW4_content}
        >
          <PaintBrushIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {lang.data.pages.index.sections.howitworks.steps[3].title}
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {lang.data.pages.index.sections.howitworks.steps[3].description}
          </p>
          <Link href={"/app/customize"} className="w-max mt-3">
            <Button variant="default" className="rounded-xl p-4">
              {lang.data.common.customize}
            </Button>
          </Link>
        </div>
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW5_content}
        >
          <CodeBlockIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {lang.data.pages.index.sections.howitworks.steps[4].title}
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {lang.data.pages.index.sections.howitworks.steps[4].description}
          </p>
          <Link href={"/app/customize"} className="w-max mt-3">
            <Button variant="default" className="rounded-xl p-4">
              {lang.data.common.overlay_url}
            </Button>
          </Link>
        </div>
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW6_content}
        >
          <ConfettiIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {lang.data.pages.index.sections.howitworks.steps[5].title}
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {lang.data.pages.index.sections.howitworks.steps[5].description}
          </p>
          <Link href={"/app"} className="w-max mt-3">
            <Button variant="default" className="rounded-xl p-4">
              {lang.data.common.go_live}
            </Button>
          </Link>
        </div>
      </div>
      <div className="min-w-0 flex-1 relative max-md:hidden">
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6"
          ref={sectionHIW1_image}
        >
          <div className="flex gap-3 flex-wrap items-center justify-center">
            {PAYMENT_METHODS.map((v, i) => (
              <Link key={v.id} href={v.href} target="_blank">
                <Button variant={"secondary"} className={"rounded-2xl"}>
                  <v.icon className="size-6 max-h-4 w-auto" />
                  {v.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW2_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between items-center">
              <Circle ref={cameraRefS2}>
                <VideoCameraIcon />
              </Circle>
              <div className="flex flex-col justify-center items-center gap-2">
                <Circle ref={discordRefS2}>
                  <Discord />
                </Circle>
                <Circle
                  ref={googleRefS2}
                  className="grayscale brightness-75 dark:brightness-25"
                >
                  <Google />
                </Circle>
              </div>
              <Circle ref={alertboxRefS2} className="p-2 size-14">
                <Image
                  src={"/favicon.ico"}
                  width={32}
                  height={32}
                  alt="Alertbox.org"
                />
              </Circle>
            </div>
          </div>
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW2_image}
            fromRef={cameraRefS2}
            toRef={googleRefS2}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW2_image}
            fromRef={cameraRefS2}
            toRef={discordRefS2}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW2_image}
            fromRef={googleRefS2}
            toRef={alertboxRefS2}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW2_image}
            fromRef={discordRefS2}
            toRef={alertboxRefS2}
          />
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW3_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between items-center">
              <Circle ref={cameraRefS3}>
                <VideoCameraIcon />
              </Circle>
              <div className="flex flex-col justify-center gap-2">
                {PAYMENT_METHODS.map((method, index) => (
                  <Circle key={method.id} ref={paymentRefsS3.current[index]}>
                    <method.icon className="size-6" />
                  </Circle>
                ))}
              </div>
              <Circle ref={alertboxRefS3} className="p-2 size-14">
                <Image
                  src={"/favicon.ico"}
                  width={32}
                  height={32}
                  alt="Alertbox.org"
                />
              </Circle>
            </div>
          </div>
          {paymentRefsS3.current.map((ref, index) => (
            <AnimatedBeam
              key={`beam-s3-from-${index}`}
              duration={3}
              containerRef={sectionHIW3_image}
              fromRef={cameraRefS3}
              toRef={ref}
            />
          ))}
          {paymentRefsS3.current.map((ref, index) => (
            <AnimatedBeam
              key={`beam-s3-to-${index}`}
              duration={3}
              containerRef={sectionHIW3_image}
              fromRef={ref}
              toRef={alertboxRefS3}
            />
          ))}
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW4_image}
        >
          <div className="flex flex-col gap-1.5 items-center justify-center">
            <h1 className="flex items-center justify-center gap-1 whitespace-nowrap">
              <strong className="text-pink-300">Ponlponl123</strong>
              {lang.data.pages.index.sections.howitworks.donated}
              <strong className="text-pink-300">
                50.00 {lang.data.currency_symbols}
              </strong>
            </h1>
            <p className="text-xs">
              {lang.data.pages.index.sections.howitworks.test_message}
            </p>
          </div>
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW5_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between items-center">
              <Circle ref={alertboxRefS5} className="p-2 size-14">
                <Image
                  src={"/favicon.ico"}
                  width={32}
                  height={32}
                  alt="Alertbox.org"
                />
              </Circle>
              <Circle ref={obsRefS5} className="p-2 size-14">
                <Obs />
              </Circle>
            </div>
          </div>
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW5_image}
            fromRef={alertboxRefS5}
            toRef={obsRefS5}
          />
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW6_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between items-center">
              <Circle ref={donorRefS6}>
                <UserIcon />
              </Circle>
              <div className="flex flex-col justify-center gap-2">
                {PAYMENT_METHODS.map((method, index) => (
                  <Circle key={method.id} ref={paymentRefsS6.current[index]}>
                    <method.icon className="size-6" />
                  </Circle>
                ))}
              </div>
              <Circle ref={alertboxRefS6} className="p-2 size-14">
                <Image
                  src={"/favicon.ico"}
                  width={32}
                  height={32}
                  alt="Alertbox.org"
                />
              </Circle>
              <Circle ref={obsRefS6} className="p-2 size-14">
                <Obs />
              </Circle>
            </div>
          </div>
          {paymentRefsS6.current.map((ref, index) => (
            <AnimatedBeam
              key={`beam-s6-from-${index}`}
              duration={3}
              containerRef={sectionHIW6_image}
              fromRef={donorRefS6}
              toRef={ref}
            />
          ))}
          {paymentRefsS6.current.map((ref, index) => (
            <AnimatedBeam
              key={`beam-s6-to-${index}`}
              duration={3}
              containerRef={sectionHIW6_image}
              fromRef={ref}
              toRef={alertboxRefS6}
            />
          ))}
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={alertboxRefS6}
            toRef={obsRefS6}
          />
        </div>
      </div>
    </div>
  );
}

export default HowItWorkStreamer;
