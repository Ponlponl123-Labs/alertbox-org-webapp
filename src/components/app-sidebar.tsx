"use client";
import { coreStore } from "@/hooks/store/core";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "zustand";
import { Button } from "./ui/button";
import {
  BellRingingIcon,
  CaretDownIcon,
  ChartLineIcon,
  GearSixIcon,
  HandWavingIcon,
  HeartIcon,
  PaletteIcon,
  PlugsIcon,
  ShieldCheckIcon,
  SidebarSimpleIcon,
  StorefrontIcon,
  UserGearIcon,
  UserIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "./animate-ui/components/headless/accordion";
import { useEffect } from "react";

function AppSidebar() {
  const lang = useStore(coreStore, (state) => state.lang);
  const isSidebarCollapsed = useStore(
    coreStore,
    (state) => state.isSidebarCollapsed,
  );
  const isSidebarHiddenOnMobile = useStore(
    coreStore,
    (state) => state.isSidebarHiddenOnMobile,
  );
  const setSidebarHiddenOnMobile = useStore(
    coreStore,
    (state) => state.setSidebarHiddenOnMobile,
  );
  const setSidebarCollapsed = useStore(
    coreStore,
    (state) => state.setSidebarCollapsed,
  );
  const pathname = usePathname();

  useEffect(() => {
    setSidebarHiddenOnMobile(true);
  }, [pathname, setSidebarHiddenOnMobile]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, maxWidth: 0 }}
        animate={{ opacity: 1, maxWidth: isSidebarCollapsed ? 64 : 232 }}
        exit={{ opacity: 0, maxWidth: 0 }}
        className={cn(
          "sticky top-0 h-screen z-40 w-58 p-3 pt-14 bg-sidebar flex flex-col text-foreground gap-1",
          isSidebarCollapsed && "w-16",
          "max-md:fixed",
          isSidebarHiddenOnMobile && "max-md:-translate-x-full",
        )}
      >
        {[
          {
            text: lang.data.header.user_chip.links.dashboard,
            icon: <ChartLineIcon weight="bold" size={16} />,
            href: "/app",
          },
          {
            text: lang.data.app.sidebar.links.profile,
            icon: <UserIcon weight="bold" size={16} />,
            href: "/app/profile",
          },
          {
            text: lang.data.app.sidebar.links.connection,
            icon: <PlugsIcon weight="bold" size={16} />,
            href: "/app/connections",
          },
          {
            text: lang.data.app.sidebar.links.alertbox.title,
            icon: (
              <BellRingingIcon className="rotate-0!" weight="bold" size={16} />
            ),
            links: [
              {
                text: lang.data.app.sidebar.links.alertbox.donation,
                icon: <HeartIcon weight="bold" size={16} />,
                href: "/app/alertbox/tip",
              },
              {
                text: lang.data.app.sidebar.links.alertbox.subscription,
                icon: <HandWavingIcon weight="bold" size={16} />,
                href: "/app/alertbox/membership",
              },
              {
                text: lang.data.app.sidebar.links.alertbox.purchased,
                icon: <StorefrontIcon weight="bold" size={16} />,
                href: "/app/alertbox/purchased",
              },
            ],
          },
          {
            text: lang.data.app.sidebar.links.settings.title,
            icon: <GearSixIcon weight="bold" size={16} />,
            links: [
              {
                text: lang.data.app.sidebar.links.settings.account,
                icon: <UserGearIcon weight="bold" size={16} />,
                href: "/app/account",
              },
              {
                text: lang.data.app.sidebar.links.settings.security,
                icon: <ShieldCheckIcon weight="bold" size={16} />,
                href: "/app/account/security",
              },
              {
                text: lang.data.app.sidebar.links.settings.danger,
                icon: <WarningOctagonIcon weight="bold" size={16} />,
                href: "/app/account/danger",
              },
            ],
          },
        ].map((l, i) =>
          !l?.href ? (
            <Accordion key={i}>
              <AccordionItem>
                <AccordionButton
                  className={cn(
                    "rounded-xl whitespace-nowrap group overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start items-center flex no-underline!",
                    "hover:bg-primary/5 hover:text-primary",
                    isSidebarCollapsed &&
                      "aria-expanded:bg-background/80 aria-expanded:rounded-b-none",
                  )}
                  showArrow={false}
                >
                  <div className="size-4">{l.icon}</div>
                  {!isSidebarCollapsed && (
                    <span className="text-xs">{l.text}</span>
                  )}
                  <CaretDownIcon
                    className="group-[data-headlessui-state]:rotate-180 ml-auto"
                    weight="bold"
                    size={12}
                  />
                </AccordionButton>
                <AccordionPanel
                  data-default-transition="false"
                  className={cn(
                    "py-0 flex flex-row gap-3 relative h-max",
                    !isSidebarCollapsed && "pl-4.75 pr-0",
                    isSidebarCollapsed && "bg-background/40 rounded-b-xl",
                  )}
                >
                  {!isSidebarCollapsed && (
                    <div className="h-auto w-px bg-foreground/10" />
                  )}
                  <div className="flex flex-col relative gap-0.5 flex-1 min-w-0">
                    {l.links &&
                      l.links.map((ll, ii) => (
                        <Link key={ii} href={ll.href}>
                          <Button
                            className={cn(
                              "rounded-xl overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start",
                              pathname === ll.href &&
                                "bg-foreground/10 text-foreground",
                            )}
                            variant="ghost"
                          >
                            {ll.icon}
                            {!isSidebarCollapsed && (
                              <span className="text-xs">{ll.text}</span>
                            )}
                          </Button>
                        </Link>
                      ))}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ) : (
            <Link key={i} href={l.href}>
              <Button
                className={cn(
                  "rounded-xl overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start",
                  pathname === l.href && "bg-foreground/10 text-foreground",
                )}
                variant="ghost"
              >
                {l.icon}
                {!isSidebarCollapsed && (
                  <span className="text-xs">{l.text}</span>
                )}
              </Button>
            </Link>
          ),
        )}
        <Button
          className={cn(
            "rounded-xl overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start mt-auto",
          )}
          variant="ghost"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        >
          <SidebarSimpleIcon weight="bold" size={12} />
          {!isSidebarCollapsed && (
            <span className="text-xs">{lang.data.app.sidebar.collapse}</span>
          )}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

export default AppSidebar;
