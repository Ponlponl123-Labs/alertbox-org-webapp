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
import { allowed_chars } from "@/consts/regex";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { cn } from "@/lib/utils";
import {
  ArrowUpRightIcon,
  CoinVerticalIcon,
  FloppyDiskIcon,
  PaletteIcon,
  PersonIcon,
  SparkleIcon,
  UserFocusIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { ColorPicker } from "@/components/ui/color-picker";
import { hexColorToNumber, numberToHexColor } from "@/lib/color";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useState } from "react";
import { Input } from "react-smooth-input";
import { useStore } from "zustand";
import { toast } from "sonner";
import ProfilePreview from "./profile-preview";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, patchUserInfo } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSocials, setIsSavingSocials] = useState(false);

  const [displayName, setDisplayName] = useState(
    userInfo?.profile?.displayName || "",
  );
  const [bio, setBio] = useState(userInfo?.profile?.bio || "");
  const [isSavingBasic, setIsSavingBasic] = useState(false);

  const [isSavingColor, setIsSavingColor] = useState(false);
  const [accentColor, setAccentColor] = useState(
    userInfo?.profile?.accentColor
      ? numberToHexColor(userInfo.profile.accentColor)
      : "#6366f1",
  );

  const [socials, setSocials] = useState({
    socialTwitch: userInfo?.profile?.twitch || "",
    socialYoutube: userInfo?.profile?.youtube || "",
    socialTwitter: userInfo?.profile?.twitter || "",
    socialFacebook: userInfo?.profile?.facebook || "",
    socialReddit: userInfo?.profile?.reddit || "",
    socialDiscord: userInfo?.profile?.discord || "",
  });

  const [prevUserInfo, setPrevUserInfo] = useState(userInfo);

  if (userInfo !== prevUserInfo) {
    setPrevUserInfo(userInfo);
    setSocials({
      socialTwitch: userInfo?.profile?.twitch || "",
      socialYoutube: userInfo?.profile?.youtube || "",
      socialTwitter: userInfo?.profile?.twitter || "",
      socialFacebook: userInfo?.profile?.facebook || "",
      socialReddit: userInfo?.profile?.reddit || "",
      socialDiscord: userInfo?.profile?.discord || "",
    });
    if (userInfo?.profile) {
      setDisplayName(userInfo.profile.displayName || "");
      setBio(userInfo.profile.bio || "");
      setAccentColor(
        userInfo.profile.accentColor
          ? numberToHexColor(userInfo.profile.accentColor)
          : "#6366f1",
      );
    }
  }

  const handleSocialChange = (
    key: keyof typeof socials,
    value: string,
    pattern: RegExp,
  ) => {
    if (value !== "" && !pattern.test(value)) return;
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSocials = async () => {
    setIsSavingSocials(true);
    try {
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + atob(authCookie as string),
        },
        body: JSON.stringify(socials),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
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
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + atob(authCookie as string),
        },
        body: JSON.stringify({ accentColor }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
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
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + atob(authCookie as string),
        },
        body: JSON.stringify({
          displayname: displayName,
          bio: bio,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
        toast.success(lang.data.app.account.success);
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

  const isUriCooldown =
    (userInfo?.profile?.uriCooldownEnd &&
      new Date(userInfo?.profile?.uriCooldownEnd).getTime() >
        new Date().getTime()) ||
    false;

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch("/api/v1/me/profile", {
        method: "POST",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
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
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch("/api/v1/me/profile", {
        method: "DELETE",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
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
            href={"/app/profile/renew"}
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
      <div className="flex gap-1.5 min-h-0 flex-1 mt-3">
        <div className="w-64 flex flex-col h-max z-10 relative gap-1.5">
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
                <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-0.25">
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
                <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-0.25">
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
                <h1 className="font-semibold text-sm text-foreground/40 group-data-open:text-foreground m-0 translate-y-0.25">
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
        </div>
        <div className="w-full flex flex-col overflow-hidden min-h-0 bg-foreground/5 rounded-4xl flex-1 border-2 border-dashed border-foreground/10 z-10 relative">
          <ProfilePreview
            liveData={{
              displayName,
              bio,
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
    </>
  );
}

export default Page;
