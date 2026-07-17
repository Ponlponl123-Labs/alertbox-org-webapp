"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import LogoLoop from "@/components/LogoLoop";
import {
  BuyMeACoffee,
  FacebookLive,
  KoFi,
  Patreon,
  Streamlabs,
  Stripe,
  Twitch,
  Xendit,
  Youtube,
} from "@thesvg/react";
import { FeelFreePay } from "@/components/icons";
import clsx from "clsx";

const default_class =
  "not-hover:grayscale not-hover:opacity-30 text-foreground fill-foreground";

const techLogos = [
  {
    node: <Patreon className={clsx("size-8", default_class)} />,
    title: "Patreon",
  },
  {
    node: <KoFi className={clsx("size-8", default_class)} />,
    title: "KoFi",
  },
  {
    node: <BuyMeACoffee className={clsx("size-8", default_class)} />,
    title: "Buy Me A Coffee",
  },
  {
    node: <Stripe className={clsx("size-12", default_class)} />,
    title: "Stripe",
  },
  {
    node: <FeelFreePay className={clsx("size-8", default_class)} />,
    title: "FeelFreePay",
  },
  {
    node: <Xendit className={clsx("size-8", default_class)} />,
    title: "Xendit",
  },
  {
    node: <Streamlabs className={clsx("size-8", default_class)} />,
    title: "Streamlabs",
  },
  {
    node: <Twitch className={clsx("size-8", default_class)} />,
    title: "Twitch",
  },
  {
    node: <Youtube className={clsx("size-8", default_class)} />,
    title: "Youtube",
  },
  {
    node: <FacebookLive className={clsx("size-12", default_class)} />,
    title: "Facebook",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as never },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function SocialProof() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.social_proof;

  return (
    <section className="w-full max-w-[90vw] relative overflow-hidden">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-368 mx-auto flex flex-col items-center gap-8"
      >
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 w-full mask-r-from-90% mask-l-from-90%"
        >
          <LogoLoop
            logos={techLogos}
            speed={32}
            direction="left"
            gap={128}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="transparent"
            ariaLabel="Technology partners"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
