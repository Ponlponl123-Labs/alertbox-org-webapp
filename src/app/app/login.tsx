"use client";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import {
  CraneIcon,
  DiscordLogoIcon,
  MegaphoneSimpleIcon,
  PlanetIcon,
  RocketLaunchIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useStore } from "zustand";
import Link from "next/link";
import MagicRings from "@/components/MagicRings";
import { Google, Streamlabs } from "@thesvg/react";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

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
        <MagicRings
          color="#A855F7"
          colorTwo="#6366F1"
          ringCount={6}
          speed={1}
          attenuation={10}
          lineThickness={2}
          baseRadius={0.35}
          radiusStep={0.1}
          scaleRate={0.1}
          opacity={1}
          blur={0}
          noiseAmount={0.1}
          rotation={0}
          ringGap={1.5}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={false}
          mouseInfluence={0.2}
          hoverScale={1.2}
          parallax={0.05}
          clickBurst={false}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="m-auto flex flex-col gap-1.5 max-w-92 py-16"
      >
        <motion.div className="p-6 bg-background supports-backdrop-filter:bg-background/30 text-center flex flex-col z-10 supports-backdrop-filter:backdrop-blur-2xl rounded-3xl w-full">
          <RocketLaunchIcon className="mx-auto my-3" size={48} />
          <h1 className="font-semibold tracking-widest text-xl hidden">
            {lang.data.app.login.title}
          </h1>
          <p className="font-sans tracking-wider text-xs text-foreground/40 mb-3">
            {lang.data.app.login.description}
          </p>
          <Alert className="mx-auto mt-1 -mb-1 text-[13px] rounded-xl border-2 bg-foreground/5 border-foreground/5 p-3">
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
  );
}

export default Login;
