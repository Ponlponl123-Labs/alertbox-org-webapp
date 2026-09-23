"use client";

import { useMemo, useState } from "react";
import { useStore } from "zustand";
import "@scalar/api-reference-react/style.css";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ApiReferenceConfiguration, ApiReferenceReact } from "@scalar/api-reference-react";
import { GithubLogoIcon, PencilSimpleIcon, SmileyAngryIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getCookie } from "cookies-next/client";

export default function DocsPage() {
  const isDark = useStore(coreStore, (state) => state.isDark);
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo } = useUserContext();
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
  const [isUseMyHeaderCredential, setIsUseMyHeaderCredential] = useState(false);
  const token = useMemo(() => {
    const authCookie = getCookie("USRSS");
    if (!authCookie) return "ABC123";
    return isUseMyHeaderCredential && userInfo ? atob(authCookie) : "ABC123";
  }, [isUseMyHeaderCredential, userInfo]);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col pt-12",
        isDark ? "dark-mode" : "light-mode",
      )}
    >
      <header className="h-12 w-full fixed left-0 top-[calc(3rem + var(--status-banner-height, 0))] apply-smooth-transition bg-background/80 border-b border-border backdrop-blur-md z-50 flex items-center justify-between pl-4 pr-2">
        <h2 className="text-sm text-foreground/40 font-light tracking-widest pointer-events-none">{lang.data.pages.docs.devtools}</h2>
        <div className="flex items-center gap-2">

          <Tooltip>
            <TooltipTrigger disabled={!!userInfo}>
              <div className="flex items-center space-x-2 mr-4 transition-interactive has-data-unchecked:opacity-50 hover:has-data-unchecked:opacity-80">
                <Switch id="header-credential" checked={isUseMyHeaderCredential} onCheckedChange={(v) => !v ? setIsUseMyHeaderCredential(false) : setIsCredentialDialogOpen(true)} disabled={!userInfo} />
                <Label htmlFor="header-credential">
                  {
                    !userInfo &&
                    <WarningIcon className="text-yellow-500" />
                  }
                  {lang.data.pages.docs.use_header_credential}
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className={"rounded-2xl **:font-sans"}>
              <p>{lang.data.pages.docs.login_tooltip}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Link href="https://github.com/Ponlponl123-Labs/alertbox-org-api/tree/main/src/routes" target="_blank" />}>
              <Button variant="secondary" size="icon" className="rounded-xl">
                <PencilSimpleIcon size={18} weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className={"rounded-2xl **:font-sans"}>
              <p>{lang.data.pages.docs.edit_page}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Link href="https://github.com/Ponlponl123-Labs/alertbox-org" target="_blank" />}>
              <Button variant="secondary" size="icon" className="rounded-xl">
                <GithubLogoIcon size={18} weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className={"rounded-2xl **:font-sans"}>
              <p>{lang.data.pages.docs.github}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
      <ApiReferenceReact
        configuration={{
          url: getApiUrl("openapi/json"),
          layout: "modern",
          theme: "elysiajs",
          darkMode: isDark,
          forceDarkModeState: isDark ? "dark" : "light",
          hideDarkModeToggle: true,
          showDeveloperTools: "never",
          localization: (lang.key || "en") as ApiReferenceConfiguration["localization"],
          authentication: {
            preferredSecurityScheme: 'httpBearer',
            securitySchemes: {
              httpBearer: {
                type: 'http',
                bearerFormat: 'Bearer',
                scheme: 'bearer',
                token: isUseMyHeaderCredential && userInfo ? token : "ABC123"
              },
            }
          },
          searchHotKey: "k",
          customCss: `
            :root, .dark-mode, .scalar-app {
              --scalar-custom-header-height: calc(6rem + var(--status-banner-height, 0));
            }

            [data-v-app] {
              padding-top: 3rem !important;
            }

            /* Transparent backgrounds */
            .scalar-app,
            .scalar-app .references-layout,
            .scalar-app .references-rendered,
            .scalar-app .references-editor {
              background: transparent !important;
            }

            .scalar-container.scalar-client--open {
              padding-top: var(--scalar-custom-header-height);
            }

            /* Glassmorphism sidebar */
            .dark-mode .scalar-app .t-doc__sidebar {
              background: rgba(0, 0, 0, 0.3) !important;
              backdrop-filter: blur(12px) !important;
            }
            .light-mode .scalar-app .t-doc__sidebar {
              background: rgba(255, 255, 255, 0.45) !important;
              backdrop-filter: blur(12px) !important;
            }

            .scalar-app .t-doc__sidebar {
              height: calc(100dvh - var(--scalar-custom-header-height)) !important;
            }

            /* Desktop: hide redundant Scalar top header */
            @media (min-width: 1001px) {
              .t-doc__header {
                display: none !important;
              }
            }

            /* Mobile: position Scalar navigation bar beneath fixed header */
            @media (max-width: 1000px) {
              .t-doc__header {
                display: flex !important;
                position: sticky !important;
                top: var(--scalar-custom-header-height) !important;
                z-index: 40 !important;
                background: var(--scalar-background-2, rgba(26, 26, 26, 0.85)) !important;
                backdrop-filter: blur(8px) !important;
                border-bottom: 1px solid var(--scalar-border-color) !important;
              }
              .scalar-app .t-doc__sidebar {
                top: var(--scalar-custom-header-height) !important;
                height: calc(100dvh - var(--scalar-custom-header-height)) !important;
                z-index: 45 !important;
              }
            }
          `,
        }}
      />
      <AlertDialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
        <AlertDialogContent size="default" className="rounded-3xl max-w-md!">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 p-2 size-12 rounded-xl text-destructive dark:bg-destructive/20 dark:text-destructive">
              <SmileyAngryIcon weight="fill" size={12} />
            </AlertDialogMedia>
            <AlertDialogTitle className={"text-lg"}>
              {lang.data.pages.docs.dialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang.data.pages.docs.dialog.description} <br />
              <strong className="text-destructive">{lang.data.pages.docs.dialog.warning}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="secondary"
              className="rounded-xl"
            >
              {lang.data.pages.docs.dialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-xl"
              onClick={() => { setIsUseMyHeaderCredential(true); setIsCredentialDialogOpen(false) }}
            >
              {lang.data.pages.docs.dialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
