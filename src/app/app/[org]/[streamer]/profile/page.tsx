"use client";
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
} from "@phosphor-icons/react";
import { ColorPicker } from "@/components/ui/color-picker";
import { hexColorToNumber, numberToHexColor } from "@/lib/color";
import { ImageCropperModal } from "@/components/image-cropper-modal";
import Link from "next/link";
import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "react-smooth-input";
import { useStore } from "zustand";
import { toast } from "sonner";
import ProfilePreview from "./profile-preview";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const routeParams = useParams();
  const { userInfo, patchUserInfo, authFetch, activeOrg, activeStreamer } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSocials, setIsSavingSocials] = useState(false);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const targetOrg = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const targetStreamer = activeStreamer?.id || activeStreamer?.name || (routeParams?.streamer as string);

  const currentStreamer = activeStreamer || userInfo?.profile;

  const [displayName, setDisplayName] = useState(
    currentStreamer?.displayName || "",
  );
  const [bio, setBio] = useState(currentStreamer?.bio || "");
  const [isSavingBasic, setIsSavingBasic] = useState(false);

  const [isSavingColor, setIsSavingColor] = useState(false);
  const [accentColor, setAccentColor] = useState(
    currentStreamer?.accentColor
      ? numberToHexColor(currentStreamer.accentColor)
      : "#6366f1",
  );

  const [socials, setSocials] = useState({
    socialTwitch: currentStreamer?.twitch || "",
    socialYoutube: currentStreamer?.youtube || "",
    socialTwitter: currentStreamer?.twitter || "",
    socialFacebook: currentStreamer?.facebook || "",
    socialReddit: currentStreamer?.reddit || "",
    socialDiscord: currentStreamer?.discord || "",
  });

  const [prevStreamerId, setPrevStreamerId] = useState(currentStreamer?.id);

  if (currentStreamer && currentStreamer.id !== prevStreamerId) {
    setPrevStreamerId(currentStreamer.id);
    setSocials({
      socialTwitch: currentStreamer.twitch || "",
      socialYoutube: currentStreamer.youtube || "",
      socialTwitter: currentStreamer.twitter || "",
      socialFacebook: currentStreamer.facebook || "",
      socialReddit: currentStreamer.reddit || "",
      socialDiscord: currentStreamer.discord || "",
    });
    setDisplayName(currentStreamer.displayName || "");
    setBio(currentStreamer.bio || "");
    setAccentColor(
      currentStreamer.accentColor
        ? numberToHexColor(currentStreamer.accentColor)
        : "#6366f1",
    );
  }

  const handleSocialChange = (
    key: keyof typeof socials,
    value: string,
    pattern: RegExp,
  ) => {
    if (value !== "" && !pattern.test(value)) return;
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  const streamerPatchEndpoint =
    targetOrg && targetStreamer
      ? getApiUrl(`/api/v1/org/${targetOrg}/streamers/${targetStreamer}`)
      : getApiUrl("/api/v1/me");

  const streamerPublishEndpoint =
    targetOrg && targetStreamer
      ? getApiUrl(`/api/v1/org/${targetOrg}/streamers/${targetStreamer}/publish`)
      : getApiUrl("/api/v1/me/profile");

  const handleSaveSocials = async () => {
    setIsSavingSocials(true);
    try {
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socials),
      });

      if (res.ok) {
        const updated = await res.json();
        patchUserInfo(updated);
        toast.success(lang.data.app.account.success);
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch (err) {
      console.error("Failed to save socials:", err);
      toast.error(lang.data.app.account.fatal);
    } finally {
      setIsSavingSocials(false);
    }
  };

  const handleSaveAccentColor = async () => {
    setIsSavingColor(true);
    try {
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accentColor }),
      });

      if (res.ok) {
        const updated = await res.json();
        patchUserInfo(updated);
        toast.success(lang.data.app.account.success);
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch (err) {
      console.error("Failed to save accent color:", err);
      toast.error(lang.data.app.account.fatal);
    } finally {
      setIsSavingColor(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    setIsSavingBasic(true);
    try {
      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName,
          displayname: displayName,
          bio: bio,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        patchUserInfo(updated);
        toast.success(lang.data.app.account.success);
      } else if (res.status === 451) {
        const detail = await res.text().catch(() => "");
        toast.error(
          detail
            ? `${detail}. ${lang.data.app.account.illegal_content}`
            : lang.data.app.account.illegal_content,
        );
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch (err) {
      console.error("Failed to save basic info:", err);
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

  const onCropComplete = async (croppedImage: Blob) => {
    try {
      const formData = new FormData();
      formData.append(cropType, croppedImage, `${cropType}.webp`);

      const res = await authFetch(streamerPatchEndpoint, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        patchUserInfo(updated);
        toast.success(lang.data.app.account.success);
      } else if (res.status === 451) {
        const detail = await res.text().catch(() => "");
        toast.error(
          detail
            ? `${detail}. ${lang.data.app.account.illegal_content}`
            : lang.data.app.account.illegal_content,
        );
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch (err) {
      console.error(`Failed to upload ${cropType}:`, err);
      toast.error(lang.data.app.account.fatal);
    }
  };

  const isUriCooldown =
    (userInfo?.profile?.uriCooldownEnd &&
      new Date(userInfo?.profile?.uriCooldownEnd).getTime() >
      new Date().getTime()) ||
    false;

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const res = await authFetch(streamerPublishEndpoint, {
        method: "POST",
      });

      if (res.ok) {
        patchUserInfo({
          profile: {
            ...userInfo!.profile!,
            publishedAt: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    setIsSubmitting(true);
    try {
      const res = await authFetch(streamerPublishEndpoint, {
        method: "DELETE",
      });

      if (res.ok) {
        patchUserInfo({
          profile: { ...userInfo!.profile!, publishedAt: null },
        });
      }
    } catch (err) {
      console.error("Failed to unpublish:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 z-10 relative">
        <div className="flex flex-col">
          <span className="tracking-wider text-xs mt-1.5 text-foreground/40">
            {lang.data.app.profile.my_uri}:{" "}
            <Link
              href={`https://tip-to.me/@${userInfo?.profile?.uri}`}
              className="text-blue-500"
              target="_blank"
            >
              tip-to.me/@{userInfo?.profile?.uri}
              <ArrowUpRightIcon
                className="inline ml-px"
                weight="bold"
                size={12}
              />
            </Link>
          </span>
          {isUriCooldown && (
            <span className="tracking-wider text-xs mt-1.5 text-foreground/40">
              {userInfo?.profile?.uriCooldownEnd &&
                lang.data.app.profile.get_started.reset_in.replace(
                  "{time}",
                  new Date(
                    userInfo?.profile?.uriCooldownEnd,
                  ).toLocaleDateString(lang.key, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                )}
            </span>
          )}
        </div>
        <div>
          <Link
            href={`/app/${activeOrg?.slug || activeOrg?.id}/${activeStreamer?.name || activeStreamer?.id}/profile/renew`}
            className={cn(isUriCooldown && "pointer-events-none")}
          >
            <Button
              variant="default"
              className="rounded-2xl p-2.5 text-[10px] font-semibold mt-4"
              disabled={isUriCooldown}
            >
              {lang.data.app.profile.get_started.change}
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full flex items-center bg-foreground/5 mt-3 px-3 py-1.5 rounded-2xl gap-1.5 z-10 relative">
        <strong className="text-xs text-foreground/40">
          {lang.data.app.profile.manage.title}
        </strong>
        {userInfo?.profile?.publishedAt ? (
          <Button
            variant="destructive"
            className="rounded-xl p-2.5 text-[10px] font-semibold h-8"
            onClick={handleUnpublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner className="mr-1" />
            ) : (
              lang.data.app.profile.manage.unpublish
            )}
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="rounded-xl p-2.5 text-[10px] font-semibold bg-emerald-400/10 hover:bg-emerald-400/15 text-emerald-400 h-8"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner className="mr-1" />
            ) : (
              lang.data.app.profile.manage.publish
            )}
          </Button>
        )}
      </div>
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
              <AccordionPanel
                keepRendered={true}
                data-default-transition="false"
                className="p-0"
              >
                <div className="flex-1 min-h-1 w-full bg-muted rounded-2xl py-2 px-1.75 gap-1.5 flex flex-col">
                  {[
                    {
                      id: "1",
                      type: 1,
                      icon: <UserIcon className="size-4" />,
                      title: lang.data.app.account.display_name,
                      placeholder: `${userInfo?.profile?.displayName}`,
                      pattern: allowed_chars,
                      value: displayName,
                      onChange: setDisplayName,
                    },
                    {
                      id: "2",
                      type: 2,
                      icon: <UserFocusIcon className="size-4" />,
                      title: lang.data.app.account.bio,
                      placeholder: `${userInfo?.profile?.bio || ""}`,
                      pattern: allowed_chars,
                      value: bio,
                      onChange: setBio,
                    },
                  ].map((l, i) => (
                    <div
                      className="flex flex-col rounded-lg p-1.5 gap-1.5"
                      key={i}
                    >
                      <div className="flex gap-1.5 opacity-40 items-center">
                        {l.icon}
                        <h1 className="font-semibold text-xs">{l.title}</h1>
                      </div>
                      <div className="flex gap-1 w-full items-center">
                        {l.type === 1 ? (
                          <Input
                            type="text"
                            placeholder={l.placeholder}
                            pattern={l.pattern.source}
                            value={l.value}
                            onChange={(e) => l.onChange(e.target.value)}
                            className="w-full"
                            classNames={{
                              base: "rounded-md bg-background/30! p-1",
                            }}
                            fontStyle={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "10px",
                            }}
                          />
                        ) : l.type === 2 ? (
                          <textarea
                            placeholder={l.placeholder}
                            value={l.value}
                            onChange={(e) => l.onChange(e.target.value)}
                            className="w-full rounded-md bg-background/30 p-1.5 border-2 border-transparent hover:border-foreground/10 min-h-8 outline-0 focus-visible:border-foreground/10 focus-visible:bg-foreground/5 font-sans text-[10px]"
                          />
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center p-2.5 rounded-t-4xl w-full gap-1.5">
                  <Button
                    variant={"secondary"}
                    className={"rounded-xl border-2 p-4.5 w-full"}
                    onClick={handleSaveBasicInfo}
                    disabled={isSavingBasic}
                  >
                    {isSavingBasic ? (
                      <Spinner className="mr-2" />
                    ) : (
                      lang.data.app.profile.socials.save
                    )}
                  </Button>
                </div>
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
                    {
                      id: "socialTwitch",
                      icon: <TwitchTv className="size-4" />,
                      title: lang.data.app.profile.socials.twitch,
                      placeholder: lang.data.app.profile.socials.placeholder,
                      pattern: allowed_chars,
                    },
                    {
                      id: "socialYoutube",
                      icon: <Youtube className="size-4" />,
                      title: lang.data.app.profile.socials.youtube,
                      placeholder: lang.data.app.profile.socials.placeholder,
                      pattern: allowed_chars,
                    },
                    {
                      id: "socialTwitter",
                      icon: <Twitter className="size-4" />,
                      title: lang.data.app.profile.socials.twitter,
                      placeholder: lang.data.app.profile.socials.placeholder,
                      pattern: allowed_chars,
                    },
                    {
                      id: "socialFacebook",
                      icon: <Facebook className="size-4" />,
                      title: lang.data.app.profile.socials.facebook,
                      placeholder: lang.data.app.profile.socials.placeholder,
                      pattern: allowed_chars,
                    },
                    {
                      id: "socialReddit",
                      icon: <Reddit className="size-4" />,
                      title: lang.data.app.profile.socials.reddit,
                      placeholder: lang.data.app.profile.socials.placeholder,
                      pattern: allowed_chars,
                    },
                    {
                      id: "socialDiscord",
                      icon: <Discord className="size-4" />,
                      title: lang.data.app.profile.socials.discord,
                      placeholder:
                        lang.data.app.profile.socials.discord_placeholder,
                      pattern: /^[a-zA-Z0-9]+$/,
                    },
                  ].map((l, i) => (
                    <div
                      className="flex flex-col rounded-lg p-1.5 gap-1.5"
                      key={i}
                    >
                      <div className="flex gap-1.5 opacity-40 items-center">
                        {l.icon}
                        <h1 className="font-semibold text-xs">{l.title}</h1>
                      </div>
                      <Input
                        type="text"
                        placeholder={l.placeholder}
                        pattern={l.pattern.source}
                        value={socials[l.id as keyof typeof socials]}
                        onChange={(e) =>
                          handleSocialChange(
                            l.id as keyof typeof socials,
                            e.target.value,
                            l.pattern,
                          )
                        }
                        maxLength={32}
                        classNames={{
                          base: "rounded-md bg-background/30! p-1",
                        }}
                        fontStyle={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "10px",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center p-2.5 rounded-t-4xl w-full gap-1.5">
                  <Button
                    variant={"secondary"}
                    className={"rounded-xl border-2 p-4.5 w-full"}
                    onClick={handleSaveSocials}
                    disabled={isSavingSocials}
                  >
                    {isSavingSocials ? (
                      <Spinner className="mr-2" />
                    ) : (
                      lang.data.app.profile.socials.save
                    )}
                  </Button>
                </div>
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
                        <span className="text-[10px] font-semibold opacity-60">
                          Color Hex:
                        </span>
                        <span className="text-xs font-mono uppercase font-bold tracking-wider">
                          {accentColor}
                        </span>
                      </div>
                      <ColorPicker
                        color={accentColor}
                        onChange={setAccentColor}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-2.5 rounded-t-4xl w-full gap-1.5">
                  <Button
                    variant={"secondary"}
                    className={
                      "rounded-xl border-2 p-4.5 w-full flex items-center justify-center gap-1.5"
                    }
                    onClick={handleSaveAccentColor}
                    disabled={isSavingColor}
                  >
                    {isSavingColor ? (
                      <Spinner className="mr-2" />
                    ) : (
                      lang.data.app.profile.socials.save
                    )}
                  </Button>
                </div>
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
                      className="rounded-xl p-2.5 text-xs font-semibold justify-start gap-2 bg-background/50 hover:bg-background/80"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <CameraIcon size={16} weight="fill" />
                      {lang.data.app.account.change_avatar}
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-xl p-2.5 text-xs font-semibold justify-start gap-2 bg-background/50 hover:bg-background/80"
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
        </div>
        <div className="w-full max-md:-order-1 flex flex-col overflow-hidden min-h-0 bg-foreground/5 rounded-4xl flex-1 border-2 border-dashed border-foreground/10 z-10 relative">
          <ProfilePreview
            onAvatarClick={() => avatarInputRef.current?.click()}
            onBannerClick={() => bannerInputRef.current?.click()}
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
    </>
  );
}

export default Page;
