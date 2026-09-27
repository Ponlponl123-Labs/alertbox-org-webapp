"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { CheckIcon, XIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const renderValue = (value: string | boolean) => {
  if (typeof value === "boolean") {
    return value ? (
      <div className="size-5 rounded bg-white/10 text-white flex items-center justify-center mx-auto shadow-sm">
        <CheckIcon size={12} weight="bold" />
      </div>
    ) : (
      <div className="size-5 rounded bg-white/5 text-muted-foreground/35 flex items-center justify-center mx-auto">
        <XIcon size={10} weight="bold" />
      </div>
    );
  }
  return <span className="text-sm font-medium text-foreground/85">{value}</span>;
};

export default function PricingComparison() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { plans, comparison } = lang.data.pricing;

  return (
    <div className="w-full overflow-x-auto border-y border-border bg-card/30 backdrop-blur-sm">
      <table className="w-full text-left border-collapse min-w-180 table-fixed">
        <thead>
          <tr className="border-b border-border/80">
            <th className="w-[34%] p-6 align-bottom">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground/70">
                {comparison.features_col}
              </span>
            </th>

            <th className="w-[22%] p-6 text-center align-bottom border-l border-border/40 relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[11px] font-semibold font-sans px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
                {comparison.starter_badge}
              </div>
              <div className="text-sm font-semibold text-foreground mt-4">{plans[0].name}</div>
              <div className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-foreground my-1">
                {plans[0].price}
              </div>
              <div className="text-xs font-normal text-muted-foreground">
                {plans[0].period}
              </div>
            </th>

            <th className="w-[22%] p-6 text-center align-bottom border-l border-border/40 bg-muted/20 relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[11px] font-semibold font-sans px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
                {comparison.growth_badge}
              </div>
              <div className="text-sm font-semibold text-foreground mt-4">{plans[1].name}</div>
              <div className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-foreground my-1">
                {plans[1].price}
              </div>
              <div className="text-xs font-normal text-muted-foreground">
                {plans[1].period}
              </div>
            </th>

            <th className="w-[22%] p-6 text-center align-bottom border-l border-border/40">
              <div className="text-sm font-semibold text-foreground">{plans[2].name}</div>
              <div className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-foreground my-1">
                {plans[2].price}
              </div>
              <div className="text-xs font-normal text-muted-foreground">
                {plans[2].period}
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {comparison.categories.map((category) => (
            <React.Fragment key={category.name}>
              <tr className="border-b border-border/60 bg-muted/30">
                <td
                  colSpan={4}
                  className="py-2.5 px-6 text-xs font-mono font-bold uppercase tracking-wider text-foreground/85"
                >
                  {category.name}
                </td>
              </tr>

              {category.features.map((feature) => (
                <tr
                  key={feature.name}
                  className="border-b border-border/40 hover:bg-muted/15 transition-colors"
                >
                  <td className="py-4 px-6 text-sm font-medium text-foreground/90">
                    {feature.name}
                  </td>
                  <td className="py-4 px-6 text-center border-l border-border/40">
                    {renderValue(feature.starter)}
                  </td>
                  <td className="py-4 px-6 text-center border-l border-border/40 bg-muted/20">
                    {renderValue(feature.growth)}
                  </td>
                  <td className="py-4 px-6 text-center border-l border-border/40">
                    {renderValue(feature.enterprise)}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}

          <tr className="border-t border-border/80">
            <td className="p-6"></td>
            <td className="p-6 border-l border-border/40">
              <Link href={plans[0].href} className="w-full block">
                <Button
                  variant="outline"
                  className="w-full rounded-xl py-5 text-xs font-semibold cursor-pointer"
                >
                  {plans[0].button} <ArrowRightIcon size={13} weight="bold" className="ml-1" />
                </Button>
              </Link>
            </td>
            <td className="p-6 border-l border-border/40 bg-muted/20">
              <Link
                href={plans[1].href}
                target={plans[1].href.startsWith("http") ? "_blank" : undefined}
                rel={plans[1].href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-full block"
              >
                <Button className="w-full rounded-xl py-5 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 cursor-pointer shadow-sm">
                  {plans[1].button} <ArrowRightIcon size={13} weight="bold" className="ml-1" />
                </Button>
              </Link>
            </td>
            <td className="p-6 border-l border-border/40">
              <Link href={plans[2].href} className="w-full block">
                <Button
                  variant="outline"
                  className="w-full rounded-xl py-5 text-xs font-semibold cursor-pointer"
                >
                  {plans[2].button} <ArrowRightIcon size={13} weight="bold" className="ml-1" />
                </Button>
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
