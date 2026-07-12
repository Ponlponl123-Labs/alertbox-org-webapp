import { Stripe, BuyMeACoffee, KoFi } from "@thesvg/react";
import { FeelFreePay } from "@/components/icons";
import { ComponentType, SVGProps } from "react";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "stripe",
    name: "Stripe",
    icon: Stripe,
    href: "https://stripe.com/",
  },
  {
    id: "buymeacoffee",
    name: "Buy Me A Coffee",
    icon: BuyMeACoffee,
    href: "https://buymeacoffee.com/",
  },
  {
    id: "kofi",
    name: "Ko-Fi",
    icon: KoFi,
    href: "https://ko-fi.com/",
  },
  {
    id: "feelfreepay",
    name: "FeelFreePay",
    icon: FeelFreePay,
    href: "https://feelfreepay.com/",
  },
];
