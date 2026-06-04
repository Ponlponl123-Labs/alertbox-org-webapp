"use client";
import Circle from "@/components/circle";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import {
  CalendarHeartIcon,
  ChalkboardTeacherIcon,
  CheckIcon,
  HandCoinsIcon,
  UserIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, createRef } from "react";
import { useStore } from "zustand";
import { PAYMENT_METHODS } from "./constants";
import Image from "next/image";

function HowItWorkViewer() {
  const lang = useStore(coreStore, (state) => state.lang);

  // Static element refs
  const cameraRefS1 = useRef<HTMLDivElement>(null);
  const alertboxRefS1 = useRef<HTMLDivElement>(null);

  const donorRefS3 = useRef<HTMLDivElement>(null);
  const checkRefS3 = useRef<HTMLDivElement>(null);
  const cameraRefS3 = useRef<HTMLDivElement>(null);
  const alertboxRefS3 = useRef<HTMLDivElement>(null);
  const teacherRefS3 = useRef<HTMLDivElement>(null);

  // Dynamic payment refs
  const paymentRefsS1 = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  if (paymentRefsS1.current.length === 0) {
    paymentRefsS1.current = PAYMENT_METHODS.map(() =>
      createRef<HTMLDivElement>(),
    );
  }

  const sectionHIW1_content = useRef<HTMLDivElement>(null);
  const sectionHIW1_image = useRef<HTMLDivElement>(null);
  const sectionHIW2_content = useRef<HTMLDivElement>(null);
  const sectionHIW2_image = useRef<HTMLDivElement>(null);
  const sectionHIW3_content = useRef<HTMLDivElement>(null);
  const sectionHIW3_image = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-4xl mx-auto font-sans flex flex-1 min-w-0 w-full gap-16 -mt-48">
      <div className=" min-w-0 flex-1">
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW1_content}
        >
          <CalendarHeartIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {
              lang.data.pages.index.sections.howitworks.steps_for_viewer[0]
                .title
            }
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {
              lang.data.pages.index.sections.howitworks.steps_for_viewer[0]
                .description
            }
          </p>
        </div>
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW2_content}
        >
          <HandCoinsIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {
              lang.data.pages.index.sections.howitworks.steps_for_viewer[1]
                .title
            }
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {
              lang.data.pages.index.sections.howitworks.steps_for_viewer[1]
                .description
            }
          </p>
        </div>
        <div
          className="py-24 h-screen flex flex-col justify-center"
          ref={sectionHIW3_content}
        >
          <ChalkboardTeacherIcon size={48} weight="fill" className="mb-3" />
          <h1 className="font-semibold text-lg mb-3">
            {
              lang.data.pages.index.sections.howitworks.steps_for_viewer[2]
                .title
            }
          </h1>
          <p className="text-foreground/40 text-sm font-read">
            {
              lang.data.pages.index.sections.howitworks.steps_for_viewer[2]
                .description
            }
          </p>
        </div>
      </div>
      <div className="min-w-0 flex-1 relative max-md:hidden">
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6"
          ref={sectionHIW1_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between items-center">
              <Circle ref={cameraRefS1}>
                <VideoCameraIcon />
              </Circle>
              <Circle ref={alertboxRefS1} className="p-2 size-14">
                <Image
                  src={"/favicon.ico"}
                  width={32}
                  height={32}
                  alt="Alertbox.org"
                />
              </Circle>
              <div className="flex flex-col justify-center gap-2">
                {PAYMENT_METHODS.map((method, index) => (
                  <Circle key={method.id} ref={paymentRefsS1.current[index]}>
                    <method.icon className="size-6" />
                  </Circle>
                ))}
              </div>
            </div>
          </div>
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW1_image}
            fromRef={cameraRefS1}
            toRef={alertboxRefS1}
          />
          {paymentRefsS1.current.map((ref, index) => (
            <AnimatedBeam
              key={`beam-s1-to-${index}`}
              duration={3}
              containerRef={sectionHIW1_image}
              fromRef={alertboxRefS1}
              toRef={ref}
            />
          ))}
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW2_image}
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
          ref={sectionHIW3_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between">
              <Circle ref={donorRefS3}>
                <UserIcon />
              </Circle>
              <Circle ref={checkRefS3} className="bg-green-700 text-white">
                <CheckIcon weight="bold" />
              </Circle>
              <div className="flex flex-col justify-center gap-2">
                <Circle ref={cameraRefS3}>
                  <VideoCameraIcon />
                </Circle>
                <Circle ref={alertboxRefS3} className="p-2 size-14">
                  <Image
                    src={"/favicon.ico"}
                    width={32}
                    height={32}
                    alt="Alertbox.org"
                  />
                </Circle>
              </div>
              <Circle
                ref={teacherRefS3}
                className="bg-red-900 text-white relative"
              >
                <div className="absolute -z-10 animate-ping size-full bg-red-900 rounded-full" />
                <ChalkboardTeacherIcon weight="fill" />
              </Circle>
            </div>
          </div>
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={donorRefS3}
            toRef={checkRefS3}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={checkRefS3}
            toRef={cameraRefS3}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={checkRefS3}
            toRef={alertboxRefS3}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={alertboxRefS3}
            toRef={teacherRefS3}
          />
        </div>
      </div>
    </div>
  );
}

export default HowItWorkViewer;
