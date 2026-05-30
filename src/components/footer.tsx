"use client";

import { memo } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Legal",
    links: [
      {
        name: "Privacy Policy",
        herf: "https://law.ponlponl123.com/privacy",
        isExternal: true,
      },
      {
        name: "Terms of Service",
        herf: "https://law.ponlponl123.com/tos",
        isExternal: true,
      },
      {
        name: "Additional Terms",
        herf: "https://law.ponlponl123.com/additionals",
        isExternal: true,
      },
    ],
  },
  {
    title: "Links",
    links: [
      {
        name: "Documentation",
        herf: "/docs",
        isExternal: false,
      },
      {
        name: "GitHub",
        herf: "https://github.com/ponlponl123-labs/alertbox-org",
        isExternal: true,
      },
      {
        name: "Status",
        herf: "https://status.alertbox.org",
        isExternal: true,
      },
    ],
  },
];

const Footer = memo(function Footer() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <footer className="w-full min-w-0 flex-1 p-6 flex flex-col items-center relative bg-sidebar">
      <div className="absolute top-0 left-0 -translate-y-full w-full min-w-0 flex-1 bg-linear-0 to-transparent from-sidebar h-12 opacity-60" />
      <div className="min-w-0 w-full max-w-5xl flex gap-6 mx-auto py-6 max-sm:flex-col">
        <div className="flex flex-col gap-2 text-foreground/30 flex-1 min-w-0">
          <h1 className="text-xl font-light tracking-wider">Alertbox.org</h1>
          <p className="font-read text-xs">{lang.data.footer.description}</p>
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
      <div className="flex flex-col">
        <span className="text-foreground/10 font-mono text-xs my-3 tracking-widest text-center">
          Made with ❤︎ by Ponlponl123 Labs
        </span>
        <span className="text-foreground/10 font-mono text-xs mb-3 tracking-widest text-center">
          Innovative / Human / Open / Earth
        </span>
      </div>
    </footer>
  );
});

export default Footer;
