"use client";
import React, { useEffect, useMemo } from "react";
import { coreStore } from "@/hooks/store/core";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import { HandHeartIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible } from '@animate-ui/react/primitives/base-ui/collapsible';
import OrgSwitcher from '@/components/features/org/org-switcher';
import StreamerSelector from '@/components/features/streamer/streamer-selector';
import NavUser from './nav-user';
import { useUserContext } from "@/contexts/user";
import { hasPermission, hasAnyPermission, canAccessStreamer } from "@/lib/rbac";
import { OrgPerm, StreamerPerm } from "@/consts/permission";
import { PanelLeftClose } from "../animate-ui/icons/hugeicons/panel-left-close";
import { PanelLeftOpen } from "../animate-ui/icons/hugeicons/panel-left-open";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Compass } from "../animate-ui/icons/hugeicons/compass";
import { Settings02 } from "../animate-ui/icons/hugeicons/settings-02";
import { ShieldCheck } from "../animate-ui/icons/hugeicons/shield-check";
import { UserRound } from "../animate-ui/icons/hugeicons/user-round";
import { OctagonAlert } from "../animate-ui/icons/hugeicons/octagon-alert";
import { ArrowDown01 } from "../animate-ui/icons/hugeicons/arrow-down-01";
import { UsersRound } from "../animate-ui/icons/hugeicons/users-round";
import { ChartLine } from "../animate-ui/icons/hugeicons/chart-line";
import { Clock02 } from "../animate-ui/icons/hugeicons/clock-02";
import { CreditCard } from "../animate-ui/icons/hugeicons/credit-card";
import { Clapperboard } from "../animate-ui/icons/hugeicons/clapperboard";
import { MessageSquareHeart } from "../animate-ui/icons/hugeicons/message-square-heart";
import { Route } from "../animate-ui/icons/hugeicons/route";
import { Favourite } from "../animate-ui/icons/hugeicons/favourite";
import { Activity01 } from "../animate-ui/icons/hugeicons/activity-01";
import { Gift } from "../animate-ui/icons/hugeicons/gift";
import { Tag } from "../animate-ui/icons/hugeicons/tag";

interface SidebarLink {
  text: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarItem {
  id: string;
  text: string;
  icon: React.ReactNode;
  href?: string;
  links?: SidebarLink[];
}

interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

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
  const hydrateSidebar = useStore(coreStore, (state) => state.hydrateSidebar);
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isCollapsed = isSidebarCollapsed && !isMobile;

