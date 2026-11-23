"use client";
import { useUserContext } from "@/contexts/user";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Login from "./login";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/layout/app-sidebar";
import { motion, useScroll, useTransform } from "motion/react";
import { clamp, cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GithubLogoIcon, HandHeartIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { orgStore } from "@/hooks/store/org";
import { WorkspaceSwitchSkeleton } from "@/components/shared/workspace-switch-skeleton";
import OrgOverviewPage from "@/app/app/[org]/page";
import StreamerDashboardPage from "@/app/app/[org]/[streamer]/page";

const NON_ORG_SEGMENTS = new Set(["account", "org", "login", "connections"]);
const ORG_SUBPAGES = new Set(["members", "streamers", "audit", "settings", "billing", "transactions"]);

function getWorkspaceHomeKey(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "app" || !parts[1] || NON_ORG_SEGMENTS.has(parts[1])) {
    return pathname;
  }
  if (parts.length === 2) return "org-home";
  if (parts.length === 3 && !ORG_SUBPAGES.has(parts[2])) return "streamer-home";
  return pathname;
}
import { PageTransition } from "@/components/animate-ui/components/page-transition";
import { Dialog, DialogContent, DialogTrigger } from "@/components/custom-ui/dialog";
import HelpfulRating from "@/components/kokonutui/helpful-rating";
import { LanguageSwitcher, ViolationAlertBanner } from "@/components/shared";
import { getApiUrl } from "@/lib/api";
import { toast } from "@/components/custom-ui/toast";

