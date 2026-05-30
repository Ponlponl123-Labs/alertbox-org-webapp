import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { preload } from "@/consts/theme";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
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
        geistSans.variable,
        geistMono.variable,
        "font-mono",
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
