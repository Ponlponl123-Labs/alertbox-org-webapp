"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import SplitText from "@/components/SplitText";
import { gsap } from "gsap";
import { Input } from "react-smooth-input";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { useUserContext } from "@/contexts/user";

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
  const { userInfo } = useUserContext();
  const isDark = useStore(coreStore, (s) => s.isDark);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
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
            className="text-5xl font-medium text-center"
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
        <div className="absolute w-full flex flex-col max-w-sm lg:max-w-lg xl:max-w-2xl">
          <h1
            ref={content2H1Ref}
            className="text-3xl tracking-wide font-medium opacity-0"
          >
            Everyone should call you...
          </h1>
          <p ref={content2PRef} className="text-sm text-muted-foreground tracking-wide opacity-0 mt-1 mb-4">
            You can change this later
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
          <div ref={content4Ref} className="opacity-0 mt-4 flex items-center justify-end w-full">
            <LiquidButton className="rounded-xl py-3 px-6 h-max [--liquid-button-background-color:var(--muted)] [--liquid-button-color:var(--primary)] hover:text-primary-foreground">
              Let&apos;s go
            </LiquidButton>
          </div>
        </div>
      </div>

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
  );
}