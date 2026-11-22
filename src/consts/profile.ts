/**
 * Bit flags representing profile badges.
 */
export const ProfileBadges = {
  VERIFIED: 1 << 0, // 1
  STAFF: 1 << 1, // 2
  EARLY_USER: 1 << 2, // 4
  PARTNER: 1 << 3, // 8
} as const;

/**
 * Bitmask flags representing profile options.
 */
export const ProfileOptions = {
  // Reserved for future options
} as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const RESERVED_NAMES = new Set([
  "admin", "administrator", "system", "alertbox", "tip-to", "tipto", "support",
  "help", "api", "auth", "login", "logout", "signin", "signup", "register",
  "account", "profile", "settings", "config", "root", "security", "legal",
  "terms", "privacy", "about", "contact", "blog", "dev", "developer", "docs",
  "status", "mail", "email", "webmaster", "hostmaster", "postmaster",
]);

export const ONBOARDING_MOCK_PROFILES = [
  {
    key: "kai" as const,
    name: "Dear-zero-one",
    handle: "@dearzenone",
    avatar: "/promoted/avatar/dearzenone.png",
    accent: "#f43f5e",
    cls: "-translate-x-64 sm:-translate-x-88 lg:-translate-x-[28rem] xl:-translate-x-[34rem] -translate-y-40 sm:-translate-y-44 lg:-translate-y-56 xl:-translate-y-64",
    rotZ: -3,
  },
  {
    key: "torn" as const,
    name: "Petekung",
    handle: "@petekung",
    avatar: "/promoted/avatar/petekung.png",
    accent: "#6366f1",
    cls: "translate-x-64 sm:translate-x-88 lg:translate-x-[28rem] xl:translate-x-[34rem] -translate-y-36 sm:-translate-y-40 lg:-translate-y-52 xl:-translate-y-60",
    rotZ: 3,
  },
  {
    key: "cactuzz" as const,
    name: "P'Pong",
    handle: "@banpong",
    avatar: "/promoted/avatar/banpong.png",
    accent: "#10b981",
    cls: "-translate-x-60 sm:-translate-x-80 lg:-translate-x-[26rem] xl:-translate-x-[32rem] translate-y-40 sm:translate-y-44 lg:translate-y-56 xl:translate-y-64",
    rotZ: 2,
  },
  {
    key: "ponlponl" as const,
    name: "Ponlponl123",
    handle: "@ponlponl123",
    avatar: "/promoted/avatar/ponlponl123-osu-avatar.png",
    accent: "#3b82f6",
    cls: "translate-x-60 sm:translate-x-80 lg:translate-x-[26rem] xl:translate-x-[32rem] translate-y-36 sm:translate-y-40 lg:translate-y-52 xl:translate-y-60",
    rotZ: -2,
  },
];
