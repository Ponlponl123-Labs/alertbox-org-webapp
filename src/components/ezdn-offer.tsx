import { coreStore } from "@/hooks/store/core";
import Link from "next/link";
import React from "react";
import { useStore } from "zustand";
import { Button } from "./ui/button";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "./animate-ui/components/headless/accordion";

export default function EzdnOffer() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <section className="p-6 py-16 min-h-screen w-full flex flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-xl flex flex-col items-center text-center">
        <div className="flex gap-1 w-full max-w-lg my-16 items-center justify-center">
          <div className="flex-1 min-w-0 h-px bg-foreground/40" />
          <div className="py-1 px-3 rounded-full bg-foreground/10 border-2 border-foreground/10 text-xs">
            {lang.data.pages.index.sections.for_thai_people.separate}
          </div>
          <div className="flex-1 min-w-0 h-px bg-foreground/40" />
        </div>
        <h1 className="text-4xl font-semibold mb-3">
          {lang.data.pages.index.sections.for_thai_people.title}
        </h1>
        <p className="text-foreground/40">
          {lang.data.pages.index.sections.for_thai_people.description}
        </p>

        <p className="mt-12">
          {lang.data.pages.index.sections.for_thai_people.description2
            .split("%")
            .map((t, i) =>
              i === 0 ? (
                <React.Fragment key={i}>{t}</React.Fragment>
              ) : (
                <Link
                  href={"https://easydonate.app/?ref=alertbox.org"}
                  className="text-blue-500"
                  target="_blank"
                  key={i}
                >
                  {t}
                </Link>
              ),
            )}
        </p>
      </div>
      <Accordion className="w-full max-w-md mt-16 mb-6 bg-muted rounded-2xl overflow-hidden">
        {lang.data.pages.index.sections.for_thai_people.faq.map((qa, i) => (
          <AccordionItem key={i}>
            <AccordionButton
              className={
                "p-4 hover:no-underline hover:bg-foreground/5 rounded-sm"
              }
            >
              {qa.q}
            </AccordionButton>
            <AccordionPanel
              data-default-transition="false"
              className={"p-4 bg-background/40 rounded-t-xl"}
            >
              <div>
                {qa.a.ezdn.map((a, i) => (
                  <p key={i}>
                    {a.split("%").map((t, i) =>
                      i === 0 ? (
                        <React.Fragment key={i}>{t}</React.Fragment>
                      ) : (
                        <Link
                          href={"https://easydonate.app/plans?ref=alertbox.org"}
                          className="text-blue-500"
                          target="_blank"
                          key={i}
                        >
                          {t}
                        </Link>
                      ),
                    )}
                    {i < qa.a.ezdn.length - 1 && <br />}
                  </p>
                ))}
                <span className="mt-4 block text-xs text-foreground/40">
                  Alertbox.org:
                </span>
                {qa.a.alertbox_org.map((a, i) => (
                  <p key={i} className="mt-2 text-xs text-foreground/40">
                    {a}
                    {i < qa.a.ezdn.length - 1 && <br />}
                  </p>
                ))}
              </div>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Link
        href={"https://easydonate.app/?ref=alertbox.org"}
        target="_blank"
        className="mb-3"
      >
        <Button
          className={
            "bg-linear-60 from-blue-800 to-cyan-700 bg-transparent p-5 text-white rounded-full"
          }
          size={"lg"}
        >
          {lang.data.pages.index.sections.for_thai_people.ref}{" "}
          <ArrowUpRightIcon size={16} weight="bold" />
        </Button>
      </Link>
      <div className="flex flex-col font-read text-center gap-2 mb-12">
        <strong className="uppercase tracking-widest font-mono text-foreground/40 mt-12">
          DISCLAMER
        </strong>
        <span className="text-foreground/40 text-xs mt-2">
          {lang.data.pages.index.sections.for_thai_people.disclaimer[0]}
        </span>
        <span className="text-foreground/40 text-xs">
          {lang.data.pages.index.sections.for_thai_people.disclaimer[1]}
        </span>
        <strong className="text-foreground/60 text-sm mt-2">
          {lang.data.pages.index.sections.for_thai_people.disclaimer[2]}
        </strong>
        <span className="text-foreground/40 text-xs mt-2">
          {lang.data.pages.index.sections.for_thai_people.disclaimer[3]}
        </span>
        <span className="text-foreground/40 text-xs mt-2">
          {lang.data.pages.index.sections.for_thai_people.disclaimer[4]}
        </span>
      </div>
    </section>
  );
};
