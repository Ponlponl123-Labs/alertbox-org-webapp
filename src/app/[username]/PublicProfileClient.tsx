"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { getApiUrl } from "@/lib/api";
import { formatI18n } from "@/lib/i18n";
import { isSafeIframeHandle, safeDecodeURIComponent } from "@/lib/security";
import { getActiveBadges } from "@/lib/badges";
import { cn, getFallbackInitial } from "@/lib/utils";
import { numberToHexColor, getAccentForeground, hexToOklch } from "@/lib/color";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  FeelFreePay,
} from "@/components/icons";
import { Stripe, BuyMeACoffee, KoFi, Xendit } from "@thesvg/react";
import {
  SealCheckIcon,
  GhostIcon,
} from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion, useIsomorphicLayoutEffect, useScroll, useTransform, Variants } from "motion/react";
import { SocialLinks } from "@/components/shared";
import PullCord from "@/components/kokonutui/pull-cord";
import DrapeBackground from "@/components/kokonutui/drape-background";
import { PageTransition } from "@/components/animate-ui/components/page-transition";
import { Button } from "@/components/ui/button";
import { ArrowRight01 } from "@/components/animate-ui/icons/hugeicons/arrow-right-01";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowLeft01 } from "@/components/animate-ui/icons/hugeicons/arrow-left-01";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import Link from "next/link";
import { useUserContext } from "@/contexts/user";
import { canAccessStreamer } from "@/lib/rbac";
import { OrgPerm, StreamerPerm } from "@/consts/permission";
import { toast } from "@/components/custom-ui/toast";
import { CameraIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { PencilEdit02 } from "@/components/animate-ui/icons/hugeicons/pencil-edit-02";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ImageCropperModal = dynamic(
  () =>
    import("@/components/features/modals/image-cropper-modal").then(
      (mod) => mod.ImageCropperModal,
    ),
  { ssr: false },
);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type PaymentMethodType =
  | "stripe"
  | "xendit"
  | "omise"
  | "2c2p"
  | "feelfreepay"
  | "kofi"
  | "bmac";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

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

export default function PublicProfileClient({
  username,
  initialData,
  isMock = false,
}: {
  username: string;
  initialData: PublicProfileData | null;
  isMock?: boolean;
}) {
  const routeParams = useParams();
  const lang = useStore(coreStore, (state) => state.lang);
  const pp = lang.data.app.profile.public_page;
  const decodedUsername = safeDecodeURIComponent(username) ?? "";
  const { patchStreamer, authFetch, activeOrg, activeStreamer } = useUserContext();

  const uri = decodedUsername.startsWith("@")
    ? decodedUsername.slice(1)
    : decodedUsername;
  const [fetchedProfile, setFetchedProfile] = useState<PublicProfileData | null>(null);
  const profileData = initialData ?? fetchedProfile;
  const bannerUrl = profileData?.banner;
  const [loading, setLoading] = useState(!initialData && !isMock);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [loadedBannerUrl, setLoadedBannerUrl] = React.useState<string | null>(null);
  const isBannerLoaded = !bannerUrl || loadedBannerUrl === bannerUrl;
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAnythingChanged, setIsAnythingChanged] = React.useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");
  const [displayName, setDisplayName] = useState(activeStreamer?.displayName || "");
  const [bio, setBio] = useState(activeStreamer?.bio || "");
  const prevStreamerIdRef = useRef(activeStreamer?.id);
  const cropObjectUrlRef = useRef<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const targetOrg = activeOrg?.slug || activeOrg?.id || (routeParams?.org as string);
  const canEditProfile = canAccessStreamer(activeOrg, activeStreamer, StreamerPerm.STREAMER_MANAGE, OrgPerm.STREAMER_MANAGE);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const [hasScrollContainer, setHasScrollContainer] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (rootRef.current) {
      const container = rootRef.current.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');
      scrollContainerRef.current = container;
      setHasScrollContainer(Boolean(container));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cropObjectUrlRef.current) {
        URL.revokeObjectURL(cropObjectUrlRef.current);
        cropObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isMock && activeStreamer && activeStreamer.id !== prevStreamerIdRef.current) {
      prevStreamerIdRef.current = activeStreamer.id;
      setDisplayName(activeStreamer.displayName || "");
      setBio(activeStreamer.bio || "");
    }
  }, [isMock, activeStreamer]);

  const { scrollY } = useScroll({
    container: hasScrollContainer ? scrollContainerRef : undefined,
  });
  const bannerY = useTransform(scrollY, [0, 300], [0, 95]);
  const bannerScale = useTransform(scrollY, [-120, 0, 300], [1.12, 1, 1.05]);
  const bannerOpacity = useTransform(scrollY, [0, 260], [1, 0.35]);

  useEffect(() => {
    if (isMock || initialData) return;
    const controller = new AbortController();

    async function fetchProfile() {
      try {
        const res = await fetch(
          getApiUrl(`/api/v1/profile/${encodeURIComponent(uri)}/details`),
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (res.status === 404) {
          setError("not_found");
          return;
        }
        if (!res.ok) {
          setError("error");
          return;
        }
        const data: PublicProfileData = await res.json();
        if (controller.signal.aborted) return;
        setFetchedProfile(data);

        if (data.integrations) {
          const methodsOrder: PaymentMethodType[] = [
            "stripe",
            "xendit",
            "omise",
            "2c2p",
            "feelfreepay",
            "kofi",
            "bmac",
          ];
          const firstActive = methodsOrder.find((m) => data.integrations?.[m]);
          if (firstActive) {
            setSelectedMethod(firstActive);
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setError("error");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchProfile();
    return () => controller.abort();
  }, [isMock, uri, initialData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner className="size-8 text-foreground" />
      </div>
    );
  }

  if (!isMock && (!decodedUsername.startsWith("@") || error === "not_found")) {
    notFound();
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center font-sans relative">
        <div className="absolute inset-0 mask-b-from-0">
          <DrapeBackground className="absolute inset-0">
            <></>
          </DrapeBackground>
        </div>
        <div className="flex flex-col items-center gap-4 animate-fade-in-up duration-300 z-10">
          <GhostIcon size={64} weight="fill" />
          <div className="text-center">
            <h2 className="text-3xl font-semibold font-rubik text-foreground mb-1">
              {pp.not_ready_title}
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              {pp.not_ready_desc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allBadges = getActiveBadges(profileData.badges, lang.data);
  const isVerified = allBadges.some((b) => b.name === "verified");
  const badges = allBadges.filter((b) => b.name !== "verified");
  const accentHex = profileData.accentColor
    ? numberToHexColor(profileData.accentColor)
    : "#6366f1";
  const accentForegroundHex = getAccentForeground(accentHex);
  const primaryOklch = hexToOklch(accentHex);
  const primaryForegroundOklch = hexToOklch(accentForegroundHex);

  const paymentMethodsList = [
    { id: "stripe", label: "Stripe", icon: Stripe },
    { id: "xendit", label: "Xendit", icon: Xendit },
    { id: "omise", label: "Omise", logo: "/omise.webp" },
    { id: "2c2p", label: "2C2P", logo: "/2c2p.webp" },
    { id: "feelfreepay", label: "FeelFreePay", icon: FeelFreePay },
    { id: "kofi", label: "Ko-fi", icon: KoFi },
    { id: "bmac", label: "Buy Me a Coffee", icon: BuyMeACoffee },
  ];

  const integrations = profileData.integrations;
  const activeMethods = paymentMethodsList.filter((item) => {
    return !!integrations?.[item.id as keyof typeof integrations];
  });

  const targetStreamer = activeStreamer?.name || (routeParams?.streamer as string);
  const streamerPatchEndpoint =
    targetOrg && targetStreamer
      ? getApiUrl(`/api/v1/org/${encodeURIComponent(targetOrg)}/streamers/${encodeURIComponent(targetStreamer)}`)
      : "";

  const closeCropper = () => {
    setCropperOpen(false);
    setImageToCrop(null);
    if (cropObjectUrlRef.current) {
      URL.revokeObjectURL(cropObjectUrlRef.current);
      cropObjectUrlRef.current = null;
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner",
  ) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(lang.data.common.image_size_error);
      return;
    }
    if (cropObjectUrlRef.current) {
      URL.revokeObjectURL(cropObjectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    cropObjectUrlRef.current = objectUrl;
    setImageToCrop(objectUrl);
    setCropType(type);
    setCropperOpen(true);
  };

  const handleRemoveMedia = async (type: "avatar" | "banner") => {
    if (!canEditProfile || !streamerPatchEndpoint || !activeStreamer) return;
    const mediaLabel = type === "avatar" ? lang.data.common.avatar : lang.data.common.banner;
    try {
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: null }),
      });

      if (res.ok) {
        patchStreamer(activeStreamer.id, { [type]: null });
        toast.success(formatI18n(pp.removed, { type: mediaLabel }));
      } else {
        toast.error(formatI18n(pp.remove_failed, { type: mediaLabel }));
      }
    } catch {
      toast.error(formatI18n(pp.remove_network, { type: mediaLabel }));
    }
  };

  const onCropComplete = async (croppedImage: Blob): Promise<void> => {
    if (!canEditProfile || !streamerPatchEndpoint || !activeStreamer) return;
    try {
      const formData = new FormData();
      formData.append(cropType, croppedImage, `${cropType}.webp`);

      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        patchStreamer(activeStreamer.id, { [cropType]: updated[cropType] });
        toast.success(lang.data.app.account.success);
      } else if (res.status === 451) {
        const detail = await res.text().catch(() => "");
        toast.error(detail || lang.data.app.account.illegal_content);
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch {
      toast.error(lang.data.app.account.fatal);
    }
  };

  const handleSaveBasic = async () => {
    if (!canEditProfile || !streamerPatchEndpoint || !activeStreamer || isSaving) return;
    setIsSaving(true);
    try {
      const trimmedName = displayName.trim();
      const trimmedBio = bio.trim() || null;
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: trimmedName || undefined,
          bio: trimmedBio,
        }),
      });

      if (res.ok) {
        patchStreamer(activeStreamer.id, {
          displayName: trimmedName || activeStreamer.displayName,
          bio: trimmedBio,
        });
        setFetchedProfile((prev) =>
          prev
            ? {
              ...prev,
              displayName: trimmedName || prev.displayName,
              bio: trimmedBio,
            }
            : prev,
        );
        setIsEditingName(false);
        setIsEditingBio(false);
        setIsAnythingChanged(false);
        toast.success(lang.data.app.account.success);
      } else if (res.status === 451) {
        const detail = await res.text().catch(() => "");
        toast.error(detail || lang.data.app.account.illegal_content);
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch {
      toast.error(lang.data.app.account.fatal);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black relative font-sans"
      style={
        {
          "--primary": primaryOklch,
          "--primary-foreground": primaryForegroundOklch,
        } as React.CSSProperties
      }
      ref={rootRef}
    >
      <input
        type="file"
        ref={avatarInputRef}
        onChange={(e) => handleFileChange(e, "avatar")}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={bannerInputRef}
        onChange={(e) => handleFileChange(e, "banner")}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />
      <div className="fixed top-0 right-0 z-50 zoom-50">
        <PullCord />
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={bannerUrl}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{
            opacity: !bannerUrl || isBannerLoaded ? 1 : 0,
            filter: !bannerUrl || isBannerLoaded ? "blur(0px)" : "blur(6px)",
          }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 1 }}
          className="w-full bg-primary top-0 left-0 z-0 mask-b-from-0% overflow-hidden -mb-48 relative"
        >
          <motion.div
            style={{ y: bannerY, scale: bannerScale, opacity: bannerOpacity }}
            className="w-full origin-top min-h-96 pointer-events-none"
          >
            {bannerUrl && (
              <Image
                src={bannerUrl}
                alt={lang.data.common.banner}
                className="w-full min-h-96 object-cover select-none"
                width={720}
                height={288}
                priority
                unoptimized
                onLoad={() => setLoadedBannerUrl(bannerUrl)}
              />
            )}
          </motion.div>
          {isMock && canEditProfile && (
            <div className="absolute inset-0 p-1 z-50">
              <div className="absolute inset-0">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => bannerInputRef.current?.click()}
                  className="inset-0 w-full h-full scale-110! opacity-0 hover:opacity-40 text-xs font-semibold gap-1.5"
                >
                  <span>{profileData.banner ? pp.change_banner : pp.upload_banner}</span>
                </Button>
              </div>
              {profileData.banner && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveMedia("banner")}
                  className="p-2 h-max rounded-xl absolute left-1/2 -translate-x-1/2 text-xs font-semibold z-10 backdrop-blur-lg"
                >
                  <TrashIcon size={14} weight="bold" />
                  {pp.remove_banner}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.main
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="max-w-6xl mx-auto px-4 md:px-8 pb-24 w-full -mt-16 md:-mt-24 relative flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 flex-1"
      >
        <div className="md:col-span-7 flex flex-col justify-start">
          <div className="flex flex-col items-start">
            <motion.div
              variants={fadeInUp}
              className="relative group/avatar bg-primary border border-foreground/10 rounded-full shadow-2xl"
            >
              <Avatar className="size-32 md:size-42 shadow-inner">
                {profileData.avatar && <AvatarImage src={profileData.avatar} />}
                <AvatarFallback className="text-3xl md:text-5xl font-bold bg-muted text-foreground/50">
                  {getFallbackInitial(profileData.displayName || "?")}
                </AvatarFallback>
              </Avatar>
              {isMock && canEditProfile && (
                <Button
                  type="button"
                  variant={"ghost"}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 size-32 md:size-42 rounded-full bg-black/50 group-hover/avatar:backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white"
                  title={pp.change_avatar}
                >
                  <CameraIcon size={18} weight="bold" />
                  <span className="text-[10px] font-semibold mt-0.5">{lang.data.common.edit}</span>
                </Button>
              )}
            </motion.div>

            {
              isEditingName ?
                <div className="flex items-center gap-2 mt-4 -mb-3 w-full max-w-xl">
                  <ShadcnInput
                    type="text"
                    autoFocus
                    placeholder={profileData.displayName || pp.display_name_placeholder}
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setIsAnythingChanged(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveBasic();
                      } else if (e.key === "Escape") {
                        setDisplayName(profileData.displayName || "");
                        setIsEditingName(false);
                        if (!isEditingBio) setIsAnythingChanged(false);
                      }
                    }}
                    maxLength={64}
                    className="text-3xl md:text-5xl mt-2 mb-1 font-extrabold tracking-tight rounded-xl font-heading h-auto! py-1! px-2! border-foreground/20 bg-background/50 backdrop-blur-md w-full"
                  />
                  {isVerified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <SealCheckIcon
                          className="size-7 md:size-9 text-primary shrink-0 select-none cursor-pointer"
                          weight="fill"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="rounded-2xl">
                        <p className="font-sans">{lang.data.app.profile.preview.official_account}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div> : (
                  <motion.h1
                    variants={fadeInUp}
                    className={cn(
                      "text-3xl md:text-5xl font-extrabold tracking-tight mt-6 text-foreground font-heading flex items-center gap-2 select-none",
                      isMock && canEditProfile && "p-1 -m-1 mt-6 hover:bg-foreground/10 rounded-sm transition-interactive cursor-pointer group"
                    )}
                    onClick={() => {
                      if (isMock && canEditProfile) {
                        setDisplayName(profileData.displayName || "");
                        setIsEditingName(true);
                      }
                    }}
                  >
                    <span>{profileData.displayName || pp.display_name_placeholder}</span>
                    {isVerified && (
                      <Tooltip>
                        <TooltipTrigger>
                          <SealCheckIcon
                            className="size-7 md:size-9 text-primary shrink-0 select-none cursor-pointer"
                            weight="fill"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="rounded-2xl">
                          <p className="font-sans">{lang.data.app.profile.preview.official_account}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </motion.h1>
                )
            }

            <motion.span
              variants={fadeInUp}
              className="text-sm md:text-base text-foreground/40 font-medium mt-1 select-none"
            >
              @{profileData.name || "username"}
            </motion.span>

            {badges.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-1 mt-4"
              >
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <Badge
                      key={badge.name}
                      variant="default"
                      className={cn(
                        "text-xs px-2 py-1 h-auto gap-1 rounded-sm border-0 font-semibold select-none",
                        badge.className,
                        "bg-primary/10 hover:bg-primary/15 text-primary",
                      )}
                    >
                      <Icon className="size-4 shrink-0" weight="fill" />
                      {badge.label}
                    </Badge>
                  );
                })}
              </motion.div>
            )}

            {
              isEditingBio ?
                <Textarea
                  autoFocus
                  placeholder={profileData.bio || pp.bio_placeholder}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setIsAnythingChanged(true);
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleSaveBasic();
                    } else if (e.key === "Escape") {
                      setBio(profileData.bio || "");
                      setIsEditingBio(false);
                      if (!isEditingName) setIsAnythingChanged(false);
                    }
                  }}
                  maxLength={1000}
                  className="text-sm! mt-8 rounded-xl p-2.5 bg-background/50 backdrop-blur-md border border-foreground/20 leading-relaxed font-sans max-w-xl w-full"
                />
                : (
                  <motion.p
                    variants={fadeInUp}
                    className={cn(
                      "text-sm font-sans text-muted-foreground mt-8 leading-relaxed whitespace-pre-wrap max-w-xl wrap-break-word select-none",
                      isMock && canEditProfile && "p-1 -m-1 mt-8 hover:bg-foreground/10 rounded-sm transition-interactive cursor-pointer group flex items-start gap-1.5"
                    )}
                    onClick={() => {
                      if (isMock && canEditProfile) {
                        setBio(profileData.bio || "");
                        setIsEditingBio(true);
                      }
                    }}
                  >
                    <span>{profileData.bio || lang.data.app.profile.preview.no_bio}</span>
                    {isMock && canEditProfile && (
                      <PencilEdit02 size={14} className="text-foreground/40 group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    )}
                  </motion.p>
                )
            }

            <motion.div
              initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className={cn("flex items-center gap-2 mt-3 select-none **:cursor-default",
                // isMock && canEditProfile && "p-1 -m-1 mt-3 hover:bg-foreground/10 rounded-sm transition-interactive"
              )
              }
            >
              <SocialLinks socials={profileData} iconSize={22} colored />
              {
                // isMock && canEditProfile && <PencilEdit02 size={16} className={"size-8 p-1.75"} animateOnHover />
              }
            </motion.div>
          </div>
        </div>
        <motion.div
          variants={fadeInUp}
          className="md:col-span-5 flex flex-col justify-start"
        >
          {activeMethods.length > 0 && (
            <>
              <AutoHeight>
                <PageTransition
                  effect="slide"
                  pageKey={String(selectedMethod)}
                  className={`flex flex-col flex-1 min-w-0 items-center gap-3 bg-background/0 overflow-visible relative`}
                >
                  {
                    activeMethods.length > 0 && selectedMethod &&
                    <AnimateIcon animateOnHover className="group w-full">
                      <Button
                        variant="secondary"
                        className="p-2 backdrop-blur-xl bg-secondary/20 w-max font-semibold h-max rounded-xl flex items-center justify-start gap-3"
                        onClick={() => React.startTransition(() => {
                          React.addTransitionType("nav-back")
                          setSelectedMethod(null)
                        })}
                      >
                        <ArrowLeft01 />
                        {pp.select_other_method}
                      </Button>
                    </AnimateIcon>
                  }
                  {
                    selectedMethod === null ? (<>
                      <h2 className="w-full text-3xl font-medium text-foreground">
                        {pp.continue_with}
                      </h2>
                      <div className="w-full flex flex-col gap-1">
                        {
                          activeMethods.map((mthd, idx) => {
                            const Icon = mthd.icon;
                            return (
                              <AnimateIcon animateOnHover key={idx} className="group w-full">
                                <Button
                                  variant="outline"
                                  className="p-4 w-full border-2 backdrop-blur-xl group-first:rounded-b-sm group-last:rounded-t-sm font-semibold h-max rounded-xl flex items-center justify-start gap-3"
                                  onClick={() => React.startTransition(() => {
                                    React.addTransitionType("nav-forward")
                                    setSelectedMethod(mthd.id as PaymentMethodType)
                                  })}
                                >
                                  {Icon && <Icon className="size-5 shrink-0" />}
                                  {mthd.logo && (
                                    <Image
                                      src={mthd.logo}
                                      alt={mthd.label}
                                      width={20}
                                      height={20}
                                      className="size-5 object-contain shrink-0"
                                    />
                                  )}
                                  <span>{mthd.label}</span>
                                  <ArrowRight01 className={"ml-auto"} />
                                </Button>
                              </AnimateIcon>
                            );
                          })
                        }
                      </div>
                    </>) : selectedMethod === "kofi" && isSafeIframeHandle(profileData.kofiUsername) ? <>
                      <iframe
                        className="w-96 h-172 border-0 rounded-sm bg-white"
                        src={`https://ko-fi.com/${encodeURIComponent(profileData.kofiUsername!)}/?hidefeed=true&widget=true&embed=true&preview=true`}
                        title="Ko-fi"
                        allow="payment"
                        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation"
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{ colorScheme: "light", scrollbarWidth: "thin" }}
                        loading="lazy"
                      />
                    </> : selectedMethod === "bmac" && isSafeIframeHandle(profileData.bmacUsername) ? <>
                      <iframe
                        className="w-full h-172 border-0 rounded-sm bg-white"
                        src={`https://buymeacoffee.com/widget/page/${encodeURIComponent(profileData.bmacUsername!)}`}
                        title="Buy Me a Coffee"
                        allow="payment"
                        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation"
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{ colorScheme: "light", scrollbarWidth: "thin" }}
                        loading="lazy"
                      />
                    </> : selectedMethod === "stripe" ? <>
                    </> : <></>
                  }
                </PageTransition>
              </AutoHeight>
              <span className="text-xs text-muted-foreground text-center mt-4 block">{pp.terms_prefix}<Link className="text-blue-500" href="https://law.ponlponl123.com/tos" target="_blank" rel="noopener noreferrer">{pp.terms_link}</Link>{pp.terms_suffix}</span>
            </>
          )}
        </motion.div>
      </motion.main>
      <AnimatePresence mode="wait">
        {
          isMock && canEditProfile && (isEditingName || isEditingBio || isAnythingChanged) &&
          <motion.div
            key="inline-edit-bar"
            initial={{
              opacity: 0,
              y: "100%",
              x: "-50%"
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: "-50%"
            }}
            exit={{
              opacity: 0,
              y: "100%",
              x: "-50%"
            }}
            className="absolute bottom-16 left-1/2"
          >
            <Button
              variant={"secondary"}
              className={"rounded-2xl rounded-r-sm h-max p-3"}
              onClick={() => {
                setDisplayName(profileData.displayName || "");
                setBio(profileData.bio || "");
                setIsEditingName(false);
                setIsEditingBio(false);
                setIsAnythingChanged(false);
              }}
              disabled={isSaving}
            >
              {lang.data.common.cancel}
            </Button>
            <Button
              className={"rounded-2xl rounded-l-sm h-max p-3"}
              onClick={handleSaveBasic}
              disabled={isSaving}
            >
              {isSaving ? <Spinner className="mr-2" /> : lang.data.app.profile.socials.save}
            </Button>
          </motion.div>
        }
      </AnimatePresence>
      {
        isMock && <ImageCropperModal
          open={cropperOpen}
          onClose={closeCropper}
          image={imageToCrop}
          cropShape={cropType === "avatar" ? "round" : "rect"}
          aspect={cropType === "avatar" ? 1 : 3}
          title={cropType === "avatar" ? lang.data.components.image_cropper.crop_avatar : lang.data.components.image_cropper.crop_banner}
          className={cn(
            cropType === "avatar" ? "" : "max-w-2xl!"
          )}
          onCropComplete={onCropComplete}
        />
      }
    </div>
  );
}
