import type { Metadata } from "next";
import {
  Google_Sans,
  Fredoka,
  Geist_Mono,
  JetBrains_Mono,
} from "next/font/google";
import { preload } from "@/consts/theme";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fredokaSans = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const googleSans = Google_Sans({
  variable: "--font-google-sans",
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
        googleSans.variable,
        fredokaSans.variable,
        geistMono.variable,
        "font-sans",
        jetbrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main id="app" className="flex-1 min-h-screen flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
