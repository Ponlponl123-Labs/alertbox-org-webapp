import type { Metadata } from "next";
import {
  Noto_Serif_Thai,
  Afacad,
  Inter_Tight,
  Fredoka,
  Geist_Mono,
  JetBrains_Mono,
  Lexend_Exa,
  Sarabun,
  Bai_Jamjuree,
} from "next/font/google";
import { CountryFlagsPolyfill } from "@/components/CountryFlagsPolyfill";
import { preload } from "@/consts/theme";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { UserContextProvider } from "@/contexts/user";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import BackendLivenessChecker from "@/components/backend-liveness-checker";
import BackendLivenessBanner from "@/components/backend-liveness-banner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const afacadSans = Afacad({
  variable: "--font-afacad",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const fredokaSans = Fredoka({
  variable: "--font-fredoka",
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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        "h-full",
        "antialiased",
        baiJamJuree.variable,
        fredokaSans.variable,
        geistMono.variable,
        notoSarifThai.variable,
        "font-sans",
        jetbrainsMono.variable,
        lexendExa.variable,
        sarabun.variable,
        interTight.variable,
        afacadSans.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
      </head>
      <body className="min-h-full flex flex-col overflow-y-auto overflow-x-hidden">
        <Toaster />
        <UserContextProvider>
          <BackendLivenessChecker />
          <BackendLivenessBanner />
          <TooltipProvider>
            <Header />
            <main id="app" className="flex-1 min-h-screen flex flex-col">
              {children}
            </main>
            <Footer />
            <CountryFlagsPolyfill />
          </TooltipProvider>
        </UserContextProvider>
      </body>
    </html>
  );
}
