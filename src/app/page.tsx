"use client";

import dynamic from "next/dynamic";
import HeroStudio from "./index/hero-studio";
import SocialProof from "./index/social-proof";
import CentralizedHub from "./index/centralized-hub";

const Features = dynamic(() => import("./index/features"), {
  ssr: true,
});
const ComparisonTable = dynamic(() => import("./index/comparison-table"), {
  ssr: true,
});
const Testimonials = dynamic(() => import("./index/testimonials"), {
  ssr: true,
});
const CinematicInsights = dynamic(() => import("./index/cinematic-insights"), {
  ssr: true,
});
const FAQSection = dynamic(() => import("./index/faq-section"), {
  ssr: true,
});
const CTABanner = dynamic(() => import("./index/cta-banner"), {
  ssr: true,
});

export default function Home() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <HeroStudio />
      <SocialProof />
      <CentralizedHub />
      <Features />
      <ComparisonTable />
      <Testimonials />
      <CinematicInsights />
      <FAQSection />
      <CTABanner />
    </div>
  );
}
