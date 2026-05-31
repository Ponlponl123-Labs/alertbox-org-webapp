"use client";
import LightPillar from "@/components/LightPillar";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import { DiscordLogoIcon, WarningIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useStore } from "zustand";
import Link from "next/link";

function Login() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <div className="min-h-screen relative flex flex-col p-6 pb-16 items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.4 }}
        className="absolute top-0 left-0 size-full"
      >
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="m-auto flex flex-col gap-3 max-w-92"
      >
        <motion.div className="p-6 bg-background/60 text-center flex flex-col z-10 backdrop-blur-2xl rounded-3xl w-full">
          <h1 className="font-semibold tracking-widest text-xl">
            {lang.data.app.login.title}
          </h1>
          <p className="font-sans tracking-wider text-xs text-foreground/40 my-1.5 mb-3">
            {lang.data.app.login.description}
          </p>
          <div className="my-6 w-full">
            <Link href={"/app/login/discord"}>
              <Button className={"w-full p-5 rounded-2xl"}>
                <DiscordLogoIcon weight="fill" />
                {lang.data.app.login.methods.discord}
              </Button>
            </Link>
          </div>
          <span className="text-[10px] text-foreground/40 mt-3 tracking-wider">
            {lang.data.app.login.disclaimer}
          </span>
        </motion.div>
        <motion.div className="p-6 bg-background/60 bg-linear-150 from-amber-950/10 to-amber-600/10 flex flex-col z-10 backdrop-blur-2xl rounded-3xl w-full">
          <h1 className="text-sm text-foreground/60 font-semibold">
            <WarningIcon
              weight="fill"
              className="inline -translate-y-0.5"
              size={16}
            />{" "}
            {lang.data.app.login.announcement.title}
          </h1>
          <p className="text-xs text-foreground/40 mt-1.5">
            {lang.data.app.login.announcement.description}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
