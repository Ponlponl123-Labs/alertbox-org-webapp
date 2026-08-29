"use client";
import React, { useEffect, useMemo } from "react";
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
  HandHeartIcon,
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
  XIcon,
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

function useIsMobile() {
  return React.useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia("(max-width: 767px)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

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
  const isMobile = useIsMobile();
  const isCollapsed = isSidebarCollapsed && !isMobile;

  const sidebarHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    hydrateSidebar();
  }, [hydrateSidebar]);

  useEffect(() => {
    setSidebarHiddenOnMobile(true);
  }, [pathname, setSidebarHiddenOnMobile]);

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
    <>
      <AnimatePresence>
        {!isSidebarHiddenOnMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setSidebarHiddenOnMobile(true)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{
          width: isMobile ? 256 : (isCollapsed ? 52 : 232),
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 34,
        }}
        className={cn(
          "sticky top-0 h-screen z-30 p-1.5 md:pt-14 max-md:pt-2 bg-sidebar flex flex-col text-foreground gap-1 select-none overflow-x-hidden",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0!",
          "max-md:fixed max-md:top-0 max-md:left-0 max-md:w-64! max-md:z-60 max-md:shadow-2xl max-md:border-r max-md:border-border/40",
          isSidebarHiddenOnMobile ? "max-md:-translate-x-full" : "max-md:translate-x-0",
        )}
      >
        <div className="md:hidden flex items-center justify-between px-2.5 py-2.5 mb-1.5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <HandHeartIcon size={22} weight="fill" className="text-foreground" />
            <span className="text-sm font-semibold font-sans">
              AlertBox<span className="text-xs opacity-60 ml-0.5 font-light tracking-wider">.org</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-foreground/50 hover:text-foreground"
            onClick={() => setSidebarHiddenOnMobile(true)}
            aria-label="Close sidebar"
          >
            <XIcon size={18} weight="bold" />
          </Button>
        </div>

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
                    "hover:bg-primary/5 hover:text-primary transition-colors",
                    isCollapsed &&
                      "aria-expanded:bg-background/80 aria-expanded:rounded-b-none",
                  )}
                  showArrow={false}
                >
                  <div className="size-4 shrink-0 flex items-center justify-center">{l.icon}</div>
                  <AnimatePresence initial={false} mode="popLayout">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="text-xs truncate flex-1 text-left"
                      >
                        {l.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <AnimatePresence initial={false} mode="popLayout">
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="ml-auto flex items-center"
                      >
                        <CaretDownIcon
                          className="group-[data-headlessui-state]:rotate-180 transition-transform duration-200"
                          weight="bold"
                          size={12}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AccordionButton>
                <AccordionPanel
                  data-default-transition="false"
                  className={cn(
                    "py-0 flex flex-row gap-3 relative h-max",
                    !isCollapsed && "pl-4.75 pr-0",
                    isCollapsed && "bg-background/40 rounded-b-xl",
                  )}
                >
                  {!isCollapsed && (
                    <div className="h-auto w-px bg-foreground/10" />
                  )}
                  <div className="flex flex-col relative gap-0.5 flex-1 min-w-0">
                    {l.links &&
                      l.links.map((ll, ii) => (
                        <Link key={ii} href={ll.href}>
                          <Button
                            className={cn(
                              "rounded-lg text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start relative overflow-hidden",
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
                            <div className="size-4 shrink-0 flex items-center justify-center">{ll.icon}</div>
                            <AnimatePresence initial={false} mode="popLayout">
                              {!isCollapsed && (
                                <motion.span
                                  initial={{ opacity: 0, x: -6 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -6 }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="text-xs truncate"
                                >
                                  {ll.text}
                                </motion.span>
                              )}
                            </AnimatePresence>
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
                  "rounded-lg text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start relative overflow-hidden",
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
                <div className="size-4 shrink-0 flex items-center justify-center">{l.icon}</div>
                <AnimatePresence initial={false} mode="popLayout">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-xs truncate"
                    >
                      {l.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          ),
        )}
        <Button
          className={cn(
            "rounded-lg overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start mt-auto shrink-0 max-md:hidden",
            "hover:bg-primary/5 hover:text-primary transition-colors",
          )}
          variant="ghost"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        >
          <div className="size-4 shrink-0 flex items-center justify-center">
            <SidebarSimpleIcon
              weight="bold"
              size={14}
              className={cn(
                "transition-transform duration-300 ease-out",
                isSidebarCollapsed && "rotate-180",
              )}
            />
          </div>
          <AnimatePresence initial={false} mode="popLayout">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="text-xs truncate"
              >
                {lang.data.app.sidebar.collapse}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.aside>
    </>
  );
}

export default AppSidebar;
