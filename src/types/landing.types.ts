import type { coreStore } from "@/hooks/store/core";

export type CoreStoreState = ReturnType<typeof coreStore.getState>;
export type IndexPageData = CoreStoreState["lang"]["data"]["pages"]["index"];
export type HeroSectionData = IndexPageData["hero"];
export type FeaturesSectionData = NonNullable<IndexPageData["sections"]["features"]>;
export type PrivacyGuardData = NonNullable<IndexPageData["sections"]["privacy_guard"]>;
export type HowItWorksData = IndexPageData["sections"]["howitworks"];
export type ComparisonData = IndexPageData["sections"]["comparison"];
export type PricingHighlightData = IndexPageData["sections"]["pricing_highlight"];
export type FAQData = IndexPageData["sections"]["faq"];
export type CTABannerData = IndexPageData["sections"]["cta_banner"];
export type SocialProofData = IndexPageData["sections"]["social_proof"];
export type TestimonialsData = IndexPageData["sections"]["testimonials"];

export interface TestimonialItem {
  name: string;
  handle: string;
  role: string;
  quote: string;
  avatar?: string;
}

export interface ComparisonRow {
  name: string;
  category?: string;
  alertbox: boolean | string;
  competitors: boolean | string;
}

export interface FAQItemData {
  q: string;
  a: string;
}

export type PricingPageData = CoreStoreState["lang"]["data"]["pricing"];
export type DonatePageData = CoreStoreState["lang"]["data"]["donate"];
export type AboutPageData = CoreStoreState["lang"]["data"]["about"];

export interface PricingProviderItem {
  name: string;
  fee: string;
  desc: string;
}