export const AppFooter = React.memo(function AppFooter() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <footer className="flex flex-col sm:flex-row items-center gap-2 opacity-30 p-4 sm:p-6 lg:p-12 select-none">
      <div className="flex flex-col justify-start max-sm:items-center gap-1">
        <div className="inline-flex gap-2">
          <HandHeartIcon size={22} weight="fill" className="text-foreground" />
          <span className="text-sm font-semibold font-sans">
            AlertBox<span className="text-xs opacity-60 ml-0.5 font-light tracking-wider">.org</span>
          </span>
        </div>
        <span className="text-xs font-light opacity-50">
          {lang.data.footer.author}
        </span>
      </div>
      <div className="flex flex-1 gap-2 justify-end">
        <Link href={"https://law.ponlponl123.com/tos"} target="_blank" rel="noopener noreferrer">
          <Button size={"xs"} variant="ghost" className={"rounded-lg h-full"}>
            {lang.data.footer.links.legal.tos}
          </Button>
        </Link>
        <Link href={"https://law.ponlponl123.com/privacy"} target="_blank" rel="noopener noreferrer">
          <Button size={"xs"} variant="ghost" className={"rounded-lg h-full"}>
            {lang.data.footer.links.legal.privacy}
          </Button>
        </Link>
        <Link href={"https://law.ponlponl123.com/additional/alertbox.org"} target="_blank" rel="noopener noreferrer">
          <Button size={"xs"} variant="ghost" className={"rounded-lg h-full"}>
            {lang.data.footer.links.legal.additional}
          </Button>
        </Link>
        <Link href={"https://github.com/ponlponl123-labs/alertbox-org"} target="_blank" rel="noopener noreferrer">
          <Button size="icon" variant="ghost" className={"rounded-lg"}>
            <GithubLogoIcon size={22} weight="fill" className="text-foreground" />
          </Button>
        </Link>
        <LanguageSwitcher showLabel />
      </div>
    </footer>
  );
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const scrollareaRef = useRef<HTMLDivElement | null>(null);
  const [hasScrollarea, setHasScrollarea] = useState(false);
  const setScrollarea = useCallback((node: HTMLDivElement | null) => {
    scrollareaRef.current = node;
    setHasScrollarea(Boolean(node));
  }, []);
  const { userInfo, isAuthLoading, authFetch } = useUserContext();
  const lang = useStore(coreStore, (state) => state.lang);
  const switchingTo = useStore(orgStore, (state) => state.switchingTo);
  const organizations = useStore(orgStore, (state) => state.organizations);
  const pathname = usePathname();
  const homeKey = getWorkspaceHomeKey(pathname);
  const activeHomeView = switchingTo?.hasCache
    ? switchingTo.type === "streamer"
      ? "streamer-home"
      : "org-home"
    : homeKey === "org-home" || homeKey === "streamer-home"
      ? homeKey
      : null;

  useEffect(() => {
    if (pathname) {
      orgStore.getState().markVisitedPath(pathname);
    }
    if (!switchingTo) return;
    if (pathname !== switchingTo.fromPath) {
      orgStore.getState().setSwitchingTo(null);
      return;
    }
    const fallbackTimer = setTimeout(() => {
      orgStore.getState().setSwitchingTo(null);
    }, 15000);
    return () => clearTimeout(fallbackTimer);
  }, [pathname, switchingTo]);

  useEffect(() => {
    if (switchingTo || !organizations.length) return;
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] !== "app" || !parts[1] || NON_ORG_SEGMENTS.has(parts[1])) return;
    const targetOrg = organizations.find((o) => String(o.id) === parts[1] || o.slug === parts[1]);
    if (!targetOrg) return;
    const state = orgStore.getState();
    if (String(targetOrg.id) !== String(state.activeOrgId)) {
      state.setActiveOrgId(String(targetOrg.id));
    }
    if (parts.length === 2) {
      if (!state.isOrgMode) state.setOrgMode(true);
    } else if (parts.length === 3 && !ORG_SUBPAGES.has(parts[2])) {
      const targetStreamer = targetOrg.streamers?.find(
        (s) => String(s.id) === parts[2] || s.name === parts[2] || s.uri === parts[2],
      );
      if (targetStreamer) {
        if (String(targetStreamer.id) !== String(state.activeStreamerId)) {
          state.setActiveStreamerId(String(targetStreamer.id));
        }
        if (state.isOrgMode) state.setOrgMode(false);
      }
    }
  }, [pathname, organizations, switchingTo]);
  const scroll = useScroll({
    container: hasScrollarea ? scrollareaRef : undefined,
  });

  const headerOpacity = useTransform(scroll.scrollY, (v) =>
    clamp(v / 200, 0, 1),
  );

  const handleFeedbackSubmit = useCallback(
    async (feedback: { rating: number; reasons: string[]; note: string }) => {
      try {
        const res = await authFetch(getApiUrl("/api/v1/me/feedback"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: feedback.rating,
            reasons: feedback.reasons,
            message: feedback.note,
            pathname: pathname || "/app",
          }),
        });
        if (res.ok) {
          toast.success(lang.data.app.feedback_sent);
        } else {
          const msg = await res.text();
          toast.error(msg || lang.data.app.feedback_failed);
        }
      } catch {
        toast.error(lang.data.app.feedback_failed);
      }
    },
    [authFetch, pathname, lang.data.app.feedback_sent, lang.data.app.feedback_failed],
  );

  return (
    <div
      id="webapp-wrapper"
      className={cn("flex min-w-0 h-[calc(100dvh-var(--status-banner-height,0))] -mb-(--status-banner-height,0) w-dvw", userInfo && "bg-sidebar")}
    >
      {userInfo && <AppSidebar />}
      <div className="fixed bottom-2 right-2 z-50">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" className="rounded-xs" />}>
            {lang.data.app.feedback_button}
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <HelpfulRating
              onSubmit={handleFeedbackSubmit}
              className="bg-transparent! border-0 **:font-sans **:overflow-visible"
            />
          </DialogContent>
        </Dialog>
      </div>
      <motion.main
        id="webapp-main"
        className="flex-1 flex flex-col min-w-0 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {userInfo && <ViolationAlertBanner />}
        {!userInfo && !pathname.startsWith("/app/login/") ? (
          isAuthLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[60dvh]">
              <Spinner className="size-7 text-muted-foreground" />
            </div>
          ) : (
            <Login />
          )
        ) : (
          <ScrollArea
            ref={setScrollarea}
            className={"h-[calc(100dvh-var(--status-banner-height,0px)-var(--violation-banner-height,0px)-8px)] flex-1 flex flex-col relative m-1 rounded-sm border border-border bg-black/10 dark:bg-background"}
          >

            <PageTransition
              effect="fade"
              pageKey={activeHomeView ?? pathname}
              className="relative min-w-0 h-[calc(100dvh-var(--status-banner-height,0px)-var(--violation-banner-height,0px)-8px)] flex-1"
            >
              <motion.div
                style={{ opacity: headerOpacity }}
                className="w-full h-24 -mb-24 sticky top-0 bg-background mask-b-from-0% z-20 pointer-events-none"
              />
              <div className="flex-1 w-full min-h-[calc(100%-4rem-var(--status-banner-height,0))] flex flex-col z-10">
                <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
                  {switchingTo && !switchingTo.hasCache ? (
                    <WorkspaceSwitchSkeleton
                      key={`switch-${switchingTo.targetPath}`}
                      type={switchingTo.type}
                      label={switchingTo.label}
                    />
                  ) : activeHomeView === "streamer-home" ? (
                    <StreamerDashboardPage key="persistent-streamer-home" />
                  ) : activeHomeView === "org-home" ? (
                    <OrgOverviewPage key="persistent-org-home" />
                  ) : (
                    children
                  )}
                </div>
              </div>
              <AppFooter />
            </PageTransition>
          </ScrollArea>
        )}
      </motion.main>
    </div>
  );
}

export default AppLayout;
