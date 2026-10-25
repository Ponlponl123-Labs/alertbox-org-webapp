"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { orgStore } from "@/hooks/store/org";
import type { Streamer } from "@/types/user.types";
import SplitText from "@/components/SplitText";
import { gsap } from "gsap";
import { Input } from "react-smooth-input";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { useUserContext } from "@/contexts/user";
import { AnimatePresence, motion } from "motion/react";
import { CheckmarkCircle02 } from "@/components/animate-ui/icons/hugeicons/checkmark-circle-02";
import { CircleX } from "@/components/animate-ui/icons/hugeicons/circle-x";
import { getApiUrl } from "@/lib/api";
import { Loading03 } from "@/components/animate-ui/icons/hugeicons/loading-03";
import { cn } from "@/lib/utils";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import { toast } from "@/components/custom-ui/toast";
import { ShimmeringText } from "@animate-ui/react/primitives/texts/shimmering";

const availabilityCache = new Map<string, "available" | "taken">();
const RESERVED_NAMES = new Set([
  "admin", "administrator", "system", "alertbox", "tip-to", "tipto", "support",
  "help", "api", "auth", "login", "logout", "signin", "signup", "register",
  "account", "profile", "settings", "config", "root", "security", "legal",
  "terms", "privacy", "about", "contact", "blog", "dev", "developer", "docs",
  "status", "mail", "email", "webmaster", "hostmaster", "postmaster"
]);

interface CreateStepProps {
  onComplete?: () => void;
}

const MOCK_PROFILES = [
  {
    name: "Dear-zero-one",
    handle: "@dearzenone",
    role: "YouTube Streamer",
    avatar: "/promoted/avatar/dearzenone.png",
    bio: "Chill gaming & late night streams",
    accent: "#f43f5e",
    cls: "-translate-x-64 sm:-translate-x-88 lg:-translate-x-[28rem] xl:-translate-x-[34rem] -translate-y-40 sm:-translate-y-44 lg:-translate-y-56 xl:-translate-y-64",
    rotZ: -3,
  },
  {
    name: "Petekung",
    handle: "@petekung",
    role: "Content Creator",
    avatar: "/promoted/avatar/petekung.png",
    bio: "Legend of Youtuber (torn niee..)",
    accent: "#6366f1",
    cls: "translate-x-64 sm:translate-x-88 lg:translate-x-[28rem] xl:translate-x-[34rem] -translate-y-36 sm:-translate-y-40 lg:-translate-y-52 xl:-translate-y-60",
    rotZ: 3,
  },
  {
    name: "P'Pong",
    handle: "@banpong",
    role: "Studio Lead",
    avatar: "/promoted/avatar/banpong.png",
    bio: "I love Cactus & creative art",
    accent: "#10b981",
    cls: "-translate-x-60 sm:-translate-x-80 lg:-translate-x-[26rem] xl:-translate-x-[32rem] translate-y-40 sm:translate-y-44 lg:translate-y-56 xl:translate-y-64",
    rotZ: 2,
  },
  {
    name: "Ponlponl123",
    handle: "@ponlponl123",
    role: "Developer",
    avatar: "/promoted/avatar/ponlponl123-osu-avatar.png",
    bio: "Building AlertBox.org for everyone",
    accent: "#3b82f6",
    cls: "translate-x-60 sm:translate-x-80 lg:translate-x-[26rem] xl:translate-x-[32rem] translate-y-36 sm:translate-y-40 lg:translate-y-52 xl:translate-y-60",
    rotZ: -2,
  },
];

const fromTo = {
  y: 8,
  opacity: 0,
  filter: "blur(6px)",
}

const to = {
  y: 0,
  opacity: 1,
  filter: "blur(0px)",
}

