"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import {
  CameraIcon,
  FloppyDiskIcon,
  PencilSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { useRef, useState } from "react";
import { Input } from "react-smooth-input";
import { toast } from "sonner";
import { useStore } from "zustand";
import { ImageCropperModal } from "@/components/image-cropper-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "motion/react";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, patchUserInfo } = useUserContext();

  const [bio, setBio] = useState(userInfo?.profile?.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [prevUserInfo, setPrevUserInfo] = useState(userInfo);
  if (userInfo !== prevUserInfo) {
    setPrevUserInfo(userInfo);
    if (userInfo) {
      setBio(userInfo.profile?.bio || "");
    }
  }

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const formData = new FormData();
      formData.append(cropType, croppedImage, `${cropType}.webp`);

      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
        toast.success(lang.data.app.account.success);
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch (err) {
      console.error(err);
      toast.error(lang.data.app.account.fatal);
    }
  };

  const handleSaveBasicInfo = async () => {
    setIsSubmitting(true);
    try {
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const formData = new FormData();
      formData.append("bio", bio);

      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
        toast.success(lang.data.app.account.success);
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

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const formData = new FormData();
      formData.append("displayname", newName.trim());

      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
        toast.success(lang.data.app.account.success);
        setIsNameDialogOpen(false);
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
    <>
      <div
        className="group relative w-full rounded-4xl bg-foreground/5 overflow-hidden border-3 border-transparent hover:border-foreground/10 transition-all select-none"
        onClick={() => bannerInputRef.current?.click()}
      >
        {userInfo?.profile?.banner ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Image
              src={userInfo?.profile?.banner}
              alt="Banner"
              className="w-full h-max object-cover pointer-events-none transition-transform group-hover:scale-105 group-active:scale-103 group-hover:blur-xs"
              width={2400}
              height={800}
            />
          </motion.div>
        ) : (
          <div className="inset-0 min-h-64" />
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="flex flex-col items-center gap-2">
            <CameraIcon size={32} weight="fill" className="text-white" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              {lang.data.app.account.change_banner}
            </span>
          </div>
        </div>
        <input
          type="file"
          ref={bannerInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "banner")}
        />
      </div>

      <div className="flex items-start gap-4 -mt-12 ml-4">
        <div
          className="group relative size-24 rounded-full overflow-hidden border-4 border-background active:scale-98 select-none"
          onClick={() => avatarInputRef.current?.click()}
        >
          <Avatar className="size-full rounded-none group-hover:blur-xs">
            {userInfo?.profile?.avatar && (
              <AvatarImage src={userInfo?.profile?.avatar} />
            )}
            <AvatarFallback className="text-2xl">
              {getFallbackInitial(userInfo?.profile?.name || "?")}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <div className="flex flex-col items-center gap-1">
              <CameraIcon size={24} weight="fill" className="text-white" />
              <span className="text-[8px] text-white font-bold uppercase tracking-tighter">
                {lang.data.app.account.change_avatar}
              </span>
            </div>
          </div>
          <input
            type="file"
            ref={avatarInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "avatar")}
          />
        </div>

        <div className="mt-14">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-3xl">
              {userInfo?.profile?.displayName}
            </h1>
            <Button
              size={"icon"}
              onClick={() => {
                setNewName(userInfo?.profile?.displayName || "");
                setIsNameDialogOpen(true);
              }}
              className="p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/60 transition-colors"
              title={lang.data.app.account.edit_display_name}
            >
              <PencilSimpleIcon weight="fill" className="size-3.5" />
            </Button>
          </div>
          <span className="text-foreground/40 text-sm">
            @{userInfo?.profile?.name}
          </span>
        </div>
      </div>

      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-4">
        <div className="w-full bg-card p-4 rounded-2xl group">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.25">
              <SparkleIcon
                size={22}
                className="text-foreground/60"
                weight="fill"
              />
              <h1 className="text-lg font-semibold">
                {lang.data.app.account.bio}
              </h1>
            </div>
            <p className="text-foreground/40 text-xs">
              {lang.data.app.account.bio_description}
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={lang.data.app.account.bio_placeholder}
              maxLength={1000}
              className="w-full min-h-24 p-2.5 rounded-lg my-1.5 bg-foreground/10 hover:bg-foreground/5 focus:bg-foreground/5 hover:border-foreground/5 focus:border-foreground/5 border-2 border-transparent outline-none text-sm resize-none transition-colors"
            />
            <div className="ml-auto flex flex-wrap items-center">
              <Button
                onClick={handleSaveBasicInfo}
                disabled={isSubmitting}
                className="p-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Spinner />
                ) : (
                  <>
                    <FloppyDiskIcon weight="fill" size={20} />
                    {lang.data.app.account.save}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

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

      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent
          className="max-w-sm rounded-4xl p-6"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="bg-blue-500/10 p-2 size-12 rounded-xl text-primary flex items-center justify-center mb-2">
              <PencilSimpleIcon
                weight="fill"
                className="text-blue-500"
                size={20}
              />
            </div>
            <DialogTitle className="text-xl font-bold">
              {lang.data.app.account.display_name_dialog_title}
            </DialogTitle>
            <DialogDescription className="text-foreground/40 text-sm">
              {lang.data.app.account.display_name_dialog_description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
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
          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsNameDialogOpen(false)}
              className="rounded-xl p-4"
            >
              {lang.data.app.account.crop_cancel}
            </Button>
            <Button
              onClick={handleUpdateName}
              disabled={isSubmitting || !newName.trim()}
              className="rounded-xl p-4"
            >
              {isSubmitting ? <Spinner /> : lang.data.app.account.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Page;
