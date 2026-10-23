"use client";

import { useRef } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import SplitText from "@/components/SplitText";
import { gsap } from "gsap";

interface WelcomeStepProps {
  onComplete?: () => void;
}

export default function WelcomeStep({ onComplete }: WelcomeStepProps) {
  const isDark = useStore(coreStore, (s) => s.isDark);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);

  const handleSplitComplete = () => {
    if (splitRef.current) {
      gsap.to(splitRef.current, {
        scale: 0.95,
        opacity: 0.26,
        filter: "blur(4px)",
        duration: 0.8,
        ease: "power2.out",
      });
    }
    if (!h1Ref.current) return;
    gsap.fromTo(
      h1Ref.current,
      { opacity: 0, y: 20, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }
    );
    gsap.to(splitRef.current, {
      opacity: 0,
      y: -20,
      filter: "blur(6px)",
      duration: 1,
      ease: "power3.out",
      delay: 2,
    });
    gsap.to(h1Ref.current, {
      opacity: 0,
      y: -20,
      filter: "blur(6px)",
      duration: 1,
      ease: "power3.out",
      delay: 2.1,
      onComplete: () => {
        onComplete?.();
      },
    });
  };

  return (
    <div className="absolute pointer-events-none">
      <div ref={splitRef} className="origin-center will-change-transform">
        <SplitText
          text="The best workspace for you"
          className="text-4xl font-medium text-center overflow-visible"
          effect="blur"
          color={isDark ? "#ffffff" : "#000000"}
          accentColor="#f43f5e"
          from={{
            x: 24,
            opacity: 0,
            filter: "blur(6px)",
          }}
          to={{
            x: 0,
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
      <h1 ref={h1Ref} className="text-5xl font-medium text-center opacity-0 -mt-2">
        was Here!
      </h1>
    </div>
  );
}
