"use client";
import React, { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "@/components/animate-ui/components/headless/accordion";
import {
  TwitchTv,
  Youtube,
  Twitter,
  Facebook,
  Reddit,
  Discord,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getApiUrl } from "@/lib/api";
import { allowed_chars } from "@/consts/regex";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { cn } from "@/lib/utils";
import {
  ArrowUpRightIcon,
  CameraIcon,
  PaletteIcon,
  PersonIcon,
  SparkleIcon,
  UserFocusIcon,
  UserIcon,
  BrowsersIcon,
  EyeIcon,
  EyeSlashIcon,
  CopySimpleIcon,
  CheckIcon,
  KeyIcon,
  WarningOctagonIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { ColorPicker } from "@/components/ui/color-picker";
import { hexColorToNumber, numberToHexColor } from "@/lib/color";
import { ImageCropperModal } from "@/components/features/modals/image-cropper-modal";
import Link from "next/link";
import { Input } from "react-smooth-input";
import { useStore } from "zustand";
import { toast } from "sonner";
import ProfilePreview from "./profile-preview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { hasPermission, canAccessStreamer } from "@/lib/rbac";
import { OrgPerm, StreamerPerm } from "@/consts/permission";

function useUriCooldown(cooldownDateStr?: string | null): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => Boolean(cooldownDateStr && new Date(cooldownDateStr).getTime() > Date.now()),
    () => false,
  );
}

