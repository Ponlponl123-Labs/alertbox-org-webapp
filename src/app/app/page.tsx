"use client";
import { useEffect, useState } from "react";
import { useStore } from "zustand";
import { useUserContext } from "@/contexts/user";
import { useRouter, useSearchParams } from "next/navigation";
import { orgStore, selectActiveOrg, selectActiveStreamer } from "@/hooks/store/org";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "motion/react";
import { WelcomeStep, JoinOrgStep, CreateOrgStep } from "./(onboarding)";

export type OnboardingStep = "welcome" | "join" | "create";

export default function WorkspaceZonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceZone = searchParams?.get("zone") === "true";

  const { userInfo, organizations } =
    useUserContext();
  const activeOrg = useStore(orgStore, selectActiveOrg);
  const activeStreamer = useStore(orgStore, selectActiveStreamer);
  const isOrgMode = useStore(orgStore, (s) => s.isOrgMode);
  const [step, setStep] = useState<OnboardingStep>("welcome");

  // Auto-redirect existing users with active organizations unless forceZone
  useEffect(() => {
    if (!userInfo) return;
    if (forceZone) return;
    if (!userInfo.memberships || userInfo.memberships.length === 0) return;
    if (!activeOrg) return;

    const orgKey = activeOrg.slug || activeOrg.id;
    if (isOrgMode || !activeStreamer) {
      router.replace(`/app/${orgKey}`);
    } else {
      const streamerKey = activeStreamer.name || activeStreamer.id;
      router.replace(`/app/${orgKey}/${streamerKey}`);
    }
  }, [userInfo, activeOrg, activeStreamer, isOrgMode, router, forceZone]);

  if (!userInfo) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  // If user has organizations and is being redirected
  if (!forceZone && organizations.length > 0 && activeOrg) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="bg-background absolute inset-0 pointer-events-none" />
      <motion.div
        className="flex-1 flex flex-col items-center justify-center min-h-dvh w-full gap-8 z-10">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <WelcomeStep key="welcome" onComplete={() => setStep("join")} />
          )}
          {step === "join" && (
            <JoinOrgStep key="join" />
          )}
          {step === "create" && (
            <CreateOrgStep key="create" />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
