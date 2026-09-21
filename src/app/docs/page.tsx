"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DocsPage() {
  const isDark = useStore(coreStore, (state) => state.isDark);

  return (
    <div
      className={cn(
        "flex-1 h-[calc(100dvh-3rem-var(--status-banner-height,0))] flex flex-col pt-12",
        isDark ? "dark-mode" : "light-mode",
      )}
    >
      <ApiReferenceReact
        configuration={{
          url: getApiUrl("openapi/json"),
          layout: "modern",
          theme: "elysiajs",
          darkMode: isDark,
          forceDarkModeState: isDark ? "dark" : "light",
          hideDarkModeToggle: true,
          showDeveloperTools: "never",
          searchHotKey: "k",
          customCss: `
            :root, .dark-mode, .scalar-app {
              height: calc(100dvh - 3rem - var(--status-banner-height, 0)) !important;
              --scalar-custom-header-height: 48px;
            }

            /* Transparent backgrounds */
            .scalar-app,
            .scalar-app .references-layout,
            .scalar-app .references-rendered,
            .scalar-app .references-editor {
              background: transparent !important;
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
              height: calc(100dvh - 3rem - var(--status-banner-height, 0)) !important;
            }

            /* Prevent search bar & sticky elements from sticking under fixed header */
            .scalar-app .sticky,
            .scalar-app .top-0 {
              top: calc(3rem + var(--status-banner-height, 0)) !important;
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
                top: 48px !important;
                z-index: 40 !important;
                background: var(--scalar-background-2, rgba(26, 26, 26, 0.85)) !important;
                backdrop-filter: blur(8px) !important;
                border-bottom: 1px solid var(--scalar-border-color) !important;
              }
              .scalar-app .t-doc__sidebar {
                top: 48px !important;
                height: calc(100dvh - 48px - var(--status-banner-height, 0px)) !important;
                z-index: 45 !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