function Page() {
  const router = useRouter();
  const lang = useStore(coreStore, (state) => state.lang);
  const routeParams = useParams();
  const { patchStreamer, authFetch, activeOrg, activeStreamer, removeStreamer } = useUserContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [isSavingBasic, setIsSavingBasic] = useState(false);
  const [isSavingColor, setIsSavingColor] = useState(false);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const targetOrg = activeOrg?.slug || activeOrg?.id || (routeParams?.org as string);
  const currentStreamer = activeStreamer;

  const [displayName, setDisplayName] = useState(currentStreamer?.displayName || "");
  const [bio, setBio] = useState(currentStreamer?.bio || "");
  const [accentColor, setAccentColor] = useState(
    currentStreamer?.accentColor ? numberToHexColor(currentStreamer.accentColor) : "#6366f1",
  );

  const [socials, setSocials] = useState({
    socialTwitch: currentStreamer?.twitch || "",
    socialYoutube: currentStreamer?.youtube || "",
    socialTwitter: currentStreamer?.twitter || "",
    socialFacebook: currentStreamer?.facebook || "",
    socialReddit: currentStreamer?.reddit || "",
    socialDiscord: currentStreamer?.discord || "",
  });

  // OBS Token Security & Danger Zone states
  const [showObsUrl, setShowObsUrl] = useState(false);
  const [copiedObs, setCopiedObs] = useState(false);
  const [isRotateConfirmOpen, setIsRotateConfirmOpen] = useState(false);
  const [isRotatingTokens, setIsRotatingTokens] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmHandle, setConfirmHandle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const prevStreamerIdRef = useRef(currentStreamer?.id);
  useEffect(() => {
    if (currentStreamer && currentStreamer.id !== prevStreamerIdRef.current) {
      prevStreamerIdRef.current = currentStreamer.id;
      setDisplayName(currentStreamer.displayName || "");
      setBio(currentStreamer.bio || "");
      setAccentColor(
        currentStreamer.accentColor ? numberToHexColor(currentStreamer.accentColor) : "#6366f1",
      );
      setSocials({
        socialTwitch: currentStreamer.twitch || "",
        socialYoutube: currentStreamer.youtube || "",
        socialTwitter: currentStreamer.twitter || "",
        socialFacebook: currentStreamer.facebook || "",
        socialReddit: currentStreamer.reddit || "",
        socialDiscord: currentStreamer.discord || "",
      });
    }
  }, [currentStreamer]);

  const streamerPatchEndpoint =
    targetOrg && currentStreamer?.name
      ? getApiUrl(`/api/v1/org/${targetOrg}/streamers/${currentStreamer.name}`)
      : "";

  const streamerPublishEndpoint =
    targetOrg && currentStreamer?.name
      ? getApiUrl(`/api/v1/org/${targetOrg}/streamers/${currentStreamer.name}/publish`)
      : "";

  const handleSocialChange = (
    key: keyof typeof socials,
    value: string,
    pattern: RegExp,
  ) => {
    if (value !== "" && !pattern.test(value)) return;
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSocials = async () => {
    if (!streamerPatchEndpoint || !currentStreamer) return;
    setIsSavingSocials(true);
    try {
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socials),
      });

      if (res.ok) {
        patchStreamer(currentStreamer.id, {
          twitch: socials.socialTwitch,
          youtube: socials.socialYoutube,
          twitter: socials.socialTwitter,
          facebook: socials.socialFacebook,
          reddit: socials.socialReddit,
          discord: socials.socialDiscord,
        });
        toast.success(lang.data.app.account.success);
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch {
      toast.error(lang.data.app.account.fatal);
    } finally {
      setIsSavingSocials(false);
    }
  };

  const handleSaveAccentColor = async () => {
    if (!streamerPatchEndpoint || !currentStreamer) return;
    setIsSavingColor(true);
    try {
      const numericColor = hexColorToNumber(accentColor);
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accentColor }),
      });

      if (res.ok) {
        patchStreamer(currentStreamer.id, { accentColor: numericColor });
        toast.success(lang.data.app.account.success);
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch {
      toast.error(lang.data.app.account.fatal);
    } finally {
      setIsSavingColor(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!streamerPatchEndpoint || !currentStreamer) return;
    setIsSavingBasic(true);
    try {
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() || null,
        }),
      });

      if (res.ok) {
        patchStreamer(currentStreamer.id, {
          displayName: displayName.trim(),
          bio: bio.trim() || null,
        });
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
      setIsSavingBasic(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropType(type);
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = async (croppedImage: Blob): Promise<void> => {
    if (!streamerPatchEndpoint || !currentStreamer) return;
    try {
      const formData = new FormData();
      formData.append(cropType, croppedImage, `${cropType}.webp`);

      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        patchStreamer(currentStreamer.id, { [cropType]: updated[cropType] });
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

  const isUriCooldown = useUriCooldown(currentStreamer?.uriCooldownEnd);

  const handlePublish = async () => {
    if (!streamerPublishEndpoint || !currentStreamer) return;
    setIsSubmitting(true);
    try {
      const res = await authFetch(streamerPublishEndpoint, { method: "POST" });
      if (res.ok) {
        patchStreamer(currentStreamer.id, { publishedAt: new Date().toISOString() });
        toast.success("Channel published successfully");
      }
    } catch {
      toast.error("Failed to publish channel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    if (!streamerPublishEndpoint || !currentStreamer) return;
    setIsSubmitting(true);
    try {
      const res = await authFetch(streamerPublishEndpoint, { method: "DELETE" });
      if (res.ok) {
        patchStreamer(currentStreamer.id, { publishedAt: null });
        toast.success("Channel unpublished");
      }
    } catch {
      toast.error("Failed to unpublish channel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const widgetToken = currentStreamer?.widgets?.[0]?.token;
  const obsBrowserSourceUrl = typeof window !== "undefined" && widgetToken
    ? `${window.location.origin}/overlay/alertbox?token=${widgetToken}`
    : "";

  const handleRotateTokens = async () => {
    setIsRotatingTokens(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Widget tokens rotated successfully! Please update your OBS browser source.");
      setIsRotateConfirmOpen(false);
    } catch {
      toast.error("Failed to rotate widget tokens");
    } finally {
      setIsRotatingTokens(false);
    }
  };

  const handleDeleteStreamer = async () => {
    if (!targetOrg || !currentStreamer || confirmHandle !== currentStreamer.name) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${targetOrg}/streamers/${currentStreamer.name}`),
        { method: "DELETE" },
      );
      if (res.ok) {
        removeStreamer(currentStreamer.id);
        toast.success(`Channel "${currentStreamer.displayName || currentStreamer.name}" deleted`);
        setIsDeleteOpen(false);
        router.push(`/app/${targetOrg}/streamers`);
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to delete channel");
      }
    } catch {
      toast.error("Network error deleting channel");
    } finally {
      setIsDeleting(false);
    }
  };

  const role = (activeOrg?.role || "").toLowerCase();
  const isOwner = role === "owner";
  const isOwnerOrAdmin = isOwner || role === "admin";
  const canEditProfile = canAccessStreamer(activeOrg, currentStreamer, StreamerPerm.STREAMER_MANAGE, OrgPerm.STREAMER_MANAGE);
  const canRotateTokens = canAccessStreamer(activeOrg, currentStreamer, StreamerPerm.STREAMER_WIDGET_MANAGE, OrgPerm.WIDGET_TOKEN_ROTATE);
  const canDeleteStreamer = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.STREAMER_DELETE);

  return (
    <>
      <div className="flex items-center justify-between gap-3 z-10 relative">
        <div className="flex flex-col">
          <span className="tracking-wider text-xs mt-1.5 text-foreground/40">
            {lang.data.app.profile.my_uri}:{" "}
            {currentStreamer?.uri ? (
              <Link
                href={`/@${currentStreamer.uri}`}
                className="text-blue-500 hover:underline"
                target="_blank"
              >
                alertbox.org/@{currentStreamer.uri}
                <ArrowUpRightIcon className="inline ml-px" weight="bold" size={12} />
              </Link>
            ) : (
              <span className="text-muted-foreground/60 italic">No public handle</span>
            )}
          </span>
          {isUriCooldown && currentStreamer?.uriCooldownEnd && (
            <span className="tracking-wider text-xs mt-1.5 text-foreground/40">
              {lang.data.app.profile.get_started.reset_in.replace(
                "{time}",
                new Date(currentStreamer.uriCooldownEnd).toLocaleDateString(lang.key, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              )}
            </span>
          )}
        </div>
        {canEditProfile && (
          <div>
            <Link
              href={`/app/${activeOrg?.slug || activeOrg?.id}/${currentStreamer?.name || "channel"}/profile/renew`}
              className={cn(isUriCooldown && "pointer-events-none")}
            >
              <Button
                variant="default"
                className="rounded-2xl p-2.5 text-[10px] font-semibold mt-4 cursor-pointer"
                disabled={isUriCooldown}
              >
                {lang.data.app.profile.get_started.change}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {canEditProfile ? (
        <div className="w-full flex items-center bg-foreground/5 mt-3 px-3 py-1.5 rounded-2xl gap-1.5 z-10 relative">
          <strong className="text-xs text-foreground/40">
            {lang.data.app.profile.manage.title}
          </strong>
          {currentStreamer?.publishedAt ? (
            <Button
              variant="destructive"
              className="rounded-xl p-2.5 text-[10px] font-semibold h-8 cursor-pointer"
              onClick={handleUnpublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner className="mr-1" /> : lang.data.app.profile.manage.unpublish}
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="rounded-xl p-2.5 text-[10px] font-semibold bg-emerald-400/10 hover:bg-emerald-400/15 text-emerald-400 h-8 cursor-pointer"
              onClick={handlePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner className="mr-1" /> : lang.data.app.profile.manage.publish}
            </Button>
          )}
        </div>
      ) : (
        <div className="w-full flex items-center gap-2 p-2.5 mt-3 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground z-10 relative">
          <EyeIcon size={14} weight="bold" className="shrink-0 text-muted-foreground" />
          <span>You have read-only access to this channel profile. Profile modifications require editor permissions.</span>
        </div>
      )}

      <div className="flex max-md:flex-col gap-1.5 min-h-0 flex-1 mt-3">
        <div className="md:w-64 flex flex-col h-max z-10 relative gap-1.5">
          <Accordion className="w-full bg-card rounded-2xl">
            <AccordionItem defaultOpen={true}>
              <AccordionButton
                className={cn(
                  "flex group items-center p-3.5 rounded-2xl h-max min-h-0 w-full gap-2.25 no-underline! justify-start",
                  "hover:bg-foreground/5",
                  "data-open:rounded-b-lg data-open:pb-16 data-open:-mb-13",
                )}
                showArrow={false}
              >
                <PersonIcon
                  size={16}
                  weight="fill"
                  className="rotate-0! text-foreground/40 group-data-open:text-foreground"
                />
                <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-px">
                  {lang.data.app.profile.basic_info}
                </h1>
              </AccordionButton>
              <AccordionPanel keepRendered={true} data-default-transition="false" className="p-0">
                <div className="flex-1 min-h-1 w-full bg-muted rounded-2xl py-2 px-1.75 gap-1.5 flex flex-col">
                  <div className="flex flex-col rounded-lg p-1.5 gap-1.5">
                    <div className="flex gap-1.5 opacity-40 items-center">
                      <UserIcon className="size-4" />
                      <h1 className="font-semibold text-xs">{lang.data.app.account.display_name}</h1>
                    </div>
                    <Input
                      type="text"
                      placeholder="Display Name"
                      pattern={allowed_chars.source}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!canEditProfile}
                      readOnly={!canEditProfile}
                      className="w-full"
                      classNames={{ base: "rounded-md bg-background/30! p-1" }}
                      fontStyle={{ fontFamily: "var(--font-sans)", fontSize: "10px" }}
                    />
                  </div>

                  <div className="flex flex-col rounded-lg p-1.5 gap-1.5">
                    <div className="flex gap-1.5 opacity-40 items-center">
                      <UserFocusIcon className="size-4" />
                      <h1 className="font-semibold text-xs">{lang.data.app.account.bio}</h1>
                    </div>
                    <textarea
                      placeholder="Share a short bio or stream schedule..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={!canEditProfile}
                      readOnly={!canEditProfile}
                      rows={3}
                      className="w-full rounded-md bg-background/30 p-1.5 border-2 border-transparent hover:border-foreground/10 min-h-8 outline-0 focus-visible:border-foreground/10 focus-visible:bg-foreground/5 font-sans text-[10px] resize-y disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                {canEditProfile && (
                  <div className="flex items-center p-2.5 rounded-t-4xl w-full gap-1.5">
                    <Button
                      variant="secondary"
                      className="rounded-xl border-2 p-4.5 w-full cursor-pointer"
                      onClick={handleSaveBasicInfo}
                      disabled={isSavingBasic || !displayName.trim()}
                    >
                      {isSavingBasic ? <Spinner className="mr-2" /> : lang.data.app.profile.socials.save}
                    </Button>
                  </div>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Accordion className="w-full bg-card rounded-2xl">
            <AccordionItem>
              <AccordionButton
                className={cn(
                  "flex group items-center p-3.5 rounded-2xl h-max min-h-0 w-full gap-2.25 no-underline! justify-start",
                  "hover:bg-foreground/5",
                  "data-open:rounded-b-lg data-open:pb-16 data-open:-mb-13",
                )}
                showArrow={false}
              >
                <SparkleIcon
                  size={16}
                  weight="fill"
                  className="rotate-0! text-foreground/40 group-data-open:text-foreground"
                />
                <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-px">
                  {lang.data.app.profile.socials.title}
                </h1>
              </AccordionButton>
              <AccordionPanel data-default-transition="false" className="p-0">
                <div className="flex-1 min-h-1 w-full bg-muted rounded-2xl py-2 px-1.75 gap-1.5 flex flex-col">
                  {[
                    { id: "socialTwitch", icon: <TwitchTv className="size-4" />, title: lang.data.app.profile.socials.twitch, placeholder: lang.data.app.profile.socials.placeholder, pattern: allowed_chars },
                    { id: "socialYoutube", icon: <Youtube className="size-4" />, title: lang.data.app.profile.socials.youtube, placeholder: lang.data.app.profile.socials.placeholder, pattern: allowed_chars },
                    { id: "socialTwitter", icon: <Twitter className="size-4" />, title: lang.data.app.profile.socials.twitter, placeholder: lang.data.app.profile.socials.placeholder, pattern: allowed_chars },
                    { id: "socialFacebook", icon: <Facebook className="size-4" />, title: lang.data.app.profile.socials.facebook, placeholder: lang.data.app.profile.socials.placeholder, pattern: allowed_chars },
                    { id: "socialReddit", icon: <Reddit className="size-4" />, title: lang.data.app.profile.socials.reddit, placeholder: lang.data.app.profile.socials.placeholder, pattern: allowed_chars },
                    { id: "socialDiscord", icon: <Discord className="size-4" />, title: lang.data.app.profile.socials.discord, placeholder: lang.data.app.profile.socials.discord_placeholder, pattern: /^[a-zA-Z0-9]+$/ },
                  ].map((l, i) => (
                    <div className="flex flex-col rounded-lg p-1.5 gap-1.5" key={i}>
                      <div className="flex gap-1.5 opacity-40 items-center">
                        {l.icon}
                        <h1 className="font-semibold text-xs">{l.title}</h1>
                      </div>
                      <Input
                        type="text"
                        placeholder={l.placeholder}
                        pattern={l.pattern.source}
                        value={socials[l.id as keyof typeof socials]}
                        onChange={(e) => handleSocialChange(l.id as keyof typeof socials, e.target.value, l.pattern)}
                        disabled={!canEditProfile}
                        readOnly={!canEditProfile}
                        maxLength={32}
                        classNames={{ base: "rounded-md bg-background/30! p-1" }}
                        fontStyle={{ fontFamily: "var(--font-sans)", fontSize: "10px" }}
                      />
                    </div>
                  ))}
                </div>
                {canEditProfile && (
                  <div className="flex items-center p-2.5 rounded-t-4xl w-full gap-1.5">
                    <Button
                      variant="secondary"
                      className="rounded-xl border-2 p-4.5 w-full cursor-pointer"
                      onClick={handleSaveSocials}
                      disabled={isSavingSocials}
                    >
                      {isSavingSocials ? <Spinner className="mr-2" /> : lang.data.app.profile.socials.save}
                    </Button>
                  </div>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Accordion className="w-full bg-card rounded-2xl">
            <AccordionItem>
              <AccordionButton
                className={cn(
                  "flex group items-center p-3.5 rounded-2xl h-max min-h-0 w-full gap-2.25 no-underline! justify-start",
                  "hover:bg-foreground/5",
                  "data-open:rounded-b-lg data-open:pb-16 data-open:-mb-13",
                )}
                showArrow={false}
              >
                <PaletteIcon
                  size={16}
                  weight="fill"
                  className="rotate-0! text-foreground/40 group-data-open:text-foreground"
                />
                <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-px">
                  {lang.data.app.profile.accent_color}
                </h1>
              </AccordionButton>
              <AccordionPanel data-default-transition="false" className="p-0">
                <div className="flex-1 min-h-1 w-full bg-muted rounded-2xl py-2 px-1.75 gap-1.5 flex flex-col">
                  <div className="flex flex-col rounded-lg p-1.5 gap-1.5">
                    <p className="text-foreground/40 text-[10px] leading-normal">
                      {lang.data.app.profile.accent_color_description}
                    </p>
                    <div className="flex flex-col gap-3 items-center mt-2 w-full">
                      <div className="flex gap-2 items-center w-full bg-background/20 p-2 rounded-xl border border-foreground/5 justify-between">
                        <span className="text-[10px] font-semibold opacity-60">Color Hex:</span>
                        <span className="text-xs font-mono uppercase font-bold tracking-wider">{accentColor}</span>
                      </div>
                      {canEditProfile ? (
                        <ColorPicker color={accentColor} onChange={setAccentColor} />
                      ) : (
                        <div
                          className="w-full h-8 rounded-xl border border-border/60 shadow-xs"
                          style={{ backgroundColor: accentColor }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {canEditProfile && (
                  <div className="flex items-center p-2.5 rounded-t-4xl w-full gap-1.5">
                    <Button
                      variant="secondary"
                      className="rounded-xl border-2 p-4.5 w-full flex items-center justify-center gap-1.5 cursor-pointer"
                      onClick={handleSaveAccentColor}
                      disabled={isSavingColor}
                    >
                      {isSavingColor ? <Spinner className="mr-2" /> : lang.data.app.profile.socials.save}
                    </Button>
                  </div>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          {canEditProfile && (
            <Accordion className="w-full bg-card rounded-2xl">
              <AccordionItem>
                <AccordionButton
                  className={cn(
                    "flex group items-center p-3.5 rounded-2xl h-max min-h-0 w-full gap-2.25 no-underline! justify-start",
                    "hover:bg-foreground/5",
                    "data-open:rounded-b-lg data-open:pb-16 data-open:-mb-13",
                  )}
                  showArrow={false}
                >
                  <CameraIcon
                    size={16}
                    weight="fill"
                    className="rotate-0! text-foreground/40 group-data-open:text-foreground"
                  />
                  <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-px">
                    Avatar & Banner
                  </h1>
                </AccordionButton>
                <AccordionPanel data-default-transition="false" className="p-0">
                  <div className="flex-1 min-h-1 w-full bg-muted rounded-2xl py-2 px-1.75 gap-1.5 flex flex-col">
                    <div className="flex flex-col rounded-lg p-1.5 gap-2">
                      <Button
                        variant="secondary"
                        className="rounded-xl p-2.5 text-xs font-semibold justify-start gap-2 bg-background/50 hover:bg-background/80 cursor-pointer"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <CameraIcon size={16} weight="fill" />
                        {lang.data.app.account.change_avatar}
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-xl p-2.5 text-xs font-semibold justify-start gap-2 bg-background/50 hover:bg-background/80 cursor-pointer"
                        onClick={() => bannerInputRef.current?.click()}
                      >
                        <CameraIcon size={16} weight="fill" />
                        {lang.data.app.account.change_banner}
                      </Button>
                    </div>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}

          <Accordion className="w-full bg-card rounded-2xl">
            <AccordionItem>
              <AccordionButton
                className={cn(
                  "flex group items-center p-3.5 rounded-2xl h-max min-h-0 w-full gap-2.25 no-underline! justify-start",
                  "hover:bg-foreground/5",
                  "data-open:rounded-b-lg data-open:pb-16 data-open:-mb-13",
                )}
                showArrow={false}
              >
                <BrowsersIcon
                  size={16}
                  weight="fill"
                  className="rotate-0! text-foreground/40 group-data-open:text-foreground"
                />
                <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-px">
                  OBS Overlay & Tokens
                </h1>
              </AccordionButton>
              <AccordionPanel data-default-transition="false" className="p-0">
                <div className="flex-1 min-h-1 w-full bg-muted rounded-2xl p-2.5 gap-2.5 flex flex-col">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-foreground/80">
                      <span>Browser Source URL</span>
                      <button
                        type="button"
                        onClick={() => setShowObsUrl(!showObsUrl)}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                      >
                        {showObsUrl ? <EyeSlashIcon size={12} /> : <EyeIcon size={12} />}
                        <span>{showObsUrl ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50 border border-border/60 font-mono text-[10px] truncate select-all">
                      {showObsUrl ? obsBrowserSourceUrl : "https://widget.alertbox.org/alert/••••••••••••"}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(obsBrowserSourceUrl);
                        setCopiedObs(true);
                        toast.success("OBS Browser Source URL copied!");
                        setTimeout(() => setCopiedObs(false), 2000);
                      }}
                      className="gap-1 text-xs rounded-xl h-8 cursor-pointer"
                    >
                      {copiedObs ? <CheckIcon size={13} className="text-emerald-500" /> : <CopySimpleIcon size={13} />}
                      <span>{copiedObs ? "Copied" : "Copy OBS URL"}</span>
                    </Button>
                  </div>

                  {canRotateTokens && (
                    <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5">
                      <span className="text-[10px] text-muted-foreground">In case of accidental stream leak:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRotateConfirmOpen(true)}
                        className="gap-1.5 text-xs rounded-xl h-8 cursor-pointer border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
                      >
                        <KeyIcon size={13} weight="bold" />
                        <span>Rotate Tokens</span>
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          {canDeleteStreamer && (
            <Accordion className="w-full bg-card rounded-2xl border border-destructive/20">
              <AccordionItem>
                <AccordionButton
                  className={cn(
                    "flex group items-center p-3.5 rounded-2xl h-max min-h-0 w-full gap-2.25 no-underline! justify-start",
                    "hover:bg-destructive/5",
                    "data-open:rounded-b-lg data-open:pb-16 data-open:-mb-13",
                  )}
                  showArrow={false}
                >
                  <WarningOctagonIcon
                    size={16}
                    weight="fill"
                    className="rotate-0! text-destructive group-data-open:text-destructive"
                  />
                  <h1 className="font-semibold text-sm text-destructive m-0 translate-y-px">
                    Channel Danger Zone
                  </h1>
                </AccordionButton>
                <AccordionPanel data-default-transition="false" className="p-0">
                  <div className="flex-1 min-h-1 w-full bg-destructive/5 rounded-2xl p-2.5 gap-2 flex flex-col">
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Permanently delete this channel and disable donation pages.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setConfirmHandle("");
                        setIsDeleteOpen(true);
                      }}
                      className="gap-1.5 text-xs rounded-xl h-8 cursor-pointer mt-1 font-semibold"
                    >
                      <TrashIcon size={13} weight="bold" />
                      <span>Delete Channel</span>
                    </Button>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        <div className="w-full max-md:-order-1 flex flex-col overflow-hidden min-h-0 bg-foreground/5 rounded-4xl flex-1 border-2 border-dashed border-foreground/10 z-10 relative">
          <ProfilePreview
            onAvatarClick={canEditProfile ? () => avatarInputRef.current?.click() : undefined}
            onBannerClick={canEditProfile ? () => bannerInputRef.current?.click() : undefined}
            liveData={{
              displayName,
              bio,
              avatar: currentStreamer?.avatar,
              banner: currentStreamer?.banner,
              twitch: socials.socialTwitch || null,
              youtube: socials.socialYoutube || null,
              twitter: socials.socialTwitter || null,
              facebook: socials.socialFacebook || null,
              reddit: socials.socialReddit || null,
              discord: socials.socialDiscord || null,
              accentColor: hexColorToNumber(accentColor),
            }}
          />
        </div>
      </div>

      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "avatar")}
      />
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "banner")}
      />

      <ImageCropperModal
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        image={imageToCrop}
        onCropComplete={onCropComplete}
        cropShape={cropType === "avatar" ? "round" : "rect"}
        aspect={cropType === "avatar" ? 1 : 3 / 1}
        title={
          cropType === "avatar"
            ? lang.data.app.account.crop_avatar
            : lang.data.app.account.crop_banner
        }
        applyLabel={lang.data.app.account.crop_apply}
        cancelLabel={lang.data.app.account.crop_cancel}
        zoomLabel={lang.data.app.account.zoom}
        className={cropType === "banner" ? "sm:max-w-4xl" : "sm:max-w-xl"}
      />

      <Dialog open={isRotateConfirmOpen} onOpenChange={setIsRotateConfirmOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <KeyIcon size={22} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Rotate Widget Tokens?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This will invalidate your current OBS browser source URL. You must copy the new URL into OBS Studio / Streamlabs Desktop immediately after rotation.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRotateConfirmOpen(false)}
              disabled={isRotatingTokens}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRotateTokens}
              disabled={isRotatingTokens}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRotatingTokens && <Spinner className="size-3.5" />}
              <span>Rotate & Invalidate</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <WarningOctagonIcon size={22} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-destructive">
              Delete Channel Permanently?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Are you sure you want to delete <strong>@{currentStreamer?.name}</strong>? Public donation links for this channel will cease to accept payments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <label className="text-xs font-semibold text-foreground">
              Type channel handle <code className="text-primary font-mono">{currentStreamer?.name}</code> to confirm:
            </label>
            <Input
              type="text"
              value={confirmHandle}
              onChange={(e) => setConfirmHandle(e.target.value)}
              placeholder={currentStreamer?.name || "handle"}
              className="w-full text-xs font-mono"
              classNames={{ base: "h-10 rounded-xl" }}
            />
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteStreamer}
              disabled={isDeleting || confirmHandle !== currentStreamer?.name}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isDeleting && <Spinner className="size-3.5" />}
              <span>Delete Channel</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Page;
