"use client";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import {
  DiscordLogoIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useStore } from "zustand";
import Link from "next/link";
import { Google, Streamlabs } from "@thesvg/react";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { UndrawBiometricLogin } from "@/components/svg";
import { BellRing } from "@/components/animate-ui/icons/bell-ring";
import GradientASCII from "@/components/effects/gradient-ascii";

function Login() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <div className="min-h-[calc(100dvh-4rem-var(--status-banner-height,0))] relative flex p-2.5 items-center bg-foreground/5">
      <div className="absolute inset-0">
        <GradientASCII
          colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
          shape="horizon"
          characters=" .·•●"
          cellSize={8}
          density={0}
          glyphOpacity={0}
          glow={0}
          depthOfField={0}
          flicker={0.2}
          softness={0.5}
          scale={1}
          flow={1}
          speed={1}
          gradientOpacity={0.91}
          grain={0.08}
          variation={10}
          mouseInteraction={false}
          scrambleRadius={0.1}
          clickEffect="none"
          intro
          lightMode={false}
        />
      </div>
      <div className="m-auto flex justify-center items-center gap-12 flex-1 min-w-0 h-[calc(100dvh-4rem-var(--status-banner-height,0))] mt-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="flex flex-col gap-1.5 md:max-w-82 md:py-16 max-md:mt-auto max-md:mb-12"
        >
          <motion.div className="flex flex-col z-10 w-full">
            <h1 className="font-medium text-5xl mb-3">
              {lang.data.app.login.title}
            </h1>
            <p className="font-sans tracking-wider text-sm text-foreground/40 mb-3">
              {lang.data.app.login.description}
            </p>
            <Alert className="mx-auto mt-1 -mb-1 text-[13px] rounded-xl border-2 bg-foreground/5 border-foreground/5 p-3 backdrop-blur-xl select-none pointer-events-none">
              <BellRing animate="default" loop loopDelay={1} className={"size-5 mb-1"} />
              <strong className="font-medium">
                {lang.data.app.login.beta.title}
              </strong>
              <p className="font-baijamjuree text-[11px] text-foreground/60">
                {lang.data.app.login.beta.description}
              </p>
            </Alert>
            <div className="my-6 w-full flex flex-col gap-1">
              <Link href={"/app/login/discord"}>
                <Button className={"w-full p-6 rounded-t-2xl rounded-b-sm"}>
                  <DiscordLogoIcon weight="fill" />
                  {lang.data.app.login.methods.discord}
                </Button>
              </Link>
              <Button
                disabled
                variant={"outline"}
                className={"w-full p-6 border-2 rounded-sm"}
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
                className={"w-full p-6 border-2 rounded-t-sm rounded-b-2xl"}
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
        <motion.div className="m-6 max-md:hidden">
          <UndrawBiometricLogin className="size-72" />
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
