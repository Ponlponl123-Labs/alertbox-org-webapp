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
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useStore } from "zustand";

function HowItWorkStreamer() {
  const lang = useStore(coreStore, (state) => state.lang);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);
  const div8Ref = useRef<HTMLDivElement>(null);
  const div9Ref = useRef<HTMLDivElement>(null);
  const div10Ref = useRef<HTMLDivElement>(null);
  const div11Ref = useRef<HTMLDivElement>(null);
  const div12Ref = useRef<HTMLDivElement>(null);
  const div13Ref = useRef<HTMLDivElement>(null);
  const div14Ref = useRef<HTMLDivElement>(null);
  const div15Ref = useRef<HTMLDivElement>(null);
  const div16Ref = useRef<HTMLDivElement>(null);
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
          <div className="flex gap-3 flex-wrap">
            {[
              {
                name: "Stripe",
                image: "/stripe.webp",
                href: "https://stripe.com/",
              },
              {
                name: "Buy Me A Coffee",
                image: "/buymeacoffee.webp",
                href: "https://buymeacoffee.com/",
              },
              {
                name: "Ko-Fi",
                image: "/kofi.webp",
                href: "https://ko-fi.com/",
              },
            ].map((v, i) => (
              <Link key={i} href={v.href} target="_blank">
                <Button variant={"secondary"} className={"rounded-2xl"}>
                  <Image
                    src={v.image}
                    width={24}
                    height={24}
                    className="max-h-4 w-auto"
                    alt={v.name}
                  />
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
            <div className="flex flex-row justify-between">
              <Circle ref={div6Ref}>
                <VideoCameraIcon />
              </Circle>
              <Circle ref={div7Ref}>
                <Image
                  src={"/google.webp"}
                  width={24}
                  height={24}
                  alt="Google"
                />
              </Circle>
              <Circle ref={div8Ref} className="p-2 size-14">
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
            fromRef={div6Ref}
            toRef={div7Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW2_image}
            fromRef={div7Ref}
            toRef={div8Ref}
          />
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW3_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between items-center">
              <Circle ref={div9Ref}>
                <VideoCameraIcon />
              </Circle>
              <div className="flex flex-col justify-center gap-2">
                <Circle ref={div10Ref}>
                  <Image
                    src={"/stripe.webp"}
                    width={24}
                    height={24}
                    alt="Stripe"
                  />
                </Circle>
                <Circle ref={div11Ref}>
                  <Image
                    src={"/buymeacoffee.webp"}
                    width={24}
                    height={24}
                    alt="Buy me a coffee"
                  />
                </Circle>
                <Circle ref={div12Ref}>
                  <Image
                    src={"/kofi.webp"}
                    width={24}
                    height={24}
                    alt="Ko-Fi"
                  />
                </Circle>
              </div>
              <Circle ref={div13Ref} className="p-2 size-14">
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
            containerRef={sectionHIW3_image}
            fromRef={div9Ref}
            toRef={div10Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={div9Ref}
            toRef={div11Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={div9Ref}
            toRef={div12Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={div11Ref}
            toRef={div13Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={div12Ref}
            toRef={div13Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW3_image}
            fromRef={div10Ref}
            toRef={div13Ref}
          />
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
              <Circle ref={div14Ref} className="p-2 size-14">
                <Image
                  src={"/favicon.ico"}
                  width={32}
                  height={32}
                  alt="Alertbox.org"
                />
              </Circle>
              <Circle ref={div15Ref} className="p-2 size-14">
                <Image
                  src={"/obs.webp"}
                  width={32}
                  height={32}
                  alt="OBS Studio"
                />
              </Circle>
            </div>
          </div>
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW5_image}
            fromRef={div14Ref}
            toRef={div15Ref}
          />
        </div>
        <div
          className="w-full h-screen sticky top-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-black mask-t-from-80%"
          ref={sectionHIW6_image}
        >
          <div className="flex w-full flex-col items-stretch justify-between gap-10">
            <div className="flex flex-row justify-between items-center">
              <Circle ref={div1Ref}>
                <UserIcon />
              </Circle>
              <div className="flex flex-col justify-center gap-2">
                <Circle ref={div3Ref}>
                  <Image
                    src={"/stripe.webp"}
                    width={24}
                    height={24}
                    alt="Stripe"
                  />
                </Circle>
                <Circle ref={div4Ref}>
                  <Image
                    src={"/buymeacoffee.webp"}
                    width={24}
                    height={24}
                    alt="Buy me a coffee"
                  />
                </Circle>
                <Circle ref={div5Ref}>
                  <Image
                    src={"/kofi.webp"}
                    width={24}
                    height={24}
                    alt="Ko-Fi"
                  />
                </Circle>
              </div>
              <Circle ref={div2Ref} className="p-2 size-14">
                <Image
                  src={"/favicon.ico"}
                  width={32}
                  height={32}
                  alt="Alertbox.org"
                />
              </Circle>
              <Circle ref={div16Ref} className="p-2 size-14">
                <Image
                  src={"/obs.webp"}
                  width={32}
                  height={32}
                  alt="OBS Studio"
                />
              </Circle>
            </div>
          </div>
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={div1Ref}
            toRef={div3Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={div1Ref}
            toRef={div4Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={div1Ref}
            toRef={div5Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={div3Ref}
            toRef={div2Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={div4Ref}
            toRef={div2Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={div5Ref}
            toRef={div2Ref}
          />
          <AnimatedBeam
            duration={3}
            containerRef={sectionHIW6_image}
            fromRef={div2Ref}
            toRef={div16Ref}
          />
        </div>
      </div>
    </div>
  );
}

export default HowItWorkStreamer;
