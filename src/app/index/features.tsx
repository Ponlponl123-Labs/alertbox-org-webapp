"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import {
  LightningIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from "@phosphor-icons/react";

export default function Features() {
  const t = useStore(
    coreStore,
    (state) => state.lang.data.pages.index.sections.features
  );

  return (
    <section className="w-full font-sans py-24 md:py-36 relative overflow-hidden text-foreground">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-medium tracking-tight text-foreground leading-[1.2] max-w-5xl mb-16"
        >
          {t.headline}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 bg-foreground text-background rounded-[36px] p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative min-h-145 shadow-xl shadow-emerald-500/10 select-none"
          >
            <div>
              <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-background leading-tight mb-3">
                {t.card_onboarding.title}
              </h3>
              <p className="text-sm sm:text-base text-background/75 font-normal leading-relaxed max-w-sm">
                {t.card_onboarding.description}
              </p>
            </div>

            <div className="w-full mt-10 -mb-12 sm:-mb-14">
              <div className="bg-white rounded-t-[36px] shadow-2xl p-6 sm:p-7 pt-5 text-black">
                <div className="w-20 h-4 bg-black rounded-full mx-auto mb-6" />

                <h4 className="text-2xl font-bold tracking-tight text-black mb-1.5">
                  {t.card_onboarding.mockup_title}
                </h4>
                <p className="text-xs text-black/60 leading-relaxed mb-6 font-normal">
                  {t.card_onboarding.mockup_desc}
                </p>

                <div className="rounded-2xl bg-muted p-4 text-muted-foreground border border-black/10 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">
                      {t.card_onboarding.mockup_badge}
                    </span>
                    <CheckCircleIcon size={18} weight="fill" className="text-emerald-400" />
                  </div>
                  <div className="font-mono text-[11px] bg-black/10 px-2.5 py-1.5 rounded-lg font-medium truncate mb-2">
                    {t.card_onboarding.mockup_url}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-muted-foreground/70">
                    <span>{t.card_onboarding.mockup_meta_left}</span>
                    <span className="text-emerald-500 uppercase">
                      {t.card_onboarding.mockup_meta_right}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-foreground/10 rounded-[36px] p-8 sm:p-10 relative overflow-hidden select-none"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-40">
                <div className="size-80 rounded-full border border-emerald-400/20" />
                <div className="absolute inset-0 m-auto size-120 rounded-full border border-emerald-400/10" />
                <div className="absolute inset-0 m-auto size-160 rounded-full border border-emerald-400/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                <div className="md:col-span-6">
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2.5">
                    {t.card_realtime.title}
                  </h3>
                  <p className="text-sm text-foreground/70 font-normal leading-relaxed">
                    {t.card_realtime.description}
                  </p>
                </div>

                <div className="md:col-span-6 flex justify-center md:justify-end">
                  <div className="w-full max-w-60 bg-white rounded-3xl p-4 shadow-2xl text-black border border-black/5">
                    <div className="w-16 h-3 bg-black rounded-full mx-auto mb-3" />

                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/5 text-[11px] text-black/50 mb-3">
                      <MagnifyingGlassIcon size={12} />
                      <span>{t.card_realtime.search_placeholder}</span>
                    </div>

                    <div className="text-[10px] uppercase font-mono tracking-wider text-black/50 mb-0.5">
                      {t.card_realtime.gateways_label}
                    </div>
                    <div className="text-xl font-bold tracking-tight text-black mb-2.5">
                      {t.card_realtime.gateways_count}
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-bold">
                        Stripe
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-black/70 text-[10px] font-medium">
                        Ko-fi
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-black/70 text-[10px] font-medium">
                        Twitch
                      </span>
                    </div>

                    <div className="bg-black text-white p-2.5 rounded-2xl flex items-center justify-between text-[10px]">
                      <div>
                        <div className="text-white/50 text-[9px] uppercase font-mono">
                          {t.card_realtime.sync_status_label}
                        </div>
                        <div className="font-semibold text-white">
                          {t.card_realtime.sync_status_value}
                        </div>
                      </div>
                      <span className="bg-emerald-400/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {t.card_realtime.sync_rate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-foreground/10 rounded-[36px] p-8 flex flex-col justify-between items-center text-center select-none"
              >
                <div className="my-auto">
                  <div className="text-xs uppercase font-mono tracking-widest text-emerald-400 mb-2 font-bold">
                    {t.card_escrow.kicker}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-tight mb-2">
                    {t.card_escrow.title}
                  </h3>
                  <p className="text-xs text-foreground/60 max-w-50 mx-auto leading-relaxed">
                    {t.card_escrow.description}
                  </p>
                </div>

                <div className="pt-6 w-full border-t border-foreground/10 flex items-center justify-center gap-1.5 text-xs text-foreground/80 font-medium">
                  <StarIcon size={14} weight="fill" className="text-emerald-400" />
                  <span>{t.card_escrow.footer}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-foreground/90 text-black rounded-[36px] p-8 flex flex-col justify-between select-none shadow-xl shadow-emerald-500/10"
              >
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-background mb-1.5">
                    {t.card_scale.title}
                  </h3>
                  <p className="text-xs text-background/75 font-normal leading-relaxed">
                    {t.card_scale.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-6">
                  <div className="bg-foreground text-background px-4 py-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <RocketLaunchIcon size={14} className="text-emerald-400" weight="fill" />
                      <span>{t.card_scale.alerts_synced_label}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">
                      {t.card_scale.alerts_synced_value}
                    </span>
                  </div>

                  <div className="bg-foreground text-background px-4 py-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <LightningIcon size={14} className="text-emerald-400" weight="fill" />
                      <span>{t.card_scale.latency_label}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">
                      {t.card_scale.latency_value}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
