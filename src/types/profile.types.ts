export type PaymentMethodType =
  | "stripe"
  | "xendit"
  | "omise"
  | "2c2p"
  | "feelfreepay"
  | "kofi"
  | "bmac";

export interface PublicProfileData {
  name: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  accentColor: number;
  badges: number;
  twitch: string | null;
  youtube: string | null;
  twitter: string | null;
  facebook: string | null;
  reddit: string | null;
  discord: string | null;
  defaultDonorName?: string | null;
  defaultDonorAmount?: number | null;
  minTipAmount?: number | null;
  maxTipAmount?: number | null;
  currency?: number | null;
  kofiUsername?: string | null;
  bmacUsername?: string | null;
  integrations?: {
    stripe: boolean;
    xendit: boolean;
    omise: boolean;
    "2c2p": boolean;
    feelfreepay: boolean;
    kofi: boolean;
    bmac: boolean;
  } | null;
}
