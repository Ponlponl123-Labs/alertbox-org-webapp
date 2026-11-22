import { BuyMeACoffee, KoFi, Streamlabs, Stripe } from "@thesvg/react";
import { StreamlabsOption } from "@/consts/streamlabs";
import { cn } from "@/lib/utils";

export function countEnabledBits(mask: number): number {
  let count = 0;
  for (const bit of [
    StreamlabsOption.BMAC_DONATION_SUCCESS,
    StreamlabsOption.BMAC_MEMBERSHIP_SUCCESS,
    StreamlabsOption.KOFI_DONATION_SUCCESS,
    StreamlabsOption.KOFI_PURCHASE_SUCCESS,
    StreamlabsOption.STRIPE_PAYMENT_SUCCESS,
  ]) {
    if ((mask & bit) !== 0) count++;
  }
  return count;
}

export function renderProviderIcon(provider: string, className = "size-4") {
  const key = provider.toLowerCase();
  if (key === "buymeacoffee" || key === "bmac") {
    return <BuyMeACoffee className={cn(className, "*:fill-amber-400")} />;
  }
  if (key === "kofi") {
    return <KoFi className={className} />;
  }
  if (key === "stripe") {
    return <Stripe className={className} />;
  }
  return <Streamlabs className={className} />;
}
