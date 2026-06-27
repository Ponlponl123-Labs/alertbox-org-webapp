"use client";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import SideRays from "@/components/SideRays";

export default function AboutPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.about;

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black font-sans pt-32 pb-24 text-zinc-900 dark:text-zinc-50 relative selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="w-full absolute top-0 left-0 h-208 mask-b-from-50%">
          <SideRays
            speed={2.5}
            rayColor1="#EAB308"
            rayColor2="#96c8ff"
            intensity={2}
            spread={2}
            origin="top-right"
            tilt={0}
            saturation={1.5}
            blend={0.75}
            falloff={1.6}
            opacity={1}
          />
        </div>

        {/* Header Section: Minimalist Editorial Title */}
        <header className="max-w-3xl mb-16">
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
        <hr className="border-t border-zinc-100 dark:border-zinc-900 mb-16" />

        {/* Section 1: The Mission (Editorial Row Split) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
          <div className="md:col-span-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-400 dark:text-zinc-600 uppercase">
              {t.mission_title}
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {t.mission_desc}
            </p>
          </div>
        </section>

        {/* Section 2: FAQ (Survival) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 border-t border-zinc-100 dark:border-zinc-900 pt-16">
          <div className="md:col-span-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
              {t.faq_question}
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {t.faq_answer}
            </p>
          </div>
        </section>

        {/* Section 3: Values (Editorial Row Split with Grid Content) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 border-t border-zinc-100 dark:border-zinc-900 pt-16">
          <div className="md:col-span-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-400 dark:text-zinc-600 uppercase">
              {lang.key === "th-TH" ? "ค่านิยมหลัก" : "Core Values"}
            </h2>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: t.values.privacy_title,
                desc: t.values.privacy_desc,
              },
              {
                title: t.values.fee_title,
                desc: t.values.fee_desc,
              },
              {
                title: t.values.open_source_title,
                desc: t.values.open_source_desc,
              },
            ].map((value, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {value.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: The Idea & Actions */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-zinc-100 dark:border-zinc-900 pt-16">
          <div className="md:col-span-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-400 dark:text-zinc-600 uppercase">
              {t.team_title}
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal mb-8">
              {t.team_desc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="https://github.com/Ponlponl123-Labs/alertbox-org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="h-11 rounded-none px-6 text-xs font-bold uppercase tracking-wider cursor-pointer border border-zinc-900 dark:border-zinc-50 bg-transparent text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  GitHub
                </Button>
              </Link>
              <Link href="/app">
                <Button className="h-11 rounded-none px-6 text-xs font-bold uppercase tracking-wider cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 border-0 transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