export default function CreateStep({ onComplete }: CreateStepProps) {
  const router = useRouter();
  const { authFetch, activeOrg, userInfo, addStreamer } = useUserContext();
  const isDark = useStore(coreStore, (s) => s.isDark);
  const [step, setStep] = useState<number>(0);
  const [channelDisplayName, setChannelDisplayName] = useState<string>("");
  const [isChannelCreated, setIsChannelCreated] = useState<boolean>(false);
  const [serverResChannel, setServerResChannel] = useState<Streamer | null>(null);
  const channelHandle = channelDisplayName
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  const [queriedResult, setQueriedResult] = useState<{ handle: string; status: "available" | "taken" } | null>(null);

  const handleStatus: "idle" | "checking" | "available" | "taken" = !channelHandle
    ? "idle"
    : RESERVED_NAMES.has(channelHandle) || !/^[a-z0-9_-]+$/.test(channelHandle) || channelHandle.length > 50
      ? "taken"
      : availabilityCache.get(channelHandle) ?? (queriedResult?.handle === channelHandle ? queriedResult.status : "checking");

  useEffect(() => {
    if (!channelHandle || RESERVED_NAMES.has(channelHandle) || !/^[a-z0-9_-]+$/.test(channelHandle) || channelHandle.length > 50) return;
    if (availabilityCache.has(channelHandle)) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(getApiUrl(`/api/v1/org/streamers/check-username/${encodeURIComponent(channelHandle)}`), {
          signal: controller.signal,
        });
        const status = res.ok ? "available" : "taken";
        availabilityCache.set(channelHandle, status);
        setQueriedResult({ handle: channelHandle, status });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [channelHandle]);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const split1Ref = useRef<HTMLDivElement>(null);
  const split2Ref = useRef<HTMLDivElement>(null);
  const split3Ref = useRef<HTMLDivElement>(null);
  const content2Ref = useRef<HTMLDivElement>(null);
  const content2H1Ref = useRef<HTMLDivElement>(null);
  const content2PRef = useRef<HTMLDivElement>(null);
  const content3Ref = useRef<HTMLDivElement>(null);
  const content4Ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const parallaxWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isInteractiveRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInteractiveRef.current) return;

      const normX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: -normX * 6,
          y: -normY * 6,
          duration: 1.0,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      parallaxWrappersRef.current.forEach((wrapper, i) => {
        if (!wrapper) return;
        const depth = (i % 2 === 0 ? 1 : 1.2) * 8;
        gsap.to(wrapper, {
          x: normX * depth,
          y: normY * depth,
          duration: 1.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSplitComplete = () => {
    if (splitRef.current) {
      gsap.to(splitRef.current, {
        scale: 0.94,
        opacity: 0,
        filter: "blur(3px)",
        duration: 0.9,
        ease: "expo.out",
      });
      gsap.fromTo(content2H1Ref.current, { ...fromTo, delay: 4 }, to);
      gsap.fromTo(content2PRef.current, { ...fromTo, delay: 4.2 }, to);
      gsap.fromTo(content3Ref.current, { ...fromTo, delay: 4.4 }, to);
      gsap.fromTo(content4Ref.current, { ...fromTo, delay: 4.6 }, to);
    }

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const p = MOCK_PROFILES[i];

      const pullToCenterX = (i % 2 === 0 ? 1 : -1) * 160;
      const pullToCenterY = (i < 2 ? 1 : -1) * 100;
      const startRotZ = (i % 2 === 0 ? -1 : 1) * 8;

      gsap.fromTo(
        card,
        {
          x: pullToCenterX,
          y: pullToCenterY,
          scale: 0.85,
          rotateZ: p.rotZ + startRotZ,
          opacity: 0,
          filter: "blur(6px)",
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          rotateZ: p.rotZ,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.4,
          delay: 0.1 + i * 0.15,
          ease: "expo.out",
          onComplete: () => {
            if (i === MOCK_PROFILES.length - 1) {
              isInteractiveRef.current = true;
            }
            gsap.to(card, {
              y: `+=${i % 2 === 0 ? 6 : -6}`,
              rotateZ: `+=${i % 2 === 0 ? 0.6 : -0.6}`,
              duration: 3 + i * 0.4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          },
        }
      );
    });
  };
  const handleSplitComplete1 = () => {
    gsap.delayedCall(1.2, () => {
      const chars = split1Ref.current?.querySelectorAll(".split-char");
      const targets = chars && chars.length > 0 ? chars : split1Ref.current;
      gsap.to(targets, {
        opacity: 0,
        y: -24,
        filter: "blur(8px)",
        duration: 0.5,
        stagger: { each: 0.02, from: "start" },
        ease: "power2.in",
        onComplete: () => {
          setStep(2);
        },
      });
    });
  }
  const handleSplitComplete2 = () => {
    gsap.delayedCall(1.2, () => {
      const chars = split2Ref.current?.querySelectorAll(".split-char");
      const targets = chars && chars.length > 0 ? chars : split2Ref.current;
      gsap.to(targets, {
        opacity: 0,
        y: -24,
        filter: "blur(8px)",
        duration: 0.5,
        stagger: { each: 0.02, from: "start" },
        ease: "power2.in",
        onComplete: () => {
          setStep(3);
        },
      });
    });
  }
  const handleSplitComplete3 = () => {
    gsap.delayedCall(1.2, () => {
      setStep(4);

      setTimeout(() => {
        if (isChannelCreated && serverResChannel && activeOrg) {
          setStep(5);

          toast.success(`Channel "${serverResChannel.displayName}" created!`);
          orgStore.getState().setActiveOrgId(String(activeOrg.id));
          orgStore.getState().setActiveStreamerId(String(serverResChannel.id));
          orgStore.getState().setOrgMode(false);

          const orgKey = activeOrg.slug || activeOrg.id;
          const targetUrl = `/app/${orgKey}/${serverResChannel.name || serverResChannel.id}`;

          setTimeout(() => {
            gsap.to(containerRef.current, {
              opacity: 0,
              y: -64,
              filter: "blur(12px)",
              duration: 0.8,
              ease: "power2.inOut",
              onComplete: () => {
                setTimeout(() => {
                  router.push(targetUrl);
                }, 500)
              }
            })
          }, 1000)
        }
      }, 1000)
    });
  }

  const createChannelHandle = async () => {
    if (!authFetch || !activeOrg?.id || step !== 0 || handleStatus !== "available") return;
    setStep(1);

    try {
      const res = await authFetch(getApiUrl(`/api/v1/org/${activeOrg.id}/streamers`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: channelHandle,
          displayName: channelDisplayName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to create channel");
        setStep(0);
        return;
      }

      const created = await res.json();
      addStreamer(created as unknown as Streamer);
      setServerResChannel(created as unknown as Streamer);
      setIsChannelCreated(true);

      onComplete?.();
    } catch {
      toast.error("Network error while creating channel");
      setStep(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div
        ref={contentRef} className="absolute inset-0 flex items-center justify-center">
        <div
          ref={splitRef}
          className="origin-center will-change-transform z-10 pointer-events-none absolute"
        >
          <SplitText
            text="The new journey is coming.."
            className="text-5xl font-medium text-center overflow-visible"
            effect="blur"
            color={isDark ? "#ffffff" : "#000000"}
            accentColor="#f43f5e"
            from={{
              y: 8,
              opacity: 0,
              filter: "blur(6px)",
            }}
            to={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            }}
            splitType="chars"
            delay={45}
            duration={1.1}
            staggerFrom="start"
            loop={false}
            loopDelay={1.5}
            mask={false}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleSplitComplete}
          />
        </div>
        <AutoHeight id="content-step1" ref={content2Ref} className={cn(
          "absolute w-full flex flex-col max-w-sm lg:max-w-lg xl:max-w-2xl transition-all duration-500",
          step === 0 ? "opacity-100" : "opacity-0 blur-sm **:pointer-events-none"
        )}>
          <h1
            ref={content2H1Ref}
            className="text-4xl tracking-wide font-medium opacity-0"
          >
            Everyone should call you...
          </h1>
          <p ref={content2PRef} className="text-sm text-foreground/40 tracking-wide font-sans opacity-0 mt-1 mb-4">
            You can change this later <strong className="text-foreground/60 font-sans">but username cannot.</strong>
          </p>
          <div ref={content3Ref} className="opacity-0">
            <Input
              type="text"
              placeholder={userInfo?.displayName || userInfo?.name || "your name"}
              fontStyle={{
                fontFamily: "var(--font-sans)",
                fontWeight: "500",
                fontSize: "14px",
              }}
              disabled={step !== 0}
              value={channelDisplayName}
              onChange={(e) => setChannelDisplayName(e.target.value)}
              endContent={
                <div className="mr-3 flex items-center justify-center w-4.5 h-4.5">
                  <AnimatePresence mode="popLayout">
                    {handleStatus === "available" && (
                      <motion.div
                        key="available"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="text-emerald-500"
                      >
                        <CheckmarkCircle02 size={18} />
                      </motion.div>
                    )}
                    {handleStatus === "checking" && (
                      <motion.div
                        key="checking"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="text-foreground"
                      >
                        <Loading03 size={18} animate="default" />
                      </motion.div>
                    )}
                    {handleStatus === "taken" && (
                      <motion.div
                        key="taken"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="text-rose-500"
                      >
                        <CircleX size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              }
              customMotion={{
                char: {
                  initial: {
                    x: 3,
                    opacity: 0,
                    filter: "blur(6px)"
                  },
                  animate: {
                    x: 0,
                    opacity: 1,
                    filter: "blur(0px)"
                  }
                }
              }}
              className="w-full"
              classNames={{ base: "h-12 rounded-xl" }}
            />
          </div>
          <div ref={content4Ref} className="opacity-0 mt-4 flex justify-between w-full">
            <AnimatePresence mode="wait">
              {
                channelHandle &&
                <motion.span
                  initial={{
                    y: -6,
                    opacity: 0,
                    filter: "blur(6px)"
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)"
                  }}
                  key={"channel-handle"}
                  className="text-sm text-muted-foreground font-sans select-none">@{channelHandle}</motion.span>
              }
            </AnimatePresence>
            <div />
            <AnimatePresence mode="wait">
              {
                step == 0 &&
                <motion.div
                  key="lets-go-button"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(3px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(3px)" }}
                  transition={{ duration: 0.15 }}
                >
                  <LiquidButton
                    onClick={() => createChannelHandle()}
                    disabled={handleStatus !== "available"}
                    className="rounded-xl py-3 px-6 h-max [--liquid-button-background-color:var(--muted)] [--liquid-button-color:var(--primary)] hover:text-primary-foreground">
                    Let&apos;s go
                  </LiquidButton>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </AutoHeight>
        {
          step != 0 && <motion.div className="absolute inset-0 flex flex-col items-center justify-center">
            <AutoHeight>
              <div className="flex flex-col items-center justify-center pointer-events-none select-none">
                {
                  step == 1 && <div
                    className="origin-center will-change-transform z-10 absolute pointer-events-none select-none"
                    ref={split1Ref}
                  >
                    <SplitText
                      text={"Hello " + channelDisplayName + "!"}
                      className="text-5xl font-medium text-center overflow-visible"
                      effect="blur"
                      color={isDark ? "#ffffff" : "#000000"}
                      accentColor="#f43f5e"
                      from={{
                        y: 8,
                        opacity: 0,
                        filter: "blur(6px)",
                      }}
                      to={{
                        y: 0,
                        opacity: 1,
                        filter: "blur(0px)",
                      }}
                      splitType="chars"
                      delay={45}
                      duration={1.1}
                      staggerFrom="start"
                      loop={false}
                      loopDelay={1.5}
                      mask={false}
                      threshold={0.1}
                      rootMargin="-100px"
                      textAlign="center"
                      onLetterAnimationComplete={handleSplitComplete1}
                    />
                  </div>
                }
                {
                  step == 2 && <div
                    className="origin-center will-change-transform z-10 absolute pointer-events-none select-none"
                    ref={split2Ref}
                  >
                    <SplitText
                      text={"Glad to see you here"}
                      className="text-5xl font-medium text-center overflow-visible"
                      effect="blur"
                      color={isDark ? "#ffffff" : "#000000"}
                      accentColor="#f43f5e"
                      from={{
                        y: 8,
                        opacity: 0,
                        filter: "blur(6px)",
                      }}
                      to={{
                        y: 0,
                        opacity: 1,
                        filter: "blur(0px)",
                      }}
                      splitType="chars"
                      delay={45}
                      duration={1.1}
                      staggerFrom="start"
                      loop={false}
                      loopDelay={1.5}
                      mask={false}
                      threshold={0.1}
                      rootMargin="-100px"
                      textAlign="center"
                      onLetterAnimationComplete={handleSplitComplete2}
                    />
                  </div>
                }
                {
                  (step == 3 || step == 4 || step == 5) && <div
                    className="origin-center will-change-transform z-10 absolute pointer-events-none select-none"
                    ref={split3Ref}
                  >
                    <SplitText
                      text={"Almost done..."}
                      className="text-5xl font-medium text-center overflow-visible"
                      effect="blur"
                      color={isDark ? "#ffffff" : "#000000"}
                      accentColor="#f43f5e"
                      from={{
                        y: 8,
                        opacity: 0,
                        filter: "blur(6px)",
                      }}
                      to={{
                        y: 0,
                        opacity: 1,
                        filter: "blur(0px)",
                      }}
                      splitType="chars"
                      delay={45}
                      duration={1.1}
                      staggerFrom="start"
                      loop={false}
                      loopDelay={1.5}
                      mask={false}
                      threshold={0.1}
                      rootMargin="-100px"
                      textAlign="center"
                      onLetterAnimationComplete={handleSplitComplete3}
                    />
                  </div>
                }
              </div>
              <AnimatePresence mode="popLayout">
                {
                  step == 4 && (
                    <motion.div
                      key="state2-processing"
                      initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      exit={{ opacity: 0, filter: "blur(10px)", y: -16 }}
                      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                      className="mt-6"
                    >
                      <ShimmeringText
                        wave={false}
                        color="var(--muted)"
                        shimmeringColor="var(--foreground)"
                        className="text-base font-sans tracking-wide my-6"
                        text="We're still working on"
                      />
                    </motion.div>
                  )
                }
                {
                  step === 5 && (
                    <motion.div
                      key="state2-redirect"
                      initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      exit={{ opacity: 0, filter: "blur(10px)", y: -16 }}
                      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                      className="mt-6"
                    >
                      <ShimmeringText
                        wave={false}
                        color="var(--muted)"
                        shimmeringColor="var(--foreground)"
                        className="text-base font-sans tracking-wide my-6"
                        text="Now let's bring you to the stage..."
                      />
                    </motion.div>
                  )
                }
              </AnimatePresence>
            </AutoHeight>
          </motion.div>
        }
      </div>

      <div className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none transition-all ease-out duration-500",
        step > 0 ? "scale-110 opacity-40 blur-md pointer-events-none" : step > 4 && "scale-150 opacity-0 blur-md pointer-events-none"
      )}>
        {MOCK_PROFILES.map((p, i) => (
          <div
            key={p.handle}
            className={`absolute select-none ${p.cls}`}
          >
            <div
              ref={(el) => {
                parallaxWrappersRef.current[i] = el;
              }}
            >
              <div
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                style={{
                  boxShadow: `0 20px 40px -15px ${p.accent}33`,
                }}
                className="group w-48 sm:w-52 lg:w-56 xl:w-60 rounded-2xl bg-card overflow-hidden flex flex-col text-left opacity-0 will-change-transform"
              >
                <div className="h-20 mask-b-from-0 w-full relative shrink-0 overflow-hidden">
                  <Image
                    src={p.avatar}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="size-full object-cover transition-transform duration-500"
                    unoptimized
                  />
                </div>

                <div className="px-3 -mt-5 flex items-end justify-between relative z-10">
                  <div
                    style={{ borderColor: p.accent }}
                    className="size-10 rounded-xl overflow-hidden ring-2 ring-card bg-card shrink-0 shadow-xs transition-transform duration-300"
                  >
                    <Image
                      src={p.avatar}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="p-3 pt-1.5 flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground truncate">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-medium truncate leading-none">
                    {p.handle}
                  </span>
                  <p className="text-[10px] text-muted-foreground/80 line-clamp-1 leading-snug mt-1">
                    {p.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}