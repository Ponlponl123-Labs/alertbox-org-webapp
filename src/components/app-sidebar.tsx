"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  HandCoinsIcon,
  HandWavingIcon,
  HeartIcon,
  PlugsIcon,
  ShieldCheckIcon,
  SidebarSimpleIcon,
  StorefrontIcon,
  UserGearIcon,
  UserIcon,
  UsersIcon,
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
import { useDisclosure } from "./animate-ui/primitives/headless/disclosure";

function AccordionStateSync({
  hydrated,
  onToggle,
}: {
  hydrated: boolean;
  onToggle: (isOpen: boolean) => void;
}) {
  const { isOpen } = useDisclosure();
  useEffect(() => {
    if (hydrated) {
      onToggle(isOpen);
    }
  }, [isOpen, hydrated, onToggle]);
  return null;
}

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
  const openAccordions = useStore(coreStore, (state) => state.openAccordions);
  const setAccordionOpen = useStore(
    coreStore,
    (state) => state.setAccordionOpen,
  );
  const hydrateSidebar = useStore(coreStore, (state) => state.hydrateSidebar);
  const pathname = usePathname();

  const sidebarHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    hydrateSidebar();
  }, [hydrateSidebar]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSidebarHiddenOnMobile(true);
  }

  const sidebarItems = useMemo(() => {
    return [
      {
        id: "dashboard",
        text: lang.data.header.user_chip.links.dashboard,
        icon: <ChartLineIcon weight="bold" size={16} />,
        href: "/app",
      },
      {
        id: "profile",
        text: lang.data.app.sidebar.links.profile,
        icon: <UserIcon weight="bold" size={16} />,
        href: "/app/profile",
      },
      {
        id: "connections",
        text: lang.data.app.sidebar.links.connection,
        icon: <PlugsIcon weight="bold" size={16} />,
        href: "/app/connections",
      },
      {
        id: "member",
        text: "Members",
        icon: <UsersIcon className="rotate-0!" weight="bold" size={16} />,
        links: [
          {
            text: "Donation history",
            icon: <HandCoinsIcon weight="bold" size={16} />,
            href: "/app/member/history",
          },
        ],
      },
      {
        id: "alertbox",
        text: lang.data.app.sidebar.links.alertbox.title,
        icon: <BellRingingIcon className="rotate-0!" weight="bold" size={16} />,
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
        id: "settings",
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
    ];
  }, [lang]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, maxWidth: 0 }}
        animate={{ opacity: 1, maxWidth: isSidebarCollapsed ? 52 : 232 }}
        exit={{ opacity: 0, maxWidth: 0 }}
        className={cn(
          "sticky top-0 h-screen z-40 w-58 p-1.5 pt-14 bg-sidebar flex flex-col text-foreground gap-1",
          isSidebarCollapsed && "w-13",
          "max-md:fixed",
          isSidebarHiddenOnMobile && "max-md:-translate-x-full",
        )}
      >
        {sidebarItems.map((l) =>
          !l.href ? (
            <Accordion key={`${l.id}-${sidebarHydrated}`}>
              <AccordionItem defaultOpen={openAccordions[l.id] ?? true}>
                <AccordionStateSync
                  hydrated={sidebarHydrated}
                  onToggle={(isOpen) => setAccordionOpen(l.id, isOpen)}
                />
                <AccordionButton
                  className={cn(
                    "rounded-lg whitespace-nowrap group overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start items-center flex no-underline!",
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
                              "rounded-lg text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start relative",
                              pathname === ll.href && "text-foreground",
                            )}
                            variant="ghost"
                          >
                            <AnimatePresence mode="wait">
                              {pathname === ll.href && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  data-default-transition="false"
                                  id="sidebar-link-active"
                                  layoutId="sidebar-link-active"
                                  className="absolute inset-0 rounded-lg bg-foreground/10 z-10"
                                />
                              )}
                            </AnimatePresence>
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
            <Link key={l.id} href={l.href}>
              <Button
                className={cn(
                  "rounded-lg text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start relative",
                  pathname === l.href && "text-foreground",
                )}
                variant="ghost"
              >
                <AnimatePresence mode="wait">
                  {pathname === l.href && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      data-default-transition="false"
                      id="sidebar-link-active"
                      layoutId="sidebar-link-active"
                      className="absolute inset-0 rounded-lg bg-foreground/10 z-10"
                    />
                  )}
                </AnimatePresence>
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
            "rounded-lg overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start mt-auto",
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