  const sidebarHydrated = React.useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );

  useEffect(() => {
    hydrateSidebar();
  }, [hydrateSidebar]);

  useEffect(() => {
    setSidebarHiddenOnMobile(true);
  }, [pathname, setSidebarHiddenOnMobile]);

  const { activeOrg, activeStreamer, isOrgMode } = useUserContext();

  const sections: SidebarSection[] = useMemo(() => {
    if (!activeOrg) {
      return [
        {
          id: "home",
          title: "",
          items: [
            {
              id: "explore",
              text: "Explore",
              icon: <Compass size={16} />,
              href: "/app",
            },
          ],
        },
        {
          id: "account",
          title: "Account",
          items: [
            {
              id: "settings",
              text: lang.data.app.sidebar.links.settings.title,
              icon: <Settings02 size={16} />,
              links: [
                {
                  text: lang.data.app.sidebar.links.settings.account,
                  icon: <UserRound size={16} />,
                  href: "/app/account",
                },
                {
                  text: lang.data.app.sidebar.links.settings.security,
                  icon: <ShieldCheck size={16} />,
                  href: "/app/account/security",
                },
                {
                  text: lang.data.app.sidebar.links.settings.danger,
                  icon: <OctagonAlert size={16} />,
                  href: "/app/account/danger",
                },
              ],
            },
          ],
        },
      ];
    }

    const isOwner = activeOrg?.role === "OWNER";
    const isOwnerOrAdmin = isOwner || activeOrg?.role === "ADMIN";

    const canViewOrg = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_VIEW);
    const canManageMembers = isOwnerOrAdmin || hasAnyPermission(activeOrg?.permissions, OrgPerm.ORG_MEMBERS_MANAGE);
    const canManageRoles = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_ROLES_MANAGE);
    const canViewStreamers = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.STREAMER_VIEW);
    const canManageSettings = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MANAGE);
    const canViewAudit = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MANAGE);
    const canViewBilling = isOwnerOrAdmin;
    const canViewTransactions = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.TRANSACTION_VIEW);

    const orgKey = activeOrg?.slug || activeOrg?.id || "org";
    const streamerKey = activeStreamer?.name || activeStreamer?.id || "streamer";

    const orgPages = ["/members", "/streamers", "/audit", "/settings", "/billing", "/transactions"];
    const isOrgRoute =
      pathname === `/app/${orgKey}` ||
      orgPages.some((p) => pathname.startsWith(`/app/${orgKey}${p}`));
    const hasAnyOrgAccess =
      isOwnerOrAdmin ||
      canViewOrg ||
      canManageMembers ||
      canManageRoles ||
      canViewStreamers ||
      canManageSettings ||
      canViewTransactions;
    const showOrgManagement = (isOrgMode || isOrgRoute) && hasAnyOrgAccess;

    if (showOrgManagement) {
      const orgItems: SidebarItem[] = [];
      if (canViewOrg) {
        orgItems.push({
          id: "org-overview",
          text: "Overview",
          icon: <ChartLine size={16} />,
          href: `/app/${orgKey}`,
        });
      }
      if (canManageMembers || canManageRoles) {
        orgItems.push({
          id: "org-members",
          text: "Members & Staff",
          icon: <UsersRound size={16} />,
          href: `/app/${orgKey}/members`,
        });
      }
      if (canViewStreamers) {
        orgItems.push({
          id: "org-streamers",
          text: "Channels",
          icon: <Clapperboard size={16} />,
          href: `/app/${orgKey}/streamers`,
        });
      }
      if (canViewAudit) {
        orgItems.push({
          id: "org-audit",
          text: "Audit Logs",
          icon: <Clock02 size={16} />,
          href: `/app/${orgKey}/audit`,
        });
      }
      orgItems.push({
        id: "org-settings",
        text: "Settings",
        icon: <Settings02 size={16} />,
        href: `/app/${orgKey}/settings`,
      });

      const financeItems: SidebarItem[] = [];
      if (canViewBilling) {
        financeItems.push({
          id: "org-billing",
          text: "Billing & Plans",
          icon: <CreditCard size={16} />,
          href: `/app/${orgKey}/billing`,
        });
      }

      const sections: SidebarSection[] = [];
      if (orgItems.length > 0) {
        sections.push({
          id: "organization",
          title: "Organization",
          items: orgItems,
        });
      }
      if (financeItems.length > 0) {
        sections.push({
          id: "finance",
          title: "Finance",
          items: financeItems,
        });
      }
      sections.push(
        {
          id: "account",
          title: "Account",
          items: [
            {
              id: "settings",
              text: lang.data.app.sidebar.links.settings.title,
              icon: <Settings02 size={16} />,
              links: [
                {
                  text: lang.data.app.sidebar.links.settings.account,
                  icon: <UserRound size={16} />,
                  href: "/app/account",
                },
                {
                  text: lang.data.app.sidebar.links.settings.security,
                  icon: <ShieldCheck size={16} />,
                  href: "/app/account/security",
                },
                {
                  text: lang.data.app.sidebar.links.settings.danger,
                  icon: <OctagonAlert size={16} />,
                  href: "/app/account/danger",
                },
              ],
            },
          ],
        });
      return sections;
    }

    const canViewStreamerBasic =
      canAccessStreamer(activeOrg, activeStreamer, StreamerPerm.STREAMER_VIEW, OrgPerm.STREAMER_VIEW);
    const canEditProfile =
      canAccessStreamer(activeOrg, activeStreamer, StreamerPerm.STREAMER_MANAGE, OrgPerm.STREAMER_MANAGE);
    const canViewProfile = canViewStreamerBasic || canEditProfile;

    const canViewAlertbox =
      canAccessStreamer(activeOrg, activeStreamer, StreamerPerm.STREAMER_WIDGET_MANAGE, OrgPerm.WIDGET_MANAGE) ||
      hasPermission(activeOrg?.permissions, OrgPerm.WIDGET_VIEW);
    const canViewIntegrations =
      canAccessStreamer(activeOrg, activeStreamer, StreamerPerm.STREAMER_INTEGRATION_MANAGE, OrgPerm.INTEGRATION_MANAGE) ||
      hasPermission(activeOrg?.permissions, OrgPerm.INTEGRATION_VIEW);
    const canViewAnalytics =
      canAccessStreamer(activeOrg, activeStreamer, StreamerPerm.STREAMER_ANALYTICS_VIEW, OrgPerm.ANALYTICS_VIEW) ||
      canAccessStreamer(activeOrg, activeStreamer, StreamerPerm.STREAMER_TRANSACTION_VIEW, OrgPerm.TRANSACTION_VIEW);

    const streamerTitle = activeStreamer?.displayName || activeStreamer?.name
      ? `Channel: ${activeStreamer.displayName || activeStreamer.name}`
      : "Channel";

    const streamerItems: SidebarItem[] = [];

    if (canViewStreamerBasic || canViewAnalytics) {
      streamerItems.push({
        id: "dashboard",
        text: lang.data.header.user_chip.links.dashboard,
        icon: <ChartLine size={16} />,
        href: `/app/${orgKey}/${streamerKey}`,
      });
    }

    if (canViewProfile) {
      streamerItems.push({
        id: "profile",
        text: lang.data.app.sidebar.links.profile,
        icon: <UserRound size={16} />,
        href: `/app/${orgKey}/${streamerKey}/profile`,
      });
    }

    if (canViewIntegrations) {
      streamerItems.push({
        id: "connections",
        text: lang.data.app.sidebar.links.connection,
        icon: <Route size={16} />,
        href: `/app/${orgKey}/${streamerKey}/connections`,
      });
    }

    if (canViewAlertbox) {
      streamerItems.push({
        id: "alertbox",
        text: lang.data.app.sidebar.links.alertbox.title,
        icon: <MessageSquareHeart className="rotate-0!" size={16} />,
        links: [
          {
            text: lang.data.app.sidebar.links.alertbox.donation,
            icon: <Favourite size={16} />,
            href: `/app/${orgKey}/${streamerKey}/alertbox/tip`,
          },
          {
            text: lang.data.app.sidebar.links.alertbox.subscription,
            icon: <Gift size={16} />,
            href: `/app/${orgKey}/${streamerKey}/alertbox/membership`,
          },
          {
            text: lang.data.app.sidebar.links.alertbox.purchased,
            icon: <Tag size={16} />,
            href: `/app/${orgKey}/${streamerKey}/alertbox/purchased`,
          },
        ],
      });
    }

    if (canViewAnalytics) {
      streamerItems.push({
        id: "member",
        text: "Supporters",
        icon: <UsersRound className="rotate-0!" size={16} />,
        links: [
          {
            text: "Donation history",
            icon: <CreditCard size={16} />,
            href: "/app/member/history",
          },
        ],
      });
    }

    if (canViewAnalytics) {
      streamerItems.push({
        id: "streamer-transactions",
        text: "Transactions",
        icon: <Activity01 size={16} />,
        href: `/app/${orgKey}/${streamerKey}/transactions`,
      });
    }

    streamerItems.push({
      id: "streamer-audit",
      text: "Audit Logs",
      icon: <Clock02 size={16} />,
      href: `/app/${orgKey}/${streamerKey}/audit`,
    });


    return [
      {
        id: "streamer",
        title: streamerTitle,
        items: streamerItems,
      },
      {
        id: "account",
        title: "Account",
        items: [
          {
            id: "settings",
            text: lang.data.app.sidebar.links.settings.title,
            icon: <Settings02 size={16} />,
            links: [
              {
                text: lang.data.app.sidebar.links.settings.account,
                icon: <UserRound size={16} />,
                href: "/app/account",
              },
              {
                text: lang.data.app.sidebar.links.settings.security,
                icon: <ShieldCheck size={16} />,
                href: "/app/account/security",
              },
              {
                text: lang.data.app.sidebar.links.settings.danger,
                icon: <OctagonAlert size={16} />,
                href: "/app/account/danger",
              },
            ],
          },
        ],
      },
    ];
  }, [lang, activeOrg, activeStreamer, isOrgMode, pathname]);

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
          "sticky top-(--status-banner-height,0px) h-[calc(100vh-var(--status-banner-height,0))] z-30 p-2 pt-2 md:pt-2 bg-sidebar flex flex-col text-foreground gap-1 select-none overflow-x-hidden",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0!",
          "max-md:fixed max-md:top-(--status-banner-height,0px) max-md:left-0 max-md:w-64! max-md:z-20030 max-md:shadow-2xl max-md:border-r max-md:border-border/40 max-md:h-[calc(100vh-var(--status-banner-height,0))]",
          isSidebarHiddenOnMobile ? "max-md:-translate-x-full" : "max-md:translate-x-0",
        )}
      >
        <div className={cn("flex items-center justify-between shrink-0 px-3 py-2", isSidebarCollapsed && "px-1.5")}>
          <div className="flex items-center gap-2">
            <HandHeartIcon size={26} weight="fill" className="text-foreground" />
            <span className={cn("text-sm font-light font-momo-trust-display tracking-wider transition-all", isSidebarCollapsed && "opacity-0 pointer-events-none")}>
              AlertBox<span className="text-xs opacity-60 ml-0.5 font-light font-momo-trust-display tracking-wider">org</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-8 rounded-lg text-foreground/50 hover:text-foreground"
            onClick={() => setSidebarHiddenOnMobile(true)}
            aria-label="Close sidebar"
          >
            <XIcon size={18} weight="bold" />
          </Button>
        </div>

        <OrgSwitcher isCollapsed={isCollapsed} />
        <StreamerSelector isCollapsed={isCollapsed} />

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto overflow-x-hidden min-h-0 pt-0.5">
          {sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-0.5">
              {!isCollapsed && section.title && (
                <div className="px-2 pt-2 pb-0.5 text-xs font-semibold text-muted-foreground/60">
                  {section.title}
                </div>
              )}
              {section.items.map((l: SidebarItem) =>
                !l.href ? (
                  <Collapsible.Root key={`${l.id}-${sidebarHydrated}`} className={"group/collapsible"}>
                    <AnimateIcon animateOnHover animateOnTap={"default-loop"} asChild>
                      <Collapsible.Trigger
                        className={cn(
                          "rounded-lg whitespace-nowrap group overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start items-center flex no-underline!",
                          "hover:bg-primary/5 hover:text-primary",
                          isCollapsed &&
                          "aria-expanded:bg-background/80 aria-expanded:rounded-b-none",
                          isSidebarCollapsed && "p-2.5"
                        )}
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
                              <div className="group-data-open/collapsible:rotate-180 transition-transform duration-200">
                                <ArrowDown01 size={12} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Collapsible.Trigger>
                    </AnimateIcon>
                    <Collapsible.Panel
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
                          l.links.map((ll: SidebarLink, ii: number) => (
                            <Link key={ii} href={ll.href}>
                              <AnimateIcon animateOnHover asChild>
                                <Button
                                  className={cn(
                                    "rounded-lg text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start relative overflow-hidden",
                                    pathname === ll.href && "text-foreground",
                                    isSidebarCollapsed && "p-2.5"
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
                                        className="absolute inset-0 rounded-lg bg-foreground/10 z-50 transition-none!"
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
                              </AnimateIcon>
                            </Link>
                          ))}
                      </div>
                    </Collapsible.Panel>
                  </Collapsible.Root>
                ) : (
                  <Link key={l.id} href={l.href}>
                    <AnimateIcon animateOnHover asChild>
                      <Button
                        className={cn(
                          "rounded-lg text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start relative overflow-hidden",
                          pathname === l.href && "text-foreground",
                          isSidebarCollapsed && "p-2.5"
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
                              className="absolute inset-0 rounded-lg bg-foreground/10 z-50 transition-none!"
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
                    </AnimateIcon>
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <AnimateIcon animateOnHover asChild>
          <Button
            className={cn(
              "rounded-lg overflow-hidden text-base gap-2.25 border-0 p-3 h-9 max-w-none text-foreground/40 w-full justify-start mt-auto shrink-0 max-md:hidden",
              "hover:bg-primary/5 hover:text-primary",
              isSidebarCollapsed && "p-2.5"
            )}
            variant="ghost"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          >
            <div className={cn(
              "size-4 shrink-0 flex items-center justify-center duration-300 ease-out",
              isSidebarCollapsed && "rotate-180",
            )}>
              <PanelLeftClose
                size={14}
                className={cn(
                  "rotate-180",
                  !isSidebarCollapsed && "hidden",
                )}
              />
              <PanelLeftOpen
                size={14}
                className={cn(
                  isSidebarCollapsed && "hidden",
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
        </AnimateIcon>

        <NavUser isCollapsed={isCollapsed} />
      </motion.aside>
    </>
  );
}

export default AppSidebar;
