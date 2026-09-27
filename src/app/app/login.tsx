"use client";
import { useEffect, useMemo, useState } from "react";
import MorphSlider, { MorphItem } from "@/components/MorphSlider";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import {
  ArrowUpRightIcon,
  CraneIcon,
  DiscordLogoIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useStore } from "zustand";
import Link from "next/link";
import { Google, Streamlabs } from "@thesvg/react";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

interface ApodData {
  title: string;
  url: string;
  hdurl?: string;
  date: string;
  explanation: string;
  copyright?: string;
  credit?: string;
  media_type?: string;
  permalink?: string;
}

const stripHtml = (html?: string) => (html ? html.replace(/<[^>]*>?/gm, "").trim() : "");

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: "blur(4px)",
    transition: { duration: 0.25 },
  },
};

function ApodDisplay() {
  const [apod, setApod] = useState<ApodData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let ignore = false;
    const key = `nasa_apod_${new Date().toISOString().slice(0, 10)}`;

    const loadApod = async () => {
      await Promise.resolve();
      try {
        const cached = sessionStorage.getItem(key);
        if (cached) {
          if (!ignore) {
            setApod(JSON.parse(cached));
            setIsLoading(false);
          }
          return;
        }

        const res = await fetch("https://science.nasa.gov/wp-json/wp/v2/apod-basic");
        const data = res.ok ? await res.json() : null;
        if (!ignore && Array.isArray(data)) {
          setApod(data);
          sessionStorage.setItem(key, JSON.stringify(data));
        }
      } catch { } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadApod();
    return () => {
      ignore = true;
    };
  }, []);

  const validItems = useMemo(() => {
    if (!apod || !Array.isArray(apod)) return [];
    return apod.filter((item) => item.hdurl || item.url);
  }, [apod]);

  const sliderItems = useMemo<MorphItem[]>(() => {
    return validItems.map((item) => ({
      image: item.hdurl || item.url,
      caption: item.title,
    }));
  }, [validItems]);

  const current = validItems[currentIndex] || validItems[0];
  const cleanCredit = stripHtml(current?.copyright || current?.credit) || "NASA";
  const cleanExplanation = stripHtml(current?.explanation).replace(/^Explanation:\s*/i, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col relative overflow-hidden md:max-w-2xl 2xl:max-w-3xl h-full flex-1 min-w-0 bg-foreground/10 md:rounded-4xl md:border md:border-foreground/10"
    >
      {isLoading || sliderItems.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-foreground/40 text-xs">
          Loading NASA APOD...
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <MorphSlider
            items={sliderItems}
            startIndex={0}
            autoplay={true}
            autoplayDelay={6}
            transition="melt"
            showCaptions={false}
            showControls={true}
            controlsOnHover={true}
            isHovered={isHovered}
            showIndicators={false}
            onIndexChange={setCurrentIndex}
            radius={0}
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      <motion.div
        animate={{ height: isHovered ? 240 : 130 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        className="absolute inset-x-0 bottom-0 backdrop-blur-xl pointer-events-none md:rounded-b-4xl max-md:h-full!"
        style={{
          maskImage: "linear-gradient(to top, black 30%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 30%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-white via-white/60 dark:from-black/90 dark:via-black/40 to-transparent pointer-events-none" />

      {current && (
        <div className="relative mt-auto p-6 z-10 w-full pointer-events-none max-md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.title || currentIndex}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-1.5 w-full text-foreground pointer-events-auto"
            >
              <motion.div variants={staggerItem} className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-foreground/15 text-foreground backdrop-blur-md text-[10px] rounded-md tracking-wider uppercase"
                >
                  NASA APOD
                </Badge>
                {current.date && (
                  <span className="text-[11px] text-foreground/70 font-mono">
                    {current.date}
                  </span>
                )}
              </motion.div>

              {current.title && (
                <motion.h2
                  variants={staggerItem}
                  className="text-xs font-medium tracking-wide text-foreground/90 drop-shadow-sm line-clamp-1"
                >
                  {current.title}
                </motion.h2>
              )}

              <AnimatePresence>
                {isHovered && cleanExplanation && (
                  <motion.p
                    initial={{ height: 0, opacity: 0, filter: "blur(6px)", marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, filter: "blur(0px)", marginTop: 2 }}
                    exit={{ height: 0, opacity: 0, filter: "blur(4px)", marginTop: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
                    className="text-[11px] text-foreground/70 line-clamp-3 leading-relaxed overflow-hidden"
                  >
                    {cleanExplanation}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.div
                variants={staggerItem}
                className="flex items-center justify-between text-[11px] text-foreground/60 pt-2 border-t border-foreground/10 mt-1"
              >
                <span className="truncate max-w-[75%]">
                  Credit: {cleanCredit}
                </span>
                <a
                  href={current.permalink || "https://science.nasa.gov/apod"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  science.nasa.gov
                  <ArrowUpRightIcon size={12} />
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function Login() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <div className="min-h-[calc(100dvh-4rem-var(--status-banner-height,0))] relative flex p-2.5 items-center">
      <div className="m-auto flex gap-1.5 flex-1 min-w-0 h-[calc(100dvh-4rem-var(--status-banner-height,0))] mt-10">
        <div className="absolute inset-0 max-md:pointer-events-none md:contents">
          <ApodDisplay />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="flex flex-col gap-1.5 md:max-w-92 md:py-16 flex-1 min-w-0 m-auto max-md:mb-6"
        >
          <motion.div className="p-6 text-center flex flex-col z-10 w-full">
            <RocketLaunchIcon className="mx-auto my-3" size={48} />
            <h1 className="font-semibold tracking-widest text-xl hidden">
              {lang.data.app.login.title}
            </h1>
            <p className="font-sans tracking-wider text-xs text-foreground/40 mb-3">
              {lang.data.app.login.description}
            </p>
            <Alert className="mx-auto mt-1 -mb-1 text-[13px] rounded-xl border-2 bg-foreground/5 border-foreground/5 p-3 backdrop-blur-xl select-none pointer-events-none">
              <CraneIcon weight="fill" />
              <strong className="font-medium">
                {lang.data.app.login.beta.title}
              </strong>
              <p className="font-baijamjuree text-[11px] text-foreground/60">
                {lang.data.app.login.beta.description}
              </p>
            </Alert>
            <div className="my-6 w-full flex flex-col gap-1">
              <Link href={"/app/login/discord"}>
                <Button className={"w-full p-5 rounded-t-2xl  rounded-b-sm"}>
                  <DiscordLogoIcon weight="fill" />
                  {lang.data.app.login.methods.discord}
                </Button>
              </Link>
              <Button
                disabled
                variant={"outline"}
                className={"w-full p-5 rounded-sm"}
              >
                <Google className="size-4" />
                {lang.data.app.login.methods.google}
                <Badge variant={"secondary"} className="rounded-sm text-xs">
                  {lang.data.common.comming_soon}
                </Badge>
              </Button>
              <Button
                disabled
                variant={"outline"}
                className={"w-full p-5 rounded-t-sm rounded-b-2xl"}
              >
                <Streamlabs className="size-4" />
                {lang.data.app.login.methods.streamlabs}
                <Badge variant={"secondary"} className="rounded-sm text-xs">
                  {lang.data.common.comming_soon}
                </Badge>
              </Button>
            </div>
            <span className="text-[10px] text-foreground/40 mt-3 tracking-wider">
              {lang.data.app.login.disclaimer}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
