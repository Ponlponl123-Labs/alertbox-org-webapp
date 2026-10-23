"use client";

import { useRef, useEffect, useState } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import SplitText from "@/components/SplitText";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimateIcon } from "@animate-ui/react/icons";
import { WandSparkles } from "@/components/animate-ui/icons/hugeicons/wand-sparkles";
import TearTicket from "@/components/TearTicket";
import { AnimatePresence, motion } from "motion/react";
import { Magnetic } from "@animate-ui/react/primitives/effects/magnetic";
import { ThumbsDown } from "@/components/animate-ui/icons/hugeicons/thumbs-down";
import { ShimmeringText } from "@animate-ui/react/primitives/texts/shimmering";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { orgStore } from "@/hooks/store/org";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface VerifiedOrgInfo {
  code: string;
  role: string;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string | null;
    avatar: string | null;
    banner?: string | null;
  };
  inviter: {
    name: string | null;
    avatar: string | null;
  };
}

interface CreateStepProps {
  onComplete?: () => void;
}

export default function CreateStep({ onComplete }: CreateStepProps) {
  const router = useRouter();
  const { authFetch, patchUserInfo } = useUserContext();
  const isDark = useStore(coreStore, (s) => s.isDark);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [isMorphed, setIsMorphed] = useState(false);
  const [isMarkAsUsed, setIsMarkAsUsed] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [verifiedInfo, setVerifiedInfo] = useState<VerifiedOrgInfo | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const split2Ref = useRef<HTMLDivElement>(null);
  const content2Ref = useRef<HTMLDivElement>(null);
  const content3Ref = useRef<HTMLDivElement>(null);
  const content4Ref = useRef<HTMLAnchorElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInteractiveRef = useRef(false);

  useEffect(() => {
    if (!verifiedInfo) return;
    const calculateTime = () => {
      const diff = new Date(verifiedInfo.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs.toString().padStart(2, "0")}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [verifiedInfo]);

  const handleVerify = async (code: string) => {
    if (code.length !== 8 || isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await authFetch(getApiUrl("/api/v1/org/invites/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Invalid or expired invitation code");
        setInvitationCode("");
        return;
      }

      const data: VerifiedOrgInfo = await res.json();
      setVerifiedInfo(data);
      setIsMarkAsUsed(false);
      setStep(3);
    } catch {
      toast.error("Network error verifying invitation code");
      setInvitationCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoin = async () => {
    if (!verifiedInfo || isJoining) return;
    setIsJoining(true);
    try {
      const res = await authFetch(getApiUrl("/api/v1/org/invites/accept"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifiedInfo.code }),
      });

      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to accept invitation");
        setIsJoining(false);
        setIsMarkAsUsed(false);
        return;
      }

      const joinResult = await res.json();
      toast.success(`Joined ${joinResult.orgName} successfully!`);

      const meRes = await authFetch(getApiUrl("/api/v1/me"));
      if (meRes.ok) {
        const freshUser = await meRes.json();
        patchUserInfo(freshUser);
        orgStore.getState().syncFromMemberships(freshUser.memberships);
        orgStore.getState().setActiveOrgId(joinResult.orgId);
        orgStore.getState().setActiveStreamerId("org");
      }

      const targetSlug = joinResult.orgSlug || joinResult.orgId;
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -24,
          filter: "blur(12px)",
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            if (onComplete) onComplete();
            router.push(`/app/${targetSlug}`);
          },
        });
      } else {
        if (onComplete) onComplete();
        router.push(`/app/${targetSlug}`);
      }
    } catch {
      toast.error("Network error joining organization");
      setIsJoining(false);
      setIsMarkAsUsed(false);
    }
  };

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

  const handleSecondComplete = () => {
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
          setStep(2);
        },
      });
    });
  };

  const handleThirdComplete = () => {
    setIsMorphed(true);

    const tl = gsap.timeline({
      onComplete: () => {
        isInteractiveRef.current = true;
      },
    });

    tl.fromTo(
      content2Ref.current,
      { opacity: 0, y: 8, filter: "blur(4px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
    )
      .fromTo(
        content3Ref.current,
        { opacity: 0, y: 10, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" },
        "-=0.2"
      )
      .fromTo(
        content4Ref.current,
        { opacity: 0, y: 8, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div
        ref={contentRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        {step === 0 && (
          <div
            ref={splitRef}
            className="origin-center will-change-transform z-10 pointer-events-none absolute text-center"
          >
            <SplitText
              text={"We're moved\nto new home"}
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
          <div
            ref={split2Ref}
            className="origin-center will-change-transform z-10 pointer-events-none absolute text-center"
          >
            <SplitText
              text={"Work together\nAlways better"}
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
              onLetterAnimationComplete={handleSecondComplete}
            />
          </div>
        )}

        {(step === 2 || step === 3) && (
          <div className={cn(
            "absolute items-center flex flex-col justify-center gap-3 transition-all duration-1000",
            step === 3 && "scale-95 opacity-40 pointer-events-none blur-xs"
          )}>
            <div
              className={cn(
                "flex flex-col items-center justify-center text-center p-6 sm:p-8 lg:p-12 xl:p-16 gap-12 rounded-3xl transition-all duration-700 pointer-events-auto",
                isMorphed
                  ? "bg-card/75 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/10 dark:shadow-black/40"
                  : "bg-transparent border border-transparent shadow-none"
              )}
            >
              <div className="overflow-visible">
                <SplitText
                  text="Enter the invitation code"
                  className="text-3xl tracking-wide font-medium overflow-visible"
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
                  textAlign="left"
                  onLetterAnimationComplete={handleThirdComplete}
                />
              </div>
              <div ref={content2Ref} className="opacity-0 flex flex-col items-center gap-2">
                <InputOTP
                  maxLength={8}
                  pattern={REGEXP_ONLY_DIGITS}
                  placeholder="xxxxxxxx"
                  value={invitationCode}
                  disabled={isVerifying}
                  onChange={(value) => setInvitationCode(value)}
                  onComplete={(code) => {
                    handleVerify(code);
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                    <InputOTPSlot index={1} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                    <InputOTPSlot index={2} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                    <InputOTPSlot index={3} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-2" />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                    <InputOTPSlot index={5} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                    <InputOTPSlot index={6} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                    <InputOTPSlot index={7} className="p-4 border-none bg-transparent! shadow-none text-lg" />
                  </InputOTPGroup>
                </InputOTP>
                {isVerifying && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Spinner className="size-3.5" />
                    <span>Verifying code...</span>
                  </div>
                )}
              </div>
              <p
                ref={content3Ref}
                className="text-sm text-muted-foreground tracking-wide opacity-0 mt-1 mb-4 max-w-md font-sans"
              >
                No invite code? You should ask your organization admin to create one for you or create your own workspace!
              </p>
            </div>
            <Link href="/app/org/create" ref={content4Ref} className="opacity-0">
              <AnimateIcon animateOnHover>
                <Button variant={"ghost"} className={"rounded-xl"}>
                  <WandSparkles className="mr-2 h-4 w-4" />
                  Create my own workspace
                </Button>
              </AnimateIcon>
            </Link>
          </div>
        )}
        <AnimatePresence mode="wait">
          {step === 3 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -32 }}
                key={"tutorial"}
                className="absolute right-1/2 translate-x-1/2 top-6"
              >
                <ShimmeringText
                  text={isJoining ? "Joining workspace..." : "Tear the ticket to join"}
                  color="var(--muted)"
                  shimmeringColor="var(--muted-foreground)"
                  className="text-sm font-medium pointer-events-none"
                />
              </motion.div>
              <motion.div
                key={"ticket"}
                initial={{ opacity: 0, scale: 0.8, y: "100%", rotate: -25 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: "100%", rotate: -25 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <TearTicket
                  main={
                    <div className="w-full h-full bg-black/60 relative overflow-hidden flex items-center justify-center">
                      {(verifiedInfo?.organization?.banner || verifiedInfo?.organization?.avatar) ? (
                        <Image
                          src={verifiedInfo.organization.banner || verifiedInfo.organization.avatar!}
                          alt={verifiedInfo.organization.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                  }
                  stub={
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-semibold font-sans">Admit</h3>
                      <div className="flex justify-between mt-auto items-center">
                        <p className="text-sm font-sans mt-auto text-muted-foreground capitalize">
                          {verifiedInfo?.role?.toLowerCase() || "Member"} {timeLeft ? `· ${timeLeft}` : ""}
                        </p>
                        <span className="text-xs font-sans text-muted-foreground">
                          No. {invitationCode.slice(0, 4)}-{invitationCode.slice(4, 8)}
                        </span>
                      </div>
                    </div>
                  }
                  orientation="vertical"
                  scrim={false}
                  imageRadius={8}
                  onTear={() => {
                    setIsMarkAsUsed(true);
                    handleJoin();
                  }}
                  width={320}
                  height={360}
                  stubSize={100}
                  radius={16}
                  holes={12}
                  holeSize={6}
                  notch={9}
                  roughness={0}
                  tearAngle={30}
                  stretch={30}
                  resistance={0.45}
                  rotate={4}
                  tilt
                  tiltMax={9}
                  tiltReach={260}
                  parallax={3}
                  perspective={1000}
                  background="#27272a"
                  color="#f5f5f5"
                  recenter
                >
                  <div className="inset-0 p-6 pt-38 absolute flex flex-col">
                    <h1 className="text-xl font-semibold font-sans truncate">
                      {verifiedInfo?.organization?.name || "Workspace"}
                    </h1>
                    <p className="text-xs font-sans mt-2 text-muted-foreground">
                      Bring a small idea. Leave with a little momentum.
                    </p>
                    <span className="text-xs font-sans mt-auto text-muted-foreground">
                      You got invited by{" "}
                      <span className="text-white font-medium">
                        {verifiedInfo?.inviter?.name || "an Admin"}
                      </span>
                    </span>
                  </div>
                </TearTicket>
              </motion.div>
              {
                !isMarkAsUsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    key={"reject"}
                    className="absolute right-1/2 translate-x-1/2 bottom-2"
                  >
                    <Magnetic strength={0.02} range={640}>
                      <AnimateIcon animateOnHover>
                        <Button
                          disabled={isJoining}
                          onClick={() => {
                            setStep(2);
                            setInvitationCode("");
                            setVerifiedInfo(null);
                          }}
                          className="rounded-xl py-3 px-6 h-max font-medium gap-3"
                        >
                          <ThumbsDown />
                          Reject
                        </Button>
                      </AnimateIcon>
                    </Magnetic>
                  </motion.div>
                )
              }
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}