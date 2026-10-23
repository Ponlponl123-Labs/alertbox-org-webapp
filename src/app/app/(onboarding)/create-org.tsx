"use client";

import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { orgStore } from "@/hooks/store/org";
import { toast } from "sonner";
import { useRef, useEffect, useState } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import SplitText from "@/components/SplitText";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import OrgOverviewPage from "../[org]/page";
import { AnimatePresence, motion } from "motion/react";
import { MorphingText } from "@animate-ui/react/primitives/texts/morphing";
import { Magnetic } from '@animate-ui/react/primitives/effects/magnetic';
import { ShimmeringText } from "@animate-ui/react/primitives/texts/shimmering";
import { Shine } from '@animate-ui/react/primitives/effects/shine';
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowRight01 } from "@/components/animate-ui/icons/hugeicons/arrow-right-01";
import { cn } from "@/lib/utils";

interface CreateStepProps {
  onComplete?: () => void;
}

export default function CreateStep({ onComplete }: CreateStepProps) {
  const router = useRouter();
  const { authFetch, patchUserInfo } = useUserContext();
  const isDark = useStore(coreStore, (s) => s.isDark);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [orgName, setOrgName] = useState("");
  const [isBuildingOrg, setIsBuildingOrg] = useState(false);
  const [isBuildingOrgState1, setIsBuildingOrgState1] = useState(false);
  const [isBuildingOrgState2, setIsBuildingOrgState2] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const content2Ref = useRef<HTMLDivElement>(null);
  const isInteractiveRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInteractiveRef.current) return;

      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
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
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (step === 1 && content2Ref.current) {
      gsap.fromTo(
        content2Ref.current,
        { opacity: 0, y: 64, filter: "blur(20px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
      );
    }
  }, [step]);

  const handleFirstComplete = () => {
    gsap.delayedCall(1.2, () => {
      const chars = splitRef.current?.querySelectorAll(".split-char");
      const targets = chars && chars.length > 0 ? chars : splitRef.current;
      gsap.to(targets, {
        opacity: 0,
        y: -24,
        filter: "blur(8px)",
        duration: 0.5,
        stagger: { each: 0.02, from: "start" },
        ease: "power2.in",
        onComplete: () => {
          setStep(1);
        },
      });
    });
  };

  const buildOrgHandle = async () => {
    if (!orgName.trim() || isBuildingOrg) return;
    setIsBuildingOrg(true);
    setIsBuildingOrgState1(true);

    try {
      const createReq = authFetch(getApiUrl("/api/v1/org"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName.trim(),
          type: "COMMUNITY",
        }),
      });

      await new Promise((r) => setTimeout(r, 1000));
      setIsBuildingOrgState2(true);

      const [res] = await Promise.all([
        createReq,
        new Promise((r) => setTimeout(r, 1200)),
      ]);

      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to create organization");
        setIsBuildingOrg(false);
        setIsBuildingOrgState1(false);
        setIsBuildingOrgState2(false);
        return;
      }

      const created = await res.json();
      toast.success(`Organization "${created.name}" created!`);

      const meRes = await authFetch(getApiUrl("/api/v1/me"));
      if (meRes.ok) {
        const freshUser = await meRes.json();
        patchUserInfo(freshUser);
        orgStore.getState().syncFromMemberships(freshUser.memberships);
        orgStore.getState().setActiveOrgId(String(created.id));
        orgStore.getState().setActiveStreamerId("org");
      }

      const orgSlug = created.slug || created.id;
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -24,
          filter: "blur(12px)",
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            router.push(`/app/${orgSlug}`);
          },
        });
      } else {
        router.push(`/app/${orgSlug}`);
      }
    } catch {
      toast.error("Network error while creating organization");
      setIsBuildingOrg(false);
      setIsBuildingOrgState1(false);
      setIsBuildingOrgState2(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div
        ref={contentRef} className="absolute inset-0 flex items-center justify-center">
        {step === 0 && (
          <div
            ref={splitRef}
            className="origin-center will-change-transform z-10 pointer-events-none absolute"
          >
            <SplitText
              text={"Show the world\nwhat you can do"}
              className="text-6xl font-medium text-center overflow-visible whitespace-pre-line"
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
              onLetterAnimationComplete={handleFirstComplete}
            />
          </div>
        )}
        {step === 1 && (
          <div ref={content2Ref} className="absolute w-full flex flex-col items-center opacity-0">
            <AnimatePresence mode="wait">
              {
                isBuildingOrgState1 ? (
                  <motion.div
                    key="state1-building"
                    initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(10px)", y: -16 }}
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                    className="mt-20"
                  >
                    <h1 className="text-5xl tracking-wide font-medium">Give me a couple minute...</h1>
                  </motion.div>
                ) : (
                  <motion.div
                    key="state1-naming"
                    initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(10px)", y: -16 }}
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                    className="mt-20"
                  >
                    <MorphingText className="text-5xl tracking-wide font-medium **:font-heading!" text={orgName.length >= 4 ? ["Perfect! Your team is ready"] : ["First, name your team"]} />
                  </motion.div>
                )
              }
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {
                isBuildingOrgState2 ? (
                  <motion.div
                    key="state2-building"
                    initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(10px)", y: -16 }}
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <ShimmeringText
                      wave={false}
                      color="var(--muted)"
                      shimmeringColor="var(--foreground)"
                      className="text-base font-sans tracking-wide my-6"
                      text="We're building your organization..."
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="state2-naming"
                    initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(10px)", y: -16 }}
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <p className="text-base text-muted-foreground font-sans tracking-wide my-6">
                      You can change this later
                    </p>
                  </motion.div>
                )
              }
            </AnimatePresence>
            <div className={cn(
              "overflow-hidden w-full h-[64dvh] mask-b-from-0% grayscale transition-all duration-300",
              isBuildingOrg && "**:pointer-events-none opacity-30 blur-[2px]"
            )}>
              <OrgOverviewPage demo={true} setName={(value: string) => setOrgName(value)} />
            </div>
            <div className="mt-4 flex items-center justify-end w-full">
              <AnimatePresence mode="wait">
                {
                  (!isBuildingOrg && orgName.length >= 4) && <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    className="absolute right-1/2 translate-x-1/2 bottom-2"
                  >
                    <Magnetic strength={0.02} range={640}>
                      <AnimateIcon animateOnHover>
                        <Shine asChild loop loopDelay={500}>
                          <Button onClick={() => buildOrgHandle()} className="rounded-xl py-3 px-6 h-max">
                            Go to <strong>{orgName}</strong>
                            <ArrowRight01 />
                          </Button>
                        </Shine>
                      </AnimateIcon>
                    </Magnetic>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}