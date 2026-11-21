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
  PaletteIcon,
  SparkleIcon,
  EyeIcon,
  WarningOctagonIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { ColorPicker } from "@/components/ui/color-picker";
import { hexColorToNumber, numberToHexColor } from "@/lib/color";
import Link from "next/link";
import { Input } from "react-smooth-input";
import { useStore } from "zustand";
import { toast } from "@/components/custom-ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { hasPermission, canAccessStreamer, isOrgOwnerOrAdmin } from "@/lib/rbac";
import { OrgPerm, StreamerPerm } from "@/consts/permission";
import { AnimatePresence, motion } from "motion/react";
import { PencilEdit02 } from "@/components/animate-ui/icons/hugeicons/pencil-edit-02";
import { AnimateIcon } from "@animate-ui/react/icons";
import { View } from "@/components/animate-ui/icons/hugeicons/view";
import { EyeOff } from "@/components/animate-ui/icons/hugeicons/eye-off";
import PublicProfileClient from "@/app/[username]/PublicProfileClient";
import HoldButton from "@/components/HoldButton";
import { Shrink } from "@/components/animate-ui/icons/hugeicons/shrink";
import { Expand } from "@/components/animate-ui/icons/hugeicons/expand";

const noopSubscribe = () => () => {};
const getServerCooldown = () => false;

function useUriCooldown(cooldownDateStr?: string | null): boolean {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => Boolean(cooldownDateStr && new Date(cooldownDateStr).getTime() > Date.now()),
    getServerCooldown,
  );
}

