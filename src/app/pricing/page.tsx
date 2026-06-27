"use client";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import LightRays from "@/components/LightRays";
import { CheckIcon } from "@phosphor-icons/react";
import { BuyMeACoffee } from "@thesvg/react";
import BorderGlow from "@/components/BorderGlow";

export default function PricingPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pricing;

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black font-sans pt-32 pb-24 text-zinc-900 dark:text-zinc-50 relative selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Backdrop Side Rays */}
        <div className="w-full absolute top-0 left-0 h-200 mask-b-from-60% pointer-events-none overflow-hidden z-0">
          <div className="w-full absolute top-0 left-0 h-208 mask-b-from-50%">
            <LightRays
              raysOrigin="top-center"
              raysColor="#ffffff"
              raysSpeed={1}
              lightSpread={0.5}
              rayLength={3}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0}
              distortion={0}
              className="custom-rays"
              pulsating={false}
              fadeDistance={1}
              saturation={1}
            />
          </div>
        </div>

        {/* Header Section */}
        <header className="max-w-3xl mb-16 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
            {t.subtitle}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            {t.title}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal max-w-2xl">
            {t.description}
          </p>
        </header>

        {/* Separator line */}
        <hr className="border-t border-zinc-100 dark:border-zinc-900 mb-16 relative z-10" />

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 relative z-10">
          {/* Left Column: Free Tier Details */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="var(--bg-card)"
            borderRadius={0}
            glowRadius={40}
            glowIntensity={1}
            coneSpread={25}
            animated={false}
            colors={["#c084fc", "#f472b6", "#38bdf8"]}
            className="md:col-span-6 flex flex-col justify-between p-8 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900"
          >
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-6">
                {t.free_plan.title}
              </h2>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black tracking-tight">
                  {t.free_plan.price}
                </span>
                <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  / {t.free_plan.period}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 font-normal leading-relaxed">
                {t.free_plan.desc}
              </p>

              <ul className="flex flex-col gap-4 mb-8">
                {t.free_plan.features.map((feature: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <CheckIcon
                      className="size-4 text-yellow-500 flex-shrink-0"
                      weight="bold"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/app" className="w-full">
              <Button className="w-full h-11 rounded-none px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 border-0 transition-all">
                {lang.key === "th-TH" ? "เริ่มต้นใช้งาน" : "Get Started"}
              </Button>
            </Link>
          </BorderGlow>

          {/* Right Column: Gateway Fees Breakdown */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
                {t.gateway_fees.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                {t.gateway_fees.desc}
              </p>

              <div className="flex flex-col gap-6">
                {t.gateway_fees.providers.map((prov: any, idx: number) => (
                  <div
                    key={idx}
                    className="border-b border-zinc-100 dark:border-zinc-900 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {prov.name}
                      </h3>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                        {prov.fee}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                      {prov.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-t border-zinc-100 dark:border-zinc-900 mb-16 relative z-10" />

        {/* Support Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
          <div className="md:col-span-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-400 dark:text-zinc-600 uppercase">
              {lang.key === "th-TH" ? "สนับสนุนพวกเรา" : "Support Us"}
            </h2>
          </div>
          <div className="md:col-span-8">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              {t.help_title}
            </h3>
            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal mb-8">
              {t.help_desc}
            </p>
            <Link
              href="https://buymeacoffee.com/ponlponl123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="h-11 rounded-none px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-amber-100 hover:bg-amber-50 text-black border border-transparent transition-all flex items-center gap-2">
                <BuyMeACoffee className="size-4" />
                {t.help_action}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
