"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { cn, getFallbackInitial } from "@/lib/utils";
import {
  CameraIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Input } from "react-smooth-input";
import { toast } from "@/components/custom-ui/toast";
import { useStore } from "zustand";
import { getApiUrl } from "@/lib/api";
import { ImageCropperModal } from "@/components/features/modals/image-cropper-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion, useIsomorphicLayoutEffect, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { SmileyIcon } from "@phosphor-icons/react/dist/ssr";
import { Discord, Github, Google, Streamlabs } from "@thesvg/react";
import { Badge } from "@/components/ui/badge";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, patchUserInfo, authFetch } = useUserContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const bannerUrl = userInfo?.avatar;
  const [loadedBannerUrl, setLoadedBannerUrl] = useState<string | null>(null);
  const isBannerLoaded = !bannerUrl || loadedBannerUrl === bannerUrl;
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

  const { scrollY } = useScroll({
    container: hasScrollContainer ? scrollContainerRef : undefined,
  });
  const bannerY = useTransform(scrollY, [0, 300], [0, 95]);
  const bannerScale = useTransform(scrollY, [-120, 0, 300], [1.12, 1, 1.05]);
  const bannerOpacity = useTransform(scrollY, [0, 260], [1, 0.35]);

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => revokeObjectUrl();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error(lang.data.common.image_type_error);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(lang.data.common.image_size_error);
      return;
    }
    revokeObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageToCrop(url);
    setCropperOpen(true);
  };

  const onCropComplete = async (croppedImage: Blob) => {
    try {
      const formData = new FormData();
      formData.append("avatar", croppedImage, "avatar.webp");

      const res = await authFetch(getApiUrl("/api/v1/me"), {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
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
      console.error(err);
      toast.error(lang.data.app.account.fatal);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("displayName", newName.trim());

      const res = await authFetch(getApiUrl("/api/v1/me"), {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
        toast.success(lang.data.app.account.success);
        setIsNameDialogOpen(false);
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
      console.error(err);
      toast.error(lang.data.app.account.fatal);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-1 flex-col gap-6 z-10"
    >
      {bannerUrl && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bannerUrl}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{
              opacity: !bannerUrl || isBannerLoaded ? 1 : 0,
              filter: !bannerUrl || isBannerLoaded ? "blur(0px)" : "blur(6px)",
            }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full pointer-events-none top-0 left-0 z-0 mask-b-from-0% overflow-hidden -mb-96"
          >
            <motion.div
              style={{ y: bannerY, scale: bannerScale, opacity: bannerOpacity }}
              className="w-full origin-top h-80 sm:h-96 lg:h-120"
            >
              <motion.div
                initial={{ scale: 1.14 }}
                animate={{
                  scale: !bannerUrl || isBannerLoaded ? 1 : 1.14,
                }}
                exit={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 95, damping: 22, mass: 1.15 }}
                className="w-full h-full will-change-transform"
              >
                {bannerUrl && (
                  <Image
                    src={bannerUrl}
                    alt={lang.data.common.banner}
                    className="w-full h-full object-cover select-none blur-3xl scale-150"
                    width={720}
                    height={288}
                    priority
                    unoptimized
                    onLoad={() => setLoadedBannerUrl(bannerUrl)}
                  />
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      <div className="w-full max-w-384 mx-auto px-12 pt-12 flex flex-col gap-6 z-10 max-sm:mt-6">
        <div>
          <p className="text-sm text-muted-foreground font-sans mt-0.5 max-sm:hidden">
            {lang.data.app.account.subtitle}
          </p>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground my-3 max-sm:text-center">
            {lang.data.app.account.title}
          </h1>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center gap-6">
          <div
            className="group relative size-36 md:size-42 lg:size-48 rounded-full overflow-hidden active:scale-98 transition-interactive select-none shrink-0"
            onClick={() => avatarInputRef.current?.click()}
          >
            <Avatar className="size-full rounded-none group-hover:blur-xs transition-all">
              {userInfo?.avatar && (
                <AvatarImage
                  src={userInfo.avatar}
                  alt={userInfo?.displayName || userInfo?.name || lang.data.common.user}
                />
              )}
              <AvatarFallback className="text-3xl font-bold">
                {getFallbackInitial(userInfo?.displayName || userInfo?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <div className="flex flex-col items-center gap-1">
                <CameraIcon size={24} weight="fill" className="text-white" />
                <span className="text-[9px] text-white font-bold uppercase tracking-wider">
                  {lang.data.app.account.change_avatar}
                </span>
              </div>
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-4xl truncate">
                {userInfo?.displayName || userInfo?.name || lang.data.common.user}
              </h2>
              <Button
                size={"icon"}
                variant="ghost"
                onClick={() => {
                  setNewName(userInfo?.displayName || userInfo?.name || "");
                  setIsNameDialogOpen(true);
                }}
                className="size-8 rounded-lg transition-interactive"
                title={lang.data.app.account.edit_display_name}
              >
                <PencilSimpleIcon weight="fill" className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-foreground/50 text-sm font-medium">
              {userInfo?.name && (
                <span className="text-sm text-muted-foreground">
                  @{userInfo.name}
                </span>
              )}
              {userInfo?.name && userInfo?.email && <span>•</span>}
              {userInfo?.email && (
                <span className="text-sm text-muted-foreground">{userInfo.email}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mt-2 select-none">
              <SmileyIcon className="size-4" weight="bold" />
              <span className="text-xs font-medium">
                {lang.data.app.security.registered}{" "}
                {
                  userInfo?.createdAt
                    ? new Date(userInfo.createdAt).toLocaleDateString(lang.key, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                    : lang.data.app.security.device.unknown
                }
              </span>
            </div>
          </div>
        </div>
        <div className="mt-16 sm:mt-26 p-3 bg-card rounded-2xl max-w-2xl w-full mx-auto flex flex-col gap-1">
          <h2 className="text-lg font-medium p-2">Connected Account</h2>
          <div className="flex flex-col gap-1">
            {
              [
                {
                  name: "Discord",
                  icon: <Discord className="*:fill-foreground" />,
                  isConnected: true,
                  isOrigin: true,
                  isSoon: false,
                },
                {
                  name: "Google",
                  icon: <Google className="*:fill-foreground" />,
                  isConnected: false,
                  isOrigin: false,
                  isSoon: true,
                },
                {
                  name: "Streamlabs",
                  icon: <Streamlabs className="*:fill-foreground" />,
                  isConnected: false,
                  isOrigin: false,
                  isSoon: true,
                },
                {
                  name: "Github",
                  icon: <Github className="*:fill-foreground" />,
                  isConnected: false,
                  isOrigin: false,
                  isSoon: true,
                }
              ].map((provider, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-1.5 h-12 hover:bg-muted/30 apply-smooth-transition rounded-lg",
                  provider.isSoon && "opacity-30"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="size-5 flex items-center justify-center ml-3">
                      {provider.icon}
                    </div>
                    <span className="text-sm font-medium select-none">{provider.name}</span>
                    <div className="flex items-center gap-1">
                      {
                        provider.isConnected && <Badge className="rounded-md bg-emerald-600 text-white select-none h-max">Connected</Badge>
                      }
                      {
                        provider.isOrigin && <Badge className="rounded-md select-none border-2 h-max" variant={"outline"}>Registered with</Badge>
                      }
                    </div>
                  </div>
                  {
                    provider.isSoon ? <Badge className="rounded-md p-4 select-none" variant={"secondary"}>Soon</Badge>
                      : provider.isConnected ? <></>
                        : <Button
                          size={"sm"}
                          variant="outline"
                          onClick={() => { }}
                          className="rounded-md h-max p-2 border-2 transition-interactive"
                          disabled={provider.isConnected || provider.isSoon}
                        >
                          Connect account
                        </Button>
                  }
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <ImageCropperModal
        open={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setImageToCrop(null);
          revokeObjectUrl();
        }}
        image={imageToCrop}
        onCropComplete={onCropComplete}
        cropShape="round"
        aspect={1}
        title={lang.data.app.account.crop_avatar}
        applyLabel={lang.data.app.account.crop_apply}
        cancelLabel={lang.data.app.account.crop_cancel}
        zoomLabel={lang.data.app.account.zoom}
        className="sm:max-w-xl"
      />

      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent
          className="max-w-xs sm:max-w-sm"
          showCloseButton={false}
        >
          <DialogHeader className="items-center text-center gap-1.5">
            <div className="mb-1 inline-flex size-12 items-center justify-center text-primary">
              <PencilSimpleIcon
                weight="bold"
                className="size-9"
              />
            </div>
            <DialogTitle>
              {lang.data.app.account.display_name_dialog_title}
            </DialogTitle>
            <DialogDescription className="text-balance">
              {lang.data.app.account.display_name_dialog_description}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={lang.data.app.account.display_name_placeholder}
              maxLength={64}
              fontStyle={{
                fontFamily: "var(--font-baijamjuree)",
                fontSize: "14px",
              }}
              classNames={{
                base: "h-12 rounded-xl",
                container: "w-full",
              }}
            />
          </div>
          <DialogFooter className="mt-2 grid! grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsNameDialogOpen(false)}
              className="rounded-xl p-3 h-max w-full"
            >
              {lang.data.app.account.crop_cancel}
            </Button>
            <Button
              onClick={handleUpdateName}
              disabled={isSubmitting || !newName.trim()}
              className="rounded-xl p-3 h-max w-full"
            >
              {isSubmitting ? <Spinner className="size-4" /> : lang.data.app.account.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default Page;
