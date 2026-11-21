import type { Metadata } from "next";
import {
  Momo_Trust_Display,
  Noto_Serif_Thai,
  Inter_Tight,
  DM_Sans,
  Rubik,
  JetBrains_Mono,
  Lexend_Exa,
  Sarabun,
  Bai_Jamjuree,
} from "next/font/google";
import { CountryFlagsPolyfill } from "@/components/shared/country-flags-polyfill";
import { preload } from "@/consts/theme";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { UserContextProvider } from "@/contexts/user";
import { TooltipProvider } from "@/components/ui/tooltip";
import BackendLivenessChecker from "@/components/shared/backend-liveness-checker";
import BackendLivenessBanner from "@/components/shared/backend-liveness-banner";
import Provider from "./provider";
import { ScrollArea } from "@/components/ui/scroll-area";

const momoTrustDisplay = Momo_Trust_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-momo-trust-display",
  display: "swap",
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif']
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const notoSarifThai = Noto_Serif_Thai({
  variable: "--font-noto-sarif-thai",
  subsets: ["latin"],
  display: "swap",
});

const lexendExa = Lexend_Exa({
  variable: "--font-lexend-exa",
  subsets: ["latin"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const baiJamJuree = Bai_Jamjuree({
  variable: "--font-bai-jamjuree",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlertBox.org",
  description: "Alert Box Donation for Everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-dvh overflow-hidden",
        "antialiased",
        momoTrustDisplay.variable,
        dmSans.variable,
        rubik.variable,
        baiJamJuree.variable,
        notoSarifThai.variable,
        "font-sans",
        jetbrainsMono.variable,
        lexendExa.variable,
        sarabun.variable,
        interTight.variable,
      )}
      suppressHydrationWarning
      style={{
        overflowX: "hidden"
      }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
      </head>
      <body className="min-h-[calc(100dvh-var(--status-banner-height,0))] flex flex-col relative transition-[margin-top] duration-200 ease-out"
        suppressHydrationWarning
        style={{
          overflowX: "initial",
          overflowY: "initial"
        }}
      >
        <UserContextProvider>
          <ScrollArea className={"w-dvw h-dvh z-50"}>
            <BackendLivenessChecker />
            <BackendLivenessBanner />
            <TooltipProvider>
              <Provider>
                <Header />
                <main id="app" className="w-[calc(100dvw-var(--scrollbar-margin,0))] min-h-[calc(100dvh-var(--status-banner-height,0))] flex flex-col">
                  {children}
                </main>
                <Footer />
                <CountryFlagsPolyfill />
              </Provider>
            </TooltipProvider>
          </ScrollArea>
        </UserContextProvider>
      </body>
    </html>
  );
}
