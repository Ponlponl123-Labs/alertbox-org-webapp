export interface User {
  id: string;
  email: string;
  createWith: string;
  createdAt: string;
  updatedAt: string;
  disabledAt: string | null;
  deletedAt: string | null;
  profile: Profile | null;
  widgets: Widget[];
}

export interface Profile {
  id: string;
  name: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  accentColor: number;
  uri: string | null;
  uriCooldownEnd: string | null;
  publishedAt: string | null;
  twitch: string | null;
  youtube: string | null;
  twitter: string | null;
  facebook: string | null;
  reddit: string | null;
  discord: string | null;
  defaultDonorName: string;
  defaultDonorAmount: number;
  defaultDonorAvatar: string | null;
  currency: number | null;
  minTipAmount: number;
  maxTipAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Widget {
  id: string;
  type: "ALERTBOX" | "TIPJAR" | "GOALBAR";
  token: string;
  alertbox?: AlertboxSetting | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertboxSetting {
  id: string;
  globalVolume: number;
  events: AlertboxEvent[];
}

export interface AlertboxEvent {
  id: string;
  eventType: "TIP" | "MEMBERSHIP" | "MERCH" | "FOLLOW";
  isEnabled: boolean;
  prefix: string | null;
  subfix: string | null;
  messageLayout: string | null;
  minVisibleDuration: number;
  animIn: string | null;
  animOut: string | null;
  animInDuration: number;
  animOutDuration: number;
  image: string | null;
  sound: string | null;
  soundVolume: number;
  fontFamily: string | null;
  fontSize: number;
  fontWeight: number;
  textColor: number;
  accentColor: number;
  subfixColor: number;
  textShadowColor: number;
  textShadowSize: number;
  outlineColor: number;
  outlineSize: number;
  ttsEnabled: boolean;
  ttsMinTip: number;
  ttsVoice: string | null;
  ttsVolume: number;
  ttsSpeed: number;
  ttsPitch: number;
  ttsDelay: number;
  ttsOptions: number;
  updatedAt: string;
}

export interface Connections {
  stripe: string | null;
  bmac: string | null;
  kofi: string | null;
  ffp: string | null;
  youtube: string | null;
  facebook: string | null;
  twitch: string | null;
  patreon: string | null;
  streamlabs: string | null;
}

export interface Device {
  id: string;
  createdAt: string;
  disabledAt: string | null;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  platform: string | null;
  platformMajor: string | null;
  platformVersion: string | null;
  platformType: string | null;
  cpuArchitecture: string | null;
  deviceModel: string | null;
  deviceType: string | null;
  deviceVendor: string | null;
  asn: string | null;
  city: string | null;
  continentCode: string | null;
  country: string | null;
  countryCode: string | null;
  countryCodeIso3: string | null;
  isp: string | null;
  latitude: number | null;
  longitude: number | null;
  postal: string | null;
  region: string | null;
  regionCode: string | null;
  os: string | null;
  osVersion: string | null;
  lastUsed: string | null;
  isThisDevice: boolean;
  isRevoked?: boolean;
}