function Page() {
  const router = useRouter();
  const lang = useStore(coreStore, (state) => state.lang);
  const routeParams = useParams();
  const { patchStreamer, authFetch, activeOrg, activeStreamer, removeStreamer } = useUserContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [isSavingColor, setIsSavingColor] = useState(false);

  const targetOrg = activeOrg?.slug || activeOrg?.id || (routeParams?.org as string);
  const currentStreamer = activeStreamer;

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

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmHandle, setConfirmHandle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const prevStreamerIdRef = useRef(currentStreamer?.id);
  useEffect(() => {
    if (currentStreamer && currentStreamer.id !== prevStreamerIdRef.current) {
      prevStreamerIdRef.current = currentStreamer.id;
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

  const isOwnerOrAdmin = isOrgOwnerOrAdmin(activeOrg);
  const canEditProfile = canAccessStreamer(activeOrg, currentStreamer, StreamerPerm.STREAMER_MANAGE, OrgPerm.STREAMER_MANAGE);
  const canDeleteStreamer = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.STREAMER_DELETE);

  const encodedOrg = targetOrg ? encodeURIComponent(targetOrg) : "";
  const encodedStreamerName = currentStreamer?.name ? encodeURIComponent(currentStreamer.name) : "";

  const streamerPatchEndpoint =
    encodedOrg && encodedStreamerName
      ? getApiUrl(`/api/v1/org/${encodedOrg}/streamers/${encodedStreamerName}`)
      : "";

  const streamerPublishEndpoint =
    encodedOrg && encodedStreamerName
      ? getApiUrl(`/api/v1/org/${encodedOrg}/streamers/${encodedStreamerName}/publish`)
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
    if (!canEditProfile || !streamerPatchEndpoint || !currentStreamer || isSavingSocials) return;
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
    if (!canEditProfile || !streamerPatchEndpoint || !currentStreamer || isSavingColor) return;
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

  const isUriCooldown = useUriCooldown(currentStreamer?.uriCooldownEnd);

  const handlePublish = async () => {
    if (!canEditProfile || !streamerPublishEndpoint || !currentStreamer || isSubmitting) return;
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
    if (!canEditProfile || !streamerPublishEndpoint || !currentStreamer || isSubmitting) return;
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

  const handleDeleteStreamer = async () => {
    if (!canDeleteStreamer || !encodedOrg || !currentStreamer || isDeleting || confirmHandle !== currentStreamer.name) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${encodedOrg}/streamers/${encodedStreamerName}`),
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10 min-h-0 flex-1"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-foreground my-3">
              My Profile
            </h1>
            <div className="flex justify-between w-full items-center">
              <div className="flex flex-col">
                <span className="tracking-wider text-sm text-foreground/40">
                  {lang.data.app.profile.my_uri}:{" "}
                  {currentStreamer?.uri ? (
                    <Link
                      href={`/@${currentStreamer.uri}`}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      tip-to.me/@{currentStreamer.uri}
                      <ArrowUpRightIcon className="inline ml-px" weight="bold" size={12} />
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/60 italic">No public handle</span>
                  )}
                </span>
                {isUriCooldown && currentStreamer?.uriCooldownEnd && (
                  <span className="tracking-wider text-sm text-foreground/40">
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
                <div className="flex items-center gap-2">
                  {currentStreamer?.publishedAt ? (
                    <AnimateIcon animateOnHover>
                      <Button
                        variant="destructive"
                        className="rounded-2xl px-3 py-2.5 text-[11px] font-semibold h-max"
                        onClick={handleUnpublish}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Spinner className="mr-1" /> : <>
                          <EyeOff />
                          {lang.data.app.profile.manage.unpublish}
                        </>}
                      </Button>
                    </AnimateIcon>
                  ) : (
                    <AnimateIcon animateOnHover>
                      <Button
                        variant="secondary"
                        className="rounded-2xl px-3 py-2.5 text-[11px] font-semibold h-max bg-emerald-400 hover:bg-emerald-400/60 text-black"
                        onClick={handlePublish}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Spinner className="mr-1" /> : <>
                          <View />
                          {lang.data.app.profile.manage.publish}
                        </>}
                      </Button>
                    </AnimateIcon>
                  )}
                  <Link
                    href={`/app/${activeOrg?.slug || activeOrg?.id}/${currentStreamer?.name || "channel"}/profile/renew`}
                    className={cn(isUriCooldown && "pointer-events-none")}
                  >
                    <AnimateIcon animateOnHover>
                      <Button
                        variant="default"
                        className="rounded-2xl px-3 py-2.5 text-[11px] font-semibold h-max"
                        disabled={isUriCooldown}
                      >
                        <PencilEdit02 />
                        {lang.data.app.profile.get_started.change}
                      </Button>
                    </AnimateIcon>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {!canEditProfile && (
          <div className="w-full flex items-center select-none gap-3 p-3 rounded-2xl bg-muted/40 text-sm font-medium text-muted-foreground z-10 relative">
            <EyeIcon size={20} weight="bold" className="shrink-0 text-foreground/40" />
            <span>You have read-only access to this channel profile. Profile modifications require editor permissions.</span>
          </div>
        )}

        <div className="flex max-md:flex-col gap-1.5 min-h-0 flex-1">
          <div className={cn("md:w-64 flex flex-col h-max z-10 relative gap-1.5", isExpanded && "max-h-0 overflow-hidden")}>
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
              <AccordionItem defaultOpen>
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
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isExpanded ? "expanded" : "collapsed"}
              layoutId="live-preview"
              initial={{
                position: 'relative',
                top: 0,
                left: 0,
                width: 'auto',
                height: 'auto',
                zIndex: 10
              }}
              animate={isExpanded && {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10999999
              }}
              className={cn(
                "w-full max-md:-order-1 flex flex-col overflow-hidden h-max bg-foreground/5 rounded-4xl flex-1 border-2 border-dashed border-foreground/10 z-10999999 relative",
                isExpanded && "bg-background rounded-none border-0"
              )}>
              <AnimateIcon animateOnHover>
                <Button size={"icon"} className={"absolute right-2 top-2 z-500 rounded-lg"} variant={"secondary"} onClick={() => {
                  setIsExpanded(!isExpanded)
                }}>
                  {
                    isExpanded ? <Shrink /> : <Expand />
                  }
                </Button>
              </AnimateIcon>
              <div className={cn("relative", !isExpanded && "zoom-75 scale-110")}>
                <PublicProfileClient username={currentStreamer?.uri || ""} initialData={activeStreamer} isMock={true} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {canDeleteStreamer && (
          <div className="mt-24 flex flex-col items-center text-center">
            <WarningOctagonIcon
              size={26}
              weight="fill"
              className="mb-2 text-destructive group-data-open:text-destructive"
            />
            <h1 className="font-semibold font-sans text-base text-destructive m-0">
              Channel Danger Zone
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Permanently delete this channel and disable donation pages.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmHandle("");
                setIsDeleteOpen(true);
              }}
              className="gap-1.5 text-xs rounded-xl h-max mt-3 p-2 font-semibold"
            >
              <TrashIcon size={13} weight="bold" />
              <span>Delete Channel</span>
            </Button>
          </div>
        )}
      </motion.div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="h-12 mr-auto text-destructive flex items-center justify-center mb-2">
              <WarningOctagonIcon size={32} weight="bold" />
            </div>
            <DialogTitle className="text-xl font-semibold text-destructive">
              Delete Channel Permanently?
            </DialogTitle>
            <DialogDescription className="text-xs font-sans text-muted-foreground mt-1 leading-relaxed">
              Are you sure you want to delete <strong>@{currentStreamer?.name}</strong>? Public donation links for this channel will cease to accept payments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <label className="text-xs font-semibold font-sans text-foreground">
              Type channel handle <code className="text-primary font-mono">{currentStreamer?.name}</code> to confirm:
            </label>
            <Input
              type="text"
              fontStyle={{
                fontFamily: "var(--font-sans)",
                fontWeight: "500",
                fontSize: "14px",
              }}
              value={confirmHandle}
              onChange={(e) => setConfirmHandle(e.target.value)}
              placeholder={currentStreamer?.name || "handle"}
              className="w-full"
              classNames={{ base: "h-10 rounded-xl mt-2" }}
            />
            <span className="text-xs text-destructive select-none font-sans">This action cannot be undone.</span>
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="text-xs rounded-xl h-max p-3 border-0"
            >
              Cancel
            </Button>
            <HoldButton
              doneLabel="Deleted"
              backgroundColor="var(--muted)"
              fillColor="#f43f5e"
              textColor="var(--muted-foreground)"
              fillTextColor="#ffffff"
              size="sm"
              radius={14}
              fillDirection="right"
              className="h-max p-3.25 text-xs"
              holdTime={2000}
              releaseTime={200}
              pressScale={1}
              wave
              waveAmplitude={6}
              glow={false}
              resetAfter={1200}
              disabled={isDeleting || confirmHandle !== currentStreamer?.name}
              onHold={handleDeleteStreamer}
            >
              {isDeleting && <Spinner className="size-3.5" />}
              Hold to delete
            </HoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Page;
