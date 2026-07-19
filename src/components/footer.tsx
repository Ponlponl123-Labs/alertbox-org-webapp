"use client";

import { memo } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import LanguageSwitcher from "./language-switcher";
import Link from "next/link";
import { HandHeartIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import BorderGlow from "./BorderGlow";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const Footer = memo(function Footer() {
  const pathname = usePathname();
  const lang = useStore(coreStore, (state) => state.lang);

  if (pathname.startsWith("/@")) return null;

  const FOOTER_LINKS = [
    {
      title: lang.data.footer.links.legal.title,
      links: [
        {
          name: lang.data.footer.links.legal.privacy,
          herf: "https://law.ponlponl123.com/privacy",
          isExternal: true,
        },
        {
          name: lang.data.footer.links.legal.tos,
          herf: "https://law.ponlponl123.com/tos",
          isExternal: true,
        },
        {
          name: lang.data.footer.links.legal.additional,
          herf: "https://law.ponlponl123.com/additionals",
          isExternal: true,
        },
      ],
    },
    {
      title: lang.data.footer.links.common.title,
      links: [
        {
          name: lang.data.footer.links.common.docs,
          herf: "/docs",
          isExternal: false,
        },
        {
          name: "GitHub",
          herf: "https://github.com/ponlponl123-labs/alertbox-org",
          isExternal: true,
        },
        {
          name: lang.data.footer.links.common.status,
          herf: "https://status.alertbox.org",
          isExternal: true,
        },
        {
          name: lang.data.footer.links.common.donate,
          herf: "/donate",
          isExternal: false,
        },
      ],
    },
  ];

  return (
    <>
      {/* {["/", "/pricing", "/about", "/docs"].includes(pathname) && (
        <section className="py-16 p-6 bg-zinc-50 font-sans dark:bg-black flex flex-col items-center justify-center gap-3">
          <div className="p-6 rounded-3xl flex flex-col gap-3 bg-foreground/5 bg-linear-150 from-rose-950 to-rose-300 w-full max-w-xl">
            <h1 className="text-lg font-semibold text-white">
              <HandHeartIcon
                className="inline mr-1.5"
                size={26}
                weight="fill"
              />{" "}
              {lang.data.helpus.title}
            </h1>
            <p className="text-xs text-white/40">
              {lang.data.helpus.description}
            </p>
            <Link
              href={"https://buymeacoffee.com/ponlponl123"}
              target="_blank"
              className="w-max"
            >
              <Button
                className={
                  "rounded-xl bg-amber-100 hover:bg-amber-50 text-black"
                }
              >
                <BuyMeACoffee className="mr-0.5 size-3" />
                {lang.data.helpus.button}
              </Button>
            </Link>
          </div>
        </section>
      )} */}

      <footer className="w-full min-w-0 flex-1 p-6 flex flex-col items-center relative bg-sidebar">
        {!pathname.startsWith("/app") && (
          <div className="absolute top-0 left-0 -translate-y-full w-full min-w-0 flex-1 bg-linear-0 to-transparent from-sidebar h-40 z-10 pointer-events-none" />
        )}
        <div className="min-w-0 w-full max-w-5xl flex gap-6 mx-auto py-6 max-sm:flex-col">
          <div className="flex flex-col gap-2 text-foreground/30 flex-1 min-w-0">
            <h1 className="text-xl font-light tracking-wider">Alertbox.org</h1>
            <p className="font-sans text-xs text-foreground/15 leading-4.5">
              {lang.data.footer.description}
            </p>
            <div className="text-foreground">
              <LanguageSwitcher showLabel={true} />
            </div>
          </div>
          <div className="flex flex-wrap justify-end max-sm:justify-between md:max-w-2/3 flex-1 min-w-0 gap-6">
            {FOOTER_LINKS.map((v, i) => (
              <ul
                key={i}
                className="w-max text-foreground/40 flex flex-col gap-2 max-[18rem]:w-full min-[18rem]:max-sm:w-[calc(50%-12px)]"
              >
                <li className="font-semibold">
                  <h3>{v.title}</h3>
                </li>
                {v.links.map((l, lindex) => (
                  <li
                    key={`${v.title}-${lindex}`}
                    className="hover:text-foreground/60 text-sm"
                  >
                    <Link
                      href={l.herf}
                      target={l.isExternal ? "_blank" : undefined}
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="flex sm:items-center sm:justify-between w-full max-w-5xl mx-auto max-sm:flex-col max-sm:gap-4 mt-4">
          <div className="text-foreground/10 font-mono text-xs max-sm:mx-auto">
            <Tooltip>
              <TooltipTrigger delay={2000}>
                <Link href="/donate">
                  <BorderGlow
                    edgeSensitivity={10}
                    glowColor="10 80 80"
                    borderRadius={8}
                    glowRadius={40}
                    glowIntensity={1}
                    backgroundColor="var(--bg-card)"
                    colors={["#f43f5e", "#ec4899", "#d946ef"]}
                    className="flex flex-col justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 h-full"
                  >
                    <h1 className="text-[11px] font-bold text-foreground/30">
                      <HandHeartIcon
                        className="inline"
                        size={18}
                        weight="fill"
                      />{" "}
                      {lang.data.helpus.title}
                    </h1>
                  </BorderGlow>
                </Link>
              </TooltipTrigger>
              <TooltipContent className={"rounded-lg p-4"}>
                <p className="text-xs">{lang.data.helpus.description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-2 text-end max-sm:text-center">
            <span className="text-foreground/10 font-mono text-[10px] mt-2 tracking-widest">
              Made with ❤︎ by Ponlponl123 Labs
            </span>
            <span className="text-foreground/10 font-mono text-[11px] mb-2 tracking-widest">
              Innovative / Human / Open / Earth
            </span>
          </div>
        </div>
      </footer>
    </>
  );
});

export default Footer;
