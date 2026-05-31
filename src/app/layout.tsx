import type { Metadata } from "next";
import {
  Noto_Serif_Thai,
  Fredoka,
  Geist_Mono,
  JetBrains_Mono,
  Bai_Jamjuree,
} from "next/font/google";
import { CountryFlagsPolyfill } from "@/components/CountryFlagsPolyfill";
import { preload } from "@/consts/theme";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { UserContextProvider } from "@/contexts/user";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fredokaSans = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const notoSarifThai = Noto_Serif_Thai({
  variable: "--font-noto-sarif-thai",
  subsets: ["latin"],
});

const baiJamJuree = Bai_Jamjuree({
  variable: "--font-bai-jamjuree",
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      )}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
      </head>
      <body className="min-h-full flex flex-col">
        <UserContextProvider>
          <Header />
          <main id="app" className="flex-1 min-h-screen flex flex-col">
            {children}
          </main>
          <Footer />
          <CountryFlagsPolyfill />
        </UserContextProvider>
      </body>
    </html>
  );
}
